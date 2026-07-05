import { useState, useEffect } from "react";
import { supabase } from "../../../config/supabaseClient";

export default function MyEvents({ darkMode, user }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

  async function fetchRegistrations() {
    setLoading(true);
    const { data } = await supabase
      .from("registrations")
      .select("id, status, registered_at, events(id, title, venue, start_time, award_title)")
      .eq("student_id", user.id)
      .order("registered_at", { ascending: false });
    setRegistrations(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchRegistrations(); }, [user.id]);

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
      {registrations.map((reg) => {
        const event = reg.events;
        const isPast = event && new Date(event.start_time) < new Date();
        return (
          <div key={reg.id} className={`${cardBg} border ${border} rounded-xl p-4`}>
            <p className={`font-medium ${textPrimary}`}>{event?.title}</p>
            <p className={`text-sm ${textSecondary} mt-1`}>
              {event?.venue} • {event && new Date(event.start_time).toLocaleString()}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {reg.status === "registered" && (
                <span className="text-xs font-medium text-emerald-500">✓ Registered</span>
              )}
              {reg.status === "waitlisted" && (
                <span className="text-xs font-medium text-amber-500">On waitlist</span>
              )}
              {isPast && <span className={`text-xs ${textSecondary}`}>• Event has passed</span>}
            </div>
            {event?.award_title && (
              <p className={`text-xs ${textSecondary} mt-1`}>Award: {event.award_title}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}