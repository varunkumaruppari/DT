import { type ReactNode, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Zap,
  LogOut,
  User,
  Settings,
  ShieldCheck,
  Calendar,
  Save,
  Check,
} from 'lucide-react';
import { useTheme, type ThemeMode } from './contexts/ThemeContext.js';
import { useAuth } from './contexts/AuthContext.js';
import { apiGet, apiPatch } from './lib/api.js';
import { Card } from './components/ui/Card.js';
import { Button } from './components/ui/Button.js';
import { PRODUCT_NAME } from '@ddt/shared';
import type { UserSettingsResponse, UpdateSettingsRequest } from '@ddt/shared';

// ============================================================
// Health API types
// ============================================================

interface HealthData {
  status: string;
  service: string;
  database?: string;
}

// ============================================================
// Status Badge
// ============================================================

type StatusType = 'ok' | 'error' | 'loading' | 'unknown';

function StatusBadge({ status, label }: { status: StatusType; label: string }) {
  const config: Record<StatusType, { icon: ReactNode; color: string; bg: string; text: string }> = {
    ok: {
      icon: <CheckCircle2 className="h-4 w-4" />,
      color: 'text-success',
      bg: 'bg-success/10',
      text: 'Operational',
    },
    error: {
      icon: <XCircle className="h-4 w-4" />,
      color: 'text-danger',
      bg: 'bg-danger/10',
      text: 'Unavailable',
    },
    loading: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      color: 'text-muted-foreground',
      bg: 'bg-muted',
      text: 'Checking...',
    },
    unknown: {
      icon: <Activity className="h-4 w-4" />,
      color: 'text-warning',
      bg: 'bg-warning/10',
      text: 'Unknown',
    },
  };

  const c = config[status];

  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}>
        {c.icon}
        <span>{c.text}</span>
      </div>
    </div>
  );
}

// ============================================================
// Main Shell Component (Authenticated Landing entry)
// ============================================================

