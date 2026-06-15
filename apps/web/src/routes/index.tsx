import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreateTaskForm } from "@/components/create-task-form";
import { TaskCard } from "@/components/task-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { tasksQueryOptions } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(tasksQueryOptions),
  component: TaskListPage,
});

const ACTORS = ["Alice", "Bob", "Carol", "Dave"] as const;
type Actor = (typeof ACTORS)[number];

function TaskListPage() {
  const { data } = useSuspenseQuery(tasksQueryOptions);
  const [actor, setActor] = useState<Actor>("Alice");

  return (
    <main className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="font-bold text-2xl tracking-tight">TaskTrail</h1>
        <Select onValueChange={(v) => setActor(v as Actor)} value={actor}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Select actor" />
          </SelectTrigger>
          <SelectContent>
            {ACTORS.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <CreateTaskForm actor={actor} />

      <Separator />

      {data.tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No tasks yet. Create one above.
        </p>
      ) : null}

      <ul className="space-y-3">
        {data.tasks.map((task) => (
          <li key={task.id}>
            <TaskCard actor={actor} task={task} />
          </li>
        ))}
      </ul>
    </main>
  );
}
