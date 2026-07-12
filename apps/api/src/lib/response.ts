import type { Response } from 'express';
import type { ApiSuccessResponse, ApiErrorResponse, ApiFieldError } from '@ddt/shared';

// ============================================================
// Standard API Success Response
// Aligned with docs/05_API_Specification.md §5
// ============================================================

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): void {
  const body: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(body);
}

// ============================================================
// Standard API Error Response
// Aligned with docs/05_API_Specification.md §6
// ============================================================

export function sendError(
  res: Response,
  message: string,
  code: string,
  statusCode = 400,
  errors?: ApiFieldError[]
): void {
  const body: ApiErrorResponse = {
    success: false,
    message,
    code,
    ...(errors && errors.length > 0 ? { errors } : {}),
  };
  res.status(statusCode).json(body);
}
