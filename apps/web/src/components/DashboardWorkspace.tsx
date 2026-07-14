import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Flame,
  Sparkles,
  CheckCircle2,
  ListTodo,
  Award,
  Smile,
  Trophy,
  ArrowRight,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { apiGet } from '../lib/api.js';
import type { DashboardResponseData } from '@ddt/shared';

interface DashboardWorkspaceProps {
  currentDate: string;
  timezone: string;
  todayStr: string;
  onNavigate: (view: 'dashboard' | 'planner' | 'analytics' | 'journal') => void;
}

const MOOD_EMOJIS: Record<string, string> = {
  AMAZING: '🤩',
  HAPPY: '😊',
  NORMAL: '😐',
  SAD: '😢',
  TIRED: '🥱',
};

export function DashboardWorkspace({ currentDate, onNavigate }: DashboardWorkspaceProps) {
  // Fetch dashboard aggregates from API
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', currentDate],
    queryFn: async () => {
      const res = await apiGet<DashboardResponseData>(`/dashboard/today?date=${currentDate}`);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: !!currentDate,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        <p className="text-sm text-zinc-400">Loading daily command center...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h3 className="text-lg font-semibold text-zinc-200">Failed to load Dashboard</h3>
        <p className="max-w-md text-sm text-rose-300">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
      </div>
    );
  }

  const { greeting, progress, streak, xp, mood, upcomingTasks, recentAchievements } = data;

  // Deriving XP level properties locally
  const level = Math.floor(xp.current / 100) + 1;
  const xpIntoCurrentLevel = xp.current % 100;
  const progressPercent = xpIntoCurrentLevel; // assuming 100 XP per level

  // Formatting date nicely
  const parsedDate = new Date(currentDate + 'T00:00:00');
  const formattedDate = parsedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // SVG parameters for circular progress ring
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (progress.completionPercentage / 100) * circumference;

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Hero section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/20 via-zinc-900 to-zinc-950 p-6 md:p-8"
      >
        <div className="absolute right-4 top-4 opacity-5">
          <Sparkles className="h-32 w-32 text-indigo-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            {greeting}, User
          </h1>
          <p className="text-sm font-medium text-zinc-400">{formattedDate}</p>
          <div className="mt-4 inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {progress.completionPercentage === 100
                ? "Outstanding! A perfect day completed!"
                : progress.completionPercentage >= 50
                  ? "More than halfway there! Great effort!"
                  : progress.completionPercentage > 0
                    ? "You're making progress. Keep going!"
                    : "Let's kickstart today's goals!"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* 2. Grid Dashboard Arrangement */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Progress Ring Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center"
        >
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Daily Progress</h3>
          <div className="relative flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="h-36 w-36 -rotate-90 transform">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-zinc-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-indigo-500 transition-all duration-500 ease-in-out"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{progress.completionPercentage}%</span>
              <span className="text-xxs uppercase tracking-wider text-zinc-500">completed</span>
            </div>
          </div>
          <p className="mt-4 text-sm font-medium text-zinc-300">
            {progress.completedTasks} of {progress.totalTasks} tasks completed
          </p>
          {progress.unfinishedTasks > 0 && (
            <p className="text-xs text-zinc-500">
              {progress.unfinishedTasks} remaining activities today
            </p>
          )}
        </motion.div>

        {/* Gamification Stats: Streak + XP */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Streak Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Streak</p>
                <h3 className="mt-1 text-3xl font-black text-white">{streak.current} Days</h3>
              </div>
              <div className="rounded-xl bg-amber-500/10 p-3 text-amber-500">
                <Flame className="h-7 w-7 fill-amber-500/20" />
              </div>
            </div>
            <div className="mt-4 text-xs text-zinc-500">
              Longest recorded streak: <span className="font-semibold text-zinc-300">{streak.longest} days</span>
            </div>
          </div>

          {/* XP & Level Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-zinc-400">Current Level</p>
                <h3 className="mt-1 text-3xl font-black text-white">Level {level}</h3>
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-500">
                <Trophy className="h-7 w-7" />
              </div>
            </div>
            {/* XP progress bar */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xxs font-bold text-zinc-500">
                <span>{xpIntoCurrentLevel} / 100 XP</span>
                <span>{xp.current} Total XP</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Mood preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Daily Mood</h3>
            {mood ? (
              <div className="flex items-center space-x-3 rounded-xl border border-indigo-500/10 bg-indigo-500/5 p-4">
                <span className="text-3xl" role="img" aria-label={mood.mood || 'mood'}>
                  {mood.mood ? MOOD_EMOJIS[mood.mood] : '😐'}
                </span>
                <div>
                  <h4 className="font-bold text-white">
                    {mood.mood ? mood.mood.charAt(0) + mood.mood.slice(1).toLowerCase() : 'Normal'}
                  </h4>
                  <p className="text-xs text-zinc-400">Mood logged for resolved date</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-6 text-center">
                <Smile className="mb-2 h-8 w-8 text-zinc-500" />
                <p className="text-xs text-zinc-400">Not checked in today</p>
              </div>
            )}
          </div>
          <button
            onClick={() => onNavigate('journal')}
            className="mt-6 inline-flex items-center justify-center space-x-2 rounded-xl bg-zinc-800 py-2.5 text-xs font-semibold text-zinc-200 transition hover:bg-zinc-700"
          >
            <span>Log reflections & mood</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      </div>

      {/* 3. Schedules & Recent Achievements row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Next activity / Upcoming task queue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Upcoming Tasks</h3>
            <button
              onClick={() => onNavigate('planner')}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
            >
              <span>Planner view</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {upcomingTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3"
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="h-4.5 w-4.5 text-zinc-500" />
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">{t.title}</h4>
                      {t.scheduledAt && (
                        <div className="flex items-center space-x-1 text-xxs text-zinc-500">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(t.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-8 text-center">
              <ListTodo className="mb-2 h-8 w-8 text-zinc-600" />
              <p className="text-xs text-zinc-400">No upcoming tasks scheduled</p>
              <button
                onClick={() => onNavigate('planner')}
                className="mt-2 text-xs font-semibold text-indigo-400 underline"
              >
                Create standard task planner
              </button>
            </div>
          )}
        </motion.div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-zinc-400">Recent Achievements</h3>
          {recentAchievements.length > 0 ? (
            <div className="space-y-3">
              {recentAchievements.map((ua) => (
                <div
                  key={ua.id}
                  className="flex items-center space-x-3 rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-3"
                >
                  <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                    <Award className="h-5.5 w-5.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-zinc-200 truncate">
                      {ua.achievement.name}
                    </h4>
                    <p className="text-xxs text-zinc-500 truncate">{ua.achievement.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400">+{ua.achievement.xpReward} XP</span>
                    <p className="text-xxs text-zinc-500">
                      {new Date(ua.unlockedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-8 text-center">
              <Award className="mb-2 h-8 w-8 text-zinc-600" />
              <p className="text-xs text-zinc-400">No achievements unlocked yet</p>
              <p className="max-w-[200px] text-xxs text-zinc-500">
                Complete daily tasks to unlock your first milestone badge!
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
