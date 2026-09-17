"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SHORTCUTS = [
  { keys: "n", description: "Create a new task" },
  { keys: "/", description: "Focus search" },
  { keys: "Esc", description: "Close any open panel" },
  { keys: "?", description: "Show this shortcut sheet" },
];

export function ShortcutsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-black/40" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        className="relative w-full max-w-sm rounded-2xl bg-parchment-cream p-6 shadow-subtle-3"
      >
        <div className="flex items-center justify-between">
          <h2 id="shortcuts-title" className="text-body font-semibold text-ink-black">
            Keyboard shortcuts
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-xl p-1.5 text-slate-warm hover:bg-linen-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-violet"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <dl className="mt-4 space-y-3">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between text-body-sm">
              <dt className="text-charcoal-stone">{s.description}</dt>
              <dd>
                <kbd className="rounded-md border border-sand-gray bg-paper-white px-2 py-0.5 font-mono text-caption text-ink-black">
                  {s.keys}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>,
    document.body,
  );
}
