// ============================================================
// API Response Types
// Safe for both frontend and backend consumption.
// No Node-only or browser-only dependencies.
// ============================================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  errors?: ApiFieldError[];
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
