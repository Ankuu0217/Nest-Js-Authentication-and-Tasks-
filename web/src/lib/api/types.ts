export type Role = "user" | "admin";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  userId: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
  status?: TaskStatus;
}

export type UpdateTaskInput = Partial<CreateTaskInput>;

/** Shape of every Nest HttpException response body. */
export interface NestErrorBody {
  statusCode: number;
  message: string | string[];
  error: string;
}
