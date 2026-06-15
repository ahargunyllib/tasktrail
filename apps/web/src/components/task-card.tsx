import { ChevronDownIcon, ChevronRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  advanceStatusMutationOptions,
  deleteTaskMutationOptions,
} from "@/lib/queries";
import { nextStatus, type Task } from "@/lib/task";
import { AuditLogList } from "./audit-log-list";
import { StatusBadge } from "./status-badge";

interface AdvanceButtonProps {
  actor: string;
  task: Task;
}

function AdvanceButton({ task, actor }: AdvanceButtonProps) {
  const next = nextStatus(task.status);
  const { mutate, isPending } = useMutation(
    advanceStatusMutationOptions(actor)
  );

  return (
    <Button
      disabled={!next || isPending}
      onClick={() => {
        if (next) {
          mutate({ id: task.id, toStatus: next });
        }
      }}
      size="sm"
    >
      Advance
    </Button>
  );
}

interface DeleteButtonProps {
  actor: string;
  taskId: string;
}

function DeleteButton({ taskId, actor }: DeleteButtonProps) {
  const { mutate, isPending } = useMutation(deleteTaskMutationOptions(actor));

  return (
    <Button
      disabled={isPending}
      onClick={() => mutate(taskId)}
      size="sm"
      variant="destructive"
    >
      Delete
    </Button>
  );
}

interface TaskCardProps {
  actor: string;
  task: Task;
}

export function TaskCard({ task, actor }: TaskCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="font-medium text-base">{task.title}</CardTitle>
        <StatusBadge status={task.status} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <AdvanceButton actor={actor} task={task} />
          <DeleteButton actor={actor} taskId={task.id} />
        </div>

        <Collapsible onOpenChange={setOpen} open={open}>
          <CollapsibleTrigger className="flex cursor-pointer items-center gap-1 text-muted-foreground text-xs hover:text-foreground">
            <HugeiconsIcon
              className="size-3.5 shrink-0"
              icon={open ? ChevronDownIcon : ChevronRightIcon}
              strokeWidth={1.5}
            />
            <span>Activity ({task.auditLogs.length})</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Separator className="my-3" />
            <p className="mb-2 font-medium text-foreground text-xs">Activity</p>
            <AuditLogList logs={task.auditLogs} />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
