import type { TaskStatus } from "@/lib/api/types";

interface StatusDatum {
  status: TaskStatus;
  label: string;
  count: number;
  color: string;
}

const RADIUS = 60;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Fixed, meaning-bearing colors per status (not a cycled categorical
 * palette) — todo is neutral, in_progress is warm/active, done reuses the
 * same Forest Green the rest of the app already uses for "positive." Every
 * segment is paired with a legend label, so identity never rests on color
 * alone. */
export function StatusDonut({ data }: { data: StatusDatum[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  let offsetAccum = 0;

  return (
    <div className="flex items-center gap-8">
      <svg viewBox="0 0 160 160" className="size-36 shrink-0 -rotate-90">
        <circle
          cx="80"
          cy="80"
          r={RADIUS}
          fill="none"
          stroke="var(--color-linen-beige)"
          strokeWidth="20"
        />
        {total > 0 &&
          data.map((d) => {
            if (d.count === 0) return null;
            const fraction = d.count / total;
            const dash = fraction * CIRCUMFERENCE;
            const dashOffset = -offsetAccum;
            offsetAccum += dash;
            return (
              <circle
                key={d.status}
                cx="80"
                cy="80"
                r={RADIUS}
                fill="none"
                stroke={d.color}
                strokeWidth="20"
                strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                strokeDashoffset={dashOffset}
              >
                <title>
                  {d.label}: {d.count} ({Math.round(fraction * 100)}%)
                </title>
              </circle>
            );
          })}
      </svg>
      <ul className="space-y-2.5">
        {data.map((d) => (
          <li key={d.status} className="flex items-center gap-2.5 text-body-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
              aria-hidden="true"
            />
            <span className="text-charcoal-stone">{d.label}</span>
            <span className="font-medium tabular-nums text-ink-black">{d.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
