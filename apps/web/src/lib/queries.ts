import { mutationOptions, queryOptions } from "@tanstack/react-query";
import { advanceTaskStatus, createTask, deleteTask, getTasks } from "./api";
import { queryClient } from "./query-client";
import type { TaskStatus } from "./task";

export const tasksQueryOptions = queryOptions({
  queryKey: ["tasks"],
  queryFn: getTasks,
});

export const advanceStatusMutationOptions = (actor: string) =>
  mutationOptions({
    mutationFn: ({ id, toStatus }: { id: string; toStatus: TaskStatus }) =>
      advanceTaskStatus(id, toStatus, actor),
    onSuccess: () => {
      queryClient.invalidateQueries(tasksQueryOptions);
    },
  });

export const deleteTaskMutationOptions = (actor: string) =>
  mutationOptions({
    mutationFn: (id: string) => deleteTask(id, actor),
    onSuccess: () => {
      queryClient.invalidateQueries(tasksQueryOptions);
    },
  });

export const createTaskMutationOptions = (actor: string) =>
  mutationOptions({
    mutationFn: (title: string) => createTask(title, actor),
    onSuccess: () => {
      queryClient.invalidateQueries(tasksQueryOptions);
    },
  });
