"use client";

import { useEffect } from "react";
import type { KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SlideOver } from "@/components/ui/SlideOver";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";
import { FieldError } from "@/components/ui/FieldError";
import { taskFormSchema, type TaskFormValues } from "@/lib/schemas/task";
import { useCreateTask, useUpdateTask } from "@/hooks/useTaskMutations";
import type { Task } from "@/lib/api/types";

interface TaskFormSlideOverProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
}

const EMPTY_VALUES: TaskFormValues = { title: "", description: "", status: "todo" };

export function TaskFormSlideOver({ open, onClose, task }: TaskFormSlideOverProps) {
  const isEdit = !!task;
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const mutation = isEdit ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      task
        ? { title: task.title, description: task.description, status: task.status }
        : EMPTY_VALUES,
    );
  }, [open, task, reset]);

  function onSubmit(values: TaskFormValues) {
    if (isEdit && task) {
      const changed: Partial<TaskFormValues> = {};
      if (dirtyFields.title) changed.title = values.title;
      if (dirtyFields.description) changed.description = values.description;
      if (dirtyFields.status) changed.status = values.status;
      if (Object.keys(changed).length === 0) {
        onClose();
        return;
      }
      updateMutation.mutate({ id: task.id, input: changed }, { onSuccess: onClose });
    } else {
      createMutation.mutate(values, { onSuccess: onClose });
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      void handleSubmit(onSubmit)();
    }
  }

  return (
    <SlideOver open={open} onClose={onClose} title={isEdit ? "Edit task" : "New task"}>
      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={handleKeyDown}
        noValidate
      >
        <div>
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "task-title-error" : undefined}
            {...register("title")}
          />
          <FieldError id="task-title-error">{errors.title?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="task-description">Description</Label>
          <Textarea
            id="task-description"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "task-description-error" : undefined}
            {...register("description")}
          />
          <FieldError id="task-description-error">{errors.description?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="task-status">Status</Label>
          <Select id="task-status" {...register("status")}>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </Select>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={mutation.isPending}>
            {isEdit ? "Save changes" : "Create task"}
          </Button>
          <span className="text-caption text-charcoal-stone">⌘/Ctrl + Enter</span>
        </div>
      </form>
    </SlideOver>
  );
}
