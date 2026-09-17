import { NextResponse, type NextRequest } from "next/server";
import { nestUrl } from "@/lib/server/nest-fetch";

export async function POST(req: NextRequest) {
  const body = await req.text();

  const nestResponse = await fetch(nestUrl("auth/register"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  });

  const data = await nestResponse.text();
  return new NextResponse(data, {
    status: nestResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}
