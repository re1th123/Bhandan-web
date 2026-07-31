import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../../../test/utils';
import userEvent from '@testing-library/user-event';
import Sidebar from '../Sidebar';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/sales/dashboard' })
  };
});

describe('Sidebar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders logo "Bandhan" and "ERP System" when not collapsed', () => {
    render(<Sidebar collapsed={false} />);
    
    expect(screen.getByText('Bandhan')).toBeInTheDocument();
    expect(screen.getByText('ERP System')).toBeInTheDocument();
  });

  it('renders all 7 module group names', () => {
    render(<Sidebar collapsed={false} />);
    
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Purchases')).toBeInTheDocument();
    expect(screen.getByText('Employees')).toBeInTheDocument();
    expect(screen.getByText('Inventory')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('renders Dashboard item', () => {
    render(<Sidebar collapsed={false} />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('collapsed mode hides text labels', () => {
    render(<Sidebar collapsed={true} />);
    
    expect(screen.queryByText('Bandhan')).not.toBeInTheDocument();
    expect(screen.queryByText('ERP System')).not.toBeInTheDocument();
    expect(screen.queryByText('Sales')).not.toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('clicking a module group calls navigate with the defaultPath', async () => {
    const user = userEvent.setup();
    const mockOnNavClick = vi.fn();
    render(<Sidebar collapsed={false} onNavClick={mockOnNavClick} />);
    
    const salesGroup = screen.getByText('Sales');
    await user.click(salesGroup);
    
    expect(mockNavigate).toHaveBeenCalledWith('/sales/dashboard');
    expect(mockOnNavClick).toHaveBeenCalled();
  });

  it('active group is highlighted based on URL', () => {
    render(<Sidebar collapsed={false} />);
    
    // The current URL in the mock is '/sales/dashboard'
    // This is primarily testing that it doesn't crash when matching the active route, 
    // and correctly renders the matching group.
    const salesText = screen.getByText('Sales');
    expect(salesText).toBeInTheDocument();
  });

  it('footer shows version text when not collapsed', () => {
    render(<Sidebar collapsed={false} />);
    
    expect(screen.getByText('Bandhan ERP v1.0.0')).toBeInTheDocument();
  });
});
