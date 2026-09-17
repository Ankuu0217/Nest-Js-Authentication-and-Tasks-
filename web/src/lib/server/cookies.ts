import "server-only";
import type { NextResponse } from "next/server";
import type { AuthUser } from "@/lib/api/types";

export const COOKIE_NAMES = {
  accessToken: "mt_at",
  refreshToken: "mt_rt",
  user: "mt_user",
} as const;

const isProd = process.env.NODE_ENV === "production";
const SEVEN_DAYS_SECONDS = 7 * 24 * 60 * 60;
const DEFAULT_ACCESS_TTL_SECONDS = 15 * 60;

export interface Session {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

/** Reads the JWT's own `exp` claim so the cookie's maxAge tracks the token's
 * real lifetime instead of an assumed constant that could drift from the
 * backend's JWT_ACCESS_EXPIRES_IN. No signature check — this cookie is
 * httpOnly and the backend re-verifies the token on every request anyway. */
function accessTokenTtlSeconds(accessToken: string): number {
  try {
    const payloadSegment = accessToken.split(".")[1];
    if (!payloadSegment) return DEFAULT_ACCESS_TTL_SECONDS;
    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8")) as {
      exp?: number;
    };
    if (!payload.exp) return DEFAULT_ACCESS_TTL_SECONDS;
    const remaining = payload.exp - Math.floor(Date.now() / 1000);
    return remaining > 0 ? remaining : DEFAULT_ACCESS_TTL_SECONDS;
  } catch {
    return DEFAULT_ACCESS_TTL_SECONDS;
  }
}

/** Decodes just the `exp` claim as an ISO timestamp — used to tell the
 * client when its session expires without ever handing over the token
 * itself (the "Refresh session now" affordance on /settings shows this). */
export function decodeJwtExpiryIso(accessToken: string): string | null {
  try {
    const payloadSegment = accessToken.split(".")[1];
    if (!payloadSegment) return null;
    const payload = JSON.parse(Buffer.from(payloadSegment, "base64url").toString("utf8")) as {
      exp?: number;
    };
    return payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
  } catch {
    return null;
  }
}

export function applySessionCookies(response: NextResponse, session: Session): void {
  response.cookies.set(COOKIE_NAMES.accessToken, session.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProd,
    maxAge: accessTokenTtlSeconds(session.accessToken),
  });
  response.cookies.set(COOKIE_NAMES.refreshToken, session.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: isProd,
    maxAge: SEVEN_DAYS_SECONDS,
  });
  response.cookies.set(COOKIE_NAMES.user, JSON.stringify(session.user), {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    secure: isProd,
    maxAge: SEVEN_DAYS_SECONDS,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  for (const name of Object.values(COOKIE_NAMES)) {
    response.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
}

/** Pulls a single cookie's value out of a raw `Set-Cookie` response header. */
export function extractSetCookieValue(setCookieHeader: string, name: string): string | null {
  const match = setCookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1] ?? null;
}
