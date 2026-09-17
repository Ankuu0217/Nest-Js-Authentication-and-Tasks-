import "server-only";
import { cookies } from "next/headers";
import { COOKIE_NAMES } from "./cookies";
import type { AuthUser } from "@/lib/api/types";

/** Reads the display-only mt_user cookie for the app shell (sidebar name,
 * avatar, nav gating) with zero round-trip. Never use this for anything
 * that authorizes an action — it's client-writable in principle, and every
 * real API call is authorized by the httpOnly access token on the backend
 * regardless of what this says. */
export async function getDisplaySessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE_NAMES.user)?.value;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}
