import "server-only";
import { cookies } from "next/headers";
import { env } from "@/env";
import { COOKIE_NAMES, extractSetCookieValue, type Session } from "./cookies";
import type { AuthUser } from "@/lib/api/types";

/** Calls the Nest backend directly. Never call this from the browser. */
export function nestUrl(path: string, search = ""): string {
  return `${env.NEST_API_URL}/api/${path}${search}`;
}

/**
 * Reads the refresh cookie and exchanges it for a new access/refresh token
 * pair against Nest. Returns null on any failure (missing cookie, expired or
 * invalid token, network error) — callers treat null as "session is over."
 *
 * This does NOT persist the new cookies itself: only a Route Handler or
 * Server Action can write cookies, so the two callers (the generic BFF proxy,
 * and the dedicated /api/auth/refresh route) apply them to their own
 * response. A Server Component that calls this for a first-paint data fetch
 * gets correct data for that render but can't persist the refresh — the next
 * client-side request through the BFF proxy will refresh again and persist
 * it then, which is an acceptable one-request delay for a rare race.
 */
export async function refreshSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(COOKIE_NAMES.refreshToken)?.value;
  if (!refreshToken) return null;

  let response: Response;
  try {
    response = await fetch(nestUrl("auth/refresh"), {
      method: "POST",
      headers: { Cookie: `refresh_token=${refreshToken}` },
      cache: "no-store",
    });
  } catch {
    return null;
  }

  if (!response.ok) return null;

  const setCookieHeader = response.headers.get("set-cookie");
  const newRefreshToken = setCookieHeader
    ? extractSetCookieValue(setCookieHeader, "refresh_token")
    : null;
  if (!newRefreshToken) return null;

  let data: { accessToken: string; user: AuthUser };
  try {
    data = (await response.json()) as { accessToken: string; user: AuthUser };
  } catch {
    return null;
  }

  return { accessToken: data.accessToken, refreshToken: newRefreshToken, user: data.user };
}
