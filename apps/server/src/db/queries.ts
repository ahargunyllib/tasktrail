import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from ".";
import {
  auditLogTable,
  type InsertTask,
  type SelectAuditLog,
  taskTable,
} from "./schemas";

export const getTasks = async () => {
  const tasks = await db
    .select()
    .from(taskTable)
    .where(isNull(taskTable.deletedAt))
    .all();
  const tasksIds = tasks.map((task) => task.id);

  const auditLogs =
    tasksIds.length > 0
      ? await db
          .select()
          .from(auditLogTable)
          .where(inArray(auditLogTable.taskId, tasksIds))
          .orderBy(desc(auditLogTable.createdAt))
          .all()
      : [];

  const auditLogsMap: Record<string, SelectAuditLog[]> = {};
  for (const log of auditLogs) {
    if (!auditLogsMap[log.taskId]) {
      auditLogsMap[log.taskId] = [];
    }
    auditLogsMap[log.taskId]?.push(log);
  }

  return tasks.map((task) => ({
    ...task,
    auditLogs: auditLogsMap[task.id] ?? [],
  }));
};

export const getTaskById = async (id: string) => {
  const task = await db
    .select()
    .from(taskTable)
    .where(and(eq(taskTable.id, id), isNull(taskTable.deletedAt)))
    .get();
  if (!task) {
    return null;
  }

  const auditLogs = await db
    .select()
    .from(auditLogTable)
    .where(eq(auditLogTable.taskId, id))
    .orderBy(desc(auditLogTable.createdAt))
    .all();

  return { ...task, auditLogs };
};

export const createTask = async (title: string, userName: string) => {
  const now = new Date().toISOString();
  const task: InsertTask = {
    id: crypto.randomUUID(),
    title,
    status: "to_do",
    createdAt: now,
    updatedAt: now,
  };

  await db.transaction(async (tx) => {
    await tx.insert(taskTable).values(task);
    await tx.insert(auditLogTable).values({
      id: crypto.randomUUID(),
      userName,
      taskId: task.id,
      action: "created",
    });
  });

  return task;
};

export const changeTaskStatus = async (
  id: string,
  newStatus: InsertTask["status"],
  userName: string
) => {
  await db.transaction(async (tx) => {
    const current = await tx
      .select({ status: taskTable.status })
      .from(taskTable)
      .where(and(eq(taskTable.id, id), isNull(taskTable.deletedAt)))
      .get();

    if (!current) {
      throw new Error("Task not found");
    }

    const [updated] = await tx
      .update(taskTable)
      .set({ status: newStatus })
      .where(and(eq(taskTable.id, id), isNull(taskTable.deletedAt)))
      .returning();

    if (!updated) {
      throw new Error("Task not found");
    }

    await tx.insert(auditLogTable).values({
      id: crypto.randomUUID(),
      userName,
      taskId: id,
      action: "change_status",
      details: { from_status: current.status, to_status: newStatus },
    });
  });
};

export const softDeleteTask = async (id: string, userName: string) => {
  await db.transaction(async (tx) => {
    const [task] = await tx
      .update(taskTable)
      .set({ deletedAt: new Date().toISOString() })
      .where(and(eq(taskTable.id, id), isNull(taskTable.deletedAt)))
      .returning();

    if (!task) {
      throw new Error("Task not found");
    }

    await tx.insert(auditLogTable).values({
      id: crypto.randomUUID(),
      userName,
      taskId: id,
      action: "deleted",
    });
  });
};
