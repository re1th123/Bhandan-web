import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import EmployeeDashboardPage from '../EmployeeDashboardPage';

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

describe('EmployeeDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<EmployeeDashboardPage />);
    expect(screen.getByText('Workforce Management')).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<EmployeeDashboardPage />);
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /directory/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /payroll summary/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /attendance & leaves/i })).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<EmployeeDashboardPage />);
    expect(screen.getByRole('button', { name: /\+ Add Employee/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Run Payroll/i })).toBeInTheDocument();
  });

  it('shows KPI cards content', () => {
    render(<EmployeeDashboardPage />);
    expect(screen.getByText(/Total Headcount/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Payroll Cost/i)).toBeInTheDocument();
    expect(screen.getByText(/Attendance Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending Leave Approvals/i)).toBeInTheDocument();
  });

  it('switches tabs and updates displayed content', () => {
    render(<EmployeeDashboardPage />);
    
    // Overview is active by default
    expect(screen.getByRole('tab', { name: /overview/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to Directory
    fireEvent.click(screen.getByRole('tab', { name: /directory/i }));
    expect(screen.getByRole('tab', { name: /directory/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to Payroll Summary
    fireEvent.click(screen.getByRole('tab', { name: /payroll summary/i }));
    expect(screen.getByRole('tab', { name: /payroll summary/i })).toHaveAttribute('aria-selected', 'true');
  });
});
