import { z } from 'zod';

export const notificationCompleteActionSchema = z.object({
  taskId: z.string().uuid('Invalid task ID format'),
  actionToken: z.string().trim().min(1, 'Action token is required'),
}).strict();

export const notificationSnoozeActionSchema = z.object({
  reminderId: z.string().uuid('Invalid reminder ID format'),
  minutes: z.number().int().min(1, 'Minutes must be at least 1').max(60, 'Minutes cannot exceed 60'),
  actionToken: z.string().trim().min(1, 'Action token is required'),
}).strict();

export type NotificationCompleteActionRequest = z.infer<typeof notificationCompleteActionSchema>;
export type NotificationSnoozeActionRequest = z.infer<typeof notificationSnoozeActionSchema>;

export interface NotificationResponse {
  id: string;
  notificationQueueId: string;
  userId: string;
  type: 'TASK_REMINDER' | 'DAILY_SUMMARY' | 'ACHIEVEMENT' | 'STREAK' | 'SYSTEM';
  title: string;
  body: string;
  deliveryStatus: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  providerMessageId: string | null;
  sentAt: string | null;
  deliveredAt: string | null;
  failedAt: string | null;
  failureReason: string | null;
  createdAt: string;
}
