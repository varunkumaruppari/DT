import { QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { queryClient } from './lib/queryClient';
import { FoundationShell } from './FoundationShell';

// ============================================================
// Application Providers
// Flow: ThemeProvider → QueryClientProvider → Router → Routes
// ============================================================

export function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FoundationShell />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
