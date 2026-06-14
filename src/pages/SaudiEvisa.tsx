import React, { useState } from 'react';
import { Compass, Globe, CheckCircle, Info, Landmark, HelpCircle, ArrowRight } from 'lucide-react';
import { COUNTRIES_LIST } from '../utils/visaData';

interface SaudiEvisaProps {
  navigate: (path: string) => void;
}

export default function SaudiEvisa({ navigate }: SaudiEvisaProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCountries = COUNTRIES_LIST.filter(c =>
    c.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans" id="saudi_evisa_guide_page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-md mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
          <div className="relative z-10 max-w-3xl">
            <span className="text-xs font-bold font-mono text-emerald-600 uppercase tracking-widest block mb-1">Official Guide</span>
            <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4">
              Saudi Arabia Tourist eVisa Guide
            </h1>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Introduced by the Saudi Commission for Tourism and National Heritage, the electronic visa (eVisa) simplifies travel to Saudi Arabia. It is valid for tourism, leisure, family visits, and performing Umrah at any time of the year (except during the Hajj season).
            </p>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Info Blocks (7 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Validity details */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Compass className="text-emerald-600" size={22} />
                <span>Validity & Stay Period Rules</span>
              </h2>
              <div className="w-8 h-1 bg-emerald-500 rounded-full mb-6" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Visa Validity</span>
                  <span className="block text-lg font-bold text-slate-900 mt-1">1 Year (365 Days)</span>
                  <p className="text-xs text-slate-500 mt-2 font-sans">Starts from the date of electronic issuance. Allows multiple entries.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Maximum Stay Limit</span>
                  <span className="block text-lg font-bold text-slate-900 mt-1">90 Days Total</span>
                  <p className="text-xs text-slate-500 mt-2 font-sans">Max stay per single trip is 90 days. Total cumulative stay must not exceed 90 days within the year.</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-start space-x-3">
                <Info size={18} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-emerald-800 leading-relaxed font-sans">
                  <strong>Important Notice on Overstay:</strong> Staying beyond 90 days in Saudi Arabia without regular extension permission results in heavy daily fines of SAR 100/day, potential biological blacklisting, and future electronic visa denials.
                </p>
              </div>
            </div>

            {/* Eligible Countries List */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                    <Globe className="text-emerald-600" size={22} />
                    <span>Eligible Countries (60+ Nations)</span>
                  </h2>
                  <div className="w-8 h-1 bg-emerald-500 rounded-full mt-2" />
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search your country..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed font-sans">
                Below is a comprehensive database of territories and countries eligible for immediate online eVisa issuance. High-income or standard passport holders of these nations can apply with 100% electronic approvals.
              </p>

              {filteredCountries.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredCountries.map((country, index) => (
                    <div
                      key={index}
                      className="p-3 bg-slate-50 border border-slate-100 rounded-lg hover:border-emerald-600/30 text-xs font-semibold text-slate-700 hover:text-emerald-700 transition-colors flex items-center space-x-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="truncate">{country}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl uppercase tracking-wider font-mono">
                  No matching countries found
                </div>
              )}

              {/* Exception Note */}
              <div className="mt-8 border-t border-slate-50 pt-6">
                <span className="block text-xs font-bold text-slate-900 mb-2">GCC Travelers & Other Passports:</span>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Consular policy exempts GCC citizens (Bahrain, Kuwait, Oman, Qatar, UAE) from visa requirements. If your nation is not in the list, you can still apply and obtain a Saudi Tourist eVisa if you hold a valid commercial, tourist, or student Visa from the USA, UK, or a Schengen zone country, and have visited that country at least once.
                </p>
              </div>
            </div>

          </div>

          {/* Quick Steps & Apply Box (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Applying now helper */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none" />
              
              <h3 className="font-display text-lg font-bold text-white mb-2">Get Started in Minutes</h3>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed font-sans">
                Our team handles file formatting, validation checkers, and electronic filing automatically to deliver rapid results.
              </p>

              <div className="space-y-4 mb-6 text-xs text-slate-300">
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-slate-800 text-emerald-400 w-5 h-5 rounded-md flex items-center justify-center font-bold">1</span>
                  <span>Fill personal data securely</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-slate-800 text-emerald-400 w-5 h-5 rounded-md flex items-center justify-center font-bold">2</span>
                  <span>Upload passport & photos</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="font-mono bg-slate-800 text-emerald-400 w-5 h-5 rounded-md flex items-center justify-center font-bold">3</span>
                  <span>Settle securely online</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/apply?visa=tourist')}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-center text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Apply for Tourist eVisa
              </button>
            </div>

            {/* Direct requirements overview */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
              <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Minimum Requirements</h3>
              
              <ul className="space-y-3.5 text-xs">
                <li className="flex items-start space-x-2">
                  <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 leading-relaxed font-sans">Passport valid for minimum 6 months from entry date.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 leading-relaxed font-sans">Electronic passport scan or detailed high-contrast smartphone photos.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 leading-relaxed font-sans">Digital photo of passport size with solid color canvas background.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-600 leading-relaxed font-sans">Verified email address to receive secure approvals.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
