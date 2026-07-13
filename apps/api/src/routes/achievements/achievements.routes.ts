import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import { getAchievements } from '../../services/achievements.service.js';

const achievementsRouter = Router();

achievementsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const achievements = await getAchievements(userId);
    sendSuccess(res, { achievements }, 'Achievements retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export { achievementsRouter };
