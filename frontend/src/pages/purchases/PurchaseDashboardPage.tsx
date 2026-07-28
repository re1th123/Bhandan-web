import React, { useState, Suspense, lazy, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  ShoppingCart,
  Clock,
  Package,
  AlertCircle,
  Plus,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Building2,
  FileText,
  Truck,
  FileCheck,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

// Lazy loaded tab components
const SuppliersPage = lazy(() => import('./SuppliersPage'));
const PurchaseOrdersPage = lazy(() => import('./PurchaseOrdersPage'));
const GRNPage = lazy(() => import('./GRNPage'));
const PurchaseInvoicesPage = lazy(() => import('./PurchaseInvoicesPage'));
const SupplierPaymentsPage = lazy(() => import('./SupplierPaymentsPage'));

const MotionCard = motion.create(Card);

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const COLORS = {
  green: '#43A047', blue: '#1976D2', orange: '#FB8C00',
  red: '#E53935', purple: '#8E24AA', teal: '#00897B',
};

// Mock data
const mockCategoryData = [
  { name: 'Electronics', amount: 4500000 },
  { name: 'Apparel', amount: 2800000 },
  { name: 'Raw Materials', amount: 8400000 },
  { name: 'Stationery', amount: 500000 },
  { name: 'Logistics', amount: 1200000 },
];

const mockSupplierScorecard = [
  { name: 'Rajesh Traders', score: 98, color: COLORS.green },
  { name: 'Shree Enterprises', score: 84, color: COLORS.green },
  { name: 'Kumar & Co', score: 62, color: COLORS.orange },
  { name: 'Prime Logistics', score: 34, color: COLORS.red },
];

const mockPendingReceipts = [
  { id: 'PO-2025-089', description: 'Dell Laptops x15', due: 'Today' },
  { id: 'PO-2025-091', description: 'Office Chairs x20', due: 'Today' },
  { id: 'PO-2025-092', description: 'Printer Ink Cartridges', due: 'Tomorrow' },
];

const mockPaymentsDue = [
  { supplier: 'Rajesh Traders', amount: 150000, due: '2 Days' },
  { supplier: 'Shree Enterprises', amount: 45000, due: 'Today' },
  { supplier: 'TechVision Inc', amount: 280000, due: 'Urgent' },
];

export default function PurchaseDashboardPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const [activeTab, setActiveTab] = useState(0);
  const activeBusiness = useAuthStore((s) => s.activeBusiness);
  const bizId = activeBusiness?.id;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const { data: dashboardData } = useQuery({
    queryKey: ['purchaseDashboard', bizId],
    queryFn: async () => {
      if (!bizId) return null;
      // In a real app we would fetch from supabase here
      // For now returning mock data to satisfy requirements
      return {
        totalPurchase: 8400000,
        avgLeadTime: 4.2,
        pendingReceiptsCount: 24,
        payablesAging: 1200000,
      };
    },
    enabled: !!bizId,
  });

  const kpis = useMemo(() => {
    return [
      {
        title: 'TOTAL PURCHASE (MTD)',
        value: formatCurrency(dashboardData?.totalPurchase || 8400000),
        subtitle: 'vs ₹75.0L last month',
        change: '+12.4%',
        trend: 'up',
        icon: <ShoppingCart size={24} color={COLORS.blue} />,
        color: COLORS.blue,
      },
      {
        title: 'AVG. LEAD TIME',
        value: `${dashboardData?.avgLeadTime || 4.2} Days`,
        subtitle: 'Optimal range: 3-5 days',
        change: '-2.1%',
        trend: 'down',
        icon: <Clock size={24} color={COLORS.orange} />,
        color: COLORS.orange,
      },
      {
        title: 'PENDING RECEIPTS',
        value: `${dashboardData?.pendingReceiptsCount || 24} Units`,
        subtitle: 'Expect 8 arrivals today',
        change: '12 Actionable',
        trend: 'neutral',
        icon: <Package size={24} color={COLORS.green} />,
        color: COLORS.green,
      },
      {
        title: 'PAYABLES AGING',
        value: formatCurrency(dashboardData?.payablesAging || 1200000),
        subtitle: 'Due within 15 days',
        change: 'High Priority',
        trend: 'down',
        icon: <AlertCircle size={24} color={COLORS.red} />,
        color: COLORS.red,
      },
    ];
  }, [dashboardData]);

  const renderOverview = () => (
    <Box sx={{ mt: 3 }}>
      {/* KPI Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.title}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(kpi.color, 0.1) }}>
                    {kpi.icon}
                  </Box>
                  {kpi.trend !== 'neutral' ? (
                    <Chip
                      size="small"
                      icon={kpi.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      label={kpi.change}
                      sx={{
                        bgcolor: alpha(kpi.trend === 'up' ? COLORS.green : COLORS.red, 0.1),
                        color: kpi.trend === 'up' ? COLORS.green : COLORS.red,
                        fontWeight: 'bold',
                        '& .MuiChip-icon': { color: 'inherit' }
                      }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      label={kpi.change}
                      sx={{
                        bgcolor: alpha(kpi.color, 0.1),
                        color: kpi.color,
                        fontWeight: 'bold',
                      }}
                    />
                  )}
                </Box>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                  {kpi.value}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 1 }}>
                  {kpi.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            sx={{ height: '100%' }}
          >
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 3 }}>
                Purchase Trend by Category
              </Typography>
              <Box sx={{ flexGrow: 1, minHeight: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockCategoryData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#444' : '#eee'} />
                    <XAxis dataKey="name" stroke={isDark ? '#888' : '#666'} tick={{ fontSize: 12 }} />
                    <YAxis
                      stroke={isDark ? '#888' : '#666'}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: isDark ? '#333' : '#fff',
                        borderColor: isDark ? '#444' : '#ddd',
                        color: isDark ? '#fff' : '#000'
                      }}
                    />
                    <Bar dataKey="amount" fill={COLORS.blue} radius={[4, 4, 0, 0]} name="Purchase Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} md={4}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            sx={{ height: '100%' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Supplier Scorecard
                </Typography>
              </Box>
              <List disablePadding>
                {mockSupplierScorecard.map((supplier, i) => (
                  <Box key={supplier.name} sx={{ mb: i === mockSupplierScorecard.length - 1 ? 0 : 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight="500">
                        {supplier.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold" color={supplier.color}>
                        {supplier.score}/100
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={supplier.score}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(supplier.color, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: supplier.color,
                          borderRadius: 4,
                        }
                      }}
                    />
                  </Box>
                ))}
              </List>
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button variant="text" color="primary" endIcon={<ArrowRight size={16} />}>
                  View Full Analytics
                </Button>
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Action Lists Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            sx={{ height: '100%' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Pending Goods Receipts
                </Typography>
                <Chip
                  label="8 DUE TODAY"
                  size="small"
                  sx={{ bgcolor: alpha(COLORS.orange, 0.1), color: COLORS.orange, fontWeight: 'bold' }}
                />
              </Box>
              <List>
                {mockPendingReceipts.map((item, i) => (
                  <React.Fragment key={item.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box sx={{ p: 1, bgcolor: alpha(COLORS.blue, 0.1), borderRadius: 1, display: 'flex' }}>
                          <Truck size={20} color={COLORS.blue} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={item.description}
                        secondary={item.id}
                        primaryTypographyProps={{ fontWeight: 500 }}
                      />
                      <Chip
                        label={item.due}
                        size="small"
                        color={item.due === 'Today' ? 'error' : 'default'}
                        variant={item.due === 'Today' ? 'filled' : 'outlined'}
                      />
                    </ListItem>
                    {i < mockPendingReceipts.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </MotionCard>
        </Grid>
        <Grid item xs={12} md={6}>
          <MotionCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            sx={{ height: '100%' }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  Supplier Payments Due
                </Typography>
                <Chip
                  label="URGENT"
                  size="small"
                  sx={{ bgcolor: alpha(COLORS.red, 0.1), color: COLORS.red, fontWeight: 'bold' }}
                />
              </Box>
              <List>
                {mockPaymentsDue.map((payment, i) => (
                  <React.Fragment key={i}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Box sx={{ p: 1, bgcolor: alpha(COLORS.purple, 0.1), borderRadius: 1, display: 'flex' }}>
                          <CreditCard size={20} color={COLORS.purple} />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={payment.supplier}
                        secondary={`Due: ${payment.due}`}
                        primaryTypographyProps={{ fontWeight: 500 }}
                        secondaryTypographyProps={{ 
                          color: payment.due === 'Urgent' ? 'error.main' : 'text.secondary',
                          fontWeight: payment.due === 'Urgent' ? 'bold' : 'normal'
                        }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography fontWeight="bold">
                          {formatCurrency(payment.amount)}
                        </Typography>
                        <Button variant="contained" size="small" sx={{ textTransform: 'none' }}>
                          Pay Now
                        </Button>
                      </Box>
                    </ListItem>
                    {i < mockPaymentsDue.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ pb: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 3, gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Supply Chain Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Purchase health and supplier logistics for FY 2025-26 — {dayjs().format('MMMM D, YYYY')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<Plus size={20} />}>
            Add Supplier
          </Button>
          <Button variant="outlined" startIcon={<Plus size={20} />}>
            New PO
          </Button>
        </Box>
      </Box>

      {/* Tab Navigation */}
      <Paper sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', borderRadius: 0, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              minHeight: 56,
            }
          }}
        >
          <Tab icon={<FileText size={20} />} iconPosition="start" label="Overview" />
          <Tab icon={<Building2 size={20} />} iconPosition="start" label="Suppliers" />
          <Tab icon={<ShoppingCart size={20} />} iconPosition="start" label="Purchase Orders" />
          <Tab icon={<Truck size={20} />} iconPosition="start" label="Goods Receipts" />
          <Tab icon={<FileCheck size={20} />} iconPosition="start" label="Invoices" />
          <Tab icon={<CreditCard size={20} />} iconPosition="start" label="Supplier Payments" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && renderOverview()}
        
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
          {activeTab === 1 && <SuppliersPage />}
          {activeTab === 2 && <PurchaseOrdersPage />}
          {activeTab === 3 && <GRNPage />}
          {activeTab === 4 && <PurchaseInvoicesPage />}
          {activeTab === 5 && <SupplierPaymentsPage />}
        </Suspense>
      </Box>
    </Box>
  );
}
