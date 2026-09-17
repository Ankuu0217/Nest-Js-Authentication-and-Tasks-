# CLAUDE CODE PROMPT — MyTask Frontend (Next.js 15 + Passionfroot design system)

> Copy everything below the line into Claude Code, run from the repo root
> `/Users/ankitsingh/Nest Js Authentiation Project`.
> Attach `DESIGN-3.md`, `theme-3.css`, `variables-3.css`, `tokens-3.json` to the session.

---

## 0. WHO YOU ARE

You are a senior frontend engineer — the kind who has shipped design systems at Linear, Vercel and Stripe. You do not produce "AI-looking" screens: no purple-gradient-on-everything, no `lucide` icons scattered without rhythm, no lorem-ipsum marketing copy, no emoji headings, no "Unleash the power of…" hero lines. You ship **taste**: restrained type, correct optical spacing, real states (loading / empty / error / disabled / focus-visible), and motion that has a reason to exist.

You are building the frontend for **MyTask** — a NestJS authentication + task-management API that already exists in this repo. This frontend goes on the author's LinkedIn and portfolio. It must survive a senior engineer opening DevTools.

---

## 1. NON-NEGOTIABLE RULES

1. **Do not modify anything under `src/`, `test/`, `drizzle.config.ts`, `nest-cli.json`, `vitest*.ts`, or the Nest `package.json` scripts.** The backend is finished work and is out of scope. The only exception is the three edits listed in **§12 BACKEND BLOCKERS**, and you apply those *only if the user explicitly tells you to in the chat*. Otherwise you list them and stop.
2. The frontend lives in a new top-level folder **`web/`** in this same repo (a monorepo-ish layout: `src/` = API, `web/` = client). Never install frontend deps into the root `package.json`.
3. **Zero dead routes.** Every backend endpoint in §3 must be reachable from real UI. No `href="#"`, no `onClick={() => {}}`, no `TODO`.
4. **Zero fake data in production paths.** Every number, list and status on an authenticated screen comes from the API. Marketing-page numbers must be honest (see §9.1).
5. TypeScript **strict**. No `any`, no `@ts-ignore`, no `as unknown as`. `pnpm build` and `pnpm lint` must pass clean before you call anything done.
6. Every commit-worthy chunk must be verified in a real browser (see §11). "It compiles" is not verification.

---

## 2. STACK (fixed — do not substitute)

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 15, App Router, TypeScript** | required by the user |
| Styling | **Tailwind CSS v4** (`@theme` block) | `theme-3.css` is already authored for v4 |
| Server state | **TanStack Query v5** | optimistic task mutations, cache invalidation |
| Forms | **react-hook-form + zod** (`@hookform/resolvers`) | schema mirrors backend DTOs exactly |
| Animation | **Motion** (`motion/react`, the Framer Motion successor) | hero + list transitions only |
| Icons | **lucide-react**, plus real brand SVGs (§10) | |
| Toasts | **sonner** | |
| Package manager | **pnpm** | repo already uses pnpm |
| Node | 22.x | matches the machine |

Do **not** add: shadcn/ui as a whole, MUI, Chakra, Redux, axios, next-auth, Zustand. Build the ~12 primitives you need by hand — a senior engineer's component layer, in `web/src/components/ui/`.

---

## 3. THE BACKEND CONTRACT (verified by reading the source — treat as ground truth)

