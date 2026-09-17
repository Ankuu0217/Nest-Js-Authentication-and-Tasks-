import { bffFetch } from "./browser-client";
import type { Task, CreateTaskInput, UpdateTaskInput } from "./types";

export function listTasks() {
  return bffFetch<Task[]>("tasks");
}

export function createTask(input: CreateTaskInput) {
  return bffFetch<Task>("tasks", { method: "POST", body: JSON.stringify(input) });
}

export function updateTask(id: string, input: UpdateTaskInput) {
  return bffFetch<Task>(`tasks/${id}`, { method: "PATCH", body: JSON.stringify(input) });
}

export function deleteTask(id: string) {
  return bffFetch<{ message: string }>(`tasks/${id}`, { method: "DELETE" });
}
