import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  taskCreateSchema,
  taskUpdateSchema,
  taskReorderSchema,
  taskCompleteSchema,
} from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  createTask,
  getTask,
  updateTask,
  deleteTask,
  completeTask,
  skipTask,
  reorderTasks,
} from '../../services/tasks.service.js';

const tasksRouter = Router();

// ============================================================
// POST /api/v1/tasks — Create a daily task
// ============================================================
tasksRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = taskCreateSchema.parse(req.body);
    const task = await createTask(userId, validatedBody);
    sendSuccess(res, { task }, 'Task created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/v1/tasks/reorder — Reorder task list inside a planner
// ============================================================
tasksRouter.patch('/reorder', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = taskReorderSchema.parse(req.body);
    const tasks = await reorderTasks(userId, validatedBody);
    sendSuccess(res, { tasks }, 'Tasks reordered successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/v1/tasks/:id — Get a single task
// ============================================================
tasksRouter.get('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid task ID format').parse(req.params.id);
    const task = await getTask(userId, id);
    sendSuccess(res, { task }, 'Task retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/v1/tasks/:id — Update a task
// ============================================================
tasksRouter.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid task ID format').parse(req.params.id);
    const validatedBody = taskUpdateSchema.parse(req.body);
    const task = await updateTask(userId, id, validatedBody);
    sendSuccess(res, { task }, 'Task updated successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/v1/tasks/:id — Soft delete a task
// ============================================================
tasksRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid task ID format').parse(req.params.id);
    await deleteTask(userId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/tasks/:id/complete — Complete a task
// ============================================================
tasksRouter.post('/:id/complete', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid task ID format').parse(req.params.id);
    taskCompleteSchema.parse(req.body);
    const result = await completeTask(userId, id);
    sendSuccess(res, result, 'Task completed successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/tasks/:id/skip — Skip a task
// ============================================================
tasksRouter.post('/:id/skip', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid task ID format').parse(req.params.id);
    // Body is empty or optional
    const task = await skipTask(userId, id);
    sendSuccess(res, { task }, 'Task skipped successfully', 200);
  } catch (err) {
    next(err);
  }
});

export { tasksRouter };
