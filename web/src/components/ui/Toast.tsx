"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex items-center gap-3 w-full rounded-xl border border-sand-gray bg-paper-white px-4 py-3 shadow-subtle text-body-sm text-ink-black",
          title: "font-medium",
          description: "text-charcoal-stone",
          actionButton:
            "rounded-xl bg-ink-black px-3 py-1.5 text-caption font-medium text-paper-white",
          cancelButton:
            "rounded-xl border border-charcoal-stone px-3 py-1.5 text-caption font-medium text-ink-black",
          error: "border-coral-red",
          success: "border-forest-green",
        },
      }}
    />
  );
}

export { toast } from "sonner";
