import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "mb-1.5 block text-body-sm font-medium text-charcoal-stone",
          className,
        )}
        {...props}
      />
    );
  },
);
Label.displayName = "Label";
