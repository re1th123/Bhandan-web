import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: vi.fn(),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// ─── Global mocks for heavy packages (prevents EMFILE on Windows) ───

// Mock @mui/icons-material — has 7000+ individual ESM files that exhaust file descriptors
vi.mock('@mui/icons-material', () => {
  return new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === 'string' && prop !== '__esModule') {
        return (props: any) => React.createElement('svg', { 'data-testid': `mui-icon-${prop}`, ...props });
      }
      return true;
    }
  });
});

// Mock lucide-react — large icon library
vi.mock('lucide-react', () => {
  return new Proxy({}, {
    get: (_target, prop) => {
      if (typeof prop === 'string' && prop !== '__esModule') {
        return (props: any) => React.createElement('div', { 'data-testid': `icon-${prop.toString().toLowerCase()}`, ...props });
      }
      return true;
    }
  });
});

// Mock framer-motion — heavy animation library
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_target, prop) => {
      if (prop === 'create') {
        return (Component: any) => React.forwardRef((props: any, ref: any) =>
          React.createElement(Component, { ...props, ref })
        );
      }
      // motion.div, motion.span, etc.
      return React.forwardRef(({ children, ...props }: any, ref: any) =>
        React.createElement(prop as string, { ...props, ref }, children)
      );
    }
  }),
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
  useInView: () => true,
  useScroll: () => ({ scrollY: { get: () => 0 } }),
}));

// Mock recharts — SVG charting library
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => React.createElement('div', { 'data-testid': 'responsive-container' }, children),
  AreaChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'area-chart' }, children),
  BarChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'bar-chart' }, children),
  PieChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'pie-chart' }, children),
  LineChart: ({ children }: any) => React.createElement('div', { 'data-testid': 'line-chart' }, children),
  Area: () => null,
  Bar: () => null,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
  Line: () => null,
}));

// Mock @react-pdf/renderer — heavy PDF generation library
vi.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: any) => React.createElement('div', { 'data-testid': 'pdf-document' }, children),
  Page: ({ children }: any) => React.createElement('div', { 'data-testid': 'pdf-page' }, children),
  View: ({ children }: any) => React.createElement('div', null, children),
  Text: ({ children }: any) => React.createElement('span', null, children),
  Image: () => null,
  StyleSheet: { create: (s: any) => s },
  PDFDownloadLink: ({ children }: any) =>
    typeof children === 'function' ? children({ loading: false }) : children,
  pdf: vi.fn(),
}));

// Mock Supabase globally
vi.mock('./src/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            data: [],
            error: null,
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(() => Promise.resolve()),
    },
  },
  default: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
            data: [],
            error: null,
          })),
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
          })),
          data: [],
          error: null,
        })),
        data: [],
        error: null,
      })),
    })),
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signOut: vi.fn(() => Promise.resolve()),
    },
  },
}));
