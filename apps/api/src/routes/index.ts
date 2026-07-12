import { Router } from 'express';
import { healthRouter } from './health/health.routes.js';
import { authRouter } from './auth/auth.routes.js';
import { settingsRouter } from './settings/settings.routes.js';

// Version 1 API router — all business routes mount under /api/v1
const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/settings', settingsRouter);

export { v1Router };
