import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import { v1Router } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// ============================================================
// Express Application
// Responsibilities: middleware, routing, error handling
// Server startup lives in server.ts
// ============================================================

const app = express();

// Security headers
app.use(helmet());

// CORS — configured from environment, not hardcoded
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// HTTP request logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// JSON body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Version 1 API routes
app.use('/api/v1', v1Router);

// 404 handler — must come after all routes
app.use(notFoundHandler);

// Centralized error handler — must be last middleware
app.use(errorHandler);

export { app };
