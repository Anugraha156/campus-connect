import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";
import DetailModal from "../DetailModal";

export default function News({ darkMode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

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

  return (
    <div className="p-6 space-y-3">
      {news.map((item) => (
        <button
          key={item.id}
          onClick={() => setSelected(item)}
          className={`${cardBg} border ${border} rounded-xl p-4 text-left w-full hover:border-blue-400 transition-colors`}
        >
          <p className={`font-medium ${textPrimary}`}>{item.title}</p>
          <p className={`text-sm ${textSecondary} mt-1 line-clamp-2`}>{item.body}</p>
          <p className={`text-xs ${textSecondary} mt-2`}>{new Date(item.posted_at).toLocaleString()}</p>
        </button>
      ))}

      {selected && (
        <DetailModal darkMode={darkMode} onClose={() => setSelected(null)}>
          <h2 className={`text-xl font-semibold ${textPrimary} mb-2 pr-8`}>{selected.title}</h2>
          <p className={`text-xs ${textSecondary} mb-4`}>{new Date(selected.posted_at).toLocaleString()}</p>
          <p className={`text-sm ${textPrimary} whitespace-pre-wrap leading-relaxed`}>{selected.body}</p>
        </DetailModal>
      )}
    </div>
  );
}