Global prefix: **`/api`**. Swagger: `GET /api/docs`.
Global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` — **sending one extra body field returns 400.** Never send `confirmPassword`, `rememberMe`, or anything not listed below.
Global guards, in order: `ThrottlerGuard` → `JwtAuthGuard` → `RolesGuard`. **Everything is protected unless marked `@Public()`.**
Rate limits: **100 req / 60s** globally, **5 req / 60s on `POST /api/auth/login`** (a 429 here is a real, reachable state — design for it).

### 3.1 Auth routes (`src/auth/auth.controller.ts`)

| Method | Path | Auth | Request | Success response |
|---|---|---|---|---|
| POST | `/api/auth/register` | public | `{ email: string(email), password: string(min 6), name: string(min 3), role: string(non-empty) }` | `201 { message: "User registered successfully" }` |
| GET | `/api/auth?token=<hex>` | public | query `token` | `200 { accessToken, user }` + sets `refresh_token` cookie |
| POST | `/api/auth/login` | public, 5/min | `{ email, password(min 6) }` | `200 { accessToken, user: { id, email, name, role } }` + `refresh_token` cookie |
| POST | `/api/auth/refresh` | public, cookie | — (reads `refresh_token` cookie) | `200 { accessToken, user }` + rotated cookie |
| POST | `/api/auth/logout` | Bearer | — | `200 { message: "Logout successful" }`, clears cookie |
| GET | `/api/auth/me` | Bearer | — | `200 { id, email, name, role }` |
| POST | `/api/auth/forgot-password` | public | `{ email }` | `200 { message: "Forgot password email sent successfully" }` |
| POST | `/api/auth/reset-password` | public | `{ token, password }` | `200 { message: "Password reset successfully" }` |

**Critical detail — email verification.** `EmailService` sends the user to `${APP_URL}/auth/verify?token=…`, but the actual API route is `GET /api/auth?token=…`. So: set `APP_URL` to the **Next.js origin**, build a real page at `/auth/verify`, read `?token`, and have it call the API route. The mismatch resolves itself — no backend change needed.

**Error shapes.** Nest `HttpException` JSON: `{ statusCode, message, error }` where `message` is a `string` for thrown exceptions and a `string[]` for ValidationPipe failures. Your error normalizer must handle both. Known messages you must map to human copy:

- 409 `"User already exists"` (register)
- 404 `"User not found"` (login with unknown email, forgot-password, reset)
- 401 `"Invalid password"` (login)
- 400 `"Please verify your email"` (login before verification → show a "Resend"-style hint + link back to the verify screen)
- 401 `"Invalid refresh token"` / `"Invalid Token"` / `"No token provided"` → hard logout
- 400 `"Token expired"` (verify / reset)
- 429 ThrottlerException → "Too many attempts. Try again in a minute."
- 403 `"You are not authorized to update this task"` / `"You do not have permission to access this resource"`

### 3.2 Task routes (`src/tasks/`)

**The `TasksService` is fully implemented but `TasksController` is an empty shell — there are currently no HTTP task routes.** See §12. Build the frontend against this contract (it is exactly what the service methods expose):

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/api/tasks` | Bearer | — | `Task[]` for the current user |
| POST | `/api/tasks` | Bearer | `{ title, description, status? }` | `Task` |
| PATCH | `/api/tasks/:id` | Bearer | `Partial<{ title, description, status }>` | `Task` |
| DELETE | `/api/tasks/:id` | Bearer | — | `{ message: "Task deleted successfully" }` |

### 3.3 Domain types (from `src/db/schema.ts` — mirror these exactly)

```ts
type Role = 'user' | 'admin';
type TaskStatus = 'todo' | 'in_progress' | 'done';

interface User  { id: string; email: string; name: string; role: Role }
interface Task  {
  id: string; title: string; description: string;
  userId: string; status: TaskStatus;
  createdAt: string; updatedAt: string;   // ISO strings over the wire
}
```

`title` and `description` are both **`notNull`** — description is required on create, not optional. Your zod schema must match or the API 400s.

### 3.4 Other routes

- `GET /api/` (AppController) — returns a hello string and is **not** `@Public()`, so it requires a Bearer token. Use it as the "API health" probe on the dashboard's status strip (authenticated), nothing more.
- `/api/admin` — `AdminController` is an empty shell, no routes. Build the **admin UI shell behind a `role === 'admin'` guard** (nav item, `/admin` route, users table component wired to a typed client function) and render a clearly-labelled "Endpoint not implemented yet" empty state instead of inventing data. Do not fake an admin list.

---

## 4. ARCHITECTURE — BFF PROXY (this is the part that makes it senior-level)

The Nest app **does not enable CORS** (`main.ts` has no `app.enableCors()`), and the refresh cookie is `sameSite: 'strict'`. Rather than patch the backend, put a **Backend-For-Frontend proxy inside Next.js**. This is the correct call and you should say so in the README:

