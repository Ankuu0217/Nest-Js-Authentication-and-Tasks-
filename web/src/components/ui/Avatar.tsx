import { cn, accentColorForId, initialsForName } from "@/lib/utils";

const TONE_CLASSES = {
  "bubblegum-pink": "bg-bubblegum-pink text-ink-black",
  tangerine: "bg-tangerine text-ink-black",
  "aqua-teal": "bg-aqua-teal text-ink-black",
  "sky-blue": "bg-sky-blue text-ink-black",
  "sunshine-yellow": "bg-sunshine-yellow text-ink-black",
  "mint-green": "bg-mint-green text-ink-black",
  "electric-violet": "bg-electric-violet text-paper-white",
} as const;

const SIZE_CLASSES = {
  sm: "size-7 text-caption",
  md: "size-9 text-body-sm",
  lg: "size-12 text-body",
} as const;

export interface AvatarProps {
  userId: string;
  name: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function Avatar({ userId, name, size = "md", className }: AvatarProps) {
  const tone = accentColorForId(userId);
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        SIZE_CLASSES[size],
        TONE_CLASSES[tone],
        className,
      )}
      role="img"
      aria-label={name}
    >
      {initialsForName(name)}
    </span>
  );
}
