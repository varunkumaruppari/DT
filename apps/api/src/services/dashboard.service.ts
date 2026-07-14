import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { toUtcMidnight } from './planners.service.js';
import { getCurrentCalendarDate, validateTimezone } from '../lib/timezone.js';
import type { DashboardResponseData } from '@ddt/shared';

export async function getDashboardData(userId: string, dateParam?: string): Promise<DashboardResponseData> {
  // 1. Fetch UserSettings to get timezone authority
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new AppError('User settings not found', 'SETTINGS_NOT_FOUND', 404);
  }

  const timezone = settings.timezone;
  validateTimezone(timezone);

  // 2. Resolve calendar date
  const dateStr = dateParam || getCurrentCalendarDate(timezone);
  const resolvedDate = toUtcMidnight(dateStr);

  // 3. Greeting: derived using user's timezone current local hour
  const date = new Date();
  const options = { timeZone: timezone, hour: '2-digit', hour12: false } as const;
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const localHourStr = formatter.format(date);
  const localHour = parseInt(localHourStr, 10);

  let greeting = 'Good evening';
  if (localHour >= 5 && localHour < 12) {
    greeting = 'Good morning';
  } else if (localHour >= 12 && localHour < 17) {
    greeting = 'Good afternoon';
  }

  // 4. Progress Stats
  const planner = await prisma.planner.findFirst({
    where: {
      userId,
      plannerDate: resolvedDate,
      deletedAt: null,
    },
    include: {
      tasks: {
        where: { deletedAt: null },
        include: { completion: true },
      },
    },
  });

  let totalTasks = 0;
  let completedTasks = 0;
  let unfinishedTasks = 0;
  let completionPercentage = 0;
  let notDonePercentage = 0;

  if (planner && planner.tasks) {
    // Include active tasks (exclude cancelled tasks)
    const eligibleTasks = planner.tasks.filter((t) => t.status !== 'CANCELLED');
    totalTasks = eligibleTasks.length;
    completedTasks = eligibleTasks.filter((t) => t.completion !== null).length;
    unfinishedTasks = totalTasks - completedTasks;
    completionPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    notDonePercentage = totalTasks === 0 ? 0 : 100 - completionPercentage;
  }

  // 5. Streak Metrics
  const streak = await prisma.streak.findUnique({
    where: { userId },
  });
  const currentStreak = streak?.currentStreak || 0;
  const longestStreak = streak?.longestStreak || 0;

  // 6. XP Summation
  const aggXp = await prisma.xPTransaction.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  const currentXp = aggXp._sum.amount || 0;

  // 7. Mood Entry
  const moodEntry = await prisma.moodEntry.findFirst({
    where: {
      userId,
      entryDate: resolvedDate,
    },
  });
  const mood = moodEntry ? { mood: moodEntry.mood } : null;

  // 8. Upcoming Tasks (Max 5, uncompleted, active, not skipped, not cancelled, scheduledAt is not null)
  const dbUpcomingTasks = await prisma.task.findMany({
    where: {
      userId,
      deletedAt: null,
      status: 'PLANNED',
      scheduledAt: { not: null },
      completion: null,
    },
    orderBy: [
      { scheduledAt: 'asc' },
      { position: 'asc' },
    ],
    take: 5,
    include: {
      completion: true,
      category: true,
    },
  });

  const upcomingTasks = dbUpcomingTasks.map((t) => ({
    id: t.id,
    plannerId: t.plannerId,
    userId: t.userId,
    categoryId: t.categoryId,
    recurringTaskId: t.recurringTaskId,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    position: t.position,
    scheduledAt: t.scheduledAt ? t.scheduledAt.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    deletedAt: t.deletedAt ? t.deletedAt.toISOString() : null,
    completion: t.completion
      ? {
          id: t.completion.id,
          taskId: t.completion.taskId,
          userId: t.completion.userId,
          completedAt: t.completion.completedAt.toISOString(),
          completionMethod: t.completion.completionMethod as 'APP',
          createdAt: t.completion.createdAt.toISOString(),
        }
      : null,
  }));

  // 9. Recent Achievements (Max 3, unlocked only, sorted by unlockedAt DESC)
  const dbRecentAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
    take: 3,
    include: {
      achievement: true,
    },
  });

  const recentAchievements = dbRecentAchievements.map((ua) => ({
    id: ua.id,
    userId: ua.userId,
    achievementId: ua.achievementId,
    unlockedAt: ua.unlockedAt.toISOString(),
    achievement: {
      id: ua.achievement.id,
      code: ua.achievement.code,
      name: ua.achievement.name,
      description: ua.achievement.description,
      xpReward: ua.achievement.xpReward,
      icon: ua.achievement.icon,
    },
  }));

  return {
    date: dateStr,
    greeting,
    progress: {
      totalTasks,
      completedTasks,
      unfinishedTasks,
      completionPercentage,
      notDonePercentage,
    },
    streak: {
      current: currentStreak,
      longest: longestStreak,
    },
    xp: {
      current: currentXp,
    },
    mood,
    upcomingTasks,
    recentAchievements,
  };
}
