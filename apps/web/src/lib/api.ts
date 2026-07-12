import axios from 'axios';
import type { ApiResponse } from '@ddt/shared';

// ============================================================
// Centralized Axios API Client
// All API requests go through this instance.
// Base URL comes from VITE_API_BASE_URL environment variable.
// Default namespace: /api/v1 per API Specification
// ============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Key used for token persistence in localStorage
export const AUTH_TOKEN_KEY = 'ddt_access_token';

// Request interceptor — auth tokens injection
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — normalize error responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      // Network error — server unavailable
      if (!error.response) {
        return Promise.reject(new Error('API is unavailable. Check your connection.'));
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Typed API helpers
// ============================================================

export async function apiGet<T>(path: string): Promise<ApiResponse<T>> {
  const response = await apiClient.get<ApiResponse<T>>(path);
  return response.data;
}

export async function apiPost<T, R>(path: string, data: T): Promise<ApiResponse<R>> {
  const response = await apiClient.post<ApiResponse<R>>(path, data);
  return response.data;
}

export async function apiPatch<T, R>(path: string, data: T): Promise<ApiResponse<R>> {
  const response = await apiClient.patch<ApiResponse<R>>(path, data);
  return response.data;
}
