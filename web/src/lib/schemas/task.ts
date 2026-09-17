import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["todo", "in_progress", "done"]),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
