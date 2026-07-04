export default function Certificates({ darkMode }) {
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  return (
    <div className="p-8 text-center">
      <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>No certificates yet</h2>
      <p className={`text-sm ${textSecondary}`}>Certificates and awards you've earned will show up here.</p>
    </div>
  );
}