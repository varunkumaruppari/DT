import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { XpSummaryResponse, XpHistoryResponse } from '@ddt/shared';

export async function awardXP(
  userId: string,
  amount: number,
  reason: string,
  sourceType: string,
  sourceId: string,
  idempotencyKey: string,
  txClient?: Prisma.TransactionClient
) {
  const client = txClient || prisma;
  try {
    return await client.xPTransaction.create({
      data: {
        userId,
        amount,
        reason,
        sourceType,
        sourceId,
        idempotencyKey,
      },
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
      const existing = await client.xPTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existing) {
        return existing;
      }
    }
    throw err;
  }
}

export async function getXpSummary(userId: string): Promise<XpSummaryResponse> {
  const agg = await prisma.xPTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const totalXP = agg._sum.amount || 0;
  
  const level = Math.floor(totalXP / 100) + 1;
  const xpIntoCurrentLevel = totalXP % 100;
  const xpRequiredForNextLevel = 100;
  const levelProgressPercentage = Math.round((xpIntoCurrentLevel / 100) * 100);
  
  return {
    totalXP,
    level,
    xpIntoCurrentLevel,
    xpRequiredForNextLevel,
    levelProgressPercentage,
  };
}

export async function getXpHistory(userId: string, cursor?: string, limit = 20): Promise<XpHistoryResponse> {
  const take = limit + 1;
  const items = await prisma.xPTransaction.findMany({
    where: { userId },
    orderBy: [
      { createdAt: 'desc' },
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
      amount: item.amount,
      reason: item.reason,
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      createdAt: item.createdAt.toISOString(),
    })),
    nextCursor,
  };
}
