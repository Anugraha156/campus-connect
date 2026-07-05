export default function AttendanceManager({ darkMode }) {
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  return (
    <div className="p-8 text-center">
      <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>Manual attendance</h2>
      <p className={`text-sm ${textSecondary}`}>Adjust attendance for any event and student here.</p>
    </div>
  );
}