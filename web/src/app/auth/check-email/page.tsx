import type { Metadata } from "next";
import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { ResendVerification } from "@/components/auth/ResendVerification";
import { Mascot } from "@/components/illustrations/Mascot";
import { ButtonLink } from "@/components/ui/ButtonLink";

export const metadata: Metadata = { title: "Check your email" };

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <CenteredCardLayout className="text-center">
      <Mascot size={120} className="mx-auto" />
      <h1 className="mt-6 font-display text-heading-sm text-ink-black">Check your inbox</h1>
      <p className="mt-3 text-body-sm text-charcoal-stone">
        We sent a verification link to{" "}
        {email ? <strong className="text-ink-black">{email}</strong> : "your email address"}. Open
        it to activate your account — the link expires in 24 hours.
      </p>
      <p className="mt-4 text-caption text-charcoal-stone">Didn&apos;t get it? Check spam, or</p>
      {email ? (
        <ResendVerification email={email} className="mt-3 flex justify-center" />
      ) : (
        <ResendVerification className="mt-3 text-left" />
      )}
      <ButtonLink href="/login" variant="neutral-bordered" className="mt-8">
        Back to login
      </ButtonLink>
    </CenteredCardLayout>
  );
}
