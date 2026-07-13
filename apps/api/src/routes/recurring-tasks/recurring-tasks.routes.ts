import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { recurringTaskCreateSchema, recurringTaskUpdateSchema } from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  createRecurringTask,
  getRecurringTasks,
  getRecurringTask,
  updateRecurringTask,
  deleteRecurringTask,
} from '../../services/recurring-tasks.service.js';

const recurringTasksRouter = Router();

// Require authentication for all recurring task routes
recurringTasksRouter.use(requireAuth);

// ============================================================
// GET /api/v1/recurring-tasks — List recurring tasks
// ============================================================
recurringTasksRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const tasks = await getRecurringTasks(userId);
    sendSuccess(res, { tasks }, 'Recurring tasks retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/recurring-tasks — Create a recurring task
// ============================================================
recurringTasksRouter.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = recurringTaskCreateSchema.parse(req.body);
    const task = await createRecurringTask(userId, validatedBody);
    sendSuccess(res, { task }, 'Recurring task created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/v1/recurring-tasks/:id — Get specific recurring task
// ============================================================
recurringTasksRouter.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid recurring task ID format').parse(req.params.id);
    const task = await getRecurringTask(userId, id);
    sendSuccess(res, { task }, 'Recurring task retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/v1/recurring-tasks/:id — Update recurring task
// ============================================================
recurringTasksRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid recurring task ID format').parse(req.params.id);
    const validatedBody = recurringTaskUpdateSchema.parse(req.body);
    const task = await updateRecurringTask(userId, id, validatedBody);
    sendSuccess(res, { task }, 'Recurring task updated successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/v1/recurring-tasks/:id — Delete recurring task
// ============================================================
recurringTasksRouter.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid recurring task ID format').parse(req.params.id);
    const task = await deleteRecurringTask(userId, id);
    sendSuccess(res, { task }, 'Recurring task deleted successfully', 200);
  } catch (err) {
    next(err);
  }
});

export { recurringTasksRouter };
