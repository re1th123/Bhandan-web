import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import SettingsDashboardPage from '../SettingsDashboardPage';

// Mock recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children }: any) => <div data-testid="area-chart">{children}</div>,
  BarChart: ({ children }: any) => <div data-testid="bar-chart">{children}</div>,
  PieChart: ({ children }: any) => <div data-testid="pie-chart">{children}</div>,
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

// Mock auth store
vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn((selector: any) => selector({
    activeBusiness: { id: 'test-biz', name: 'Test Business', gstin: '27AABCB1234D1ZB', pan: 'AABCB1234D', address: 'Mumbai', phone: '+91 98765', fy_start_month: 4, default_currency: 'INR', is_active: true },
    user: { email: 'test@test.com', full_name: 'Test User' },
  })),
  default: vi.fn((selector: any) => selector({
    activeBusiness: { id: 'test-biz', name: 'Test Business', gstin: '27AABCB1234D1ZB', pan: 'AABCB1234D', address: 'Mumbai', phone: '+91 98765', fy_start_month: 4, default_currency: 'INR', is_active: true },
    user: { email: 'test@test.com', full_name: 'Test User' },
  })),
}));

// Mock framer-motion
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion') as any;
  return {
    ...actual,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
      create: (Component: any) => (props: any) => <Component {...props} />,
    },
  };
});

describe('SettingsDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<SettingsDashboardPage />);
    expect(screen.getByText('Settings & Configuration')).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<SettingsDashboardPage />);
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /financial years/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /users & roles/i })).toBeInTheDocument();
  });

  it('shows business profile info on Overview tab', () => {
    render(<SettingsDashboardPage />);
    // Multiple elements may contain "Business Profile" text (heading + activity log)
    const matches = screen.getAllByText(/Business Profile/i);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows system health section', () => {
    render(<SettingsDashboardPage />);
    // Assumes "System Health" text or title is present
    expect(screen.getByText(/System Health/i)).toBeInTheDocument();
  });

  it('switches tabs and updates displayed content', () => {
    render(<SettingsDashboardPage />);
    
    // Overview is active by default
    expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to Financial Years
    fireEvent.click(screen.getByRole('tab', { name: /financial years/i }));
    expect(screen.getByRole('tab', { name: /financial years/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to Users & Roles
    fireEvent.click(screen.getByRole('tab', { name: /users & roles/i }));
    expect(screen.getByRole('tab', { name: /users & roles/i })).toHaveAttribute('aria-selected', 'true');
  });
});
