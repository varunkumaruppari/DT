import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { plannerRequestSchema, plannerDateSchema } from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  getPlannerToday,
  getPlannerByDate,
  createPlanner,
  deletePlanner,
} from '../../services/planners.service.js';

const plannersRouter = Router();

// ============================================================
// GET /api/v1/planners/today — Retrieve today's planner
// ============================================================
plannersRouter.get('/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const planner = await getPlannerToday(userId);
    sendSuccess(res, { planner }, 'Today\'s planner retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/v1/planners/:date — Retrieve planner for date YYYY-MM-DD
// ============================================================
plannersRouter.get('/:date', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const date = plannerDateSchema.parse(req.params.date);
    const planner = await getPlannerByDate(userId, date);
    sendSuccess(res, { planner }, 'Planner retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/planners — Create daily planner
// ============================================================
plannersRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = plannerRequestSchema.parse(req.body);
    const planner = await createPlanner(userId, validatedBody.plannerDate);
    sendSuccess(res, { planner }, 'Planner created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/v1/planners/:id — Soft delete planner
// ============================================================
plannersRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid planner ID format').parse(req.params.id);
    await deletePlanner(userId, id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export { plannersRouter };
