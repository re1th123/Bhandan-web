import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/utils';
import DashboardPage from '../DashboardPage';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="responsive-container">{children}</div>,
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

vi.mock('../../../stores/authStore', () => ({
  useAuthStore: vi.fn((selector: any) =>
    selector({
      activeBusiness: { id: 'test-biz', name: 'Test Business' },
      user: { email: 'test@test.com', full_name: 'Test User' },
    })
  ),
  default: vi.fn((selector: any) =>
    selector({
      activeBusiness: { id: 'test-biz', name: 'Test Business' },
      user: { email: 'test@test.com', full_name: 'Test User' },
    })
  ),
}));

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

describe('DashboardPage', () => {
  it('renders a greeting message', () => {
    render(<DashboardPage />);
    const greetingElement = screen.getByText(/Good (Morning|Afternoon|Evening)/i);
    expect(greetingElement).toBeInTheDocument();
  });

  it('shows KPI titles', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Total Revenue (FY)')).toBeInTheDocument();
    expect(screen.getByText('Outstanding Receivables')).toBeInTheDocument();
    expect(screen.getByText('Payables Due')).toBeInTheDocument();
    expect(screen.getByText('Active Customers')).toBeInTheDocument();
    expect(screen.getByText('Low Stock Items')).toBeInTheDocument();
  });

  it('renders chart section titles', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Revenue vs Expenses')).toBeInTheDocument();
    expect(screen.getByText('Cash Flow')).toBeInTheDocument();
  });

  it('renders Top Customers section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Top Customers')).toBeInTheDocument();
  });

  it('renders Pending Approvals section', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
  });

  it('renders Recent Journal Entries table headers', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Recent Journal Entries')).toBeInTheDocument();
    expect(screen.getByText('Voucher No.')).toBeInTheDocument();
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByText('Type')).toBeInTheDocument();
    expect(screen.getByText('Narration')).toBeInTheDocument();
  });
});
