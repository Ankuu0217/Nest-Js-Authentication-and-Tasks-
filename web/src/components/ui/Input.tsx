import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, "aria-invalid": ariaInvalid, ...props }, ref) => {
    return (
      <input
        ref={ref}
        aria-invalid={ariaInvalid}
        className={cn(
          "h-10 w-full rounded-xl border border-sand-gray bg-paper-white px-4 text-body-sm text-ink-black placeholder:text-slate-warm",
          "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-electric-violet focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-cream",
          "disabled:cursor-not-allowed disabled:opacity-50",
          ariaInvalid &&
            "border-coral-red focus-visible:ring-coral-red",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";
