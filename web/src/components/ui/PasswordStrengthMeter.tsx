import { cn } from "@/lib/utils";

interface Criterion {
  label: string;
  test: (value: string) => boolean;
}

const CRITERIA: Criterion[] = [
  { label: "8+ characters", test: (v) => v.length >= 8 },
  { label: "upper & lowercase", test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { label: "a number", test: (v) => /\d/.test(v) },
  { label: "a symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const SEGMENT_COLORS = ["bg-coral-red", "bg-tangerine", "bg-sunshine-yellow", "bg-forest-green"];

/** A hint, not a gate — the backend only enforces a 6-character minimum.
 * This just nudges toward a stronger password without blocking a shorter
 * one that already clears that bar. */
export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const unmet = CRITERIA.filter((c) => !c.test(password));
  const score = CRITERIA.length - unmet.length;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5" role="presentation">
        {CRITERIA.map((c, i) => (
          <div
            key={c.label}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i < score ? SEGMENT_COLORS[Math.max(score - 1, 0)] : "bg-linen-beige",
            )}
          />
        ))}
      </div>
      <p className="mt-1.5 text-caption text-charcoal-stone">
        {unmet.length === 0 ? "Looks strong" : `Consider adding: ${unmet.map((c) => c.label).join(", ")}`}
      </p>
    </div>
  );
}
