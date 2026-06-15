import { Badge } from "@/components/ui/badge";
import type { TaskStatus } from "@/lib/task";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<TaskStatus, string> = {
  to_do: "To Do",
  pending: "Pending",
  in_progress: "In Progress",
  done: "Done",
};

const STATUS_CLASSES: Record<TaskStatus, string> = {
  to_do: "bg-muted text-muted-foreground border-transparent",
  pending:
    "bg-amber-100 text-amber-800 border-transparent dark:bg-amber-900/30 dark:text-amber-400",
  in_progress:
    "bg-blue-100 text-blue-800 border-transparent dark:bg-blue-900/30 dark:text-blue-400",
  done: "bg-green-100 text-green-800 border-transparent dark:bg-green-900/30 dark:text-green-400",
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <Badge className={cn(STATUS_CLASSES[status])}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
