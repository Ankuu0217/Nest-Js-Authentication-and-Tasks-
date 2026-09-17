# Route inventory — every backend route → the UI that calls it

Verified against the actual source (not just the prompt's description of it) on 2026-09-17.
Backend confirmed booting locally: `GET /api/docs` → 200, `GET /api/` → 401 (correctly
Bearer-gated, not `@Public()`).

| # | Backend route | Auth | BFF route | Calling UI | Status |
|---|---|---|---|---|---|
| 1 | `POST /api/auth/register` | public | `web/app/api/auth/register/route.ts` | `/register` form submit | Ready to wire |
| 2 | `GET /api/auth?token=` | public | `web/app/api/auth/verify/route.ts` | `/auth/verify` on mount | Ready to wire |
| 3 | `POST /api/auth/login` | public, 5/min | `web/app/api/auth/login/route.ts` | `/login` form submit | Ready to wire |
| 4 | `POST /api/auth/refresh` | public, cookie | `web/app/api/auth/refresh/route.ts` | (a) generic proxy's automatic 401-retry, (b) `/settings` "Refresh session now" dev affordance | Ready to wire |
| 5 | `POST /api/auth/logout` | Bearer | `web/app/api/auth/logout/route.ts` | Sidebar user-menu "Log out", `/settings` "Log out" | Ready to wire |
| 6 | `GET /api/auth/me` | Bearer | generic proxy `web/app/api/bff/[...path]/route.ts` → `auth/me` | Dashboard shell RSC fetch (sidebar chip), `/settings` profile card | Ready to wire |
| 7 | `POST /api/auth/forgot-password` | public | `web/app/api/auth/forgot-password/route.ts` | `/forgot-password` form submit | Ready to wire |
| 8 | `POST /api/auth/reset-password` | public | `web/app/api/auth/reset-password/route.ts` | `/reset-password` form submit | **Blocked** — `resetPasswordDto.token` has `@IsEmail()`; every real 64-char hex token 400s before it reaches the service. UI built correctly regardless; see blockers doc. |
| 9 | `GET /api/tasks` | Bearer | generic proxy → `tasks` | `/tasks` board initial RSC fetch + TanStack Query, `/dashboard` stat tiles/donut/recent-activity | **Blocked** — `TasksController` is an empty `@Controller('tasks')` shell, zero HTTP methods. Confirmed by booting the server: only `logout`, `me`, `forgot-password`, `reset-password` etc. map for auth; `TasksController {/api/tasks}` maps with no child routes. |
| 10 | `POST /api/tasks` | Bearer | generic proxy → `tasks` | `/tasks` create slide-over submit | Same block as #9 |
| 11 | `PATCH /api/tasks/:id` | Bearer | generic proxy → `tasks/:id` | `/tasks` edit slide-over submit, drag-and-drop column change | Same block as #9 |
| 12 | `DELETE /api/tasks/:id` | Bearer | generic proxy → `tasks/:id` | `/tasks` card delete confirm; Undo toast re-`POST`s (see #10) rather than calling this | Same block as #9 |
| 13 | `GET /api/` (AppController hello) | Bearer (not `@Public()`) | generic proxy → `` (root) | `/dashboard` "API health" status chip, ping + latency | Ready to wire |
| 14 | `/api/admin/*` | n/a | n/a | `/admin` renders the route/nav/table shell behind `role==='admin'` and a "not yet exposed by the API" `EmptyState` | **Empty by design** — `AdminController` has zero routes; nothing to block, nothing to fake |
| — | `GET /api/docs` (Swagger) | public | not proxied — direct link | Landing page ghost button "View the API docs", opens `NEXT_PUBLIC_APP_URL`-independent absolute link to the Nest origin in a new tab | Ready to wire |

**Zero unmapped rows.** Every controller method that exists today, plus the two that need to be
added per §12.1, has exactly one row above.

## What this means for build order

- Phases 1–3 (scaffold, BFF, auth pages) are fully buildable today, `reset-password` UI included —
  it will be built correct and demonstrably blocked at the last mile, not skipped.
- Phase 5 (`/tasks`) cannot exercise a real backend until #9–12 are unblocked. Per §12.1 of the
  build prompt, the fallback is `NEXT_PUBLIC_TASKS_API=off` routing the query layer to an
  in-memory fixture adapter with a persistent amber "Demo data" banner, same components/loading/
  error paths, one adapter swap when the controller ships.
- See `BACKEND-BLOCKERS.md` (to follow) for the exact decision needed from the user before any
  `src/` edit — nothing under `src/` is touched without that explicit go-ahead per rule §1.
