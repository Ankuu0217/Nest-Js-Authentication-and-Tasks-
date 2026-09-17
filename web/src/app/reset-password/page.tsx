"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/lib/schemas/auth";
import { resetPassword } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  const password = watch("password", "");

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordFormValues) =>
      resetPassword({ token: token ?? "", password: values.password }),
    onError: (error) => {
      setError("root", {
        message: error instanceof ApiError ? error.message0 : "Something went wrong.",
      });
    },
  });

  if (!token) {
    return (
      <CenteredCardLayout className="text-center">
        <h1 className="font-display text-heading-sm text-ink-black">Missing reset link</h1>
        <p className="mt-3 text-body-sm text-charcoal-stone">
          This page needs a token from your reset email.
        </p>
        <ButtonLink href="/forgot-password" className="mt-8">
          Request a new link
        </ButtonLink>
      </CenteredCardLayout>
    );
  }

  if (mutation.isSuccess) {
    return (
      <CenteredCardLayout className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-linen-beige">
          <CheckCircle2 className="size-6 text-forest-green" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-heading-sm text-ink-black">Password reset</h1>
        <p className="mt-3 text-body-sm text-charcoal-stone">Log in with your new password.</p>
        <ButtonLink href="/login" className="mt-8">
          Go to login
        </ButtonLink>
      </CenteredCardLayout>
    );
  }

  const isExpired = mutation.error instanceof ApiError && mutation.error.is(400, "Token expired");

  return (
    <CenteredCardLayout>
      <h1 className="font-display text-heading-sm text-ink-black">Choose a new password</h1>

      {isExpired ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-tangerine bg-tangerine/10 px-4 py-3 text-body-sm text-charcoal-stone">
            This reset link has expired. Links are valid for one hour.
          </div>
          <ButtonLink href="/forgot-password" className="w-full">
            Request a new link
          </ButtonLink>
        </div>
      ) : (
        <form
          className="mt-8 space-y-5"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          noValidate
        >
          <div>
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
              {...register("password")}
            />
            <PasswordStrengthMeter password={password} />
            <FieldError id="password-error">{errors.password?.message}</FieldError>
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              {...register("confirmPassword")}
            />
            <FieldError id="confirm-password-error">{errors.confirmPassword?.message}</FieldError>
          </div>
          {errors.root?.message && <FieldError>{errors.root.message}</FieldError>}
          <Button type="submit" className="w-full" loading={mutation.isPending}>
            Reset password
          </Button>
        </form>
      )}
    </CenteredCardLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
