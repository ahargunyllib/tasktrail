import z from "zod";

export const taskStatus = z.enum(["to_do", "pending", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof taskStatus>;

export const taskResponse = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TaskResponse = z.infer<typeof taskResponse>;

export const auditLogResponse = z.object({
  id: z.string(),
  userName: z.string(),
  taskId: z.string(),
  createdAt: z.string(),
  action: z.enum(["created", "change_status", "deleted"]),
  details: z
    .object({
      from_status: taskStatus,
      to_status: taskStatus,
    })
    .nullable()
    .optional(),
});
export type AuditLogResponse = z.infer<typeof auditLogResponse>;

export const taskWithAuditLogsResponse = taskResponse.extend({
  auditLogs: z.array(auditLogResponse),
});
export type TaskWithAuditLogsResponse = z.infer<
  typeof taskWithAuditLogsResponse
>;

export const getTasksWithAuditLogsResponse = z.object({
  tasks: z.array(taskWithAuditLogsResponse),
});
export type GetTasksWithAuditLogsResponse = z.infer<
  typeof getTasksWithAuditLogsResponse
>;

export const getTaskParam = z.object({
  id: z.string(),
});
export type GetTaskParam = z.infer<typeof getTaskParam>;

export const createTaskRequest = z.object({
  title: z.string().min(1).max(100),
  userName: z.string(),
});
export type CreateTaskRequest = z.infer<typeof createTaskRequest>;

export const createTaskResponse = taskResponse;
export type CreateTaskResponse = z.infer<typeof createTaskResponse>;

export const updateTaskStatusParam = z.object({
  id: z.string(),
});
export type UpdateTaskStatusParam = z.infer<typeof updateTaskStatusParam>;

export const updateTaskStatusRequest = z.object({
  userName: z.string(),
  toStatus: taskStatus,
});
export type UpdateTaskStatusRequest = z.infer<typeof updateTaskStatusRequest>;

export const deleteTaskParam = z.object({
  id: z.string(),
});
export type DeleteTaskParam = z.infer<typeof deleteTaskParam>;

export const deleteTaskRequest = z.object({
  userName: z.string(),
});

export const STATUS_ORDER = [
  "to_do",
  "pending",
  "in_progress",
  "done",
] as const satisfies readonly TaskStatus[];
