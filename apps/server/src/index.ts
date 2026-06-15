import cors from "cors";
import express from "express";
import {
  changeTaskStatus,
  createTask,
  getTaskById,
  getTasks,
  softDeleteTask,
} from "./db/queries";
import {
  createTaskRequest,
  createTaskResponse,
  deleteTaskParam,
  deleteTaskRequest,
  getTaskParam,
  getTasksWithAuditLogsResponse,
  STATUS_ORDER,
  updateTaskStatusParam,
  updateTaskStatusRequest,
} from "./dto";
import { env } from "./env";

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
  })
);

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/tasks", async (_req, res) => {
  const tasks = await getTasks();

  const parsed = getTasksWithAuditLogsResponse.safeParse({ tasks });
  if (!parsed.success) {
    res.status(500).json({ error: "Failed to parse tasks" });
    return;
  }

  res.status(200).json(parsed.data);
});

app.get("/tasks/:id", async (req, res) => {
  const param = getTaskParam.safeParse(req.params);
  if (!param.success) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const task = await getTaskById(param.data.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.status(200).json({ task });
});

app.post("/tasks", async (req, res) => {
  const body = createTaskRequest.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid task data" });
    return;
  }

  const task = await createTask(body.data.title, body.data.userName);

  const parsed = createTaskResponse.safeParse(task);
  if (!parsed.success) {
    res.status(500).json({ error: "Failed to parse task" });
    return;
  }

  res.status(201).json(parsed.data);
});

app.delete("/tasks/:id", async (req, res) => {
  const param = deleteTaskParam.safeParse(req.params);
  if (!param.success) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const body = deleteTaskRequest.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request data" });
    return;
  }

  await softDeleteTask(param.data.id, body.data.userName);

  res.status(204).send();
});

app.put("/tasks/:id/status", async (req, res) => {
  const param = updateTaskStatusParam.safeParse(req.params);
  if (!param.success) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const body = updateTaskStatusRequest.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Invalid request data" });
    return;
  }

  const task = await getTaskById(param.data.id);
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const currentIdx = STATUS_ORDER.indexOf(task.status);
  const nextIdx = STATUS_ORDER.indexOf(body.data.toStatus);

  if (currentIdx === nextIdx) {
    res.status(200).json(task);
    return;
  }

  if (nextIdx !== currentIdx + 1) {
    res.status(400).json({
      error: `Invalid status transition: ${task.status} → ${body.data.toStatus}. Must advance one step at a time.`,
    });
    return;
  }

  await changeTaskStatus(param.data.id, body.data.toStatus, body.data.userName);

  res.status(200).send();
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
);

app.use((_req, res) => {
  res.status(404);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
