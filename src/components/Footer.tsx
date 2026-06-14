import React from 'react';
import { Landmark, Mail, Phone, MapPin, MessageCircle, ArrowUpRight } from 'lucide-react';
import { VISA_TYPES } from '../utils/visaData';

interface FooterProps {
  navigate: (path: string) => void;
}

export default function Footer({ navigate }: FooterProps) {
  const currentYear = new Date().getFullYear();

  // Floating WhatsApp handler
  const openWhatsApp = () => {
    const phoneNumber = "966500000000"; // Sample Saudi WhatsApp helper line
    const text = encodeURIComponent("Hello KSA Visa Services assistance, I would like to inquire about the Saudi Arabia eVisa online application and document processing.");
    window.open(`https://wa.me/${phoneNumber}?text=${text}`, '_blank');
  };

  return (
    <footer className="relative bg-slate-950 text-slate-300 border-t border-slate-900 overflow-hidden" id="page_footer">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none" />

      {/* Primary Footer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12 border-b border-slate-900">
          {/* Column 1: Brand & Bio */}
          <div className="flex flex-col space-y-5">
            <div className="flex items-center space-x-2.5">
              <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center">
                <Landmark size={20} className="stroke-[2.5]" />
              </div>
              <div>
                <span className="block font-display text-lg font-bold text-white tracking-tight">KSA VISA</span>
                <span className="block text-[10px] font-semibold text-emerald-500 uppercase tracking-widest leading-none mt-0.5">Services</span>
              </div>
            </div>
            
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              A private professional travel intelligence and visa facilitation agency dedicated to simplifying electronic and physical visa issuance for visitors to the Kingdom of Saudi Arabia.
            </p>

            {/* Certifications & Badges */}
            <div className="flex items-center space-x-3 pt-2">
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2.5 py-1.5 rounded-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                256-Bit SSL Secured
              </span>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 font-mono px-2.5 py-1.5 rounded-md">
                Stripe verified
              </span>
            </div>
          </div>

          {/* Column 2: Visa Services */}
          <div>
            <h3 className="font-display text-sm font-bold text-white tracking-wider uppercase mb-5">Saudi Visas</h3>
            <ul className="space-y-3 text-sm">
              {VISA_TYPES.map((visa) => (
                <li key={visa.id}>
                  <button 
                    onClick={() => navigate(`/visa/${visa.id}`)}
                    className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-left block w-full py-0.5"
                  >
                    {visa.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h3 className="font-display text-sm font-bold text-white tracking-wider uppercase mb-5">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <button 
                  onClick={() => navigate('/saudi-evisa')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-left block py-0.5"
                >
                  Saudi eVisa Guide
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/visa-requirements')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-left block py-0.5"
                >
                  Documents & Steps
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/faq')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-left block py-0.5"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/blog')}
                  className="text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer text-left block py-0.5"
                >
                  Latest News & Articles
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/apply?mode=status')}
                  className="text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer py-0.5"
                >
                  Track Application Status <ArrowUpRight size={14} />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Support */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-display text-sm font-bold text-white tracking-wider uppercase mb-1">Direct Support</h3>
            
            <p className="text-xs text-slate-400">
              Need immediate assistance? Our visa officers are online 24/7.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <Mail size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-slate-400 hover:text-white break-all select-all font-mono text-xs">
                  support@ksavisa.com
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <Phone size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-slate-400 font-mono text-xs">
                  +966 11 440 9283
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin size={16} className="text-emerald-500 mt-1 flex-shrink-0" />
                <span className="text-xs text-slate-400 leading-relaxed font-sans">
                  King Fahd Branch Rd, Al Rahmaniyyah, Riyadh 12341, Saudi Arabia
                </span>
              </div>
            </div>

            {/* Live WhatsApp Button */}
            <button
              onClick={openWhatsApp}
              className="mt-2 text-left self-start bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center space-x-2 transition-all cursor-pointer shadow-md shadow-emerald-600/10"
            >
              <MessageCircle size={15} />
              <span>WhatsApp Live Help</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Declarations & Disclaimer */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 space-y-4 md:space-y-0 text-center md:text-left">
          <div className="space-y-1.5 md:max-w-xl">
            <p>© {currentYear} KSA Visa Services. All rights reserved.</p>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              <strong>Disclaimer:</strong> KSA Visa Services is a professional private visa filing service provider. We are not affiliated with the government of Saudi Arabia (the Ministry of Foreign Affairs, MOFA) or any embassy. Applications can be submitted directly through the official Saudi government channels, where official consulate fees are charged without our agency consultation and expedited processing costs.
            </p>
          </div>

          <div className="flex space-x-4 text-slate-400">
            <button onClick={() => navigate('/faq')} className="hover:text-emerald-400 cursor-pointer">Terms of Service</button>
            <span>•</span>
            <button onClick={() => navigate('/faq')} className="hover:text-emerald-400 cursor-pointer">Privacy Charter</button>
          </div>
        </div>
      </div>

      {/* Floating Sticky Live WhatsApp Button widget on bottom-right */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={openWhatsApp}
          className="bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 group cursor-pointer border-2 border-white/20"
          title="Direct WhatsApp Support"
          id="whatsapp-floating-widget"
        >
          <MessageCircle size={26} className="fill-white/10 group-hover:rotate-6 transition-transform" />
          <span className="absolute right-14 bg-emerald-600 text-white font-sans text-xs font-bold px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xl border border-emerald-500">
            Chat 24/7 with Visa Support
          </span>
        </button>
      </div>
    </footer>
  );
}
