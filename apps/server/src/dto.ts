import z from "zod";

export const taskStatus = z.enum(["to_do", "pending", "in_progress", "done"]);
export type TaskStatus = z.infer<typeof taskStatus>;

export const taskResponse = z.object({
  id: z.string(),
  title: z.string(),
  status: taskStatus,
  created_at: z.string(),
  updated_at: z.string(),
});
export type TaskResponse = z.infer<typeof taskResponse>;

export const auditLogResponse = z
  .object({
    id: z.string(),
    user_name: z.string(),
    task_id: z.string(),
    created_at: z.string(),
  })
  .and(
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("created"),
      }),
      z.object({
        action: z.literal("change_status"),
        details: z.object({
          from_status: taskStatus,
          to_status: taskStatus,
        }),
      }),
      z.object({
        action: z.literal("deleted"),
      }),
    ])
  );
export type AuditLogResponse = z.infer<typeof auditLogResponse>;

export const getTasksResponse = z.object({
  tasks: z.array(taskResponse),
});
export type GetTasksResponse = z.infer<typeof getTasksResponse>;

export const getTaskParam = z.object({
  id: z.string(),
});
export type GetTaskParam = z.infer<typeof getTaskParam>;

export const getTaskResponse = z.object({
  task: taskResponse,
});
export type GetTaskResponse = z.infer<typeof getTaskResponse>;

export const createTaskRequest = z.object({
  title: z.string(),
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
  expectedStatus: taskStatus,
});
export type UpdateTaskStatusRequest = z.infer<typeof updateTaskStatusRequest>;

export const updateTaskStatusResponse = taskResponse;
export type UpdateTaskStatusResponse = z.infer<typeof updateTaskStatusResponse>;

export const deleteTaskParam = z.object({
  id: z.string(),
});
export type DeleteTaskParam = z.infer<typeof deleteTaskParam>;

export const deleteTaskRequest = z.object({
  userName: z.string(),
});
