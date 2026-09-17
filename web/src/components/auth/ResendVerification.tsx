"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { resendVerification } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const COOLDOWN_SECONDS = 30;

/**
 * "Resend verification email" — used both where the email is already known
 * (check-email, right after registration: one-click button) and where it
 * isn't (the expired-token branch of /auth/verify: a small inline form).
 * The BFF always reports success for a validly-shaped email regardless of
 * whether the account exists or is already verified — see the
 * resend-verification route's enumeration hardening — so the only error
 * state surfaced here is a genuine failure, not "email not found."
 */
export function ResendVerification({
  email: knownEmail,
  className,
}: {
  email?: string;
  className?: string;
}) {
  const [email, setEmail] = useState(knownEmail ?? "");
  const [secondsLeft, setSecondsLeft] = useState(0);

  const mutation = useMutation({
    mutationFn: (value: string) => resendVerification(value),
  });

  // Starts (or restarts) the visible countdown on every successful send.
  useEffect(() => {
    if (mutation.isSuccess) setSecondsLeft(COOLDOWN_SECONDS);
  }, [mutation.isSuccess, mutation.data]);

  // Ticks the countdown down one second at a time. A self-rescheduling
  // setTimeout (not setInterval) keyed on secondsLeft avoids drift and
  // stale-closure bugs — each tick reads the count current to that render.
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft]);

  const onCooldown = secondsLeft > 0;
  const buttonLabel = (idleLabel: string) =>
    onCooldown ? `Resend in ${secondsLeft}s` : idleLabel;

  const errorMessage = mutation.isError
    ? mutation.error instanceof ApiError
      ? mutation.error.message0
      : "Something went wrong. Try again."
    : null;

  if (knownEmail) {
    return (
      <div className={cn("flex flex-col items-center gap-2", className)}>
        <Button
          type="button"
          variant="neutral-bordered"
          loading={mutation.isPending}
          disabled={onCooldown}
          onClick={() => mutation.mutate(knownEmail)}
        >
          {buttonLabel("Resend verification email")}
        </Button>
        {mutation.isSuccess && onCooldown && (
          <p className="text-caption text-forest-green" role="status">
            New link sent — check your inbox.
          </p>
        )}
        <FieldError>{errorMessage}</FieldError>
      </div>
    );
  }

  return (
    <form
      className={className}
      onSubmit={(e) => {
        e.preventDefault();
        if (!onCooldown && email) mutation.mutate(email);
      }}
      noValidate
    >
      <Label htmlFor="resend-email">Email</Label>
      <div className="mt-1.5 flex gap-2">
        <Input
          id="resend-email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="neutral-bordered"
          loading={mutation.isPending}
          disabled={onCooldown || !email}
          className="shrink-0"
        >
          {buttonLabel("Resend")}
        </Button>
      </div>
      {mutation.isSuccess && onCooldown && (
        <p className="mt-2 text-caption text-forest-green" role="status">
          If that email needs verifying, a new link is on its way.
        </p>
      )}
      <FieldError>{errorMessage}</FieldError>
    </form>
  );
}
