import { NextResponse } from "next/server";
import { refreshSession } from "@/lib/server/nest-fetch";
import { applySessionCookies, clearSessionCookies, decodeJwtExpiryIso } from "@/lib/server/cookies";
import { SESSION_EXPIRED_CODE } from "@/lib/api/errors";

/** Never called from the browser except by this route's own client wrapper
 * for the "Refresh session now" dev affordance on /settings — the generic
 * BFF proxy calls refreshSession() directly rather than hitting this route. */
export async function POST() {
  const session = await refreshSession();

  if (!session) {
    const response = NextResponse.json({ code: SESSION_EXPIRED_CODE }, { status: 401 });
    clearSessionCookies(response);
    return response;
  }

  // expiresAt tells the client when its session expires without ever
  // handing over the access token itself.
  const response = NextResponse.json({
    user: session.user,
    expiresAt: decodeJwtExpiryIso(session.accessToken),
  });
  applySessionCookies(response, session);
  return response;
}
