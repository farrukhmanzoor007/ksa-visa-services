import React, { useState, useEffect } from 'react';
import { Search, Loader2, Landmark, CheckSquare, Eye, ShieldAlert, FileEdit, HelpCircle, CheckCircle, RefreshCw, Layers, DollarSign } from 'lucide-react';
import { Application, ApplicationStatus, PaymentStatus } from '../types';
import { safeLocalStorage } from '../utils/storage';

interface AdminProps {
  isAdminLoggedIn: boolean;
  onLoginSuccess: () => void;
  navigate: (path: string) => void;
}

export default function Admin({ isAdminLoggedIn, onLoginSuccess, navigate }: AdminProps) {
  // Login states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaSid, setCaptchaSid] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const loadCaptcha = async () => {
    try {
      const res = await fetch('/api/admin/captcha');
      const data = await res.json();
      if (data.success) {
        setCaptchaQuestion(data.question);
        setCaptchaSid(data.captchaSid);
      }
    } catch (err) {
      console.error("Failed to load admin login CAPTCHA:", err);
    }
  };

  useEffect(() => {
    if (!isAdminLoggedIn) {
      loadCaptcha();
    }
  }, [isAdminLoggedIn]);

  // App list states
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filtering & Search
  const [search, setSearch] = useState('');
  const [filterVisaType, setFilterVisaType] = useState('all');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all');
  const [filterAppStatus, setFilterAppStatus] = useState('all');

  // Active review modal state
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);

  // Stats calculation counters
  const [totalFinancedAmount, setTotalFinancedAmount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Payments verification proofs lists
  const [payments, setPayments] = useState<any[]>([]);
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      const pRes = await fetch('/api/admin/payments', {
        headers: {
          'Authorization': 'Bearer ' + (safeLocalStorage.getItem('ksa_admin_token') || '')
        }
      });
      const pData = await pRes.json();
      if (pData.success && pData.payments) {
        setPayments(pData.payments);
      }
    } catch (err) {
      console.error("Error loading transaction proofs inside admin:", err);
    }
  };

  // Fetch from Express REST API
  const fetchApplicationsData = async () => {
    setIsLoading(true);
    try {
      // Build search params
      const queryParams = new URLSearchParams({
        q: search,
        visaType: filterVisaType,
        paymentStatus: filterPaymentStatus,
        applicationStatus: filterAppStatus
      });

      const res = await fetch(`/api/applications?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success && data.applications) {
        setApps(data.applications);
        
        // Calculate core totals on-the-fly
        let totalCash = 0;
        let approved = 0;
        let pending = 0;

        data.applications.forEach((a: Application) => {
          if (a.paymentStatus === 'paid') totalCash += a.totalFee;
          if (a.applicationStatus === 'approved') approved++;
          if (a.applicationStatus === 'processing' || a.applicationStatus === 'submitted') pending++;
        });

        setTotalFinancedAmount(totalCash);
        setApprovedCount(approved);
        setPendingCount(pending);
      }

      // Also fetch payments ledger for manual wire slip tracking
      await fetchPayments();

    } catch (err) {
      console.error("Express data fetch error inside admin:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Run on filters or search modification
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchApplicationsData();
    }
  }, [isAdminLoggedIn, filterVisaType, filterPaymentStatus, filterAppStatus]);

  // Handle Search Trigger
  const handleSearchTrigger = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplicationsData();
  };

  // Handler for Admin Login auth
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username, password, captchaSid, captchaAnswer })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Administrative validation error.");
      }
      
      safeLocalStorage.setItem('ksa_admin_token', data.token);
      onLoginSuccess();
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials combination specified.");
      loadCaptcha();
      setCaptchaAnswer('');
    }
  };

  // PUT: Update Application status on backend
  const handleStatusUpdate = async (applicationId: string, payload: { applicationStatus?: ApplicationStatus; paymentStatus?: PaymentStatus }) => {
    setUpdatingAppId(applicationId);
    try {
      const res = await fetch('/api/application/status', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (safeLocalStorage.getItem('ksa_admin_token') || '')
        },
        body: JSON.stringify({ applicationId, ...payload })
      });

      const data = await res.json();
      if (data.success) {
        // Trigger rapid re-draw of states
        await fetchApplicationsData();
        
        // Update selected application modal if active
        if (selectedApp && selectedApp.applicationId === applicationId) {
          setSelectedApp(prev => prev ? { ...prev, ...payload } : null);
        }
      } else {
        alert(data.error || "Failed secure status adjustment policy.");
      }
    } catch (err) {
      console.error("Status modify failed:", err);
    } finally {
      setUpdatingAppId(null);
    }
  };

  // PUT: Admin approves or rejects manual bank transfer with one-click
  const handleReviewManualPayment = async (applicationId: string, status: 'approved' | 'rejected') => {
    setUpdatingAppId(applicationId);
    try {
      const res = await fetch('/api/admin/verify-payment', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (safeLocalStorage.getItem('ksa_admin_token') || '')
        },
        body: JSON.stringify({ applicationId, status })
      });

      const data = await res.json();
      if (data.success) {
        // Trigger rapid re-draw of states
        await fetchApplicationsData();
        
        if (selectedApp && selectedApp.applicationId === applicationId) {
          setSelectedApp(data.application || null);
        }
      } else {
        alert(data.error || "Failed to resolve bank verification checkout review.");
      }
    } catch (err) {
      console.error("Manual payment verification error:", err);
    } finally {
      setUpdatingAppId(null);
    }
  };

  // If unauthorized view login page
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-slate-900 text-white rounded-2xl mb-4">
              <Landmark size={28} className="stroke-[2.5]" />
            </div>
            <h2 className="font-display text-2xl font-extrabold text-slate-950">Consular Control Portal</h2>
            <p className="text-slate-400 mt-1.5 text-xs text-slate-500 font-sans">
              Enter secure administrative credentials below to coordinate active visa application queues list.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-800 border border-red-100 rounded-xl text-xs font-semibold flex items-center gap-1.5">
                <ShieldAlert size={14} />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex flex-col space-y-1">
              <label htmlFor="admin_user" className="text-xs font-bold text-slate-700">Administrator Username</label>
              <input
                id="admin_user"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 text-sm font-semibold"
                required
              />
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="admin_pass" className="text-xs font-bold text-slate-700">Administrative Password</label>
              <input
                id="admin_pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="e.g. admin-secret-2026"
                className="px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-hidden focus:border-slate-900 text-sm font-semibold"
                required
              />
            </div>

            {captchaQuestion && (
              <div className="flex flex-col space-y-1 mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex justify-between items-center mb-1 bg-transparent">
                  <span className="text-[10px] font-bold text-slate-700">Security Challenge (CAPTCHA)</span>
                  <button 
                    type="button" 
                    onClick={loadCaptcha}
                    className="text-[10px] text-teal-700 hover:underline font-bold flex items-center gap-1 cursor-pointer bg-transparent border-0"
                  >
                    <RefreshCw size={10} /> Reload
                  </button>
                </div>
                <p className="text-xs text-slate-650 font-bold mb-1">{captchaQuestion}</p>
                <input
                  type="text"
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  placeholder="Enter result..."
                  className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-900 text-xs font-semibold bg-white"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl transition-colors text-xs uppercase tracking-widest cursor-pointer shadow-md mt-6"
            >
              Verify Credentials
            </button>
          </form>

          {/* Quick tip notes */}
          <div className="mt-8 border-t border-slate-100 pt-5 text-center">
            <p className="text-[10px] text-slate-400 font-mono italic">
              * Seed credentials: (admin@ksavisa.com / KsaAdmin2026)
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 py-10 font-sans min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Dashboard Banner */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">Consular Operations Desk</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">Managing persistent KSA application filings. Connected via SQLite-JSON file-db.</p>
          </div>
          <button 
            onClick={fetchApplicationsData}
            disabled={isLoading}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold py-3 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-xs flex items-center space-x-2"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Force Sync Db</span>
          </button>
        </div>

        {/* Bento Grid Stats Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] block">TOTAL REGISTRATIONS</span>
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 block mt-1">{apps.length}</span>
            <span className="text-[10px] text-slate-450 block mt-1.5 font-mono">Sync state: 100% OK</span>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <span className="text-slate-500 font-bold uppercase tracking-widest text-[10px] block">TOTAL CAPTURED CAPITALS</span>
            <span className="font-display text-2xl sm:text-3xl font-black text-emerald-700 block mt-1">${totalFinancedAmount} <span className="text-[10px] text-slate-400 font-semibold font-mono">USD</span></span>
            <span className="text-[10px] text-emerald-600 block mt-1.5 font-mono">Stripe + PayPal sandbox</span>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] block">APPROVED ISSUANCE</span>
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 block mt-1">{approvedCount}</span>
            <span className="text-[10px] text-slate-450 block mt-1.5 font-mono">
              Approval Rate: {apps.length > 0 ? ((approvedCount / apps.length) * 100).toFixed(0) : 0}%
            </span>
          </div>
          {/* Card 4 */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
            <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] block">AWAITING FILINGS</span>
            <span className="font-display text-2xl sm:text-3xl font-black text-slate-900 block mt-1">{pendingCount}</span>
            <span className="text-[10px] text-amber-600 block mt-1.5 font-mono">Pending consular checks</span>
          </div>
        </div>

        {/* Pending Bank Transfer Verification Panel */}
        {apps.filter(a => a.paymentStatus === 'pending_verification').length > 0 && (
          <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-md mb-8 animate-fade-in" id="payment-verification-panel">
            <h2 className="font-display text-base font-bold text-teal-900 flex items-center gap-2 mb-4">
              <Landmark size={18} className="text-teal-600 animate-pulse" />
              <span>Pending Bank Transfer Verifications ({apps.filter(a => a.paymentStatus === 'pending_verification').length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.filter(a => a.paymentStatus === 'pending_verification').map((a) => {
                const imgProof = payments.find(p => p.applicationId === a.applicationId)?.paymentProof || '';
                return (
                  <div key={a.applicationId} className="border border-teal-50 bg-teal-50/5 p-4 rounded-2xl flex flex-col justify-between font-sans text-xs">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-slate-800 text-sm">{a.fullName}</span>
                          <span className="block font-mono text-[10px] text-slate-400 mt-0.5">App ID: {a.applicationId}</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-100 px-2.5 py-1 rounded-lg">
                          ${a.totalFee} USD
                        </span>
                      </div>
                      <div className="text-slate-500 space-y-1 leading-normal">
                        <div><strong>Passport No:</strong> {a.passportNo}</div>
                        <div><strong>Category:</strong> {a.visaType.toUpperCase()}</div>
                        <div><strong>Requested On:</strong> {new Date(a.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-150/50">
                      {imgProof ? (
                        <button
                          onClick={() => setViewingReceiptUrl(imgProof)}
                          className="flex-1 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[10px] font-bold rounded-lg transition-all cursor-pointer text-center"
                        >
                          View Receipt Proof
                        </button>
                      ) : (
                        <span className="flex-1 text-center py-1.5 text-slate-400 text-[10px] italic">
                          No receipt attached
                        </span>
                      )}

                      <button
                        onClick={() => handleReviewManualPayment(a.applicationId, 'approved')}
                        disabled={updatingAppId === a.applicationId}
                        className="py-1.5 px-3 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => handleReviewManualPayment(a.applicationId, 'rejected')}
                        disabled={updatingAppId === a.applicationId}
                        className="py-1.5 px-3 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white text-[10px] font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtering & Listing Controls */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs mb-8">
          <form onSubmit={handleSearchTrigger} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-6">
            {/* Search Input */}
            <div className="md:col-span-4 flex flex-col space-y-1">
              <label htmlFor="search_input" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Search Keywords</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  <Search size={15} />
                </span>
                <input
                  id="search_input"
                  type="text"
                  placeholder="ID, passport, email, name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden text-xs font-semibold"
                />
              </div>
            </div>

            {/* Filter Visa */}
            <div className="md:col-span-2 flex flex-col space-y-1">
              <label htmlFor="visa_filter" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Visa Category</label>
              <select
                id="visa_filter"
                value={filterVisaType}
                onChange={(e) => setFilterVisaType(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Categories</option>
                <option value="tourist">Tourist eVisa</option>
                <option value="transit">Transit Stopover</option>
                <option value="hajj-umrah">Hajj / Umrah</option>
                <option value="work">Employment</option>
                <option value="student">Student</option>
                <option value="diplomatic">Diplomatic</option>
              </select>
            </div>

            {/* Filter Payment */}
            <div className="md:col-span-2 flex flex-col space-y-1">
              <label htmlFor="payment_filter" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Payment State</label>
              <select
                id="payment_filter"
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Awaiting Payment</option>
                <option value="pending_verification">Reviewing Transfer</option>
                <option value="draft">Draft (Unpaid)</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            {/* Filter Status */}
            <div className="md:col-span-2 flex flex-col space-y-1">
              <label htmlFor="status_filter" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Immigration State</label>
              <select
                id="status_filter"
                value={filterAppStatus}
                onChange={(e) => setFilterAppStatus(e.target.value)}
                className="py-2 px-3 border border-slate-200 rounded-xl bg-white text-xs font-semibold cursor-pointer focus:outline-hidden"
              >
                <option value="all">All Progress</option>
                <option value="submitted">Submitted</option>
                <option value="processing">Processing</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Trigger Button */}
            <div className="md:col-span-2">
              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </form>

          {/* Table list */}
          <div className="overflow-x-auto border border-slate-100 rounded-2xl">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-450 uppercase font-mono text-[9px] font-extrabold border-b border-slate-100 tracking-wider">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Main Applicant</th>
                  <th className="py-3 px-4">Visa Category</th>
                  <th className="py-3 px-3 text-center">Applicants</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4">Application Status</th>
                  <th className="py-3 px-4 text-center">Invoiced Fee</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.length > 0 ? (
                  apps.map((appItem) => (
                    <tr key={appItem.applicationId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/20">
                      
                      {/* App ID */}
                      <td className="py-4 px-4 font-mono font-bold text-slate-900 leading-none select-all">{appItem.applicationId}</td>
                      
                      {/* Client */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{appItem.fullName}</div>
                        <div className="text-slate-400 text-[10px] tracking-wide mt-0.5 select-all">{appItem.passportNo} • {appItem.email}</div>
                      </td>

                      {/* Visa Category */}
                      <td className="py-4 px-4 font-semibold text-slate-700 uppercase font-mono text-[10px]">{appItem.visaType}</td>

                      {/* Number */}
                      <td className="py-4 px-3 text-center font-mono font-semibold text-slate-650">{appItem.numberOfApplicants}</td>

                      {/* Payment Status Dropdown / Action */}
                      <td className="py-4 px-4">
                        {updatingAppId === appItem.applicationId ? (
                          <Loader2 size={13} className="animate-spin text-slate-400" />
                        ) : (
                          <select
                            value={appItem.paymentStatus}
                            onChange={(e) => handleStatusUpdate(appItem.applicationId, { paymentStatus: e.target.value as PaymentStatus })}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer focus:outline-hidden ${
                              appItem.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                              appItem.paymentStatus === 'pending_verification' ? 'bg-teal-50 text-teal-800 border border-teal-150 animate-pulse' :
                              appItem.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-800 border border-amber-150' :
                              appItem.paymentStatus === 'draft' ? 'bg-zinc-100 text-zinc-700 border border-zinc-200' :
                              'bg-red-50 text-red-800 border border-red-150'
                            }`}
                          >
                            <option value="draft">Draft</option>
                            <option value="pending">Pending</option>
                            <option value="pending_verification">Verification</option>
                            <option value="paid">Paid</option>
                            <option value="failed">Failed</option>
                          </select>
                        )}
                      </td>

                      {/* Application Status Dropdown */}
                      <td className="py-4 px-4">
                        {updatingAppId === appItem.applicationId ? (
                          <Loader2 size={13} className="animate-spin text-slate-400" />
                        ) : (
                          <select
                            value={appItem.applicationStatus}
                            onChange={(e) => handleStatusUpdate(appItem.applicationId, { applicationStatus: e.target.value as ApplicationStatus })}
                            className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase cursor-pointer focus:outline-hidden ${
                              appItem.applicationStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' : 
                              appItem.applicationStatus === 'rejected' ? 'bg-red-100 text-red-800' : 
                              appItem.applicationStatus === 'processing' ? 'bg-amber-50 text-amber-800' : 
                              'bg-slate-100 text-slate-700'
                            }`}
                          >
                            <option value="submitted">Submitted</option>
                            <option value="processing">Processing</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        )}
                      </td>

                      {/* Fee */}
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-900">${appItem.totalFee}</td>

                      {/* Launch view modal details info page */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => setSelectedApp(appItem)}
                          className="p-1 px-2 border border-slate-200 rounded-md text-slate-600 hover:text-emerald-700 hover:border-emerald-600/30 font-bold transition-all text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={12} />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400 font-mono">
                      {isLoading ? "Reading application logs..." : "No Application records match filters."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* INSPECT DETAIL MODAL BANNER */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-xs font-sans">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-50">
              <div>
                <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">BIOMETRIC INSPECTOR TOOL</span>
                <span className="block font-display text-xl font-bold text-slate-900 mt-1">{selectedApp.fullName}</span>
                <span className="block font-mono text-[10px] text-slate-500 mt-0.5">ID: {selectedApp.applicationId}</span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-lg hover:bg-slate-100 font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            {/* Application content */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-sans leading-relaxed">
              <div>
                <strong className="block text-slate-400 text-[10px] uppercase">Draft Registration details:</strong>
                <ul className="space-y-1.5 pt-2 text-slate-700">
                  <li><strong>Visa:</strong> {selectedApp.visaType.toUpperCase()}</li>
                  <li><strong>Party size:</strong> {selectedApp.numberOfApplicants} applicant(s)</li>
                  <li><strong>Nationality:</strong> {selectedApp.nationality}</li>
                  <li><strong>Phone:</strong> {selectedApp.phone}</li>
                  <li><strong>Passport No:</strong> {selectedApp.passportNo}</li>
                  <li><strong>Date of Birth:</strong> {selectedApp.dob}</li>
                  <li><strong>Current location:</strong> {selectedApp.address}</li>
                </ul>
              </div>

              <div>
                <strong className="block text-slate-400 text-[10px] uppercase">Checkout Settlement:</strong>
                <ul className="space-y-1.5 pt-2 text-slate-700">
                  <li><strong>Grand Fee:</strong> ${selectedApp.totalFee} USD</li>
                  <li><strong>Payment Method:</strong> {selectedApp.paymentMethod || "Hold/None"}</li>
                  <li><strong>Payment Status:</strong> {selectedApp.paymentStatus.toUpperCase()}</li>
                  <li><strong>Transaction ID:</strong> {selectedApp.transactionId || "None"}</li>
                  <li><strong>Created:</strong> {new Date(selectedApp.createdAt).toLocaleString()}</li>
                </ul>
              </div>
            </div>

            {/* Documents preview blocks */}
            {selectedApp.passportScan || selectedApp.photo ? (
              <div className="border-t border-slate-50 pt-6">
                <strong className="block text-slate-400 text-[10px] uppercase mb-4">Biomedical uploads:</strong>
                <div className="grid grid-cols-2 gap-6">
                  {/* Passport scan preview */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-600 mb-2">Passport Page Bio:</span>
                    {selectedApp.passportScan.startsWith('data:image/') ? (
                      <img
                        src={selectedApp.passportScan}
                        alt="Passport Bio"
                        className="w-full h-32 object-contain border border-slate-150 rounded-xl bg-slate-50 p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : selectedApp.passportScan ? (
                      <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 text-center text-xs font-semibold text-slate-600 truncate max-w-[200px]" title="Receipt/PDF data">
                        📎 PDF Bio Scan Link
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No biographical scan uploaded</span>
                    )}
                  </div>

                  {/* Photograph preview */}
                  <div>
                    <span className="block text-[10px] font-bold text-slate-600 mb-2">Applicant portrait:</span>
                    {selectedApp.photo.startsWith('data:image/') ? (
                      <img
                        src={selectedApp.photo}
                        alt="Portrait scan"
                        className="w-full h-32 object-contain border border-slate-150 rounded-xl bg-slate-50 p-1"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">No portrait image uploaded</span>
                    )}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Quick action checklist toggler inside inspection */}
            <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row gap-3.5 justify-end">
              <button
                onClick={() => handleStatusUpdate(selectedApp.applicationId, { applicationStatus: 'approved' })}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Approve & Dispatch PDF Email
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedApp.applicationId, { applicationStatus: 'rejected' })}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Reject / Consular Hold
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Lightbox receipt verification overlay */}
      {viewingReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex flex-col items-center justify-center p-4 backdrop-blur-xs font-sans">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-2 pt-1 border-b border-slate-55">
              <span className="font-bold text-sm text-slate-900 font-display">Wire Transfer Slip Preview</span>
              <button
                onClick={() => setViewingReceiptUrl(null)}
                className="text-slate-400 hover:text-slate-900 p-1 rounded-md text-xs font-bold font-mono cursor-pointer"
              >
                ✕ CLOSE
              </button>
            </div>
            <img
              src={viewingReceiptUrl}
              alt="Bank Transfer Proof Receipt"
              className="w-full max-h-[60vh] object-contain rounded-xl bg-slate-50 border border-slate-100 p-1"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
}
