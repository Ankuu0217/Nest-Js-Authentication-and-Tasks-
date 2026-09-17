"use client";

import { useEffect } from "react";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { Button } from "@/components/ui/Button";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <CenteredCardLayout className="text-center">
      <h1 className="font-display text-heading-sm text-ink-black">Something went wrong</h1>
      <p className="mt-3 text-body-sm text-charcoal-stone">
        That&apos;s on us, not you. Try again, or head back to the dashboard.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/dashboard" variant="neutral-bordered">
          Dashboard
        </ButtonLink>
      </div>
    </CenteredCardLayout>
  );
}
