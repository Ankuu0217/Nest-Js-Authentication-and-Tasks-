import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users as UsersIcon } from "lucide-react";
import { fetchFromNestForRSC } from "@/lib/server/rsc-fetch";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import type { AuthUser } from "@/lib/api/types";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const me = await fetchFromNestForRSC<AuthUser>("auth/me");

  // Middleware already gates /admin on the mt_user display cookie, which is
  // non-httpOnly by design and never trusted for authorization. This is the
  // real check, against a role the backend just re-verified from the token.
  if (!me || me.role !== "admin") {
    redirect("/dashboard?reason=forbidden");
  }

  return (
    <div className="max-w-4xl space-y-8">
      <h1 className="font-display text-heading text-ink-black">Admin</h1>

      <Card>
        <h2 className="mb-1 text-body font-semibold text-ink-black">Users</h2>
        <p className="mb-6 text-body-sm text-charcoal-stone">
          A users table would live here, wired to a real admin endpoint.
        </p>
        <EmptyState
          icon={<UsersIcon className="size-6" aria-hidden="true" />}
          title="Not yet exposed by the API"
          description="AdminController has no routes today. This page, the nav item, and the role guard are all real — only the data source is missing."
        />
      </Card>
    </div>
  );
}
