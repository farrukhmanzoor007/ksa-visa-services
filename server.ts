
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });import express from "express";
import Stripe from "stripe";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { createServer as createViteServer } from "vite";
import { connectDB, dbAdapter, IApplication } from "./src/db/dbAdapter";

// --- SECURE LAZY INITIALIZED KEY CONFIGURATIONS ---
function getJwtSecret(): string {
  const sec = process.env.JWT_SECRET;
  if (!sec) {
    throw new Error("Infrastructure Config Missing: JWT_SECRET environment variable is not defined in settings.");
  }
  return sec;
}

function getStripeWebhookSecret(): string {
  const sec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sec) {
    throw new Error("Infrastructure Config Missing: STRIPE_WEBHOOK_SECRET environment variable is not defined in settings.");
  }
  return sec;
}

let stripeInstance: Stripe | null = null;
function getStripe(): Stripe {
  const sec = process.env.STRIPE_SECRET_KEY;
  if (!sec) {
    throw new Error("Infrastructure Config Missing: STRIPE_SECRET_KEY environment variable is not defined in settings.");
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(sec);
  }
  return stripeInstance;
}

const PORT = 3000;

// --- CLOUDINARY CONFIGURATION (APP STARTUP OPTIMIZATION) ---
const cloudinaryUrl = process.env.CLOUDINARY_URL;
if (!cloudinaryUrl) {
  console.error("[CRITICAL SHUTDOWN] Configuration failure: CLOUDINARY_URL is missing. Production systems must shut down immediately.");
  process.exit(1);
}
cloudinary.config({ cloudinary_url: cloudinaryUrl });
console.log("[Cloudinary Hub] Configuration loaded successfully on app startup.");

// --- CLOUDINARY CLOUD FILES UPLOADER ---
async function saveUploadedFileToCloud(base64Data: string): Promise<string> {
  if (!base64Data) return "";
  
  if (base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
    return base64Data;
  }

  const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new Error("Invalid file content payload format: Must be standard Base64 Data URI.");
  }

  const mimeType = matches[1];
  const allowedMimes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
  if (!allowedMimes.includes(mimeType)) {
    throw new Error("Invalid file format. Only JPEG, JPG, PNG, and PDF payloads are acceptable.");
  }

  const sizeBuffer = Buffer.from(matches[2], "base64");
  if (sizeBuffer.length > 5 * 1024 * 1024) {
    throw new Error("File size exceeds strict 5MB SaaS threshold limits.");
  }

  if (!process.env.CLOUDINARY_URL) {
    throw new Error("Infrastructure Config Missing: CLOUDINARY_URL environment variable is not defined in settings.");
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64Data, {
      folder: "ksa_visa_uploads",
      resource_type: "auto"
    });
    return uploadResponse.secure_url;
  } catch (error: any) {
    console.error("[Cloudinary] Upload exception:", error);
    throw new Error(`Cloud image hosting connection failed: ${error.message}`);
  }
}

// --- METADATA AND CAPTCHA SECURITY REGISTRIES ---
const captchaSessions = new Map<string, { answer: number; expiresAt: number }>();

// Periodic memory protection sweep
setInterval(() => {
  const now = Date.now();
  for (const [sid, item] of captchaSessions.entries()) {
    if (now > item.expiresAt) {
      captchaSessions.delete(sid);
    }
  }
}, 5 * 60 * 1000);

