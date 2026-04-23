// SlidePanel — 420px right drawer, ESC + overlay close.
import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  width?: string;
};

export function SlidePanel({ open, onClose, title, children, width = "420px" }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 animate-fade-in"
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 h-full bg-card shadow-shell flex flex-col animate-slide-in-right",
        )}
        style={{ width: `min(${width}, 100vw)` }}
      >
        <header className="flex items-center justify-between px-6 h-16 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </aside>
    </div>
  );
}
