import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, ShieldAlert, Users, CreditCard, Landmark, ArrowRight, UserCheck, HelpCircle, FileCheck2, Loader2 } from 'lucide-react';
import { VISA_TYPES, COUNTRIES_LIST } from '../utils/visaData';
import { VisaCategory } from '../types';

interface ApplicationFormProps {
  initialVisaType?: VisaCategory;
  navigate: (path: string) => void;
}

export default function ApplicationForm({ initialVisaType = 'tourist', navigate }: ApplicationFormProps) {
  // Form values
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [passportNo, setPassportNo] = useState('');
  const [nationality, setNationality] = useState('United States');
  const [dob, setDob] = useState('');
  const [visaType, setVisaType] = useState<VisaCategory>(initialVisaType);
  const [numberOfApplicants, setNumberOfApplicants] = useState(1);
  const [address, setAddress] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Files & File names
  const [passportScan, setPassportScan] = useState<string>('');
  const [passportScanName, setPassportScanName] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [photoName, setPhotoName] = useState('');

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActivePassport, setDragActivePassport] = useState(false);
  const [dragActivePhoto, setDragActivePhoto] = useState(false);

  // Effect to sync initial select value if passed as URL search params
  useEffect(() => {
    if (initialVisaType) {
      setVisaType(initialVisaType);
    }
  }, [initialVisaType]);

  const selectedVisaDetails = VISA_TYPES.find(v => v.id === visaType) || VISA_TYPES[0];
  const calculatedFee = selectedVisaDetails.feeUsd * numberOfApplicants;

  // File validator & encoder (limit: 5MB)
  const processUpload = (file: File, target: 'passport' | 'photo') => {
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [target]: "File exceeds 5MB size limit." }));
      return;
    }

    setErrors(prev => {
      const copy = { ...prev };
      delete copy[target];
      return copy;
    });

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        if (target === 'passport') {
          setPassportScan(reader.result);
          setPassportScanName(file.name);
        } else {
          setPhoto(reader.result);
          setPhotoName(file.name);
        }
      }
    };
    reader.onerror = () => {
      setErrors(prev => ({ ...prev, [target]: "Encoding failed." }));
    };
    reader.readAsDataURL(file);
  };

  // Drag handlers for Passport Dropzone
  const handleDragPassport = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePassport(true);
    } else if (e.type === "dragleave") {
      setDragActivePassport(false);
    }
  };

  const handleDropPassport = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePassport(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0], 'passport');
    }
  };

  // Drag handlers for Photo Dropzone
  const handleDragPhoto = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePhoto(true);
    } else if (e.type === "dragleave") {
      setDragActivePhoto(false);
    }
  };

  const handleDropPhoto = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePhoto(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUpload(e.dataTransfer.files[0], 'photo');
    }
  };

  // Form Validation
  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!fullName.trim()) tempErrors.fullName = "Full legal name is required.";
    console.log(fullName); // silent check

    // Simple email regex validation
    if (!email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = "Invalid structure. e.g. name@domain.com";
    }

    if (!phone.trim()) tempErrors.phone = "Phone number is required.";
    
    if (!passportNo.trim()) {
      tempErrors.passportNo = "Passport number is required.";
    } else if (passportNo.length < 6) {
      tempErrors.passportNo = "Minimum 6 alphanumeric characters.";
    }

    if (!dob) tempErrors.dob = "Birth date is required.";
    
    if (!address.trim()) tempErrors.address = "Present physical address is required.";
    
    if (!agreeTerms) tempErrors.agreeTerms = "Consular legal declaration must be accepted.";

    // Check files
    if (!passportScan) tempErrors.passport = "Digital passport bio page scan is required.";
    if (!photo) tempErrors.photo = "Digital passport physical photograph is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Submit Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // scroll to topmost error
      const element = document.getElementById("validation-alerts-summary");
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
          totalFee: calculatedFee
        })
      });

      const d = await response.json();
      if (!response.ok || d.error) {
        throw new Error(d.error || "Server registration error.");
      }

      console.log("[FORM SUCCESS] App created:", d);
      // Wait briefly then push destination
      setTimeout(() => {
        setIsSubmitting(false);
        navigate(`/payment?appId=${d.application.applicationId}`);
      }, 800);

    } catch (err: any) {
      setIsSubmitting(false);
      setErrors({ server: err.message || "Failed to make file registration. Try again." });
    }
  };

  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress header map */}
        <div className="flex justify-between items-center mb-10 max-w-lg mx-auto font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
          <div className="flex items-center space-x-2 text-emerald-700 font-bold">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] leading-none">1</span>
            <span>INTAKE FORM</span>
          </div>
          <div className="h-0.5 bg-slate-200 flex-1 mx-4" />
          <div className="flex items-center space-x-2">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] leading-none">2</span>
            <span>SECURE CHECKOUT</span>
          </div>
          <div className="h-0.5 bg-slate-200 flex-1 mx-4" />
          <div className="flex items-center space-x-3">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-[10px] leading-none">3</span>
            <span>STATUS</span>
          </div>
        </div>

        {/* Form Body Wrapper Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Fields (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-md">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">Saudi Arabia Online Visa Portal</h1>
            <p className="text-xs sm:text-sm text-slate-500 mb-8 leading-relaxed">
              Complete the consular fields honestly to avoid filing rejection. Standard applications require up to 48 hours to process.
            </p>

            {/* Error alerts banner */}
            {(Object.keys(errors).length > 0) && (
              <div id="validation-alerts-summary" className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-2 text-xs text-red-800 font-medium">
                <ShieldAlert size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="block font-bold mb-1">Please correct the following fields:</span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {Object.values(errors).map((e, idx) => (
                      <li key={idx}>{e}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              
              {/* SECTION I: PRIMARY DATA */}
              <div>
                <span className="block font-display text-xs font-bold text-emerald-700 tracking-wider uppercase mb-4 pb-1.5 border-b border-slate-100">Section I: Personal Credentials</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="full_name" className="text-xs font-bold text-slate-800">Full Legal Name (as written in Passport)</label>
                    <input
                      type="text"
                      id="full_name"
                      placeholder="e.g. John Fitzgerald Kennedy"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="user_email" className="text-xs font-bold text-slate-800">Verified Email Address</label>
                    <input
                      type="text"
                      id="user_email"
                      placeholder="e.g. jfkennedy@whitehouse.gov"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="user_phone" className="text-xs font-bold text-slate-800">Mobile Phone Number (with Country Code)</label>
                    <input
                      type="text"
                      id="user_phone"
                      placeholder="e.g. +1 (555) 321-4402"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="user_dob" className="text-xs font-bold text-slate-800">Date of Birth</label>
                    <input
                      type="date"
                      id="user_dob"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>


              {/* SECTION II: IMMIGRATION */}
              <div>
                <span className="block font-display text-xs font-bold text-emerald-700 tracking-wider uppercase mb-4 pb-1.5 border-b border-slate-100">Section II: Immigration & Selection</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="user_nationality" className="text-xs font-bold text-slate-800">Primary Country of Citizenship</label>
                    <select
                      id="user_nationality"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm cursor-pointer"
                    >
                      {COUNTRIES_LIST.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="user_passport" className="text-xs font-bold text-slate-800">Passport Number</label>
                    <input
                      type="text"
                      id="user_passport"
                      placeholder="e.g. A98213601"
                      value={passportNo}
                      onChange={(e) => setPassportNo(e.target.value.toUpperCase())}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm uppercase tracking-widest font-mono"
                    />
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="select_visatype" className="text-xs font-bold text-slate-800">Saudi Visa Category Selection</label>
                    <select
                      id="select_visatype"
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value as VisaCategory)}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm font-semibold cursor-pointer"
                    >
                      {VISA_TYPES.map((v) => (
                        <option key={v.id} value={v.id}>{v.name} (${v.feeUsd} USD)</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label htmlFor="number_applicants" className="text-xs font-bold text-slate-800">Number of Applicants (Group / Family)</label>
                    <select
                      id="number_applicants"
                      value={numberOfApplicants}
                      onChange={(e) => setNumberOfApplicants(Number(e.target.value))}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl bg-white focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm font-mono cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>{num} Applicant{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 flex flex-col space-y-1.5">
                    <label htmlFor="current_address" className="text-xs font-bold text-slate-800">Present Address in Home Country</label>
                    <textarea
                      id="current_address"
                      placeholder="Street, City, Zip, Country"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="px-3 py-2.5 border border-slate-250 rounded-xl focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/10 text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </div>


              {/* SECTION III: UPLOADS */}
              <div>
                <span className="block font-display text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1 pb-1.5 border-b border-slate-100">Section III: Scanned Bio Records</span>
                <p className="text-[10px] text-slate-400 mb-4">* All uploaded materials are encrypted instantly and destroyed from temporary caches post compilation review.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Passport scan dropzone */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">1. Scanned Passport Bio Page</label>
                    <div
                      onDragEnter={handleDragPassport}
                      onDragOver={handleDragPassport}
                      onDragLeave={handleDragPassport}
                      onDrop={handleDropPassport}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[140px] ${
                        dragActivePassport ? 'border-emerald-500 bg-emerald-50/20' : passportScan ? 'border-emerald-600/30 bg-emerald-50/5' : 'border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50/30'
                      }`}
                      id="dropzone_passport_scan"
                    >
                      <input
                        type="file"
                        id="file_passport"
                        accept="image/*,application/pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) processUpload(e.target.files[0], 'passport');
                        }}
                      />
                      
                      {passportScan ? (
                        <div className="space-y-1 text-xs">
                          <CheckCircle className="text-emerald-600 w-8 h-8 mx-auto" />
                          <p className="font-semibold text-emerald-800 truncate max-w-[180px]">{passportScanName || "Passport uploaded"}</p>
                          <p className="text-[10px] text-slate-400">Click or drag or drop to redefine</p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs text-slate-400">
                          <UploadCloud className="text-slate-300 w-8 h-8 mx-auto" />
                          <p className="text-slate-500 font-semibold leading-tight">Drag & drop profile scan</p>
                          <p className="text-[10px] text-slate-450 leading-none">PDF, JPEG, or PNG (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photo dropzone */}
                  <div>
                    <label className="text-xs font-bold text-slate-800 mb-1.5 block">2. Recent Passport Photo</label>
                    <div
                      onDragEnter={handleDragPhoto}
                      onDragOver={handleDragPhoto}
                      onDragLeave={handleDragPhoto}
                      onDrop={handleDropPhoto}
                      className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors relative flex flex-col items-center justify-center min-h-[140px] ${
                        dragActivePhoto ? 'border-emerald-500 bg-emerald-50/20' : photo ? 'border-emerald-600/30 bg-emerald-50/5' : 'border-slate-200 hover:border-emerald-500/50 hover:bg-slate-50/30'
                      }`}
                      id="dropzone_photo_upload"
                    >
                      <input
                        type="file"
                        id="file_photo"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) processUpload(e.target.files[0], 'photo');
                        }}
                      />
                      
                      {photo ? (
                        <div className="space-y-1 text-xs">
                          <CheckCircle className="text-emerald-600 w-8 h-8 mx-auto" />
                          <p className="font-semibold text-emerald-800 truncate max-w-[180px]">{photoName || "Photo uploaded"}</p>
                          <p className="text-[10px] text-slate-400">Click or drag or drop to redefine</p>
                        </div>
                      ) : (
                        <div className="space-y-1 text-xs text-slate-400">
                          <UploadCloud className="text-slate-300 w-8 h-8 mx-auto" />
                          <p className="text-slate-500 font-semibold leading-tight">Drag & drop portrait image</p>
                          <p className="text-[10px] text-slate-450 leading-none">JPEG or PNG (Max 5MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>


              {/* COMPLIANCE DECLARATION CHECKBOX */}
              <div className="pt-4 border-t border-slate-150">
                <label className="flex items-start space-x-3 text-xs text-slate-500 cursor-pointer hover:text-slate-700 leading-relaxed font-sans select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 rounded-sm text-emerald-600 focus:ring-emerald-500/15"
                  />
                  <span>
                    I hereby declare that all provided biographical and passport specifications strictly conform with actual physical paper records. I authorize KSA Visa Services to coordinate document validations, register details on consulate servers, and manage state payments on my behalf.
                  </span>
                </label>
              </div>


              {/* SUBMIT BUTTON */}
              <div className="pt-4 text-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2.5 cursor-pointer"
                  id="submit_application_button"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Filing with Registry Server ...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit & Proceed to Checkout</span>
                      <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Checkout calculator sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Payment breakdowns */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-md">
              <h3 className="font-display text-sm font-bold tracking-wider uppercase text-slate-300 mb-5 pb-3.5 border-b border-slate-800">Total Price Estimator</h3>
              
              <div className="space-y-4 font-sans text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Consular Fee:</span>
                  <span className="font-semibold text-slate-100">${selectedVisaDetails.feeUsd} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Number of Applicants:</span>
                  <span className="font-semibold text-slate-100">x {numberOfApplicants}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Review, Formatting, Support:</span>
                  <span className="font-semibold text-teal-400">INCLUDED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mandatory Health Insurance:</span>
                  <span className="font-semibold text-teal-400">INCLUDED</span>
                </div>
                
                <div className="border-t border-slate-800 pt-5 mt-4 flex justify-between items-baseline">
                  <span className="font-bold text-sm text-slate-200 uppercase">Estimated Total Cost</span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-emerald-400">${calculatedFee} USD</span>
                </div>
              </div>
            </div>

            {/* Support help guidelines box */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs font-sans">
              <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <FileCheck2 size={16} className="text-emerald-600" />
                <span>Need Direct Assistance?</span>
              </h3>
              
              <ul className="space-y-3.5 text-xs text-slate-500 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>If your files are too large (above 5MB), try reducing scanner resolutions.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Ensure your passport doesn't hold stamp blockings before travel dates.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
