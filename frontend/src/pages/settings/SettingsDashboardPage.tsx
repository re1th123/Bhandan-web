import React, { useState, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Avatar,
  LinearProgress,
  useTheme,
  alpha,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Stack,
} from '@mui/material';
import {
  Settings,
  Shield,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Globe,
  Plus,
} from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

import { useAuthStore } from '../../stores/authStore';
import { createBusinessForUser } from '../../lib/businessService';

const MotionCard = motion.create(Card);

// Lazy load sub-pages
const FinancialYearsPage = lazy(() => import('./FinancialYearsPage'));
const UsersRolesPage = lazy(() => import('./UsersRolesPage'));

const TabLoader = () => (
  <Box display="flex" alignItems="center" justifyContent="center" minHeight="40vh">
    <CircularProgress color="primary" />
  </Box>
);

const TABS = [
  { label: 'Overview', icon: <Settings size={16} /> },
  { label: 'Financial Years', icon: <Calendar size={16} /> },
  { label: 'Users & Roles', icon: <Users size={16} /> },
];

const SettingsDashboardPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { user, activeBusiness, businesses, setActiveBusiness, loadUserBusinesses } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);

  // New Business Dialog State
  const [openNewBiz, setOpenNewBiz] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [gstinInput, setGstinInput] = useState('');
  const [loadingNewBiz, setLoadingNewBiz] = useState(false);
  const [newBizError, setNewBizError] = useState('');

  const handleRegisterNewBiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !nameInput.trim()) return;
    setLoadingNewBiz(true);
    setNewBizError('');
    try {
      const b = await createBusinessForUser(user.id, {
        business_name: nameInput.trim(),
        phone: phoneInput.trim(),
        gstin: gstinInput.trim() || undefined,
        email: user.email,
      });
      await loadUserBusinesses(user.id);
      setActiveBusiness(b);
      setOpenNewBiz(false);
      setNameInput('');
      setPhoneInput('');
      setGstinInput('');
    } catch (err: any) {
      setNewBizError(err.message || 'Failed to register business');
    } finally {
      setLoadingNewBiz(false);
    }
  };

  const gridColor = isDark ? alpha('#fff', 0.06) : alpha('#000', 0.02);

  const renderOverview = () => (
    <Box>
      {/* Business Profile Card */}
      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} lg={8}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2.5} mb={3}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                  }}
                >
                  {activeBusiness?.name?.charAt(0) || 'B'}
                </Avatar>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={800}>
                    {activeBusiness?.name || 'My Business'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {activeBusiness?.address || 'Business Address'}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Chip
                      label={`GSTIN: ${activeBusiness?.gstin || 'Not Registered'}`}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                    <Chip
                      label={`PAN: ${activeBusiness?.pan || 'Not Provided'}`}
                      size="small"
                      sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                    />
                    <Chip
                      icon={<CheckCircle2 size={12} />}
                      label="Active"
                      size="small"
                      sx={{
                        bgcolor: alpha('#43A047', 0.12),
                        color: '#43A047',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={2}>
                {[
                  { label: 'Phone', value: activeBusiness?.phone || 'Not Provided', icon: <Globe size={16} /> },
                  { label: 'Currency', value: activeBusiness?.default_currency || 'INR', icon: <FileText size={16} /> },
                  { label: 'FY Start Month', value: `Month ${activeBusiness?.fy_start_month || 4} (April)`, icon: <Calendar size={16} /> },
                  { label: 'Status', value: activeBusiness?.is_active ? 'Active' : 'Inactive', icon: <CheckCircle2 size={16} /> },
                ].map((item) => (
                  <Grid item xs={6} sm={3} key={item.label}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? alpha('#fff', 0.04) : alpha('#000', 0.02),
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={0.75} mb={0.5}>
                        <Box sx={{ color: 'text.secondary' }}>{item.icon}</Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={700}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} mb={2}>
                System Health
              </Typography>
              {[
                { label: 'Database Connection', status: 'Connected', color: '#43A047', pct: 100 },
                { label: 'API Status', status: 'Healthy', color: '#43A047', pct: 100 },
                { label: 'Storage Used', status: '2.4 GB / 10 GB', color: '#1976D2', pct: 24 },
                { label: 'Active Sessions', status: '3 users online', color: '#FB8C00', pct: 60 },
              ].map((item) => (
                <Box key={item.label} mb={1.5}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontWeight={600}>{item.label}</Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {item.status}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={item.pct}
                    sx={{
                      height: 5,
                      borderRadius: 4,
                      bgcolor: alpha(item.color, 0.12),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: item.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Registered Businesses List */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        sx={{ mb: 3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Registered Businesses ({businesses.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Switch active business or register additional wholesale enterprises linked to your account
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setOpenNewBiz(true)}
              sx={{
                background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                fontWeight: 700,
                borderRadius: 2,
              }}
            >
              Register Additional Business
            </Button>
          </Box>

          <Grid container spacing={2}>
            {businesses.map((b) => {
              const isActive = b.id === activeBusiness?.id;
              return (
                <Grid item xs={12} sm={6} md={4} key={b.id}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1.5px solid ${isActive ? theme.palette.primary.main : alpha(theme.palette.divider, 0.5)}`,
                      bgcolor: isActive ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          sx={{
                            width: 40, height: 40,
                            bgcolor: isActive ? 'primary.main' : alpha(theme.palette.text.secondary, 0.15),
                            color: isActive ? 'white' : 'text.primary',
                            fontWeight: 700,
                          }}
                        >
                          {b.name?.charAt(0) || 'B'}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {b.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {b.gstin ? `GSTIN: ${b.gstin}` : 'Unregistered GST'}
                          </Typography>
                        </Box>
                      </Box>
                      {isActive && (
                        <Chip
                          icon={<CheckCircle2 size={12} />}
                          label="Active"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700, fontSize: '0.65rem' }}
                        />
                      )}
                    </Box>

                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                      Phone: {b.phone || 'N/A'} • Currency: {b.default_currency || 'INR'}
                    </Typography>

                    {!isActive && (
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={() => setActiveBusiness(b)}
                        sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none' }}
                      >
                        Switch to Active
                      </Button>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </MotionCard>

      {/* Quick Access Cards */}
      <Grid container spacing={2.5} mb={3}>
        {[
          {
            title: 'Financial Years',
            desc: 'Manage fiscal year periods, lock/close years',
            icon: <Calendar size={22} />,
            color: '#1976D2',
            stat: 'Current: FY 2025-26',
            action: () => setActiveTab(1),
          },
          {
            title: 'Users & Roles',
            desc: 'Manage user accounts, roles, and permissions',
            icon: <Shield size={22} />,
            color: '#8E24AA',
            stat: '4 active users',
            action: () => setActiveTab(2),
          },
          {
            title: 'Compliance',
            desc: 'GSTIN verification, PAN validation status',
            icon: <CheckCircle2 size={22} />,
            color: '#43A047',
            stat: 'All verified',
            action: () => {},
          },
          {
            title: 'Notifications',
            desc: 'Configure alerts, email, and SMS preferences',
            icon: <AlertTriangle size={22} />,
            color: '#FB8C00',
            stat: '3 active rules',
            action: () => {},
          },
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: `0 8px 24px ${alpha(card.color, 0.15)}`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
              onClick={card.action}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.5,
                    background: `linear-gradient(135deg, ${card.color}, ${alpha(card.color, 0.7)})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    color: 'white',
                    boxShadow: `0 4px 12px ${alpha(card.color, 0.35)}`,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={700} mb={0.5}>
                  {card.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  {card.desc}
                </Typography>
                <Chip
                  label={card.stat}
                  size="small"
                  sx={{
                    bgcolor: alpha(card.color, 0.1),
                    color: card.color,
                    fontWeight: 700,
                    fontSize: '0.7rem',
                  }}
                />
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <MotionCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Recent System Activity
          </Typography>
          {[
            { action: 'User role updated', user: 'Admin', time: '2 hours ago', type: 'security' },
            { action: 'FY 2024-25 locked', user: 'System', time: '1 day ago', type: 'finance' },
            { action: 'New user invited', user: 'Admin', time: '3 days ago', type: 'user' },
            { action: 'Business profile updated', user: 'Owner', time: '5 days ago', type: 'settings' },
            { action: 'Backup completed', user: 'System', time: '1 week ago', type: 'system' },
          ].map((activity, i) => (
            <Box
              key={i}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                py: 1.25,
                borderBottom: i < 4 ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor:
                    activity.type === 'security'
                      ? '#E53935'
                      : activity.type === 'finance'
                      ? '#1976D2'
                      : activity.type === 'user'
                      ? '#8E24AA'
                      : '#43A047',
                  flexShrink: 0,
                }}
              />
              <Box flex={1}>
                <Typography variant="body2" fontWeight={600}>
                  {activity.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  by {activity.user}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {activity.time}
              </Typography>
            </Box>
          ))}
        </CardContent>
      </MotionCard>
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1}
          flexWrap="wrap"
          gap={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={800} mb={0.5}>
              Settings & Configuration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Business profile, financial years, and system preferences — {dayjs().format('dddd, DD MMMM YYYY')}
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Tab Bar */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: 3,
          mt: 1,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              minHeight: 48,
              gap: 0.75,
            },
            '& .Mui-selected': {
              color: '#5A5D72',
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#5A5D72',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.label}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && renderOverview()}
      {activeTab === 1 && (
        <Suspense fallback={<TabLoader />}>
          <FinancialYearsPage />
        </Suspense>
      )}
      {/* Register Business Dialog */}
      <Dialog
        open={openNewBiz}
        onClose={() => setOpenNewBiz(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <form onSubmit={handleRegisterNewBiz}>
          <DialogTitle sx={{ fontWeight: 700 }}>Register Additional Business</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create and link another business enterprise under your account. You can switch between active businesses at any time.
            </Typography>

            {newBizError && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {newBizError}
              </Alert>
            )}

            <Stack spacing={2.5}>
              <TextField
                label="Business Name"
                required
                fullWidth
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Bandhan Logistics Pvt Ltd"
              />
              <TextField
                label="Phone Number"
                fullWidth
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="e.g. +91 98765 43210"
              />
              <TextField
                label="GSTIN (Optional)"
                fullWidth
                value={gstinInput}
                onChange={(e) => setGstinInput(e.target.value)}
                placeholder="e.g. 27AAACB1234D1ZB"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenNewBiz(false)} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loadingNewBiz || !nameInput.trim()}
              sx={{
                background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                fontWeight: 700,
                px: 3,
              }}
            >
              {loadingNewBiz ? <CircularProgress size={22} color="inherit" /> : 'Register Business'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SettingsDashboardPage;
