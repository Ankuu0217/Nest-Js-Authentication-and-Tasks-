"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createTask, updateTask, deleteTask } from "@/lib/api/tasks-client";
import { toast } from "@/components/ui/Toast";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/lib/api/types";

export const TASKS_KEY = ["tasks"];

/** Every task mutation follows the same optimistic shape: onMutate snapshots
 * and applies the change, onError rolls back and toasts, onSettled
 * reconciles with the server. */

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
      const now = new Date().toISOString();
      const optimisticTask: Task = {
        id: `optimistic-${Math.random().toString(36).slice(2)}`,
        title: input.title,
        description: input.description,
        status: input.status ?? "todo",
        userId: "",
        createdAt: now,
        updatedAt: now,
      };
      queryClient.setQueryData<Task[]>(TASKS_KEY, (prev) => [...(prev ?? []), optimisticTask]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      queryClient.setQueryData(TASKS_KEY, context?.previous);
      toast.error("Couldn't create the task. Try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (prev) =>
        (prev ?? []).map((t) =>
          t.id === id ? { ...t, ...input, updatedAt: new Date().toISOString() } : t,
        ),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(TASKS_KEY, context?.previous);
      toast.error("Couldn't update the task. Try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<Task[]>(TASKS_KEY);
      queryClient.setQueryData<Task[]>(TASKS_KEY, (prev) => (prev ?? []).filter((t) => t.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(TASKS_KEY, context?.previous);
      toast.error("Couldn't delete the task. Try again.");
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}
