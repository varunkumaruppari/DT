import { z } from 'zod';
import { plannerDateSchema } from './planner.js';
import type { TaskResponse } from './task.js';

export const dashboardQuerySchema = z.object({
  date: plannerDateSchema.optional(),
}).strict();

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>;

export interface DashboardProgress {
  totalTasks: number;
  completedTasks: number;
  unfinishedTasks: number;
  completionPercentage: number;
  notDonePercentage: number;
}

export interface DashboardStreak {
  current: number;
  longest: number;
}

export interface DashboardXP {
  current: number;
}

export interface DashboardMood {
  mood: string | null;
}

export interface DashboardRecentAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: string;
  achievement: {
    id: string;
    code: string;
    name: string;
    description: string;
    xpReward: number;
    icon: string;
  };
}

export interface DashboardResponseData {
  date: string;
  greeting: string;
  progress: DashboardProgress;
  streak: DashboardStreak;
  xp: DashboardXP;
  mood: DashboardMood | null;
  upcomingTasks: TaskResponse[];
  recentAchievements: DashboardRecentAchievement[];
}