- Browser never talks to Nest directly → **no CORS needed, backend untouched**.
- The access token never touches `localStorage` → **no XSS token theft**.
- The refresh cookie is handled server-side → survives `sameSite: strict`.

### 4.1 Shape

```
web/src/app/api/bff/[...path]/route.ts   generic authenticated proxy → NEST_URL/api/*
web/src/app/api/auth/login/route.ts      login: forwards, captures tokens into cookies
web/src/app/api/auth/register/route.ts
web/src/app/api/auth/verify/route.ts     GET ?token= → Nest GET /api/auth?token=
web/src/app/api/auth/refresh/route.ts
web/src/app/api/auth/logout/route.ts
web/src/app/api/auth/forgot-password/route.ts
web/src/app/api/auth/reset-password/route.ts
```

### 4.2 Cookie policy (set by the Next server, on the Next origin)

| Cookie | Contents | Flags |
|---|---|---|
| `mt_at` | Nest `accessToken` | `httpOnly, sameSite=lax, path=/, secure` in prod, `maxAge` = access-token TTL |
| `mt_rt` | value parsed out of Nest's `Set-Cookie: refresh_token=…` | `httpOnly, sameSite=lax, path=/, secure` in prod, 7d |
| `mt_user` | `{id,email,name,role}` JSON, **not** httpOnly | so the client shell can render the avatar/name without a round-trip; never trusted for authorization |

### 4.3 Refresh-on-401, exactly once

In the generic proxy: attach `Authorization: Bearer <mt_at>` → if Nest answers **401**, server-side `POST ${NEST_URL}/api/auth/refresh` with header `Cookie: refresh_token=<mt_rt>` → on success, rewrite `mt_at`/`mt_rt`/`mt_user` from the response and **replay the original request once**; on failure, clear all three cookies and return `401 { code: 'SESSION_EXPIRED' }`. The client's query layer maps that code to a redirect to `/login?reason=expired`. Guard against infinite loops with a single retry flag. Never refresh from the browser.

### 4.4 Route protection

`web/src/middleware.ts` — matcher over `/dashboard/:path*`, `/tasks/:path*`, `/admin/:path*`, `/settings/:path*`:
- no `mt_at` **and** no `mt_rt` → redirect `/login?next=<pathname>`
- already authenticated and hitting `/login`, `/register`, `/forgot-password` → redirect `/dashboard`
- `/admin/*` additionally requires `mt_user.role === 'admin'` → otherwise `/dashboard` with a toast reason param

Dashboard pages are **React Server Components** that fetch through the BFF with `cookies()` forwarded, then hydrate TanStack Query with `HydrationBoundary`. No client-side waterfall on first paint.

### 4.5 Env

`web/.env.local`:
```
NEST_API_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
Root `.env` (the user changes these himself, you only document it in the README):
```
PORT=4000
APP_URL=http://localhost:3000
```
`NEST_API_URL` is **server-only** — never `NEXT_PUBLIC_`. Validate env at boot with zod in `web/src/env.ts` and fail fast with a readable message.

---

## 5. DESIGN SYSTEM — PASSIONFROOT

The full token extraction is in the attached `DESIGN-3.md` / `theme-3.css` / `variables-3.css` / `tokens-3.json`. **Read all four before writing a single component.** Copy `theme-3.css`'s `@theme` block verbatim into `web/src/app/globals.css` — do not retype the values, do not "improve" them.

### 5.1 The rules that define the style (from the Do/Don't list — violating these kills it)

- Page background is **Parchment Cream `#f8f7f2`**, never `#ffffff`.
- Body/primary text is **Ink Black `#1d1d1c`**, never `#000`.
- Display headlines: serif at **400 weight**, 48–64px, tight tracking (`-0.023em` at 64px). **Never bold a display headline.** The restraint *is* the brand.
- Radii vocabulary is exactly four values: **12 / 16 / 24 / 9999px**. Nothing else. 12px for cards, buttons, inputs; 9999px for pills only.
- Shadows are the warm oklch stacks in the tokens — **never `rgba(0,0,0,.1)`**.
- Serif lives at 28px and above only. Nunito Sans owns everything below.
- **No solid-violet CTA.** Primary buttons are white-on-ink or ink-on-white; chromatic color is decorative punctuation (accent card backgrounds, icon strokes, chart series), never the main action.
- The rainbow accent set (violet, pink, tangerine, aqua, sky, sunshine, mint) rotates across feature cards for rhythm.

