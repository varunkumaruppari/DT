// ============================================================
// Shared Safe Constants
// Safe for both frontend and backend consumption.
// No secrets. No environment-specific values.
// ============================================================

export const API_VERSION = 'v1' as const;
export const API_BASE_PATH = '/api/v1' as const;
export const PRODUCT_NAME = 'Daily Development Tracker' as const;
export const PRODUCT_SHORT_NAME = 'Daily Tracker' as const;

// Standard API error codes — stable identifiers for frontend error handling
export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];
