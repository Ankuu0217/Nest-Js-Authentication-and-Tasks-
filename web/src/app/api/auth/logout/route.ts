import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { nestUrl } from "@/lib/server/nest-fetch";
import { COOKIE_NAMES, clearSessionCookies } from "@/lib/server/cookies";

export async function POST() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(COOKIE_NAMES.accessToken)?.value;

  if (accessToken) {
    // Best-effort: the user is logged out client-side regardless of whether
    // the backend call succeeds (e.g. the token was already invalid).
    await fetch(nestUrl("auth/logout"), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    }).catch(() => {});
  }

  const response = NextResponse.json({ message: "Logout successful" });
  clearSessionCookies(response);
  return response;
}
