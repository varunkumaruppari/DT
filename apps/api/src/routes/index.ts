import { Router } from 'express';
import { healthRouter } from './health/health.routes.js';

// Version 1 API router — all business routes mount under /api/v1
const v1Router = Router();

v1Router.use('/health', healthRouter);

export { v1Router };
