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

// Planner contracts
export {
  isValidGregorianDate,
  plannerDateSchema,
  plannerRequestSchema,
} from './contracts/planner';

export type {
  PlannerRequest,
  PlannerResponse,
} from './contracts/planner';

// Category contracts
export {
  categoryColorTokens,
  categoryColorSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
} from './contracts/category';

export type {
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryResponse,
} from './contracts/category';

// Task contracts
export {
  priorityEnumSchema,
  taskStatusEnumSchema,
  scheduledTimeSchema,
  taskCreateSchema,
  taskUpdateSchema,
  taskReorderItemSchema,
  taskReorderSchema,
  taskCompleteSchema,
} from './contracts/task';

export type {
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskReorderRequest,
  TaskCompleteRequest,
  TaskResponse,
} from './contracts/task';

// Recurring Task contracts
export {
  recurrenceTypeEnumSchema,
  recurrenceConfigSchema,
  recurringTaskCreateSchema,
  recurringTaskUpdateSchema,
} from './contracts/recurring-task';

export type {
  RecurringTaskCreateRequest,
  RecurringTaskUpdateRequest,
  RecurringTaskResponse,
} from './contracts/recurring-task';

// Reminder contracts
export {
  reminderSnoozeSchema,
} from './contracts/reminder';

export type {
  ReminderSnoozeRequest,
  ReminderResponse,
} from './contracts/reminder';

// Push Subscription contracts
export {
  pushSubscriptionCreateSchema,
} from './contracts/push-subscription';

export type {
  PushSubscriptionCreateRequest,
  PushSubscriptionResponse,
} from './contracts/push-subscription';

// Notification contracts
export {
  notificationCompleteActionSchema,
  notificationSnoozeActionSchema,
} from './contracts/notification';

export type {
  NotificationCompleteActionRequest,
  NotificationSnoozeActionRequest,
  NotificationResponse,
} from './contracts/notification';

