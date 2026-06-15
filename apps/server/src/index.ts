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
  getTaskResponse,
  updateTaskStatusParam,
  updateTaskStatusRequest,
} from "./dto";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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

  const parsedTasks = getTaskResponse.safeParse(tasks);
  if (!parsedTasks.success) {
    res.status(500).json({
      error: "Failed to parse tasks",
    });
    return;
  }

  res.status(200).json({
    tasks: parsedTasks.data,
  });
});

app.get("/tasks/:id", async (req, res) => {
  const param = getTaskParam.safeParse(req.params);
  if (!param.success) {
    res.status(404).json({
      error: {
        message: "Task not found",
      },
    });
    return;
  }
  const task = await getTaskById(param.data.id);

  if (!task) {
    res.status(404).json({
      error: "Task not found",
    });
    return;
  }

  const parsedTask = getTaskResponse.safeParse(task);
  if (!parsedTask.success) {
    res.status(500).json({
      error: "Failed to parse task",
    });
    return;
  }

  res.status(200).json({
    task: parsedTask.data,
  });
});

app.post("/tasks", async (req, res) => {
  const body = createTaskRequest.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({
      error: "Invalid task data",
    });
    return;
  }

  const task = await createTask(body.data.title, body.data.userName);

  const parsedTask = createTaskResponse.safeParse(task);
  if (!parsedTask.success) {
    res.status(500).json({
      error: "Failed to parse task",
    });
    return;
  }

  res.status(201).json(parsedTask.data);
});

app.delete("/tasks/:id", async (req, res) => {
  const param = deleteTaskParam.safeParse(req.params);
  if (!param.success) {
    res.status(404).json({
      error: "Task not found",
    });
    return;
  }

  const task = deleteTaskRequest.safeParse(req.body);
  if (!task.success) {
    res.status(400).json({
      error: "Invalid request data",
    });
    return;
  }

  await softDeleteTask(param.data.id, task.data.userName);

  res.status(204).send();
});

app.put("/tasks/:id/status", async (req, res) => {
  const param = updateTaskStatusParam.safeParse(req.params);
  if (!param.success) {
    res.status(404).json({
      error: "Task not found",
    });
    return;
  }

  const body = updateTaskStatusRequest.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({
      error: "Invalid request data",
    });
    return;
  }

  await changeTaskStatus(
    param.data.id,
    body.data.expectedStatus,
    body.data.userName
  );

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
    res.status(500).json({
      error: "Internal server error",
    });
  }
);

app.use((_req, res) => {
  res.status(404);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
