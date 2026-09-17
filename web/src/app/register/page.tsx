"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AuthSplitLayout } from "@/components/auth/AuthSplitLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { PasswordStrengthMeter } from "@/components/ui/PasswordStrengthMeter";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { registerSchema, type RegisterFormValues } from "@/lib/schemas/auth";
import { register as registerRequest } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";
import { maskEmail } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  const password = watch("password", "");

  const mutation = useMutation({
    mutationFn: (values: RegisterFormValues) =>
      registerRequest({ name: values.name, email: values.email, password: values.password }),
    onSuccess: (_data, values) => {
      router.push(`/auth/check-email?email=${encodeURIComponent(maskEmail(values.email))}`);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.is(409)) {
        setError("email", { message: "An account with this email already exists." });
        return;
      }
      setError("root", {
        message: error instanceof ApiError ? error.message0 : "Something went wrong. Try again.",
      });
    },
  });

  const isDuplicateEmail = mutation.error instanceof ApiError && mutation.error.is(409);

  return (
    <AuthSplitLayout>
      <h1 className="font-display text-heading-sm text-ink-black">Create your account</h1>
      <p className="mt-2 text-body-sm text-charcoal-stone">
        Free to use — the source is right here if you want to see what it actually does.
      </p>

      <form
        className="mt-8 space-y-5"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        noValidate
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          <FieldError id="name-error">{errors.name?.message}</FieldError>
        </div>
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
          <FieldError id="email-error">
            {errors.email?.message}
            {isDuplicateEmail && (
              <>
                {" "}
                <Link href="/login" className="underline">
                  Log in instead
                </Link>
              </>
            )}
          </FieldError>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
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
          <Label htmlFor="confirmPassword">Confirm password</Label>
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
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-body-sm text-charcoal-stone">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-ink-black underline">
          Log in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
