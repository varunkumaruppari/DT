import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { reminderSnoozeSchema } from '@ddt/shared';
import { requireAuth } from '../../middleware/auth.js';
import { sendSuccess } from '../../lib/response.js';
import { getReminders, snoozeReminder, cancelReminder } from '../../services/reminders.service.js';

const remindersRouter = Router();

remindersRouter.use(requireAuth);

// ============================================================
// GET /api/v1/reminders — List all reminders
// ============================================================
remindersRouter.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const reminders = await getReminders(userId);
    sendSuccess(res, { reminders }, 'Reminders retrieved successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/reminders/:id/snooze — Snooze a reminder
// ============================================================
remindersRouter.post('/:id/snooze', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid reminder ID format').parse(req.params.id);
    const validatedBody = reminderSnoozeSchema.parse(req.body);
    const reminder = await snoozeReminder(userId, id, validatedBody.minutes);
    sendSuccess(res, { reminder }, 'Reminder snoozed successfully', 200);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/reminders/:id/cancel — Cancel a reminder
// ============================================================
remindersRouter.post('/:id/cancel', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const id = z.string().uuid('Invalid reminder ID format').parse(req.params.id);
    const reminder = await cancelReminder(userId, id);
    sendSuccess(res, { reminder }, 'Reminder cancelled successfully', 200);
  } catch (err) {
    next(err);
  }
});

export { remindersRouter };
