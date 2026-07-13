import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  analyticsDailyQuerySchema,
  analyticsWeeklyQuerySchema,
  analyticsMonthlyQuerySchema,
  analyticsYearlyQuerySchema,
} from '@ddt/shared';
import {
  getDailyAnalytics,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getYearlyAnalytics,
} from '../../services/analytics.service.js';

const analyticsRouter = Router();

analyticsRouter.get('/daily', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const { date } = analyticsDailyQuerySchema.parse(req.query);
    const result = await getDailyAnalytics(userId, date);
    sendSuccess(res, result, 'Daily analytics retrieved successfully');
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/weekly', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const { date } = analyticsWeeklyQuerySchema.parse(req.query);
    const result = await getWeeklyAnalytics(userId, date);
    sendSuccess(res, result, 'Weekly analytics retrieved successfully');
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/monthly', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const { year, month } = analyticsMonthlyQuerySchema.parse(req.query);
    const result = await getMonthlyAnalytics(userId, year, month);
    sendSuccess(res, result, 'Monthly analytics retrieved successfully');
  } catch (err) {
    next(err);
  }
});

analyticsRouter.get('/yearly', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const { year } = analyticsYearlyQuerySchema.parse(req.query);
    const result = await getYearlyAnalytics(userId, year);
    sendSuccess(res, result, 'Yearly analytics retrieved successfully');
  } catch (err) {
    next(err);
  }
});

export { analyticsRouter };
