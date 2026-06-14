import React from 'react';
import { FileText, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface BlogProps {
  navigate: (path: string) => void;
}

export default function Blog({ navigate }: BlogProps) {
  const posts = [
    {
      id: "apply-umrah-visa",
      title: "How to apply for Umrah visa: Online Process Guide",
      excerpt: "A comprehensive guide on applying for your Umrah travel permit using the streamlined tourist eVisa channel in 2026. Discover mandatory vaccination documents, dress codes, and application files.",
      content: "Performing the sacred pilgrimage of Umrah is now simpler than ever. Under the latest Vision 2030 regulations, the Saudi Ministry of Hajj & Umrah has authorized visitors holding a Touristry/Visitor eVisa to perform Umrah with zero restrictions, saving millions from requesting specialized high-cost pilgrim clearance packages.\n\nTo file your application successfully through our portal, make sure you prepare high-contrasted scans of your passport page, together with a professional white background photograph. Pilgrims should note that while entry permits allow up to 90 days stay, visiting the holy site of Makkah still requires prior slot bookings inside the Nusuk application to manage crowd capacities.",
      date: "May 25, 2026",
      readTime: "4 min read",
      author: "Hassan Al-Saeed",
      category: "Pilgrimage Guide",
      img: "https://images.unsplash.com/photo-1591604021695-0c69b7c05981?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
      id: "saudi-tourist-visa",
      title: "Saudi tourist visa 2026: Validity, Costs & GCC Extensions",
      excerpt: "Everything you need to know about the Saudi 1-Year Tourist eVisa. Learn about eligible countries list, health insurance coverage rules, and cumulative overstay fines.",
      content: "Saudi Arabia has officially expanded its multiple-entry electronic visa roster to 60+ countries and launched simplified processing lines. The eVisa costs $120 (consular and medical emergency health insurance premium bundled directly inside).\n\nKey rules to avoid border delays: (1) Ensure passport holds 6 months validity beforehand. (2) Limit single trips to 90 days. Staying past this threshold is a serious immigration violation triggering massive compound fines of SAR 100/day. Keep track of your cumulative stay logs so as not to exceed the annual 90-day threshold.",
      date: "June 02, 2026",
      readTime: "5 min read",
      author: "Noura Al-Sharif",
      category: "Consular News",
      img: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=400&h=250"
    },
    {
      id: "transit-visa-rules",
      title: "Saudi Transit Visa Rules: Complete 96-hour Stopover Guide",
      excerpt: "Turn your airline layover in Riyadh or Jeddah into a 4-day Arabic sightseeing adventure. Read about qualifying flights, stopover permits, and immediate processing.",
      content: "The Saudi Stopover Visa allows citizens of any nationality traveling through Saudia or Flynas airlines to exit international transits and explore historical sites, local souks, or perform Umrah for up to 96 hours. \n\nTransit visas are issued instantly through our electronic system. To apply, simply lodge your confirmed onward flight tickets together with a valid booking confirmation. There is a processing fee of only $45, and it includes standard emergency medical insurance coverage on-site. It is a fantastic opportunity to see Al-Balad in Jeddah without paying for high-tier long-stay visa categories.",
      date: "June 08, 2026",
      readTime: "3 min read",
      author: "Tariq Abdulaziz",
      category: "Transit Travel",
      img: "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=400&h=250"
    }
  ];

  return (
    <div className="bg-slate-50 py-12 md:py-16 font-sans" id="blog_page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold font-mono text-emerald-600 tracking-widest uppercase block mb-2">IMMIGRATION JOURNAL</span>
          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900">
            Latest Saudi Visa News & Travel Updates
          </h1>
          <p className="text-slate-500 text-sm sm:text-base mt-4 leading-relaxed">
            Stay informed with expert guides and direct notification releases regarding electronic visa policies, religious pilgrimage, and stopover sightseeing guides.
          </p>
        </div>

        {/* Blog layout grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article 
              key={post.id} 
              className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs relative flex flex-col justify-between interactive-card"
              id={`post_${post.id}`}
            >
              <div>
                <img
                  src={post.img}
                  alt={post.title}
                  className="w-full h-48 object-cover filter brightness-95"
                  referrerPolicy="no-referrer"
                />
                
                <div className="p-6">
                  {/* Metadata */}
                  <div className="flex items-center space-x-3 text-[11px] font-mono font-semibold text-slate-400 mb-3 uppercase tracking-wider">
                    <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{post.category}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} /> {post.date}</span>
                  </div>

                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 leading-snug mb-3 hover:text-emerald-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-sans line-clamp-3 mb-6">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              {/* Collapsed view toggle or direct expand */}
              <div className="p-6 pt-0 border-t border-slate-50 bg-slate-50/20">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">By {post.author}</span>
                  <span className="text-slate-400 flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100/50">
                  <details className="group">
                    <summary className="font-bold text-xs text-emerald-700 hover:text-emerald-600 cursor-pointer list-none flex items-center justify-between">
                      <span className="group-open:hidden uppercase tracking-wider">Read Full Article</span>
                      <span className="hidden group-open:inline uppercase tracking-wider text-slate-500">Collapse Article</span>
                      <ArrowRight size={14} className="transition-transform group-open:rotate-90 text-emerald-600" />
                    </summary>
                    <div className="mt-4 text-xs text-slate-600 space-y-3 font-sans leading-relaxed border-t border-slate-50 pt-4 cursor-text">
                      {post.content.split('\n\n').map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                      ))}
                      
                      <div className="mt-6 bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100">
                        <strong className="block text-xs uppercase tracking-wider mb-1">Applying is simple</strong>
                        <button
                          onClick={() => navigate('/apply')}
                          className="text-[11px] font-bold underline cursor-pointer hover:text-emerald-600"
                        >
                          Launch Online Application Form →
                        </button>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </div>
  );
}
