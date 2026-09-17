"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { loginSchema, type LoginFormValues } from "@/lib/schemas/auth";
import { login } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";

const RATE_LIMIT_SECONDS = 60;

function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  return { secondsLeft, start: () => setSecondsLeft(RATE_LIMIT_SECONDS) };
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const reason = searchParams.get("reason");
  const { secondsLeft, start: startCountdown } = useCountdown();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (values: LoginFormValues) => login(values),
    onSuccess: () => {
      router.push((nextPath ?? "/dashboard") as Route);
      router.refresh();
    },
    onError: (error) => {
      if (!(error instanceof ApiError)) return;
      if (error.status === 429) {
        startCountdown();
        return;
      }
      // 401 (wrong password) and 404 (unknown email) get identical copy —
      // the backend does distinguish them, but the frontend deliberately
      // doesn't, to avoid leaking which emails are registered.
      if (error.status === 401 || error.status === 404) {
        return; // handled by the generic banner below via mutation.error
      }
    },
  });

  const unverified = mutation.error instanceof ApiError && mutation.error.is(400, "Please verify your email");
  const badCredentials =
    mutation.error instanceof ApiError && (mutation.error.status === 401 || mutation.error.status === 404);
  const rateLimited = mutation.error instanceof ApiError && mutation.error.status === 429;

  return (
    <AuthSplitLayout>
      <h1 className="font-display text-heading-sm text-ink-black">Welcome back</h1>
      <p className="mt-2 text-body-sm text-charcoal-stone">Log in to see your tasks.</p>

      {reason === "expired" && (
        <div className="mt-4 rounded-xl border border-tangerine bg-tangerine/10 px-4 py-3 text-body-sm text-charcoal-stone">
          Your session expired. Log in again to continue.
        </div>
      )}

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          <FieldError id="email-error">{errors.email?.message}</FieldError>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="mb-0">
              Password
            </Label>
            <Link href="/forgot-password" className="text-caption text-charcoal-stone underline">
              Forgot password?
            </Link>
          </div>
          <div className="mt-1.5">
            <PasswordInput
              id="password"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
          </div>
          <FieldError id="password-error">{errors.password?.message}</FieldError>
        </div>

        {badCredentials && <FieldError>Email or password is incorrect.</FieldError>}

        {unverified && (
          <div className="rounded-xl border border-tangerine bg-tangerine/10 px-4 py-3 text-body-sm text-charcoal-stone">
            Please verify your email before logging in.{" "}
            <Link href="/auth/check-email" className="underline">
              Resend the verification email
            </Link>
            .
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          loading={mutation.isPending}
          disabled={rateLimited && secondsLeft > 0}
        >
          {rateLimited && secondsLeft > 0 ? `Try again in ${secondsLeft}s` : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-charcoal-stone">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-ink-black underline">
          Create one
        </Link>
      </p>
    </AuthSplitLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
