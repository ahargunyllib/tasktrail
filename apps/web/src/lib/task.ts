export type TaskStatus = "to_do" | "pending" | "in_progress" | "done";

export interface AuditLog {
  action: "created" | "change_status" | "deleted";
  createdAt: string;
  details?: { from_status: TaskStatus; to_status: TaskStatus } | null;
  id: string;
  taskId: string;
  userName: string;
}

export interface Task {
  auditLogs: AuditLog[];
  createdAt: string;
  id: string;
  status: TaskStatus;
  title: string;
  updatedAt: string;
}

export const STATUS_ORDER: TaskStatus[] = [
  "to_do",
  "pending",
  "in_progress",
  "done",
];

export function nextStatus(current: TaskStatus): TaskStatus | null {
  const idx = STATUS_ORDER.indexOf(current);
  return idx < STATUS_ORDER.length - 1 ? (STATUS_ORDER[idx + 1] ?? null) : null;
}
