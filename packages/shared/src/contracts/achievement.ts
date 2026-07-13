export interface UserAchievementResponse {
  code: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt: string | null;
  xpReward: number;
}

export interface AchievementsListResponse {
  achievements: UserAchievementResponse[];
}
