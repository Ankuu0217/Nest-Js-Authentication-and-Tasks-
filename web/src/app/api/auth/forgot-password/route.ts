import { NextResponse, type NextRequest } from "next/server";
import { nestUrl } from "@/lib/server/nest-fetch";

const NEUTRAL_SUCCESS = { message: "If that email is registered, a reset link is on its way." };

/** The backend 404s on an unknown email (see UserService.forgotPassword),
 * which would let the UI be used to enumerate registered addresses. This
 * BFF route is the enumeration hardening: unknown-email 404s are normalized
 * into the same neutral response a real match gets. See VERIFICATION.md. */
export async function POST(req: NextRequest) {
  const body = await req.text();

  const nestResponse = await fetch(nestUrl("auth/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  if (nestResponse.status === 404) {
    return NextResponse.json(NEUTRAL_SUCCESS);
  }

  const data = await nestResponse.text();
  return new NextResponse(data, {
    status: nestResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
