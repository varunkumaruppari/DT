import { z } from 'zod';
import { priorityEnumSchema, scheduledTimeSchema } from './task.js';
import { weekDayEnumSchema } from './auth.js';

export const recurrenceTypeEnumSchema = z.enum(['DAILY', 'WEEKLY', 'CUSTOM']);

export const recurrenceConfigSchema = z.object({
  weekdays: z.array(weekDayEnumSchema).optional(),
}).strict();

export const recurringTaskCreateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().trim().max(1000).nullable().optional(),
  scheduledLocalTime: scheduledTimeSchema,
  categoryId: z.string().uuid('Invalid category ID format').nullable().optional(),
  priority: priorityEnumSchema.default('MEDIUM').optional(),
  recurrenceType: recurrenceTypeEnumSchema,
  recurrenceConfig: recurrenceConfigSchema,
  reminderEnabled: z.boolean().default(true).optional(),
  reminderMinutes: z.number().int().nonnegative('Reminder lead time must be non-negative').nullable().optional(),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startsOn must be YYYY-MM-DD calendar date'),
  endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endsOn must be YYYY-MM-DD calendar date').nullable().optional(),
}).strict();

export const recurringTaskUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title is too long').optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  scheduledLocalTime: scheduledTimeSchema.optional(),
  categoryId: z.string().uuid('Invalid category ID format').nullable().optional(),
  priority: priorityEnumSchema.optional(),
  recurrenceType: recurrenceTypeEnumSchema.optional(),
  recurrenceConfig: recurrenceConfigSchema.optional(),
  reminderEnabled: z.boolean().optional(),
  reminderMinutes: z.number().int().nonnegative('Reminder lead time must be non-negative').nullable().optional(),
  startsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startsOn must be YYYY-MM-DD calendar date').optional(),
  endsOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endsOn must be YYYY-MM-DD calendar date').nullable().optional(),
  isActive: z.boolean().optional(),
}).strict();

export type RecurringTaskCreateRequest = z.infer<typeof recurringTaskCreateSchema>;
export type RecurringTaskUpdateRequest = z.infer<typeof recurringTaskUpdateSchema>;

export interface RecurringTaskResponse {
  id: string;
  userId: string;
  categoryId: string | null;
  title: string;
  description: string | null;
  scheduledLocalTime: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  recurrenceType: 'DAILY' | 'WEEKLY' | 'CUSTOM';
  recurrenceConfig: z.infer<typeof recurrenceConfigSchema>;
  reminderEnabled: boolean;
  reminderMinutes: number | null;
  startsOn: string; // YYYY-MM-DD
  endsOn: string | null; // YYYY-MM-DD
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
