import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { ActivityHistoryResponse } from '@ddt/shared';

export async function logActivity(
  userId: string,
  type: string,
  entityType: string,
  entityId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any,
  txClient?: Prisma.TransactionClient
) {
  const client = txClient || prisma;
  return await client.activityLog.create({
    data: {
      userId,
      type,
      entityType,
      entityId,
      metadata: metadata || null,
    },
  });
}

export async function getActivityHistory(
  userId: string,
  cursor?: string,
  limit = 20,
  type?: string
): Promise<ActivityHistoryResponse> {
  const take = limit + 1;
  const items = await prisma.activityLog.findMany({
    where: {
      userId,
      type: type || undefined,
    },
    orderBy: [
      { occurredAt: 'desc' },
      { id: 'desc' },
    ],
    take,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  });
  
  const hasMore = items.length > limit;
  if (hasMore) {
    items.pop();
  }
  
  const nextCursor = hasMore ? items[items.length - 1].id : null;
  
  return {
    items: items.map(item => ({
      id: item.id,
      type: item.type,
      entityType: item.entityType,
      entityId: item.entityId,
      metadata: item.metadata,
      occurredAt: item.occurredAt.toISOString(),
    })),
    nextCursor,
    hasMore,
  };
}
