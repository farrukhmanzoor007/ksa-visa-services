import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldAlert, Loader2, MessageCircle, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { Application } from '../types';

interface PaymentProps {
  applicationId: string;
  navigate: (path: string) => void;
}

export default function Payment({ applicationId, navigate }: PaymentProps) {
  const [app, setApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Load drafted application on mount
  useEffect(() => {
    if (!applicationId) {
      setErrorMessage("Missing draft validation ID identifier.");
      setIsLoading(false);
      return;
    }

    const fetchApp = async () => {
      try {
        const res = await fetch(`/api/applications?q=${applicationId}`);
        const data = await res.json();
        
        if (data.success && data.applications && data.applications.length > 0) {
          // Find matching application
          const match = data.applications.find((a: Application) => 
            a.applicationId === applicationId || (a as any)._id === applicationId
          );
          if (match) {
            setApp(match);
            if (match.paymentStatus === 'paid') {
              // Already paid, redirect straight to receipt status
              navigate(`/apply?mode=status&appId=${applicationId}`);
            }
          } else {
            setErrorMessage("Specified visa application draft was not found in database.");
          }
        } else {
          setErrorMessage("Failed to locate any drafted application details.");
        }
      } catch (err) {
        setErrorMessage("Network connection error loading applications database.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchApp();
  }, [applicationId, navigate]);

  const handleCheckoutRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!app) return;

    setErrorMessage("");
    setProcessingPayment(true);

    try {
      const intentRes = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId })
      });

      const data = await intentRes.json();
      if (!intentRes.ok || data.error) {
        throw new Error(data.error || "Incapacitated from preparing stripe checkout session.");
      }

      if (data.url) {
        console.log(`[Stripe Checkout redirect] Redirecting window to: ${data.url}`);
        window.location.href = data.url;
      } else {
        throw new Error("No secure Stripe redirect URL returned by gateway provider.");
      }
    } catch (err: any) {
      setProcessingPayment(false);
      setErrorMessage(err.message || "Failed to initiate Stripe Checkout session. Please verify server status.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center font-sans bg-slate-50">
        <Loader2 className="animate-spin text-emerald-600 w-10 h-10 mb-2" />
        <span className="text-slate-600 font-semibold text-sm">Opening Secured Invoice Portal...</span>
      </div>
    );
  }

  if (errorMessage && !app) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-slate-100 rounded-3xl p-8 text-center shadow-lg font-sans">
        <ShieldAlert className="text-red-500 w-12 h-12 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Checkout Error</h2>
        <p className="text-xs text-slate-500 leading-relaxed mb-6">{errorMessage}</p>
        <button
          onClick={() => navigate('/apply')}
          className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-3 px-6 rounded-xl cursor-pointer"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Progress header map */}
        <div className="flex justify-between items-center mb-10 max-w-lg mx-auto font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-800 flex items-center justify-center font-bold text-[10px] leading-none">✓</span>
            <span>INTAKE FORM</span>
          </div>
          <div className="h-0.5 bg-emerald-600/30 flex-1 mx-4" />
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] leading-none">2</span>
            <span>SECURE CHECKOUT</span>
          </div>
          <div className="h-0.5 bg-slate-200 flex-1 mx-4" />
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] leading-none">3</span>
            <span>STATUS</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Main Checkout Panel (7 columns) */}
          <div className="md:col-span-12 lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-md">
            
            <div className="flex items-center space-x-3 mb-6">
              <span className="bg-emerald-50 text-emerald-700 p-2.5 rounded-2xl border border-emerald-100 flex items-center justify-center">
                <CreditCard size={22} />
              </span>
              <div>
                <h1 className="font-display text-2xl font-extrabold text-slate-900">Secure Checkout Gate</h1>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">DRAFT REF: {applicationId}</p>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-2 text-xs text-red-800 font-medium animate-pulse">
                <ShieldAlert size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="text-slate-600 text-sm leading-relaxed mb-8 space-y-4">
              <p>
                Your application has been safely registered as a temporary secure <strong>draft</strong>.
              </p>
              <p className="text-xs bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-start gap-3">
                <Lock size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Stripe Direct Encrypted Redirect:</strong> We strictly route all payment details through Stripe's verified sandboxes to guarantee financial isolation. No credit details are captured, loaded, or stored by our servers.
                </span>
              </p>
            </div>

            <form onSubmit={handleCheckoutRedirect}>
              <button
                type="submit"
                disabled={processingPayment}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2.5 cursor-pointer shadow-md text-sm uppercase tracking-wider font-sans"
                id="payment_confirmation_button"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" />
                    <span>Spinning Up stripe Sandbox Gateway...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Secure Stripe Checkout</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex justify-center items-center gap-2 text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">
              <CheckCircle size={10} className="text-emerald-500" />
              <span>PCI-DSS Compliant</span>
              <span>•</span>
              <CheckCircle size={10} className="text-emerald-500" />
              <span>TLS 1.3 Encryption</span>
            </div>

          </div>

          {/* Checkout pricing details review (5 columns) */}
          <div className="md:col-span-12 lg:col-span-5 space-y-6 flex flex-col justify-start">
            
            {/* Applicant details */}
            <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-900 shadow-md">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-5 pb-3 border-b border-sky-950 text-slate-300">Application Invoice</h3>
              
              {app && (
                <div className="space-y-4 font-sans text-xs">
                  <div>
                    <span className="block text-slate-400">Main Applicant:</span>
                    <span className="block font-bold text-slate-100 text-sm mt-0.5">{app.fullName}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Passport Number:</span>
                    <span className="block font-mono text-slate-200 mt-0.5">{app.passportNo}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Visa Selected:</span>
                    <span className="block font-bold text-slate-200 mt-0.5">{app.visaType.charAt(0).toUpperCase() + app.visaType.slice(1)}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400">Applicants Count:</span>
                    <span className="block font-bold text-slate-100 mt-0.5">{app.numberOfApplicants} Traveler{app.numberOfApplicants > 1 ? 's' : ''}</span>
                  </div>

                  <div className="border-t border-slate-900 pt-5 mt-4 flex justify-between items-baseline">
                    <span className="font-bold text-xs text-slate-400 uppercase">Filing Due Fee</span>
                    <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">${app.totalFee} USD</span>
                  </div>
                </div>
              )}
            </div>

            {/* Helpline details */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs font-sans">
              <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Official Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Visa status remains as "Draft" until real-time Stripe webhooks confirm financial clearing. No unverified or manual bypass overrides are registered.
              </p>
              <button
                onClick={() => window.open('https://wa.me/966500000000', '_blank')}
                className="w-full text-center py-2.5 bg-emerald-50 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer hover:bg-emerald-100 transition-all"
              >
                <MessageCircle size={14} /> Ask support live
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
