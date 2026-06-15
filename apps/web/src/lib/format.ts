import type { AuditLog, TaskStatus } from "./task";

const STATUS_LABELS: Record<TaskStatus, string> = {
  to_do: "To Do",
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) {
    return "just now";
  }
  const m = Math.floor(s / 60);
  if (m < 60) {
    return `${m}m ago`;
  }
  const h = Math.floor(m / 60);
  if (h < 24) {
    return `${h}h ago`;
  }
  const d = Math.floor(h / 24);
  return d < 7 ? `${d}d ago` : `${Math.floor(d / 7)}w ago`;
}

export function formatFull(dateStr: string): string {
  return new Date(dateStr).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function logText(log: AuditLog): string {
  if (log.action === "created") {
    return `${log.userName} created the task`;
  }
  if (log.action === "deleted") {
    return `${log.userName} deleted the task`;
  }
  if (log.action === "change_status" && log.details) {
    const from = STATUS_LABELS[log.details.from_status];
    const to = STATUS_LABELS[log.details.to_status];
    return `${log.userName} moved from ${from} to ${to}`;
  }
  return log.action;
}
