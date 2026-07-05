import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X } from "lucide-react";

export default function ScannerModal({ darkMode, onScan, onClose }) {
  const scannerRef = useRef(null);
  const isRunningRef = useRef(false);
  const [error, setError] = useState("");

  const textPrimary = darkMode ? "text-white" : "text-slate-900";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";

  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 220 },
        (decodedText) => {
          if (isRunningRef.current) {
            isRunningRef.current = false;
            scanner
              .stop()
              .catch(() => {})
              .finally(() => onScan(decodedText));
          }
        },
        () => {} // ignore per-frame scan failures
      )
      .then(() => {
        if (cancelled) {
          // component was unmounted before start() resolved; stop immediately
          scanner.stop().catch(() => {});
        } else {
          isRunningRef.current = true;
        }
      })
      .catch(() => setError("Could not access camera. Check permissions."));

    return () => {
      cancelled = true;
      if (isRunningRef.current) {
        isRunningRef.current = false;
        scanner.stop().catch(() => {});
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} border ${border} rounded-2xl p-6 w-full max-w-sm`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`font-semibold ${textPrimary}`}>Scan Event QR</h3>
          <button onClick={onClose}><X size={18} className={textSecondary} /></button>
        </div>

        {error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <div id="qr-reader" className="rounded-xl overflow-hidden" />
        )}

        <p className={`text-xs ${textSecondary} mt-3 text-center`}>
          Point your camera at the QR code shown by the event organizer.
        </p>
      </div>
    </div>
  );
}