### 5.2 Fonts

`next/font/google`:
- Display serif: **DM Serif Display** (400) — the substitute the token file itself names for `new-kansas`. If you judge **Fraunces** (variable, `opsz`, soft) a closer match to new-kansas's warmth, you may use it instead — but pick one, justify it in one README line, and expose it as `--font-display`.
- UI sans: **Nunito Sans** (400/500/600/700) as `--font-sans`.
- Apply `font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1` globally; `font-variant-numeric: tabular-nums` on every number that sits in a column or counter.

### 5.3 Dark mode

Skip it. This system is a light, warm, editorial identity; a half-hearted dark mode would cheapen it. State that decision in the README — an intentional omission reads better than a broken toggle.

---

## 6. REFERO RESEARCH PROTOCOL (do this before designing, not after)

You have the **Refero MCP server**. Use it — do not design from memory.

1. `refero_search_styles` → `"Passionfroot"`; then `refero_get_style` on the match. Reconcile against the attached `DESIGN-3.md`; **where they disagree, the attached files win** (they're the user's chosen extraction).
2. `refero_search_screens` for each surface, and `refero_get_screen_image` on the 3–5 strongest results per surface so you are looking at real pixels:
   - `"SaaS landing hero gradient serif headline"`
   - `"login sign up split screen"` / `"authentication form minimal"`
   - `"task manager kanban board"` / `"todo list dashboard"`
   - `"empty state illustration"`
   - `"settings account page"`
3. `refero_search_flows` → `"sign up onboarding"` and `"password reset"`; `refero_get_flow` on the best, to get the screen-to-screen sequencing right (what the success screen says, where the user lands, what the resend affordance looks like).
4. `refero_get_similar_screens` on your favourite hero to widen the hero reference set.
5. Write **`web/DESIGN-NOTES.md`**: for each page, the Refero screen IDs you drew from and the one specific idea you took (composition, spacing rhythm, state handling). This is the artifact that proves the design was researched, not generated — the user will link it from the README.

If Refero is unreachable, say so and fall back to the attached token files; **never silently invent** and never claim a reference you didn't open.

---

## 7. PAGE-BY-PAGE SPEC

### 7.1 `/` — Landing (the first-impression page)

Section rhythm follows the style's own alternation: **dark twilight hero → cream canvas → white panel → cream → dark footer.**

**Hero (full-bleed, `#190922` → violet → coral gradient).** Build the twilight sky in **pure CSS/SVG** — layered `radial-gradient`s for the dusk, a `<canvas>`-free SVG starfield with deterministic seeded positions, and 3–4 soft blurred cloud blobs. No raster images, no AI art. Respect `prefers-reduced-motion` by freezing all drift.

- Eyebrow pill: `Open source · NestJS + Next.js` (9999px radius, translucent white, 1px white/20 border).
- H1, DM Serif Display 400, clamp(40px → 64px), white, `-0.023em`. Write a headline that describes *this* product honestly — something in the register of "A task API, and a front end worth showing it in." Do **not** write "Revolutionize your productivity" or anything with "seamlessly", "effortlessly", "unleash", "supercharge", or an em-dash-heavy AI cadence.
- Sub: 18px Nunito Sans 400, `#f8f7f2` at 80%, max 2 lines, max-width 52ch.
- Buttons: primary `Start for free` (white fill, ink text, 12px radius, 10×20px padding, `--shadow-subtle-3`) → `/register`; ghost `View the API docs` → `http://localhost:4000/api/docs` (new tab).
- **Floating product-card cluster** overlapping the hero's lower edge: 3 cards at `-2°`, `+1.5°`, `-1°` rotation — (a) Metric card "Tasks completed · 18 · +54%" in Forest Green, (b) mini bar chart in Tangerine/Electric Violet, (c) the "add task" input mock with an ink circular send button. These are *simulated product UI*, which is exactly what the style prescribes — but label the section honestly ("What the dashboard looks like"), and every card must visually match the real dashboard components you build in 7.6.
- Mascot: author a **hand-drawn SVG** blob character (rounded body, leaf, two eyes) in Coral Red/Bubblegum Pink, peeking bottom-right, with a gentle 6s float. Inline SVG, in-repo, commented. **No AI-generated image, no stock asset.**

