import { z } from 'zod';
import type { TaskResponse } from './task';

export function isValidGregorianDate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (month < 1 || month > 12) return false;
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const daysInMonths = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return day >= 1 && day <= daysInMonths[month - 1];
}

export const plannerDateSchema = z.string().refine(
  (val) => isValidGregorianDate(val),
  { message: 'Invalid calendar date format (YYYY-MM-DD)' }
);

export const plannerRequestSchema = z.object({
  plannerDate: plannerDateSchema,
}).strict();

export type PlannerRequest = z.infer<typeof plannerRequestSchema>;

export interface PlannerResponse {
  id: string;
  userId: string;
  plannerDate: string; // ISO string in UTC midnight
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tasks?: TaskResponse[]; // optional nested tasks
}

