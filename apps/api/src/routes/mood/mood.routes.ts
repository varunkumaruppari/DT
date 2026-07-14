import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { moodUpsertSchema, moodHistoryQuerySchema } from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  getMoodToday,
  getMoodHistory,
  upsertMoodToday,
} from '../../services/mood.service.js';

const moodRouter = Router();

// ============================================================
// GET /api/v1/mood/today — Get today's mood
// ============================================================
moodRouter.get('/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const mood = await getMoodToday(userId);
    sendSuccess(res, { mood }, 'Today\'s mood retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/v1/mood — Get mood history
// ============================================================
moodRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedQuery = moodHistoryQuerySchema.parse(req.query);
    const moods = await getMoodHistory(userId, validatedQuery);
    sendSuccess(res, { moods }, 'Mood history retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/v1/mood/today — Upsert today's mood (today only)
// ============================================================
moodRouter.put('/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = moodUpsertSchema.parse(req.body);
    const mood = await upsertMoodToday(userId, validatedBody);
    sendSuccess(res, { mood }, 'Mood logged successfully', 200);
  } catch (err) {
    next(err);
  }
});

export { moodRouter };
