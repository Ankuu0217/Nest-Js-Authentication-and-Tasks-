import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-sans font-medium tracking-body-sm transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-violet focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-cream",
  {
    variants: {
      variant: {
        filled: "bg-paper-white text-ink-black shadow-subtle hover:bg-linen-beige",
        ghost: "bg-transparent text-ink-black hover:bg-linen-beige",
        // DESIGN-3.md's prose says "Pale Violet background" for this variant, but its own
        // hex (#f3e8ff) is Lilac Mist in the token table — the hex is ground truth.
        "outlined-violet":
          "border border-pale-violet bg-lilac-mist text-ink-black hover:bg-pale-violet/50",
        "neutral-bordered":
          "border border-charcoal-stone bg-paper-white text-ink-black shadow-subtle-4 hover:bg-linen-beige",
        // text-coral-red-text, not text-coral-red: the token itself only
        // reaches 3.35:1 on white, below WCAG's 4.5:1 for text (confirmed
        // via Lighthouse). See globals.css for the accessible variant.
        destructive:
          "border border-coral-red bg-paper-white text-coral-red-text hover:bg-coral-red/10",
      },
      size: {
        sm: "h-8 px-3 text-caption",
        md: "h-10 px-5 text-body-sm",
        lg: "h-12 px-6 text-body",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, disabled, children, ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Spinner size={size === "lg" ? "md" : "sm"} />
          </span>
        )}
        <span className={cn("inline-flex items-center gap-2", loading && "invisible")}>
          {children}
        </span>
      </button>
    );
  },
);
Button.displayName = "Button";
