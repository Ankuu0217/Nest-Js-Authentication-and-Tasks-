import { Suspense } from "react";
import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchFromNestForRSC } from "@/lib/server/rsc-fetch";
import { getDisplaySessionUser } from "@/lib/server/session";
import { DashboardContent } from "@/components/dashboard/DashboardContent";
import type { Task } from "@/lib/api/types";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getDisplaySessionUser();
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchFromNestForRSC<Task[]>("tasks"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense>
        <DashboardContent userName={user?.name ?? "there"} />
      </Suspense>
    </HydrationBoundary>
  );
}
