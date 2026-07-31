import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { lightTheme } from '../theme';

// Create a fresh QueryClient for each test
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface AllProvidersProps {
  children: React.ReactNode;
  initialEntries?: string[];
}

function AllProviders({ children, initialEntries = ['/'] }: AllProvidersProps) {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <CssBaseline />
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { initialEntries?: string[] }
) {
  const { initialEntries, ...renderOptions } = options || {};
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders initialEntries={initialEntries}>{children}</AllProviders>
    ),
    ...renderOptions,
  });
}

export * from '@testing-library/react';
export { customRender as render };
