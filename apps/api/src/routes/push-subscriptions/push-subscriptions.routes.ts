import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { pushSubscriptionCreateSchema } from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import {
  getVapidConfig,
  getPushSubscriptions,
  registerPushSubscription,
  deletePushSubscription,
} from '../../services/push-subscriptions.service.js';

const pushSubscriptionsRouter = Router();

// Public config route to fetch VAPID public key
pushSubscriptionsRouter.get('/config', (_req: Request, res: Response, next: NextFunction) => {
  try {
    const config = getVapidConfig();
    sendSuccess(res, config, 'VAPID config retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// Require authentication for remaining subscription routes
pushSubscriptionsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const subscriptions = await getPushSubscriptions(userId);
    sendSuccess(res, { subscriptions }, 'Push subscriptions retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

pushSubscriptionsRouter.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const validatedBody = pushSubscriptionCreateSchema.parse(req.body);
    const userAgent = req.headers['user-agent'];
    const subscription = await registerPushSubscription(userId, validatedBody, userAgent);
    sendSuccess(res, { subscription }, 'Push subscription registered successfully', 201);
  } catch (err) {
    next(err);
  }
});

pushSubscriptionsRouter.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid push subscription ID format').parse(req.params.id);
    const subscription = await deletePushSubscription(userId, id);
    sendSuccess(res, { subscription }, 'Push subscription deactivated successfully', 200);
  } catch (err) {
    next(err);
  }
});

export { pushSubscriptionsRouter };
