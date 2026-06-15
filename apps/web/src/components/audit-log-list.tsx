import {
  ArrowRight01Icon,
  Delete01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatFull, logText, timeAgo } from "@/lib/format";
import type { AuditLog } from "@/lib/task";

const ACTION_ICON = {
  created: UserCircleIcon,
  deleted: Delete01Icon,
  change_status: ArrowRight01Icon,
} satisfies Record<AuditLog["action"], unknown>;

function LogIcon({ action }: { action: AuditLog["action"] }) {
  return (
    <HugeiconsIcon
      className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
      icon={ACTION_ICON[action]}
      strokeWidth={1.5}
    />
  );
}

export function AuditLogList({ logs }: { logs: AuditLog[] }) {
  if (logs.length === 0) {
    return <p className="text-muted-foreground text-xs">No activity yet.</p>;
  }

  const ordered = [...logs].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <TooltipProvider>
      <div className="space-y-2.5">
        {ordered.map((log) => (
          <div className="flex items-start gap-2" key={log.id}>
            <LogIcon action={log.action} />
            <p className="text-muted-foreground text-xs leading-tight">
              {logText(log)}
              <span className="mx-1">·</span>
              <Tooltip>
                <TooltipTrigger className="cursor-default underline decoration-dotted underline-offset-2">
                  {timeAgo(log.createdAt)}
                </TooltipTrigger>
                <TooltipContent>
                  <p>{formatFull(log.createdAt)}</p>
                </TooltipContent>
              </Tooltip>
            </p>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}
