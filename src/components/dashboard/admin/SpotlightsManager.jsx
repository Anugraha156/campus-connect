import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

export default function SpotlightsManager({ darkMode }) {
  const [spotlights, setSpotlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [form, setForm] = useState({ title: "", detail: "", sort_order: 0 });

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  async function fetchSpotlights() {
    setLoading(true);
    const { data } = await supabase.from("spotlights").select("*").order("sort_order");
    setSpotlights(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchSpotlights(); }, []);

  function openNew() {
    setForm({ title: "", detail: "", sort_order: spotlights.length });
    setEditing({});
  }

  function openEdit(item) {
    setForm({ title: item.title, detail: item.detail || "", sort_order: item.sort_order });
    setEditing(item);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (editing.id) {
      await supabase.from("spotlights").update(form).eq("id", editing.id);
    } else {
      await supabase.from("spotlights").insert(form);
    }
    setEditing(null);
    fetchSpotlights();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this spotlight?")) return;
    await supabase.from("spotlights").delete().eq("id", id);
    fetchSpotlights();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${textPrimary}`}>Login Page Spotlights</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Add Spotlight
        </button>
      </div>

      {loading ? (
        <p className={textSecondary}>Loading...</p>
      ) : spotlights.length === 0 ? (
        <p className={textSecondary}>No spotlights yet. Add one to show it on the login page.</p>
      ) : (
        <div className="space-y-3">
          {spotlights.map((item) => (
            <div key={item.id} className={`${cardBg} border ${border} rounded-xl p-4 flex justify-between items-start`}>
              <div>
                <p className={`font-medium ${textPrimary}`}>{item.title}</p>
                <p className={`text-sm ${textSecondary}`}>{item.detail}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(item)} className={textSecondary}><Pencil size={16} /></button>
                <button onClick={() => handleDelete(item.id)} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleSave} className={`${cardBg} border ${border} rounded-2xl p-6 w-full max-w-md`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`font-semibold ${textPrimary}`}>{editing.id ? "Edit" : "New"} Spotlight</h3>
              <button type="button" onClick={() => setEditing(null)}><X size={18} className={textSecondary} /></button>
            </div>
            <label className={`block text-xs ${textSecondary} mb-1`}>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />
            <label className={`block text-xs ${textSecondary} mb-1`}>Detail</label>
            <input
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />
            <label className={`block text-xs ${textSecondary} mb-1`}>Sort Order</label>
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className={`w-full px-3 py-2 mb-4 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg">
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}