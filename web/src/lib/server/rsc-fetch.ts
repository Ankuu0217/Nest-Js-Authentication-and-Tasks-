import "server-only";
import { cookies } from "next/headers";
import { COOKIE_NAMES } from "./cookies";
import { nestUrl, refreshSession } from "./nest-fetch";
import { parseApiErrorResponse } from "@/lib/api/errors";

/**
 * Authenticated fetch for use from Server Components. Attempts a refresh on
 * 401 so first paint shows correct data even if the access token happened to
 * expire mid-render, but — unlike the BFF route handlers — cannot persist
 * the refreshed cookie (Server Components can't write cookies). That's fine:
 * the next request through the client-side BFF proxy refreshes and persists
 * it for real.
 */
export async function fetchFromNestForRSC<T>(path: string, search = ""): Promise<T | null> {
  const cookieStore = await cookies();
  let accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;

  let response = await fetch(nestUrl(path, search), {
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    cache: "no-store",
  });

  if (response.status === 401) {
    // Not gated on `accessToken` being truthy: once the access token cookie
    // itself expires (~15min), the browser stops sending it at all, so this
    // branch is the ONLY path back to a session for an otherwise-still-valid
    // refresh token. Gating it on accessToken meant every page silently
    // broke exactly when the access token expired instead of refreshing.
    const refreshed = await refreshSession();
    if (!refreshed) return null;
    accessToken = refreshed.accessToken;
    response = await fetch(nestUrl(path, search), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  }

  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  return (await response.json()) as T;
}
