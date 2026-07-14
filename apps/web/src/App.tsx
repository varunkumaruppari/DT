import { useEffect } from 'react';
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
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        if (apiBaseUrl.endsWith('/')) {
          apiBaseUrl = apiBaseUrl.slice(0, -1);
        }

        const isValid = /^(https?:\/\/)/.test(apiBaseUrl);
        if (!isValid) {
          console.error('[SW Config] Invalid VITE_API_BASE_URL scheme:', apiBaseUrl);
          return;
        }

        const message = {
          type: 'CONFIGURE_API_BASE_URL',
          apiBaseUrl,
        };

        if (registration.active) {
          registration.active.postMessage(message);
        } else if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage(message);
        }

        // Also listen for controller changes and resend the config
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage(message);
          }
        });
      }).catch((err) => {
        console.error('[SW Config] Error during service worker configuration delivery:', err);
      });
    }
  }, []);
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
