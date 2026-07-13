import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { getCurrentCalendarDate } from '../lib/timezone.js';
import {
  DailyAnalyticsResponse,
  WeeklyAnalyticsResponse,
  MonthlyAnalyticsResponse,
  YearlyAnalyticsResponse,
  WeeklyDaySummary
} from '@ddt/shared';

export async function recalculateDailyStatistics(
  userId: string,
  plannerId: string,
  tx: Prisma.TransactionClient
) {
  const planner = await tx.planner.findUnique({
    where: { id: plannerId },
  });
  if (!planner) return;

  if (planner.deletedAt !== null) {
    await tx.dailyStatistics.upsert({
      where: {
        userId_statisticsDate: {
          userId,
          statisticsDate: planner.plannerDate,
        },
      },
      create: {
        userId,
        statisticsDate: planner.plannerDate,
        totalTasks: 0,
        completedTasks: 0,
        unfinishedTasks: 0,
        completionPercentage: 0,
        notDonePercentage: 0,
        xpEarned: 0,
        focusMinutes: 0,
      },
      update: {
        totalTasks: 0,
        completedTasks: 0,
        unfinishedTasks: 0,
        completionPercentage: 0,
        notDonePercentage: 0,
        xpEarned: 0,
      },
    });
    return;
  }

  const tasks = await tx.task.findMany({
    where: { plannerId, deletedAt: null },
    include: { completion: true },
  });

  const activeTasks = tasks.filter(t => t.status !== 'CANCELLED');
  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter(t => t.completion !== null).length;
  const unfinishedTasks = totalTasks - completedTasks;

  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const notDonePercentage = totalTasks === 0 ? 0 : Math.round((unfinishedTasks / totalTasks) * 100);

  const completedTaskIds = activeTasks.filter(t => t.completion !== null).map(t => t.id);
  const xpTransactions = await tx.xPTransaction.findMany({
    where: {
      userId,
      sourceType: 'TASK',
      sourceId: { in: completedTaskIds },
    },
  });
  const xpEarned = xpTransactions.reduce((sum, x) => sum + x.amount, 0);

  await tx.dailyStatistics.upsert({
    where: {
      userId_statisticsDate: {
        userId,
        statisticsDate: planner.plannerDate,
      },
    },
    create: {
      userId,
      statisticsDate: planner.plannerDate,
      totalTasks,
      completedTasks,
      unfinishedTasks,
      completionPercentage,
      notDonePercentage,
      xpEarned,
      focusMinutes: 0,
    },
    update: {
      totalTasks,
      completedTasks,
      unfinishedTasks,
      completionPercentage,
      notDonePercentage,
      xpEarned,
    },
  });
}

export async function getDailyAnalytics(userId: string, dateStr: string): Promise<DailyAnalyticsResponse> {
  const targetDate = new Date(dateStr + 'T00:00:00Z');
  const stats = await prisma.dailyStatistics.findUnique({
    where: {
      userId_statisticsDate: {
        userId,
        statisticsDate: targetDate,
      },
    },
  });

  if (!stats) {
    return {
      totalTasks: 0,
      completedTasks: 0,
      unfinishedTasks: 0,
      completionPercentage: 0,
      notDonePercentage: 0,
      xpEarned: 0,
    };
  }

  return {
    totalTasks: stats.totalTasks,
    completedTasks: stats.completedTasks,
    unfinishedTasks: stats.unfinishedTasks,
    completionPercentage: Number(stats.completionPercentage),
    notDonePercentage: Number(stats.notDonePercentage),
    xpEarned: stats.xpEarned,
  };
}

export async function getWeeklyAnalytics(userId: string, dateStr?: string): Promise<WeeklyAnalyticsResponse> {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });
  if (!settings) {
    throw new Error('User settings not found');
  }

  const timezone = settings.timezone;
  const targetDateStr = dateStr || getCurrentCalendarDate(timezone);

  const [y, m, d] = targetDateStr.split('-').map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d!, 12, 0, 0));
  const day = date.getUTCDay();

  const weekStartsOn = settings.weekStartsOn; // 'MONDAY' or 'SUNDAY'
  const startDayIndex = weekStartsOn === 'SUNDAY' ? 0 : 1;

  const diff = (day - startDayIndex + 7) % 7;
  const startOfWeek = new Date(date.getTime() - diff * 24 * 60 * 60 * 1000);

  const dateStrings: string[] = [];
  const dateObjects: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000);
    const dStr = nextDay.toISOString().split('T')[0];
    dateStrings.push(dStr!);
    dateObjects.push(new Date(dStr + 'T00:00:00Z'));
  }

  const statsList = await prisma.dailyStatistics.findMany({
    where: {
      userId,
      statisticsDate: { in: dateObjects },
    },
  });

  const statsMap = new Map(statsList.map(s => [s.statisticsDate.toISOString().split('T')[0], s]));

  const days: WeeklyDaySummary[] = dateStrings.map(dStr => {
    const stats = statsMap.get(dStr);
    if (!stats) {
      return {
        date: dStr,
        totalTasks: 0,
        completedTasks: 0,
        unfinishedTasks: 0,
        completionPercentage: 0,
        notDonePercentage: 0,
        xpEarned: 0,
      };
    }
    return {
      date: dStr,
      totalTasks: stats.totalTasks,
      completedTasks: stats.completedTasks,
      unfinishedTasks: stats.unfinishedTasks,
      completionPercentage: Number(stats.completionPercentage),
      notDonePercentage: Number(stats.notDonePercentage),
      xpEarned: stats.xpEarned,
    };
  });

  return { days };
}

export async function getMonthlyAnalytics(
  userId: string,
  year: number,
  month: number
): Promise<MonthlyAnalyticsResponse> {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  const stats = await prisma.dailyStatistics.findMany({
    where: {
      userId,
      statisticsDate: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  let totalTasks = 0;
  let completedTasks = 0;
  let unfinishedTasks = 0;
  let xpEarned = 0;

  for (const s of stats) {
    totalTasks += s.totalTasks;
    completedTasks += s.completedTasks;
    unfinishedTasks += s.unfinishedTasks;
    xpEarned += s.xpEarned;
  }

  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const notDonePercentage = totalTasks === 0 ? 0 : Math.round((unfinishedTasks / totalTasks) * 100);

  return {
    totalTasks,
    completedTasks,
    unfinishedTasks,
    completionPercentage,
    notDonePercentage,
    xpEarned,
  };
}

export async function getYearlyAnalytics(userId: string, year: number): Promise<YearlyAnalyticsResponse> {
  const startDate = new Date(Date.UTC(year, 0, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year + 1, 0, 1, 0, 0, 0));

  const stats = await prisma.dailyStatistics.findMany({
    where: {
      userId,
      statisticsDate: {
        gte: startDate,
        lt: endDate,
      },
    },
  });

  let totalTasks = 0;
  let completedTasks = 0;
  let unfinishedTasks = 0;
  let xpEarned = 0;

  for (const s of stats) {
    totalTasks += s.totalTasks;
    completedTasks += s.completedTasks;
    unfinishedTasks += s.unfinishedTasks;
    xpEarned += s.xpEarned;
  }

  const completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
  const notDonePercentage = totalTasks === 0 ? 0 : Math.round((unfinishedTasks / totalTasks) * 100);

  return {
    totalTasks,
    completedTasks,
    unfinishedTasks,
    completionPercentage,
    notDonePercentage,
    xpEarned,
  };
}
