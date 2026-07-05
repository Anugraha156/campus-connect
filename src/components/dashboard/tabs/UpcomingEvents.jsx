import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";

export default function UpcomingEvents({ darkMode }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from("events")
        .select("*")
        .gt("start_time", new Date().toISOString())
        .order("start_time");
      setEvents(data || []);
      setLoading(false);
    }
    fetchEvents();
  }, []);

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
            <button
              disabled
              className="mt-3 text-sm bg-blue-500/50 text-white px-4 py-1.5 rounded-lg cursor-not-allowed"
              title="Registration coming in the next update"
            >
              Register (coming soon)
            </button>
          </div>
        );
      })}
    </div>
  );
}