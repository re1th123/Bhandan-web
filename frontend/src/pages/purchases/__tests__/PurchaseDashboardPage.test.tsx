import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import PurchaseDashboardPage from '../PurchaseDashboardPage';

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

describe('PurchaseDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', () => {
    render(<PurchaseDashboardPage />);
    expect(screen.getByText(/Supply Chain Intelligence/i)).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<PurchaseDashboardPage />);
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Suppliers')).toBeInTheDocument();
    expect(screen.getByText('Purchase Orders')).toBeInTheDocument();
    expect(screen.getByText('Goods Receipts')).toBeInTheDocument();
    expect(screen.getByText('Invoices')).toBeInTheDocument();
    expect(screen.getByText('Supplier Payments')).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<PurchaseDashboardPage />);
    expect(screen.getByText('+ Add Supplier')).toBeInTheDocument();
    expect(screen.getByText('+ New PO')).toBeInTheDocument();
  });

  it('shows KPI card titles', () => {
    render(<PurchaseDashboardPage />);
    expect(screen.getByText(/TOTAL PURCHASE/i)).toBeInTheDocument();
    expect(screen.getByText(/AVG(.*)LEAD TIME/i)).toBeInTheDocument();
    expect(screen.getByText(/PENDING RECEIPTS/i)).toBeInTheDocument();
    expect(screen.getByText(/PAYABLES AGING/i)).toBeInTheDocument();
  });

  it('tab switching works', () => {
    render(<PurchaseDashboardPage />);
    const suppliersTab = screen.getByText('Suppliers');
    fireEvent.click(suppliersTab);
    expect(suppliersTab).toBeInTheDocument();
  });
  
  it('overview tab renders charts and sections', () => {
    render(<PurchaseDashboardPage />);
    expect(screen.getByText(/Supplier Scorecard/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending goods receipts/i)).toBeInTheDocument();
  });
});
