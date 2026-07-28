import React from 'react';
import {
  Box, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Divider, Tooltip, alpha, useTheme,
} from '@mui/material';
import {
  Dashboard, People, ShoppingCart, Inventory2, AccountBalance,
  Assessment, Settings, TrendingUp,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavGroup {
  group: string;
  icon: React.ReactNode;
  color: string;
  defaultPath: string;
}

const NAV_GROUPS: NavGroup[] = [
  {
    group: 'Sales',
    icon: <TrendingUp />,
    color: '#43A047',
    defaultPath: '/sales/dashboard',
  },
  {
    group: 'Purchases',
    icon: <ShoppingCart />,
    color: '#E53935',
    defaultPath: '/purchases/dashboard',
  },
  {
    group: 'Employees',
    icon: <People />,
    color: '#00897B',
    defaultPath: '/employees/dashboard',
  },
  {
    group: 'Inventory',
    icon: <Inventory2 />,
    color: '#0288D1',
    defaultPath: '/inventory/dashboard',
  },
  {
    group: 'Finance',
    icon: <AccountBalance />,
    color: '#7B1FA2',
    defaultPath: '/finance/dashboard',
  },
  {
    group: 'Reports',
    icon: <Assessment />,
    color: '#F9A825',
    defaultPath: '/reports/dashboard',
  },
  {
    group: 'Settings',
    icon: <Settings />,
    color: '#5A5D72',
    defaultPath: '/settings/dashboard',
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

  const isDark = theme.palette.mode === 'dark';

  const isGroupActive = (defaultPath: string) => {
    const groupBasePath = defaultPath.split('/').slice(0, 2).join('/');
    return location.pathname.startsWith(groupBasePath);
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavClick?.();
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
        <List dense disablePadding>
          {NAV_GROUPS.map((group) => {
            const groupActive = isGroupActive(group.defaultPath);

            return (
              <Box key={group.group} mb={0.5}>
                <Tooltip title={collapsed ? group.group : ''} placement="right">
                  <ListItemButton
                    selected={groupActive}
                    onClick={() => handleNav(group.defaultPath)}
                    sx={{
                      mx: 1, borderRadius: 2.5, minHeight: 44, px: 1.5,
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      bgcolor: groupActive ? alpha(group.color, 0.08) : 'transparent',
                      '&:hover': { bgcolor: alpha(group.color, 0.12) },
                      '&.Mui-selected': {
                        bgcolor: alpha(group.color, 0.12),
                        '&:hover': { bgcolor: alpha(group.color, 0.16) },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 36,
                        color: groupActive ? group.color : 'text.secondary',
                      }}
                    >
                      {React.cloneElement(group.icon as React.ReactElement, {
                        sx: { fontSize: collapsed ? 20 : 24 }
                      })}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText
                        primary={group.group}
                        primaryTypographyProps={{
                          fontWeight: groupActive ? 700 : 500,
                          fontSize: '0.875rem',
                          color: groupActive ? group.color : 'text.primary',
                        }}
                      />
                    )}
                  </ListItemButton>
                </Tooltip>
              </Box>
            );
          })}
        </List>
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
