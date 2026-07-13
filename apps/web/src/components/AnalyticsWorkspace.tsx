import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  Award,
  Zap,
  BarChart2,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { apiGet } from '../lib/api.js';
import type {
  DailyAnalyticsResponse,
  WeeklyAnalyticsResponse,
  MonthlyAnalyticsResponse,
  YearlyAnalyticsResponse,
  XpSummaryResponse,
  XpHistoryResponse,
  StreakResponse,
  AchievementsListResponse,
  ActivityHistoryResponse,
} from '@ddt/shared';
import { Button } from './ui/Button.js';

type AnalyticsWorkspaceProps = Record<string, never>;

export function AnalyticsWorkspace({}: AnalyticsWorkspaceProps) {
  // Sub-tabs: 'overview' | 'achievements' | 'activity'
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'achievements' | 'activity'>('overview');
  
  // Analytics sub-periods: 'daily' | 'weekly' | 'monthly' | 'yearly'
  const [analyticsPeriod, setAnalyticsPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('weekly');

  // Dates state
  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0]!;
  };
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  // Query Gamification States
  const xpSummaryQuery = useQuery({
    queryKey: ['xp-summary'],
    queryFn: async () => {
      const res = await apiGet<XpSummaryResponse>('/xp');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const xpHistoryQuery = useQuery({
    queryKey: ['xp-history'],
    queryFn: async () => {
      const res = await apiGet<XpHistoryResponse>('/xp/history?limit=10');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const streakQuery = useQuery({
    queryKey: ['streak-summary'],
    queryFn: async () => {
      const res = await apiGet<StreakResponse>('/streak');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const achievementsQuery = useQuery({
    queryKey: ['achievements-list'],
    queryFn: async () => {
      const res = await apiGet<AchievementsListResponse>('/achievements');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const activityQuery = useQuery({
    queryKey: ['activity-history'],
    queryFn: async () => {
      const res = await apiGet<ActivityHistoryResponse>('/activity?limit=15');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  // Query Analytics States
  const dailyAnalyticsQuery = useQuery({
    queryKey: ['analytics-daily', selectedDate],
    queryFn: async () => {
      const res = await apiGet<DailyAnalyticsResponse>(`/analytics/daily?date=${selectedDate}`);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: analyticsPeriod === 'daily',
  });

  const weeklyAnalyticsQuery = useQuery({
    queryKey: ['analytics-weekly', selectedDate],
    queryFn: async () => {
      const res = await apiGet<WeeklyAnalyticsResponse>(`/analytics/weekly?date=${selectedDate}`);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: analyticsPeriod === 'weekly',
  });

  const monthlyAnalyticsQuery = useQuery({
    queryKey: ['analytics-monthly', selectedYear, selectedMonth],
    queryFn: async () => {
      const res = await apiGet<MonthlyAnalyticsResponse>(`/analytics/monthly?year=${selectedYear}&month=${selectedMonth}`);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: analyticsPeriod === 'monthly',
  });

  const yearlyAnalyticsQuery = useQuery({
    queryKey: ['analytics-yearly', selectedYear],
    queryFn: async () => {
      const res = await apiGet<YearlyAnalyticsResponse>(`/analytics/yearly?year=${selectedYear}`);
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    enabled: analyticsPeriod === 'yearly',
  });

  // Date handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]!);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]!);
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      {/* Gamification Core Stats Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Streak Flame Card */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex items-center gap-5 relative overflow-hidden group">
          <div className="absolute right-[-10px] bottom-[-15px] opacity-5 text-warning transition-transform duration-300 group-hover:scale-110">
            <Flame className="w-32 h-32" />
          </div>
          <div className="h-12 w-12 rounded-xl bg-warning/10 border border-warning/20 flex items-center justify-center text-warning shrink-0">
            <Flame className="w-6 h-6 fill-warning" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Streak</span>
            <h4 className="text-heading-2 font-bold text-foreground">
              {streakQuery.data?.currentStreak ?? 0} <span className="text-sm font-semibold text-muted-foreground">days</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              Longest: <strong className="text-foreground">{streakQuery.data?.longestStreak ?? 0} days</strong>
            </p>
          </div>
        </div>

        {/* XP Level Card */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col gap-4 md:col-span-2 relative overflow-hidden group">
          <div className="flex items-center gap-5">
            <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Zap className="w-6 h-6 fill-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">User Level</span>
                  <h4 className="text-heading-2 font-bold text-foreground">
                    Level {xpSummaryQuery.data?.level ?? 1}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total XP</span>
                  <p className="text-sm font-bold text-foreground">
                    {xpSummaryQuery.data?.totalXP ?? 0} XP
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>{xpSummaryQuery.data?.xpIntoCurrentLevel ?? 0} / 100 XP</span>
              <span>{xpSummaryQuery.data?.levelProgressPercentage ?? 0}% completed</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${xpSummaryQuery.data?.levelProgressPercentage ?? 0}%` }}
              />
            </div>
          </div>
          
          {/* Recent XP Gains */}
          {xpHistoryQuery.data?.items && xpHistoryQuery.data.items.length > 0 && (
            <div className="flex gap-2 items-center flex-wrap mt-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Recent Gains:</span>
              {xpHistoryQuery.data.items.slice(0, 3).map((item) => (
                <span
                  key={item.id}
                  className="text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded"
                >
                  +{item.amount} XP ({item.reason === 'TASK_COMPLETED' ? 'Task Done' : item.reason === 'STREAK_MILESTONE' ? 'Streak Reward' : item.reason})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-border gap-6">
        <button
          type="button"
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeSubTab === 'overview'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart2 className="w-4 h-4 inline mr-1.5" />
          Productivity Analytics
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('achievements')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeSubTab === 'achievements'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="w-4 h-4 inline mr-1.5" />
          Achievements
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('activity')}
          className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
            activeSubTab === 'activity'
              ? 'border-primary text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-1.5" />
          Activity Feed
        </button>
      </div>

      {/* Overview Analytics Subtab */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          {/* Period Selector & Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card border border-border p-4 rounded-xl shadow-sm">
            <div className="flex gap-2.5 border border-border p-1 rounded-lg bg-secondary/30">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAnalyticsPeriod(p)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider transition-colors ${
                    analyticsPeriod === p
                      ? 'bg-card border border-border shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Navigational Controls */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={
                analyticsPeriod === 'daily' || analyticsPeriod === 'weekly' ? handlePrevDay :
                analyticsPeriod === 'monthly' ? handlePrevMonth :
                () => setSelectedYear(selectedYear - 1)
              }>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm font-bold text-foreground">
                {analyticsPeriod === 'daily' && `Date: ${selectedDate}`}
                {analyticsPeriod === 'weekly' && `Week of: ${selectedDate}`}
                {analyticsPeriod === 'monthly' && `${monthNames[selectedMonth - 1]} ${selectedYear}`}
                {analyticsPeriod === 'yearly' && `Year: ${selectedYear}`}
              </span>
              <Button variant="ghost" size="sm" onClick={
                analyticsPeriod === 'daily' || analyticsPeriod === 'weekly' ? handleNextDay :
                analyticsPeriod === 'monthly' ? handleNextMonth :
                () => setSelectedYear(selectedYear + 1)
              }>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Loader or Error checks */}
          {(analyticsPeriod === 'daily' && dailyAnalyticsQuery.isLoading) ||
          (analyticsPeriod === 'weekly' && weeklyAnalyticsQuery.isLoading) ||
          (analyticsPeriod === 'monthly' && monthlyAnalyticsQuery.isLoading) ||
          (analyticsPeriod === 'yearly' && yearlyAnalyticsQuery.isLoading) ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-card border border-border rounded-2xl shadow-sm">
              <Clock className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground font-semibold">Recalculating statistics...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Stats highlights card */}
              <div className="md:col-span-1 space-y-4">
                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Metrics Highlights</h4>
                  
                  {(() => {
                    let total = 0, completed = 0, pct = 0, xp = 0;
                    if (analyticsPeriod === 'daily' && dailyAnalyticsQuery.data) {
                      const d = dailyAnalyticsQuery.data;
                      total = d.totalTasks;
                      completed = d.completedTasks;
                      pct = d.completionPercentage;
                      xp = d.xpEarned;
                    } else if (analyticsPeriod === 'weekly' && weeklyAnalyticsQuery.data) {
                      const w = weeklyAnalyticsQuery.data;
                      total = w.days.reduce((acc, x) => acc + x.totalTasks, 0);
                      completed = w.days.reduce((acc, x) => acc + x.completedTasks, 0);
                      pct = total === 0 ? 0 : Math.round((completed / total) * 100);
                      xp = w.days.reduce((acc, x) => acc + x.xpEarned, 0);
                    } else if (analyticsPeriod === 'monthly' && monthlyAnalyticsQuery.data) {
                      const m = monthlyAnalyticsQuery.data;
                      total = m.totalTasks;
                      completed = m.completedTasks;
                      pct = m.completionPercentage;
                      xp = m.xpEarned;
                    } else if (analyticsPeriod === 'yearly' && yearlyAnalyticsQuery.data) {
                      const y = yearlyAnalyticsQuery.data;
                      total = y.totalTasks;
                      completed = y.completedTasks;
                      pct = y.completionPercentage;
                      xp = y.xpEarned;
                    }

                    return (
                      <div className="space-y-4">
                        <div className="border-b border-border pb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Total Tasks</span>
                          <strong className="text-sm text-foreground">{total}</strong>
                        </div>
                        <div className="border-b border-border pb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Completed Tasks</span>
                          <strong className="text-sm text-success">{completed}</strong>
                        </div>
                        <div className="border-b border-border pb-3 flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">Average Completion</span>
                          <strong className="text-sm text-primary">{pct}%</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-muted-foreground">XP Accumulated</span>
                          <strong className="text-sm text-warning">{xp} XP</strong>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Graphic View Card */}
              <div className="md:col-span-2 bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Productivity Velocity Graph
                </h4>

                {analyticsPeriod === 'weekly' && weeklyAnalyticsQuery.data ? (
                  <div className="flex-1 flex flex-col justify-end space-y-4">
                    {/* SVG/CSS Weekly Bar Graph */}
                    <div className="grid grid-cols-7 gap-3 h-48 items-end border-b border-border pb-2">
                      {weeklyAnalyticsQuery.data.days.map(d => {
                        const dayName = new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <div key={d.date} className="flex flex-col items-center gap-2 group relative">
                            {/* Tooltip */}
                            <div className="absolute top-[-35px] bg-foreground text-background text-[10px] font-bold px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                              {d.completedTasks}/{d.totalTasks} Done ({d.completionPercentage}%)
                            </div>
                            {/* Bar container */}
                            <div className="w-full bg-secondary/50 rounded-t-lg h-36 flex flex-col justify-end overflow-hidden border border-border">
                              <div
                                className="bg-primary rounded-t-md transition-all duration-300 group-hover:bg-primary-hover"
                                style={{ height: `${d.completionPercentage}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{dayName}</span>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      Hover over columns to see task completion fractions.
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center py-20 text-center text-muted-foreground">
                    <p className="text-xs">
                      Graphical history is optimized for Weekly intervals. Daily, Monthly, and Yearly aggregates are represented in the highlights panel.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Achievements Subtab */}
      {activeSubTab === 'achievements' && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Monotonic Master Achievements</h4>
          
          {achievementsQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Clock className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievementsQuery.data?.achievements.map(ach => (
                <div
                  key={ach.code}
                  className={`border p-4 rounded-xl flex items-center gap-4 transition-all duration-200 ${
                    ach.unlocked
                      ? 'bg-success/5 border-success/30'
                      : 'bg-secondary/10 border-border opacity-60'
                  }`}
                >
                  <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 border ${
                    ach.unlocked
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-muted border-border text-muted-foreground'
                  }`}>
                    {ach.code === 'FIRST_TASK' && <CheckCircle2 className="w-5 h-5" />}
                    {ach.code === 'FIRST_PERFECT_DAY' && <Award className="w-5 h-5" />}
                    {ach.code === 'STREAK_7' && <Flame className="w-5 h-5" />}
                    {ach.code === 'STREAK_30' && <Flame className="w-5 h-5" />}
                    {ach.code === 'TASKS_100' && <Award className="w-5 h-5" />}
                    {ach.code === 'FIRST_JOURNAL' && <HelpCircle className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h5 className="text-sm font-bold text-foreground">{ach.name}</h5>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/10 text-warning border border-warning/20">
                        +{ach.xpReward} XP
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{ach.description}</p>
                    {ach.unlocked && ach.unlockedAt ? (
                      <p className="text-[10px] font-bold text-success">
                        Unlocked on {new Date(ach.unlockedAt).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-[10px] font-bold text-muted-foreground">Locked</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Feed Subtab */}
      {activeSubTab === 'activity' && (
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Consistency Log History</h4>

          {activityQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Clock className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !activityQuery.data?.items.length ? (
            <p className="text-xs text-muted-foreground text-center py-10">
              No activity logs recorded yet. Start working on your planner tasks to build history!
            </p>
          ) : (
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {activityQuery.data.items.map(log => {
                const date = new Date(log.occurredAt).toLocaleString();
                return (
                  <div key={log.id} className="flex gap-3 border-l-2 border-primary/20 pl-4 py-1 relative">
                    {/* Visual dot indicator */}
                    <div className="absolute left-[-5px] top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                    
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <strong className="text-xs text-foreground font-semibold">
                          {log.type === 'TASK_COMPLETED' && `Completed task: "${log.metadata?.title || 'Unknown Task'}"`}
                          {log.type === 'ACHIEVEMENT_UNLOCKED' && `Unlocked Achievement: ${log.metadata?.name || log.entityId}`}
                          {log.type !== 'TASK_COMPLETED' && log.type !== 'ACHIEVEMENT_UNLOCKED' && log.type}
                        </strong>
                        <span className="text-[10px] text-muted-foreground">{date}</span>
                      </div>
                      {log.type === 'ACHIEVEMENT_UNLOCKED' && (
                        <p className="text-[10px] text-success font-semibold">
                          Earned reward: +{log.metadata?.xpReward} XP!
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
