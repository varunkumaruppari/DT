import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  getCurrentCalendarDate,
  validatePlannerDate,
  validateTimezone,
} from '../lib/timezone.js';
import { recalculateDailyStatistics } from './analytics.service.js';
import { rebuildStreak } from './streak.service.js';
import { evaluateAchievements } from './achievements.service.js';


export function toUtcMidnight(dateStr: string): Date {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr!, 10);
  const month = parseInt(monthStr!, 10);
  const day = parseInt(dayStr!, 10);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

export interface ProgressData {
  totalTasks: number;
  completedTasks: number;
  unfinishedTasks: number;
  completionPercentage: number;
  notDonePercentage: number;
}

export function deriveProgress(tasks: { status: string; deletedAt: Date | null; completion?: unknown }[]): ProgressData {
  // eligibleTasks: deletedAt IS NULL AND status != CANCELLED
  const eligibleTasks = tasks.filter((t) => t.status !== 'CANCELLED' && t.deletedAt === null);
  const completedTasks = eligibleTasks.filter((t) => t.completion !== null && t.completion !== undefined);

  const totalTasks = eligibleTasks.length;
  const completedCount = completedTasks.length;

  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedCount / totalTasks) * 100);
  const notDonePercentage = 100 - completionPercentage;

  return {
    totalTasks,
    completedTasks: completedCount,
    unfinishedTasks: totalTasks - completedCount,
    completionPercentage,
    notDonePercentage,
  };
}

export async function getPlannerByDate(userId: string, dateStr: string) {
  validatePlannerDate(dateStr);
  const plannerDate = toUtcMidnight(dateStr);

  const planner = await prisma.planner.findFirst({
    where: {
      userId,
      plannerDate,
      deletedAt: null,
    },
    include: {
      tasks: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          position: 'asc',
        },
        include: {
          completion: true,
          category: true,
        },
      },
    },
  });

  if (!planner) {
    throw new AppError(`Planner not found for date ${dateStr}`, 'PLANNER_NOT_FOUND', 404);
  }

  const progress = deriveProgress(planner.tasks);

  return {
    ...planner,
    progress,
  };
}

export async function getPlannerToday(userId: string) {
  // 1. Load User Settings to get timezone
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new AppError('User settings not found', 'SETTINGS_NOT_FOUND', 404);
  }

  const timezone = settings.timezone;
  validateTimezone(timezone);

  // 2. Resolve current calendar date in user's timezone
  const todayStr = getCurrentCalendarDate(timezone);

  // 3. Retrieve planner for that date
  return getPlannerByDate(userId, todayStr);
}

export async function createPlanner(userId: string, dateStr: string) {
  validatePlannerDate(dateStr);
  const plannerDate = toUtcMidnight(dateStr);

  return prisma.$transaction(async (tx) => {
    // Check if active planner already exists
    const existingActive = await tx.planner.findUnique({
      where: {
        userId_plannerDate: {
          userId,
          plannerDate,
        },
      },
    });

    if (existingActive) {
      if (existingActive.deletedAt === null) {
        throw new AppError('Planner already exists for this date', 'PLANNER_ALREADY_EXISTS', 409);
      }

      // Lock existing planner row
      await tx.$executeRaw`SELECT id FROM "Planner" WHERE id = ${existingActive.id}::uuid FOR UPDATE`;

      // Soft-deleted planner exists -> restore it
      const restored = await tx.planner.update({
        where: { id: existingActive.id },
        data: { deletedAt: null },
        include: {
          tasks: {
            where: {
              deletedAt: null,
            },
            orderBy: {
              position: 'asc',
            },
            include: {
              completion: true,
              category: true,
            },
          },
        },
      });

      await recalculateDailyStatistics(userId, restored.id, tx);
      await rebuildStreak(userId, tx);
      await evaluateAchievements(userId, tx);

      const progress = deriveProgress(restored.tasks);
      return {
        ...restored,
        progress,
      };
    }

    // Create a new planner
    const created = await tx.planner.create({
      data: {
        userId,
        plannerDate,
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            position: 'asc',
          },
          include: {
            completion: true,
            category: true,
          },
        },
      },
    });

    await recalculateDailyStatistics(userId, created.id, tx);
    await rebuildStreak(userId, tx);
    await evaluateAchievements(userId, tx);

    const progress = deriveProgress(created.tasks);
    return {
      ...created,
      progress,
    };
  });
}

export async function deletePlanner(userId: string, id: string) {
  return prisma.$transaction(async (tx) => {
    const planner = await tx.planner.findUnique({
      where: { id },
    });

    if (!planner) {
      throw new AppError('Planner not found', 'PLANNER_NOT_FOUND', 404);
    }

    if (planner.userId !== userId) {
      throw new AppError('You do not own this planner', 'FORBIDDEN', 403);
    }

    // Lock Planner row
    await tx.$executeRaw`SELECT id FROM "Planner" WHERE id = ${id}::uuid FOR UPDATE`;

    // Soft delete only: set deletedAt
    const deleted = await tx.planner.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    await recalculateDailyStatistics(userId, id, tx);
    await rebuildStreak(userId, tx);
    await evaluateAchievements(userId, tx);

    return deleted;
  });
}

