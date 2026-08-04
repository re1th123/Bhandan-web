import React, { useState, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Avatar,
  useTheme,
  alpha,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  Clock,
  ShoppingCart,
  ArrowUpRight,
  Plus,
  CreditCard,
  AlertCircle,
  FileText
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

// Lazy load tab components
const CustomersPage = lazy(() => import('./CustomersPage'));
const SalesOrdersPage = lazy(() => import('./SalesOrdersPage'));
const DeliveryChallansPage = lazy(() => import('./DeliveryChallansPage'));
const TaxInvoicesPage = lazy(() => import('./TaxInvoicesPage'));
const CustomerPaymentsPage = lazy(() => import('./CustomerPaymentsPage'));
const CreditNotesPage = lazy(() => import('./CreditNotesPage'));
const QuickSaleModal = lazy(() => import('../../components/sales/QuickSaleModal'));

const MotionCard = motion.create(Card);

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// Mock data
const mockRevenueData = [
  { month: 'Apr', revenue: 2800000, target: 2500000 },
  { month: 'May', revenue: 3200000, target: 2600000 },
  { month: 'Jun', revenue: 2900000, target: 2700000 },
  { month: 'Jul', revenue: 3500000, target: 2800000 },
  { month: 'Aug', revenue: 3100000, target: 2900000 },
  { month: 'Sep', revenue: 3850000, target: 3000000 },
];

const mockTopCustomers = [
  { id: 1, name: 'TechVision India Ltd', amount: 1250000, percentage: 85, color: '#1976D2' },
  { id: 2, name: 'Global Logistics Solutions', amount: 980000, percentage: 70, color: '#43A047' },
  { id: 3, name: 'Metro Retail Group', amount: 840000, percentage: 65, color: '#FB8C00' },
  { id: 4, name: 'Sunrise Manufacturing', amount: 620000, percentage: 50, color: '#8E24AA' },
  { id: 5, name: 'Prime Distributors', amount: 450000, percentage: 40, color: '#00897B' },
];

const mockRecentActivity = [
  { id: 'INV-2024-089', customer: 'TechVision India Ltd', type: 'Tax Invoice', amount: 125000, date: '2026-07-28', status: 'Paid' },
  { id: 'SO-2024-112', customer: 'Global Logistics', type: 'Sales Order', amount: 340000, date: '2026-07-27', status: 'Processing' },
  { id: 'INV-2024-088', customer: 'Metro Retail Group', type: 'Tax Invoice', amount: 85000, date: '2026-07-26', status: 'Pending' },
  { id: 'PAY-2024-045', customer: 'Sunrise Manufacturing', type: 'Payment', amount: 150000, date: '2026-07-25', status: 'Completed' },
  { id: 'DC-2024-067', customer: 'Prime Distributors', type: 'Delivery Challan', amount: 0, date: '2026-07-25', status: 'Delivered' },
];

const mockAgingSummary = [
  { bucket: 'Current', amount: 850000, count: 12, percentage: 60, color: '#43A047' },
  { bucket: '1-30 Days', amount: 320000, count: 8, percentage: 22, color: '#FB8C00' },
  { bucket: '31-60 Days', amount: 150000, count: 5, percentage: 10, color: '#F4511E' },
  { bucket: '61-90 Days', amount: 75000, count: 3, percentage: 5, color: '#E53935' },
  { bucket: '>90 Days', amount: 25000, count: 4, percentage: 3, color: '#B71C1C' },
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'delivered':
      return 'success';
    case 'processing':
      return 'info';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
    <CircularProgress />
  </Box>
);

export default function SalesDashboardPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { activeBusiness } = useAuthStore();
  const [activeTab, setActiveTab] = useState(0);
  const [openCreateOrder, setOpenCreateOrder] = useState(false);
  const [openQuickSale, setOpenQuickSale] = useState(false);

  // Query example - falls back to mock data
  const { data: dashboardData } = useQuery({
    queryKey: ['sales-dashboard', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness?.id) return null;
      // Actual Supabase queries would go here
      return {
        revenueData: mockRevenueData,
        topCustomers: mockTopCustomers,
        recentActivity: mockRecentActivity,
        agingSummary: mockAgingSummary
      };
    },
    enabled: !!activeBusiness?.id
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const data = dashboardData || {
    revenueData: mockRevenueData,
    topCustomers: mockTopCustomers,
    recentActivity: mockRecentActivity,
    agingSummary: mockAgingSummary
  };

  const fyStr = `FY ${dayjs().month() >= 3 ? dayjs().year() : dayjs().year() - 1}-${dayjs().month() >= 3 ? dayjs().year() + 1 : dayjs().year()}`;

  const renderOverview = () => (
    <Box sx={{ mt: 3 }}>
      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ height: '100%' }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600}>
                    TOTAL SALES (MTD)
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: theme.palette.success.main }}>
                    ₹38.5L
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main }}>
                  <TrendingUp size={24} />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                <ArrowUpRight size={16} color={theme.palette.success.main} />
                <Typography variant="body2" color="success.main" fontWeight={500} sx={{ ml: 0.5 }}>
                  +12.4%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            sx={{ height: '100%' }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600}>
                    OUTSTANDING RECEIVABLES
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: theme.palette.info.main }}>
                    ₹14.2L
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}>
                  <CreditCard size={24} />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                <AlertCircle size={16} color={theme.palette.warning.main} />
                <Typography variant="body2" color="warning.main" fontWeight={500} sx={{ ml: 0.5 }}>
                  32 unpaid invoices
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            sx={{ height: '100%' }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600}>
                    ACTIVE ORDERS
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: theme.palette.warning.main }}>
                    24
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.main }}>
                  <ShoppingCart size={24} />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                <Clock size={16} color={theme.palette.text.secondary} />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  8 pending delivery
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            sx={{ height: '100%' }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="overline" color="text.secondary" fontWeight={600}>
                    AVG ORDER VALUE
                  </Typography>
                  <Typography variant="h4" fontWeight={700} sx={{ mt: 1, color: theme.palette.secondary.main }}>
                    ₹13,240
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.main }}>
                  <FileText size={24} />
                </Avatar>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mt: 2 }}>
                <ArrowUpRight size={16} color={theme.palette.success.main} />
                <Typography variant="body2" color="success.main" fontWeight={500} sx={{ ml: 0.5 }}>
                  +5.8%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Revenue Trend
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Monthly sales performance vs target
              </Typography>
              <Box sx={{ height: 350, width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis 
                      tickFormatter={(value) => `₹${value / 100000}L`}
                      stroke={theme.palette.text.secondary}
                    />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ 
                        backgroundColor: isDark ? theme.palette.background.paper : '#fff',
                        borderColor: isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1),
                        borderRadius: 8
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Revenue"
                      stroke={theme.palette.primary.main} 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target" 
                      name="Target"
                      stroke={theme.palette.text.disabled} 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="none" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Top 5 Customers
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                By revenue this financial year
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                {data.topCustomers.map((customer) => (
                  <Box key={customer.id}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(customer.color, 0.1), color: customer.color, mr: 1.5, fontSize: '0.875rem', fontWeight: 600 }}>
                          {customer.name.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>
                          {customer.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {formatCurrency(customer.amount)}
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={customer.percentage} 
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: customer.color,
                          borderRadius: 3
                        }
                      }} 
                    />
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Sales Activity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Reference</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Amount</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.recentActivity.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>{row.id}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {dayjs(row.date).format('DD MMM YYYY')}
                          </Typography>
                        </TableCell>
                        <TableCell>{row.customer}</TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell align="right">{row.amount > 0 ? formatCurrency(row.amount) : '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={row.status} 
                            size="small" 
                            color={getStatusColor(row.status) as any}
                            variant="outlined"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Collections Aging Summary
              </Typography>
              <TableContainer sx={{ mt: 2 }}>
                <Table size="small">
                  <TableBody>
                    {data.agingSummary.map((row, idx) => (
                      <TableRow key={idx} sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ pl: 0, py: 1.5 }}>
                          <Box display="flex" alignItems="center">
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                bgcolor: row.color,
                                mr: 1.5
                              }} 
                            />
                            <Typography variant="body2">{row.bucket}</Typography>
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 3 }}>
                            {row.count} invoices
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 0, py: 1.5 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(row.amount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {row.percentage}%
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Sales Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {fyStr} • As of {dayjs().format('MMMM D, YYYY')}
          </Typography>
        </Box>
        <Box display="flex" gap={2}>
          <Button 
            variant="outlined" 
            startIcon={<Plus size={18} />}
            sx={{ fontWeight: 600 }}
            onClick={() => {
              setActiveTab(2);
              setOpenCreateOrder(true);
            }}
          >
            New Sales Order
          </Button>
          <Button 
            variant="outlined" 
            startIcon={<Plus size={18} />}
            sx={{ fontWeight: 600 }}
            onClick={() => setOpenQuickSale(true)}
          >
            Tax Invoice
          </Button>
        </Box>
      </Box>

      {/* Top Sub-Navigation Tab Bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 48,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '0.95rem'
            }
          }}
        >
          <Tab label="Overview" />
          <Tab label="Customers" />
          <Tab label="Sales Orders" />
          <Tab label="Delivery Challans" />
          <Tab label="Tax Invoices" />
          <Tab label="Payments" />
          <Tab label="Credit Notes" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ minHeight: 'calc(100vh - 250px)' }}>
        <Suspense fallback={<LoadingFallback />}>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && <CustomersPage />}
          {activeTab === 2 && (
            <SalesOrdersPage
              openCreate={openCreateOrder}
              onCloseCreate={() => setOpenCreateOrder(false)}
            />
          )}
          {activeTab === 3 && <DeliveryChallansPage />}
          {activeTab === 4 && <TaxInvoicesPage />}
          {activeTab === 5 && <CustomerPaymentsPage />}
          {activeTab === 6 && <CreditNotesPage />}
        </Suspense>
      </Box>

      {/* Quick Sale / Tax Invoice Modal */}
      <Suspense fallback={null}>
        <QuickSaleModal
          open={openQuickSale}
          onClose={() => setOpenQuickSale(false)}
          onSuccess={() => setOpenQuickSale(false)}
        />
      </Suspense>
    </Box>
  );
}
