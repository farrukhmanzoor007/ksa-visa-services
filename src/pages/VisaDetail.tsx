import React from 'react';
import { ShieldCheck, Calendar, Clock, Landmark, ArrowRight, UserCheck, FileText, Info } from 'lucide-react';
import { VISA_TYPES } from '../utils/visaData';
import { VisaCategory } from '../types';

interface VisaDetailProps {
  visaId: string;
  navigate: (path: string) => void;
}

export default function VisaDetail({ visaId, navigate }: VisaDetailProps) {
  // Find matched visa details
  const visa = VISA_TYPES.find(v => v.id === visaId) || VISA_TYPES[0];

  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans" id={`visa_detail_page_${visa.id}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-xs text-slate-400 mb-6 font-mono uppercase tracking-wider">
          <button onClick={() => navigate('/')} className="hover:text-emerald-600 cursor-pointer">KSA Services</button>
          <span>/</span>
          <span className="text-slate-600 font-semibold">{visa.name}</span>
        </div>

        {/* Hero Plate */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-10 shadow-md mb-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-emerald-500/5 rounded-full blur-[80px]" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            <div className="md:col-span-8 space-y-4">
              <span className="text-xs font-bold font-mono text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg inline-block">
                Consular Fee: ${visa.feeUsd} USD
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                {visa.title} Details
              </h1>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-sans">
                {visa.description}
              </p>
            </div>

            <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-4">
              <button
                onClick={() => navigate(`/apply?visa=${visa.id}`)}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-4 px-6 rounded-2xl text-center text-sm md:text-base cursor-pointer shadow-lg shadow-emerald-700/10 transition-colors flex items-center justify-center gap-2 border border-emerald-800"
              >
                <span>Apply Online For This Visa</span>
                <ArrowRight size={18} />
              </button>
              
              <button
                onClick={() => window.open('https://wa.me/966500000000', '_blank')}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-4 px-6 rounded-2xl text-center text-sm md:text-base cursor-pointer transition-colors"
              >
                Inquire via WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Configuration Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Detailed requirements tables (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Quick specifications grid */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-6">Consular Boundaries & Processing Rules</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-sans">
                <div className="pb-4 sm:pb-0 border-b sm:border-b-0 sm:border-r border-slate-100 pr-4">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Clock size={14} className="text-emerald-600" />
                    <span>Processing Window</span>
                  </div>
                  <span className="block text-base font-bold text-slate-900">{visa.processingTime}</span>
                  <span className="block text-[10px] text-slate-400 mt-1">Typical business days timeline</span>
                </div>

                <div className="pb-4 sm:pb-0 border-b sm:border-b-0 sm:border-r border-slate-100 px-0 sm:px-4">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Calendar size={14} className="text-emerald-600" />
                    <span>Validity Period</span>
                  </div>
                  <span className="block text-base font-bold text-slate-900">{visa.validity}</span>
                  <span className="block text-[10px] text-slate-400 mt-1">Starting from issuance stamp</span>
                </div>

                <div className="pt-4 sm:pt-0 pl-0 sm:pl-4">
                  <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    <Landmark size={14} className="text-emerald-600" />
                    <span>Entries Handled</span>
                  </div>
                  <span className="block text-base font-bold text-slate-900">{visa.entries}</span>
                  <span className="block text-[10px] text-slate-400 mt-1">Consular entry definitions</span>
                </div>
              </div>
            </div>

            {/* Checklists for required documents */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <FileText size={20} className="text-emerald-600" />
                <span>Required Documents Checklist</span>
              </h2>
              <p className="text-xs text-slate-400 mb-6">Ensure all files are prepared in PDF, JPG, or PNG format before initiating uploads</p>
              
              <div className="space-y-4 font-sans text-xs sm:text-sm text-slate-700">
                {visa.requiredDocuments.map((doc, idx) => (
                  <div key={idx} className="flex items-start space-x-3.5 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed font-semibold">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eligibility standards */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs font-sans">
              <h2 className="font-display text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-emerald-600" />
                <span>Target Eligibility Criteria</span>
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-sans p-4 bg-emerald-50/20 border border-emerald-600/10 rounded-xl">
                {visa.eligibility}
              </p>
            </div>

          </div>

          {/* Guidelines Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Payment security info */}
            <div className="bg-slate-950 text-white rounded-2xl p-6 border border-slate-900 shadow-md">
              <h3 className="font-display text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Portal Payment Info</h3>
              
              <div className="space-y-4 text-xs text-slate-400 leading-relaxed font-sans">
                <p>
                  Consular processing fees must be paid in full to lock draft registrations. We support international payment methods:
                </p>
                
                <ul className="space-y-2 text-slate-300 font-semibold pl-1">
                  <li className="flex items-center gap-1.5 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Stripe Credit Card</li>
                  <li className="flex items-center gap-1.5 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> PayPal Gateway</li>
                  <li className="flex items-center gap-1.5 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Manual Bank Transfer</li>
                </ul>

                <p className="text-[10px] text-slate-500 italic mt-4">
                  * Stripe payments allow instantaneous filing queues. Manual bank transfers must be corroborated by uploaded receipts, checked and approved manually by administrators.
                </p>
              </div>
            </div>

            {/* Assistance Helpline Box */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs font-sans">
              <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Immigration Warnings</h3>
              
              <div className="space-y-3.5 text-xs text-slate-500 leading-relaxed">
                <div className="flex items-start gap-1.5">
                  <Info size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Tourist and Transit visa types strictly disallow regular native employment in Saudi companies or institutions.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <Info size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>Performing Hajj rituals under tourist eVisa is illegal and results in heavy compound fines and potential deportation bans.</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
