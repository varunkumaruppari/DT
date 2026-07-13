import { z } from 'zod';

export const priorityEnumSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const taskStatusEnumSchema = z.enum(['PLANNED', 'SKIPPED', 'CANCELLED']);

export const scheduledTimeSchema = z.string()
  .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm 24-hour clock format (e.g. 07:30)',
  });

export const taskCreateSchema = z.object({
  plannerId: z.string().uuid('Invalid planner ID format'),
  title: z.string().trim().min(1, 'Task title is required').max(100, 'Task title is too long'),
  description: z.string().trim().max(1000).nullable().optional(),
  scheduledTime: scheduledTimeSchema.nullable().optional(),
  categoryId: z.string().uuid('Invalid category ID format').nullable().optional(),
  priority: priorityEnumSchema.default('MEDIUM').optional(),
}).strict();

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(1, 'Task title is required').max(100, 'Task title is too long').optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  scheduledTime: scheduledTimeSchema.nullable().optional(),
  categoryId: z.string().uuid('Invalid category ID format').nullable().optional(),
  priority: priorityEnumSchema.optional(),
  status: taskStatusEnumSchema.optional(),
}).strict();

export const taskReorderItemSchema = z.object({
  taskId: z.string().uuid('Invalid task ID format'),
  position: z.number().int().nonnegative('Position must be a non-negative integer'),
});

export const taskReorderSchema = z.object({
  plannerId: z.string().uuid('Invalid planner ID format'),
  tasks: z.array(taskReorderItemSchema).min(1, 'Tasks array must contain at least one task'),
}).strict();

export const taskCompleteSchema = z.object({
  completionMethod: z.literal('APP', {
    errorMap: () => ({ message: 'Only completionMethod APP is supported' }),
  }),
}).strict();

export type TaskCreateRequest = z.infer<typeof taskCreateSchema>;
export type TaskUpdateRequest = z.infer<typeof taskUpdateSchema>;
export type TaskReorderRequest = z.infer<typeof taskReorderSchema>;
export type TaskCompleteRequest = z.infer<typeof taskCompleteSchema>;

export interface TaskResponse {
  id: string;
  plannerId: string;
  userId: string;
  categoryId: string | null;
  recurringTaskId: string | null;
  title: string;
  description: string | null;
  scheduledAt: string | null; // ISO string in UTC
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  position: number;
  status: 'PLANNED' | 'SKIPPED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  completion?: {
    id: string;
    taskId: string;
    userId: string;
    completedAt: string;
    completionMethod: 'APP';
    createdAt: string;
  } | null;
}
