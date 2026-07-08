import { useState, useEffect } from "react";
import { UserPlus, X } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

export default function BulkRegister({ darkMode, onClose }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [regRange, setRegRange] = useState({ from: "", to: "" });
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState(null);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase.from("events").select("id, title").order("start_time");
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEventId(data[0].id);
    }
    fetchEvents();
  }, []);

  async function handleRun() {
    if (!selectedEventId || !regRange.from || !regRange.to) return;
    setRunning(true);
    setResults(null);

    const { data: students, error } = await supabase
      .from("students")
      .select("id, reg_number")
      .gte("reg_number", regRange.from)
      .lte("reg_number", regRange.to)
      .order("reg_number");

    if (error || !students || students.length === 0) {
      setResults({ error: "No students found in that reg number range." });
      setRunning(false);
      return;
    }

    const summary = { registered: 0, waitlisted: 0, already: 0, failed: 0 };

    for (const student of students) {
      const { data, error: rpcError } = await supabase.rpc("register_for_event", {
        p_event_id: selectedEventId,
        p_student_id: student.id,
      });

      if (rpcError) {
        summary.failed++;
      } else if (data === "registered") {
        summary.registered++;
      } else if (data === "waitlisted") {
        summary.waitlisted++;
      } else {
        summary.already++;
      }
    }

    setResults({ total: students.length, ...summary });
    setRunning(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} border ${border} rounded-2xl p-6 w-full max-w-md`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
            <UserPlus size={18} /> Bulk Register Students
          </h3>
          <button onClick={onClose}><X size={18} className={textSecondary} /></button>
        </div>

        <label className={`block text-xs ${textSecondary} mb-1`}>Event</label>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className={`w-full px-3 py-2 mb-3 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
        >
          {events.map((ev) => (
            <option key={ev.id} value={ev.id}>{ev.title}</option>
          ))}
        </select>

        <label className={`block text-xs ${textSecondary} mb-1`}>Registration Number Range</label>
        <div className="flex gap-2 mb-4">
          <input
            value={regRange.from}
            onChange={(e) => setRegRange({ ...regRange, from: e.target.value })}
            placeholder="26BCE0005"
            className={`flex-1 px-3 py-2 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
          />
          <span className={`self-center ${textSecondary}`}>to</span>
          <input
            value={regRange.to}
            onChange={(e) => setRegRange({ ...regRange, to: e.target.value })}
            placeholder="26BCE0024"
            className={`flex-1 px-3 py-2 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
          />
        </div>

        <button
          onClick={handleRun}
          disabled={running}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
        >
          {running ? "Registering..." : "Register All"}
        </button>

        {results && (
          <div className={`mt-4 text-sm ${textPrimary} space-y-1 border-t ${border} pt-3`}>
            {results.error ? (
              <p className="text-red-500">{results.error}</p>
            ) : (
              <>
                <p>Total matched: <strong>{results.total}</strong></p>
                <p className="text-emerald-500">Registered: {results.registered}</p>
                <p className="text-amber-500">Waitlisted: {results.waitlisted}</p>
                <p className={textSecondary}>Already registered: {results.already}</p>
                {results.failed > 0 && <p className="text-red-500">Failed: {results.failed}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}