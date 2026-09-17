import { CenteredCardLayout } from "@/components/auth/CenteredCardLayout";
import { Mascot } from "@/components/illustrations/Mascot";
import { ButtonLink } from "@/components/ui/ButtonLink";

export default function NotFound() {
  return (
    <CenteredCardLayout className="text-center">
      <Mascot size={120} className="mx-auto" />
      <h1 className="mt-6 font-display text-heading-sm text-ink-black">Page not found</h1>
      <p className="mt-3 text-body-sm text-charcoal-stone">
        We couldn&apos;t find that page. Check the address, or head back home.
      </p>
      <ButtonLink href="/" className="mt-8">
        Back home
      </ButtonLink>
    </CenteredCardLayout>
  );
}
