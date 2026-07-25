import React, { useEffect } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import AppRouter from './router';
import { lightTheme, darkTheme } from './theme';
import { queryClient } from './lib/queryClient';
import { useAuthStore } from './stores/authStore';
import { useUIStore } from './stores/uiStore';

const App: React.FC = () => {
  const initialize = useAuthStore((s) => s.initialize);
  const themeMode = useUIStore((s) => s.themeMode);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppRouter />
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
};

export default App;
