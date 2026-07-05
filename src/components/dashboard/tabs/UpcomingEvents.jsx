import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";

export default function UpcomingEvents({ darkMode, user }) {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState({}); // event_id -> status
  const [waitlistPositions, setWaitlistPositions] = useState({}); // event_id -> position
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // event_id currently processing

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
  }

  useEffect(() => { fetchData(); }, [user.id]);

  async function handleRegister(eventId) {
    setActionLoading(eventId);
    const { error } = await supabase.rpc("register_for_event", {
      p_event_id: eventId,
      p_student_id: user.id,
    });
    if (error) {
      alert(error.message);
    }
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
    if (error) {
      alert(error.message);
    }
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

  return (
    <div className="p-6 space-y-3">
      {events.map((item) => {
        const seatsLeft = item.seats_total - item.seats_filled;
        const myStatus = myRegistrations[item.id];
        const isBusy = actionLoading === item.id;

        return (
          <div key={item.id} className={`${cardBg} border ${border} rounded-xl p-4`}>
            <p className={`font-medium ${textPrimary}`}>{item.title}</p>
            <p className={`text-sm ${textSecondary} mt-1`}>{item.description}</p>
            <p className={`text-sm ${textSecondary} mt-2`}>
              {item.venue} • {new Date(item.start_time).toLocaleString()}
            </p>
            <p className={`text-xs mt-1 ${seatsLeft > 0 ? textSecondary : "text-amber-500"}`}>
              {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full — waitlist available"}
            </p>
            {item.award_title && <p className={`text-xs ${textSecondary} mt-1`}>Award: {item.award_title}</p>}

            {myStatus === "registered" && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-emerald-500 font-medium">✓ Registered</span>
                <button
                  onClick={() => handleCancel(item.id)}
                  disabled={isBusy}
                  className="text-xs text-red-500 underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {myStatus === "waitlisted" && (
              <div className="mt-3 flex items-center gap-3">
                <span className="text-sm text-amber-500 font-medium">
                  On waitlist{waitlistPositions[item.id] ? ` — #${waitlistPositions[item.id]}` : ""}
                </span>
                <button
                  onClick={() => handleCancel(item.id)}
                  disabled={isBusy}
                  className="text-xs text-red-500 underline"
                >
                  Leave waitlist
                </button>
              </div>
            )}

            {!myStatus && (
              <button
                onClick={() => handleRegister(item.id)}
                disabled={isBusy}
                className="mt-3 text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg disabled:opacity-60"
              >
                {isBusy ? "Registering..." : seatsLeft > 0 ? "Register" : "Join Waitlist"}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}