import type { Metadata } from "next";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { fetchFromNestForRSC } from "@/lib/server/rsc-fetch";
import { TasksBoard } from "@/components/tasks/TasksBoard";
import type { Task } from "@/lib/api/types";

export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tasks"],
    queryFn: () => fetchFromNestForRSC<Task[]>("tasks"),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TasksBoard />
    </HydrationBoundary>
  );
}
