"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MoreHorizontal, Trash2, Pencil, GripVertical } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime, cn } from "@/lib/utils";
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

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  dragOverlay?: boolean;
}

export function TaskCard({ task, onEdit, onDelete, dragOverlay = false }: TaskCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = dragOverlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition };

  return (
    <div
      ref={dragOverlay ? undefined : setNodeRef}
      style={style}
      {...(dragOverlay ? {} : attributes)}
      {...(dragOverlay ? {} : listeners)}
      aria-roledescription="draggable task"
      className={cn(
        "cursor-grab touch-none rounded-xl border border-sand-gray bg-paper-white p-4 shadow-subtle-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-violet active:cursor-grabbing",
        isDragging && "opacity-40",
        dragOverlay && "rotate-2 shadow-subtle-3",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <span
            aria-hidden="true"
            className="mt-0.5 shrink-0 rounded p-0.5 text-slate-warm"
          >
            <GripVertical className="size-4" />
          </span>
          <p className="min-w-0 truncate text-[15px] font-semibold text-ink-black">{task.title}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label={`Task options for ${task.title}`}
            className="shrink-0 rounded-lg p-1 text-slate-warm hover:bg-linen-beige hover:text-charcoal-stone"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="size-4" aria-hidden="true" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem destructive onClick={() => setConfirmingDelete(true)}>
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="mt-1.5 line-clamp-2 text-body-sm text-charcoal-stone">{task.description}</p>

      <div className="mt-3 flex items-center justify-between">
        <Badge tone={STATUS_TONE[task.status]}>{STATUS_LABEL[task.status]}</Badge>
        <time
          dateTime={task.updatedAt}
          title={new Date(task.updatedAt).toLocaleString()}
          className="text-caption text-charcoal-stone"
        >
          {formatRelativeTime(task.updatedAt)}
        </time>
      </div>

      {confirmingDelete && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-coral-red bg-coral-red/5 px-3 py-2">
          <span className="text-caption text-charcoal-stone">Delete this task?</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
