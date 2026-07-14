import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import { getDashboardData } from '../../services/dashboard.service.js';
import { dashboardQuerySchema } from '@ddt/shared';

const dashboardRouter = Router();

// ============================================================
// GET /api/v1/dashboard/today — Retrieve daily dashboard aggregates
// ============================================================
dashboardRouter.get('/today', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    // Validate optional date parameter using shared schema
    const validatedQuery = dashboardQuerySchema.parse(req.query);

    const result = await getDashboardData(userId, validatedQuery.date);

    sendSuccess(
      res,
      result,
      'Dashboard data retrieved successfully',
      200
    );
  } catch (err) {
    next(err);
  }
});

export { dashboardRouter };
