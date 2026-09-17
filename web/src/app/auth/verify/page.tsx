"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, XCircle } from "lucide-react";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { ResendVerification } from "@/components/auth/ResendVerification";
import { Mascot } from "@/components/illustrations/Mascot";
import { Skeleton } from "@/components/ui/Skeleton";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Button } from "@/components/ui/Button";
import { verifyEmail } from "@/lib/api/auth-client";
import { ApiError } from "@/lib/api/errors";

function StatusCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <CenteredCardLayout className="text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-linen-beige">
        {icon}
      </div>
      <h1 className="mt-6 font-display text-heading-sm text-ink-black">{title}</h1>
      <p className="mt-3 text-body-sm text-charcoal-stone">{description}</p>
      <div className="mt-8">{action}</div>
    </CenteredCardLayout>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { data, error, isPending } = useQuery({
    queryKey: ["verify-email", token],
    queryFn: () => verifyEmail(token ?? ""),
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (!data) return;
    const id = setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 3000);
    return () => clearTimeout(id);
  }, [data, router]);

  if (!token) {
    return (
      <StatusCard
        icon={<XCircle className="size-8 text-coral-red" aria-hidden="true" />}
        title="Missing verification link"
        description="This page needs a token from your verification email."
        action={<ButtonLink href="/register">Back to sign up</ButtonLink>}
      />
    );
  }

  if (isPending) {
    return (
      <CenteredCardLayout className="text-center">
        <Mascot size={120} className="mx-auto" />
        <h1 className="mt-6 font-display text-heading-sm text-ink-black">Verifying your email…</h1>
        <div className="mt-6 space-y-3">
          <Skeleton className="mx-auto h-4 w-48" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </CenteredCardLayout>
    );
  }

  if (error) {
    const isExpired = error instanceof ApiError && error.is(400, "Token expired");
    const isNotFound = error instanceof ApiError && error.status === 404;

    return (
      <StatusCard
        icon={<XCircle className="size-8 text-coral-red" aria-hidden="true" />}
        title={isExpired ? "This link has expired" : "We couldn't verify that link"}
        description={
          isExpired
            ? "Verification links are valid for 24 hours. Enter your email below to get a new one."
            : isNotFound
              ? "This verification link doesn't match any pending account — it may have already been used."
              : "Something went wrong verifying this link. Try again from the email, or register again."
        }
        action={
          isExpired ? (
            <ResendVerification className="mx-auto max-w-xs text-left" />
          ) : (
            <ButtonLink href="/register">Back to sign up</ButtonLink>
          )
        }
      />
    );
  }

  return (
    <StatusCard
      icon={<CheckCircle2 className="size-8 text-forest-green" aria-hidden="true" />}
      title="Email verified"
      description="Your account is active. Taking you to your dashboard…"
      action={
        <Button
          onClick={() => {
            router.push("/dashboard");
            router.refresh();
          }}
        >
          Go now
        </Button>
      }
    />
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}
