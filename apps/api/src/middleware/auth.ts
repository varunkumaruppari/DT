import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../lib/crypto.js';
import { AppError } from './errorHandler.js';

// ============================================================
// Authentication Middleware
// Enforces access token validity, parses verified sub claim
// Exposes req.auth.userId in request context
// ============================================================

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    throw new AppError('Authorization header is missing', 'UNAUTHORIZED', 401);
  }

  // Parse Bearer <token>
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0]?.toLowerCase() !== 'bearer') {
    throw new AppError('Authorization header must use Bearer scheme', 'UNAUTHORIZED', 401);
  }

  const token = parts[1];
  if (!token) {
    throw new AppError('Authentication token is missing', 'UNAUTHORIZED', 401);
  }

  try {
    const payload = verifyToken(token);
    req.auth = {
      userId: payload.sub,
    };
    next();
  } catch {
    // Narrow down jwt validation failures to standard unauthorized contract
    throw new AppError('Invalid or expired authentication token', 'UNAUTHORIZED', 401);
  }
}
