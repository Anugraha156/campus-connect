import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function EventsCalendar({ events, darkMode, onSelectEvent, title = "Calendar" }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [hoveredDate, setHoveredDate] = useState(null);
  const [selectedDateKey, setSelectedDateKey] = useState(null);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const todayBg = darkMode ? "bg-blue-500/20" : "bg-blue-50";

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const key = toDateKey(new Date(ev.start_time));
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    });
    return map;
  }, [events]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const today = new Date();
  const todayKey = toDateKey(today);

  function goPrevMonth() {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDateKey(null);
  }
  function goNextMonth() {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDateKey(null);
  }

  const monthLabel = viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const selectedEvents = selectedDateKey ? (eventsByDate[selectedDateKey] || []) : [];

  return (
    <div className={`${cardBg} border ${border} rounded-2xl p-4`}>
  <p className={`text-[10px] font-semibold uppercase tracking-wide ${textSecondary} mb-2`}>{title}</p>
  <div className="flex items-center justify-between mb-3">
        <button onClick={goPrevMonth} className={`p-1.5 rounded-lg hover:bg-black/5 ${textSecondary}`}>
          <ChevronLeft size={16} />
        </button>
        <p className={`text-xs font-semibold ${textPrimary} flex items-center gap-1.5`}>
  <CalendarDays size={13} className="text-blue-500" /> {monthLabel}
</p>
        <button onClick={goNextMonth} className={`p-1.5 rounded-lg hover:bg-black/5 ${textSecondary}`}>
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekdayLabels.map((wd) => (
          <div key={wd} className={`text-center text-[9px] font-semibold uppercase ${textSecondary} py-1`}>
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (day === null) return <div key={idx} />;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayEvents = eventsByDate[dateKey] || [];
          const hasEvents = dayEvents.length > 0;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;

          return (
            <div key={idx} className="relative">
              <button
                type="button"
                onClick={() => setSelectedDateKey(isSelected ? null : dateKey)}
                onMouseEnter={() => setHoveredDate(dateKey)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-xs transition-colors
                  ${isSelected ? "bg-blue-500 text-white" : isToday ? `${todayBg} ${textPrimary}` : `${textPrimary} hover:bg-black/5`}
                `}
              >
                {day}
                {hasEvents && (
                  <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : "bg-blue-500"}`} />
                )}
              </button>

              {hoveredDate === dateKey && hasEvents && (
                <div className={`absolute z-30 top-full left-1/2 -translate-x-1/2 mt-1 w-44 ${cardBg} border ${border} rounded-lg shadow-lg p-2`}>
                  {dayEvents.map((ev) => (
                    <p key={ev.id} className={`text-xs ${textPrimary} py-0.5 truncate`}>{ev.title}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedDateKey && (
        <div className={`mt-3 pt-3 border-t ${border}`}>
          <p className={`text-xs font-medium ${textSecondary} mb-2`}>
            {selectedEvents.length === 0 ? "No events on this date" : "Events on this date"}
          </p>
          <div className="space-y-1.5">
            {selectedEvents.map((ev) => (
              <button
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                className={`block w-full text-left text-xs ${textPrimary} hover:text-blue-500 transition-colors truncate`}
              >
                {ev.title} — {new Date(ev.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}