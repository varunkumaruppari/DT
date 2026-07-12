import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { ProtectedRoute } from './components/ProtectedRoute.js';
import { queryClient } from './lib/queryClient.js';
import { FoundationShell } from './FoundationShell.js';
import { Login } from './pages/Login.js';
import { Register } from './pages/Register.js';

// ============================================================
// Application Providers
// Flow: ThemeProvider → QueryClientProvider → AuthProvider → Router → Routes
// ============================================================

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <FoundationShell />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
