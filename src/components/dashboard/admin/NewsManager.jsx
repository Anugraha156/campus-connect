import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Upload } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

const CATEGORIES = ["Events", "Sports", "Placements", "Academics", "Campus Life"];

export default function NewsManager({ darkMode }) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: "", body: "", image_url: "", category: CATEGORIES[0] });
  const [uploading, setUploading] = useState(false);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  async function fetchNews() {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("posted_at", { ascending: false });
    setNews(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchNews(); }, []);

  function openNew() {
    setForm({ title: "", body: "", image_url: "", category: CATEGORIES[0] });
    setEditing({});
  }

  function openEdit(item) {
    setForm({
      title: item.title,
      body: item.body,
      image_url: item.image_url || "",
      category: item.category || CATEGORIES[0],
    });
    setEditing(item);
  }

  async function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { error } = await supabase.storage.from("news-images").upload(fileName, file);

    if (error) {
      alert("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("news-images").getPublicUrl(fileName);
    setForm((prev) => ({ ...prev, image_url: data.publicUrl }));
    setUploading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (editing.id) {
      await supabase.from("news").update(form).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("news").insert({ ...form, posted_by: user.id });
    }
    setEditing(null);
    fetchNews();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this news post?")) return;
    await supabase.from("news").delete().eq("id", id);
    fetchNews();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${textPrimary}`}>News & Announcements</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Add News
        </button>
      </div>

      {loading ? (
        <p className={textSecondary}>Loading...</p>
      ) : news.length === 0 ? (
        <p className={textSecondary}>No news posted yet.</p>
      ) : (
        <div className="space-y-3">
          {news.map((item) => (
            <div key={item.id} className={`${cardBg} border ${border} rounded-xl p-4 flex gap-4 items-start`}>
              {item.image_url && (
                <img src={item.image_url} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1">
                {item.category && (
                  <span className="text-xs font-medium text-blue-500 uppercase tracking-wide">{item.category}</span>
                )}
                <p className={`font-medium ${textPrimary}`}>{item.title}</p>
                <p className={`text-sm ${textSecondary} mt-1`}>{item.body}</p>
                <p className={`text-xs ${textSecondary} mt-2`}>{new Date(item.posted_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className={textSecondary}><Pencil size={16} /></button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <form onSubmit={handleSave} className={`${cardBg} border ${border} rounded-2xl p-6 w-full max-w-md my-8`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold ${textPrimary}`}>{editing.id ? "Edit" : "New"} News</h3>
              <button type="button" onClick={() => setEditing(null)}><X size={18} className={textSecondary} /></button>
            </div>

            <label className={`block text-xs ${textSecondary} mb-1`}>Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            >
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <label className={`block text-xs ${textSecondary} mb-1`}>Image</label>
            {form.image_url && (
              <img src={form.image_url} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
            )}
            <label
              className={`flex items-center justify-center gap-2 w-full px-3 py-2.5 mb-3 rounded-lg border ${border} ${inputBg} ${textSecondary} text-sm cursor-pointer hover:border-blue-400`}
            >
              <Upload size={16} />
              {uploading ? "Uploading..." : form.image_url ? "Replace photo" : "Upload photo"}
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
            </label>

            <label className={`block text-xs ${textSecondary} mb-1`}>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />

            <label className={`block text-xs ${textSecondary} mb-1`}>Body</label>
            <textarea
              required
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className={`w-full px-3 py-2 mb-4 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
            >
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}