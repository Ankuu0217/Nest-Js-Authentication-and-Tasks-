import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium",
  {
    variants: {
      shape: {
        tag: "rounded-xl px-2.5 py-1 text-caption",
        pill: "rounded-full px-3 py-1 text-caption",
      },
      // Every non-neutral tone below used to pair a tinted background with
      // that hue's own darker sibling as text (e.g. text-burnt-orange on
      // bg-tangerine/20) — matches nothing in DESIGN-3.md (its "Accent Color
      // Card Set" spec calls for Ink Black text on tinted backgrounds) and
      // a real Lighthouse run caught it failing 4.5:1 across the board
      // (as low as 2.93:1). Ink Black on any of these tints clears 14:1+.
      tone: {
        neutral: "bg-linen-beige text-charcoal-stone",
        violet: "bg-lilac-mist text-ink-black",
        pink: "bg-bubblegum-pink/30 text-ink-black",
        tangerine: "bg-tangerine/20 text-ink-black",
        aqua: "bg-aqua-teal/20 text-ink-black",
        sky: "bg-sky-blue/20 text-ink-black",
        sunshine: "bg-sunshine-yellow/30 text-ink-black",
        mint: "bg-mint-wash text-ink-black",
        success: "bg-mint-wash text-ink-black",
        danger: "bg-coral-red/15 text-coral-red-text",
      },
    },
    defaultVariants: {
      shape: "tag",
      tone: "neutral",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, shape, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ shape, tone }), className)} {...props} />;
}
