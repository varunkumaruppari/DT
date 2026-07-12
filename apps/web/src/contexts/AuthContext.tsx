import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiGet, apiPost, AUTH_TOKEN_KEY } from '../lib/api.js';
import type { UserResponse, RegisterRequest, LoginRequest } from '@ddt/shared';

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearLocalSession: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolution at application boot
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiGet<{ user: UserResponse }>('/auth/me');
        if (response.success && response.data) {
          setUser(response.data.user);
        } else {
          clearLocalSession();
        }
      } catch (err) {
        console.error('[AuthContext] Failed to load user profile:', err);
        clearLocalSession();
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const clearLocalSession = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  };

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiPost<LoginRequest, { user: UserResponse; accessToken: string }>(
        '/auth/login',
        credentials
      );

      if (response.success && response.data) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.accessToken);
        setUser(response.data.user);
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'Login failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiPost<RegisterRequest, { user: UserResponse; accessToken: string }>(
        '/auth/register',
        data
      );

      if (response.success && response.data) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.accessToken);
        setUser(response.data.user);
      }
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || (err as Error).message || 'Registration failed';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Backend logout request to acknowledge stateless session close
      await apiPost('/auth/logout', {});
    } catch (err) {
      console.warn('[AuthContext] Backend logout request failed, clearing local session anyway:', err);
    } finally {
      clearLocalSession();
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        clearLocalSession,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
