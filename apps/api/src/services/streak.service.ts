import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { getCurrentCalendarDate } from '../lib/timezone.js';
import { awardXP } from './xp.service.js';

export async function rebuildStreak(userId: string, tx: Prisma.TransactionClient) {
  const settings = await tx.userSettings.findUnique({
    where: { userId },
  });
  if (!settings) return;
  const timezone = settings.timezone;

  const todayStr = getCurrentCalendarDate(timezone);

  const planners = await tx.planner.findMany({
    where: { userId, deletedAt: null },
    orderBy: { plannerDate: 'asc' },
  });

  if (planners.length === 0) {
    await tx.streak.upsert({
      where: { userId },
      create: { userId, currentStreak: 0, longestStreak: 0, lastQualifyingDate: null },
      update: { currentStreak: 0, longestStreak: 0, lastQualifyingDate: null },
    });
    return;
  }

  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y!, m! - 1, d!, 12, 0, 0));
  };

  const formatLocalDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const firstPlannerDateStr = planners[0]!.plannerDate.toISOString().split('T')[0];
  const latestPlannerDateStr = planners[planners.length - 1]!.plannerDate.toISOString().split('T')[0];

  const startDate = parseLocalDate(firstPlannerDateStr!);
  const endDateStr = latestPlannerDateStr! > todayStr ? latestPlannerDateStr! : todayStr;
  const endDate = parseLocalDate(endDateStr);

  const allTasks = await tx.task.findMany({
    where: { userId, deletedAt: null },
    include: { completion: true },
  });

  const plannerTasksMap = new Map<string, typeof allTasks>();
  for (const task of allTasks) {
    if (!plannerTasksMap.has(task.plannerId)) {
      plannerTasksMap.set(task.plannerId, []);
    }
    plannerTasksMap.get(task.plannerId)!.push(task);
  }

  const datePlannerMap = new Map<string, typeof planners[0]>();
  for (const p of planners) {
    const dStr = p.plannerDate.toISOString().split('T')[0];
    datePlannerMap.set(dStr!, p);
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let lastQualifyingDate: string | null = null;

  const curr = new Date(startDate.getTime());
  while (curr.getTime() <= endDate.getTime()) {
    const currStr = formatLocalDate(curr);
    const planner = datePlannerMap.get(currStr);

    if (planner) {
      const plannerTasks = plannerTasksMap.get(planner.id) || [];
      const activeTasks = plannerTasks.filter(t => t.status !== 'CANCELLED');
      const completedTasksCount = activeTasks.filter(t => t.completion !== null).length;

      const isRestDay = activeTasks.length === 0;

      if (!isRestDay) {
        if (completedTasksCount >= 1) {
          currentStreak += 1;
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
          }
          lastQualifyingDate = currStr;
        } else {
          if (currStr < todayStr) {
            currentStreak = 0;
          }
        }
      }
    }

    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  const userStreak = await tx.streak.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak,
      longestStreak,
      lastQualifyingDate: lastQualifyingDate ? new Date(lastQualifyingDate + 'T00:00:00Z') : null,
    },
    update: {
      currentStreak,
      longestStreak,
      lastQualifyingDate: lastQualifyingDate ? new Date(lastQualifyingDate + 'T00:00:00Z') : null,
    },
  });

  if (currentStreak >= 7) {
    await awardXP(
      userId,
      50,
      'STREAK_MILESTONE',
      'STREAK',
      userStreak.id,
      `streak-milestone:${userId}:7`,
      tx
    );
  }
  if (currentStreak >= 30) {
    await awardXP(
      userId,
      150,
      'STREAK_MILESTONE',
      'STREAK',
      userStreak.id,
      `streak-milestone:${userId}:30`,
      tx
    );
  }
}

export async function getStreak(userId: string) {
  const s = await prisma.streak.findUnique({
    where: { userId },
  });
  return {
    currentStreak: s ? s.currentStreak : 0,
    longestStreak: s ? s.longestStreak : 0,
    lastQualifyingDate: s && s.lastQualifyingDate ? s.lastQualifyingDate.toISOString().split('T')[0] : null,
  };
}
