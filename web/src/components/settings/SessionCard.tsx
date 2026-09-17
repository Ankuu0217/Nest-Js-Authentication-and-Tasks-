"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { logout, refreshSessionNow } from "@/lib/api/auth-client";
import type { AuthUser } from "@/lib/api/types";

export function SessionCard({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const [expiresAt, setExpiresAt] = useState<string | null>(null);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push("/");
      router.refresh();
    },
  });

  const refreshMutation = useMutation({
    mutationFn: refreshSessionNow,
    onSuccess: (data) => setExpiresAt(data.expiresAt),
  });

  return (
    <Card>
      <h2 className="mb-4 text-body font-semibold text-ink-black">Session</h2>
      <div className="flex items-center justify-between">
        <span className="text-body-sm text-charcoal-stone">Role</span>
        {user && <Badge tone={user.role === "admin" ? "violet" : "neutral"}>{user.role}</Badge>}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <Button
          variant="neutral-bordered"
          loading={refreshMutation.isPending}
          onClick={() => refreshMutation.mutate()}
        >
          Refresh session now
        </Button>
        <Button
          variant="destructive"
          loading={logoutMutation.isPending}
          onClick={() => logoutMutation.mutate()}
        >
          Log out
        </Button>
      </div>

      {refreshMutation.isError && (
        <p className="mt-3 text-caption text-coral-red-text">Couldn&apos;t refresh the session.</p>
      )}
      {expiresAt && (
        <p className="mt-3 text-caption text-charcoal-stone">
          New access token expires at {new Date(expiresAt).toLocaleTimeString()}.
        </p>
      )}
    </Card>
  );
}
