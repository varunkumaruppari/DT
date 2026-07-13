import { z } from 'zod';

export const reminderSnoozeSchema = z.object({
  minutes: z.number().int().min(1, 'Minutes must be at least 1').max(60, 'Minutes cannot exceed 60'),
}).strict();

export type ReminderSnoozeRequest = z.infer<typeof reminderSnoozeSchema>;

export interface ReminderResponse {
  id: string;
  taskId: string;
  userId: string;
  scheduledFor: string; // ISO UTC
  status: 'SCHEDULED' | 'QUEUED' | 'CANCELLED' | 'COMPLETED';
  reminderMinutes: number;
  createdAt: string;
  updatedAt: string;
}
