import { cn } from "@/lib/utils";

/** Small deterministic PRNG (mulberry32-ish LCG) so the starfield is fixed
 * across server and client renders — Math.random() here would hydration-
 * mismatch, and the brief explicitly calls for "seeded" positions anyway. */
function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

const rand = seededRandom(1337);
const STARS = Array.from({ length: 40 }, () => {
  const r = 0.4 + rand() * 0.9;
  const cy = rand() * 65;
  // Bigger (closer-reading) stars drift faster than small ones — a cheap
  // parallax cue rather than every star falling in lockstep.
  const duration = 34 - r * 12 + rand() * 6;
  return {
    cx: rand() * 100,
    cy,
    r,
    opacity: 0.3 + rand() * 0.6,
    duration,
    // A negative delay starts the loop already in progress, at the phase
    // matching this star's own seeded position — so the very first frame
    // still looks like the original scattered sky instead of every star
    // resetting to the top edge on load.
    delay: -(cy / 100) * duration,
  };
});

const CLOUDS = [
  { left: "8%", top: "58%", size: 240, color: "#8200db", opacity: 0.3 },
  { left: "62%", top: "68%", size: 280, color: "#ee5968", opacity: 0.22 },
  { left: "38%", top: "38%", size: 200, color: "#b26bf5", opacity: 0.28 },
  { left: "78%", top: "20%", size: 160, color: "#ff9147", opacity: 0.18 },
];

export function TwilightSky({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{
        background: "radial-gradient(120% 90% at 50% 100%, #8200db 0%, #190922 55%, #190922 100%)",
      }}
    >
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {STARS.map((star, i) => (
          <circle
            key={i}
            cx={`${star.cx}%`}
            cy={`${star.cy}%`}
            r={star.r}
            fill="#f8f7f2"
            opacity={star.opacity}
            className="motion-safe:[animation:var(--fall)]"
            style={
              { "--fall": `star-fall ${star.duration}s linear ${star.delay}s infinite` } as React.CSSProperties
            }
          />
        ))}
      </svg>
      {CLOUDS.map((cloud, i) => (
        <div
          key={i}
          className="absolute rounded-full blur-3xl"
          style={{
            left: cloud.left,
            top: cloud.top,
            width: cloud.size,
            height: cloud.size,
            backgroundColor: cloud.color,
            opacity: cloud.opacity,
          }}
        />
      ))}
    </div>
  );
}
