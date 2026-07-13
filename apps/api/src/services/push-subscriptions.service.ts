import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { env } from '../config/env.js';
import type { PushSubscription } from '@prisma/client';
import type {
  PushSubscriptionCreateRequest,
  PushSubscriptionResponse,
} from '@ddt/shared';

function mapSubscription(sub: PushSubscription): PushSubscriptionResponse {
  return {
    id: sub.id,
    userId: sub.userId,
    endpoint: sub.endpoint,
    userAgent: sub.userAgent,
    isActive: sub.isActive,
    lastUsedAt: sub.lastUsedAt ? sub.lastUsedAt.toISOString() : null,
    createdAt: sub.createdAt.toISOString(),
    updatedAt: sub.updatedAt.toISOString(),
  };
}

export function getVapidConfig() {
  return {
    vapidPublicKey: env.VAPID_PUBLIC_KEY,
  };
}

export async function getPushSubscriptions(userId: string): Promise<PushSubscriptionResponse[]> {
  const subs = await prisma.pushSubscription.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return subs.map(mapSubscription);
}

export async function registerPushSubscription(
  userId: string,
  data: PushSubscriptionCreateRequest,
  userAgent?: string
): Promise<PushSubscriptionResponse> {
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: data.endpoint },
  });

  if (existing) {
    if (existing.userId !== userId) {
      throw new AppError('Push subscription endpoint is registered to another user', 'PUSH_SUBSCRIPTION_CONFLICT', 409);
    }

    const updated = await prisma.pushSubscription.update({
      where: { id: existing.id },
      data: {
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
        isActive: true,
        userAgent: userAgent || existing.userAgent,
        lastUsedAt: null,
      },
    });

    return mapSubscription(updated);
  }

  const created = await prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: data.endpoint,
      p256dh: data.keys.p256dh,
      auth: data.keys.auth,
      userAgent: userAgent || null,
      isActive: true,
    },
  });

  return mapSubscription(created);
}

export async function deletePushSubscription(userId: string, id: string): Promise<PushSubscriptionResponse> {
  const sub = await prisma.pushSubscription.findUnique({
    where: { id },
  });

  if (!sub) {
    throw new AppError('Push subscription not found', 'PUSH_SUBSCRIPTION_NOT_FOUND', 404);
  }

  if (sub.userId !== userId) {
    throw new AppError('You do not own this push subscription', 'FORBIDDEN', 403);
  }

  const updated = await prisma.pushSubscription.update({
    where: { id },
    data: {
      isActive: false,
    },
  });

  return mapSubscription(updated);
}
