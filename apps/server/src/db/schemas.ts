import { sql } from "drizzle-orm";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const taskTable = sqliteTable("tasks", (t) => ({
  id: t.text().primaryKey(),
  title: t.text().notNull(),
  status: t
    .text({ enum: ["to_do", "pending", "in_progress", "done"] })
    .notNull(),
  createdAt: t
    .text()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
    .notNull(),
  updatedAt: t
    .text()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
    .$onUpdate(() => new Date().toISOString())
    .notNull(),
  deletedAt: t.text(),
}));

export type InsertTask = typeof taskTable.$inferInsert;
export type SelectTask = typeof taskTable.$inferSelect;

export const auditLogTable = sqliteTable("audit_logs", (t) => ({
  id: t.text().primaryKey(),
  userName: t.text().notNull(),
  taskId: t.text().notNull(),
  action: t.text({ enum: ["created", "change_status", "deleted"] }).notNull(),
  details: t.text({ mode: "json" }),
  createdAt: t
    .text()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))`)
    .notNull(),
}));

export type InsertAuditLog = typeof auditLogTable.$inferInsert;
export type SelectAuditLog = typeof auditLogTable.$inferSelect;
