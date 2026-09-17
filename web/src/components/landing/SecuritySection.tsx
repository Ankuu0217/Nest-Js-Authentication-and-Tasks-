import { Cookie, ShieldOff, Waypoints, RefreshCcw, Timer } from "lucide-react";

const POINTS = [
  {
    icon: Cookie,
    title: "httpOnly cookies only",
    description: "The access token lives in an httpOnly cookie set by the Next.js server — client JavaScript never sees it.",
  },
  {
    icon: ShieldOff,
    title: "No token in localStorage",
    description: "Nothing auth-related is written to localStorage or sessionStorage, so there's nothing for an XSS payload to steal.",
  },
  {
    icon: Waypoints,
    title: "BFF proxy, not direct calls",
    description: "The browser only ever talks to this Next.js app. It attaches the token server-side before forwarding to Nest.",
  },
  {
    icon: RefreshCcw,
    title: "Rotating refresh tokens",
    description: "Every refresh issues a new token pair and invalidates the old one — the backend compares a hash, not the raw value.",
  },
  {
    icon: Timer,
    title: "5-per-minute login throttle",
    description: "Login specifically is rate-limited tighter than the rest of the API, independent of the global throttle.",
  },
];

export function SecuritySection() {
  return (
    <section className="bg-parchment-cream py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="font-display text-heading text-ink-black">Where the tokens actually live</h2>
        <ul className="mt-10 space-y-6">
          {POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <li key={point.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linen-beige text-charcoal-stone">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-ink-black">{point.title}</p>
                  <p className="mt-1 text-body-sm text-charcoal-stone">{point.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
