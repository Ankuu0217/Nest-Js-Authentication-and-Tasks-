import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge's default config doesn't recognize this project's custom
 * type-scale names (text-caption, text-body, ...) as font-size utilities,
 * so it falls back to lumping every unrecognized `text-*` class — including
 * text-color ones like text-ink-black — into one ambiguous bucket and
 * keeping only the last. That silently dropped text color classes anywhere
 * a component combined a color with a size (e.g. `cn("text-ink-black",
 * "text-body")` merged down to just `text-body`, and the button rendered in
 * whatever color it happened to inherit). Registering the scale here as its
 * own font-size group fixes it at the root instead of patching every call
 * site. Confirmed empirically: extend this list if new `--text-*` steps are
 * added to globals.css.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["caption", "body-sm", "body", "subheading", "heading-sm", "heading", "display"] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const AVATAR_PALETTE = [
  "bubblegum-pink",
  "tangerine",
  "aqua-teal",
  "sky-blue",
  "sunshine-yellow",
  "mint-green",
  "electric-violet",
] as const;

export function accentColorForId(id: string): (typeof AVATAR_PALETTE)[number] {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index] ?? "electric-violet";
}

export function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, 1);
  return `${visible}${"*".repeat(Math.max(local.length - 1, 3))}@${domain}`;
}

export function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
