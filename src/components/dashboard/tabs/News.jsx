import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";
import DetailModal from "../DetailModal";

function truncate(text, max = 110) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max).trim() + "…" : text;
}

export default function News({ darkMode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const placeholderBg = darkMode ? "bg-neutral-700" : "bg-neutral-200";

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

  const [featured, ...rest] = news;

  return (
    <div className="p-6">
      <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>News</h2>

      {/* Featured article */}
      <button
        onClick={() => setSelected(featured)}
        className={`${cardBg} border ${border} rounded-2xl overflow-hidden text-left w-full mb-6 hover:border-blue-400 transition-colors flex flex-col sm:flex-row`}
      >
        <div className={`sm:w-2/5 h-48 sm:h-auto ${placeholderBg} shrink-0`}>
          {featured.image_url && (
            <img src={featured.image_url} alt="" className="w-full h-full object-cover" />
          )}
        </div>
        <div className="p-5 flex flex-col justify-center">
          {featured.category && (
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">
              {featured.category}
            </span>
          )}
          <h3 className={`text-xl font-bold ${textPrimary} mb-2`}>{featured.title}</h3>
          <p className={`text-sm ${textSecondary}`}>{truncate(featured.body, 160)}</p>
          <p className={`text-xs ${textSecondary} mt-3`}>{new Date(featured.posted_at).toLocaleDateString()}</p>
        </div>
      </button>

      {/* Grid of remaining articles */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rest.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className={`${cardBg} border ${border} rounded-xl overflow-hidden text-left hover:border-blue-400 transition-colors`}
            >
              <div className={`h-32 ${placeholderBg}`}>
                {item.image_url && (
                  <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="p-4">
                {item.category && (
                  <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
                    {item.category}
                  </span>
                )}
                <p className={`font-medium ${textPrimary} mt-1`}>{item.title}</p>
                <p className={`text-xs ${textSecondary} mt-1`}>{truncate(item.body, 70)}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <DetailModal darkMode={darkMode} onClose={() => setSelected(null)}>
          {selected.image_url && (
            <img src={selected.image_url} alt="" className="w-full h-48 object-cover rounded-xl mb-4 -mt-2" />
          )}
          {selected.category && (
            <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide">
              {selected.category}
            </span>
          )}
          <h2 className={`text-xl font-semibold ${textPrimary} mt-1 mb-2 pr-8`}>{selected.title}</h2>
          <p className={`text-xs ${textSecondary} mb-4`}>{new Date(selected.posted_at).toLocaleString()}</p>
          <p className={`text-sm ${textPrimary} whitespace-pre-wrap leading-relaxed`}>{selected.body}</p>
        </DetailModal>
      )}
    </div>
  );
}