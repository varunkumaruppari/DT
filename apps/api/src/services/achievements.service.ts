import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { UserAchievementResponse } from '@ddt/shared';
import { awardXP } from './xp.service.js';

export const MASTER_ACHIEVEMENTS = [
  {
    code: 'FIRST_TASK',
    name: 'First Step',
    description: 'Complete your first task',
    icon: 'check-circle',
    xpReward: 50,
    criteriaType: 'TASK_COUNT',
    criteriaConfig: { count: 1 },
  },
  {
    code: 'FIRST_PERFECT_DAY',
    name: 'Perfect Day',
    description: 'Complete all planned and skipped tasks for a day (minimum 1 task)',
    icon: 'award',
    xpReward: 100,
    criteriaType: 'PERFECT_DAY_COUNT',
    criteriaConfig: { count: 1 },
  },
  {
    code: 'STREAK_7',
    name: 'Consistency King',
    description: 'Reach a 7-day task completion streak',
    icon: 'zap',
    xpReward: 150,
    criteriaType: 'STREAK',
    criteriaConfig: { count: 7 },
  },
  {
    code: 'STREAK_30',
    name: 'Self-Development Guru',
    description: 'Reach a 30-day task completion streak',
    icon: 'flame',
    xpReward: 300,
    criteriaType: 'STREAK',
    criteriaConfig: { count: 30 },
  },
  {
    code: 'TASKS_100',
    name: 'Centurion',
    description: 'Complete 100 tasks',
    icon: 'crown',
    xpReward: 200,
    criteriaType: 'TASK_COUNT',
    criteriaConfig: { count: 100 },
  },
  {
    code: 'FIRST_JOURNAL',
    name: 'First Reflection',
    description: 'Write your first journal entry',
    icon: 'book-open',
    xpReward: 50,
    criteriaType: 'JOURNAL_COUNT',
    criteriaConfig: { count: 1 },
  }
];

export async function seedAchievements() {
  for (const item of MASTER_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        description: item.description,
        icon: item.icon,
        xpReward: item.xpReward,
        criteriaType: item.criteriaType,
        criteriaConfig: item.criteriaConfig as Prisma.InputJsonValue,
      },
      create: {
        code: item.code,
        name: item.name,
        description: item.description,
        icon: item.icon,
        xpReward: item.xpReward,
        criteriaType: item.criteriaType,
        criteriaConfig: item.criteriaConfig as Prisma.InputJsonValue,
      },
    });
  }
}

export async function getAchievements(userId: string): Promise<UserAchievementResponse[]> {
  const all = await prisma.achievement.findMany({
    where: { isActive: true },
    orderBy: { code: 'asc' },
  });
  
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
  });
  
  const unlockedMap = new Map(unlocked.map(ua => [ua.achievementId, ua.unlockedAt]));

  return all.map(item => {
    const isUnlocked = unlockedMap.has(item.id);
    return {
      code: item.code,
      name: item.name,
      description: item.description,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? unlockedMap.get(item.id)!.toISOString() : null,
      xpReward: item.xpReward,
    };
  });
}

export async function evaluateAchievements(userId: string, tx: Prisma.TransactionClient) {
  const completedTasksCount = await tx.taskCompletion.count({ where: { userId } });
  
  const perfectDaysCount = await tx.dailyStatistics.count({
    where: { userId, completionPercentage: 100, totalTasks: { gte: 1 } },
  });
  
  const userStreak = await tx.streak.findUnique({
    where: { userId },
  });
  const longestStreak = userStreak ? userStreak.longestStreak : 0;
  
  const achievements = await tx.achievement.findMany({ where: { isActive: true } });
  
  const unlocked = await tx.userAchievement.findMany({
    where: { userId },
  });
  const unlockedIds = new Set(unlocked.map((ua) => ua.achievementId));

  for (const ach of achievements) {
    if (unlockedIds.has(ach.id)) continue;

    let shouldUnlock = false;
    if (ach.code === 'FIRST_TASK') {
      shouldUnlock = completedTasksCount >= 1;
    } else if (ach.code === 'FIRST_PERFECT_DAY') {
      shouldUnlock = perfectDaysCount >= 1;
    } else if (ach.code === 'STREAK_7') {
      shouldUnlock = longestStreak >= 7;
    } else if (ach.code === 'STREAK_30') {
      shouldUnlock = longestStreak >= 30;
    } else if (ach.code === 'TASKS_100') {
      shouldUnlock = completedTasksCount >= 100;
    }

    if (shouldUnlock) {
      try {
        const ua = await tx.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
          },
        });

        await awardXP(
          userId,
          ach.xpReward,
          'ACHIEVEMENT_UNLOCKED',
          'ACHIEVEMENT',
          ua.id,
          `achievement:${ua.id}`,
          tx
        );

        await tx.activityLog.create({
          data: {
            userId,
            type: 'ACHIEVEMENT_UNLOCKED',
            entityType: 'ACHIEVEMENT',
            entityId: ach.id,
            metadata: {
              code: ach.code,
              name: ach.name,
              xpReward: ach.xpReward,
            },
          },
        });
      } catch (err) {
        // Handle unique constraint lock collision gracefully
        if (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2002') {
          // Already unlocked concurrently, do nothing
        } else {
          throw err;
        }
      }
    }
  }
}
