import { z } from 'zod';

export const pushSubscriptionCreateSchema = z.object({
  endpoint: z.string().trim().url('Invalid endpoint URL'),
  keys: z.object({
    p256dh: z.string().trim().min(1, 'p256dh key is required'),
    auth: z.string().trim().min(1, 'auth key is required'),
  }).strict(),
}).strict();

export type PushSubscriptionCreateRequest = z.infer<typeof pushSubscriptionCreateSchema>;

export interface PushSubscriptionResponse {
  id: string;
  userId: string;
  endpoint: string;
  userAgent: string | null;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
