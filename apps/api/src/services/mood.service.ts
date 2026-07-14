import { prisma } from '../lib/prisma.js';
import { Prisma, MoodEntry } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { toUtcMidnight } from './planners.service.js';
import { getCurrentCalendarDate, validateTimezone } from '../lib/timezone.js';
import type { MoodUpsertRequest, MoodHistoryQueryRequest } from '@ddt/shared';

export async function getMoodToday(userId: string) {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new AppError('User settings not found', 'SETTINGS_NOT_FOUND', 404);
  }

  const timezone = settings.timezone;
  validateTimezone(timezone);

  const todayStr = getCurrentCalendarDate(timezone);
  const entryDate = toUtcMidnight(todayStr);

  const moodEntry = await prisma.moodEntry.findFirst({
    where: {
      userId,
      entryDate,
    },
  });

  if (!moodEntry) {
    throw new AppError('Mood entry not found for today', 'MOOD_NOT_FOUND', 404);
  }

  return moodEntry;
}

export async function getMoodHistory(userId: string, filters: MoodHistoryQueryRequest) {
  const whereClause: Prisma.MoodEntryWhereInput = {
    userId,
  };

  if (filters.from || filters.to) {
    whereClause.entryDate = {};
    if (filters.from) {
      whereClause.entryDate.gte = toUtcMidnight(filters.from);
    }
    if (filters.to) {
      whereClause.entryDate.lte = toUtcMidnight(filters.to);
    }
  }

  return prisma.moodEntry.findMany({
    where: whereClause,
  });
}

export async function upsertMoodToday(userId: string, dto: MoodUpsertRequest, retryCount = 0): Promise<MoodEntry> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new AppError('User settings not found', 'SETTINGS_NOT_FOUND', 404);
  }

  const timezone = settings.timezone;
  validateTimezone(timezone);

  const todayStr = getCurrentCalendarDate(timezone);
  const entryDate = toUtcMidnight(todayStr);

  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.moodEntry.findUnique({
        where: {
          userId_entryDate: {
            userId,
            entryDate,
          },
        },
      });

      if (existing) {
        // Lock row
        await tx.$executeRaw`SELECT id FROM "MoodEntry" WHERE id = ${existing.id}::uuid FOR UPDATE`;

        const updated = await tx.moodEntry.update({
          where: { id: existing.id },
          data: {
            mood: dto.mood,
            note: dto.note ?? null,
          },
        });

        // Log activity
        await tx.activityLog.create({
          data: {
            userId,
            type: 'MOOD_LOGGED',
            entityType: 'MOOD',
            entityId: updated.id,
            metadata: {
              updated: true,
              mood: dto.mood,
              hasNote: !!dto.note,
            },
          },
        });

        return updated;
      }

      const created = await tx.moodEntry.create({
        data: {
          userId,
          entryDate,
          mood: dto.mood,
          note: dto.note ?? null,
        },
      });

      // Log activity
      await tx.activityLog.create({
        data: {
          userId,
          type: 'MOOD_LOGGED',
          entityType: 'MOOD',
          entityId: created.id,
          metadata: {
            mood: dto.mood,
            hasNote: !!dto.note,
          },
        },
      });

      return created;
    });
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002' && retryCount < 1) {
      // Catch unique violation outside the transaction block and retry once.
      // The retry will find the existing row, lock it, and perform an update.
      return upsertMoodToday(userId, dto, retryCount + 1);
    }
    throw err;
  }
}
