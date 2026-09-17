import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn(
          "min-h-24 w-full resize-y rounded-xl border border-sand-gray bg-paper-white px-4 py-3 text-body-sm text-ink-black placeholder:text-slate-warm",
          "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-electric-violet focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-cream",
          "disabled:cursor-not-allowed disabled:opacity-50",
          ariaInvalid && "border-coral-red focus-visible:ring-coral-red",
          className,
        )}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";
