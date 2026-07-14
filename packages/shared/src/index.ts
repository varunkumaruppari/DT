// packages/shared — Public API
// Safe for frontend and backend consumption.

// API Response contracts
export type {
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiFieldError,
  ApiResponse,
} from './contracts/api-response.js';

// Safe constants
export {
  API_VERSION,
  API_BASE_PATH,
  PRODUCT_NAME,
  PRODUCT_SHORT_NAME,
  API_ERROR_CODES,
} from './constants/index.js';

export type { ApiErrorCode } from './constants/index.js';

// Auth and Settings contracts
export {
  registerRequestSchema,
  loginRequestSchema,
  updateSettingsRequestSchema,
  themeEnumSchema,
  weekDayEnumSchema,
  timeFormatEnumSchema,
} from './contracts/auth.js';

export type {
  RegisterRequest,
  LoginRequest,
  UpdateSettingsRequest,
  UserResponse,
  AuthResponse,
  UserSettingsResponse,
} from './contracts/auth.js';

// Planner contracts
export {
  isValidGregorianDate,
  plannerDateSchema,
  plannerRequestSchema,
} from './contracts/planner.js';

export type {
  PlannerRequest,
  PlannerResponse,
} from './contracts/planner.js';

// Category contracts
export {
  categoryColorTokens,
  categoryColorSchema,
  categoryCreateSchema,
  categoryUpdateSchema,
} from './contracts/category.js';

export type {
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryResponse,
} from './contracts/category.js';

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
} from './contracts/task.js';

export type {
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskReorderRequest,
  TaskCompleteRequest,
  TaskResponse,
} from './contracts/task.js';

// Recurring Task contracts
export {
  recurrenceTypeEnumSchema,
  recurrenceConfigSchema,
  recurringTaskCreateSchema,
  recurringTaskUpdateSchema,
} from './contracts/recurring-task.js';

export type {
  RecurringTaskCreateRequest,
  RecurringTaskUpdateRequest,
  RecurringTaskResponse,
} from './contracts/recurring-task.js';

// Reminder contracts
export {
  reminderSnoozeSchema,
} from './contracts/reminder.js';

export type {
  ReminderSnoozeRequest,
  ReminderResponse,
} from './contracts/reminder.js';

// Push Subscription contracts
export {
  pushSubscriptionCreateSchema,
} from './contracts/push-subscription.js';

export type {
  PushSubscriptionCreateRequest,
  PushSubscriptionResponse,
} from './contracts/push-subscription.js';

// Notification contracts
export {
  notificationCompleteActionSchema,
  notificationSnoozeActionSchema,
} from './contracts/notification.js';

export type {
  NotificationCompleteActionRequest,
  NotificationSnoozeActionRequest,
  NotificationResponse,
} from './contracts/notification.js';

// Analytics contracts
export {
  analyticsDailyQuerySchema,
  analyticsWeeklyQuerySchema,
  analyticsMonthlyQuerySchema,
  analyticsYearlyQuerySchema,
} from './contracts/analytics.js';

export type {
  AnalyticsDailyQueryRequest,
  AnalyticsWeeklyQueryRequest,
  AnalyticsMonthlyQueryRequest,
  AnalyticsYearlyQueryRequest,
  DailyAnalyticsResponse,
  WeeklyDaySummary,
  WeeklyAnalyticsResponse,
  MonthlyAnalyticsResponse,
  YearlyAnalyticsResponse,
} from './contracts/analytics.js';

// Achievement contracts
export type {
  UserAchievementResponse,
  AchievementsListResponse,
} from './contracts/achievement.js';

// XP contracts
export {
  xpHistoryQuerySchema,
} from './contracts/xp.js';

export type {
  XpHistoryQueryRequest,
  XpSummaryResponse,
  XpTransactionResponse,
  XpHistoryResponse,
} from './contracts/xp.js';

// Streak contracts
export type {
  StreakResponse,
} from './contracts/streak.js';

// Activity contracts
export {
  activityQuerySchema,
} from './contracts/activity.js';

export type {
  ActivityQueryRequest,
  ActivityLogResponse,
  ActivityHistoryResponse,
} from './contracts/activity.js';

// Journal contracts
export {
  journalCreateSchema,
  journalUpdateSchema,
  journalHistoryQuerySchema,
} from './contracts/journal.js';

export type {
  JournalCreateRequest,
  JournalUpdateRequest,
  JournalHistoryQueryRequest,
  JournalResponse,
} from './contracts/journal.js';

// Mood contracts
export {
  moodValueSchema,
  moodUpsertSchema,
  moodHistoryQuerySchema,
} from './contracts/mood.js';

export type {
  MoodUpsertRequest,
  MoodHistoryQueryRequest,
  MoodResponse,
} from './contracts/mood.js';

// Dashboard contracts
export {
  dashboardQuerySchema,
} from './contracts/dashboard.js';

export type {
  DashboardQuery,
  DashboardProgress,
  DashboardStreak,
  DashboardXP,
  DashboardMood,
  DashboardRecentAchievement,
  DashboardResponseData,
} from './contracts/dashboard.js';