**Then, in order:**
2. **Stack bar** — "Built with" + real brand marks (§10): TypeScript, NestJS, Next.js, PostgreSQL, Drizzle, Tailwind CSS, JWT. Charcoal Stone monochrome, uniform 24–28px optical height, 40px gaps. *This replaces the usual fake "trusted by" row — a portfolio project must not invent customer logos.*
3. **Feature grid, 3×2**, accent-card rotation from the palette. Features must be things the backend actually does: JWT access + rotating refresh tokens · bcrypt hashing · email verification via Resend · password reset with expiring tokens · role-based guards · per-route rate limiting.
4. **"How auth works" panel** — the white rounded panel (24px radius) sitting on top of a gradient band. An animated 5-step sequence (register → verify → login → access token → silent refresh) driven by a tab row (active = ink text + 2px ink underline). Each step shows the real request/response JSON from §3. This is the section that makes an engineer stop scrolling.
5. **Task-board preview** — a static, non-interactive replica of the real board with three columns, same components as `/tasks`.
6. **Security section** — honest bullets: httpOnly cookies, no token in localStorage, BFF proxy, refresh rotation with server-side hash comparison, 5/min login throttle.
7. **CTA band** + **footer** (dark, three columns, GitHub / API docs / LinkedIn links). No newsletter form you can't service.

Motion: `motion/react` with a shared `useReveal` hook — 24px rise + fade, 0.5s, `cubic-bezier(.16,1,.3,1)`, 60ms stagger, `once: true`, all disabled under `prefers-reduced-motion`. Nothing spins. Nothing bounces.

### 7.2 `/register`

Split layout: left = form on Parchment Cream, right = twilight gradient panel with the mascot and a single rotating line of product truth (hidden below `lg`).
Fields: Name, Email, Password, Confirm Password. Zod: name ≥ 3, email, password ≥ 6, confirm matches.
**Send exactly `{ email, password, name, role: 'user' }`** — strip `confirmPassword` before the request or the ValidationPipe 400s. `role` is hard-coded `'user'`; never expose an admin toggle in signup.
Password field: show/hide toggle, and a 4-segment strength meter (length / case mix / digit / symbol) in the accent palette — labelled honestly as a hint, not a requirement beyond the 6-char minimum.
Success → route to `/auth/check-email?email=<masked>` which explains the verification email in plain language, not a generic "Success!".
409 → inline error on the email field with a `Log in instead` link, not a toast.

### 7.3 `/login`

Email, password, show/hide, `Forgot password?` link. 401 → inline "Email or password is incorrect" (never reveal which). 404 → same copy (no user enumeration — call this out in the README as a deliberate frontend hardening of a backend that does distinguish them). 400 "Please verify your email" → an inline amber panel with a link to `/auth/check-email`. 429 → disable submit and run a live 60s countdown on the button.
On success the BFF sets the cookies; redirect to `?next=` or `/dashboard`.

### 7.4 `/auth/verify`

Reads `?token`, calls the BFF immediately, three states: verifying (skeleton + the mascot mid-float), success (confetti-free — a clean check in Forest Green, a one-line confirmation, auto-redirect to `/dashboard` in 3s with a "Go now" button), failure (`Token expired` vs `User not found` get different, specific copy and different recovery actions).

### 7.5 `/forgot-password` and `/reset-password`

Forgot: email field → always show the same neutral confirmation panel. **Note the backend 404s on unknown emails; catch it in the BFF and normalize to the same success response** so the UI doesn't leak which emails exist. Document that decision.
Reset: reads `?token` from the URL, password + confirm, calls `POST /api/auth/reset-password` with `{ token, password }`. Handle `Token expired` with a "Request a new link" path. **See §12.2 — this endpoint currently rejects real tokens; build the UI correctly and surface the blocker to the user.**

### 7.6 `/dashboard`

