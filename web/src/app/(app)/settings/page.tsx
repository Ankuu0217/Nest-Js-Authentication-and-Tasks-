import type { Metadata } from "next";
import { fetchFromNestForRSC } from "@/lib/server/rsc-fetch";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { SessionCard } from "@/components/settings/SessionCard";
import type { AuthUser } from "@/lib/api/types";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const me = await fetchFromNestForRSC<AuthUser>("auth/me");

  return (
    <div className="max-w-2xl space-y-8">
      <h1 className="font-display text-heading text-ink-black">Settings</h1>

      <Card>
        <h2 className="mb-4 text-body font-semibold text-ink-black">Profile</h2>
        {me ? (
          <div className="flex items-center gap-4">
            <Avatar userId={me.id} name={me.name} size="lg" />
            <div>
              <p className="text-body font-medium text-ink-black">{me.name}</p>
              <p className="text-body-sm text-charcoal-stone">{me.email}</p>
            </div>
          </div>
        ) : (
          <p className="text-body-sm text-coral-red-text">
            Couldn&apos;t load your profile. Try refreshing the page.
          </p>
        )}
        <p className="mt-4 text-caption text-charcoal-stone">
          Profile editing isn&apos;t exposed by the API yet.
        </p>
      </Card>

      <SessionCard user={me} />
    </div>
  );
}
