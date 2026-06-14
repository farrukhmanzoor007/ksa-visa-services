import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQProps {
  navigate: (path: string) => void;
}

export default function FAQ({ navigate }: FAQProps) {
  const [search, setSearch] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: "Is there a Visa on Arrival available in Saudi Arabia?",
      a: "While Saudi Arabia has announced Visa on Arrival for passports of restricted wealthy nations (US, UK, Schengen holders with specific airlines), it is highly prone to boarding denials by commercial airlines because airline check-in gates must verify a pre-linked visa token. Pre-filing your Saudi eVisa online 48-72 hours beforehand guarantees frictionless boarding with 100% security."
    },
    {
      q: "Can I extend my Saudi Tourist eVisa beyond 90 days?",
      a: "No. The tourist eVisa allows multiple entries for 365 days, but each individual stay cannot exceed 90 days, and the sum of all stays cannot surpass 90 days total per year. It is strictly non-extendable inside the country. Overstaying is a serious immigration violation resulting in a fine of SAR 100 per day, eventual deportation, and future entry exclusion."
    },
    {
      q: "Can I perform Umrah with a Tourist eVisa?",
      a: "Yes! Any holder of a valid Tourist eVisa is authorized to perform Umrah and visit the Prophet's Mosque in Madinah, except during the official Hajj season. There is no longer a strict requirement to hold a designated Umrah pilgrimage visa for general tourist visits."
    },
    {
      q: "How long does it take for electronic visa approval?",
      a: "Most e-Visas filed through our expert review system are approved and issued in 24 to 72 hours. In many high-income applicant cases, it gets issued in as little as 12-14 hours. We recommend submitting at least 3 business days before your scheduled departure."
    },
    {
      q: "Is emergency medical health insurance included in the eVisa fee?",
      a: "Yes. The official consular fee structure includes standard medical and emergency coverage inside the Kingdom of Saudi Arabia provided by local certified insurance providers (like Tawuniya, Bupa Arabia, etc.)."
    },
    {
      q: "Are the visa portal fees refundable if my application is rejected?",
      a: "No. Once an immigration file is submitted and queued inside the Ministry of Foreign Affairs (MOFA) mainframe, the governmental consular processing fees are completely non-refundable regardless of the decision. This is why our manual pre-screener compliance check is so critical to ensure 100% compliance."
    },
    {
      q: "What are the passport specifications for application uploads?",
      a: "Your passport must have at least 6 months validity remaining from your projected date of entry into Saudi Arabia. It must be an official passport (not emergency passports, diplomatic or refugee travel certificates, unless applying for designated special missions)."
    }
  ];

  const filteredFaqs = faqs.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans" id="faq_faq_page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-4 border border-emerald-100">
            <HelpCircle size={28} />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 mb-3">
            Frequently Asked Questions (FAQ)
          </h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto leading-relaxed">
            Find immediate answers regarding eligibility thresholds, validity exceptions, pilgrim regulations, and governmental fees.
          </p>
        </div>

        {/* Live Filter Bar */}
        <div className="mb-8 relative max-w-xl mx-auto">
          <input
            type="text"
            placeholder="Search questions or keywords... (e.g., Umrah, extend)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 bg-white rounded-xl shadow-xs focus:outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/10 text-sm"
          />
        </div>

        {/* Accordion Component */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div key={index} className="border-b border-slate-50 last:border-0">
                  <button
                    onClick={() => toggleAccordion(index)}
                    className="w-full text-left px-6 py-5 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-colors cursor-pointer"
                  >
                    <span className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{faq.q}</span>
                    <span className="text-slate-400 flex-shrink-0 ml-4">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="bg-slate-50 border-t border-slate-50/50"
                      >
                        <p className="px-6 py-5 text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center text-xs text-slate-400 font-mono">
              no matching questions found in database
            </div>
          )}
        </div>

        {/* Banner with Help Hotline link */}
        <div className="mt-12 bg-emerald-900 text-white rounded-2xl p-6 md:p-8 flex flex-col sm:flex-row justify-between items-center gap-6 border border-emerald-800">
          <div>
            <h3 className="font-display font-semibold text-lg text-white mb-2">Still, Need Personal Clarifications?</h3>
            <p className="text-xs text-emerald-200">Our visa officers are online 24 hours a day to assist you live.</p>
          </div>
          <button
            onClick={() => window.open('https://wa.me/966500000000', '_blank')}
            className="bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs py-3 px-5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
          >
            <MessageCircle size={15} />
            <span>Chat On WhatsApp</span>
          </button>
        </div>

      </div>
    </div>
  );
}
