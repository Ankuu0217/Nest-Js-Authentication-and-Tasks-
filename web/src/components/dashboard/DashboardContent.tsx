"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ListChecks, Circle, CircleDot, CircleCheck, Activity, Inbox } from "lucide-react";
import { toast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { StatusDonut } from "./StatusDonut";
import { listTasks } from "@/lib/api/tasks-client";
import { formatRelativeTime } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/api/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_TONE: Record<TaskStatus, "neutral" | "sunshine" | "success"> = {
  todo: "neutral",
  in_progress: "sunshine",
  done: "success",
};

async function pingHealth(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = performance.now();
  try {
    const response = await fetch("/api/bff", { cache: "no-store" });
    return { ok: response.ok, latencyMs: Math.round(performance.now() - start) };
  } catch {
    return { ok: false, latencyMs: Math.round(performance.now() - start) };
  }
}

function useApiHealth() {
  return useQuery({
    queryKey: ["api-health"],
    queryFn: pingHealth,
    refetchInterval: 30_000,
    staleTime: 0,
  });
}

function greeting(name: string): string {
  const hour = new Date().getHours();
  const time = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return `Good ${time}, ${name.split(" ")[0]}`;
}

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ListChecks;
  label: string;
  value: number;
}) {
  return (
    <Card className="flex items-center gap-4">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linen-beige text-charcoal-stone">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block text-caption text-charcoal-stone">{label}</span>
        <span className="block font-display text-heading-sm tabular-nums text-ink-black">
          {value}
        </span>
      </span>
    </Card>
  );
}

function StatTileSkeleton() {
  return (
    <Card className="flex items-center gap-4">
      <Skeleton className="size-10 shrink-0 rounded-xl" />
      <span className="flex-1 space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-6 w-10" />
      </span>
    </Card>
  );
}

export function DashboardContent({ userName }: { userName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: listTasks });
  const health = useApiHealth();

  useEffect(() => {
    if (searchParams.get("reason") !== "forbidden") return;
    toast.error("You don't have access to that page.");
    router.replace("/dashboard");
  }, [searchParams, router]);

  const tasks: Task[] = tasksQuery.data ?? [];
  const counts: Record<TaskStatus, number> = {
    todo: tasks.filter((t) => t.status === "todo").length,
    in_progress: tasks.filter((t) => t.status === "in_progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };
  const recent = [...tasks]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-heading text-ink-black">{greeting(userName)}</h1>
        <span
          className="flex items-center gap-2 rounded-full border border-sand-gray bg-paper-white px-3 py-1.5 text-caption text-charcoal-stone"
          title="Pings GET /api/ through the BFF"
        >
          <Activity
            className={`size-3.5 ${health.data?.ok ? "text-forest-green" : "text-coral-red"}`}
            aria-hidden="true"
          />
          {health.isPending
            ? "Checking API…"
            : health.data?.ok
              ? `API healthy · ${health.data.latencyMs}ms`
              : "API unreachable"}
        </span>
      </div>

      {tasksQuery.isPending ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <StatTileSkeleton key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" aria-hidden="true" />}
          title="No tasks yet"
          description="Create your first task to see your stats fill in here."
          action={<ButtonLink href="/tasks">Go to tasks</ButtonLink>}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatTile icon={ListChecks} label="Total" value={tasks.length} />
            <StatTile icon={Circle} label="To do" value={counts.todo} />
            <StatTile icon={CircleDot} label="In progress" value={counts.in_progress} />
            <StatTile icon={CircleCheck} label="Done" value={counts.done} />
          </div>

          <Card>
            <h2 className="mb-4 text-body font-semibold text-ink-black">Status distribution</h2>
            <StatusDonut
              data={[
                { status: "todo", label: STATUS_LABEL.todo, count: counts.todo, color: "var(--color-slate-warm)" },
                {
                  status: "in_progress",
                  label: STATUS_LABEL.in_progress,
                  count: counts.in_progress,
                  color: "var(--color-tangerine)",
                },
                { status: "done", label: STATUS_LABEL.done, count: counts.done, color: "var(--color-forest-green)" },
              ]}
            />
          </Card>

          <Card>
            <h2 className="mb-4 text-body font-semibold text-ink-black">Recent activity</h2>
            <ul className="divide-y divide-sand-gray">
              {recent.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                  <Link
                    href="/tasks"
                    className="min-w-0 flex-1 truncate text-body-sm text-ink-black hover:underline"
                  >
                    {task.title}
                  </Link>
                  <Badge tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
                  <time
                    dateTime={task.updatedAt}
                    title={new Date(task.updatedAt).toLocaleString()}
                    className="shrink-0 text-caption text-charcoal-stone"
                  >
                    {formatRelativeTime(task.updatedAt)}
                  </time>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}
