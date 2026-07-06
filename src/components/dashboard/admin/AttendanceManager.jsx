import { useState, useEffect } from "react";
import { Check, X } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

export default function AttendanceManager({ darkMode }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [attendedIds, setAttendedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from("events")
        .select("id, title, start_time")
        .order("start_time", { ascending: false });
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEventId(data[0].id);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  async function fetchRegistrationsAndAttendance(eventId) {
    setLoading(true);

    const { data: regData } = await supabase
      .from("registrations")
      .select("id, status, student_id, students(id, full_name, reg_number)")
      .eq("event_id", eventId)
      .in("status", ["registered", "waitlisted"])
      .order("registered_at");

    const { data: attData } = await supabase
      .from("attendance")
      .select("student_id")
      .eq("event_id", eventId);

    setRegistrations(regData || []);
    setAttendedIds(new Set((attData || []).map((a) => a.student_id)));
    setLoading(false);
  }

  useEffect(() => {
    if (selectedEventId) fetchRegistrationsAndAttendance(selectedEventId);
  }, [selectedEventId]);

  async function markPresent(studentId) {
    setBusyId(studentId);
    const { error } = await supabase
      .from("attendance")
      .insert({ student_id: studentId, event_id: selectedEventId });
    if (error) alert(error.message);
    setAttendedIds((prev) => new Set(prev).add(studentId));
    setBusyId(null);
  }

  async function removeAttendance(studentId) {
    setBusyId(studentId);
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("student_id", studentId)
      .eq("event_id", selectedEventId);
    if (error) alert(error.message);
    setAttendedIds((prev) => {
      const next = new Set(prev);
      next.delete(studentId);
      return next;
    });
    setBusyId(null);
  }

  return (
    <div className="p-6">
      <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>Manual Attendance</h2>

      {events.length === 0 ? (
        <p className={textSecondary}>No events created yet.</p>
      ) : (
        <>
          <label className={`block text-xs ${textSecondary} mb-1`}>Select Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className={`w-full max-w-md px-3 py-2 mb-5 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — {new Date(ev.start_time).toLocaleDateString()}
              </option>
            ))}
          </select>

          {loading ? (
            <p className={textSecondary}>Loading...</p>
          ) : registrations.length === 0 ? (
            <p className={textSecondary}>No registrations for this event yet.</p>
          ) : (
            <div className="space-y-2">
              {registrations.map((reg) => {
                const student = reg.students;
                const isAttended = attendedIds.has(reg.student_id);
                const isBusy = busyId === reg.student_id;

                return (
                  <div
                    key={reg.id}
                    className={`${cardBg} border ${border} rounded-xl p-3 flex justify-between items-center`}
                  >
                    <div>
                      <p className={`font-medium ${textPrimary}`}>{student?.full_name}</p>
                      <p className={`text-xs ${textSecondary}`}>
                        {student?.reg_number} • {reg.status === "waitlisted" ? "Waitlisted" : "Registered"}
                      </p>
                    </div>

                    {isAttended ? (
                      <button
                        onClick={() => removeAttendance(reg.student_id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-500/30 px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        <X size={14} /> Remove
                      </button>
                    ) : (
                      <button
                        onClick={() => markPresent(reg.student_id)}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 border border-emerald-500/30 px-3 py-1.5 rounded-lg disabled:opacity-60"
                      >
                        <Check size={14} /> Mark Present
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}