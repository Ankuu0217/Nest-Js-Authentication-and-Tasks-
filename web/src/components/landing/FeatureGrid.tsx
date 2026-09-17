"use client";

import { KeyRound, Lock, Mail, RotateCcw, ShieldCheck, Gauge } from "lucide-react";
import { useReveal } from "@/hooks/useReveal";

const FEATURES = [
  {
    icon: KeyRound,
    title: "JWT access + refresh tokens",
    description: "Short-lived access tokens paired with a rotating refresh token — every refresh issues a new pair.",
    tone: "bg-lilac-mist",
  },
  {
    icon: Lock,
    title: "bcrypt password hashing",
    description: "Passwords are hashed with bcrypt before they ever touch the database. Nothing is stored in plain text.",
    tone: "bg-bubblegum-pink/30",
  },
  {
    icon: Mail,
    title: "Email verification via Resend",
    description: "New accounts get a time-limited verification link before they can log in.",
    tone: "bg-tangerine/25",
  },
  {
    icon: RotateCcw,
    title: "Expiring password resets",
    description: "Reset tokens are single-use and expire after an hour — requesting a new one invalidates the old.",
    tone: "bg-aqua-teal/25",
  },
  {
    icon: ShieldCheck,
    title: "Role-based guards",
    description: "Routes are gated by a RolesGuard reading a role claim straight off the verified JWT.",
    tone: "bg-sky-blue/25",
  },
  {
    icon: Gauge,
    title: "Per-route rate limiting",
    description: "A global throttle plus a tighter five-per-minute limit on login specifically.",
    tone: "bg-sunshine-yellow/30",
  },
] as const;

function FeatureCard({ feature, index }: { feature: (typeof FEATURES)[number]; index: number }) {
  const { ref, style } = useReveal<HTMLDivElement>(index);
  const Icon = feature.icon;

  return (
    <div ref={ref} style={style} className={`rounded-xl p-6 ${feature.tone}`}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-paper-white/70 text-ink-black">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-body font-semibold text-ink-black">{feature.title}</h3>
      <p className="mt-1.5 text-body-sm text-ink-black/75">{feature.description}</p>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section className="bg-parchment-cream py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="max-w-md font-display text-heading text-ink-black">
          What the backend actually does
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
