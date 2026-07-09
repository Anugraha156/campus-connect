import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { supabase } from "../../../config/supabaseClient";

export default function AdminFeedback({ darkMode }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [attendedCount, setAttendedCount] = useState(0);
  const [notAttendedCount, setNotAttendedCount] = useState(0);
  const [ratingCounts, setRatingCounts] = useState([1, 2, 3, 4, 5].map((r) => ({ rating: String(r), count: 0 })));
  const [averageRating, setAverageRating] = useState(null);
  const [totalRatings, setTotalRatings] = useState(0);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";
  const gridColor = darkMode ? "#404040" : "#e5e5e5";
  const axisColor = darkMode ? "#a3a3a3" : "#737373";

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase.from("events").select("id, title, start_time").order("start_time", { ascending: false });
      setEvents(data || []);
      if (data && data.length > 0) setSelectedEventId(data[0].id);
      setLoading(false);
    }
    fetchEvents();
  }, []);

  useEffect(() => {
    if (!selectedEventId) return;

    async function fetchStats() {
      setLoading(true);

      const { count: registeredCount } = await supabase
        .from("registrations")
        .select("*", { count: "exact", head: true })
        .eq("event_id", selectedEventId)
        .eq("status", "registered");

      const { count: attCount } = await supabase
        .from("attendance")
        .select("*", { count: "exact", head: true })
        .eq("event_id", selectedEventId);

      const attended = attCount || 0;
      const notAttended = Math.max(0, (registeredCount || 0) - attended);
      setAttendedCount(attended);
      setNotAttendedCount(notAttended);

      const { data: feedbackData } = await supabase
        .from("feedback")
        .select("rating")
        .eq("event_id", selectedEventId);

      const counts = [1, 2, 3, 4, 5].map((star) => ({
        rating: String(star),
        count: (feedbackData || []).filter((f) => f.rating === star).length,
      }));
      setRatingCounts(counts);

      const total = (feedbackData || []).length;
      setTotalRatings(total);
      if (total > 0) {
        const sum = (feedbackData || []).reduce((acc, f) => acc + f.rating, 0);
        setAverageRating((sum / total).toFixed(1));
      } else {
        setAverageRating(null);
      }

      setLoading(false);
    }
    fetchStats();
  }, [selectedEventId]);

  const attendanceTotal = attendedCount + notAttendedCount;
  const pieData = [
    { name: "Attended", value: attendedCount },
    { name: "Not Attended", value: notAttendedCount },
  ];
  const pieColors = ["#10b981", darkMode ? "#525252" : "#d4d4d4"];

  const maxCount = Math.max(...ratingCounts.map((c) => c.count), 0);
  const niceMax = Math.max(10, Math.ceil(maxCount / 10) * 10);
  const yTicks = [];
  for (let i = 0; i <= niceMax; i += 10) yTicks.push(i);

  return (
    <div className="p-6">
      <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>Feedback and Attendance Analytics</h2>

      {events.length === 0 ? (
        <p className={textSecondary}>No events created yet.</p>
      ) : (
        <>
          <label className={`block text-xs ${textSecondary} mb-1`}>Select Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className={`w-full max-w-md px-3 py-2 mb-6 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — {new Date(ev.start_time).toLocaleDateString()}
              </option>
            ))}
          </select>

          {loading ? (
            <p className={textSecondary}>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className={`${cardBg} border ${border} rounded-2xl p-5`}>
                <p className={`text-sm font-medium ${textPrimary} mb-1`}>Attendance</p>
                <p className={`text-xs ${textSecondary} mb-4`}>Registered students who attended versus those who did not</p>

                {attendanceTotal === 0 ? (
                  <p className={`text-sm ${textSecondary}`}>No registrations yet for this event.</p>
                ) : (
                  <>
                    <div style={{ width: "100%", height: 240 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, value }) =>
                              `${name}: ${attendanceTotal > 0 ? Math.round((value / attendanceTotal) * 100) : 0}%`
                            }
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={entry.name} fill={pieColors[index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className={`text-xs ${textSecondary} mt-2 text-center`}>
                      {attendedCount} attended out of {attendanceTotal} registered
                    </p>
                  </>
                )}
              </div>

              <div className={`${cardBg} border ${border} rounded-2xl p-5`}>
                <p className={`text-sm font-medium ${textPrimary} mb-1`}>Rating Distribution</p>
                <p className={`text-xs ${textSecondary} mb-4`}>Number of students who gave each star rating</p>

                {totalRatings === 0 ? (
                  <p className={`text-sm ${textSecondary}`}>No ratings submitted yet for this event.</p>
                ) : (
                  <div style={{ width: "100%", height: 240 }}>
                    <ResponsiveContainer>
                      <BarChart data={ratingCounts}>
                        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                        <XAxis dataKey="rating" stroke={axisColor} tick={{ fill: axisColor, fontSize: 12 }} />
                        <YAxis
                          stroke={axisColor}
                          tick={{ fill: axisColor, fontSize: 12 }}
                          domain={[0, niceMax]}
                          ticks={yTicks}
                          allowDecimals={false}
                        />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className={`mt-4 pt-4 border-t ${border} text-center`}>
                  <p className={`text-xs ${textSecondary} mb-1`}>Average rating</p>
                  <p className={`text-2xl font-bold ${textPrimary}`}>
                    {averageRating !== null ? `${averageRating} out of 5` : "No ratings yet"}
                  </p>
                  {totalRatings > 0 && (
                    <p className={`text-xs ${textSecondary} mt-1`}>Based on {totalRatings} rating{totalRatings === 1 ? "" : "s"}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}