// --- ENTERPRISE OBSERVABILITY & FAILURE TRACKING ENGINE ---
function generateErrorId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let id = "ERR-";
  for (let i = 0; i < 8; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function handleExceptionTrace(res: any, error: any, userFriendlyMsg = "An internal SaaS verification pipeline anomaly occurred.") {
  const errorId = generateErrorId();
  console.error(`[CRITICAL ERROR ${errorId}] Full Diagnostic Trace:`, error);
  return res.status(500).json({
    error: userFriendlyMsg,
    errorId,
    timestamp: new Date()
  });
}

async function startServer() {
  const app = express();

  // Helmet secure headers setup with content security guidelines
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
      frameguard: process.env.NODE_ENV === "production" ? { action: "sameorigin" } : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  );

  // STRICT SECURE CORS HANDSHAKE: Strict whitelisting under production, no wildcard fallback
  app.use((req, res, next) => {
    // Exclude Stripe backend webhooks and status healthchecks from browser-centric CORS blocking
    if (req.path === "/api/webhook/stripe" || req.path === "/api/health") {
      return next();
    }

    const origin = req.headers.origin;
    const allowedOrigins = [
      "https://yourdomain.com",
      process.env.FRONTEND_URL,
      process.env.APP_URL
    ].filter(Boolean) as string[];

    const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;

    if (!isDev) {
      if (!origin) {
        console.warn(`[CORS Blocked] Request without origin header attempted access to production route: ${req.path}`);
        return res.status(403).send("CORS blocked");
      }
      if (!allowedOrigins.includes(origin)) {
        console.warn(`[CORS Blocked] Unauthorized origin attempted access: ${origin}`);
        return res.status(403).send("CORS blocked");
      }
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else {
      // Keep development sandbox flexible for AI Studio preview environment
      if (origin) {
        res.setHeader("Access-Control-Allow-Origin", origin);
      } else {
        res.setHeader("Access-Control-Allow-Origin", "*");
      }
    }

    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }
    next();
  });

  // SMART RATE LIMITING LOGIC SEGREGATION
  // 1. Strict rate limiter for admin login (max 10 requests per 15 minutes)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Security restriction: Excessive administrative login attempts. Please wait 15 minutes before retry." }
  });

  // 2. Stricter rate limiter for payment creations (max 20 checkouts per 15 minutes)
  const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Security restriction: Excessive transaction initializations. Please try again later." }
  });

  // 3. Relaxed rate limiter for public tracking APIs (max 350 requests per 15 minutes)
  const publicApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 350,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Security restriction: High traffic detected. Public rate limit exceeded." }
  });

  // 4. Default limiter for general api endpoints
  const generalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Security restriction: Excessive requests." }
  });

  // Establish strategic route attachment of rate limiters
  app.use("/api/admin/login", loginLimiter);
  app.use("/api/create-payment", paymentLimiter);
  app.use("/api/create-payment-intent", paymentLimiter);
  app.use("/api/status/", publicApiLimiter);
  app.use("/api/apply", publicApiLimiter);
  app.use("/api/", generalApiLimiter);

  // --- STRIPE RAW WEBHOOK INTERACTION ROUTE (NO FALLBACKS / SIGNATURE MANDATORY) ---
  app.post(
    "/api/webhook/stripe",
    express.raw({ type: "application/json" }),
    async (req: any, res: any) => {
      const sig = req.headers["stripe-signature"];

      if (!sig) {
        console.error("[Stripe Webhook] Rejected: Missing stripe-signature header.");
        return res.status(400).send("Webhook signature verification failed");
      }

      let event: Stripe.Event;
      try {
        event = getStripe().webhooks.constructEvent(req.body, sig, getStripeWebhookSecret());
      } catch (err: any) {
        console.error(`[Stripe Webhook] Signature check failed:`, err.message);
        return res.status(400).send("Webhook signature verification failed");
      }

      console.log(`[Stripe Webhook] Verified signature successfully. Event type: ${event.type}`);

      const acceptedEventTypes = ["checkout.session.completed", "payment_intent.succeeded"];
      if (!acceptedEventTypes.includes(event.type)) {
        console.warn(`[Stripe Webhook] Rejected: Unknown or unhandled event type: ${event.type}`);
        return res.status(400).send(`Stripe Webhook Error: Unhandled event type ${event.type}`);
      }

      try {
        const sessionOrIntent = event.data.object as any;
        
        // Strict metadata usage: One identifier permitted
        const draftId = sessionOrIntent.metadata?.draftId;

        if (!draftId) {
          console.error("[Stripe Webhook] Rejected: Received payment event but metadata.draftId is missing. Skipping processing.");
          return res.status(400).send("Error: Link identifier matching metadata.draftId is missing.");
        }

        // Webhook Idempotency & Race Condition Protection: Attempt immediate lock insertion
        // Highly concurrent duplicate webhooks will clash on the unique index constraint
        try {
          await (dbAdapter as any).stripeEvents.create({
            stripeEventId: event.id,
            processedAt: new Date()
          });
        } catch (lockError: any) {
          console.warn(`[Stripe Webhook Idempotency (Race Protection)] Concurrency blocked: Event ${event.id} is already registered or currently being handled.`);
          return res.json({ received: true });
        }

        // Fetch draft application strictly matching draftId
        const appItem = await dbAdapter.applications.findById(draftId);

        if (!appItem) {
          console.error(`[Stripe Webhook] Received payment for draft ID ${draftId} but no database record matches.`);
          return res.status(404).send("Error: No matching application draft found.");
        }

        // Before inserting payment: Check if stripeEventId already exists to skip duplicate inserts
        const duplicatePayment = await dbAdapter.payments.findOne({ stripeEventId: event.id });
        if (duplicatePayment) {
          console.log(`[Stripe Webhook Duplicate Protection] Payment with stripeEventId ${event.id} already exists. Skipping insertion.`);
          return res.json({ received: true });
        }

        // Event-Specific payment amount calculation
        let sessionAmountTotal = 0;
        if (event.type === "checkout.session.completed") {
          sessionAmountTotal = (sessionOrIntent.amount_total || 0) / 100;
        } else if (event.type === "payment_intent.succeeded") {
          sessionAmountTotal = (sessionOrIntent.amount || 0) / 100;
        } else {
          sessionAmountTotal = 0;
        }

        if (Math.abs(sessionAmountTotal - appItem.totalFee) > 0.01) {
          console.error(`[Stripe Webhook Amount Mismatch] Expected exact: ${appItem.totalFee}, Captured: ${sessionAmountTotal}`);
          throw new Error("Payment mismatch detected");
        }

        // Duplication check (Fraud prevention / application status check)
        if (appItem.paymentStatus === "paid") {
          console.log(`[Stripe Webhook Warning] Application ${draftId} is already promoted and paid. Recording webhook ID for idempotency records.`);
          
          const duplicatePayload = {
            eventId: event.id,
            type: event.type,
            amount: sessionAmountTotal,
            draftId: (appItem as any)._id.toString()
          };

          const rawPayload = process.env.DEBUG_PAYLOAD_MODE === "true"
            ? JSON.stringify(event)
            : JSON.stringify(duplicatePayload);

          // Save a success registry so future triggers of this event ID exit instantly
          await dbAdapter.payments.create({
            draftId: (appItem as any)._id.toString(),
            gateway: "stripe",
            transactionId: sessionOrIntent.id || `ch_stripe_web_${Date.now()}`,
            sessionId: sessionOrIntent.id || "",
            stripeEventId: event.id,
            amount: sessionAmountTotal,
            currency: "USD",
            status: "success",
            webhookVerified: true,
            rawPayload,
            createdAt: new Date()
          });
          return res.json({ received: true, alreadyPaid: true });
        }

        const exactDbId = (appItem as any)._id.toString();
        const incomingTxn = sessionOrIntent.id || `ch_stripe_web_${Date.now()}`;

        // Generate actual application ID: KSA-{timestamp}-{randomString}
        const timeStr = Date.now().toString();
        const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
        const uniqueKSAId = `KSA-${timeStr}-${randStr}`;

        // Promote application secure status parameters
        await dbAdapter.applications.findByIdAndUpdate(exactDbId, {
          paymentStatus: "paid",
          applicationStatus: "submitted",
          applicationId: uniqueKSAId,
          paymentMethod: "Stripe Checkout",
          transactionId: incomingTxn,
          updatedAt: new Date()
        });

        // Track verified Stripe Payments ledger (Idempotent tracking with sessionId = sessionOrIntent.id, stripeEventId = event.id)
        // Correct Ledger Design: Always build an append-only database record, never overwrite financial details.
        const optimizedPayload = {
          eventId: event.id,
          type: event.type,
          amount: sessionAmountTotal,
          draftId: exactDbId
        };

        const rawPayload = process.env.DEBUG_PAYLOAD_MODE === "true"
          ? JSON.stringify(event)
          : JSON.stringify(optimizedPayload);

        await dbAdapter.payments.create({
          draftId: exactDbId,
          gateway: "stripe",
          transactionId: incomingTxn,
          sessionId: sessionOrIntent.id || "",
          stripeEventId: event.id,
          amount: sessionAmountTotal,
          currency: "USD",
          status: "success",
          webhookVerified: true,
          rawPayload,
          createdAt: new Date()
        });

        // Security auditor logger entry
        await dbAdapter.logs.create({
          action: `Stripe Webhook FINALIZED: Authorized payment & promoted application ID to ${uniqueKSAId}`,
          performedBy: "Stripe Webhook Gateway Authority",
          targetId: uniqueKSAId,
          timestamp: new Date()
        });

        console.log(`[Stripe Webhook Finalized] Application promoted successfully: ${uniqueKSAId}`);
        return res.json({ received: true, finalizedId: uniqueKSAId });

      } catch (dbError: any) {
        if (dbError.message === "Payment mismatch detected") {
          return res.status(400).send("Error: Payment mismatch detected");
        }
        const errorId = generateErrorId();
        console.error(`[CRITICAL ERROR ${errorId}] Stripe Webhook Exception - DB process failure:`, dbError);
        return res.status(500).json({
          error: "Database transaction processing failure occurred.",
          errorId,
          timestamp: new Date()
        });
      }
    }
  );

  // Parse JSON payloads with safe 15MB limits
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true, limit: "15mb" }));

  // Connect MongoDB Atlas immediately at boot (Crashes if MongoDB is broken or unavailable)
  await connectDB();

  // --- MIDLEVEL COMPLIANCE MIDDLEWARE ---
  function authenticateAdmin(req: any, res: any, next: any) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Access denied. Admin session token not provided." });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, getJwtSecret());
      req.admin = decoded;
      next();
    } catch {
      return res.status(401).json({ error: "Access denied or session expired. Relogin required." });
    }
  }

  // --- API ROUTING ENGINES ---

  // GET /api/health
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      persistenceMode: "MongoDB Atlas (Production)",
      time: new Date()
    });
  });

  // GET /api/admin/captcha
  app.get("/api/admin/captcha", (req, res) => {
    try {
      // Memory Protection Cap: Limit max concurrent captcha sessions to 5000 to prevent RAM abuse
      if (captchaSessions.size >= 5000) {
        const now = Date.now();
        for (const [key, value] of captchaSessions.entries()) {
          if (now > value.expiresAt || captchaSessions.size > 2500) {
            captchaSessions.delete(key);
          }
        }
      }

      const num1 = Math.floor(Math.random() * 9) + 1;
      const num2 = Math.floor(Math.random() * 9) + 1;
      const sid = "cap_" + Math.random().toString(36).substring(2, 10);
      const answer = num1 + num2;
      
      captchaSessions.set(sid, {
        answer,
        expiresAt: Date.now() + 180000 // 3 minutes expiration
      });

      return res.json({
        success: true,
        captchaSid: sid,
        question: `Please solve: ${num1} + ${num2} = ?`
      });
    } catch (err) {
      return handleExceptionTrace(res, err, "Failed to generate security check question.");
    }
  });

  // POST /api/admin/login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password, captchaSid, captchaAnswer } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password parameters must be supplied." });
      }

      // Security CAPTCHA Check
      if (!captchaSid || !captchaAnswer) {
        return res.status(400).json({ error: "CAPTCHA authorization parameters are missing. Please solve the security check." });
      }

      const cached = captchaSessions.get(captchaSid);
      if (!cached || cached.expiresAt < Date.now()) {
        return res.status(400).json({ error: "CAPTCHA security check has expired or is invalid. Please reload and try again." });
      }

      if (parseInt(captchaAnswer, 10) !== cached.answer) {
        captchaSessions.delete(captchaSid); // invalidate captcha instantly on attempt
        return res.status(403).json({ error: "CAPTCHA security check failed. Inaccurate result entered." });
      }

      // Invalidate current captcha token since it's verified successfully
      captchaSessions.delete(captchaSid);

      const queryEmail = email.trim().toLowerCase() === "admin" ? "admin@ksavisa.com" : email.trim().toLowerCase();
      const admin = await dbAdapter.admins.findOne({ email: queryEmail });
      
      if (!admin) {
        return res.status(403).json({ error: "Invalid administrative credentials." });
      }

      // Check lock status
      if (admin.lockUntil && admin.lockUntil > new Date()) {
        const remainingMs = admin.lockUntil.getTime() - Date.now();
        const minsRemaining = Math.ceil(remainingMs / 60000);
        return res.status(423).json({ 
          error: `Temporary Lock Active: Account locked due to repeated incorrect password attempts. Please try again in ${minsRemaining} minute(s).` 
        });
      }

      const matches = bcrypt.compareSync(password, admin.passwordHash);
      if (!matches) {
        // Record failed attempt and compute potential lock status
        const { attempts, lockUntil } = await (dbAdapter as any).admins.incrementAttempts(queryEmail);
        if (lockUntil) {
          return res.status(423).json({ 
            error: "Temporary Lock Active: Excessive administrative failures detected. Account locked for 15 minutes." 
          });
        }
        return res.status(403).json({ 
          error: `Invalid administrative credentials. Attempt ${attempts} of 5 before structural locking.` 
        });
      }

      // Reset login failure counters on success
      await (dbAdapter as any).admins.resetAttempts(queryEmail);

      const token = jwt.sign(
        { email: admin.email, role: admin.role || "admin" },
        getJwtSecret(),
        { expiresIn: "4h" }
      );

      await dbAdapter.admins.updateLoginTime(admin.email);
      await dbAdapter.logs.create({
        action: "Administrative User Logged In",
        performedBy: admin.email,
        targetId: admin.email
      });

      return res.json({
        success: true,
        token,
        email: admin.email,
        role: admin.role
      });
    } catch (e: any) {
      return handleExceptionTrace(res, e, "Administration login pipeline halted.");
    }
  });

  // POST /api/apply – Saves draft with cloud-uploaded documents
  app.post("/api/apply", async (req, res) => {
    try {
      const {
        fullName,
        email,
        phone,
        passportNo,
        nationality,
        dob,
        visaType,
        numberOfApplicants,
        address,
        passportScan,
        photo,
        totalFee
      } = req.body;

      if (!fullName || !email || !passportNo || !visaType) {
        return res.status(400).json({ error: "Core application input parameters are missing." });
      }

      // Base64 elements are uploaded directly to Cloudinary (No base64 in database, no local file persist)
      let savedPassportUrl = "";
      let savedPhotoUrl = "";
      try {
        savedPassportUrl = await saveUploadedFileToCloud(passportScan);
        savedPhotoUrl = await saveUploadedFileToCloud(photo);
      } catch (uploadError: any) {
        return res.status(400).json({ error: uploadError.message });
      }

      // Check duplicates in DRAFT stage to prevent dual submission
      const existingDraft = await dbAdapter.applications.findOne({ passportNo, paymentStatus: "draft" });
      if (existingDraft) {
        return res.json({
          success: true,
          message: "A matching active application draft already exists. Directing to checkout.",
          application: existingDraft
        });
      }

      const paymentId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;

      const newApp = await dbAdapter.applications.create({
        fullName,
        email,
        phone: phone || "",
        passportNo,
        nationality: nationality || "United States",
        dob: dob || "",
        visaType,
        numberOfApplicants: Number(numberOfApplicants) || 1,
        address: address || "",
        documents: {
          passportScan: savedPassportUrl,
          photo: savedPhotoUrl
        },
        paymentId,
        paymentStatus: "draft",
        applicationStatus: "draft",
        applicationId: "", // strictly no ID until finalized paid via Webhook
        totalFee: Number(totalFee) || 120,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const appIdToReturn = (newApp as any)._id.toString();

      const clientCompatibleApp = {
        ...((newApp as any).toObject ? (newApp as any).toObject() : newApp),
        applicationId: appIdToReturn 
      };

      console.log(`[Apply Draft Saved] Draft Created: ${appIdToReturn} for ${fullName}`);

      return res.status(201).json({
        success: true,
        message: "Application saved as DRAFT. Secure financial checkout is now required.",
        application: clientCompatibleApp
      });
    } catch (err: any) {
      return handleExceptionTrace(res, err, "SaaS intake pipeline halted. Please check transaction attributes.");
    }
  });

  // POST /api/create-payment-intent (Real Stripe Checkout session setup)
  const createPaymentSessionHandler = async (req: any, res: any) => {
    try {
      const { applicationId } = req.body;
      if (!applicationId) {
        return res.status(400).json({ error: "Request payload missing draft validation ID." });
      }

      let appItem = await dbAdapter.applications.findById(applicationId);
      if (!appItem) {
        appItem = await dbAdapter.applications.findOne({ applicationId });
      }

      if (!appItem) {
        return res.status(404).json({ error: "Specified visa application draft was not found." });
      }

      if (appItem.paymentStatus === "paid") {
        return res.status(400).json({ error: "This application invoice has already been successfully verified and paid." });
      }

      const draftIdStr = (appItem as any)._id.toString();

      // Launch official production Stripe Checkout Session
      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `Saudi Arabia eVisa Standard Filing Fee (${appItem.visaType.charAt(0).toUpperCase() + appItem.visaType.slice(1)})`,
                description: `Payment tracking invoice for passport: ${appItem.passportNo}`,
              },
              unit_amount: Math.round(appItem.totalFee * 100),
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000'}/apply?mode=status&appId=${draftIdStr}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || process.env.APP_URL || 'http://localhost:3000'}/apply?mode=payment&applicationId=${draftIdStr}`,
        metadata: {
          applicationId: draftIdStr,
          draftId: draftIdStr,
        },
      });

      // Track Payment attempt details
      await dbAdapter.applications.findByIdAndUpdate(draftIdStr, {
        paymentStatus: "pending",
        updatedAt: new Date()
      });

      console.log(`[Stripe Checkout Engine] Generated Redirect URL for Draft=${draftIdStr}: ${session.url}`);

      return res.json({
        success: true,
        url: session.url,
        sessionId: session.id,
        applicationId: draftIdStr,
        amountUsd: appItem.totalFee
      });

    } catch (err: any) {
      return handleExceptionTrace(res, err, "Broker Checkout is currently offline. Please try again on a different browser.");
    }
  };

  app.post("/api/create-payment-intent", createPaymentSessionHandler);
  app.post("/api/create-payment", createPaymentSessionHandler);

  // GET /api/status/:applicationId – Public visual tracker API
  app.get("/api/status/:applicationId", async (req, res) => {
    try {
      const id = req.params.applicationId;
      if (!id) {
        return res.status(400).json({ error: "Required identifier param missing." });
      }

      let match = await dbAdapter.applications.findOne({ applicationId: id });
      if (!match) {
        match = await dbAdapter.applications.findById(id);
      }

      if (!match) {
        return res.status(404).json({ error: "No matching visa document matching ID found." });
      }

      return res.json({
        success: true,
        application: match
      });
    } catch (err: any) {
      return handleExceptionTrace(res, err, "Tracking system offline.");
    }
  });

  // GET /api/applications – Unified query list endpoint
  app.get("/api/applications", async (req, res) => {
    try {
      const { q, visaType, paymentStatus, applicationStatus } = req.query;

      let allDocs = await dbAdapter.applications.find();
      let filtered = allDocs.map(a => (a.toObject ? a.toObject() : a));

      if (q) {
        const query = (q as string).toLowerCase().trim();
        filtered = filtered.filter(app => 
          (app.fullName && app.fullName.toLowerCase().includes(query)) ||
          (app.email && app.email.toLowerCase().includes(query)) ||
          (app.passportNo && app.passportNo.toLowerCase().includes(query)) ||
          (app.applicationId && app.applicationId.toLowerCase().includes(query)) ||
          (app._id && app._id.toString().toLowerCase().includes(query))
        );
      }

      if (visaType && visaType !== "all") {
        filtered = filtered.filter(app => app.visaType === visaType);
      }

      if (paymentStatus && paymentStatus !== "all") {
        filtered = filtered.filter(app => app.paymentStatus === paymentStatus);
      }

      if (applicationStatus && applicationStatus !== "all") {
        filtered = filtered.filter(app => app.applicationStatus === applicationStatus);
      }

      res.json({
        success: true,
        count: filtered.length,
        applications: filtered
      });
    } catch (err: any) {
      return handleExceptionTrace(res, err, "Filtering list system error.");
    }
  });

  // --- SECURE AUTHENTICATE ADMINISTRATIVE CONTROLLERS ---

  // GET /api/admin/applications (JWT Secured)
  app.get("/api/admin/applications", authenticateAdmin, async (req, res) => {
    try {
      const all = await dbAdapter.applications.find();
      const mapped = all.map(a => (a.toObject ? a.toObject() : a));
      return res.json({
        success: true,
        applications: mapped
      });
    } catch (err: any) {
      return handleExceptionTrace(res, err, "Failed loading secure applications roster.");
    }
  });

  // PUT /api/application/status (Or /api/admin/update-status JWT Secured compliance hooks)
  const appStatusModifyHandler = async (req: any, res: any) => {
    try {
      const { applicationId, applicationStatus, paymentStatus } = req.body;
      if (!applicationId) {
        return res.status(400).json({ error: "Missing target validation ID." });
      }

      let appItem = await dbAdapter.applications.findById(applicationId);
      if (!appItem) {
        appItem = await dbAdapter.applications.findOne({ applicationId });
      }

      if (!appItem) {
        return res.status(404).json({ error: "Required visa record not found." });
      }

      // STRICT SECURITY HANDSHAKE LOCKDOWN: Manual payment modifications bypasses are permanently prohibited!
      if (paymentStatus === "paid" || applicationStatus === "submitted") {
        return res.status(403).json({
          error: "Strict Security Lockdown: Manual marking of payment state as 'paid' or applicationStatus as 'submitted' is strictly forbidden. Authorization is reserved solely for Stripe Webhook verification."
        });
      }

      const dbIdStr = (appItem as any)._id.toString();
      const updatePayload: any = { updatedAt: new Date() };

      if (applicationStatus) {
        // Enforce payment status validation check
        if (appItem.paymentStatus !== "paid") {
          return res.status(400).json({
            error: "Failed manual promotion. Cannot transition application state when invoice remains unpaid."
          });
        }
        updatePayload.applicationStatus = applicationStatus;
      }

      if (paymentStatus) {
        // Permitted states (e.g. tracking payment attempts or failures during reviews), but NOT promoter paid
        updatePayload.paymentStatus = paymentStatus;
      }

      const oldAppState = appItem.applicationStatus;
      const oldPayState = appItem.paymentStatus;

      const updatedDoc = await dbAdapter.applications.findByIdAndUpdate(dbIdStr, updatePayload, { new: true });

      const adminUser = req.admin?.email || "admin";
      await dbAdapter.logs.create({
        action: `Manual Administrative State Promotion: Passport=${appItem.passportNo}. ApplicationStatus: '${oldAppState}' -> '${applicationStatus || oldAppState}', PaymentStatus: '${oldPayState}' -> '${paymentStatus || oldPayState}'`,
        performedBy: adminUser,
        targetId: dbIdStr,
        timestamp: new Date()
      });

      return res.json({
        success: true,
        message: "Status parameters resolved and secured inside state.",
        application: updatedDoc
      });
    } catch (err: any) {
      return handleExceptionTrace(res, err, "State modifier engine failed.");
    }
  };

  app.put("/api/application/status", authenticateAdmin, appStatusModifyHandler);
  app.put("/api/admin/update-status", authenticateAdmin, appStatusModifyHandler);

  // GET /api/admin/payments (JWT Secured) - Retrieves checkout list logs
  app.get("/api/admin/payments", authenticateAdmin, async (req, res) => {
    try {
      const pays = await dbAdapter.payments.find();
      const mapped = pays.map(p => {
        const item = (p.toObject ? p.toObject() : p) as any;
        return {
          ...item,
          paymentId: item.paymentId || `PAY-${Math.floor(100000 + Math.random() * 900000)}`,
          applicationId: item.applicationId || item.draftId || ""
        };
      });
      return res.json({ success: true, payments: mapped });
    } catch (err: any) {
      return handleExceptionTrace(res, err, "Ledger database offline.");
    }
  });

  // GET /api/admin/logs (JWT Secured)
  app.get("/api/admin/logs", authenticateAdmin, async (req, res) => {
    try {
      const logs = await dbAdapter.logs.find();
      const mapped = logs.map(l => {
        const item = (l.toObject ? l.toObject() : l);
        return {
          ...item,
          timestamp: item.timestamp || item.createdAt
        };
      });
      return res.json({ success: true, logs: mapped });
    } catch (err: any) {
      return handleExceptionTrace(res, err, "History database registry failure.");
    }
  });

  // Vite development bundler fallback
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SaaS Server] Fully active on http://localhost:${PORT} with production DB configurations.`);
  });
}

startServer().catch((err) => {
  console.error("Critical server boot error:", err);
});
