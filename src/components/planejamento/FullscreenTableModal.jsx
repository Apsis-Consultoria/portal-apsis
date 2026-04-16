import { useEffect } from "react";
import { X } from "lucide-react";

export default function FullscreenTableModal({ open, onClose, title, children }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#F5F6F8]">
      {/* Header */}
      <div className="bg-[#134635] px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-md">
        <span className="text-white font-semibold text-sm tracking-wide">{title}</span>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
          Fechar (Esc)
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {children}
      </div>
    </div>
  );
}