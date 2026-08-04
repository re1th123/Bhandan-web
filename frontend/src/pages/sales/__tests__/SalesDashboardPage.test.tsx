import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import SalesDashboardPage from '../SalesDashboardPage';

// Mock recharts to avoid canvas/SVG issues
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

// Mock framer-motion cleanly without importing heavy actual package
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    create: (Component: any) => (props: any) => <Component {...props} />,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock Lucide icons
vi.mock('lucide-react', () => {
  const React = require('react');
  return new Proxy({}, {
    get: function(_, prop) {
      return (props: any) => React.createElement('div', { 'data-testid': `icon-${String(prop).toLowerCase()}`, ...props });
    }
  });
});

describe('SalesDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders heading', () => {
    render(<SalesDashboardPage />);
    expect(screen.getByText(/Sales Intelligence/i)).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<SalesDashboardPage />);
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /customers/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /sales orders/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /delivery challans/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tax invoices/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /payments/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /credit notes/i })).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<SalesDashboardPage />);
    expect(screen.getByRole('button', { name: /New Sales Order/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tax Invoice/i })).toBeInTheDocument();
  });

  it('shows KPI card titles', () => {
    render(<SalesDashboardPage />);
    expect(screen.getByText(/Total Sales/i)).toBeInTheDocument();
    expect(screen.getByText(/Outstanding Receivables/i)).toBeInTheDocument();
    expect(screen.getByText(/Active Orders/i)).toBeInTheDocument();
    expect(screen.getByText(/Avg(.*)Order Value/i)).toBeInTheDocument();
  });

  it('tab switching updates content', () => {
    render(<SalesDashboardPage />);
    
    const customersTab = screen.getByRole('tab', { name: /customers/i });
    fireEvent.click(customersTab);
    expect(customersTab).toHaveAttribute('aria-selected', 'true');
  });

  it('overview tab renders chart and sections', () => {
    render(<SalesDashboardPage />);
    
    expect(screen.getByText(/Revenue Trend/i)).toBeInTheDocument();
    expect(screen.getByText(/Top 5 Customers/i)).toBeInTheDocument();
    expect(screen.getByText(/Collections Aging/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('chart-container').length).toBeGreaterThan(0);
  });

  it('clicking New Sales Order quick action switches to Sales Orders tab and opens creation dialog', () => {
    render(<SalesDashboardPage />);
    const newOrderBtn = screen.getByRole('button', { name: /New Sales Order/i });
    fireEvent.click(newOrderBtn);
    expect(screen.getByRole('tab', { name: /sales orders/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/Create New Sales Order/i)).toBeInTheDocument();
  });
});
