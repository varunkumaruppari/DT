import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { updateSettingsRequestSchema } from '@ddt/shared';
import { getSettingsByUserId, updateSettings } from '../../services/settings.service.js';
import { sendSuccess } from '../../lib/response.js';
import { requireAuth } from '../../middleware/auth.js';

const settingsRouter = Router();

// ============================================================
// GET /api/v1/settings — Retrieve authenticated settings
// ============================================================
settingsRouter.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;
    const settings = await getSettingsByUserId(userId);

    sendSuccess(
      res,
      { settings },
      'User settings retrieved successfully',
      200
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/v1/settings — Update authenticated settings
// ============================================================
settingsRouter.patch('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.auth!.userId;

    // Enforce schema boundary via Zod schema (only theme, notificationsEnabled, etc.)
    const validatedData = updateSettingsRequestSchema.parse(req.body);

    const settings = await updateSettings(userId, validatedData);

    sendSuccess(
      res,
      { settings },
      'Settings updated successfully',
      200
    );
  } catch (err) {
    next(err);
  }
});

export { settingsRouter };
