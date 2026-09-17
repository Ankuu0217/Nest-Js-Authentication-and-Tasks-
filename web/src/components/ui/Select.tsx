import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, "aria-invalid": ariaInvalid, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-10 w-full appearance-none rounded-xl border border-sand-gray bg-paper-white px-4 pr-10 text-body-sm text-ink-black",
            "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-electric-violet focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-cream",
            "disabled:cursor-not-allowed disabled:opacity-50",
            ariaInvalid && "border-coral-red focus-visible:ring-coral-red",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-slate-warm"
        />
      </div>
    );
  },
);
Select.displayName = "Select";
