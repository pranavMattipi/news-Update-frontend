import { useState, useCallback, useRef, useEffect } from "react";
import axios from "axios";
import GlobeView from "./components/Globe";
import NewsPanel from "./components/NewsPanel";

const API_BASE = "http://localhost:8000/api";

export default function App() {
  const globeRef = useRef();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("general");

  const fetchNews = async (countryName, isLoadMore = false, newCategory = null) => {
    const catToUse = newCategory !== null ? newCategory : category;
    
    if (!isLoadMore) {
      setLoading(true);
      setError(null);
      setArticles([]);
      setPage(1);
    } else {
      setLoadingMore(true);
    }

    try {
      const currentPage = isLoadMore ? page + 1 : 1;
      const response = await axios.get(`${API_BASE}/news/${encodeURIComponent(countryName)}`, {
        params: { 
          max: 15, 
          page: currentPage,
          category: catToUse 
        }
      });
      
      const newArticles = response.data.articles || [];
      if (isLoadMore) {
        setArticles(prev => [...prev, ...newArticles]);
        setPage(currentPage);
      } else {
        setArticles(newArticles);
        setTotalArticles(response.data.totalArticles || 0);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.error || "Failed to load news for this country.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleCountryClick = useCallback((countryName) => {
    setSelectedCountry(countryName);
    setCategory("general");
    fetchNews(countryName, false, "general");
  }, []);

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    if (selectedCountry) {
      fetchNews(selectedCountry, false, newCat);
    }
  };

  const handleLoadMore = () => {
    if (selectedCountry) {
      fetchNews(selectedCountry, true);
    }
  };

  const handleSearch = (e, query) => {
    e.preventDefault();
    if (!query?.trim()) return;

    const zoomed = globeRef.current?.zoomToCountry(query);
    if (zoomed) {
      handleCountryClick(query);
    } else {
      alert(`Country "${query}" not found on the globe.`);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0e1a]">
      {/* Globe */}
      <GlobeView ref={globeRef} onCountryClick={handleCountryClick} />

      {/* Top Bar / Navigation */}
      <div
        className="fixed top-0 left-0 right-0 z-30 flex flex-col md:flex-row items-center justify-between px-12 py-10 gap-8"
        style={{
          background: "linear-gradient(to bottom, rgba(10,14,26,1) 0%, rgba(10,14,26,0.8) 50%, transparent 100%)",
          pointerEvents: "none",
        }}
      >
        {/* Logo Section */}
        <div 
          className="flex items-center gap-4 group cursor-pointer" 
          style={{ pointerEvents: "auto" }}
          onClick={() => setSelectedCountry(null)}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-2xl transition-transform group-hover:scale-110 duration-500"
            style={{
              background: "rgba(59,130,246,0.1)",
              border: "1px solid rgba(59,130,246,0.2)",
              backdropFilter: "blur(10px)",
            }}
          >
            🌍
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none mb-1">
              Globe<span className="text-blue-500">News</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 opacity-80">
              World Wide Intelligence
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <SearchBar onSearch={handleSearch} />

        <div className="hidden lg:block w-[200px]"></div>
      </div>

      {/* News Panel */}
      <NewsPanel
        country={selectedCountry}
        articles={articles}
        loading={loading}
        error={error}
        totalArticles={totalArticles}
        loadingMore={loadingMore}
        onLoadMore={handleLoadMore}
        category={category}
        onCategoryChange={handleCategoryChange}
        onClose={() => setSelectedCountry(null)}
      />

      {/* Bottom info */}
      {!selectedCountry && (
        <div
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-30"
          style={{ pointerEvents: "none" }}
        >
          <div
            className="flex items-center gap-4 px-10 py-5 rounded-[2.5rem] text-[14px] font-black uppercase tracking-[0.2em]"
            style={{
              background: "rgba(10,14,26,0.8)",
              backdropFilter: "blur(30px)",
              border: "1px solid rgba(59,130,246,0.3)",
              color: "#94a3b8",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_15px_#3b82f6]"></div>
            Interact with the globe
          </div>
        </div>
      )}
    </div>
  );
}

function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");

  return (
    <form 
      onSubmit={(e) => {
        onSearch(e, query);
        setQuery("");
      }}
      className="flex items-center w-full max-w-xl group"
      style={{ pointerEvents: "auto" }}
    >
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a country name..."
          className="block w-full pl-16 pr-6 py-5 bg-slate-900/40 backdrop-blur-3xl border border-slate-700/40 rounded-3xl text-base text-white placeholder-slate-600 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all shadow-2xl"
        />
      </div>
      <button
        type="submit"
        className="ml-4 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-black uppercase tracking-widest rounded-3xl transition-all shadow-2xl shadow-blue-900/40 active:scale-95 whitespace-nowrap"
      >
        Explore
      </button>
    </form>
  );
}
