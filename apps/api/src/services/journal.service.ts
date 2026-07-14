import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import { toUtcMidnight } from './planners.service.js';
import { awardXP } from './xp.service.js';
import { evaluateAchievements } from './achievements.service.js';
import { getCurrentCalendarDate, validateTimezone } from '../lib/timezone.js';
import type { JournalCreateRequest, JournalUpdateRequest, JournalHistoryQueryRequest } from '@ddt/shared';

export async function getJournalToday(userId: string) {
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

  const journal = await prisma.journalEntry.findFirst({
    where: {
      userId,
      entryDate,
      deletedAt: null,
    },
  });

  if (!journal) {
    throw new AppError('Journal entry not found for today', 'JOURNAL_NOT_FOUND', 404);
  }

  return journal;
}

export async function getJournalHistory(userId: string, filters: JournalHistoryQueryRequest) {
  const whereClause: Prisma.JournalEntryWhereInput = {
    userId,
    deletedAt: null,
  };

  if (filters.date) {
    whereClause.entryDate = toUtcMidnight(filters.date);
  } else if (filters.from || filters.to) {
    whereClause.entryDate = {};
    if (filters.from) {
      whereClause.entryDate.gte = toUtcMidnight(filters.from);
    }
    if (filters.to) {
      whereClause.entryDate.lte = toUtcMidnight(filters.to);
    }
  }

  return prisma.journalEntry.findMany({
    where: whereClause,
  });
}

export async function createJournalEntry(userId: string, dto: JournalCreateRequest) {
  const entryDate = toUtcMidnight(dto.entryDate);
  const idempotencyKey = `journal-completed:${userId}:${dto.entryDate}`;

  return prisma.$transaction(async (tx) => {
    // Check if entry already exists (including soft-deleted)
    const existing = await tx.journalEntry.findUnique({
      where: {
        userId_entryDate: {
          userId,
          entryDate,
        },
      },
    });

    if (existing) {
      if (existing.deletedAt === null) {
        throw new AppError('Journal entry already exists for this date', 'JOURNAL_ALREADY_EXISTS', 409);
      }

      // Lock row
      await tx.$executeRaw`SELECT id FROM "JournalEntry" WHERE id = ${existing.id}::uuid FOR UPDATE`;

      // Soft-deleted entry exists -> Restore and update
      const restored = await tx.journalEntry.update({
        where: { id: existing.id },
        data: {
          title: dto.title ?? null,
          content: dto.content,
          gratitude: dto.gratitude ?? null,
          lessonsLearned: dto.lessonsLearned ?? null,
          tomorrowPlan: dto.tomorrowPlan ?? null,
          deletedAt: null,
        },
      });

      // Award XP (idempotency key prevents duplicates)
      const xpExists = await tx.xPTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (!xpExists) {
        await awardXP(
          userId,
          20,
          'JOURNAL_COMPLETED',
          'JOURNAL',
          restored.id,
          idempotencyKey,
          tx
        );
      }

      // Evaluate achievements
      await evaluateAchievements(userId, tx);

      // Log activity
      await tx.activityLog.create({
        data: {
          userId,
          type: 'JOURNAL_WRITTEN',
          entityType: 'JOURNAL',
          entityId: restored.id,
          metadata: {
            restored: true,
            titleLength: dto.title?.length || 0,
            date: dto.entryDate,
          },
        },
      });

      return restored;
    }

    try {
      // Create new journal entry
      const created = await tx.journalEntry.create({
        data: {
          userId,
          entryDate,
          title: dto.title ?? null,
          content: dto.content,
          gratitude: dto.gratitude ?? null,
          lessonsLearned: dto.lessonsLearned ?? null,
          tomorrowPlan: dto.tomorrowPlan ?? null,
        },
      });

      // Award XP
      const xpExists = await tx.xPTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (!xpExists) {
        await awardXP(
          userId,
          20,
          'JOURNAL_COMPLETED',
          'JOURNAL',
          created.id,
          idempotencyKey,
          tx
        );
      }

      // Evaluate achievements
      await evaluateAchievements(userId, tx);

      // Log activity
      await tx.activityLog.create({
        data: {
          userId,
          type: 'JOURNAL_WRITTEN',
          entityType: 'JOURNAL',
          entityId: created.id,
          metadata: {
            titleLength: dto.title?.length || 0,
            date: dto.entryDate,
          },
        },
      });

      return created;
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
        throw new AppError('Journal entry already exists for this date', 'JOURNAL_ALREADY_EXISTS', 409);
      }
      throw err;
    }
  });
}

export async function updateJournalEntry(userId: string, id: string, dto: JournalUpdateRequest) {
  const journal = await prisma.journalEntry.findUnique({
    where: { id },
  });

  if (!journal || journal.deletedAt !== null) {
    throw new AppError('Journal entry not found', 'JOURNAL_NOT_FOUND', 404);
  }

  if (journal.userId !== userId) {
    throw new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      title: dto.title !== undefined ? dto.title : journal.title,
      content: dto.content !== undefined ? dto.content : journal.content,
      gratitude: dto.gratitude !== undefined ? dto.gratitude : journal.gratitude,
      lessonsLearned: dto.lessonsLearned !== undefined ? dto.lessonsLearned : journal.lessonsLearned,
      tomorrowPlan: dto.tomorrowPlan !== undefined ? dto.tomorrowPlan : journal.tomorrowPlan,
    },
  });

  return updated;
}

export async function deleteJournalEntry(userId: string, id: string) {
  const journal = await prisma.journalEntry.findUnique({
    where: { id },
  });

  if (!journal || journal.deletedAt !== null) {
    throw new AppError('Journal entry not found', 'JOURNAL_NOT_FOUND', 404);
  }

  if (journal.userId !== userId) {
    throw new AppError('Forbidden', 'FORBIDDEN', 403);
  }

  await prisma.journalEntry.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    },
  });
}
