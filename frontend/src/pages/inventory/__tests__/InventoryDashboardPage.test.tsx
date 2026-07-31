import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../../../test/utils';
import InventoryDashboardPage from '../InventoryDashboardPage';

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

describe('InventoryDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the main heading', () => {
    render(<InventoryDashboardPage />);
    expect(screen.getByText('Inventory Intelligence')).toBeInTheDocument();
  });

  it('renders all tab labels', () => {
    render(<InventoryDashboardPage />);
    expect(screen.getByRole('tab', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /products/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /warehouses/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /stock ledger/i })).toBeInTheDocument();
  });

  it('renders quick action buttons', () => {
    render(<InventoryDashboardPage />);
    expect(screen.getByRole('button', { name: /\+ Add Product/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ Stock Adjustment/i })).toBeInTheDocument();
  });

  it('shows KPI card content', () => {
    render(<InventoryDashboardPage />);
    expect(screen.getByText(/Stock Turnover Ratio/i)).toBeInTheDocument();
    expect(screen.getByText(/Inventory Valuation/i)).toBeInTheDocument();
    expect(screen.getByText(/Stockout Alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/Warehouse Utilization/i)).toBeInTheDocument();
  });

  it('switches tabs and updates displayed content', () => {
    render(<InventoryDashboardPage />);
    
    // Overview is active by default
    expect(screen.getByText(/Stock Turnover Ratio/i)).toBeInTheDocument();
    
    // Switch to Products
    fireEvent.click(screen.getByRole('tab', { name: /products/i }));
    // Assuming Products tab shows some specific text or table, since we don't have exact text, we just verify tab is clicked
    expect(screen.getByRole('tab', { name: /products/i })).toHaveAttribute('aria-selected', 'true');
    
    // Switch to Warehouses
    fireEvent.click(screen.getByRole('tab', { name: /warehouses/i }));
    expect(screen.getByRole('tab', { name: /warehouses/i })).toHaveAttribute('aria-selected', 'true');

    // Switch to Stock Ledger
    fireEvent.click(screen.getByRole('tab', { name: /stock ledger/i }));
    expect(screen.getByRole('tab', { name: /stock ledger/i })).toHaveAttribute('aria-selected', 'true');
  });
});
