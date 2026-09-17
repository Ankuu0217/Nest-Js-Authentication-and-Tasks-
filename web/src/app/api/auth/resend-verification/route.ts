import { NextResponse, type NextRequest } from "next/server";
import { nestUrl } from "@/lib/server/nest-fetch";

const NEUTRAL_SUCCESS = {
  message: "If that email is registered and still needs verifying, a new link is on its way.",
};

const ALREADY_VERIFIED_MESSAGE = "Email is already verified";

/**
 * Mirrors forgot-password's enumeration hardening (see that route). Two
 * distinct backend responses would otherwise leak status through this
 * endpoint: an unknown-email 404, and an already-verified 400 — together
 * they'd let this be used to probe whether an address is registered and,
 * if so, whether it's verified. Both get normalized into the same neutral
 * response. A malformed-email 400 from ValidationPipe is left alone — that's
 * a real client error to surface, not a probe.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();

  const nestResponse = await fetch(nestUrl("auth/resend-verification"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  if (nestResponse.status === 404) {
    return NextResponse.json(NEUTRAL_SUCCESS);
  }

  if (nestResponse.status === 400) {
    const data = (await nestResponse.json().catch(() => null)) as { message?: string | string[] } | null;
    const messages = Array.isArray(data?.message) ? data.message : data?.message ? [data.message] : [];
    if (messages.includes(ALREADY_VERIFIED_MESSAGE)) {
      return NextResponse.json(NEUTRAL_SUCCESS);
    }
    return NextResponse.json(data ?? { message: "Request failed" }, { status: 400 });
  }

  const data = await nestResponse.text();
  return new NextResponse(data, {
    status: nestResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
