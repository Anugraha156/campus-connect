import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";
import ScannerModal from "../ScannerModal";

export default function MyEvents({ darkMode, user }) {
  const [registrations, setRegistrations] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // event_id -> true
  const [loading, setLoading] = useState(true);
  const [scanningEventId, setScanningEventId] = useState(null);
  const [message, setMessage] = useState("");

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

  async function fetchRegistrations() {
    setLoading(true);
    const { data: regData } = await supabase
      .from("registrations")
      .select("id, status, registered_at, events(id, title, venue, start_time, award_title)")
      .eq("student_id", user.id)
      .order("registered_at", { ascending: false });

    const { data: attData } = await supabase
      .from("attendance")
      .select("event_id")
      .eq("student_id", user.id);

    const attMap = {};
    (attData || []).forEach((a) => { attMap[a.event_id] = true; });

    setRegistrations(regData || []);
    setAttendanceMap(attMap);
    setLoading(false);
  }

  useEffect(() => { fetchRegistrations(); }, [user.id]);

  async function handleScanResult(decodedText) {
    setScanningEventId(null);
    setMessage("");
    try {
      const parsed = JSON.parse(decodedText);
      const { error } = await supabase.rpc("mark_attendance", {
        p_event_id: parsed.eventId,
        p_token: parsed.token,
        p_student_id: user.id,
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Attendance marked successfully!");
        fetchRegistrations();
      }
    } catch {
      setMessage("Invalid QR code.");
    }
  }

  if (loading) return <p className={`p-8 text-center ${textSecondary}`}>Loading...</p>;

  if (registrations.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>You haven't registered for any events</h2>
        <p className={`text-sm ${textSecondary}`}>Registered events, attendance, and feedback will show up here.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {message && (
        <div className={`text-sm text-center p-2 rounded-lg ${cardBg} border ${border} ${textPrimary}`}>
          {message}
        </div>
      )}

      {registrations.map((reg) => {
        const event = reg.events;
        const isPast = event && new Date(event.start_time) < new Date();
        const attended = attendanceMap[event?.id];

        return (
          <div key={reg.id} className={`${cardBg} border ${border} rounded-xl p-4`}>
            <p className={`font-medium ${textPrimary}`}>{event?.title}</p>
            <p className={`text-sm ${textSecondary} mt-1`}>
              {event?.venue} • {event && new Date(event.start_time).toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {reg.status === "registered" && (
                <span className="text-xs font-medium text-emerald-500">✓ Registered</span>
              )}
              {reg.status === "waitlisted" && (
                <span className="text-xs font-medium text-amber-500">On waitlist</span>
              )}
              {attended && (
                <span className="text-xs font-medium text-blue-500">✓ Attended</span>
              )}
              {isPast && <span className={`text-xs ${textSecondary}`}>• Event has passed</span>}
            </div>
            {event?.award_title && (
              <p className={`text-xs ${textSecondary} mt-1`}>Award: {event.award_title}</p>
            )}

            {reg.status === "registered" && !attended && (
              <button
                onClick={() => setScanningEventId(event.id)}
                className="mt-3 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg"
              >
                Scan QR for Attendance
              </button>
            )}
          </div>
        );
      })}

      {scanningEventId && (
        <ScannerModal
          darkMode={darkMode}
          onScan={handleScanResult}
          onClose={() => setScanningEventId(null)}
        />
      )}
    </div>
  );
}