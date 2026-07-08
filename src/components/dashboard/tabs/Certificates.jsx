import { useState, useEffect } from "react";
import { Trophy, Award } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

export default function Certificates({ darkMode, user }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

  useEffect(() => {
    async function fetchCertificates() {
      const { data } = await supabase
        .from("certificates")
        .select("id, title, type, issued_at, events(title, start_time, venue)")
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false });
      setCertificates(data || []);
      setLoading(false);
    }
    fetchCertificates();
  }, [user.id]);

  if (loading) return <p className={`p-8 text-center ${textSecondary}`}>Loading...</p>;

  if (certificates.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>No certificates yet</h2>
        <p className={`text-sm ${textSecondary}`}>Certificates you earn from attending events will show up here.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className={`text-base font-semibold ${textPrimary} mb-4`}>Certificates & Awards</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {certificates.map((cert) => {
          const isWinner = cert.type === "winner";

          const cardStyle = isWinner
            ? darkMode
              ? "bg-gradient-to-br from-amber-500/15 to-amber-600/5 border-amber-500/40"
              : "bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-300"
            : darkMode
            ? "bg-neutral-800 border-neutral-700"
            : "bg-white border-neutral-200";

          const iconBg = isWinner
            ? "bg-amber-500 text-white"
            : darkMode
            ? "bg-blue-500/15 text-blue-400"
            : "bg-blue-50 text-blue-500";

          return (
            <div key={cert.id} className={`border rounded-2xl p-5 ${cardStyle}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}>
                  {isWinner ? <Trophy size={18} /> : <Award size={18} />}
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${isWinner ? "text-amber-500" : "text-blue-500"}`}>
                    {isWinner ? "Winner" : "Participation"}
                  </p>
                  <p className={`font-semibold ${textPrimary} leading-snug mt-0.5`}>{cert.title}</p>
                  <p className={`text-sm ${textSecondary} mt-1`}>{cert.events?.title}</p>
                  <p className={`text-xs ${textSecondary} mt-1`}>
                    {cert.events?.venue} • {cert.events && new Date(cert.events.start_time).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}