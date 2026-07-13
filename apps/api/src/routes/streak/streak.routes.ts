import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import { getStreak } from '../../services/streak.service.js';

const streakRouter = Router();

streakRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const result = await getStreak(userId);
    sendSuccess(res, result, 'Streak details retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export { streakRouter };
