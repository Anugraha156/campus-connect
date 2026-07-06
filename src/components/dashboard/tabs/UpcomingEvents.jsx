import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";
import DetailModal from "../DetailModal";

export default function UpcomingEvents({ darkMode, user }) {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState({});
  const [waitlistPositions, setWaitlistPositions] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState(null);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

  async function fetchData() {
    setLoading(true);
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .gt("start_time", new Date().toISOString())
      .order("start_time");

    const { data: regData } = await supabase
      .from("registrations")
      .select("event_id, status")
      .eq("student_id", user.id);

    const regMap = {};
    (regData || []).forEach((r) => { regMap[r.event_id] = r.status; });

    const waitlisted = (regData || []).filter((r) => r.status === "waitlisted");
    const positions = {};
    await Promise.all(
      waitlisted.map(async (r) => {
        const { data: pos } = await supabase.rpc("get_waitlist_position", {
          p_event_id: r.event_id,
          p_student_id: user.id,
        });
        positions[r.event_id] = pos;
      })
    );

    setEvents(eventsData || []);
    setMyRegistrations(regMap);
    setWaitlistPositions(positions);
    setLoading(false);

    // keep the open modal's data fresh after register/cancel
    if (selected) {
      const updated = (eventsData || []).find((e) => e.id === selected.id);
      if (updated) setSelected(updated);
    }
  }

  useEffect(() => { fetchData(); }, [user.id]);

  async function handleRegister(eventId) {
    setActionLoading(eventId);
    const { error } = await supabase.rpc("register_for_event", {
      p_event_id: eventId,
      p_student_id: user.id,
    });
    if (error) alert(error.message);
    setActionLoading(null);
    fetchData();
  }

  async function handleCancel(eventId) {
    if (!confirm("Cancel your registration for this event?")) return;
    setActionLoading(eventId);
    const { error } = await supabase.rpc("cancel_registration", {
      p_event_id: eventId,
      p_student_id: user.id,
    });
    if (error) alert(error.message);
    setActionLoading(null);
    fetchData();
  }

  if (loading) return <p className={`p-8 text-center ${textSecondary}`}>Loading...</p>;

  if (events.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>No events open yet</h2>
        <p className={`text-sm ${textSecondary}`}>Check back soon for upcoming campus events.</p>
      </div>
    );
  }

  function renderActions(item) {
    const seatsLeft = item.seats_total - item.seats_filled;
    const myStatus = myRegistrations[item.id];
    const isBusy = actionLoading === item.id;

    if (myStatus === "registered") {
      return (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-emerald-500 font-medium">✓ Registered</span>
          <button onClick={() => handleCancel(item.id)} disabled={isBusy} className="text-xs text-red-500 underline">
            Cancel
          </button>
        </div>
      );
    }
    if (myStatus === "waitlisted") {
      return (
        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm text-amber-500 font-medium">
            On waitlist{waitlistPositions[item.id] ? ` — #${waitlistPositions[item.id]}` : ""}
          </span>
          <button onClick={() => handleCancel(item.id)} disabled={isBusy} className="text-xs text-red-500 underline">
            Leave waitlist
          </button>
        </div>
      );
    }
    return (
      <button
        onClick={() => handleRegister(item.id)}
        disabled={isBusy}
        className="mt-4 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-60"
      >
        {isBusy ? "Registering..." : seatsLeft > 0 ? "Register" : "Join Waitlist"}
      </button>
    );
  }

  return (
    <div className="p-6 space-y-3">
      {events.map((item) => {
        const seatsLeft = item.seats_total - item.seats_filled;
        const myStatus = myRegistrations[item.id];

        return (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className={`${cardBg} border ${border} rounded-xl p-4 text-left w-full hover:border-blue-400 transition-colors`}
          >
            <p className={`font-medium ${textPrimary}`}>{item.title}</p>
            <p className={`text-sm ${textSecondary} mt-1 line-clamp-2`}>{item.description}</p>
            <p className={`text-sm ${textSecondary} mt-2`}>
              {item.venue} • {new Date(item.start_time).toLocaleString()}
            </p>
            <p className={`text-xs mt-1 ${seatsLeft > 0 ? textSecondary : "text-amber-500"}`}>
              {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full — waitlist available"}
            </p>
            {myStatus === "registered" && <span className="text-xs text-emerald-500 font-medium mt-1 block">✓ Registered</span>}
            {myStatus === "waitlisted" && <span className="text-xs text-amber-500 font-medium mt-1 block">On waitlist</span>}
          </button>
        );
      })}

      {selected && (
        <DetailModal darkMode={darkMode} onClose={() => setSelected(null)}>
          <h2 className={`text-xl font-semibold ${textPrimary} mb-2 pr-8`}>{selected.title}</h2>
          <p className={`text-sm ${textPrimary} whitespace-pre-wrap leading-relaxed mb-4`}>{selected.description}</p>
          <div className={`text-sm ${textSecondary} space-y-1`}>
            <p>📍 {selected.venue}</p>
            <p>🕒 {new Date(selected.start_time).toLocaleString()}</p>
            <p>
              {selected.seats_total - selected.seats_filled > 0
                ? `${selected.seats_total - selected.seats_filled} seats left`
                : "Full — waitlist available"}
            </p>
            {selected.award_title && <p>🏅 {selected.award_title}</p>}
          </div>
          {renderActions(selected)}
        </DetailModal>
      )}
    </div>
  );
}