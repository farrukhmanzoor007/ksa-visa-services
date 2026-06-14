import React, { useState } from 'react';
import { Landmark, ArrowRight, ShieldCheck, Zap, Activity, Award, Star, Quote, ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { VISA_TYPES } from '../utils/visaData';

interface HomeProps {
  navigate: (path: string) => void;
}

export default function Home({ navigate }: HomeProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Jean-Paul Gautier",
      country: "France",
      role: "Business Traveler",
      rating: 5,
      text: "The Tourist eVisa process was astonishingly fast. I uploaded my passport page and professional photo here and got my PDF approval via email in just over 14 hours! Amazing support on WhatsApp too when I raised a brief concern about spelling check.",
      date: "May 2026"
    },
    {
      name: "Amina Al-Mansoor",
      country: "Canada",
      role: "Umrah Pilgrim",
      rating: 5,
      text: "Booking Umrah visas for my parents was always stressful, with numerous document checks. KSA Visa Services took care of everything seamlessly. The interactive form caught a passport validity error immediately, preventing visa rejection. Highly recommend!",
      date: "April 2026"
    },
    {
      name: "Kenji Takahashi",
      country: "Japan",
      role: "Stopover tourist",
      rating: 5,
      text: "Transit Stopover visa was issued online instantly. I spent my 72 hours in Riyadh and Jeddah without any friction, everything was contactless. Paying with Stripe credit card was secure and clean. Superb agency service.",
      date: "June 2026"
    }
  ];

  const team = [
    {
      name: "Tariq Abdulaziz",
      role: "Chief Executive & Founder",
      bio: "Over 18 years of visa consulate administration experience in Riyadh. Coordinating liaison efforts for pilgrims and trade missions.",
      img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Hassan Al-Saeed",
      role: "Director of Immigration Logistics",
      bio: "Manages direct application filing with the Ministry of Foreign Affairs (MOFA). Expert on multi-national visa policies and work visas.",
      img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200&h=200"
    },
    {
      name: "Noura Al-Sharif",
      role: "Lead Visa Compliance Officer",
      bio: "Ensures all documents and biometric specifications exactly match the Saudi consulate requirements to prevent delays or rejection.",
      img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200"
    }
  ];

  const handleNextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="relative overflow-hidden font-sans" id="homepage_container">
      {/* 1. Hero Section */}
      <section className="relative bg-slate-50 border-b border-gray-100 overflow-hidden pt-12 pb-24 lg:py-28" id="hero_section">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
          <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px]" />
          <div className="absolute -bottom-10 left-[15%] w-[250px] h-[250px] bg-teal-500/10 rounded-full blur-[80px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 flex flex-col space-y-6 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center space-x-1 px-3 py-1.5 bg-emerald-100/50 text-emerald-800 text-xs font-bold uppercase tracking-wider rounded-lg self-center lg:self-start border border-emerald-200/50">
                <ShieldCheck size={14} className="stroke-[2.5]" />
                <span>Authorized Independent Assistance Portal</span>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                Get Your Official <span className="text-emerald-600 underline decoration-emerald-200 decoration-8 font-extrabold">Saudi Arabia Visa</span> Easily
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-sans max-w-2xl mx-auto lg:mx-0">
                Submit your Saudi Arabia eVisa application online, upload scanned passport pages, and process security payments securely. Get expert document checks and approved travel files in 24 - 72 hours.
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => navigate('/apply')}
                  className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-emerald-700/10 transition-all text-base flex items-center justify-center space-x-2 cursor-pointer border border-emerald-800"
                >
                  <span>Apply Online now</span>
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={() => navigate('/saudi-evisa')}
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-800 font-bold px-8 py-4 rounded-xl transition-all text-base flex items-center justify-center space-x-2 cursor-pointer border border-slate-200 shadow-sm"
                >
                  View eVisa requirements
                </button>
              </div>

              {/* Info checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 pt-4 text-left max-w-xl mx-auto lg:mx-0">
                <div className="flex items-center space-x-2 text-sm text-slate-800 font-semibold">
                  <span className="text-emerald-600 text-base font-bold">✓</span>
                  <span>100% Online Process</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-800 font-semibold">
                  <span className="text-emerald-600 text-base font-bold">✓</span>
                  <span>Secure Local DB</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-800 font-semibold">
                  <span className="text-emerald-600 text-base font-bold">✓</span>
                  <span>24/7 Live Support</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Image Mockup Column */}
            <div className="lg:col-span-5 relative mt-6 lg:mt-0">
              <div className="absolute inset-0 bg-radial from-emerald-500/10 to-transparent blur-[60px] rounded-full pointer-events-none" />
              
              <div className="relative bg-white border border-slate-100/80 p-6 sm:p-8 rounded-3xl shadow-2xl overflow-hidden max-w-md mx-auto">
                <div className="flex items-center justify-between mb-5 border-b border-slate-50 pb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-mono text-slate-500 font-semibold">Consular Gate Status: LIVE</span>
                  </div>
                  <span className="text-[10px] bg-slate-900 text-white font-bold py-1 px-2.5 rounded-md uppercase font-mono tracking-wider">
                    UTC 17:54
                  </span>
                </div>

                {/* Form quick estimate tool */}
                <h3 className="font-display text-lg font-bold text-slate-900 mb-2">Calculate Your Visa Fee</h3>
                <p className="text-xs text-slate-500 mb-5">Select a category to see instantaneous costs and validities.</p>

                <div className="space-y-4">
                  {VISA_TYPES.slice(0, 3).map((v) => (
                    <button
                      key={v.id}
                      onClick={() => navigate(`/visa/${v.id}`)}
                      className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-emerald-600/30 hover:bg-emerald-50/20 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">{v.name}</span>
                        <span className="text-[11px] text-slate-400 mt-0.5">{v.validity}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-right">
                        <span className="font-mono text-sm font-bold text-slate-900">${v.feeUsd}</span>
                        <div className="bg-slate-50 group-hover:bg-emerald-100/50 p-1.5 rounded-lg transition-colors">
                          <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-700" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-5 text-center">
                  <button
                    onClick={() => navigate('/apply')}
                    className="w-full text-center text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 py-3 rounded-xl transition-all uppercase tracking-wider"
                  >
                    Start Online application form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Visa Categories Section */}
      <section className="py-20 bg-white" id="visa_categories_grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              Select Your Saudi Arabia Visa Type
            </h2>
            <div className="w-12 h-1 bg-emerald-600 rounded-full mx-auto mt-4 mb-4" />
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Explore dynamic requirements, processing timelines, validity periods, and associated consular fees for different visa subcategories before initiating your online application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {VISA_TYPES.map((visa) => (
              <div
                key={visa.id}
                className="bg-white border border-slate-100 rounded-2xl p-6 relative flex flex-col justify-between interactive-card"
                id={`visa_card_${visa.id}`}
              >
                <div>
                  {/* Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                      {visa.processingTime}
                    </span>
                    <span className="font-mono text-lg font-bold text-slate-900">${visa.feeUsd} <span className="text-[10px] text-slate-400 font-normal">USD</span></span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-slate-900 mb-2">{visa.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4 font-sans line-clamp-2">
                    {visa.description}
                  </p>

                  <div className="border-t border-slate-50 pt-4 pb-4 space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Validity:</span>
                      <span className="font-medium text-slate-800">{visa.validity}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Entries:</span>
                      <span className="font-medium text-slate-800">{visa.entries}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2.5 pt-2 border-t border-slate-50">
                  <button
                    onClick={() => navigate(`/visa/${visa.id}`)}
                    className="flex-1 text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Details & Docs
                  </button>
                  <button
                    onClick={() => navigate(`/apply?visa=${visa.id}`)}
                    className="flex-1 text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why Choose Us Section */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden" id="why_choose_us">
        {/* Glow */}
        <div className="absolute bottom-0 right-[20%] w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Texts */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <span className="text-xs font-bold font-mono tracking-widest text-emerald-400 uppercase">Premium Facilitation Agency</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
                Get Certified Saudi Visa Service In Record Time
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Applying directly to consular systems is complex with strict format restrictions. KSA Visa Services streamlines your journey with digital security, expert translation validation, and dynamic support mechanisms.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 mt-1">
                    <Star size={16} className="fill-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">5.0 Star Agency Average</h4>
                    <p className="text-xs text-slate-400">Over 9,800 international travelers successfully served with seamless approval rates.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 mt-1">
                    <Star size={16} className="fill-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-200">Independent Security Vetting</h4>
                    <p className="text-xs text-slate-400">SSL data routing prevents credit card leaks or documentation exposure.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Pillars Grid */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 1 */}
              <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl flex flex-col space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">Expedited 24h Processing</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Our direct liaison team submits files within minutes of verification, driving rapid electronic processing under 72h.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl flex flex-col space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">Contactless & Cashless</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  No embassy queues or courier risks. Upload digital passport scans and complete payment safely via Stripe or PayPal.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl flex flex-col space-y-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">Compliance Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Every photo and passport biometric is manually cross-checked with Saudi standards to minimize administrative rejections.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-slate-950 border border-slate-800/80 p-6 rounded-2xl flex flex-col space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-100">Live Status Tracking</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Input your application code below or in navbar to track live status updates from standard check, validation, up to approval.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. Testimonials Section (Carousel) */}
      <section className="py-20 bg-slate-50 border-b border-gray-100" id="testimonials_carousel">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold font-mono text-emerald-600 uppercase tracking-widest block mb-2">VERIFIED GLOBAL REVIEWS</span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Trusted by Hundreds of Global Visitors
            </h2>
          </div>

          <div className="relative bg-white border border-slate-100 p-8 sm:p-12 rounded-3xl shadow-xl">
            {/* Absolute quote decoration */}
            <Quote size={80} className="absolute top-4 left-4 text-slate-100 rotate-180 pointer-events-none" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="relative z-10"
              >
                {/* Score */}
                <div className="flex space-x-1 justify-center mb-6">
                  {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 stroke-amber-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-lg text-slate-800 italic text-center leading-relaxed font-sans mb-8">
                  "{testimonials[currentTestimonial].text}"
                </p>

                {/* Author Info */}
                <div className="text-center">
                  <span className="block font-display text-base font-bold text-slate-950">
                    {testimonials[currentTestimonial].name}
                  </span>
                  <span className="block text-xs font-semibold text-emerald-600 mt-1 font-mono uppercase tracking-wider">
                    {testimonials[currentTestimonial].role} • {testimonials[currentTestimonial].country}
                  </span>
                  <span className="block text-[10px] text-slate-400 mt-0.5">{testimonials[currentTestimonial].date}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider navigations */}
            <div className="flex justify-between items-center mt-10 border-t border-slate-50 pt-6">
              <button
                onClick={handlePrevTestimonial}
                className="p-2 border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-600/30 rounded-full transition-colors cursor-pointer"
                title="Previous Testimonial"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="flex space-x-1.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`w-2 h-2 rounded-full transition-colors cursor-pointer ${
                      currentTestimonial === i ? 'bg-emerald-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNextTestimonial}
                className="p-2 border border-slate-200 text-slate-500 hover:text-emerald-700 hover:border-emerald-600/30 rounded-full transition-colors cursor-pointer"
                title="Next Testimonial"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Team Members Section */}
      <section className="py-20 bg-white" id="team_section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
              Meet Our Consular Visa Specialists
            </h2>
            <div className="w-12 h-1 bg-emerald-600 rounded-full mx-auto mt-4 mb-4" />
            <p className="text-slate-600 text-sm leading-relaxed">
              Our seasoned specialists bring decade-long experience in handling immigration files and Ministry of Foreign Affairs policy rules.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member, i) => (
              <div
                key={i}
                className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center interactive-card"
                id={`team_card_${i}`}
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto object-cover border-4 border-white shadow-md mb-4"
                  referrerPolicy="no-referrer"
                />
                <h3 className="font-display text-lg font-bold text-slate-900">{member.name}</h3>
                <span className="block text-xs font-semibold text-emerald-600 mt-1 uppercase tracking-wider">
                  {member.role}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed mt-4 font-sans italic">
                  "{member.bio}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Static Call to Action Block */}
      <section className="py-16 bg-gradient-to-br from-emerald-800 to-teal-900 text-white text-center sm:text-left relative overflow-hidden" id="cta_footer_banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Ready to Secure Your Entry to Saudi Arabia?
            </h2>
            <p className="text-emerald-150 text-sm sm:text-sm text-slate-100 leading-relaxed font-sans">
              Apply now as an individual or family group. Our team is standing by to cross-verify documentation and issue your electronic tourist, transit, or pilgrim credentials.
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={() => navigate('/apply')}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-900 font-extrabold px-8 py-4 rounded-xl transition-all shadow-xl text-base tracking-tight cursor-pointer"
            >
              Start Your Application Form
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
