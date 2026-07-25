import React, { useState } from 'react';
import {
  Box, Drawer, AppBar, Toolbar, IconButton, Typography,
  Avatar, Badge, Tooltip, Menu, MenuItem, Divider,
  useMediaQuery, useTheme, alpha, Chip,
} from '@mui/material';
import {
  Menu as MenuIcon, MenuOpen, Notifications, DarkMode, LightMode,
  KeyboardArrowDown, Logout, Settings, AccountCircle, Business,
} from '@mui/icons-material';
import { Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

const AppShell: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const navigate = useNavigate();

  const { sidebarCollapsed, setSidebarCollapsed, themeMode, toggleTheme } = useUIStore();
  const { user, activeBusiness, logout } = useAuthStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);

  const drawerWidth = isMobile ? DRAWER_WIDTH : sidebarCollapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const handleLogout = async () => {
    setAnchorEl(null);
    await logout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.drawer - 1,
        }}
      >
        <Toolbar sx={{ gap: 1, minHeight: { xs: 56, sm: 64 } }}>
          {/* Sidebar toggle */}
          <IconButton
            onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setSidebarCollapsed(!sidebarCollapsed)}
            sx={{ color: 'text.secondary' }}
          >
            {(!isMobile && sidebarCollapsed) || (isMobile && !mobileOpen)
              ? <MenuIcon />
              : <MenuOpen />
            }
          </IconButton>

          {/* Business name */}
          {activeBusiness && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 1 }}>
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: 2,
                  background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Business sx={{ color: 'white', fontSize: 18 }} />
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={700} lineHeight={1.2}>
                  {activeBusiness.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" lineHeight={1}>
                  {activeBusiness.gstin || 'ERP System'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box sx={{ flex: 1 }} />

          {/* Current FY Badge */}
          <Chip
            label="FY 2025-26"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.7rem',
              display: { xs: 'none', sm: 'flex' },
            }}
          />

          {/* Theme toggle */}
          <Tooltip title={themeMode === 'light' ? 'Dark Mode' : 'Light Mode'}>
            <IconButton onClick={toggleTheme} sx={{ color: 'text.secondary' }}>
              {themeMode === 'light' ? <DarkMode /> : <LightMode />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={(e) => setNotifAnchor(e.currentTarget)}
              sx={{ color: 'text.secondary' }}
            >
              <Badge badgeContent={3} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={notifAnchor}
            open={Boolean(notifAnchor)}
            onClose={() => setNotifAnchor(null)}
            PaperProps={{ sx: { width: 320, borderRadius: 3, mt: 1 } }}
          >
            <Box px={2} py={1.5}>
              <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
            </Box>
            <Divider />
            {[
              { title: '3 Invoices Overdue', sub: 'Customer payments pending', color: 'error.main' },
              { title: 'Low Stock Alert', sub: '2 products below minimum', color: 'warning.main' },
              { title: 'Journal Entry Pending', sub: 'Approval required', color: 'info.main' },
            ].map((n, i) => (
              <MenuItem key={i} sx={{ py: 1.5, gap: 1.5 }}>
                <Box
                  sx={{
                    width: 8, height: 8, borderRadius: '50%',
                    bgcolor: n.color, flexShrink: 0, mt: 0.5,
                  }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={600}>{n.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{n.sub}</Typography>
                </Box>
              </MenuItem>
            ))}
          </Menu>

          {/* User Menu */}
          <Box
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
              px: 1.5, py: 0.75, borderRadius: 3,
              '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
              transition: 'background 0.2s',
            }}
          >
            <Avatar
              sx={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                fontSize: '0.85rem', fontWeight: 700,
              }}
            >
              {user?.email?.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Typography variant="caption" fontWeight={700} display="block" lineHeight={1.3}>
                {user?.full_name || user?.email?.split('@')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1}>
                Administrator
              </Typography>
            </Box>
            <KeyboardArrowDown sx={{ color: 'text.secondary', fontSize: 18 }} />
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            PaperProps={{ sx: { width: 200, borderRadius: 3, mt: 1 } }}
          >
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings/business'); }}>
              <AccountCircle sx={{ mr: 1.5, fontSize: 20 }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings/business'); }}>
              <Settings sx={{ mr: 1.5, fontSize: 20 }} /> Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Logout sx={{ mr: 1.5, fontSize: 20 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar — mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Sidebar collapsed={false} onNavClick={() => setMobileOpen(false)} />
      </Drawer>

      {/* Sidebar — desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', lg: 'block' },
          width: drawerWidth,
          flexShrink: 0,
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Sidebar collapsed={sidebarCollapsed} />
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box sx={{ flex: 1, overflow: 'auto', p: { xs: 2, sm: 3 } }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;
