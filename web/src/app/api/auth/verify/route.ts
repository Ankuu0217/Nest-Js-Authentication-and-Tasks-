import { NextResponse, type NextRequest } from "next/server";
import { nestUrl } from "@/lib/server/nest-fetch";
import { applySessionCookies, extractSetCookieValue } from "@/lib/server/cookies";
import type { AuthUser } from "@/lib/api/types";

/** GET ?token= -> Nest's GET /api/auth?token= (the mismatch the backend's
 * own email links produce is resolved entirely here, see auth.controller.ts
 * verifyEmail vs. EmailService's link -> /auth/verify). */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { statusCode: 400, message: "Missing token", error: "Bad Request" },
      { status: 400 },
    );
  }

  const nestResponse = await fetch(nestUrl("auth", `?token=${encodeURIComponent(token)}`), {
    cache: "no-store",
  });

  const data = await nestResponse.text();

  if (!nestResponse.ok) {
    return new NextResponse(data, {
      status: nestResponse.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const parsed = JSON.parse(data) as { accessToken: string; user: AuthUser };
  const setCookieHeader = nestResponse.headers.get("set-cookie");
  const refreshToken = setCookieHeader ? extractSetCookieValue(setCookieHeader, "refresh_token") : null;

  const response = NextResponse.json({ user: parsed.user });
  if (refreshToken) {
    applySessionCookies(response, {
      accessToken: parsed.accessToken,
      refreshToken,
      user: parsed.user,
    });
  }
  return response;
}
