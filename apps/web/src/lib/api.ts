import axios from "axios";
import { env } from "./env";
import type { Task, TaskStatus } from "./task";

export const apiClient = axios.create({
  baseURL: env.VITE_SERVER_URL,
  headers: { "Content-Type": "application/json" },
});

export async function getTasks(): Promise<{ tasks: Task[] }> {
  const { data } = await apiClient.get<{ tasks: Task[] }>("/tasks");
  return data;
}

export async function createTask(
  title: string,
  userName: string
): Promise<Task> {
  const { data } = await apiClient.post<Task>("/tasks", { title, userName });
  return data;
}

export async function advanceTaskStatus(
  id: string,
  toStatus: TaskStatus,
  userName: string
): Promise<void> {
  await apiClient.put(`/tasks/${id}/status`, { toStatus, userName });
}

export async function deleteTask(id: string, userName: string): Promise<void> {
  await apiClient.delete(`/tasks/${id}`, { data: { userName } });
}
