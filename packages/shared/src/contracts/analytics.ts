import { z } from 'zod';

export const analyticsDailyQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD calendar date'),
}).strict();

export const analyticsWeeklyQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be YYYY-MM-DD calendar date').optional(),
}).strict();

export const analyticsMonthlyQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100, 'Year must be between 2000 and 2100'),
  month: z.coerce.number().int().min(1).max(12, 'Month must be between 1 and 12'),
}).strict();

export const analyticsYearlyQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100, 'Year must be between 2000 and 2100'),
}).strict();

export type AnalyticsDailyQueryRequest = z.infer<typeof analyticsDailyQuerySchema>;
export type AnalyticsWeeklyQueryRequest = z.infer<typeof analyticsWeeklyQuerySchema>;
export type AnalyticsMonthlyQueryRequest = z.infer<typeof analyticsMonthlyQuerySchema>;
export type AnalyticsYearlyQueryRequest = z.infer<typeof analyticsYearlyQuerySchema>;

export interface DailyAnalyticsResponse {
  totalTasks: number;
  completedTasks: number;
  unfinishedTasks: number;
  completionPercentage: number;
  notDonePercentage: number;
  xpEarned: number;
}

export interface WeeklyDaySummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  unfinishedTasks: number;
  completionPercentage: number;
  notDonePercentage: number;
  xpEarned: number;
}

export interface WeeklyAnalyticsResponse {
  days: WeeklyDaySummary[];
}

export interface MonthlyAnalyticsResponse {
  totalTasks: number;
  completedTasks: number;
  unfinishedTasks: number;
  completionPercentage: number;
  notDonePercentage: number;
  xpEarned: number;
}

export interface YearlyAnalyticsResponse {
  totalTasks: number;
  completedTasks: number;
  unfinishedTasks: number;
  completionPercentage: number;
  notDonePercentage: number;
  xpEarned: number;
}
