import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import ReportsDashboardPage from '../ReportsDashboardPage';

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

describe('ReportsDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<ReportsDashboardPage />);
    expect(screen.getByText(/Reports & Analytics Hub/i)).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<ReportsDashboardPage />);
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /profit & loss/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /balance sheet/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /trial balance/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /gst intelligence/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /gst reports/i })).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<ReportsDashboardPage />);
    expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
  });

  it('shows KPI cards content', () => {
    render(<ReportsDashboardPage />);
    // Assumes there is a chart container since KPI charts are on the overview
    expect(screen.getAllByTestId('chart-container').length).toBeGreaterThan(0);
  });

  it('switches tabs and updates displayed content', () => {
    render(<ReportsDashboardPage />);
    
    // Overview is active by default
    expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to Profit & Loss
    fireEvent.click(screen.getByRole('tab', { name: /profit & loss/i }));
    expect(screen.getByRole('tab', { name: /profit & loss/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to GST Reports
    fireEvent.click(screen.getByRole('tab', { name: /gst reports/i }));
    expect(screen.getByRole('tab', { name: /gst reports/i })).toHaveAttribute('aria-selected', 'true');
  });
});
