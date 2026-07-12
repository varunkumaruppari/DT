import { Router } from 'express';
import type { Request, Response, NextFunction } from 'express';
import { registerRequestSchema, loginRequestSchema } from '@ddt/shared';
import { registerUser, authenticateUser, getUserById } from '../../services/auth.service.js';
import { signToken } from '../../lib/crypto.js';
import { sendSuccess } from '../../lib/response.js';
import { requireAuth } from '../../middleware/auth.js';

const authRouter = Router();

// ============================================================
// POST /api/v1/auth/register — Register new account
// ============================================================
authRouter.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body against shared schema
    const validatedData = registerRequestSchema.parse(req.body);

    const user = await registerUser(validatedData);

    // Issue JWT token with user's sub identity
    const accessToken = signToken({ sub: user.id });

    sendSuccess(
      res,
      { user, accessToken },
      'User registered successfully',
      201
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/auth/login — Authenticate user credentials
// ============================================================
authRouter.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    const validatedData = loginRequestSchema.parse(req.body);

    const user = await authenticateUser(validatedData);

    // Issue JWT token with user's sub identity
    const accessToken = signToken({ sub: user.id });

    sendSuccess(
      res,
      { user, accessToken },
      'Login successful',
      200
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/v1/auth/logout — Invalidate user session (client-only)
// ============================================================
authRouter.post('/logout', requireAuth, (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Stateless token invalidation is client-side. Backend responds with success.
    sendSuccess(
      res,
      {},
      'Logged out successfully',
      200
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/v1/auth/me — Retrieve authenticated profile
// ============================================================
authRouter.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authenticated identity is verified via requireAuth middleware (sub claim)
    const userId = req.auth!.userId;

    const user = await getUserById(userId);

    sendSuccess(
      res,
      { user },
      'User profile retrieved successfully',
      200
    );
  } catch (err) {
    next(err);
  }
});

export { authRouter };
