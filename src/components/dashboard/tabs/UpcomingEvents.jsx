import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";
import DetailModal from "../DetailModal";

function DateBadge({ date, darkMode }) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const bg = darkMode ? "bg-blue-500/15" : "bg-blue-50";

  return (
    <div className={`${bg} rounded-lg w-14 h-14 flex flex-col items-center justify-center shrink-0`}>
      <span className="text-[10px] font-semibold text-blue-500 leading-none">{month}</span>
      <span className="text-xl font-bold text-blue-500 leading-tight">{day}</span>
    </div>
  );
}

export default function UpcomingEvents({ darkMode, user }) {
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState({});
  const [waitlistPositions, setWaitlistPositions] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";
  const sidebarBg = darkMode ? "bg-neutral-800" : "bg-white";

  async function fetchData() {
    setLoading(true);
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .gt("start_time", new Date().toISOString())
      .order("start_time", { ascending: true });

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

  // Sidebar stats
  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thisWeekCount = events.filter((e) => new Date(e.start_time) <= weekFromNow).length;
  const fillingFast = events.filter((e) => {
    const left = e.seats_total - e.seats_filled;
    return e.seats_total > 0 && left > 0 && left / e.seats_total <= 0.2;
  });

  const filteredEvents = events.filter((e) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return e.title.toLowerCase().includes(q) || (e.venue || "").toLowerCase().includes(q);
  });

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
      {/* Main list */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-medium ${textPrimary} mb-4 flex items-center gap-1.5`}>
          <span className="text-blue-500"></span> Click on an event to read the full details
        </p>

        <div className="space-y-2.5">
          {filteredEvents.length === 0 ? (
            <p className={`text-sm ${textSecondary}`}>No events match your search.</p>
          ) : (
            filteredEvents.map((item) => {
              const myStatus = myRegistrations[item.id];
              const seatsLeft = item.seats_total - item.seats_filled;

              const statusBorder =
                myStatus === "registered"
                  ? "border-l-emerald-500"
                  : myStatus === "waitlisted"
                  ? "border-l-amber-500"
                  : "border-l-transparent";

              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`${cardBg} border ${border} border-l-4 ${statusBorder} rounded-xl p-4 text-left w-full flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all`}
                >
                  <DateBadge date={item.start_time} darkMode={darkMode} />

                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold ${textPrimary} truncate`}>{item.title}</p>
                    <p className={`text-sm ${textSecondary} mt-0.5 truncate`}>
                      {item.venue} • {new Date(item.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {myStatus === "registered" && (
                        <span className="text-xs text-emerald-500 font-medium">✓ Registered</span>
                      )}
                      {myStatus === "waitlisted" && (
                        <span className="text-xs text-amber-500 font-medium">On waitlist</span>
                      )}
                      {!myStatus && (
                        <span className={`text-xs ${seatsLeft > 0 ? textSecondary : "text-amber-500"}`}>
                          {seatsLeft > 0 ? `${seatsLeft} seats left` : "Full — waitlist"}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-72 shrink-0 space-y-4">
        <div className={`${sidebarBg} border ${border} rounded-xl p-4`}>
          <label className={`block text-xs font-medium ${textSecondary} mb-2`}>Search events</label>
          <div className="relative">
            <Search size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title or venue..."
              className={`w-full pl-9 pr-3 py-2 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
        </div>

        <div className={`${sidebarBg} border ${border} rounded-xl p-4`}>
          <p className={`text-xs font-medium ${textSecondary} mb-3`}>Quick stats</p>
          <div className="space-y-2.5">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${textPrimary}`}>Total upcoming</span>
              <span className="text-sm font-semibold text-blue-500">{events.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${textPrimary}`}>This week</span>
              <span className="text-sm font-semibold text-blue-500">{thisWeekCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${textPrimary}`}>Filling fast</span>
              <span className="text-sm font-semibold text-amber-500">{fillingFast.length}</span>
            </div>
          </div>
        </div>

        {fillingFast.length > 0 && (
          <div className={`${sidebarBg} border ${border} rounded-xl p-4`}>
            <p className={`text-xs font-medium ${textSecondary} mb-3`}>⚡ Filling fast</p>
            <div className="space-y-2">
              {fillingFast.slice(0, 3).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`block w-full text-left text-sm ${textPrimary} hover:text-blue-500 transition-colors truncate`}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {selected && (
        <DetailModal darkMode={darkMode} onClose={() => setSelected(null)}>
          <h2 className={`text-xl font-semibold ${textPrimary} mb-3 pr-8`}>{selected.title}</h2>

          <p className={`text-sm ${textPrimary} whitespace-pre-wrap leading-relaxed mb-4`}>{selected.description}</p>

          <div className={`text-sm ${textSecondary} space-y-1.5 border-t ${border} pt-4`}>
            <p><span className={textPrimary}>{selected.venue}</span></p>
            <p><span className={textPrimary}>{new Date(selected.start_time).toLocaleString()}</span></p>
            <p>
              {" "}
              <span className={textPrimary}>
                {selected.seats_total - selected.seats_filled > 0
                  ? `${selected.seats_total - selected.seats_filled} of ${selected.seats_total} seats left`
                  : `Full (${selected.seats_total}/${selected.seats_total}) — waitlist available`}
              </span>
            </p>
            {selected.award_title && (
              <p> <span className={textPrimary}>{selected.award_title}</span></p>
            )}
          </div>

          {renderActions(selected)}
        </DetailModal>
      )}
    </div>
  );
}