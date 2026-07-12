import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginRequestSchema } from '@ddt/shared';
import type { LoginRequest } from '@ddt/shared';
import { useAuth } from '../contexts/AuthContext.js';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.js';
import { motion, AnimatePresence } from 'framer-motion';

export function Login() {
  const { login, error: authError } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginRequest) => {
    setServerError(null);
    try {
      await login(data);
      navigate('/');
    } catch (err) {
      setServerError(
        (err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'Authentication failed. Please check credentials.'
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-background text-foreground transition-colors duration-200">
      {/* Theme Toggler (Top Right) */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value.toLowerCase() as import('../contexts/ThemeContext.js').ThemeMode)}
          className="bg-card text-card-foreground border border-border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          aria-label="Toggle visual theme preference"
        >
          <option value="LIGHT">Light</option>
          <option value="DARK">Dark</option>
          <option value="SYSTEM">System</option>
        </select>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-card border border-border p-8 rounded-xl shadow-lg relative overflow-hidden"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
            Daily Development Tracker
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to access your development dashboard
          </p>
        </div>

        {/* Global Error Banner */}
        <AnimatePresence>
          {(serverError || authError) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg p-3 mb-6 flex items-start gap-3"
            >
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{serverError || authError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email input */}
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-semibold text-muted-foreground">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register('email')}
                className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 ${
                  errors.email ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                }`}
                disabled={isSubmitting}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-semibold text-muted-foreground">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className={`w-full bg-background border rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 ${
                  errors.password ? 'border-destructive focus:ring-destructive' : 'border-border focus:ring-primary'
                }`}
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                aria-label={showPassword ? 'Hide plain-text password' : 'Show plain-text password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Submit button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-primary-foreground font-semibold rounded-lg py-2.5 text-sm hover:opacity-90 transition-opacity duration-150 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                Authenticating credentials...
              </>
            ) : (
              'Sign In'
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Register a free profile
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
