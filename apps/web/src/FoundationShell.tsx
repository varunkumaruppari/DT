import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Loader2,
  Zap,
  LogOut,
  User,
  Settings,
  Calendar,
  Save,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Tag,
  Folder,
  AlertCircle,
  Clock,
  Briefcase,
} from 'lucide-react';
import { useTheme, type ThemeMode } from './contexts/ThemeContext.js';
import { useAuth } from './contexts/AuthContext.js';
import { apiGet, apiPost, apiPatch, apiDelete } from './lib/api.js';
import { Button } from './components/ui/Button.js';
import { PRODUCT_NAME } from '@ddt/shared';
import { RecurringTaskDialog } from './components/RecurringTaskDialog.js';
import { NotificationPermissionBanner, requestAndRegisterPush } from './components/NotificationPermissionPrompt.js';
import { AnalyticsWorkspace } from './components/AnalyticsWorkspace.js';
import { JournalWorkspace } from './components/JournalWorkspace.js';
import { DashboardWorkspace } from './components/DashboardWorkspace.js';

import type {
  UserSettingsResponse,
  UpdateSettingsRequest,
  PlannerResponse,
  CategoryResponse,
  TaskResponse,
  CategoryCreateRequest,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskReorderRequest,
} from '@ddt/shared';

// ============================================================
// Timezone Helpers
// ============================================================

function getTodayInTz(timezone: string): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(Date.now());
    const getPart = (type: string) => parts.find((p) => p.type === type)!.value;
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  } catch {
    // Fallback to UTC date
    return new Date().toISOString().split('T')[0]!;
  }
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().split('T')[0]!;
}

function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year!, month! - 1, day!));
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

function formatScheduledTime(
  scheduledAtStr: string | null,
  timezone: string,
  timeFormat: '12_HOUR' | '24_HOUR'
): string {
  if (!scheduledAtStr) return '';
  try {
    const date = new Date(scheduledAtStr);
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: timeFormat === '12_HOUR',
    });
  } catch {
    return '';
  }
}

