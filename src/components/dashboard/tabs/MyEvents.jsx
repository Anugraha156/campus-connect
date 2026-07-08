import { useState, useEffect, useMemo } from "react";
import { supabase } from "../../../config/supabaseClient";
import ScannerModal from "../ScannerModal";

export default function MyEvents({ darkMode, user }) {
  const [registrations, setRegistrations] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [scanningEventId, setScanningEventId] = useState(null);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("all"); // all | upcoming | attended
  const [monthFilter, setMonthFilter] = useState("all");

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  async function fetchRegistrations() {
    setLoading(true);
    const { data: regData } = await supabase
      .from("registrations")
      .select("id, status, registered_at, events(id, title, venue, start_time, award_title)")
      .eq("student_id", user.id);

    const sorted = (regData || []).sort((a, b) => {
      const dateA = a.events?.start_time ? new Date(a.events.start_time) : new Date(0);
      const dateB = b.events?.start_time ? new Date(b.events.start_time) : new Date(0);
      return dateA - dateB;
    });

    const { data: attData } = await supabase
      .from("attendance")
      .select("event_id")
      .eq("student_id", user.id);

    const attMap = {};
    (attData || []).forEach((a) => { attMap[a.event_id] = true; });

    setRegistrations(sorted);
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

  // Build the list of months that actually have events, for the dropdown
  const availableMonths = useMemo(() => {
    const set = new Set();
    registrations.forEach((reg) => {
      if (reg.events?.start_time) {
        const d = new Date(reg.events.start_time);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        set.add(key);
      }
    });
    return Array.from(set).sort();
  }, [registrations]);

  function formatMonthLabel(key) {
    const [year, month] = key.split("-");
    const d = new Date(Number(year), Number(month) - 1);
    return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  }

  const filteredRegistrations = registrations.filter((reg) => {
    const event = reg.events;
    if (!event) return false;

    const isPast = new Date(event.start_time) < new Date();
    const attended = attendanceMap[event.id];

    if (filter === "upcoming" && isPast) return false;
    if (filter === "attended" && !attended) return false;

    if (monthFilter !== "all") {
      const d = new Date(event.start_time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key !== monthFilter) return false;
    }

    return true;
  });

  if (loading) return <p className={`p-8 text-center ${textSecondary}`}>Loading...</p>;

  if (registrations.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>You haven't registered for any events</h2>
        <p className={`text-sm ${textSecondary}`}>Registered events, attendance, and feedback will show up here.</p>
      </div>
    );
  }

  const filterButtons = [
    { id: "all", label: "All" },
    { id: "upcoming", label: "Upcoming" },
    { id: "attended", label: "Attended" },
  ];

  return (
    <div className="p-6">
      <p className={`text-xs font-medium ${textPrimary} mb-4 flex items-center gap-1.5`}>
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className={`flex ${inputBg} rounded-lg p-1`}>
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === btn.id
                  ? `${cardBg} ${textPrimary} shadow-sm`
                  : textSecondary
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className={`px-3 py-2 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
        >
          <option value="all">All months</option>
          {availableMonths.map((key) => (
            <option key={key} value={key}>{formatMonthLabel(key)}</option>
          ))}
        </select>
      </div>

      {message && (
        <div className={`text-sm text-center p-2 mb-3 rounded-lg ${cardBg} border ${border} ${textPrimary}`}>
          {message}
        </div>
      )}

      {filteredRegistrations.length === 0 ? (
        <p className={`text-sm ${textSecondary}`}>No events match this filter.</p>
      ) : (
        <div className="space-y-3">
          {filteredRegistrations.map((reg) => {
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
        </div>
      )}

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