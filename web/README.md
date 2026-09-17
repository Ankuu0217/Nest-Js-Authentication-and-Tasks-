# MyTask — frontend

A Next.js 15 front end for the NestJS auth + task API in this repo (`src/`). Built to survive a
senior engineer opening DevTools: no fake data on authenticated screens, no dead routes, real
loading/empty/error states throughout.

## Running it

Two halves, two processes:

```bash
# from the repo root
pnpm start:dev          # Nest API on :4000

# in a second terminal
pnpm --filter web dev   # Next.js on :3000
```

Or both together with the included convenience script (kept as a standalone script rather than a
root `package.json` "dev" entry — the Nest `package.json`'s scripts were out of scope for this
build):

```bash
./dev.sh
```

Requires root `.env` to have `PORT=4000` (the API can't share `:3000` with Next) and
`web/.env.local` to have `NEST_API_URL=http://localhost:4000` / `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
Both are already set in this repo.

## The BFF decision

The Nest app has no CORS configured and its refresh cookie is `sameSite: strict`, so the browser
can't call it directly from a different origin. Rather than patch the backend, every request goes
through a Backend-for-Frontend layer inside Next.js:

- `web/src/app/api/bff/[[...path]]/route.ts` — generic authenticated proxy for everything except
  auth. Attaches the access token server-side, and on a 401 transparently refreshes the session and
  replays the request once before giving up.
- `web/src/app/api/auth/*/route.ts` — dedicated routes for login/register/verify/refresh/logout/
  forgot-password/reset-password, each handling Nest's cookie dance itself.

Three cookies, all set by the Next server: `mt_at` (access token, httpOnly), `mt_rt` (refresh
token, httpOnly), `mt_user` (display-only JSON — name/email/role for the UI shell — never httpOnly,
and never trusted for authorization; every real check re-verifies against the backend). The access
token **never reaches client JavaScript** — same-origin only, no CORS needed, nothing for an XSS
payload in this app to steal from storage because nothing auth-related is in storage.

## Design system

Tokens come from the attached Passionfroot extraction (`DESIGN-3.md` / `theme-3.css` /
`tokens-3.json`), copied into `web/src/app/globals.css`'s `@theme` block. The Refero MCP server
named in the original build brief wasn't available in the session that built this — that's stated
plainly in [`DESIGN-NOTES.md`](./DESIGN-NOTES.md) rather than faked. Font: **DM Serif Display**
instead of the (licensed, unavailable) `new-kansas` — it ships exactly one weight, so the brief's
"never bold the display serif" rule has no weight knob left to get wrong.

Dark mode is intentionally not implemented — this is a light, warm, editorial identity, and a
half-hearted toggle would cheapen it more than not having one.

## What's honestly not here

- **`favicon.ico`** — `icon.svg` and `apple-icon.tsx`/`opengraph-image.tsx` (via `next/og`) are all
  in place, but a literal multi-resolution `.ico` needs binary image tooling that wasn't available
  in the build environment (no ImageMagick/rsvg-convert/sharp). Every modern browser resolves the
  SVG icon fine; this is a cosmetic gap for legacy user agents only.
- **Footer GitHub/LinkedIn links** — the brief asked for these, but no real profile/repo URL was
  provided to link to, and inventing one would violate the project's own honesty rule. The footer
  links only to things that are actually real right now (register, login, the live API docs).
- **Lighthouse** — real numbers, not claimed: **96 / 100 / 100 / 100** (Performance / Accessibility /
  Best Practices / SEO) against a production build. See [`VERIFICATION.md`](./VERIFICATION.md).

## Findings while building

Eleven things were found by actually booting the app and clicking through it, not by reading
source — five in the backend (two of them, an import-erasure bug and an unhandled-rejection crash,
were severe enough that register/login/forgot-password didn't work *at all* before they were
fixed), and six in the frontend (a Tailwind spacing-token collision, a slide-over focus bug, a
refresh-token race that killed sessions after ~15 minutes, a scroll-reveal animation that could
permanently hide content, a `tailwind-merge` misconfiguration that was silently dropping text color
off every button and badge in the app, and a set of color-contrast failures — including in the
token file's own documented "safe" replacement color — that a real Lighthouse run caught and a
fix brought to 100/100 accessibility). Full detail, root causes, and how each was confirmed fixed is
in [`VERIFICATION.md`](./VERIFICATION.md) — worth reading if you want to see how a design system
integration can compile clean and still render wrong.

## Project structure

```
web/src/
  app/                    routes (App Router) + the BFF's own API routes under app/api/
  components/
    ui/                   the ~16 hand-built primitives (Button, SlideOver, DropdownMenu, ...)
    auth/, dashboard/, tasks/, settings/, shell/, landing/, brand/, illustrations/
  lib/
    api/                  typed client functions + the error normalizer
    server/               cookie handling, the Nest fetch helpers, session reading
    schemas/              zod schemas mirroring the backend DTOs exactly
  hooks/                  useTaskMutations (optimistic CRUD), useReveal (scroll animation)
  middleware.ts           route protection + the /admin role gate
  env.ts                  zod-validated server env, fails fast with a readable error
```