const APPROVED_COLORS = [
  { value: 'violet', label: 'Violet', bg: 'bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 border-violet-500/30' },
  { value: 'cyan', label: 'Cyan', bg: 'bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-cyan-500/30' },
  { value: 'emerald', label: 'Emerald', bg: 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/30' },
  { value: 'rose', label: 'Rose', bg: 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/30' },
  { value: 'amber', label: 'Amber', bg: 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/30' },
  { value: 'sky', label: 'Sky', bg: 'bg-sky-500/10 text-sky-500 hover:bg-sky-500/20 border-sky-500/30' },
];

const APPROVED_ICONS = [
  { value: 'tag', label: 'Tag' },
  { value: 'code', label: 'Coding' },
  { value: 'briefcase', label: 'Work' },
  { value: 'book', label: 'Study' },
  { value: 'activity', label: 'Fitness' },
  { value: 'user', label: 'Personal' },
];

function CategoryIcon({ name }: { name: string }) {
  switch (name) {
    case 'code':
      return <Zap className="w-3.5 h-3.5" />;
    case 'briefcase':
      return <Briefcase className="w-3.5 h-3.5" />;
    case 'book':
      return <Folder className="w-3.5 h-3.5" />;
    case 'activity':
      return <Activity className="w-3.5 h-3.5" />;
    case 'user':
      return <User className="w-3.5 h-3.5" />;
    default:
      return <Tag className="w-3.5 h-3.5" />;
  }
}

// Local helper to derive progress on task list
function deriveProgress(tasks: TaskResponse[]) {
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

export function FoundationShell() {
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState<'dashboard' | 'planner' | 'analytics' | 'journal'>('dashboard');

  // Settings Queries
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiGet<{ settings: UserSettingsResponse }>('/settings');
      if (!res.success) throw new Error(res.message);
      return res.data.settings;
    },
  });

  const timezone = settingsQuery.data?.timezone || 'UTC';
  const timeFormat = settingsQuery.data?.timeFormat || '12_HOUR';

  // Date State
  const [currentDate, setCurrentDate] = useState<string>('');

  // Set initial date when timezone is loaded
  useEffect(() => {
    if (timezone && !currentDate) {
      setCurrentDate(getTodayInTz(timezone));
    }
  }, [timezone, currentDate]);

  // Queries for current planner
  const plannerQuery = useQuery({
    queryKey: ['planners', currentDate],
    queryFn: async () => {
      if (!currentDate) return null;
      const res = await apiGet<{ planner: PlannerResponse & { progress: { totalTasks: number; completedTasks: number; unfinishedTasks: number; completionPercentage: number; notDonePercentage: number } } }>(`/planners/${currentDate}`);
      if (!res.success) throw new Error(res.message);
      return res.data.planner;
    },
    enabled: !!currentDate,
    retry: false, // Don't retry since 404 is a valid PLANNER_NOT_FOUND state
  });

  const isPlannerNotFound =
    plannerQuery.error &&
    (plannerQuery.error as { response?: { data?: { code?: string } } }).response?.data?.code === 'PLANNER_NOT_FOUND';

  // Categories query
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await apiGet<{ categories: CategoryResponse[] }>('/categories');
      if (!res.success) throw new Error(res.message);
      return res.data.categories;
    },
  });

  // ============================================================
  // Settings Mutation & State
  // ============================================================
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRecurringTaskModal, setShowRecurringTaskModal] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<'LIGHT' | 'DARK' | 'SYSTEM'>('SYSTEM');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(3);
  const [settingsTz, setSettingsTz] = useState('UTC');
  const [weekStartsOn, setWeekStartsOn] = useState<'MONDAY' | 'SUNDAY'>('MONDAY');
  const [settingsTimeFormat, setSettingsTimeFormat] = useState<'12_HOUR' | '24_HOUR'>('12_HOUR');
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  useEffect(() => {
    if (settingsQuery.data) {
      const s = settingsQuery.data;
      setSelectedTheme(s.theme);
      setNotificationsEnabled(s.notificationsEnabled);
      setReminderMinutes(s.defaultReminderMinutes);
      setSettingsTz(s.timezone || 'UTC');
      setWeekStartsOn(s.weekStartsOn === 'SUNDAY' ? 'SUNDAY' : 'MONDAY');
      setSettingsTimeFormat(s.timeFormat);
    }
  }, [settingsQuery.data]);

  const settingsMutation = useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const res = await apiPatch<UpdateSettingsRequest, { settings: UserSettingsResponse }>('/settings', data);
      if (!res.success) throw new Error(res.message);
      return res.data.settings;
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
      if (updatedSettings.theme) {
        setTheme(updatedSettings.theme.toLowerCase() as ThemeMode);
      }
      setSettingsSaveSuccess(true);
      setTimeout(() => setSettingsSaveSuccess(false), 3000);
    },
  });

  const handleSaveSettings = async () => {
    try {
      let enableNotifications = notificationsEnabled;
      if (notificationsEnabled && settingsQuery.data?.notificationsEnabled !== true) {
        const success = await requestAndRegisterPush();
        if (!success) {
          alert('Could not enable push notifications. Please ensure notification permissions are allowed in your browser.');
          enableNotifications = false;
          setNotificationsEnabled(false);
        }
      }
      await settingsMutation.mutateAsync({
        theme: selectedTheme,
        notificationsEnabled: enableNotifications,
        defaultReminderMinutes: reminderMinutes,
        timezone: settingsTz,
        weekStartsOn,
        timeFormat: settingsTimeFormat,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // ============================================================
  // Planner Creation Mutation
  // ============================================================
  const createPlannerMutation = useMutation({
    mutationFn: async (date: string) => {
      const res = await apiPost<{ plannerDate: string }, { planner: PlannerResponse }>('/planners', {
        plannerDate: date,
      });
      if (!res.success) throw new Error(res.message);
      return res.data.planner;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners', currentDate] });
    },
  });

  // ============================================================
  // Task Mutations
  // ============================================================
  const [quickTitle, setQuickTitle] = useState('');
  const [quickTime, setQuickTime] = useState('');
  const [quickCategory, setQuickCategory] = useState('');
  const [quickPriority, setQuickPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [showQuickOptions, setShowQuickOptions] = useState(false);

  const createTaskMutation = useMutation({
    mutationFn: async (data: TaskCreateRequest) => {
      const res = await apiPost<TaskCreateRequest, { task: TaskResponse }>('/tasks', data);
      if (!res.success) throw new Error(res.message);
      return res.data.task;
    },
    onSuccess: () => {
      setQuickTitle('');
      setQuickTime('');
      setQuickCategory('');
      setQuickPriority('MEDIUM');
      setShowQuickOptions(false);
      queryClient.invalidateQueries({ queryKey: ['planners', currentDate] });
    },
    onError: (err: unknown) => {
      alert('Failed to create task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || !plannerQuery.data) return;

    createTaskMutation.mutate({
      plannerId: plannerQuery.data.id,
      title: quickTitle,
      scheduledTime: quickTime || null,
      categoryId: quickCategory || null,
      priority: quickPriority,
    });
  };

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiPost<{ completionMethod: string }, { taskCompletion: { id: string; taskId: string; userId: string; completedAt: string; completionMethod: 'APP'; createdAt: string }; progress: { totalTasks: number; completedTasks: number; unfinishedTasks: number; completionPercentage: number; notDonePercentage: number } }>(
        `/tasks/${taskId}/complete`,
        { completionMethod: 'APP' }
      );
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners', currentDate] });
    },
    onError: (err: unknown) => {
      alert('Failed to complete task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  const skipTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiPost<Record<string, never>, { task: TaskResponse }>(`/tasks/${taskId}/skip`, {});
      if (!res.success) throw new Error(res.message);
      return res.data.task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners', currentDate] });
    },
    onError: (err: unknown) => {
      alert('Failed to skip task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const res = await apiDelete<unknown>(`/tasks/${taskId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planners', currentDate] });
    },
    onError: (err: unknown) => {
      alert('Failed to delete task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  // Reorder Mutation (Optimistic Update)
  const reorderMutation = useMutation({
    mutationFn: async (payload: TaskReorderRequest) => {
      const res = await apiPatch<TaskReorderRequest, { tasks: TaskResponse[] }>('/tasks/reorder', payload);
      if (!res.success) throw new Error(res.message);
      return res.data.tasks;
    },
    onMutate: async (newOrder) => {
      await queryClient.cancelQueries({ queryKey: ['planners', currentDate] });
      const previousPlanner = queryClient.getQueryData(['planners', currentDate]);

      if (previousPlanner) {
        const casted = previousPlanner as PlannerResponse & { tasks: TaskResponse[] };
        const newTasks = [...(casted.tasks || [])];

        newTasks.forEach((t) => {
          const item = newOrder.tasks.find((ot) => ot.taskId === t.id);
          if (item) {
            t.position = item.position;
          }
        });

        newTasks.sort((a, b) => a.position - b.position);

        queryClient.setQueryData(['planners', currentDate], {
          ...casted,
          tasks: newTasks,
          progress: deriveProgress(newTasks),
        });
      }

      return { previousPlanner };
    },
    onError: (err, _newOrder, context) => {
      if (context?.previousPlanner) {
        queryClient.setQueryData(['planners', currentDate], context.previousPlanner);
      }
      alert('Failed to reorder tasks: ' + err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['planners', currentDate] });
    },
  });

  const handleMove = (taskId: string, direction: 'UP' | 'DOWN') => {
    if (!plannerQuery.data) return;
    const currentTasks = [...(plannerQuery.data.tasks || [])];
    const index = currentTasks.findIndex((t) => t.id === taskId);
    if (index === -1) return;

    if (direction === 'UP' && index > 0) {
      const temp = currentTasks[index]!;
      currentTasks[index] = currentTasks[index - 1]!;
      currentTasks[index - 1] = temp;
    } else if (direction === 'DOWN' && index < currentTasks.length - 1) {
      const temp = currentTasks[index]!;
      currentTasks[index] = currentTasks[index + 1]!;
      currentTasks[index + 1] = temp;
    } else {
      return;
    }

    const payloadTasks = currentTasks.map((t, idx) => ({
      taskId: t.id,
      position: idx,
    }));

    reorderMutation.mutate({
      plannerId: plannerQuery.data.id,
      tasks: payloadTasks,
    });
  };

  // ============================================================
  // Task Editing Modal & State
  // ============================================================
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editPriority, setEditPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  const openEditModal = (task: TaskResponse) => {
    setEditingTask(task);
    setEditTitle(task.title);
    // Parse HH:mm from UTC scheduledAt
    if (task.scheduledAt) {
      const date = new Date(task.scheduledAt);
      const hrs = String(date.getUTCHours()).padStart(2, '0');
      const mins = String(date.getUTCMinutes()).padStart(2, '0');
      // Wait, scheduledAt might have timezone offset. Let's format it relative to user's settings timezone:
      try {
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const parts = formatter.formatToParts(date);
        const hour = parts.find((p) => p.type === 'hour')!.value;
        const minute = parts.find((p) => p.type === 'minute')!.value;
        setEditTime(`${hour}:${minute}`);
      } catch {
        setEditTime(`${hrs}:${mins}`);
      }
    } else {
      setEditTime('');
    }
    setEditCategory(task.categoryId || '');
    setEditPriority(task.priority);
  };

  const updateTaskMutation = useMutation({
    mutationFn: async (data: { id: string; payload: TaskUpdateRequest }) => {
      const res = await apiPatch<TaskUpdateRequest, { task: TaskResponse }>(`/tasks/${data.id}`, data.payload);
      if (!res.success) throw new Error(res.message);
      return res.data.task;
    },
    onSuccess: () => {
      setEditingTask(null);
      queryClient.invalidateQueries({ queryKey: ['planners', currentDate] });
    },
    onError: (err: unknown) => {
      alert('Failed to update task: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  const handleUpdateTask = async () => {
    if (!editingTask) return;
    updateTaskMutation.mutate({
      id: editingTask.id,
      payload: {
        title: editTitle,
        scheduledTime: editTime || null,
        categoryId: editCategory || null,
        priority: editPriority,
      },
    });
  };

  // ============================================================
  // Category Modal & State
  // ============================================================
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState<string>('violet');
  const [newCatIcon, setNewCatIcon] = useState('tag');
  const [categoryConflictError, setCategoryConflictError] = useState('');

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryCreateRequest) => {
      setCategoryConflictError('');
      const res = await apiPost<CategoryCreateRequest, { category: CategoryResponse }>('/categories', data);
      if (!res.success) throw new Error(res.message);
      return res.data.category;
    },
    onSuccess: () => {
      setNewCatName('');
      setNewCatColor('violet');
      setNewCatIcon('tag');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: unknown) => {
      const axiosError = err as { response?: { data?: { code?: string } }; message?: string };
      if (axiosError.response?.data?.code === 'CATEGORY_ALREADY_EXISTS') {
        setCategoryConflictError('A category with this name already exists.');
      } else {
        alert('Failed to create category: ' + (axiosError.message || String(err)));
      }
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (catId: string) => {
      await apiDelete<unknown>(`/categories/${catId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err: unknown) => {
      alert('Failed to delete category: ' + (err instanceof Error ? err.message : String(err)));
    },
  });

  // Render variables
  const activePlanner = plannerQuery.data;
  const tasks = activePlanner?.tasks || [];
  const activeCategories = categoriesQuery.data || [];
  const completionPercentage = activePlanner?.progress?.completionPercentage || 0;
  const totalTasks = activePlanner?.progress?.totalTasks || 0;
  const completedTasks = activePlanner?.progress?.completedTasks || 0;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-200 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Zap className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <div>
              <span className="font-bold text-sm text-foreground tracking-wide">{PRODUCT_NAME}</span>
              <p className="text-[10px] uppercase font-semibold text-primary tracking-wider">
                Daily Planning
              </p>
            </div>
          </div>

          {/* Planner/Analytics Toggle */}
          <div className="flex gap-2.5 border border-border p-1 rounded-xl bg-secondary/30">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                activeView === 'dashboard'
                  ? 'bg-card border border-border shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('planner')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                activeView === 'planner'
                  ? 'bg-card border border-border shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Planner
            </button>
            <button
              onClick={() => setActiveView('journal')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                activeView === 'journal'
                  ? 'bg-card border border-border shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Journal
            </button>
            <button
              onClick={() => setActiveView('analytics')}
              className={`text-xs font-bold px-3.5 py-1.5 rounded-lg uppercase tracking-wider transition-colors ${
                activeView === 'analytics'
                  ? 'bg-card border border-border shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Analytics
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-muted-foreground font-medium">
              Signed in as: <strong className="text-foreground">{user?.displayName}</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={() => setShowRecurringTaskModal(true)}>
              <Calendar className="h-4 w-4 mr-1.5" />
              Recurring Tasks
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSettingsModal(true)}>
              <Settings className="h-4 w-4 mr-1.5" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        {activeView === 'analytics' ? (
          <AnalyticsWorkspace />
        ) : activeView === 'journal' ? (
          <JournalWorkspace
            currentDate={currentDate}
            timezone={timezone}
            todayStr={getTodayInTz(timezone)}
          />
        ) : activeView === 'dashboard' ? (
          <DashboardWorkspace
            currentDate={currentDate}
            timezone={timezone}
            todayStr={getTodayInTz(timezone)}
            onNavigate={(view) => setActiveView(view)}
          />
        ) : (
          <>
            {/* Date Selector & Navigation */}
            <div className="flex items-center justify-between bg-card border border-border p-4 rounded-xl shadow-sm">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => currentDate && setCurrentDate(addDays(currentDate, -1))}
                disabled={!currentDate}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Prev
              </Button>

              <div className="text-center">
                <h2 className="text-heading-3 md:text-heading-2 font-bold text-foreground flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {currentDate ? formatDisplayDate(currentDate) : 'Loading...'}
                </h2>
                {currentDate === getTodayInTz(timezone) && (
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">
                    Today
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentDate(getTodayInTz(timezone))}
                  disabled={currentDate === getTodayInTz(timezone)}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => currentDate && setCurrentDate(addDays(currentDate, 1))}
                  disabled={!currentDate}
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </Button>
              </div>
            </div>

            {/* Loading Spinner */}
            {plannerQuery.isLoading && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground font-medium">Retrieving your schedule...</p>
              </div>
            )}

            {/* Planner Not Found (Start Day State) */}
            {!plannerQuery.isLoading && isPlannerNotFound && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center py-16 bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6"
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Calendar className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-2">
                  <h3 className="text-heading-2 font-bold text-foreground">No planner for this date</h3>
                  <p className="text-sm text-muted-foreground">
                    You haven't started a planner for this date yet. Create it now to begin scheduling your tasks and tracking your momentum.
                  </p>
                </div>
                <Button
                  variant="primary"
                  onClick={() => currentDate && createPlannerMutation.mutate(currentDate)}
                  disabled={createPlannerMutation.isPending}
                >
                  {createPlannerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Planner...
                    </>
                  ) : (
                    'Start Daily Planner'
                  )}
                </Button>
              </motion.div>
            )}

            {/* Active Planner Workspace */}
            {!plannerQuery.isLoading && activePlanner && (
              <div className="space-y-6">
                <NotificationPermissionBanner
                  settingsEnabled={settingsQuery.data?.notificationsEnabled || false}
                  onPermissionGranted={() => queryClient.invalidateQueries({ queryKey: ['settings'] })}
                />

                {/* Dynamic Progress & Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-card border border-border p-6 rounded-2xl shadow-sm">
                  <div className="flex flex-col justify-center space-y-2 md:col-span-2">
                    <h3 className="text-heading-3 font-semibold text-foreground">Daily Momentum</h3>
                    <p className="text-sm text-muted-foreground">
                      {totalTasks === 0
                        ? 'No tasks planned for today. Add activities using Quick Add below!'
                        : `You have completed ${completedTasks} of your ${totalTasks} scheduled tasks. Keep going to maintain consistency!`}
                    </p>
                    <div className="flex gap-4 pt-2">
                      <div className="text-xs text-muted-foreground font-semibold bg-secondary/50 px-3 py-1 rounded-full border border-border">
                        Total: <span className="text-foreground font-bold">{totalTasks}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold bg-success/10 px-3 py-1 rounded-full border border-success/20 text-success">
                        Done: <span className="font-bold">{completedTasks}</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-semibold bg-warning/10 px-3 py-1 rounded-full border border-warning/20 text-warning">
                        Skipped: <span className="font-bold">{tasks.filter(t => t.status === 'SKIPPED').length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <div className="relative flex items-center justify-center">
                      {/* SVG Progress Ring */}
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-muted"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          className="stroke-success transition-all duration-500 ease-out"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={2 * Math.PI * 40 * (1 - completionPercentage / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-heading-2 font-bold text-foreground">{completionPercentage}%</span>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Done</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Add activity form */}
                <form
                  onSubmit={handleQuickAdd}
                  className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="What do you want to do today?"
                      value={quickTitle}
                      onChange={(e) => setQuickTitle(e.target.value)}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 flex-1 focus:ring-1 focus:ring-primary focus:outline-none"
                      required
                    />
                    <div className="flex gap-2">
                      <input
                        type="time"
                        value={quickTime}
                        onChange={(e) => setQuickTime(e.target.value)}
                        className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-32 focus:ring-1 focus:ring-primary focus:outline-none"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={createTaskMutation.isPending || !quickTitle.trim()}
                      >
                        {createTaskMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Advanced Options Toggle */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setShowQuickOptions(!showQuickOptions)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      {showQuickOptions ? 'Hide options' : 'More options (Category, Priority)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      Manage Categories
                    </button>
                  </div>

                  {/* Disclosed Options */}
                  <AnimatePresence>
                    {showQuickOptions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border overflow-hidden"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Category
                          </label>
                          <select
                            value={quickCategory}
                            onChange={(e) => setQuickCategory(e.target.value)}
                            className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="">No Category</option>
                            {activeCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Priority
                          </label>
                          <select
                            value={quickPriority}
                            onChange={(e) => setQuickPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                            className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                {/* Task List Section */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                    Planned Tasks ({tasks.length})
                  </h4>

                  {tasks.length === 0 ? (
                    <div className="bg-card/50 border border-dashed border-border rounded-2xl py-12 text-center text-muted-foreground p-6 space-y-3">
                      <Folder className="w-8 h-8 mx-auto text-muted-foreground/50" />
                      <div>
                        <h5 className="font-semibold text-foreground">Planner is empty</h5>
                        <p className="text-xs">Add tasks using the Quick Add bar above to organize your goals.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((task: TaskResponse, index: number) => {
                        const isCompleted = !!task.completion;
                        const isSkipped = task.status === 'SKIPPED';
                        const isCancelled = task.status === 'CANCELLED';

                        // Find category styling
                        const cat = activeCategories.find((c) => c.id === task.categoryId);
                        const catColorToken = cat ? APPROVED_COLORS.find(col => col.value === cat.color) : null;
                        const catBg = catColorToken ? catColorToken.bg : 'bg-muted text-muted-foreground';

                        return (
                          <motion.div
                            key={task.id}
                            layoutId={task.id}
                            className={`flex items-center justify-between bg-card border border-border p-3.5 rounded-xl shadow-sm transition-all duration-200 ${
                              isCompleted ? 'bg-success/5 border-success/20 opacity-80' : ''
                            } ${isSkipped ? 'bg-warning/5 border-warning/10 opacity-70' : ''}`}
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              {/* Checkbox Trigger */}
                              <button
                                type="button"
                                onClick={() => !isCompleted && !isSkipped && !isCancelled && completeTaskMutation.mutate(task.id)}
                                disabled={isCompleted || isSkipped || isCancelled || completeTaskMutation.isPending}
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                                  isCompleted
                                    ? 'bg-success border-success text-success-foreground'
                                    : 'border-border hover:border-primary bg-background'
                                }`}
                                aria-label={`Mark task ${task.title} as completed`}
                              >
                                {isCompleted && <Check className="w-4 h-4 stroke-[3px]" />}
                              </button>

                              <div className="min-w-0 flex-1">
                                {/* Task details */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {task.scheduledAt && (
                                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 shrink-0">
                                      <Clock className="w-3.5 h-3.5 text-primary" />
                                      {formatScheduledTime(task.scheduledAt, timezone, timeFormat)}
                                    </span>
                                  )}
                                  <h5
                                    className={`text-sm font-semibold truncate ${
                                      isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                                    } ${isSkipped ? 'italic text-muted-foreground' : ''}`}
                                  >
                                    {task.title}
                                  </h5>
                                  {/* Badges */}
                                  {isSkipped && (
                                    <span className="text-[9px] uppercase font-bold bg-warning/20 text-warning px-1.5 py-0.5 rounded">
                                      Skipped
                                    </span>
                                  )}
                                  {isCancelled && (
                                    <span className="text-[9px] uppercase font-bold bg-danger/20 text-danger px-1.5 py-0.5 rounded">
                                      Cancelled
                                    </span>
                                  )}
                                  {task.priority === 'HIGH' && !isCompleted && (
                                    <span className="text-[9px] uppercase font-bold bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded">
                                      High
                                    </span>
                                  )}
                                </div>

                                {/* Category and Description */}
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                  {cat && (
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1.5 ${catBg}`}>
                                      <CategoryIcon name={cat.icon} />
                                      <span>{cat.name}</span>
                                    </div>
                                  )}
                                  {task.description && (
                                    <p className="text-xs text-muted-foreground truncate max-w-md">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 ml-3">
                              {/* Reorder controls */}
                              <div className="flex flex-col">
                                <button
                                  type="button"
                                  onClick={() => handleMove(task.id, 'UP')}
                                  disabled={index === 0 || reorderMutation.isPending}
                                  className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                                  aria-label="Move task up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMove(task.id, 'DOWN')}
                                  disabled={index === tasks.length - 1 || reorderMutation.isPending}
                                  className="p-1 rounded text-muted-foreground hover:bg-muted disabled:opacity-30"
                                  aria-label="Move task down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Skip option */}
                              {!isCompleted && !isSkipped && !isCancelled && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => skipTaskMutation.mutate(task.id)}
                                  disabled={skipTaskMutation.isPending}
                                  className="text-xs"
                                >
                                  Skip
                                </Button>
                              )}

                              {/* Edit option */}
                              <button
                                type="button"
                                onClick={() => openEditModal(task)}
                                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                                aria-label="Edit task"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>

                              {/* Delete option */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this task?')) {
                                    deleteTaskMutation.mutate(task.id);
                                  }
                                }}
                                className="p-2 rounded-lg text-muted-foreground hover:bg-danger/10 hover:text-danger"
                                aria-label="Delete task"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ============================================================
          Settings Modal Dialog
          ============================================================ */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="text-heading-3 font-semibold text-foreground">UserSettings</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="text-muted-foreground hover:text-foreground font-bold"
                >
                  Close
                </button>
              </div>

              {settingsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Visual Theme</label>
                    <select
                      value={selectedTheme}
                      onChange={(e) => setSelectedTheme(e.target.value as 'LIGHT' | 'DARK' | 'SYSTEM')}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="LIGHT">Light Theme</option>
                      <option value="DARK">Dark Theme</option>
                      <option value="SYSTEM">System Default</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Push Notifications</label>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationsEnabled}
                        onChange={(e) => setNotificationsEnabled(e.target.checked)}
                        className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary focus:ring-1"
                      />
                      <span className="ml-2.5 text-xs text-muted-foreground">
                        {notificationsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Default Reminder Minutes</label>
                    <input
                      type="number"
                      min={0}
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 0)}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Timezone Region</label>
                    <input
                      type="text"
                      value={settingsTz}
                      onChange={(e) => setSettingsTz(e.target.value)}
                      placeholder="e.g. UTC, Asia/Kolkata"
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Week Starts On</label>
                    <select
                      value={weekStartsOn}
                      onChange={(e) => setWeekStartsOn(e.target.value as 'MONDAY' | 'SUNDAY')}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="MONDAY">Monday</option>
                      <option value="SUNDAY">Sunday</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Time Format</label>
                    <select
                      value={settingsTimeFormat}
                      onChange={(e) => setSettingsTimeFormat(e.target.value as '12_HOUR' | '24_HOUR')}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="12_HOUR">12-Hour (AM/PM)</option>
                      <option value="24_HOUR">24-Hour (Military)</option>
                    </select>
                  </div>

                  {/* Settings panel diagnostic */}
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      *Saved to PostgreSQL database
                    </span>
                    <Button
                      variant="primary"
                      onClick={handleSaveSettings}
                      disabled={settingsMutation.isPending}
                    >
                      {settingsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Persisting...
                        </>
                      ) : settingsSaveSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5 text-success" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1.5" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          Category Management Modal Dialog
          ============================================================ */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-primary" />
                  <h3 className="text-heading-3 font-semibold text-foreground">Manage Categories</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryConflictError('');
                  }}
                  className="text-muted-foreground hover:text-foreground font-bold"
                >
                  Close
                </button>
              </div>

              {categoryConflictError && (
                <div className="bg-danger/10 border border-danger/20 text-danger p-3 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{categoryConflictError}</span>
                </div>
              )}

              {/* Add New Category Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newCatName.trim()) return;
                  createCategoryMutation.mutate({
                    name: newCatName,
                    color: newCatColor as 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'sky',
                    icon: newCatIcon,
                  });
                }}
                className="space-y-4 bg-secondary/30 p-4 rounded-xl border border-border"
              >
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wide">
                  New Category
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="e.g. Study, Fitness"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2 flex-1 focus:ring-1 focus:ring-primary focus:outline-none sm:col-span-2"
                    required
                  />
                  <select
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2 focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    {APPROVED_ICONS.map((i) => (
                      <option key={i.value} value={i.value}>
                        {i.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color Choices */}
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                    Theme Color Token
                  </label>
                  <div className="flex gap-2.5 flex-wrap">
                    {APPROVED_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setNewCatColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          newCatColor === c.value
                            ? 'border-foreground scale-110 shadow-sm'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor:
                            c.value === 'violet'
                              ? '#8b5cf6'
                              : c.value === 'cyan'
                              ? '#06b6d4'
                              : c.value === 'emerald'
                              ? '#10b981'
                              : c.value === 'rose'
                              ? '#f43f5e'
                              : c.value === 'amber'
                              ? '#f59e0b'
                              : '#0ea5e9', // sky
                        }}
                        aria-label={`Select ${c.label} color`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full"
                  disabled={createCategoryMutation.isPending || !newCatName.trim()}
                >
                  {createCategoryMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Create Category'
                  )}
                </Button>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Your Categories ({activeCategories.length})
                </h4>

                {categoriesQuery.isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : activeCategories.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No custom categories created yet.
                  </p>
                ) : (
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                    {activeCategories.map((c) => {
                      const col = APPROVED_COLORS.find((color) => color.value === c.color);
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between border border-border p-2 rounded-lg bg-card"
                        >
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-full ${col ? col.bg : 'bg-muted text-muted-foreground'}`}>
                              <CategoryIcon name={c.icon} />
                            </div>
                            <span className="text-sm font-semibold text-foreground">
                              {c.name}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Delete this category? Tasks referencing it will lose their category tag.')) {
                                deleteCategoryMutation.mutate(c.id);
                              }
                            }}
                            className="p-1 rounded text-muted-foreground hover:bg-danger/10 hover:text-danger"
                            aria-label="Delete category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          Task Edit Modal Dialog
          ============================================================ */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-6 rounded-2xl shadow-xl w-full max-w-lg space-y-6"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="text-heading-3 font-semibold text-foreground">Edit Task</h3>
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="text-muted-foreground hover:text-foreground font-bold"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Activity Title
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Priority Level
                    </label>
                    <select
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH')}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Category Tag
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="">No Category</option>
                    {activeCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-border flex justify-end gap-3">
                  <Button variant="ghost" size="sm" onClick={() => setEditingTask(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleUpdateTask}
                    disabled={updateTaskMutation.isPending || !editTitle.trim()}
                  >
                    {updateTaskMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RecurringTaskDialog
        isOpen={showRecurringTaskModal}
        onClose={() => setShowRecurringTaskModal(false)}
        categories={activeCategories}
        timezone={timezone}
      />
    </div>
  );
}
