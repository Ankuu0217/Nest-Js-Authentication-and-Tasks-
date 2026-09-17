import "server-only";
import { z } from "zod";

const envSchema = z.object({
  NEST_API_URL: z.url(),
  NEXT_PUBLIC_APP_URL: z.url(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

function loadEnv() {
  const parsed = envSchema.safeParse({
    NEST_API_URL: process.env.NEST_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
  });

  if (!parsed.success) {
    const issues = z.prettifyError(parsed.error);
    throw new Error(
      `Invalid environment variables — check web/.env.local:\n${issues}`,
    );
  }

  return parsed.data;
}

export const env = loadEnv();
