import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, ShieldX, Compass, AlertCircle, FileText, Download, Search, Landmark, RefreshCw, Printer } from 'lucide-react';
import { Application } from '../types';

interface StatusProps {
  initialAppId?: string;
  navigate: (path: string) => void;
}

export default function Status({ initialAppId = '', navigate }: StatusProps) {
  const [appIdInput, setAppIdInput] = useState(initialAppId);
  const [app, setApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync with prop
  useEffect(() => {
    if (initialAppId) {
      setAppIdInput(initialAppId);
      triggerSearch(initialAppId);
    }
  }, [initialAppId]);

  const triggerSearch = async (targetId: string) => {
    if (!targetId.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const res = await fetch(`/api/applications?q=${targetId.trim()}`);
      const data = await res.json();

      if (data.success && data.applications && data.applications.length > 0) {
        // Find exact match
        const match = data.applications.find((a: Application) => 
          a.applicationId.toLowerCase() === targetId.toLowerCase().trim() ||
          a.passportNo.toLowerCase() === targetId.toLowerCase().trim()
        );

        if (match) {
          setApp(match);
        } else {
          setApp(null);
          setErrorMessage("No matching Applications discovered with that ID.");
        }
      } else {
        setApp(null);
        setErrorMessage("No matching Applications discovered with that ID.");
      }
    } catch (err) {
      setErrorMessage("Database read timed out. Confirm connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch(appIdInput);
  };

  // Receipt printed simulation
  const handlePrintReceipt = () => {
    window.print();
  };

  // Estimated dispatch date
  const getEstimatedDate = (createdAt: string) => {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + 2); // 48 hours later
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans min-h-[75vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Search Console Plate */}
        <div className="bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-md mb-8">
          <h1 className="font-display text-2xl font-extrabold text-slate-900 mb-2">Track Your Saudi Visa Status</h1>
          <p className="text-xs sm:text-sm text-slate-500 mb-6 font-sans">
            Input either your unique **Application ID (KSA-2026-XXXXX)** or **Passport Number** to track real-time MOFA progress.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-3.5 text-slate-400">
                <Search size={16} />
              </span>
              <input
                type="text"
                placeholder="e.g. KSA-2026-92815 or passport code..."
                value={appIdInput}
                onChange={(e) => setAppIdInput(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm font-semibold uppercase tracking-wider font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold py-3 px-6 rounded-xl transition-colors text-xs uppercase tracking-wider flex items-center justify-center space-x-2.5 cursor-pointer flex-shrink-0"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin w-4 h-4" />
                  <span>Checking...</span>
                </>
              ) : (
                <span>Lookup Status</span>
              )}
            </button>
          </form>

          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 text-red-800 border border-red-100 rounded-xl text-xs flex items-center gap-1.5 font-medium">
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Dynamic tracking output displays */}
        {app ? (
          <div className="space-y-8" id="status_portal_results">
            
            {/* Status Plate Banner */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-50">
                <div>
                  <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">VISA TRACKING IDENTIFIER</span>
                  <span className="block text-xl font-mono font-bold text-slate-900 mt-0.5">{app.applicationId}</span>
                </div>

                {/* Badge based on state */}
                <div>
                  {app.paymentStatus === 'draft' && (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-zinc-50 text-zinc-700 text-xs font-bold uppercase tracking-wider rounded-xl border border-zinc-200" id="badge-draft">
                      ● Draft Invoice
                    </span>
                  )}
                  {app.paymentStatus === 'pending' && (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-xl border border-amber-200" id="badge-pending">
                      ● Awaiting Payment
                    </span>
                  )}
                  {app.paymentStatus === 'pending_verification' && (
                    <span className="inline-flex items-center space-x-2 px-4 py-2 bg-teal-50 text-teal-700 text-xs font-bold uppercase tracking-wider rounded-xl border border-teal-250" id="badge-verification">
                      <Clock size={12} className="animate-pulse" />
                      <span>Payment Under Review</span>
                    </span>
                  )}
                  {app.paymentStatus === 'paid' && app.applicationStatus === 'submitted' && (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded-xl border border-indigo-200" id="badge-paid-submitted">
                      ● Paid / Submitted
                    </span>
                  )}
                  {app.paymentStatus === 'paid' && app.applicationStatus === 'processing' && (
                    <span className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded-xl border border-emerald-150" id="badge-processing">
                      <Clock size={12} className="animate-spin" />
                      <span>Paid / In Processing</span>
                    </span>
                  )}
                  {app.applicationStatus === 'approved' && (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-xl border border-emerald-200" id="badge-approved">
                      ● Visa Issued (Approved)
                    </span>
                  )}
                  {app.applicationStatus === 'rejected' && (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider rounded-xl border border-red-200" id="badge-rejected">
                      ● Consular Reject (Hold)
                    </span>
                  )}
                  {app.paymentStatus === 'failed' && (
                    <span className="inline-flex items-center space-x-1 px-4 py-2 bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider rounded-xl border border-rose-200" id="badge-failed">
                      ● Payment Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Step checklist details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans mb-6">
                <div>
                  <span className="block text-xs font-bold text-slate-400">Payment Status:</span>
                  <span className={`block text-sm font-semibold mt-1 uppercase ${
                    app.paymentStatus === 'paid' ? 'text-emerald-700' :
                    app.paymentStatus === 'pending_verification' ? 'text-teal-600 font-bold animate-pulse' :
                    app.paymentStatus === 'pending' ? 'text-amber-600' : 'text-slate-500'
                  }`}>
                    {app.paymentStatus === 'paid' && 'Verified (Paid)'}
                    {app.paymentStatus === 'pending_verification' && 'Reviewing Wire transfer'}
                    {app.paymentStatus === 'pending' && 'Awaiting payment click'}
                    {app.paymentStatus === 'draft' && 'Draft (Unpaid)'}
                    {app.paymentStatus === 'failed' && 'Payment Declined'}
                  </span>
                  {app.paymentStatus !== 'paid' && app.paymentStatus !== 'pending_verification' && (
                    <button
                      onClick={() => navigate(`/payment?appId=${app.applicationId}`)}
                      className="text-[10px] font-bold text-emerald-600 underline cursor-pointer mt-1 hover:text-emerald-700 block"
                    >
                      Settle invoice payment now
                    </button>
                  )}
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400">Estimated Delivery:</span>
                  <span className="block text-sm font-semibold mt-1 text-slate-950">{getEstimatedDate(app.createdAt)}</span>
                </div>

                <div>
                  <span className="block text-xs font-bold text-slate-400">Consulate Target:</span>
                  <span className="block text-sm font-semibold mt-1 text-slate-950 font-mono">MOFA MAIN JEDDAH</span>
                </div>
              </div>

              {/* Info advice according to status */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start space-x-2.5 text-xs text-slate-600 font-sans leading-relaxed">
                {app.applicationStatus === 'approved' ? (
                  <>
                    <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={16} />
                    <p>
                      <strong>Visa Dispatched:</strong> Your electronic travel credentials got issued and registered. A PDF document has been successfully dispatched to <strong>{app.email}</strong>. Download or print the detailed invoice below for boarding checkpoints.
                    </p>
                  </>
                ) : app.paymentStatus === 'pending_verification' ? (
                  <>
                    <Landmark className="text-teal-600 flex-shrink-0 mt-0.5 animate-pulse" size={16} />
                    <p>
                      <strong>Payment Under Review:</strong> Your manual bank transfer receipt slip has been securely uploaded. Consular team officers will match bank transaction records to finalize manual resolution. The application stays as a secure "draft" until payment verifies.
                    </p>
                  </>
                ) : app.applicationStatus === 'processing' ? (
                  <>
                    <Clock className="text-amber-500 flex-shrink-0 mt-0.5 animate-pulse" size={16} />
                    <p>
                      <strong>Filing queued:</strong> Our liaison officers verified compliance checks and queued filings in the consular server. Timeline resolution typically ranges between 12 to 48 hours. Continue tracking status here as approvals register dynamically.
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle className="text-slate-400 flex-shrink-0 mt-0.5" size={16} />
                    <p>
                      Your files were successfully synchronized. All database drafts persist perfectly. Complete payment of the consolidated fee to trigger active visa filing.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Print and Receipt Section card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md" id="receipt-print-section">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
                <h3 className="font-display text-lg font-bold text-slate-900">Application Invoice Receipt</h3>
                <div className="flex gap-2.5">
                  <button
                    onClick={handlePrintReceipt}
                    className="p-2 border border-slate-200 text-slate-600 hover:text-emerald-700 hover:border-emerald-600/30 rounded-lg cursor-pointer transition-colors"
                    title="Print Receipt"
                  >
                    <Printer size={16} />
                  </button>
                </div>
              </div>

              {/* Renders Receipt Plate */}
              <div className="border border-slate-100 rounded-2xl p-6 bg-slate-50/40 font-sans text-xs space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="block font-display text-sm font-bold text-slate-900">KSA Visa Services facilitation</span>
                    <span className="block text-[10px] text-slate-400">Riyadh, Kingdom of Saudi Arabia</span>
                  </div>
                  <div className="text-right">
                    <span className="block font-mono font-bold text-slate-800">TAX INVOICE</span>
                    <span className="block text-[10px] text-slate-400">Date: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 leading-relaxed">
                  <div>
                    <strong className="block text-slate-450 uppercase text-[10px]">Billed to:</strong>
                    <span className="block font-bold mt-0.5">{app.fullName}</span>
                    <span className="block">{app.email}</span>
                    <span className="block">{app.address}</span>
                  </div>
                  <div className="text-right">
                    <strong className="block text-slate-450 uppercase text-[10px]">Reference:</strong>
                    <span className="block font-mono mt-0.5">PASSPORT: {app.passportNo}</span>
                    <span className="block font-mono">APP ID: {app.applicationId}</span>
                    <span className="block">Nationality: {app.nationality}</span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="grid grid-cols-12 font-bold text-slate-400 text-[10px] uppercase tracking-wider mb-2">
                    <div className="col-span-8">Description</div>
                    <div className="col-span-2 text-center">Applicants</div>
                    <div className="col-span-2 text-right">Fee</div>
                  </div>

                  <div className="grid grid-cols-12 py-2 border-b border-dashed border-slate-200 text-slate-700">
                    <div className="col-span-8">
                      <span className="font-semibold block">Official Saudi Arabia {app.visaType.charAt(0).toUpperCase() + app.visaType.slice(1)} Visa File Filing</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Consular application, health insurance & expert compliance cross-checker review.</span>
                    </div>
                    <div className="col-span-2 text-center font-semibold">{app.numberOfApplicants}</div>
                    <div className="col-span-2 text-right font-mono font-semibold">${app.totalFee} USD</div>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-2">
                  <div className="text-[10px] text-slate-400">
                    {app.paymentMethod ? (
                      <div>Paid via <strong>{app.paymentMethod}</strong>. TXN Code: {app.transactionId}</div>
                    ) : (
                      <div>Invoice holds <strong>PENDING STATE</strong>. Complete payment to initiate filings.</div>
                    )}
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Captured</span>
                    <span className="font-mono text-base font-bold text-emerald-800">${app.totalFee} USD</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        ) : (
          !isLoading && initialAppId && (
            <div className="p-8 bg-white border border-slate-150 rounded-2xl text-center text-slate-500 text-sm">
              Please enter an application ID that was finalized on the checkout server.
            </div>
          )
        )}

      </div>
    </div>
  );
}
