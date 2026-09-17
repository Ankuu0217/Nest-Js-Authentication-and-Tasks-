"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { TaskCard } from "./TaskCard";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/api/types";

interface TaskColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function TaskColumn({ status, label, tasks, onEditTask, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-40 flex-1 flex-col gap-3 rounded-2xl border border-sand-gray bg-linen-beige/40 p-3 transition-colors",
        isOver && "border-pale-violet bg-lilac-mist/60",
      )}
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-body-sm font-semibold text-ink-black">{label}</h2>
        <span className="text-caption tabular-nums text-charcoal-stone">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {tasks.length === 0 ? (
            <p className="rounded-xl border border-dashed border-sand-gray px-3 py-8 text-center text-caption text-charcoal-stone">
              No tasks here.
            </p>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task)}
              />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
