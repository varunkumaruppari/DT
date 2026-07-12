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

// Request interceptor — auth tokens will be added here in auth milestone
apiClient.interceptors.request.use(
  (config) => {
    // Auth token injection — placeholder for auth milestone
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
