import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import { completeTask } from './tasks.service.js';
import { snoozeReminder } from './reminders.service.js';
import type { NotificationResponse, ReminderResponse } from '@ddt/shared';
import type { Notification, Prisma } from '@prisma/client';

function mapNotification(n: Notification): NotificationResponse {
  return {
    id: n.id,
    notificationQueueId: n.notificationQueueId,
    userId: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    deliveryStatus: n.deliveryStatus,
    providerMessageId: n.providerMessageId,
    sentAt: n.sentAt ? n.sentAt.toISOString() : null,
    deliveredAt: n.deliveredAt ? n.deliveredAt.toISOString() : null,
    failedAt: n.failedAt ? n.failedAt.toISOString() : null,
    failureReason: n.failureReason,
    createdAt: n.createdAt.toISOString(),
  };
}

export function generateActionToken(
  userId: string,
  action: 'complete' | 'snooze' | 'dismiss',
  targetIds: { taskId?: string; reminderId?: string; notificationId?: string }
): string {
  const payload = {
    sub: userId,
    action,
    ...targetIds,
  };
  return jwt.sign(payload, env.NOTIFICATION_ACTION_SECRET, { expiresIn: '15m' });
}

export function verifyActionToken(token: string, action: 'complete' | 'snooze' | 'dismiss'): jwt.JwtPayload {
  try {
    const payload = jwt.verify(token, env.NOTIFICATION_ACTION_SECRET) as jwt.JwtPayload;
    if (payload['action'] !== action) {
      throw new AppError('Invalid token action', 'UNAUTHORIZED', 401);
    }
    return payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('Invalid or expired action token', 'UNAUTHORIZED', 401);
  }
}

export async function getNotifications(
  userId: string,
  limit?: number,
  cursor?: string
): Promise<{ notifications: NotificationResponse[]; nextCursor?: string }> {
  const limitVal = limit ? Math.min(limit, 100) : 20;

  const query: Prisma.NotificationFindManyArgs = {
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limitVal + 1,
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const list = await prisma.notification.findMany(query);

  let nextCursor: string | undefined = undefined;
  if (list.length > limitVal) {
    const nextItem = list.pop();
    nextCursor = nextItem?.id;
  }

  return {
    notifications: list.map(mapNotification),
    nextCursor,
  };
}

export async function completeTaskFromNotification(actionToken: string, taskId: string): Promise<unknown> {
  const payload = verifyActionToken(actionToken, 'complete');
  if (payload['taskId'] !== taskId) {
    throw new AppError('Token task ID mismatch', 'UNAUTHORIZED', 401);
  }

  return completeTask(payload.sub!, taskId, 'NOTIFICATION');
}

export async function snoozeReminderFromNotification(
  actionToken: string,
  reminderId: string,
  minutes: number
): Promise<ReminderResponse> {
  const payload = verifyActionToken(actionToken, 'snooze');
  if (payload['reminderId'] !== reminderId) {
    throw new AppError('Token reminder ID mismatch', 'UNAUTHORIZED', 401);
  }

  return snoozeReminder(payload.sub!, reminderId, minutes);
}

export async function dismissNotificationFromNotification(actionToken: string): Promise<void> {
  const payload = verifyActionToken(actionToken, 'dismiss');

  if (payload['reminderId']) {
    await prisma.reminderSchedule.update({
      where: { id: payload['reminderId'] },
      data: { status: 'COMPLETED' },
    });
  }
}
