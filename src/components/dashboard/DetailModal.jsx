import { X } from "lucide-react";

export default function DetailModal({ darkMode, onClose, children }) {
  const cardBg = darkMode ? "bg-neutral-800" : "bg-white";
  const border = darkMode ? "border-neutral-700" : "border-neutral-200";
  const textSecondary = darkMode ? "text-slate-400" : "text-slate-500";

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`${cardBg} border ${border} rounded-2xl w-[95vw] max-w-5xl max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dedicated header strip, always separate from content/images below */}
        <div className={`flex justify-end items-center px-4 py-3 border-b ${border} shrink-0`}>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center ${textSecondary} hover:bg-black/5 transition-colors`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content area, image and text both live here */}
        <div className="overflow-y-auto overscroll-contain px-6 py-5">
        {children}
        </div>
      </div>
    </div>
  );
}