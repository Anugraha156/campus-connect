import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";
import DetailModal from "../DetailModal";

const CATEGORIES = ["Events", "Sports", "Placements", "Academics", "Campus Life"];

function truncate(text, max = 110) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

export default function News({ darkMode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const placeholderBg = darkMode ? "bg-neutral-700" : "bg-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase.from("news").select("*").order("posted_at", { ascending: false });
      setNews(data || []);
      setLoading(false);
    }
    fetchNews();
  }, []);

  if (loading) return <p className={`p-8 text-center ${textSecondary}`}>Loading...</p>;

  if (news.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>No news yet</h2>
        <p className={`text-sm ${textSecondary}`}>Campus announcements will appear here.</p>
      </div>
    );
  }

  const filteredNews = news.filter((item) => {
    if (categoryFilter === "all") return true;
    return item.category === categoryFilter;
  });

  function CategoryBadge({ category }) {
    if (!category) return null;
    return (
      <span className="inline-block text-[10px] font-semibold text-blue-500 uppercase tracking-wide">
        {category}
      </span>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className={`text-base font-semibold ${textPrimary}`}>News</h2>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {filteredNews.length === 0 ? (
        <p className={`text-sm ${textSecondary}`}>No news in this category yet.</p>
      ) : (
        <>
          {/* Featured article */}
          <button
            onClick={() => setSelected(filteredNews[0])}
            className={`${cardBg} border ${border} rounded-2xl overflow-hidden text-left w-full mb-6 hover:border-blue-400 transition-colors flex flex-col sm:flex-row`}
          >
            <div className={`sm:w-2/5 h-44 sm:h-auto ${placeholderBg} shrink-0`}>
              {filteredNews[0].image_url && (
                <img src={filteredNews[0].image_url} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div className="p-5 flex flex-col justify-center gap-2">
              <CategoryBadge category={filteredNews[0].category} />
              <h3 className={`text-lg font-bold ${textPrimary} leading-snug`}>{filteredNews[0].title}</h3>
              <p className={`text-sm ${textSecondary} leading-relaxed`}>{truncate(filteredNews[0].body, 150)}</p>
              <p className={`text-xs ${textSecondary} mt-1`}>{new Date(filteredNews[0].posted_at).toLocaleDateString()}</p>
            </div>
          </button>

          {/* Grid of remaining articles */}
          {filteredNews.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNews.slice(1).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`${cardBg} border ${border} rounded-xl overflow-hidden text-left hover:border-blue-400 transition-colors flex flex-col`}
                >
                  <div className={`h-32 ${placeholderBg}`}>
                    {item.image_url && (
                      <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-1.5">
                    <CategoryBadge category={item.category} />
                    <p className={`font-medium text-sm ${textPrimary} leading-snug`}>{item.title}</p>
                    <p className={`text-xs ${textSecondary} leading-relaxed`}>{truncate(item.body, 70)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {selected && (
        <DetailModal darkMode={darkMode} onClose={() => setSelected(null)}>
          {selected.image_url && (
            <img src={selected.image_url} alt="" className="w-full h-64 object-cover rounded-xl mb-4" />
          )}
          <CategoryBadge category={selected.category} />
          <h2 className={`text-xl font-semibold ${textPrimary} mt-2 mb-2`}>{selected.title}</h2>
          <p className={`text-xs ${textSecondary} mb-4`}>{new Date(selected.posted_at).toLocaleString()}</p>
          <p className={`text-sm ${textPrimary} whitespace-pre-wrap leading-relaxed`}>{selected.body}</p>
        </DetailModal>
      )}
    </div>
  );
}