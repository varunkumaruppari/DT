import { z } from 'zod';
import { plannerDateSchema } from './planner.js';

export const journalCreateSchema = z.object({
  entryDate: plannerDateSchema,
  title: z.string().trim().max(100, 'Title must not exceed 100 characters').nullable().optional(),
  content: z.string().trim().min(1, 'Content must not be empty'),
  gratitude: z.string().trim().max(500, 'Gratitude must not exceed 500 characters').nullable().optional(),
  lessonsLearned: z.string().trim().max(500, 'Lessons learned must not exceed 500 characters').nullable().optional(),
  tomorrowPlan: z.string().trim().max(500, 'Tomorrow\'s plan must not exceed 500 characters').nullable().optional(),
}).strict();

export const journalUpdateSchema = z.object({
  title: z.string().trim().max(100, 'Title must not exceed 100 characters').nullable().optional(),
  content: z.string().trim().min(1, 'Content must not be empty').optional(),
  gratitude: z.string().trim().max(500, 'Gratitude must not exceed 500 characters').nullable().optional(),
  lessonsLearned: z.string().trim().max(500, 'Lessons learned must not exceed 500 characters').nullable().optional(),
  tomorrowPlan: z.string().trim().max(500, 'Tomorrow\'s plan must not exceed 500 characters').nullable().optional(),
}).strict();

export const journalHistoryQuerySchema = z.object({
  date: plannerDateSchema.optional(),
  from: plannerDateSchema.optional(),
  to: plannerDateSchema.optional(),
}).strict();

export type JournalCreateRequest = z.infer<typeof journalCreateSchema>;
export type JournalUpdateRequest = z.infer<typeof journalUpdateSchema>;
export type JournalHistoryQueryRequest = z.infer<typeof journalHistoryQuerySchema>;

export interface JournalResponse {
  id: string;
  userId: string;
  entryDate: string; // ISO string in UTC midnight
  title: string | null;
  content: string;
  gratitude: string | null;
  lessonsLearned: string | null;
  tomorrowPlan: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
