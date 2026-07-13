import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import { activityQuerySchema } from '@ddt/shared';
import { getActivityHistory } from '../../services/activity.service.js';

const activityRouter = Router();

activityRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const { cursor, limit, type } = activityQuerySchema.parse(req.query);
    const result = await getActivityHistory(userId, cursor, limit, type);
    sendSuccess(res, result, 'Activity history retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export { activityRouter };
