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
        className={`${cardBg} border ${border} rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto relative`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 ${textSecondary} hover:opacity-70`}
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}