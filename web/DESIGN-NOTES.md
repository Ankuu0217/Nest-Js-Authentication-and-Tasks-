# Design notes — MyTask frontend

## Source of truth

The Refero MCP server (§6 of the build prompt) is **not available in this session** — it does not
appear in the tool registry at all (checked, not just "unreachable at call time"). Per the prompt's
own fallback instruction, every design decision below is sourced from the four attached files —
`DESIGN-3.md`, `theme-3.css`, `variables-3.css`, `tokens-3.json` — plus direct composition
judgment. No Refero screen IDs are cited anywhere in this document or in code comments, because
none were opened. If Refero becomes available in a later session, re-run §6 and update this file
with real screen citations before claiming any were used.

## Font decision

`new-kansas` is a licensed font we don't have. DESIGN-3.md names **DM Serif Display** as its own
suggested substitute, and DM Serif Display ships exactly **one weight: 400**. That happens to
resolve a tension in the source files for free: the prose in DESIGN-3.md repeats "never bold a
display headline, 400 weight is the whole point" as a hard rule, while `tokens-3.json`'s
`typography` block lists every `new-kansas` step at weight `500`. Since DM Serif Display has no
500 or 700 to accidentally reach for, the constraint enforces itself — there is no weight knob to
get wrong. Using it as `--font-display`, mapped from `--font-new-kansas` in the theme. Fraunces
was the other candidate (variable, `opsz` axis, warmer) but it invites tuning a weight axis the
brief explicitly says not to touch, so DM Serif Display wins on "boring is correct" grounds.

`Nunito Sans` is used as named, weights 400/500/600/700, as `--font-sans`.

## Global rules carried into every component (from DESIGN-3.md §5.1, restated so implementation
can be checked against it directly)

- Body background `#f8f7f2` (parchment-cream), never `#fff`. Text `#1d1d1c` (ink-black), never `#000`.
- Radii: only 12 / 16 / 24 / 9999px exist as a vocabulary. No other radius value is used anywhere.
- Shadows: only the `--shadow-subtle*` oklch stacks from `theme-3.css`. Never a bare `rgba(0,0,0,.1)`.
- Serif (`--font-display`) only at 28px and up. Nunito Sans owns everything below.
- No solid-violet (or any solid chromatic) primary button. Primary = white-fill/ink-text or
  ink-fill/white-text. Chromatic color is decoration (accent-card backgrounds, icon strokes,
  chart series), never the thing you click to submit.
- Ash Gray (`#99978f`) fails 4.5:1 on parchment at body sizes — reserved for placeholder text and
  metadata that isn't the primary reading path. Anything the user must read uses Slate Warm
  (`#7a7974`) or Charcoal Stone (`#43423e`).

## Per-page notes

### `/` — Landing
Composition idea (own judgment, DESIGN-3.md "Hero Section" + "Layout" sections): the twilight
hero is the one section allowed a fully custom, illustrated treatment — everything after it goes
back to disciplined cream/white card rhythm. The floating product-card cluster (Metric Card, Chart
Card, AI-Prompt-Input-shaped "add task" mock) is built from the exact same tokens as the real
`/tasks` and `/dashboard` components so the hero isn't allowed to over-promise relative to the real
product — this is the honesty rule (§9.1) applied to layout, not just copy.
Key tokens: `--surface-twilight-sky` → gradient stops toward Deep Violet/Coral Red for the sunset
band; `--shadow-subtle` (the 5-layer floating-card stack) on every hero card; `--text-display` at
64px only for the H1.

### `/register`, `/login`
Composition idea: split screen, form on parchment (left), twilight panel with mascot on the right
(DESIGN-3.md "Hero Section" gradient reused at smaller scale, collapsed below `lg` per spec so the
form is full-width on mobile — a login form does not need to fight a decorative panel on a 375px
screen). Error states use the "Neutral Bordered Button" / "Pill Tag" tokens for inline banners
rather than a toast, per §7.2/§7.3 — auth errors are page state, not a transient notification.

### `/auth/verify`, `/forgot-password`, `/reset-password`
Composition idea: single centered card on parchment, no split panel — these are transactional,
single-purpose screens (DESIGN-3.md "Testimonial Block" centering pattern repurposed for a status
message: centered content, generous vertical whitespace, one primary action). The verify page's
"verifying" state reuses the mascot float animation from the hero so the brand anchor shows up
outside marketing pages too, at low cost (one shared component).

### `/dashboard`
Composition idea: "Metric Card" and "Chart Card" component specs from DESIGN-3.md, applied to real
data instead of hero-mock data. Stat tiles use `tabular-nums` and the same white/`--shadow-subtle`
card as the hero mock so a reviewer who scrolls from the landing page straight into the real app
sees continuity, not a bait-and-switch.

### `/tasks`
Composition idea: three-column board, column headers as the "Tab Navigation" token pattern (text +
2px ink underline for the active/focused column on keyboard nav), cards as "Metric Card" shape at
12px radius with a status "Pill Tag" using the accent rotation. Drag-and-drop states (dragging,
drop-target hover) get a Lilac Mist wash — the only place a chromatic *background fill* is allowed
on a large surface, and it's a transient interaction state, not a resting UI color.

### `/settings`, `/admin`
Composition idea: plain content cards on parchment, no decoration — these are utility screens.
`/admin`'s "not yet exposed by the API" empty state uses the standard `EmptyState` component so it
reads as a designed, intentional state rather than an error.

### Global (`not-found`, `error`, `loading`, `global-error`)
Composition idea: same centered-card pattern as the auth transactional screens, so a 404 or a
thrown error doesn't suddenly look like unstyled Next.js scaffolding — brand continuity through
every state, including the ones nobody plans for.

## Open question carried into Phase 1

None blocking. Route inventory is in [ROUTE-INVENTORY.md](./ROUTE-INVENTORY.md).
