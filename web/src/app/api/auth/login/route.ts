import { NextResponse, type NextRequest } from "next/server";
import { nestUrl } from "@/lib/server/nest-fetch";
import { applySessionCookies, extractSetCookieValue } from "@/lib/server/cookies";
import type { AuthUser } from "@/lib/api/types";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const nestResponse = await fetch(nestUrl("auth/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
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
