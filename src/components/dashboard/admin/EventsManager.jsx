import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

const emptyForm = { title: "", description: "", venue: "", start_time: "", seats_total: 0, award_title: "" };

export default function EventsManager({ darkMode }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  async function fetchEvents() {
    setLoading(true);
    const { data } = await supabase.from("events").select("*").order("start_time");
    setEvents(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchEvents(); }, []);

  function openNew() {
    setForm(emptyForm);
    setEditing({});
  }

  function openEdit(item) {
    setForm({
      title: item.title,
      description: item.description || "",
      venue: item.venue || "",
      start_time: item.start_time ? item.start_time.slice(0, 16) : "",
      seats_total: item.seats_total,
      award_title: item.award_title || "",
    });
    setEditing(item);
  }

  async function handleSave(e) {
    e.preventDefault();
    const payload = {
      ...form,
      seats_total: Number(form.seats_total),
      start_time: new Date(form.start_time).toISOString(),
    };
    if (editing.id) {
      await supabase.from("events").update(payload).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("events").insert({ ...payload, created_by: user.id });
    }
    setEditing(null);
    fetchEvents();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this event? This will also remove related registrations.")) return;
    await supabase.from("events").delete().eq("id", id);
    fetchEvents();
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className={`text-lg font-semibold ${textPrimary}`}>Events</h2>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Add Event
        </button>
      </div>

      {loading ? (
        <p className={textSecondary}>Loading...</p>
      ) : events.length === 0 ? (
        <p className={textSecondary}>No events created yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((item) => (
            <div key={item.id} className={`${cardBg} border ${border} rounded-xl p-4 flex justify-between items-start`}>
              <div>
                <p className={`font-medium ${textPrimary}`}>{item.title}</p>
                <p className={`text-sm ${textSecondary}`}>{item.venue} • {new Date(item.start_time).toLocaleString()}</p>
                <p className={`text-sm ${textSecondary}`}>Seats: {item.seats_filled}/{item.seats_total}</p>
                {item.award_title && <p className={`text-xs ${textSecondary} mt-1`}>Award: {item.award_title}</p>}
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
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
              <h3 className={`font-semibold ${textPrimary}`}>{editing.id ? "Edit" : "New"} Event</h3>
              <button type="button" onClick={() => setEditing(null)}><X size={18} className={textSecondary} /></button>
            </div>

            <label className={`block text-xs ${textSecondary} mb-1`}>Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />

            <label className={`block text-xs ${textSecondary} mb-1`}>Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />

            <label className={`block text-xs ${textSecondary} mb-1`}>Venue</label>
            <input
              value={form.venue}
              onChange={(e) => setForm({ ...form, venue: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />

            <label className={`block text-xs ${textSecondary} mb-1`}>Start Time</label>
            <input
              required
              type="datetime-local"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />

            <label className={`block text-xs ${textSecondary} mb-1`}>Total Seats</label>
            <input
              required
              type="number"
              min="0"
              value={form.seats_total}
              onChange={(e) => setForm({ ...form, seats_total: e.target.value })}
              className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
            />

            <label className={`block text-xs ${textSecondary} mb-1`}>Award / Certificate Title</label>
            <input
              value={form.award_title}
              onChange={(e) => setForm({ ...form, award_title: e.target.value })}
              placeholder="e.g. Certificate of Participation"
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