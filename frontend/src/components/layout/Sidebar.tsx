import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Collapse, Typography, Divider, Tooltip, alpha, useTheme,
} from '@mui/material';
import {
  Dashboard, People, ShoppingCart, LocalShipping, Receipt,
  Payment, Inventory2, Warehouse, AccountBalance, Article,
  AccountBalanceWallet, TrendingUp, Assessment, Gavel,
  Settings, ExpandLess, ExpandMore, Store, CurrencyRupee,
  BookOnline, Assignment, Summarize, BarChart, Calculate,
  FolderOpen, ReceiptLong, ManageAccounts, CalendarMonth,
  SyncAlt,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: NavItem[];
  badge?: string;
}

interface NavGroup {
  group: string;
  icon: React.ReactNode;
  color: string;
  defaultPath: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Sales',
    icon: <TrendingUp />,
    color: '#43A047',
    defaultPath: '/sales/dashboard',
    items: [
      { label: 'Sales Dashboard', icon: <Dashboard />, path: '/sales/dashboard' },
      { label: 'Customer Dashboard', icon: <People />, path: '/sales/customers-dashboard' },
      { label: 'Customers', icon: <People />, path: '/sales/customers' },
      { label: 'Sales Orders', icon: <Assignment />, path: '/sales/orders' },
      { label: 'Delivery Challans', icon: <LocalShipping />, path: '/sales/challans' },
      { label: 'Tax Invoices', icon: <ReceiptLong />, path: '/sales/invoices' },
      { label: 'Customer Payments', icon: <CurrencyRupee />, path: '/sales/payments' },
      { label: 'Credit Notes', icon: <Receipt />, path: '/sales/credit-notes' },
    ],
  },
  {
    group: 'Purchases',
    icon: <ShoppingCart />,
    color: '#E53935',
    defaultPath: '/purchases/dashboard',
    items: [
      { label: 'Purchase Dashboard', icon: <Dashboard />, path: '/purchases/dashboard' },
      { label: 'Suppliers', icon: <Store />, path: '/purchases/suppliers' },
      { label: 'Purchase Orders', icon: <BookOnline />, path: '/purchases/orders' },
      { label: 'Goods Receipt', icon: <FolderOpen />, path: '/purchases/grn' },
      { label: 'Purchase Invoices', icon: <Receipt />, path: '/purchases/invoices' },
      { label: 'Supplier Payments', icon: <Payment />, path: '/purchases/payments' },
    ],
  },
  {
    group: 'Employees',
    icon: <People />,
    color: '#00897B',
    defaultPath: '/employees/dashboard',
    items: [
      { label: 'Employee Dashboard', icon: <Dashboard />, path: '/employees/dashboard' },
    ],
  },
  {
    group: 'Inventory',
    icon: <Inventory2 />,
    color: '#0288D1',
    defaultPath: '/inventory/dashboard',
    items: [
      { label: 'Inventory Dashboard', icon: <Dashboard />, path: '/inventory/dashboard' },
      { label: 'Products', icon: <Inventory2 />, path: '/inventory/products' },
      { label: 'Warehouses', icon: <Warehouse />, path: '/inventory/warehouses' },
      { label: 'Stock Ledger', icon: <SyncAlt />, path: '/inventory/stock-ledger' },
    ],
  },
  {
    group: 'Finance',
    icon: <AccountBalance />,
    color: '#7B1FA2',
    defaultPath: '/finance/accounts',
    items: [
      { label: 'Expense Dashboard', icon: <ReceiptLong />, path: '/finance/expenses-dashboard' },
      { label: 'Loan Dashboard', icon: <AccountBalance />, path: '/finance/loans-dashboard' },
      { label: 'Chart of Accounts', icon: <AccountBalance />, path: '/finance/accounts' },
      { label: 'Journal Entries', icon: <Article />, path: '/finance/journal' },
      { label: 'Bank Accounts', icon: <AccountBalanceWallet />, path: '/finance/banks' },
      { label: 'Opening Balances', icon: <Calculate />, path: '/finance/opening-balances' },
    ],
  },
  {
    group: 'Reports',
    icon: <Assessment />,
    color: '#F9A825',
    defaultPath: '/reports/finance-dashboard',
    items: [
      { label: 'Financial Reports', icon: <Assessment />, path: '/reports/finance-dashboard' },
      { label: 'GST Dashboard', icon: <Gavel />, path: '/reports/gst-dashboard' },
      { label: 'P&L Statement', icon: <BarChart />, path: '/reports/profit-loss' },
      { label: 'Balance Sheet', icon: <Summarize />, path: '/reports/balance-sheet' },
      { label: 'Trial Balance', icon: <Assessment />, path: '/reports/trial-balance' },
      { label: 'GST Reports', icon: <Gavel />, path: '/reports/gst' },
    ],
  },
  {
    group: 'Settings',
    icon: <Settings />,
    color: '#5A5D72',
    defaultPath: '/settings/business',
    items: [
      { label: 'Business Profile', icon: <ManageAccounts />, path: '/settings/business' },
      { label: 'Financial Years', icon: <CalendarMonth />, path: '/settings/financial-years' },
      { label: 'Users & Roles', icon: <People />, path: '/settings/users' },
    ],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onNavClick?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onNavClick }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarExpandedGroups, toggleGroup } = useUIStore();

  const isDark = theme.palette.mode === 'dark';

  const isActive = (path?: string) => path && location.pathname === path;
  const isGroupActive = (items: NavItem[]) =>
    items.some((item) => item.path && location.pathname.startsWith(item.path.split('/').slice(0, 2).join('/')));

  const handleNav = (path: string) => {
    navigate(path);
    onNavClick?.();
  };

  const handleGroupHeaderClick = (groupName: string, defaultPath: string) => {
    if (!sidebarExpandedGroups.includes(groupName)) {
      toggleGroup(groupName);
    }
    handleNav(defaultPath);
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isDark ? '#12152E' : '#FAFBFF',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 0 : 1.5,
          px: collapsed ? 1.5 : 2.5,
          py: 2,
          minHeight: 64,
          justifyContent: collapsed ? 'center' : 'flex-start',
          overflow: 'hidden',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box
          sx={{
            width: 38, height: 38, borderRadius: 2.5, flexShrink: 0,
            background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(92,107,192,0.4)',
          }}
        >
          <Typography variant="h6" color="white" fontWeight={800} fontSize={18}>B</Typography>
        </Box>
        {!collapsed && (
          <Box>
            <Typography variant="h6" fontWeight={800} color="primary.main" lineHeight={1.2}>
              Bandhan
            </Typography>
            <Typography variant="caption" color="text.secondary" lineHeight={1} fontWeight={500}>
              ERP System
            </Typography>
          </Box>
        )}
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        {/* Dashboard */}
        <List dense disablePadding>
          <Tooltip title={collapsed ? 'Dashboard' : ''} placement="right">
            <ListItemButton
              selected={location.pathname === '/dashboard'}
              onClick={() => handleNav('/dashboard')}
              sx={{
                mx: 1, mb: 0.5, borderRadius: 2.5,
                justifyContent: collapsed ? 'center' : 'flex-start',
                minHeight: 44,
                px: collapsed ? 1.5 : 1.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 0 : 36,
                  color: location.pathname === '/dashboard' ? 'primary.main' : 'text.secondary',
                }}
              >
                <Dashboard />
              </ListItemIcon>
              {!collapsed && (
                <ListItemText
                  primary="Dashboard"
                  primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                />
              )}
            </ListItemButton>
          </Tooltip>
        </List>

        <Divider sx={{ mx: 2, my: 1, opacity: 0.5 }} />

        {/* Groups */}
        {NAV_GROUPS.map((group) => {
          const isExpanded = sidebarExpandedGroups.includes(group.group);
          const groupActive = isGroupActive(group.items);

          return (
            <Box key={group.group} mb={0.5}>
              {!collapsed ? (
                <>
                  {/* Tapping group header expands AND loads corresponding dashboard instantly */}
                  <ListItemButton
                    onClick={() => handleGroupHeaderClick(group.group, group.defaultPath)}
                    sx={{
                      mx: 1, borderRadius: 2.5, minHeight: 40, px: 1.5,
                      bgcolor: groupActive ? alpha(group.color, 0.08) : 'transparent',
                      '&:hover': { bgcolor: alpha(group.color, 0.12) },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: groupActive ? group.color : 'text.secondary',
                      }}
                    >
                      {group.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={group.group}
                      primaryTypographyProps={{
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: groupActive ? group.color : 'text.secondary',
                      }}
                    />
                    {isExpanded ? (
                      <ExpandLess sx={{ color: 'text.secondary', fontSize: 18 }} />
                    ) : (
                      <ExpandMore sx={{ color: 'text.secondary', fontSize: 18 }} />
                    )}
                  </ListItemButton>

                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List dense disablePadding>
                      {group.items.map((item) => (
                        <ListItemButton
                          key={item.label}
                          selected={isActive(item.path)}
                          onClick={() => item.path && handleNav(item.path)}
                          sx={{
                            mx: 1, borderRadius: 2.5, minHeight: 38,
                            pl: 2.5, pr: 1.5,
                            '&.Mui-selected': {
                              bgcolor: alpha(group.color, 0.12),
                              '& .MuiListItemIcon-root': { color: group.color },
                              '& .MuiListItemText-primary': { color: group.color, fontWeight: 700 },
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 32, color: 'text.secondary', fontSize: 18 }}>
                            {React.cloneElement(item.icon as React.ReactElement, { sx: { fontSize: 18 } })}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.label}
                            primaryTypographyProps={{ fontSize: '0.8rem', fontWeight: 500 }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                // Collapsed mode: tapping main group icon directly navigates to group dashboard
                <List dense disablePadding>
                  <Tooltip title={group.group} placement="right">
                    <ListItemButton
                      selected={groupActive}
                      onClick={() => handleNav(group.defaultPath)}
                      sx={{
                        mx: 1, borderRadius: 2.5, minHeight: 40,
                        justifyContent: 'center', px: 1.5,
                        bgcolor: groupActive ? alpha(group.color, 0.12) : 'transparent',
                        '&.Mui-selected': {
                          bgcolor: alpha(group.color, 0.12),
                          '& .MuiListItemIcon-root': { color: group.color },
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 0, color: groupActive ? group.color : 'text.secondary', fontSize: 20 }}>
                        {React.cloneElement(group.icon as React.ReactElement, { sx: { fontSize: 20 } })}
                      </ListItemIcon>
                    </ListItemButton>
                  </Tooltip>
                  <Divider sx={{ my: 0.5, mx: 1, opacity: 0.3 }} />
                </List>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Version footer */}
      {!collapsed && (
        <Box
          sx={{
            px: 2.5, py: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={500}>
            Bandhan ERP v1.0.0
          </Typography>
          <Typography variant="caption" display="block" color="text.secondary" fontSize={10}>
            © 2025 Bandhan Business
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Sidebar;
