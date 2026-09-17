import { parseApiErrorResponse } from "./errors";
import { bffFetch } from "./browser-client";
import type { AuthUser } from "./types";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw await parseApiErrorResponse(response);
  return (await response.json()) as T;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

/** role is always 'user' here, per the build spec: never expose an admin
 * toggle in signup, and never send a field the backend didn't ask for. */
export function register(input: RegisterInput) {
  return postJson<{ message: string }>("/api/auth/register", { ...input, role: "user" });
}

export function login(input: { email: string; password: string }) {
  return postJson<{ user: AuthUser }>("/api/auth/login", input);
}

export async function verifyEmail(token: string): Promise<{ user: AuthUser }> {
  const response = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
  if (!response.ok) throw await parseApiErrorResponse(response);
  return (await response.json()) as { user: AuthUser };
}

export function logout() {
  return postJson<{ message: string }>("/api/auth/logout", {});
}

export function forgotPassword(email: string) {
  return postJson<{ message: string }>("/api/auth/forgot-password", { email });
}

export function resendVerification(email: string) {
  return postJson<{ message: string }>("/api/auth/resend-verification", { email });
}

export function resetPassword(input: { token: string; password: string }) {
  return postJson<{ message: string }>("/api/auth/reset-password", input);
}

export function refreshSessionNow() {
  return postJson<{ user: AuthUser; expiresAt: string | null }>("/api/auth/refresh", {});
}

export function me() {
  return bffFetch<AuthUser>("auth/me");
}
