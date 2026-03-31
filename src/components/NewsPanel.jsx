import { useEffect, useRef } from "react";

const CATEGORIES = [
  { id: "general", label: "General", icon: "🗞️" },
  { id: "business", label: "Business", icon: "💼" },
  { id: "technology", label: "Tech", icon: "💻" },
  { id: "sports", label: "Sports", icon: "🏀" },
  { id: "entertainment", label: "Showbiz", icon: "🎬" },
  { id: "science", label: "Science", icon: "🧪" },
  { id: "health", label: "Health", icon: "🏥" },
];

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000&auto=format&fit=crop";

export default function NewsPanel({
  country,
  articles,
  loading,
  error,
  totalArticles,
  loadingMore,
  onLoadMore,
  category,
  onCategoryChange,
  onClose,
}) {
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!country) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,0,0,0.3)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="slide-in fixed top-0 right-0 z-50 h-full flex flex-col"
        style={{
          width: "min(480px, 95vw)",
          background: "rgba(10, 14, 26, 0.98)",
          backdropFilter: "blur(40px)",
          borderLeft: "1px solid rgba(59, 130, 246, 0.2)",
          boxShadow: "-40px 0 100px rgba(0,0,0,0.7)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-6"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🌍</span>
              <h2 className="text-2xl font-black text-white tracking-tight truncate">
                {country}
              </h2>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] mt-1.5" style={{ color: "#475569" }}>
              {loading
                ? "Intelligence gathering..."
                : totalArticles > 0
                ? `${totalArticles} Global Headlines`
                : "No data found"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 cursor-pointer text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Categories Bar */}
        <div 
          className="px-6 py-4 flex gap-3 overflow-x-auto custom-scrollbar no-scrollbar"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                category === cat.id
                  ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/30"
                  : "bg-slate-900/40 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {loading && <SkeletonCards />}

          {error && (
            <div
              className="rounded-[2rem] p-8 text-center border-2"
              style={{
                background: "rgba(225, 29, 72, 0.05)",
                borderColor: "rgba(225, 29, 72, 0.15)",
              }}
            >
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">⚠️</span>
              </div>
              <h3 className="text-rose-400 font-black text-lg mb-2">Operation Halted</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 px-4">
                {error}
              </p>
              {error.toLowerCase().includes("limit") && (
                <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-800 text-left">
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2">Diagnostic Data</p>
                  <p className="text-[13px] text-slate-300 leading-relaxed">
                    You've reached the 100-request daily limit of GNews. The quota will reset at <span className="text-white font-bold">00:00 UTC</span>.
                  </p>
                </div>
              )}
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-24 px-10">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-slate-800">
                <span className="text-5xl">📭</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Intel Found</h3>
              <p className="text-slate-500 text-sm leading-relaxed uppercase tracking-widest font-black">
                Station quiet in this region
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            articles.map((article, idx) => (
              <a
                key={idx}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative rounded-[2rem] overflow-hidden bg-slate-900/40 border border-slate-800/60 hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20"
                style={{
                  animationDelay: `${idx * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex flex-col">
                  {/* Image Container */}
                  <div className="relative h-[220px] overflow-hidden">
                    <img
                      src={article.image || FALLBACK_IMAGE}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                    
                    {/* Source Badge */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                       <span className="px-3 py-1.5 rounded-lg bg-blue-600/90 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-white border border-blue-400/30 shadow-xl">
                        {article.source?.name || "Global Intel"}
                      </span>
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-6 pt-5">
                    <div className="flex items-center gap-3 mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                       <span>{formatDate(article.publishedAt)}</span>
                       <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                       <span>{category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white leading-tight mb-3 group-hover:text-blue-400 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.description && (
                      <p className="text-[13px] text-slate-400 leading-relaxed line-clamp-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        {article.description}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}

          {/* Load More Button */}
          {!loading && !error && articles.length > 0 && articles.length < totalArticles && (
            <div className="pt-4 pb-12">
              <button
                onClick={onLoadMore}
                disabled={loadingMore}
                className="w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 group"
                style={{
                  background: loadingMore ? "rgba(255,255,255,0.05)" : "rgba(59,130,246,0.06)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  color: "#3b82f6",
                  cursor: loadingMore ? "not-allowed" : "pointer",
                }}
              >
                {loadingMore ? (
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                ) : (
                  <>
                    <span>Decrypt more intel</span>
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-8 py-5 flex items-center justify-between"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            background: "rgba(0,0,0,0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">
              Live Intel Feed
            </p>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-700">
            Secure Connection Active
          </p>
        </div>
      </div>
    </>
  );
}

function SkeletonCards() {
  return (
    <div className="space-y-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-[2rem] bg-slate-900/40 border border-slate-800/60 p-0 overflow-hidden">
          <div className="h-[220px] bg-slate-800/30 animate-pulse" />
          <div className="p-6">
            <div className="h-2 w-24 bg-slate-800/40 rounded-full mb-4 animate-pulse" />
            <div className="h-4 w-full bg-slate-800/40 rounded-full mb-3 animate-pulse" />
            <div className="h-4 w-3/4 bg-slate-800/40 rounded-full mb-4 animate-pulse" />
            <div className="flex justify-between items-center mt-6">
               <div className="h-6 w-20 bg-slate-800/40 rounded-lg animate-pulse" />
               <div className="h-2 w-16 bg-slate-800/40 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHrs < 1) return "Just now";
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffHrs < 48) return "Yesterday";

  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
