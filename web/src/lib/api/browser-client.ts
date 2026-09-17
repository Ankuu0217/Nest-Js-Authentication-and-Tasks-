import { parseApiErrorResponse } from "./errors";

/** Authenticated calls from the browser go through here -> the generic BFF
 * proxy -> Nest. Relative URL: same-origin, no CORS, no token ever visible
 * to this code (the proxy attaches it server-side from an httpOnly cookie). */
export async function bffFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/bff/${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw await parseApiErrorResponse(response);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
