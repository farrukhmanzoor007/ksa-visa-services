import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Database URI configured in environment
const MONGODB_URI = process.env.MONGODB_URI;

function checkDbConnected() {
  if (!MONGODB_URI) {
    throw new Error("Infrastructure Configuration Required: MONGODB_URI environment variable is missing. Please add your connection URL in the AI Studio Settings.");
  }
}

// Interfaces and schemas
export interface IApplication extends Document {
  fullName: string;
  email: string;
  phone: string;
  passportNo: string;
  nationality: string;
  dob: string;
  visaType: string;
  numberOfApplicants: number;
  address: string;
  documents: {
    passportScan: string;
    photo: string;
  };
  paymentStatus: "draft" | "pending" | "paid" | "failed" | "pending_verification";
  applicationStatus: "draft" | "submitted" | "processing" | "approved" | "rejected";
  applicationId: string; // generated AFTER payment
  paymentId: string;
  totalFee: number;
  paymentMethod?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment extends Document {
  draftId: string;
  gateway: "stripe" | "paypal" | "bank";
  transactionId: string;
  sessionId: string;
  stripeEventId?: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "pending_verification";
  webhookVerified: boolean;
  rawPayload: string;
  createdAt: Date;
}

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  role: string;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
}

export interface IAdminLog extends Document {
  action: string;
  performedBy: string;
  targetId: string;
  timestamp: Date;
  createdAt?: Date;
}

export interface IStripeEvent extends Document {
  stripeEventId: string;
  processedAt: Date;
}


// MONGOOSE SCHEMAS
const ApplicationSchema = new Schema<IApplication>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  passportNo: { type: String, required: true },
  nationality: { type: String, default: "United States" },
  dob: { type: String, default: "" },
  visaType: { type: String, required: true },
  numberOfApplicants: { type: Number, default: 1 },
  address: { type: String, default: "" },
  documents: {
    passportScan: { type: String, default: "" },
    photo: { type: String, default: "" }
  },
  paymentStatus: { type: String, default: "draft" },
  applicationStatus: { type: String, default: "draft" },
  applicationId: { type: String, default: "" },
  paymentId: { type: String, default: "" },
  totalFee: { type: Number, required: true },
  paymentMethod: { type: String },
  transactionId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const PaymentSchema = new Schema<IPayment>({
  draftId: { type: String, required: true },
  gateway: { type: String, required: true },
  transactionId: { type: String, default: "" },
  sessionId: { type: String, default: "" },
  stripeEventId: { type: String, default: "", index: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "USD" },
  status: { type: String, default: "pending" },
  webhookVerified: { type: Boolean, default: false },
  rawPayload: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "admin" },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date }
});

