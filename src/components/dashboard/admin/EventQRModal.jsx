import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, RefreshCw } from "lucide-react";
import { supabase } from "../../../config/supabaseClient";

export default function EventQRModal({ event, darkMode, onClose }) {
  const [currentEvent, setCurrentEvent] = useState(event);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(Date.now());

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const isExpired = currentEvent.qr_expires_at && new Date(currentEvent.qr_expires_at).getTime() < now;
  const hasValidQr = currentEvent.qr_token && !isExpired;

  async function handleGenerate() {
    setLoading(true);
    const { error } = await supabase.rpc("generate_event_qr", { p_event_id: currentEvent.id });
    if (error) {
      alert(error.message);
    } else {
      const { data } = await supabase.from("events").select("*").eq("id", currentEvent.id).single();
      setCurrentEvent(data);
    }
    setLoading(false);
  }

  const secondsLeft = hasValidQr
    ? Math.max(0, Math.floor((new Date(currentEvent.qr_expires_at).getTime() - now) / 1000))
    : 0;
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const qrValue = JSON.stringify({ eventId: currentEvent.id, token: currentEvent.qr_token });

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} border ${border} rounded-2xl p-6 w-full max-w-sm text-center`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${textPrimary}`}>{currentEvent.title}</h3>
          <button onClick={onClose}><X size={18} className={textSecondary} /></button>
        </div>

        {hasValidQr ? (
          <>
            <div className="bg-white p-4 rounded-xl inline-block mb-4">
              <QRCodeSVG value={qrValue} size={200} />
            </div>
            <p className={`text-sm ${textSecondary} mb-4`}>
              Valid for {minutes}:{seconds.toString().padStart(2, "0")} more
            </p>
          </>
        ) : (
          <p className={`text-sm ${textSecondary} mb-4`}>
            {currentEvent.qr_token ? "QR code has expired." : "No QR code generated yet."}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
        >
          <RefreshCw size={16} />
          {loading ? "Generating..." : hasValidQr ? "Regenerate QR" : "Generate QR"}
        </button>
      </div>
    </div>
  );
}