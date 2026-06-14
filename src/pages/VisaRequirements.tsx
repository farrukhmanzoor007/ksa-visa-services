import React from 'react';
import { FileText, Shield, Sparkles, UploadCloud, Info, CheckCircle2 } from 'lucide-react';
import { VISA_TYPES } from '../utils/visaData';

interface VisaRequirementsProps {
  navigate: (path: string) => void;
}

export default function VisaRequirements({ navigate }: VisaRequirementsProps) {
  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans" id="visa_requirements_page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 mb-12 shadow-md">
          <span className="text-xs font-bold font-mono text-emerald-600 uppercase tracking-widest block mb-1">Standard Checklist</span>
          <h1 className="font-display text-3xl font-bold text-slate-900 mb-3">Verification Steps & Document Requirements</h1>
          <p className="text-slate-500 text-sm max-w-2xl leading-relaxed">
            Ensuring your submitted paperwork meets the exact standards prescribed by the Ministry of Foreign Affairs (MOFA) is key to instant approval. Review specifications below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Steps Section */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
                <Sparkles className="text-emerald-600" size={22} />
                <span>Our 5-Step Streamlined Process</span>
              </h2>

              <div className="relative border-l-2 border-slate-100 pl-6 space-y-8 ml-3">
                
                {/* Step 1 */}
                <div className="relative">
                  <div className="absolute -left-[37px] top-1.5 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <h3 className="font-bold text-slate-900 text-sm">Fill Online Application</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Provide your passport data, personal details, and address inside our secure application form. We save your drafts locally so nothing gets lost.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="relative">
                  <div className="absolute -left-[37px] top-1.5 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <h3 className="font-bold text-slate-900 text-sm">Upload Scans & Digital Photos</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Provide digital images of your passport profile page and a recent photo. Files must be under 5MB in JPEG, PNG, or formats.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="relative">
                  <div className="absolute -left-[37px] top-1.5 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <h3 className="font-bold text-slate-900 text-sm">Secure Payment Settlement</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Pay the consular and processing feeds securely using Stripe credit cards, PayPal or opt for Manual Bank Transfer.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="relative">
                  <div className="absolute -left-[37px] top-1.5 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <h3 className="font-bold text-slate-900 text-sm">Consular Alignment Review</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Our compliance expert evaluates files to verify alignments against Ministry (MOFA) specifications. We correct crop alignments and coordinate spelling matching.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="relative">
                  <div className="absolute -left-[37px] top-1.5 bg-emerald-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <h3 className="font-bold text-slate-900 text-sm">Approval & Email Dispatch</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Once the government issues your digital visa credential, we email the final PDF file immediately. Track progress live here using your Application ID.
                  </p>
                </div>

              </div>
            </div>

            {/* Document upload requirements detail */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <UploadCloud className="text-emerald-600" size={22} />
                <span>Upload Specs (Max 5MB per file)</span>
              </h2>
              <div className="w-8 h-1 bg-emerald-500 rounded-full mb-6" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-slate-50">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Primary Passport Page</h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-1"><span className="text-emerald-600 font-bold">✓</span> Must show the full biographical page including name, birth date, and passport MRZ.</li>
                    <li className="flex items-start gap-1"><span className="text-emerald-600 font-bold">✓</span> No finger/hand overlays or heavy camera glare.</li>
                    <li className="flex items-start gap-1"><span className="text-emerald-600 font-bold">✓</span> Passport machine-readable characters must be legible.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Applicant Digital Photo</h4>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-1"><span className="text-emerald-600 font-bold">✓</span> Taken against a solid color backdrop (white or off-white is best).</li>
                    <li className="flex items-start gap-1"><span className="text-emerald-600 font-bold">✓</span> Formal pose facing directly towards the lens (neutral look).</li>
                    <li className="flex items-start gap-1"><span className="text-emerald-600 font-bold">✓</span> No sunglasses, decorative headbands, or complex filter lenses.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start space-x-3">
                <Info size={16} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Our system allows direct smartphone uploads. Ensure the room has strong natural light so the text on your passport is fully sharp and readable.
                </p>
              </div>
            </div>

          </div>

          {/* Fee Table Box (4 cols) */}
          <div className="lg:col-span-4 spacing-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs relative">
              <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider mb-5">Fees by Visa Category</h3>
              
              <div className="space-y-4">
                {VISA_TYPES.map((v) => (
                  <div key={v.id} className="pb-3 border-b border-slate-100 last:border-0 flex justify-between items-center text-xs">
                    <div>
                      <span className="block font-bold text-slate-800">{v.name}</span>
                      <span className="block text-slate-400 text-[10px] mt-0.5">{v.validity}</span>
                    </div>
                    <span className="font-mono font-bold text-slate-900 bg-slate-50 py-1 px-2.5 rounded-lg border border-slate-100">${v.feeUsd}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <button
                  onClick={() => navigate('/apply')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Start application
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
