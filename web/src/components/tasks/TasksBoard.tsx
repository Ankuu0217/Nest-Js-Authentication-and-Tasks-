"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { LayoutGrid, List, Search, Plus, Inbox } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { Mascot } from "@/components/illustrations/Mascot";
import { TaskColumn } from "./TaskColumn";
import { TaskCard } from "./TaskCard";
import { TaskFormSlideOver } from "./TaskFormSlideOver";
import { ShortcutsSheet } from "./ShortcutsSheet";
import { listTasks } from "@/lib/api/tasks-client";
import { useDeleteTask, useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/api/types";

function noop() {
  return undefined;
}

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "in_progress", label: "In progress" },
  { status: "done", label: "Done" },
];

const STATUS_FILTERS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

// Same solid hue each status's Badge is built from (see Badge's tone map),
// not the pale badge background tint — a thin bar needs to actually read as
// a color, not disappear against the toast's paper-white surface.
const STATUS_BAR_COLOR: Record<TaskStatus, string> = {
  todo: "bg-charcoal-stone",
  in_progress: "bg-sunshine-yellow",
  done: "bg-forest-green",
};

const MOVE_TOAST_DURATION_MS = 3000;

function showTaskMovedToast(taskTitle: string, targetStatus: TaskStatus, targetLabel: string) {
  toast.custom(() => (
    <div className="relative w-full overflow-hidden rounded-xl border border-sand-gray bg-paper-white px-4 py-3 shadow-subtle">
      <p className="text-body-sm text-ink-black">
        <span className="font-medium">{taskTitle}</span> moved to {targetLabel}
      </p>
      <div className="absolute inset-x-0 bottom-0 h-1 bg-linen-beige">
        <div
          className={cn("h-full origin-left", STATUS_BAR_COLOR[targetStatus])}
          style={{ animation: `toast-progress ${MOVE_TOAST_DURATION_MS}ms linear forwards` }}
        />
      </div>
    </div>
  ), { duration: MOVE_TOAST_DURATION_MS });
}

type PanelState = { mode: "create" } | { mode: "edit"; task: Task } | null;

export function TasksBoard() {
  const { data: tasks = [], isPending } = useQuery({ queryKey: ["tasks"], queryFn: listTasks });
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();

  const [view, setView] = useState<"board" | "list">("board");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"updated" | "created">("updated");
  const [panel, setPanel] = useState<PanelState>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping = target ? ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) : false;

      if (event.key === "Escape") {
        setPanel(null);
        setShortcutsOpen(false);
        return;
      }
      if (isTyping) return;
      if (event.key === "n") {
        event.preventDefault();
        setPanel({ mode: "create" });
      } else if (event.key === "/") {
        event.preventDefault();
        searchInputRef.current?.focus();
      } else if (event.key === "?") {
        event.preventDefault();
        setShortcutsOpen(true);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredTasks = useMemo(() => {
    let result = tasks;
    const query = search.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (t) => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query),
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    const field = sortBy === "created" ? "createdAt" : "updatedAt";
    return [...result].sort((a, b) => new Date(b[field]).getTime() - new Date(a[field]).getTime());
  }, [tasks, search, statusFilter, sortBy]);

  const tasksByStatus = useMemo(() => {
    const map: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    for (const task of filteredTasks) map[task.status].push(task);
    return map;
  }, [filteredTasks]);

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(tasks.find((t) => t.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const overId = String(over.id);
    const targetStatus = COLUMNS.some((c) => c.status === overId)
      ? (overId as TaskStatus)
      : tasks.find((t) => t.id === overId)?.status;

    if (!targetStatus || targetStatus === task.status) return;

    const targetLabel = COLUMNS.find((c) => c.status === targetStatus)?.label ?? targetStatus;
    updateMutation.mutate({ id: task.id, input: { status: targetStatus } });
    setLiveMessage(`${task.title} moved to ${targetLabel}`);
    showTaskMovedToast(task.title, targetStatus, targetLabel);
  }

  function handleDelete(task: Task) {
    deleteMutation.mutate(task.id, {
      onSuccess: () => {
        toast("Task deleted", {
          duration: 5000,
          action: {
            label: "Undo",
            onClick: () =>
              createMutation.mutate({
                title: task.title,
                description: task.description,
                status: task.status,
              }),
          },
        });
      },
    });
  }

  const hasAnyTasks = tasks.length > 0;
  const hasFilteredResults = filteredTasks.length > 0;

  return (
    <div className="max-w-6xl space-y-6">
      <div aria-live="polite" className="sr-only">
        {liveMessage}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-heading text-ink-black">Tasks</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="neutral-bordered"
            size="sm"
            onClick={() => setShortcutsOpen(true)}
            aria-label="Show keyboard shortcuts"
          >
            ?
          </Button>
          <Button size="sm" onClick={() => setPanel({ mode: "create" })}>
            <Plus className="size-4" aria-hidden="true" />
            New task
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-warm"
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks… (press /)"
            className="pl-9"
            aria-label="Search tasks"
          />
        </div>

        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              aria-pressed={statusFilter === f.value}
              className={cn(
                "rounded-full px-3 py-1.5 text-caption font-medium transition-colors",
                statusFilter === f.value
                  ? "bg-ink-black text-paper-white"
                  : "bg-linen-beige text-charcoal-stone hover:bg-sand-gray/60",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "updated" | "created")}
          aria-label="Sort tasks"
          className="rounded-xl border border-sand-gray bg-paper-white px-3 py-2 text-caption text-charcoal-stone"
        >
          <option value="updated">Recently updated</option>
          <option value="created">Recently created</option>
        </select>

        <div className="flex items-center rounded-xl border border-sand-gray bg-paper-white p-0.5">
          <button
            type="button"
            onClick={() => setView("board")}
            aria-pressed={view === "board"}
            aria-label="Board view"
            className={cn("rounded-lg p-1.5", view === "board" ? "bg-linen-beige text-ink-black" : "text-slate-warm")}
          >
            <LayoutGrid className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            aria-pressed={view === "list"}
            aria-label="List view"
            className={cn("rounded-lg p-1.5", view === "list" ? "bg-linen-beige text-ink-black" : "text-slate-warm")}
          >
            <List className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {isPending ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {COLUMNS.map((c) => (
            <div key={c.status} className="space-y-3 rounded-2xl border border-sand-gray bg-linen-beige/40 p-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : !hasAnyTasks ? (
        <EmptyState
          icon={<Mascot size={96} />}
          title="No tasks yet"
          description="Create your first task to get the board moving."
          action={<Button onClick={() => setPanel({ mode: "create" })}>New task</Button>}
        />
      ) : !hasFilteredResults ? (
        <EmptyState
          icon={<Inbox className="size-6" aria-hidden="true" />}
          title="No matching tasks"
          description="Try a different search term or clear the status filter."
        />
      ) : view === "board" ? (
        <DndContext
          id="tasks-board"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {COLUMNS.map((column) => (
              <TaskColumn
                key={column.status}
                status={column.status}
                label={column.label}
                tasks={tasksByStatus[column.status]}
                onEditTask={(task) => setPanel({ mode: "edit", task })}
                onDeleteTask={handleDelete}
              />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <TaskCard task={activeTask} onEdit={noop} onDelete={noop} dragOverlay />
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => setPanel({ mode: "edit", task })}
              onDelete={() => handleDelete(task)}
            />
          ))}
        </div>
      )}

      <TaskFormSlideOver
        open={panel !== null}
        onClose={() => setPanel(null)}
        task={panel?.mode === "edit" ? panel.task : undefined}
      />
      <ShortcutsSheet open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
