import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import { xpHistoryQuerySchema } from '@ddt/shared';
import { getXpSummary, getXpHistory } from '../../services/xp.service.js';

const xpRouter = Router();

xpRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const summary = await getXpSummary(userId);
    sendSuccess(res, summary, 'XP summary retrieved successfully');
  } catch (err) {
    next(err);
  }
});

xpRouter.get('/history', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const { cursor, limit } = xpHistoryQuerySchema.parse(req.query);
    const result = await getXpHistory(userId, cursor, limit);
    sendSuccess(res, result, 'XP history retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export { xpRouter };
