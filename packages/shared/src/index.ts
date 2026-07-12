// packages/shared — Public API
// Safe for frontend and backend consumption.

// API Response contracts
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiFieldError,
  ApiResponse,
} from './contracts/api-response';

// Safe constants
export {
  API_VERSION,
  API_BASE_PATH,
  PRODUCT_NAME,
  PRODUCT_SHORT_NAME,
  API_ERROR_CODES,
} from './constants/index';

export type { ApiErrorCode } from './constants/index';

// Auth and Settings contracts
export {
  registerRequestSchema,
  loginRequestSchema,
  updateSettingsRequestSchema,
  themeEnumSchema,
  weekDayEnumSchema,
  timeFormatEnumSchema,
} from './contracts/auth';

export type {
  RegisterRequest,
  LoginRequest,
  UpdateSettingsRequest,
  UserResponse,
  AuthResponse,
  UserSettingsResponse,
} from './contracts/auth';
