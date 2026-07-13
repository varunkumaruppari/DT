import { Router } from 'express';
import { healthRouter } from './health/health.routes.js';
import { authRouter } from './auth/auth.routes.js';
import { settingsRouter } from './settings/settings.routes.js';
import { plannersRouter } from './planners/planners.routes.js';
import { categoriesRouter } from './categories/categories.routes.js';
import { tasksRouter } from './tasks/tasks.routes.js';
import { recurringTasksRouter } from './recurring-tasks/recurring-tasks.routes.js';
import { remindersRouter } from './reminders/reminders.routes.js';
import { pushSubscriptionsRouter } from './push-subscriptions/push-subscriptions.routes.js';
import { notificationsRouter } from './notifications/notifications.routes.js';
import { analyticsRouter } from './analytics/analytics.routes.js';
import { achievementsRouter } from './achievements/achievements.routes.js';
import { xpRouter } from './xp/xp.routes.js';
import { streakRouter } from './streak/streak.routes.js';
import { activityRouter } from './activity/activity.routes.js';

// Version 1 API router — all business routes mount under /api/v1
const v1Router = Router();

v1Router.use('/health', healthRouter);
v1Router.use('/auth', authRouter);
v1Router.use('/settings', settingsRouter);
v1Router.use('/planners', plannersRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/tasks', tasksRouter);
v1Router.use('/recurring-tasks', recurringTasksRouter);
v1Router.use('/reminders', remindersRouter);
v1Router.use('/push-subscriptions', pushSubscriptionsRouter);
v1Router.use('/notifications', notificationsRouter);
v1Router.use('/analytics', analyticsRouter);
v1Router.use('/achievements', achievementsRouter);
v1Router.use('/xp', xpRouter);
v1Router.use('/streak', streakRouter);
v1Router.use('/activity', activityRouter);

export { v1Router };


