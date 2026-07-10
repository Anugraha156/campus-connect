import { useState, useEffect } from "react";
import { Check, X, Trophy, UserMinus, Search, UserPlus, Clock } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

export default function AttendanceManager({ darkMode }) {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [attendedIds, setAttendedIds] = useState(new Set());
  const [winners, setWinners] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [winnerFormId, setWinnerFormId] = useState(null);
  const [winnerTitle, setWinnerTitle] = useState("");
  const [addRegNumber, setAddRegNumber] = useState("");
  const [addBusy, setAddBusy] = useState(false);
  const [addMessage, setAddMessage] = useState("");

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const inputBg = darkMode ? "bg-neutral-700" : "bg-neutral-50";

  const selectedEvent = events.find((ev) => ev.id === selectedEventId);
  const eventHasStarted = selectedEvent && new Date(selectedEvent.start_time) <= new Date();
  const certificatesEnabled = selectedEvent?.certificates_enabled && selectedEvent?.award_title;

  useEffect(() => {
    async function fetchEvents() {
      const { data } = await supabase
        .from("events")
        .select("id, title, start_time, certificates_enabled, award_title")
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

    const { data: winnerData } = await supabase
      .from("certificates")
      .select("student_id, title")
      .eq("event_id", eventId)
      .eq("type", "winner");

    const winnerMap = {};
    (winnerData || []).forEach((w) => { winnerMap[w.student_id] = w.title; });

    setRegistrations(regData || []);
    setAttendedIds(new Set((attData || []).map((a) => a.student_id)));
    setWinners(winnerMap);
    setLoading(false);
  }

  useEffect(() => {
    if (selectedEventId) fetchRegistrationsAndAttendance(selectedEventId);
  }, [selectedEventId]);

  async function markPresent(studentId) {
    if (!eventHasStarted) {
      alert("You can't mark attendance before the event starts.");
      return;
    }
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
    fetchRegistrationsAndAttendance(selectedEventId);
    setBusyId(null);
  }

  async function saveWinner(studentId) {
    if (!winnerTitle.trim()) return;
    setBusyId(studentId);

    await supabase
      .from("certificates")
      .delete()
      .eq("student_id", studentId)
      .eq("event_id", selectedEventId)
      .eq("type", "participation");

    const { error } = await supabase.from("certificates").upsert(
      {
        student_id: studentId,
        event_id: selectedEventId,
        title: winnerTitle.trim(),
        type: "winner",
      },
      { onConflict: "student_id,event_id,type" }
    );
    if (error) alert(error.message);
    else setWinners((prev) => ({ ...prev, [studentId]: winnerTitle.trim() }));
    setWinnerFormId(null);
    setWinnerTitle("");
    setBusyId(null);
  }

  async function removeWinner(studentId) {
    if (!confirm("Remove winner certificate for this student?")) return;
    setBusyId(studentId);
    await supabase
      .from("certificates")
      .delete()
      .eq("student_id", studentId)
      .eq("event_id", selectedEventId)
      .eq("type", "winner");

    if (certificatesEnabled && attendedIds.has(studentId)) {
      await supabase.from("certificates").upsert(
        {
          student_id: studentId,
          event_id: selectedEventId,
          title: selectedEvent.award_title,
          type: "participation",
        },
        { onConflict: "student_id,event_id,type" }
      );
    }

    setWinners((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    setBusyId(null);
  }

  async function cancelRegistration(studentId) {
    if (!confirm("Remove this student's registration entirely? This cannot be undone.")) return;
    setBusyId(studentId);
    const { error } = await supabase.rpc("cancel_registration", {
      p_event_id: selectedEventId,
      p_student_id: studentId,
    });
    if (error) alert(error.message);
    fetchRegistrationsAndAttendance(selectedEventId);
    setBusyId(null);
  }

  async function handleAddStudent() {
    if (!addRegNumber.trim()) return;
    setAddBusy(true);
    setAddMessage("");

    const { data: student, error: lookupError } = await supabase
      .from("students")
      .select("id, full_name")
      .eq("reg_number", addRegNumber.trim())
      .single();

    if (lookupError || !student) {
      setAddMessage("No student found with that registration number.");
      setAddBusy(false);
      return;
    }

    const { data: status, error: regError } = await supabase.rpc("register_for_event", {
      p_event_id: selectedEventId,
      p_student_id: student.id,
    });

    if (regError) {
      setAddMessage(regError.message);
    } else if (status === "already_registered") {
      setAddMessage(`${student.full_name} is already registered.`);
    } else {
      setAddMessage(`${student.full_name} added as ${status}.`);
      setAddRegNumber("");
      fetchRegistrationsAndAttendance(selectedEventId);
    }
    setAddBusy(false);
  }

  return (
    <div className="p-6">
      <h2 className={`text-lg font-semibold ${textPrimary} mb-4`}>Manual Attendance and Registrations</h2>

      {events.length === 0 ? (
        <p className={textSecondary}>No events created yet.</p>
      ) : (
        <>
          <label className={`block text-xs ${textSecondary} mb-1`}>Select Event</label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className={`w-full max-w-md px-3 py-2 mb-2 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} — {new Date(ev.start_time).toLocaleDateString()}
              </option>
            ))}
          </select>

          {selectedEvent && !eventHasStarted && (
            <p className="text-xs text-amber-500 mb-1 flex items-center gap-1.5">
              <Clock size={13} /> This event starts {new Date(selectedEvent.start_time).toLocaleString()}. Attendance can be marked once it begins.
            </p>
          )}
          {selectedEvent && eventHasStarted && (
            <p className={`text-xs ${textSecondary} mb-1`}>Event started. Attendance can be marked.</p>
          )}
          {selectedEvent && !certificatesEnabled && (
            <p className={`text-xs ${textSecondary} mb-4`}>Certificates are not enabled for this event.</p>
          )}
          {selectedEvent && certificatesEnabled && <div className="mb-4" />}

          <div className={`${cardBg} border ${border} rounded-xl p-4 mb-5 max-w-md`}>
            <p className={`text-xs font-medium ${textSecondary} mb-2 flex items-center gap-1.5`}>
              <UserPlus size={14} /> Add student to this event
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${textSecondary}`} />
                <input
                  value={addRegNumber}
                  onChange={(e) => setAddRegNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddStudent()}
                  placeholder="Registration number"
                  className={`w-full pl-8 pr-3 py-2 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
                />
              </div>
              <button
                onClick={handleAddStudent}
                disabled={addBusy}
                className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
              >
                Add
              </button>
            </div>
            {addMessage && <p className={`text-xs mt-2 ${textSecondary}`}>{addMessage}</p>}
          </div>

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
                const winnerTitleForStudent = winners[reg.student_id];
                const isEditingWinner = winnerFormId === reg.student_id;
                const isWaitlisted = reg.status === "waitlisted";

                return (
                  <div
                    key={reg.id}
                    className={`${cardBg} border ${border} rounded-xl p-3`}
                  >
                    <div className="flex justify-between items-center gap-3 flex-wrap">
                      <div className="min-w-0">
                        <p className={`font-medium ${textPrimary} truncate`}>{student?.full_name}</p>
                        <p className={`text-xs ${textSecondary}`}>
                          {student?.reg_number} • {isWaitlisted ? "Waitlisted" : "Registered"}
                        </p>
                        {winnerTitleForStudent && (
                          <p className="text-xs font-medium text-amber-500 mt-1 flex items-center gap-1">
                            <Trophy size={12} /> {winnerTitleForStudent}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 flex-wrap shrink-0">
                        {isAttended ? (
                          <button
                            onClick={() => removeAttendance(reg.student_id)}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-500/30 px-3 py-1.5 rounded-lg disabled:opacity-60"
                          >
                            <X size={14} /> Remove attendance
                          </button>
                        ) : (
                          !isWaitlisted && (
                            <button
                              onClick={() => markPresent(reg.student_id)}
                              disabled={isBusy || !eventHasStarted}
                              title={!eventHasStarted ? "Event hasn't started yet" : ""}
                              className="flex items-center gap-1.5 text-xs font-medium text-emerald-500 border border-emerald-500/30 px-3 py-1.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <Check size={14} /> Mark Present
                            </button>
                          )
                        )}

                        {certificatesEnabled && isAttended && !winnerTitleForStudent && (
                          <button
                            onClick={() => { setWinnerFormId(reg.student_id); setWinnerTitle(""); }}
                            disabled={isBusy}
                            className="flex items-center gap-1.5 text-xs font-medium text-amber-500 border border-amber-500/30 px-3 py-1.5 rounded-lg disabled:opacity-60"
                          >
                            <Trophy size={14} /> Award Winner
                          </button>
                        )}

                        {winnerTitleForStudent && (
                          <button
                            onClick={() => removeWinner(reg.student_id)}
                            disabled={isBusy}
                            className="text-xs text-red-500 underline"
                          >
                            Remove winner
                          </button>
                        )}

                        {!eventHasStarted && (
                          <button
                            onClick={() => cancelRegistration(reg.student_id)}
                            disabled={isBusy}
                            className={`flex items-center gap-1.5 text-xs font-medium ${textSecondary} border ${border} px-3 py-1.5 rounded-lg disabled:opacity-60`}
                          >
                            <UserMinus size={14} /> Cancel registration
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditingWinner && (
                      <div className="flex gap-2 mt-3">
                        <input
                          autoFocus
                          value={winnerTitle}
                          onChange={(e) => setWinnerTitle(e.target.value)}
                          placeholder="e.g. 1st Place, Best Design"
                          className={`flex-1 px-3 py-1.5 rounded-lg border ${border} ${inputBg} ${textPrimary} text-sm outline-none`}
                        />
                        <button
                          onClick={() => saveWinner(reg.student_id)}
                          className="text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setWinnerFormId(null)}
                          className={`text-xs ${textSecondary}`}
                        >
                          Cancel
                        </button>
                      </div>
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