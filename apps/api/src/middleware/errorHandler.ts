import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { sendError } from '../lib/response.js';

// ============================================================
// AppError — Known typed application errors
// ============================================================

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode = 400) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ============================================================
// Centralized Error Handling Middleware
// Must be registered AFTER all routes in app.ts
// ============================================================

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Known application error
  if (err instanceof AppError) {
    sendError(res, err.message, err.code, err.statusCode);
    return;
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    sendError(res, 'Validation failed', 'VALIDATION_ERROR', 400, errors);
    return;
  }

  // Unknown / unexpected error
  const isDev = process.env['NODE_ENV'] === 'development';
  console.error('[ErrorHandler] Unexpected error:', err);

  sendError(
    res,
    isDev && err instanceof Error ? err.message : 'An unexpected error occurred',
    'INTERNAL_ERROR',
    500
  );
}

// ============================================================
// 404 Not Found Handler
// ============================================================

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    `Route ${req.method} ${req.path} not found`,
    'NOT_FOUND',
    404
  );
}
