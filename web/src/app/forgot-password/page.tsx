"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Mail } from "lucide-react";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/lib/schemas/auth";
import { forgotPassword } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";

export default function ForgotPasswordPage() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ForgotPasswordFormValues) => forgotPassword(values.email),
    onSuccess: (_data, values) => setSubmittedEmail(values.email),
    onError: (error) => {
      setError("root", {
        message: error instanceof ApiError ? error.message0 : "Something went wrong. Try again.",
      });
    },
  });

  if (submittedEmail) {
    return (
      <CenteredCardLayout className="text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-linen-beige">
          <Mail className="size-6 text-charcoal-stone" aria-hidden="true" />
        </div>
        <h1 className="mt-6 font-display text-heading-sm text-ink-black">Check your inbox</h1>
        <p className="mt-3 text-body-sm text-charcoal-stone">
          If <strong className="text-ink-black">{submittedEmail}</strong> is registered, a reset
          link is on its way. It expires in an hour.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block text-body-sm font-medium text-ink-black underline"
        >
          Back to login
        </Link>
      </CenteredCardLayout>
    );
  }

  return (
    <CenteredCardLayout>
      <h1 className="font-display text-heading-sm text-ink-black">Reset your password</h1>
      <p className="mt-2 text-body-sm text-charcoal-stone">
        Enter the email on your account and we&apos;ll send a reset link.
      </p>

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

        {errors.root?.message && <FieldError>{errors.root.message}</FieldError>}

        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Send reset link
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-charcoal-stone">
        <Link href="/login" className="font-medium text-ink-black underline">
          Back to login
        </Link>
      </p>
    </CenteredCardLayout>
  );
}