const AdminLogSchema = new Schema<IAdminLog>({
  action: { type: String, required: true },
  performedBy: { type: String, default: "admin" },
  targetId: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
});
AdminLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const StripeEventSchema = new Schema<IStripeEvent>({
  stripeEventId: { type: String, required: true, unique: true, index: true },
  processedAt: { type: Date, default: Date.now }
});
StripeEventSchema.index({ processedAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

let MongoApplicationModel: mongoose.Model<IApplication>;
let MongoPaymentModel: mongoose.Model<IPayment>;
let MongoAdminModel: mongoose.Model<IAdmin>;
let MongoAdminLogModel: mongoose.Model<IAdminLog>;
let MongoStripeEventModel: mongoose.Model<IStripeEvent>;

try {
  MongoApplicationModel = mongoose.model<IApplication>("Application", ApplicationSchema);
  MongoPaymentModel = mongoose.model<IPayment>("Payment", PaymentSchema);
  MongoAdminModel = mongoose.model<IAdmin>("Admin", AdminSchema);
  MongoAdminLogModel = mongoose.model<IAdminLog>("AdminLog", AdminLogSchema);
  MongoStripeEventModel = mongoose.model<IStripeEvent>("StripeEvent", StripeEventSchema);
} catch {
  MongoApplicationModel = mongoose.models.Application as mongoose.Model<IApplication>;
  MongoPaymentModel = mongoose.models.Payment as mongoose.Model<IPayment>;
  MongoAdminModel = mongoose.models.Admin as mongoose.Model<IAdmin>;
  MongoAdminLogModel = mongoose.models.AdminLog as mongoose.Model<IAdminLog>;
  MongoStripeEventModel = mongoose.models.StripeEvent as mongoose.Model<IStripeEvent>;
}

// SEED DEFAULT ADMINISTRATORS
async function seedDefaultAdmin() {
  const defaultAdminEmail = "admin@ksavisa.com";
  const defaultPlainPass = "KsaAdmin2026";
  const passHash = bcrypt.hashSync(defaultPlainPass, 10);

  try {
    const exists = await MongoAdminModel.findOne({ email: defaultAdminEmail });
    if (!exists) {
      await MongoAdminModel.create({
        email: defaultAdminEmail,
        passwordHash: passHash,
        role: "admin"
      });
      console.log(`[Seed admin] Admin seeded in MongoDB Atlas successfully: ${defaultAdminEmail}`);
    }
  } catch (e) {
    console.error("Admin seed Mongo initialization fault:", e);
  }
}

// 100% MongoDB Connect Execution
export async function connectDB() {
  if (!MONGODB_URI) {
    console.warn("[Database Security Monitor] MONGODB_URI is undefined. Setup is postponed until added in settings.");
    return;
  }
  try {
    if (mongoose.connection.readyState === 0) {
      console.log("Establishing secure handshake with MongoDB Atlas...");
      await mongoose.connect(MONGODB_URI, {
        connectTimeoutMS: 8000,
      });
      console.log("PRODUCTION SECURITY LEVEL: Primary MongoDB cluster connected.");
    }
    // Pre-seed Admins database if empty on connection
    await seedDefaultAdmin();

    // Explicitly sync indexes to guarantee unique and TTL constraints
    await MongoStripeEventModel.createIndexes();
    await MongoAdminLogModel.createIndexes();
    await MongoPaymentModel.createIndexes();
    console.log("[Database Security Monitor] Unique and TTL indexes optimized successfully.");
  } catch (err: any) {
    console.error("MongoDB Atlas link failing on load:", err);
  }
}

export function isUsingMongo(): boolean {
  return true; // Strictly production mode enabled
}

// Direct clean Mongoose implementations
export const dbAdapter = {
  // APPLICATIONS APIS
  applications: {
    find: async (query: any = {}) => {
      checkDbConnected();
      return MongoApplicationModel.find(query).sort({ createdAt: -1 });
    },

    findOne: async (query: any) => {
      checkDbConnected();
      return MongoApplicationModel.findOne(query);
    },

    findById: async (id: string) => {
      try {
        if (!id || !mongoose.isValidObjectId(id)) return null;
        checkDbConnected();
        return await MongoApplicationModel.findById(id);
      } catch {
        return null;
      }
    },

    create: async (data: any) => {
      checkDbConnected();
      return MongoApplicationModel.create(data);
    },

    findByIdAndUpdate: async (id: string, update: any, options: any = { new: true }) => {
      if (!id || !mongoose.isValidObjectId(id)) return null;
      checkDbConnected();
      return MongoApplicationModel.findByIdAndUpdate(id, update, options);
    },

    updateOne: async (query: any, update: any) => {
      checkDbConnected();
      return MongoApplicationModel.updateOne(query, update);
    }
  },

  // PAYMENTS APIS
  payments: {
    find: async (query: any = {}) => {
      checkDbConnected();
      return MongoPaymentModel.find(query).sort({ createdAt: -1 });
    },

    findOne: async (query: any) => {
      checkDbConnected();
      return MongoPaymentModel.findOne(query);
    },

    create: async (data: any) => {
      checkDbConnected();
      return MongoPaymentModel.create(data);
    },

    updateOne: async (query: any, update: any) => {
      checkDbConnected();
      return MongoPaymentModel.updateOne(query, update);
    }
  },

  // ADMINS APIS
  admins: {
    findOne: async (query: any) => {
      checkDbConnected();
      return MongoAdminModel.findOne(query);
    },

    updateLoginTime: async (email: string) => {
      checkDbConnected();
      return MongoAdminModel.updateOne({ email }, { lastLogin: new Date() });
    },

    incrementAttempts: async (email: string) => {
      checkDbConnected();
      const admin = await MongoAdminModel.findOne({ email });
      if (!admin) return { attempts: 0, lockUntil: null };
      const attempts = (admin.loginAttempts || 0) + 1;
      let lockUntil: Date | null = null;
      if (attempts >= 5) {
        // Lock for 15 minutes
        lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      }
      await MongoAdminModel.updateOne(
        { email },
        { 
          $set: { 
            loginAttempts: attempts >= 5 ? 0 : attempts, 
            lockUntil: lockUntil || undefined 
          } 
        }
      );
      return { attempts, lockUntil };
    },

    resetAttempts: async (email: string) => {
      checkDbConnected();
      return MongoAdminModel.updateOne(
        { email },
        { $set: { loginAttempts: 0 }, $unset: { lockUntil: "" } }
      );
    }
  },

  // AUDIT LOGS APIS
  logs: {
    find: async (query: any = {}) => {
      checkDbConnected();
      return MongoAdminLogModel.find(query).sort({ timestamp: -1 }).limit(100);
    },

    create: async (data: any) => {
      checkDbConnected();
      const created = await MongoAdminLogModel.create(data);
      try {
        const logCount = await MongoAdminLogModel.countDocuments();
        if (logCount > 500) {
          // Keep only the newest 500 entries
          const limitBoundary = await MongoAdminLogModel.find()
            .sort({ timestamp: -1 })
            .skip(499)
            .limit(1);
          if (limitBoundary.length > 0) {
            await MongoAdminLogModel.deleteMany({
              timestamp: { $lt: limitBoundary[0].timestamp }
            });
          }
        }
      } catch (rotationError) {
        console.warn("[Log Rotation] Non-blocking exception during clean cycle:", rotationError);
      }
      return created;
    }
  },

  // STRIPE EVENT IDEMPOTENCY APIS
  stripeEvents: {
    findOne: async (stripeEventId: string) => {
      checkDbConnected();
      return MongoStripeEventModel.findOne({ stripeEventId });
    },
    create: async (data: any) => {
      checkDbConnected();
      if (typeof data === "string") {
        return MongoStripeEventModel.create({ stripeEventId: data, processedAt: new Date() });
      }
      return MongoStripeEventModel.create({
        stripeEventId: data.stripeEventId,
        processedAt: data.processedAt || new Date()
      });
    }
  }
};
