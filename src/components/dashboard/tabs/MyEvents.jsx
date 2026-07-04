export default function MyEvents({ darkMode }) {
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  return (
    <div className="p-8 text-center">
      <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>You haven't registered for any events</h2>
      <p className={`text-sm ${textSecondary}`}>Registered events, attendance, and feedback will show up here.</p>
    </div>
  );
}