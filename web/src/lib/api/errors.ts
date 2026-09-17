import type { NestErrorBody } from "./types";

export const SESSION_EXPIRED_CODE = "SESSION_EXPIRED";

/**
 * Normalizes every shape a failed API call can come back in — Nest's
 * `{statusCode, message, error}` (message is a string for thrown exceptions,
 * a string[] for ValidationPipe failures), the BFF's own `{code}` sentinel,
 * or a network/parse failure — into one consistent type the UI can branch on.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly messages: string[];
  readonly code: string | null;

  constructor(status: number, messages: string[], code: string | null = null) {
    super(messages.join(" ") || "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.messages = messages;
    this.code = code;
  }

  get message0(): string {
    return this.messages[0] ?? "Something went wrong";
  }

  is(status: number, ...messages: string[]): boolean {
    if (this.status !== status) return false;
    if (messages.length === 0) return true;
    return messages.some((m) => this.messages.includes(m));
  }
}

export async function parseApiErrorResponse(response: Response): Promise<ApiError> {
  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return new ApiError(response.status, [response.statusText || "Request failed"]);
  }

  if (isNestErrorBody(body)) {
    const messages = Array.isArray(body.message) ? body.message : [body.message];
    return new ApiError(response.status, messages);
  }

  if (isCodeBody(body)) {
    return new ApiError(response.status, [body.code], body.code);
  }

  return new ApiError(response.status, ["Request failed"]);
}

function isNestErrorBody(body: unknown): body is NestErrorBody {
  return (
    typeof body === "object" &&
    body !== null &&
    "statusCode" in body &&
    "message" in body
  );
}

function isCodeBody(body: unknown): body is { code: string } {
  return typeof body === "object" && body !== null && "code" in body && typeof (body as { code: unknown }).code === "string";
}
