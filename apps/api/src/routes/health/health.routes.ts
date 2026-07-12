import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { connectDatabase } from '../../lib/prisma.js';
import { sendSuccess, sendError } from '../../lib/response.js';

const healthRouter = Router();

// GET /api/v1/health — Application health check
// Returns standard success contract per API Specification §5
healthRouter.get('/', (_req: Request, res: Response) => {
  sendSuccess(
    res,
    {
      status: 'ok',
      service: 'daily-development-tracker-api',
    },
    'Service is healthy'
  );
});

// GET /api/v1/health/ready — Database readiness verification
// Uses safe SELECT 1 query — no business models required
healthRouter.get(
  '/ready',
  async (_req: Request, res: Response, _next: NextFunction) => {
    try {
      await connectDatabase();
      sendSuccess(
        res,
        {
          status: 'ready',
          service: 'daily-development-tracker-api',
          database: 'connected',
        },
        'Service is ready'
      );
    } catch (err) {
      console.error('[Health/Ready] Database connectivity check failed:', err);
      sendError(
        res,
        'Database is unavailable',
        'SERVICE_UNAVAILABLE',
        503
      );
    }
  }
);

export { healthRouter };