App shell: fixed sidebar (240px) + top bar. Sidebar: wordmark, nav (Dashboard, Tasks, Settings, and Admin only when `role === 'admin'`), user chip at the bottom with a menu → Settings / Log out.
Content: greeting in the display serif ("Good evening, Ankit" — time-aware, from the real user name); a 4-tile stat row (Total, To do, In progress, Done) computed from the real task list with `tabular-nums`; a donut or stacked bar of status distribution using the accent palette; "Recent activity" from `updatedAt` ordering; and an API-health chip that pings `GET /api/` and shows latency in ms.
Every tile has a genuine skeleton (matching final dimensions, no layout shift) and a genuine empty state.

### 7.7 `/tasks` — the core surface

**Three-column board** (`todo` / `in_progress` / `done`), each column a droppable region. Drag-and-drop with `@dnd-kit/core` + `@dnd-kit/sortable`; keyboard-accessible (dnd-kit's `KeyboardSensor`) and announced via `aria-live`. Dropping into a column fires `PATCH /api/tasks/:id { status }`.

- **Optimistic updates everywhere**: TanStack Query `onMutate` snapshots the cache, applies the change, `onError` rolls back and toasts, `onSettled` invalidates.
- Create: a slide-over panel (not a centered modal) with Title, Description, Status select. Focus trapped, `Esc` closes, first field autofocused, submit on `⌘/Ctrl+Enter`.
- Edit: same panel pre-filled → `PATCH` with only changed fields.
- Delete: inline confirm inside the card (two-step, no browser `confirm()`), then `DELETE`, with a 5s **Undo** toast that re-`POST`s the task if clicked.
- A board/list view toggle; search filter over title+description; status filter pills; sort by created/updated.
- Card: title (15px, 600), 2-line clamped description, status pill in the accent palette, relative time ("2h ago") with the absolute time in `title=`, and a kebab menu.
- Empty state per column, plus a full-page empty state with the mascot and a single primary action.
- Full keyboard story: `n` opens the create panel, `/` focuses search, `Esc` closes anything open. Ship a `?` shortcut sheet.

### 7.8 `/settings`

Profile card from `GET /api/auth/me` (read-only — no update endpoint exists; say "Profile editing isn't exposed by the API yet" rather than shipping a dead form). Session card: role badge, "Log out" (calls `POST /api/auth/logout`, clears the BFF cookies, redirects `/`), and a "Refresh session now" dev affordance that exercises `POST /api/auth/refresh` and shows the new expiry.

### 7.9 `/admin` (role-gated)

Rendered only for `role === 'admin'`, guarded in middleware *and* re-checked server-side. Ships the users-table UI with the "Not yet exposed by the API" empty state described in §3.4. Route-guard behaviour must be correct even though the data isn't there.

### 7.10 Global

`not-found.tsx`, `error.tsx` (with `reset()`), `loading.tsx` per segment, and a `global-error.tsx`. All four in-style, none of them default Next scaffolding.

---

## 8. COMPONENT LAYER

Hand-build in `web/src/components/ui/`, each with variants via `cva`, `forwardRef`, and a `focus-visible` ring using Electric Violet at 2px offset 2px:

`Button` (filled / ghost / outlined-violet / neutral-bordered / destructive; sm/md/lg; `loading` prop that swaps in a spinner and keeps the button's width), `Input`, `Textarea`, `Select`, `Label`, `FieldError`, `Card`, `Badge`/`Pill`, `Avatar` (initials fallback on a deterministic accent color derived from the user id), `Skeleton` (shimmer in Linen Beige), `Toast` (sonner, restyled to the tokens), `SlideOver`, `DropdownMenu`, `Tabs`, `EmptyState`, `Spinner`.

The four button variants must match §5's component specs in `DESIGN-3.md` exactly — padding, radius, border color, shadow token.

Accessibility floor: every interactive element reachable and operable by keyboard; visible focus everywhere; form errors tied via `aria-describedby`; `aria-invalid` on failed fields; live regions for toasts and board announcements; all text ≥ 4.5:1 (Ash Gray `#99978f` on cream **fails** at body size — use Slate Warm `#7a7974` or Charcoal Stone for anything a user must read).

---

## 9. CONTENT & COPY

### 9.1 Honesty rules

No invented customer logos, no fabricated testimonials with fake names and headshots, no made-up metrics ("10,000+ teams"). This is a portfolio project and a reviewer will check. Numbers on the landing page either describe the codebase truthfully (endpoint count, test count, token TTLs) or are clearly framed as a product-UI illustration.

### 9.2 Voice

Short declarative sentences. Concrete nouns. Technical where the audience is technical. Read every line aloud — if it sounds like a generated SaaS template, rewrite it. Banned: *seamless, effortless, unleash, supercharge, elevate, game-changing, journey, empower, revolutionize, in today's fast-paced world*. Also banned: emoji in headings, exclamation marks in UI copy, and sentences that open with "Whether you're…".

---

## 10. LOGOS AND IMAGERY — PREMIUM ONLY

- **Tech-stack marks:** use the official SVGs from **Simple Icons** (`pnpm add simple-icons`, import the path data, render as inline `<svg>` with `currentColor`) or the vendor's own press-kit SVG. Correct, current marks only — NestJS's cat-head, Next.js's wordmark, the PostgreSQL elephant, Drizzle's mark, the Tailwind swoosh. Verify each one on the vendor's brand page before shipping; if you cannot verify a mark, use a text wordmark rather than a wrong logo. Never an AI-generated or hand-approximated brand logo, never a PNG scraped from a search result.
- **Product mark for MyTask:** design one yourself as clean inline SVG — a geometric mark on 24px/32px grids with a lockup version — plus a `favicon.ico`, `icon.svg`, and `apple-icon.png` via Next's metadata file convention, and an `opengraph-image.tsx` rendered with `next/og` (the twilight gradient + the serif title). No AI raster art anywhere in the repo.
- **Illustrations:** all hand-authored SVG/CSS (mascot, clouds, starfield, empty states). Every decorative SVG gets `aria-hidden="true"`; every meaningful one gets a `<title>`.
- No photography. The style explicitly has none.

---

## 11. VERIFICATION — DO THIS, DON'T SKIP IT

You have **Chrome browser control** via MCP. After each phase:

1. `pnpm --filter web build` and `pnpm --filter web lint` → zero errors, zero warnings.
2. Start Nest (`pnpm start:dev`, port 4000) and Next (`pnpm --filter web dev`, port 3000).
3. Open the app in Chrome and **walk the full flow yourself**: register → (read the verification token straight from the DB with `pnpm db:studio` or the server log) → verify → login → create 3 tasks → drag across all three columns → edit → delete → undo → log out → log back in → forgot-password → hit login 6× to trigger the 429 → confirm the countdown.
4. `read_console_messages` — **zero errors, zero React warnings, zero hydration mismatches.** Fix, don't suppress.
5. `read_network_requests` — confirm no request carries a token in a URL, no 4xx on happy paths, and the 401→refresh→replay actually fires (expire `mt_at` manually to force it).
6. Screenshot at **375 / 768 / 1280 / 1920** for every page. No horizontal scroll at 375. Tap targets ≥ 44px.
7. Keyboard-only pass on `/login` and `/tasks`: tab order sane, focus always visible, no traps, slide-over returns focus to its trigger.
8. Lighthouse (or manual equivalent) on `/`: target **≥ 95 Performance, 100 Accessibility, ≥ 95 Best Practices, ≥ 95 SEO**. Report the real numbers; don't claim them.

Write the results into `web/VERIFICATION.md` — checklist, screenshots, real Lighthouse figures, and every bug you found and fixed.

---

## 12. BACKEND BLOCKERS — REPORT, DON'T SILENTLY FIX

Three things in the API stop the frontend from being fully functional. **List them to the user and wait for permission before touching `src/`.** Until then, build the UI against §3's contract so applying these takes zero frontend changes.

### 12.1 `TasksController` is empty — there are no task HTTP routes at all
`src/tasks/tasks.controller.ts` is a bare `@Controller('tasks')`. The service is complete; only the controller and the module's `imports`/`exports` wiring are missing. The needed addition is roughly:

```ts
@Controller('tasks')
@ApiTags('Tasks')
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()    findAll(@CurrentUser() user: User) { return this.tasksService.findAllForUser(user.id); }
  @Post()   create(@CurrentUser() user: User, @Body() dto: CreateTaskDto) { return this.tasksService.create(user.id, dto); }
  @Patch(':id') update(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateTaskDto) { return this.tasksService.update(user.id, id, dto); }
  @Delete(':id') remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) { return this.tasksService.delete(user.id, id); }
}
```
(plus an `UpdateTaskDto extends PartialType(CreateTaskDto)`). **Do not write this unless the user says to.**

Until it exists, gate the task UI behind `NEXT_PUBLIC_TASKS_API=off`, which swaps the query layer onto an in-memory fixture adapter **with a persistent amber banner reading "Demo data — task endpoints not yet exposed by the API."** Same components, same loading and error paths, one adapter swap. Never ship silent fake data.

### 12.2 `resetPasswordDto.token` is decorated `@IsEmail()`
`src/auth/Dto/reset-password.dto.ts` puts `@IsEmail()` on the **token** field, so every real 64-char hex reset token fails validation with 400. Password reset cannot work until that decorator is removed. One-line fix, backend owner's call.

### 12.3 `RegisterDto.role` is a required, unvalidated free-text field
`role` is `@IsNotEmpty()` with no `@IsEnum`, and `UserService.create` writes it straight through — so a crafted request could self-assign `admin`. The frontend hard-codes `'user'`, which mitigates the honest path but not a curl. Flag it as a security finding; the fix (`@IsOptional() @IsEnum(['user'])`, or dropping the field and defaulting in the service) belongs to the backend owner.

Put all three in `web/VERIFICATION.md` under "API findings" — finding them is itself portfolio-worthy.

---

## 13. BUILD ORDER

Work in phases. **Stop after each phase, report what you did, and let the user look.** Do not sprint to the end.

| Phase | Deliverable | Done when |
|---|---|---|
| 0 | Read all four design files + the whole `src/` tree. Run the Refero research (§6). Write `web/DESIGN-NOTES.md` and a route inventory that maps every backend route to the UI that will call it. | The user has reviewed the inventory |
| 1 | Scaffold `web/`, Tailwind v4 + tokens, fonts, `env.ts`, the full `ui/` primitive layer, and a `/_kitchen-sink` route showing every variant and state | Kitchen sink renders, build+lint clean |
| 2 | BFF proxy, cookie layer, refresh-on-401, middleware, typed API client, error normalizer, TanStack Query provider | `curl` through the BFF works for login/me/refresh/logout |
| 3 | Auth pages: register, login, verify, check-email, forgot, reset — every error branch from §3.1 | Full flow walked in Chrome |
| 4 | App shell, dashboard, settings, admin gate | Real data on screen |
| 5 | `/tasks` board: CRUD, drag-drop, optimistic updates, undo, filters, keyboard | All four task ops verified |
| 6 | Landing page, in full — hero, sky, mascot, all 7 sections, OG image, favicons | Screenshots at 4 widths |
| 7 | Verification sweep (§11), `README.md`, `VERIFICATION.md`, a `pnpm dev` script at the root that runs API + web together | All checks green, numbers real |

---

## 14. DEFINITION OF DONE

- [ ] Every route in §3 is called from real UI; the route-inventory table has no unmapped row
- [ ] `pnpm build` + `pnpm lint` clean; no `any`, no `ts-ignore`, no unused exports
- [ ] Zero console errors, zero hydration warnings, on every page
- [ ] Every mutation has loading, success, error and rollback paths that were manually triggered
- [ ] Every list has loading, empty and error states
- [ ] Keyboard-only operation of login and the task board
- [ ] No token in `localStorage`, in a URL, or in a non-httpOnly cookie
- [ ] No fake logos, fake testimonials, fake metrics, or AI-generated raster art
- [ ] 375px width has no horizontal scroll on any page
- [ ] `README.md` explains the BFF decision, the design-system source, the three API findings, and how to run both halves
- [ ] `DESIGN-NOTES.md` cites the actual Refero screens used
- [ ] `VERIFICATION.md` carries real Lighthouse numbers and the bug log

Build it the way you'd build it if the reviewer were the person you most want to impress. Start with Phase 0 and report back.
