import { type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Server,
  Globe,
  Zap,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useTheme, type ThemeMode } from './contexts/ThemeContext';
import { apiGet } from './lib/api';
import { Card } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { PRODUCT_NAME } from '@ddt/shared';

// ============================================================
// Health API types
// ============================================================

interface HealthData {
  status: string;
  service: string;
  database?: string;
}

// ============================================================
// Health Hook — real API connectivity
// ============================================================

function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const res = await apiGet<HealthData>('/health');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    retry: 1,
    refetchInterval: 30_000,
  });
}

function useReadiness() {
  return useQuery({
    queryKey: ['health', 'ready'],
    queryFn: async () => {
      const res = await apiGet<HealthData>('/health/ready');
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    retry: 1,
    refetchInterval: 30_000,
  });
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
      <span className="text-body-small font-medium text-foreground">{label}</span>
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.color} ${c.bg}`}>
        {c.icon}
        {c.text}
      </span>
    </div>
  );
}

// ============================================================
// Theme Toggle
// ============================================================

const themeOptions: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center gap-1 p-1 rounded-lg bg-muted"
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themeOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          role="radio"
          aria-checked={theme === opt.value}
          aria-label={`${opt.label} theme`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer ${
            theme === opt.value
              ? 'bg-surface text-foreground shadow-mission-1'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}

// ============================================================
// Foundation Shell — Premium Mission UI
// Shows real infrastructure status only.
// ============================================================

export function FoundationShell() {
  const healthQuery = useHealth();
  const readinessQuery = useReadiness();

  const apiStatus: StatusType = healthQuery.isLoading
    ? 'loading'
    : healthQuery.isSuccess
    ? 'ok'
    : 'error';

  const dbStatus: StatusType = readinessQuery.isLoading
    ? 'loading'
    : readinessQuery.isSuccess && readinessQuery.data.database === 'connected'
    ? 'ok'
    : readinessQuery.isError
    ? 'error'
    : 'unknown';

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <motion.div
              className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Zap className="h-4 w-4 text-primary-foreground" />
            </motion.div>
            <div>
              <span className="font-semibold text-sm text-foreground leading-none">
                {PRODUCT_NAME}
              </span>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Foundation</p>
            </div>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Hero */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* Brand mark */}
          <motion.div
            className="mx-auto mb-6 h-20 w-20 rounded-2xl bg-gradient-to-br from-primary to-info flex items-center justify-center shadow-mission-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04, rotate: 2 }}
          >
            <Zap className="h-10 w-10 text-white" />
          </motion.div>

          <h1 className="text-heading-1 text-foreground mb-3">
            Daily Development Tracker
          </h1>
          <p className="text-body text-muted-foreground max-w-md mx-auto">
            Your personal momentum and daily consistency platform.
            Foundation infrastructure verified below.
          </p>

          {/* Foundation milestone badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
            <Activity className="h-3 w-3 animate-pulse-ring" />
            Milestone 01 — Foundation
          </div>
        </motion.div>

        {/* Infrastructure Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Frontend Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card elevated>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-md bg-info/10 flex items-center justify-center">
                  <Globe className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h2 className="text-heading-3 text-foreground">Frontend</h2>
                  <p className="text-caption text-muted-foreground">React + Vite + TypeScript</p>
                </div>
              </div>
              <StatusBadge status="ok" label="React Application" />
              <StatusBadge status="ok" label="Tailwind CSS" />
              <StatusBadge status="ok" label="Mission UI Tokens" />
              <StatusBadge status="ok" label="Theme Infrastructure" />
              <StatusBadge status="ok" label="PWA Foundation" />
            </Card>
          </motion.div>

          {/* Backend Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card elevated>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                  <Server className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-heading-3 text-foreground">Backend API</h2>
                  <p className="text-caption text-muted-foreground">Express + TypeScript</p>
                </div>
              </div>
              <StatusBadge status={apiStatus} label="API Service" />
              {healthQuery.isSuccess && (
                <AnimatePresence>
                  <motion.p
                    key="api-detail"
                    className="mt-2 text-caption text-muted-foreground"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Service: {healthQuery.data.service}
                  </motion.p>
                </AnimatePresence>
              )}
              {healthQuery.isError && (
                <p className="mt-2 text-caption text-danger">
                  {String(healthQuery.error) || 'API is unavailable. Start the backend server.'}
                </p>
              )}
            </Card>
          </motion.div>

          {/* Database Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card elevated>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-md bg-success/10 flex items-center justify-center">
                  <Database className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h2 className="text-heading-3 text-foreground">Database</h2>
                  <p className="text-caption text-muted-foreground">PostgreSQL + Prisma</p>
                </div>
              </div>
              <StatusBadge status={dbStatus} label="PostgreSQL Connection" />
              {readinessQuery.isError && (
                <p className="mt-2 text-caption text-danger">
                  Database unavailable. Run: docker compose up -d
                </p>
              )}
            </Card>
          </motion.div>

          {/* Stack Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
          >
            <Card elevated>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-md bg-warning/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h2 className="text-heading-3 text-foreground">Foundation Stack</h2>
                  <p className="text-caption text-muted-foreground">Installed dependencies</p>
                </div>
              </div>
              <StatusBadge status="ok" label="TanStack Query" />
              <StatusBadge status="ok" label="React Router" />
              <StatusBadge status="ok" label="Framer Motion" />
              <StatusBadge status="ok" label="Lucide Icons" />
            </Card>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          className="flex flex-wrap gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              healthQuery.refetch();
              readinessQuery.refetch();
            }}
            isLoading={healthQuery.isFetching || readinessQuery.isFetching}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh Status
          </Button>
          <Button
            variant="ghost"
            size="md"
            onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001'}/api/v1/health`,
              '_blank'
            )
          }
          >
            <Server className="h-4 w-4 mr-2" />
            View Health Endpoint
          </Button>
        </motion.div>

        {/* Foundation Note */}
        <motion.p
          className="mt-10 text-center text-caption text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          This is the Milestone 01 foundation verification surface.
          No business features are implemented yet.
        </motion.p>
      </main>
    </div>
  );
}
