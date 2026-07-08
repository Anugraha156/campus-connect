import { useState, useEffect } from "react";
import { Trophy, Award, Calendar, MapPin } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

function CertificateCard({ cert, darkMode }) {
  const isWinner = cert.type === "winner";
  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  const outerBg = isWinner
    ? darkMode
      ? "bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-transparent"
      : "bg-gradient-to-br from-amber-50 via-amber-100/60 to-white"
    : darkMode
    ? "bg-neutral-800"
    : "bg-white";

  const outerBorder = isWinner ? "border-amber-400/50" : darkMode ? "border-neutral-700" : "border-neutral-200";
  const innerBorder = isWinner ? "border-amber-400/40" : darkMode ? "border-neutral-700" : "border-neutral-200";
  const badgeBg = isWinner ? "bg-gradient-to-br from-amber-400 to-amber-600" : darkMode ? "bg-blue-500/20" : "bg-blue-50";
  const badgeIconColor = isWinner ? "text-white" : "text-blue-500";
  const accentColor = isWinner ? "text-amber-500" : "text-blue-500";

  return (
    <div className={`relative rounded-2xl border ${outerBorder} ${outerBg} p-1.5`}>
      {/* Decorative corner dots, like a certificate seal border */}
      <div className={`absolute top-3 left-3 w-1.5 h-1.5 rounded-full ${isWinner ? "bg-amber-400" : darkMode ? "bg-neutral-600" : "bg-neutral-300"}`} />
      <div className={`absolute top-3 right-3 w-1.5 h-1.5 rounded-full ${isWinner ? "bg-amber-400" : darkMode ? "bg-neutral-600" : "bg-neutral-300"}`} />
      <div className={`absolute bottom-3 left-3 w-1.5 h-1.5 rounded-full ${isWinner ? "bg-amber-400" : darkMode ? "bg-neutral-600" : "bg-neutral-300"}`} />
      <div className={`absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full ${isWinner ? "bg-amber-400" : darkMode ? "bg-neutral-600" : "bg-neutral-300"}`} />

      <div className={`border ${innerBorder} border-dashed rounded-xl px-6 py-7 flex flex-col items-center text-center`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 shadow-sm ${badgeBg}`}>
          {isWinner ? <Trophy size={24} className={badgeIconColor} /> : <Award size={24} className={badgeIconColor} />}
        </div>

        <p className={`text-[10px] font-semibold uppercase tracking-[0.15em] ${accentColor} mb-1.5`}>
          {isWinner ? "Certificate of Achievement" : "Certificate of Participation"}
        </p>

        <h3 className={`font-serif text-lg font-semibold ${textPrimary} leading-snug mb-1`}>
          {cert.title}
        </h3>

        <p className={`text-sm ${textSecondary} mb-3`}>{cert.events?.title}</p>

        <div className={`w-10 h-px ${isWinner ? "bg-amber-400/50" : darkMode ? "bg-neutral-700" : "bg-neutral-200"} mb-3`} />

        <div className={`flex flex-col gap-1 text-xs ${textSecondary}`}>
          {cert.events?.venue && (
            <span className="flex items-center gap-1 justify-center">
              <MapPin size={11} /> {cert.events.venue}
            </span>
          )}
          {cert.events?.start_time && (
            <span className="flex items-center gap-1 justify-center">
              <Calendar size={11} /> {new Date(cert.events.start_time).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Certificates({ darkMode, user }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const statBg = darkMode ? "bg-neutral-800" : "bg-white";

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
      <div className="p-10 text-center">
        <div className={`w-16 h-16 rounded-full ${darkMode ? "bg-neutral-800" : "bg-neutral-100"} flex items-center justify-center mx-auto mb-4`}>
          <Award size={26} className={textSecondary} />
        </div>
        <h2 className={`text-lg font-semibold ${textPrimary} mb-1`}>No certificates yet</h2>
        <p className={`text-sm ${textSecondary}`}>Attend events to start earning certificates and awards.</p>
      </div>
    );
  }

  const winnerCount = certificates.filter((c) => c.type === "winner").length;
  const participationCount = certificates.length - winnerCount;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <h2 className={`text-base font-semibold ${textPrimary}`}>Certificates & Awards</h2>
        <div className="flex gap-2">
          <div className={`${statBg} border ${border} rounded-lg px-3 py-1.5 flex items-center gap-1.5`}>
            <Trophy size={13} className="text-amber-500" />
            <span className={`text-xs font-medium ${textPrimary}`}>{winnerCount} winner</span>
          </div>
          <div className={`${statBg} border ${border} rounded-lg px-3 py-1.5 flex items-center gap-1.5`}>
            <Award size={13} className="text-blue-500" />
            <span className={`text-xs font-medium ${textPrimary}`}>{participationCount} participation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map((cert) => (
          <CertificateCard key={cert.id} cert={cert} darkMode={darkMode} />
        ))}
      </div>
    </div>
  );
}