import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { nestUrl, refreshSession } from "@/lib/server/nest-fetch";
import { COOKIE_NAMES, applySessionCookies, clearSessionCookies, type Session } from "@/lib/server/cookies";
import { SESSION_EXPIRED_CODE } from "@/lib/api/errors";

/**
 * Generic authenticated proxy: browser -> here -> Nest. Attaches the access
 * token server-side (it never reaches client JS), retries exactly once on a
 * 401 by refreshing the session, and on refresh failure clears all session
 * cookies and returns a sentinel the client query layer redirects on.
 */
async function proxy(req: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path } = await context.params;
  const targetPath = (path ?? []).join("/");

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  const body = hasBody ? await req.text() : undefined;

  const forward = (token: string | undefined) =>
    fetch(nestUrl(targetPath, req.nextUrl.search), {
      method: req.method,
      headers: {
        ...(hasBody ? { "Content-Type": req.headers.get("content-type") ?? "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body,
      cache: "no-store",
    });

  let nestResponse = await forward(accessToken);
  let refreshed: Session | null = null;

  if (nestResponse.status === 401) {
    // Not gated on `accessToken` being truthy: once the access token cookie
    // itself expires (~15min), the browser stops sending it at all, so this
    // branch is the ONLY path back to a session for an otherwise-still-valid
    // refresh token. Gating it on accessToken meant every request silently
    // broke exactly when the access token expired instead of refreshing.
    refreshed = await refreshSession();
    if (!refreshed) {
      const response = NextResponse.json({ code: SESSION_EXPIRED_CODE }, { status: 401 });
      clearSessionCookies(response);
      return response;
    }
    nestResponse = await forward(refreshed.accessToken);
  }

  const responseText = await nestResponse.text();
  const response = new NextResponse(responseText, {
    status: nestResponse.status,
    headers: { "Content-Type": nestResponse.headers.get("content-type") ?? "application/json" },
  });

  if (refreshed) {
    applySessionCookies(response, refreshed);
  }

  return response;
}

export { proxy as GET, proxy as POST, proxy as PATCH, proxy as DELETE, proxy as PUT };
