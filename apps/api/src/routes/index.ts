import { Router } from 'express';
import { healthRouter } from './health/health.routes.js';
import { authRouter } from './auth/auth.routes.js';
import { settingsRouter } from './settings/settings.routes.js';
import { plannersRouter } from './planners/planners.routes.js';
import { categoriesRouter } from './categories/categories.routes.js';
import { tasksRouter } from './tasks/tasks.routes.js';

// Version 1 API router — all business routes mount under /api/v1
const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/settings', settingsRouter);
v1Router.use('/planners', plannersRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/tasks', tasksRouter);

export { v1Router };

