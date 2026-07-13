import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  notificationCompleteActionSchema,
  notificationSnoozeActionSchema,
} from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import { AppError } from '../../middleware/errorHandler.js';
import {
  getNotifications,
  completeTaskFromNotification,
  snoozeReminderFromNotification,
  dismissNotificationFromNotification,
} from '../../services/notifications.service.js';

const notificationsRouter = Router();

// ============================================================
// GET /api/v1/notifications — List notifications with cursor pagination
// ============================================================
notificationsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : undefined;
    const cursor = req.query['cursor'] ? (req.query['cursor'] as string) : undefined;

    const result = await getNotifications(userId, limit, cursor);
    sendSuccess(res, result, 'Notifications retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/notifications/actions/complete — SW complete task action
// ============================================================
notificationsRouter.post('/actions/complete', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedBody = notificationCompleteActionSchema.parse(req.body);
    const result = await completeTaskFromNotification(validatedBody.actionToken, validatedBody.taskId);
    sendSuccess(res, result, 'Task completed from notification action successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/notifications/actions/snooze — SW snooze reminder action
// ============================================================
notificationsRouter.post('/actions/snooze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedBody = notificationSnoozeActionSchema.parse(req.body);
    const result = await snoozeReminderFromNotification(
      validatedBody.actionToken,
      validatedBody.reminderId,
      validatedBody.minutes
    );
    sendSuccess(res, { reminder: result }, 'Reminder snoozed from notification action successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/notifications/actions/dismiss — SW dismiss notification action
// ============================================================
notificationsRouter.post('/actions/dismiss', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate empty body strictly
    z.object({}).strict().parse(req.body);

    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      throw new AppError('Action token is required in Authorization header', 'UNAUTHORIZED', 401);
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0]?.toLowerCase() !== 'bearer') {
      throw new AppError('Authorization header must use Bearer scheme', 'UNAUTHORIZED', 401);
    }

    const token = parts[1];
    if (!token) {
      throw new AppError('Action token is missing', 'UNAUTHORIZED', 401);
    }

    await dismissNotificationFromNotification(token);
    sendSuccess(res, {}, 'Notification dismissed successfully', 200);
  } catch (err) {
    next(err);
  }
});

export { notificationsRouter };
