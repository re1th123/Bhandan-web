import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import FinanceDashboardPage from '../FinanceDashboardPage';

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
    activeBusiness: { id: 'test-biz', name: 'Test Business' },
    user: { email: 'test@test.com', full_name: 'Test User' },
  })),
  default: vi.fn((selector: any) => selector({
    activeBusiness: { id: 'test-biz', name: 'Test Business' },
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

// Mock Lucide icons
vi.mock('lucide-react', () => {
  const React = require('react');
  return new Proxy({}, {
    get: function(_, prop) {
      return (props: any) => React.createElement('div', { 'data-testid': `icon-${String(prop).toLowerCase()}`, ...props });
    }
  });
});

describe('FinanceDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', () => {
    render(<FinanceDashboardPage />);
    expect(screen.getByText(/Finance Command Center/i)).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<FinanceDashboardPage />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Expenses')).toBeInTheDocument();
    expect(screen.getByText('Loans')).toBeInTheDocument();
    expect(screen.getByText('Chart of Accounts')).toBeInTheDocument();
    expect(screen.getByText('Journal Entries')).toBeInTheDocument();
    expect(screen.getByText('Bank Accounts')).toBeInTheDocument();
    expect(screen.getByText('Opening Balances')).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<FinanceDashboardPage />);
    expect(screen.getByText('+ Record Expense')).toBeInTheDocument();
    expect(screen.getByText('+ Journal Entry')).toBeInTheDocument();
  });

  it('shows KPI card titles', () => {
    render(<FinanceDashboardPage />);
    expect(screen.getByText(/NET CASH FLOW/i)).toBeInTheDocument();
    expect(screen.getByText(/WORKING CAPITAL RATIO/i)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL BANK BALANCE/i)).toBeInTheDocument();
    expect(screen.getByText(/OPERATING EXPENSES/i)).toBeInTheDocument();
  });

  it('tab switching works', () => {
    render(<FinanceDashboardPage />);
    const expensesTab = screen.getByText('Expenses');
    fireEvent.click(expensesTab);
    expect(expensesTab).toBeInTheDocument();
  });

  it('overview tab renders charts and sections', () => {
    render(<FinanceDashboardPage />);
    expect(screen.getByText(/Cash Flow/i)).toBeInTheDocument();
    expect(screen.getByText(/Bank Accounts/i)).toBeInTheDocument();
    expect(screen.getByText(/Expense Category/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Loan Obligations/i)).toBeInTheDocument();
  });
});