export function FoundationShell() {
  const { user, logout } = useAuth();
  const { setTheme } = useTheme();
  const queryClient = useQueryClient();

  // Health and Readiness checks (Milestone 01)
  const healthQuery = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await apiGet<HealthData>('/health');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    retry: 1,
    refetchInterval: 30000,
  });

  const readinessQuery = useQuery({
    queryKey: ['health', 'ready'],
    queryFn: async () => {
      const res = await apiGet<HealthData>('/health/ready');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    retry: 1,
    refetchInterval: 30000,
  });

  // Settings Queries & Mutations (Milestone 02)
  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await apiGet<{ settings: UserSettingsResponse }>('/settings');
      if (!res.success) throw new Error(res.message);
      return res.data.settings;
    },
  });

  const settingsMutation = useMutation({
    mutationFn: async (data: UpdateSettingsRequest) => {
      const res = await apiPatch<UpdateSettingsRequest, { settings: UserSettingsResponse }>('/settings', data);
      if (!res.success) throw new Error(res.message);
      return res.data.settings;
    },
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(['settings'], updatedSettings);
      // Automatically keep theme context in sync with saved database theme preference
      if (updatedSettings.theme) {
        setTheme(updatedSettings.theme.toLowerCase() as ThemeMode);
      }
    },
  });

  // Local Form state for Settings Editor
  const [selectedTheme, setSelectedTheme] = useState<'LIGHT' | 'DARK' | 'SYSTEM'>('SYSTEM');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState(3);
  const [timezone, setTimezone] = useState('UTC');
  const [weekStartsOn, setWeekStartsOn] = useState<'MONDAY' | 'SUNDAY'>('MONDAY');
  const [timeFormat, setTimeFormat] = useState<'12_HOUR' | '24_HOUR'>('12_HOUR');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync settings query value to form state
  useEffect(() => {
    if (settingsQuery.data) {
      const s = settingsQuery.data;
      setSelectedTheme(s.theme);
      setNotificationsEnabled(s.notificationsEnabled);
      setReminderMinutes(s.defaultReminderMinutes);
      setTimezone(s.timezone || 'UTC');
      setWeekStartsOn(s.weekStartsOn === 'SUNDAY' ? 'SUNDAY' : 'MONDAY');
      setTimeFormat(s.timeFormat);
    }
  }, [settingsQuery.data]);

  const handleSaveSettings = async () => {
    setSaveSuccess(false);
    try {
      await settingsMutation.mutateAsync({
        theme: selectedTheme,
        notificationsEnabled,
        defaultReminderMinutes: reminderMinutes,
        timezone,
        weekStartsOn,
        timeFormat,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('[Settings] Failed to save settings:', err);
    }
  };

  // Status mapping
  const apiStatus: StatusType = healthQuery.isLoading
    ? 'loading'
    : healthQuery.isSuccess && healthQuery.data?.status === 'ok'
    ? 'ok'
    : 'error';

  const dbStatus: StatusType = readinessQuery.isLoading
    ? 'loading'
    : readinessQuery.isSuccess && readinessQuery.data?.database === 'connected'
    ? 'ok'
    : 'error';

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
              <span className="font-bold text-sm text-foreground tracking-wide">
                {PRODUCT_NAME}
              </span>
              <p className="text-[10px] uppercase font-semibold text-primary tracking-wider">
                Milestone 02 Secured
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline text-xs text-muted-foreground font-medium">
              Signed in as: <strong className="text-foreground">{user?.displayName}</strong>
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1.5" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Profile & Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card elevated className="overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-info" />
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-heading-2 font-bold text-foreground">
                    Welcome back, {user?.displayName}!
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
                  <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-success font-semibold bg-success/10 px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified sub session active
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* User Settings Settings Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card elevated>
              <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-heading-3 font-semibold text-foreground">UserSettings</h3>
              </div>

              {settingsQuery.isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Select Theme */}
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

                  {/* Notifications Switch */}
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

                  {/* Default Reminder Minutes Config */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Default Reminder minutes</label>
                    <input
                      type="number"
                      min={0}
                      value={reminderMinutes}
                      onChange={(e) => setReminderMinutes(parseInt(e.target.value) || 0)}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  {/* Timezone */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Timezone region</label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      placeholder="e.g. UTC, Asia/Kolkata"
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  {/* Week starts on */}
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

                  {/* Time format */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <label className="text-sm font-semibold text-muted-foreground">Time Format</label>
                    <select
                      value={timeFormat}
                      onChange={(e) => setTimeFormat(e.target.value as '12_HOUR' | '24_HOUR')}
                      className="bg-background border border-border text-foreground text-sm rounded-lg p-2.5 w-full focus:ring-1 focus:ring-primary focus:outline-none"
                    >
                      <option value="12_HOUR">12-Hour (AM/PM)</option>
                      <option value="24_HOUR">24-Hour (Military)</option>
                    </select>
                  </div>

                  {/* Action row */}
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      *Saved to PostgreSQL database
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveSettings}
                      disabled={settingsMutation.isPending}
                    >
                      {settingsMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                          Persisting...
                        </>
                      ) : saveSuccess ? (
                        <>
                          <Check className="w-4 h-4 mr-1.5 text-success" />
                          Settings Saved
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-1.5" />
                          Save UserSettings
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Product Planning Status Notification */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3.5"
          >
            <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-sm font-bold text-foreground">Next Milestone: Daily Planning Workspace</h4>
              <p className="text-xs text-muted-foreground mt-1">
                The core database schema has been migrated, but the planner view, task CRUD, XP reward mechanisms, mood records, and push schedules are disabled during Milestone 02 verification.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Right Side: Infrastructure Panel (Milestone 01) */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card elevated>
              <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
                <Activity className="w-5 h-5 text-info" />
                <h3 className="text-heading-3 font-semibold text-foreground">Infrastructure</h3>
              </div>

              <div className="space-y-1">
                <StatusBadge status="ok" label="Frontend Workspace" />
                <StatusBadge status={apiStatus} label="Express API Service" />
                <StatusBadge status={dbStatus} label="PostgreSQL Port 5433" />
                <StatusBadge status="ok" label="PWA Service Worker" />
              </div>

              <div className="mt-5 space-y-2">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => {
                    healthQuery.refetch();
                    readinessQuery.refetch();
                  }}
                  isLoading={healthQuery.isFetching || readinessQuery.isFetching}
                >
                  Refresh Live Status
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
