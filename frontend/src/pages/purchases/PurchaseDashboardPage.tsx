import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  Stack,
  Divider,
  useTheme,
  alpha,
  Paper,
  Tooltip,
  InputBase,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Rating,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Store,
  DollarSign,
  Receipt,
  Users,
  CreditCard,
  Plus,
  Filter,
  RefreshCw,
  X,
  FileText,
  Truck,
  Package,
  AlertTriangle,
  Clock,
  Download,
  BookOpen as BookOnline,
  FolderOpen,
  Award,
  Zap,
  RotateCcw,
  Percent,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Calendar,
  Layers,
  ArrowRightLeft,
  Building2,
  Eye,
  Printer,
  Share2,
  Lightbulb,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

// Formatters
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Colors
const COLORS = {
  red: '#E53935',
  redLight: '#FFEBEE',
  green: '#43A047',
  greenLight: '#E8F5E9',
  blue: '#1976D2',
  blueLight: '#E3F2FD',
  orange: '#FB8C00',
  orangeLight: '#FFF3E0',
  purple: '#8E24AA',
  purpleLight: '#F3E5F5',
  teal: '#00897B',
  gray: '#64748B',
  bgLight: '#F8FAFC',
};

const MotionCard = motion.create(Card);

// MOCK DATA Fallback
const MOCK_PURCHASE_DATA = {
  kpis: {
    todayPurchases: 145000,
    todayInvoicesCount: 8,
    todayGrowth: 14.2,
    monthPurchases: 2840000,
    monthGrowth: 11.8,
    avgDailyPurchase: 113600,
    outstandingPayables: 1280000,
    overduePayables: 340000,
    pendingSuppliersCount: 18,
    openPOsCount: 12,
    openPOsValue: 850000,
    pendingDeliveriesCount: 6,
    pendingGRNsCount: 4,
    expectedDeliveriesToday: 3,
    uninvoicedGRNsCount: 6,
    uninvoicedGRNsValue: 240000,
    activeSuppliers: 84,
    newSuppliersMonth: 6,
    preferredSuppliers: 22,
    purchaseSavings: 185000,
    savingsPercent: 6.5,
  },
  workflow: [
    { stage: 'Purchase Requests', count: 5, value: 320000, color: COLORS.blue, percent: 100 },
    { stage: 'Purchase Orders', count: 12, value: 850000, color: COLORS.purple, percent: 85 },
    { stage: 'Goods Received (GRN)', count: 8, value: 540000, color: COLORS.teal, percent: 65 },
    { stage: 'Purchase Invoices', count: 14, value: 720000, color: COLORS.orange, percent: 50 },
    { stage: 'Payments Completed', count: 18, value: 1150000, color: COLORS.green, percent: 90 },
    { stage: 'Purchase Returns', count: 2, value: 45000, color: COLORS.red, percent: 15 },
  ],
  trendSeries: {
    Daily: [
      { name: 'Mon', purchases: 95000, orders: 5, avg: 19000 },
      { name: 'Tue', purchases: 120000, orders: 7, avg: 17142 },
      { name: 'Wed', purchases: 180000, orders: 10, avg: 18000 },
      { name: 'Thu', purchases: 110000, orders: 6, avg: 18333 },
      { name: 'Fri', purchases: 210000, orders: 11, avg: 19090 },
      { name: 'Sat', purchases: 145000, orders: 8, avg: 18125 },
      { name: 'Sun', purchases: 50000, orders: 3, avg: 16666 },
    ],
    Weekly: [
      { name: 'Week 1', purchases: 620000, orders: 35, avg: 17714 },
      { name: 'Week 2', purchases: 710000, orders: 42, avg: 16904 },
      { name: 'Week 3', purchases: 790000, orders: 48, avg: 16458 },
      { name: 'Week 4', purchases: 720000, orders: 40, avg: 18000 },
    ],
    Monthly: [
      { name: 'Jan', purchases: 2400000, orders: 140, avg: 17142 },
      { name: 'Feb', purchases: 2550000, orders: 150, avg: 17000 },
      { name: 'Mar', purchases: 3100000, orders: 180, avg: 17222 },
      { name: 'Apr', purchases: 2600000, orders: 155, avg: 16774 },
      { name: 'May', purchases: 2750000, orders: 160, avg: 17187 },
      { name: 'Jun', purchases: 2840000, orders: 168, avg: 16904 },
    ],
    Quarterly: [
      { name: 'Q1 FY26', purchases: 8050000, orders: 470, avg: 17127 },
      { name: 'Q2 FY26', purchases: 8450000, orders: 495, avg: 17070 },
      { name: 'Q3 FY26', purchases: 9200000, orders: 540, avg: 17037 },
      { name: 'Q4 FY26', purchases: 9800000, orders: 575, avg: 17043 },
    ],
    Yearly: [
      { name: 'FY 2023-24', purchases: 28500000, orders: 1650, avg: 17272 },
      { name: 'FY 2024-25', purchases: 32400000, orders: 1900, avg: 17052 },
      { name: 'FY 2025-26', purchases: 35500000, orders: 2080, avg: 17067 },
    ],
  },
  categoryBreakdown: {
    byCategory: [
      { name: 'FMCG & Groceries', value: 1250000 },
      { name: 'Grains & Pulses', value: 780000 },
      { name: 'Edible Oils & Spices', value: 510000 },
      { name: 'Personal Care & Soap', value: 300000 },
    ],
    byWarehouse: [
      { name: 'Main Central Godown', value: 1800000 },
      { name: 'Central Warehouse WH-2', value: 740000 },
      { name: 'City Distribution Depot', value: 300000 },
    ],
    bySupplierType: [
      { name: 'Manufacturers Direct', value: 1450000 },
      { name: 'Super-Stockists', value: 890000 },
      { name: 'Wholesale Distributors', value: 500000 },
    ],
    byGstRate: [
      { name: 'GST 18%', value: 1400000 },
      { name: 'GST 12%', value: 850000 },
      { name: 'GST 5%', value: 450000 },
      { name: 'Exempt 0%', value: 140000 },
    ],
  },
  topSuppliers: [
    { name: 'ITC Limited - Wholesale Div', total: 620000, outstanding: 140000, lastDate: '2026-07-24', onTimePercent: 96, avgDays: 2, rating: 5 },
    { name: 'Adani Wilmar Supplies Ltd', total: 480000, outstanding: 185000, lastDate: '2026-07-23', onTimePercent: 92, avgDays: 3, rating: 4.5 },
    { name: 'Hindustan Unilever Distributor', total: 410000, outstanding: 95000, lastDate: '2026-07-22', onTimePercent: 98, avgDays: 1, rating: 5 },
    { name: 'Nestle India Wholesale Agent', total: 350000, outstanding: 110000, lastDate: '2026-07-20', onTimePercent: 88, avgDays: 4, rating: 4 },
    { name: 'Parle Products Agency', total: 290000, outstanding: 60000, lastDate: '2026-07-21', onTimePercent: 94, avgDays: 2, rating: 4.5 },
  ],
  openPOs: [
    { poNo: 'PO-2026-0089', supplier: 'ITC Limited', value: 240000, expectedDate: '2026-07-26', ordered: 500, received: 350, status: 'Partial' },
    { poNo: 'PO-2026-0092', supplier: 'Adani Wilmar Supplies', value: 180000, expectedDate: '2026-07-27', ordered: 300, received: 0, status: 'Open' },
    { poNo: 'PO-2026-0095', supplier: 'Hindustan Unilever', value: 135000, expectedDate: '2026-07-28', ordered: 250, received: 0, status: 'Open' },
    { poNo: 'PO-2026-0098', supplier: 'Havells India Corp', value: 95000, expectedDate: '2026-07-29', ordered: 100, received: 0, status: 'Draft' },
  ],
  goodsReceipts: [
    { grnNo: 'GRN-2026-0104', supplier: 'ITC Limited', warehouse: 'Main Central Godown', qty: 350, linkedPO: 'PO-2026-0089', invoiceStatus: 'Pending Invoice' },
    { grnNo: 'GRN-2026-0103', supplier: 'Parle Products Agency', warehouse: 'Central Warehouse WH-2', qty: 200, linkedPO: 'PO-2026-0085', invoiceStatus: 'Invoiced' },
    { grnNo: 'GRN-2026-0102', supplier: 'Nestle India Wholesale Agent', warehouse: 'City Distribution Depot', qty: 150, linkedPO: 'PO-2026-0082', invoiceStatus: 'Pending Invoice' },
  ],
  overduePayables: [
    { supplier: 'Adani Wilmar Supplies Ltd', amount: 185000, dueDate: '2026-07-10', daysOverdue: 15, terms: 'Net 15 Days' },
    { supplier: 'Nestle India Wholesale Agent', amount: 110000, dueDate: '2026-07-12', daysOverdue: 13, terms: 'Net 30 Days' },
    { supplier: 'Havells India Corp', amount: 45000, dueDate: '2026-07-15', daysOverdue: 10, terms: 'Net 15 Days' },
  ],
  replenishmentSuggestions: [
    { name: 'Aashirvaad Shuddh Atta 10kg', stock: 8, min: 25, suggestedQty: 50, supplier: 'ITC Limited', price: 420 },
    { name: 'Fortune Sunflower Oil 15L', stock: 15, min: 30, suggestedQty: 60, supplier: 'Adani Wilmar', price: 1850 },
    { name: 'Tata Salt Crystal 1kg Box', stock: 450, min: 500, suggestedQty: 200, supplier: 'Tata Consumer', price: 18 },
  ],
  returnsSummary: {
    totalReturns: 4,
    returnVal: 45000,
    debitNotesCount: 3,
    pendingResolution: 1,
    reasons: [
      { reason: 'Damaged Goods in Transit', count: 2, value: 25000 },
      { reason: 'Wrong Quantity Delivered', count: 1, value: 12000 },
      { reason: 'Rate Difference', count: 1, value: 8000 },
    ],
  },
  costAnalysis: [
    { name: 'Basmati Rice 25kg', currentCost: 2450, prevCost: 2300, change: 6.5, trend: 'up' },
    { name: 'Sunflower Oil 15L', currentCost: 1850, prevCost: 1950, change: -5.1, trend: 'down' },
    { name: 'Atta 10kg Bag', currentCost: 420, prevCost: 420, change: 0.0, trend: 'stable' },
  ],
  timeline: [
    { id: 1, type: 'po', title: 'PO-2026-0098 Created for Havells', time: '1 hour ago', user: 'Rahul K.', ref: 'PO-2026-0098', amount: '₹95,000' },
    { id: 2, type: 'grn', title: 'GRN-2026-0104 Received (ITC Ltd)', time: '3 hours ago', user: 'Priya M.', ref: 'GRN-2026-0104', amount: '350 Units' },
    { id: 3, type: 'invoice', title: 'Purchase Invoice PINV-089 Recorded', time: '5 hours ago', user: 'Amit S.', ref: 'PINV-089', amount: '₹1,45,000' },
    { id: 4, type: 'payment', title: 'Supplier Payment to Parle Products', time: '1 day ago', user: 'Suresh V.', ref: 'PAY-2026-044', amount: '₹60,000' },
  ],
  insights: [
    { id: 1, text: 'Adani Wilmar prices decreased by 5.1% this week. Great reorder window.', type: 'info' },
    { id: 2, text: '3 supplier payments totaling ₹3.4L are overdue. Settle to retain credit limit.', type: 'warning' },
    { id: 3, text: 'ITC Limited on-time delivery rate is 96%. Preferred primary vendor.', type: 'info' },
    { id: 4, text: '6 Goods Receipts are pending purchase invoice logging.', type: 'alert' },
  ],
  comparisons: [
    { period: 'Today vs Yesterday Purchases', current: 145000, previous: 127000, growth: 14.2, positive: true },
    { period: 'This Week vs Last Week Orders', current: 790000, previous: 710000, growth: 11.2, positive: true },
    { period: 'This Month vs Last Month Value', current: 2840000, previous: 2540000, growth: 11.8, positive: true },
    { period: 'Current FY vs Previous FY Value', current: 35500000, previous: 32400000, growth: 9.5, positive: true },
  ],
};

export default function PurchaseDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [trendTimeframe, setTrendTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Daily');
  const [chartMetric, setChartMetric] = useState<'purchases' | 'orders' | 'avg'>('purchases');
  const [categoryTab, setCategoryTab] = useState<number>(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Supplier Payment Modal
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [selectedOverdue, setSelectedOverdue] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    supplier: 'All Suppliers',
    warehouse: 'All Warehouses',
    category: 'All Categories',
    purchaseStatus: 'All Statuses',
    paymentStatus: 'All Payment Statuses',
    dateRange: 'This Month',
    gstType: 'All GST Types',
  });

  // Query Supabase with Fallback
  const { data: purData, refetch } = useQuery({
    queryKey: ['purchaseDashboardData', activeBusiness?.id, filters],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: dbInvoices } = await supabase
            .from('purchase_invoices')
            .select('*')
            .eq('business_id', activeBusiness.id);

          if (dbInvoices && dbInvoices.length > 0) {
            const totalVal = dbInvoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
            return {
              ...MOCK_PURCHASE_DATA,
              kpis: {
                ...MOCK_PURCHASE_DATA.kpis,
                monthPurchases: totalVal || MOCK_PURCHASE_DATA.kpis.monthPurchases,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Using offline mock purchase data:', err);
      }
      return MOCK_PURCHASE_DATA;
    },
    initialData: MOCK_PURCHASE_DATA,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenPayment = (sup: any) => {
    setSelectedOverdue(sup);
    setPaymentAmount(sup.amount ? sup.amount.toString() : '');
    setRecordPaymentDialogOpen(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.supplier !== 'All Suppliers') count++;
    if (filters.warehouse !== 'All Warehouses') count++;
    if (filters.category !== 'All Categories') count++;
    if (filters.purchaseStatus !== 'All Statuses') count++;
    if (filters.paymentStatus !== 'All Payment Statuses') count++;
    if (filters.dateRange !== 'This Month') count++;
    if (filters.gstType !== 'All GST Types') count++;
    return count;
  }, [filters]);

  const currentSeries = purData.trendSeries[trendTimeframe] || purData.trendSeries.Daily;

  // Empty State Preview Render
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Purchase Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs().format('dddd, MMMM D, YYYY')}
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={testEmptyState} onChange={(e) => setTestEmptyState(e.target.checked)} color="primary" />}
            label={<Typography variant="caption" fontWeight="bold">Empty State Preview</Typography>}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: isDark ? '#1E293B' : 'white',
            maxWidth: 600,
            mx: 'auto',
            mt: 6,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: alpha(COLORS.red, 0.1),
              color: COLORS.red,
              mx: 'auto',
              mb: 3,
            }}
          >
            <ShoppingCart size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No Procurement Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Add suppliers, create purchase orders, or log goods receipt notes (GRNs) to activate real-time procurement command center analytics.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/purchases/orders')}
              sx={{ bgcolor: COLORS.red, px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Create Purchase Order
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTestEmptyState(false)}
              sx={{ px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              Load Demo Data
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh', pb: 12 }}>
      {/* 1. TOP APP BAR */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
            Purchase Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {dayjs().format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Quick Search */}
          <Paper
            elevation={0}
            sx={{
              p: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              width: { xs: '100%', sm: 260 },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <Search size={18} color={COLORS.gray} />
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
              placeholder="Search POs, suppliers, GRNs..."
              inputProps={{ 'aria-label': 'search purchase dashboard' }}
            />
          </Paper>

          {/* Filter Trigger */}
          <Button
            variant="outlined"
            onClick={() => setFilterDrawerOpen(true)}
            startIcon={
              <Badge badgeContent={activeFiltersCount} color="error" variant="dot">
                <Filter size={18} />
              </Badge>
            }
            sx={{
              borderRadius: 3,
              borderColor: activeFiltersCount > 0 ? COLORS.red : theme.palette.divider,
              color: activeFiltersCount > 0 ? COLORS.red : 'text.primary',
              bgcolor: activeFiltersCount > 0 ? alpha(COLORS.red, 0.08) : isDark ? '#1E293B' : 'white',
              textTransform: 'none',
              fontWeight: 600,
              height: 40,
            }}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {/* Refresh Action */}
          <Tooltip title="Recalculate & Refresh Purchase Metrics">
            <IconButton
              onClick={handleRefresh}
              sx={{
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1px solid ${theme.palette.divider}`,
                width: 40,
                height: 40,
              }}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <IconButton sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
            <Badge badgeContent={5} color="error">
              <Bell size={18} />
            </Badge>
          </IconButton>

          {/* Empty State Toggle */}
          <FormControlLabel
            control={<Switch size="small" checked={testEmptyState} onChange={(e) => setTestEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" color="text.secondary">Empty Demo</Typography>}
            sx={{ ml: 0.5 }}
          />
        </Stack>
      </Box>

      {/* 2. PURCHASE KPI CARDS */}
      <Grid container spacing={2.5} mb={3.5}>
        {/* Today's Purchases */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.red, 0.2)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.red, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Today's Purchases
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.red} mt={0.5}>
                    {formatCurrency(purData.kpis.todayPurchases)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, width: 42, height: 42 }}>
                  <ShoppingCart size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  icon={<TrendingUp size={12} />}
                  label={`+${purData.kpis.todayGrowth}%`}
                  sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {purData.kpis.todayInvoicesCount} Invoices
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* This Month's Purchases */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.purple, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    This Month's Purchases
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.purple} mt={0.5}>
                    {formatCurrency(purData.kpis.monthPurchases)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <BarChart2 size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${purData.kpis.monthGrowth}%`} sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Avg {formatCurrency(purData.kpis.avgDailyPurchase)}/day
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Outstanding Payables */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.orange, 0.3)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.orange, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Outstanding Payables
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.orange} mt={0.5}>
                    {formatCurrency(purData.kpis.outstandingPayables)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, width: 42, height: 42 }}>
                  <AlertTriangle size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  label={`Overdue: ${formatCurrency(purData.kpis.overduePayables)}`}
                  sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {purData.kpis.pendingSuppliersCount} Suppliers
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Open Purchase Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.blue, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Open Purchase Orders
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.blue} mt={0.5}>
                    {purData.kpis.openPOsCount} Open POs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <BookOnline size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Val: <strong>{formatCurrency(purData.kpis.openPOsValue)}</strong> • {purData.kpis.pendingDeliveriesCount} Pending Deliveries
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Pending GRNs */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Pending Goods Receipts
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.teal} mt={0.5}>
                    {purData.kpis.pendingGRNsCount} Pending GRNs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.12), color: COLORS.teal, width: 42, height: 42 }}>
                  <FolderOpen size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${purData.kpis.expectedDeliveriesToday} Expected Today`} sx={{ bgcolor: alpha(COLORS.teal, 0.12), color: COLORS.teal, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Uninvoiced Goods Received */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Goods Received - Invoice Pending
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {purData.kpis.uninvoicedGRNsCount} GRNs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, width: 42, height: 42 }}>
                  <FileText size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Val: <strong>{formatCurrency(purData.kpis.uninvoicedGRNsValue)}</strong> Uninvoiced
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Supplier Count */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Active Suppliers
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {purData.kpis.activeSuppliers} Suppliers
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <Store size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${purData.kpis.newSuppliersMonth} New`} sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {purData.kpis.preferredSuppliers} Preferred
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Purchase Savings */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.green, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Purchase Savings & Discounts
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green} mt={0.5}>
                    {formatCurrency(purData.kpis.purchaseSavings)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, width: 42, height: 42 }}>
                  <Percent size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${purData.kpis.savingsPercent}% Cost Reduction`} sx={{ bgcolor: alpha(COLORS.green, 0.15), color: COLORS.green, fontWeight: 800, fontSize: '0.7rem', height: 22 }} />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 3. QUICK ACTIONS BAR */}
      <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2} color="text.primary">
          Quick Procurement Operations
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'New Purchase Order', icon: <BookOnline size={20} />, path: '/purchases/orders', color: COLORS.red },
            { label: 'Record GRN', icon: <FolderOpen size={20} />, path: '/purchases/grn', color: COLORS.teal },
            { label: 'Record Invoice', icon: <Receipt size={20} />, path: '/purchases/invoices', color: COLORS.purple },
            { label: 'Record Payment', icon: <CreditCard size={20} />, path: '/purchases/payments', color: COLORS.green },
            { label: 'Add Supplier', icon: <Store size={20} />, path: '/purchases/suppliers', color: COLORS.blue },
            { label: 'Purchase Return', icon: <RotateCcw size={20} />, path: '/purchases/invoices', color: COLORS.orange },
            { label: 'Supplier Ledger', icon: <Users size={20} />, path: '/purchases/suppliers', color: COLORS.gray },
            { label: 'Purchase Reports', icon: <Layers size={20} />, path: '/reports/profit-loss', color: COLORS.red },
          ].map((action, idx) => (
            <Grid item xs={6} sm={3} md={1.5} key={idx}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate(action.path)}
                sx={{
                  py: 1.5,
                  px: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  borderRadius: 3,
                  borderColor: theme.palette.divider,
                  color: 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: alpha(action.color, 0.08),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ color: action.color }}>{action.icon}</Box>
                <Typography variant="caption" fontWeight={700} textAlign="center" lineHeight={1.2}>
                  {action.label}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 4. PROCUREMENT WORKFLOW OVERVIEW */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={800} mb={2}>
          Procurement Pipeline Workflow
        </Typography>
        <Grid container spacing={2}>
          {purData.workflow.map((wf, idx) => (
            <Grid item xs={12} sm={6} md={2} key={idx}>
              <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(wf.color, 0.06), border: `1px solid ${alpha(wf.color, 0.2)}` }}>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block">
                  {wf.stage}
                </Typography>
                <Typography variant="h6" fontWeight={800} color={wf.color} mt={0.5}>
                  {wf.count} items
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={1}>
                  {formatCurrency(wf.value)}
                </Typography>
                <LinearProgress variant="determinate" value={wf.percent} sx={{ height: 4, borderRadius: 2, bgcolor: alpha(wf.color, 0.15), '& .MuiLinearProgress-bar': { bgcolor: wf.color } }} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 5 & 6. PURCHASE TREND ANALYTICS + CATEGORY ANALYSIS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Trend Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Purchase Trend Analytics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Track procurement expenses across custom timeframes
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {/* Metric Selector */}
                <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                  <Button
                    size="small"
                    onClick={() => setChartMetric('purchases')}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: chartMetric === 'purchases' ? COLORS.red : 'transparent',
                      color: chartMetric === 'purchases' ? 'white' : 'text.secondary',
                    }}
                  >
                    Purchase (₹)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setChartMetric('orders')}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: chartMetric === 'orders' ? COLORS.blue : 'transparent',
                      color: chartMetric === 'orders' ? 'white' : 'text.secondary',
                    }}
                  >
                    Orders
                  </Button>
                </Stack>

                {/* Timeframe Selector */}
                <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                  {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map((tf) => (
                    <Button
                      key={tf}
                      size="small"
                      onClick={() => setTrendTimeframe(tf)}
                      sx={{
                        px: 1.2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor: trendTimeframe === tf ? (isDark ? '#334155' : 'white') : 'transparent',
                        color: trendTimeframe === tf ? 'text.primary' : 'text.secondary',
                      }}
                    >
                      {tf}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Box>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={currentSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.red} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} tickFormatter={(val) => (chartMetric === 'orders' ? val : `₹${val / 1000}k`)} />
                <RechartsTooltip formatter={(val: number) => (chartMetric === 'orders' ? `${val} Orders` : formatCurrency(val))} />
                <Area type="monotone" dataKey={chartMetric} stroke={COLORS.red} strokeWidth={3} fillOpacity={1} fill="url(#purGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>
                Purchase Category Analysis
              </Typography>
              <Tabs
                value={categoryTab}
                onChange={(_, val) => setCategoryTab(val)}
                sx={{ minHeight: 32, '& .MuiTab-root': { py: 0.5, px: 1, minHeight: 32, fontSize: '0.7rem', fontWeight: 700 } }}
              >
                <Tab label="Category" />
                <Tab label="Warehouse" />
                <Tab label="Supplier" />
              </Tabs>
            </Box>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={
                  categoryTab === 0
                    ? purData.categoryBreakdown.byCategory
                    : categoryTab === 1
                    ? purData.categoryBreakdown.byWarehouse
                    : purData.categoryBreakdown.bySupplierType
                }
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} tickFormatter={(v) => `₹${v / 100000}L`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill={COLORS.purple} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 7. SUPPLIER PERFORMANCE CARDS */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Top Supplier Performance & Vendors
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {purData.topSuppliers.map((sup, idx) => (
          <Grid item xs={12} sm={6} md={2.4} key={idx}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom lineHeight={1.3}>
                  {sup.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Purchased: <strong style={{ color: COLORS.red }}>{formatCurrency(sup.total)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Payable: <strong>{formatCurrency(sup.outstanding)}</strong>
                </Typography>
                <Rating value={sup.rating} readOnly size="small" precision={0.5} sx={{ mb: 1 }} />

                <Stack spacing={0.5} mt={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">On-Time Delivery</Typography>
                    <Typography variant="caption" fontWeight={700} color={COLORS.green}>{sup.onTimePercent}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Avg Lead Time</Typography>
                    <Typography variant="caption" fontWeight={700}>{sup.avgDays} Days</Typography>
                  </Box>
                </Stack>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/purchases/suppliers')}
                sx={{ mt: 2, fontSize: '0.7rem', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                View Supplier
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 8. OPEN PURCHASE ORDERS TRACKING */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Open Purchase Orders & Fulfillment
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Active commitments awaiting delivery or partial receipt
            </Typography>
          </Box>
          <Button size="small" onClick={() => navigate('/purchases/orders')} sx={{ textTransform: 'none', fontWeight: 700 }}>
            View All POs
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>PO Number</TableCell>
                <TableCell>Supplier</TableCell>
                <TableCell align="right">Value</TableCell>
                <TableCell align="center">Expected Date</TableCell>
                <TableCell align="center">Fulfillment</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purData.openPOs.map((po, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700, color: COLORS.blue }}>{po.poNo}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{po.supplier}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCurrency(po.value)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{po.expectedDate}</TableCell>
                  <TableCell align="center" sx={{ width: 140 }}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption" fontSize="0.65rem">{po.received}/{po.ordered}</Typography>
                      <Typography variant="caption" fontWeight={700} fontSize="0.65rem">{Math.round((po.received / po.ordered) * 100)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={Math.round((po.received / po.ordered) * 100)} sx={{ height: 4, borderRadius: 2 }} />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={po.status}
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor: po.status === 'Partial' ? alpha(COLORS.orange, 0.12) : alpha(COLORS.blue, 0.12),
                        color: po.status === 'Partial' ? COLORS.orange : COLORS.blue,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/purchases/grn')}
                      sx={{ bgcolor: COLORS.teal, fontSize: '0.7rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Receive GRN
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 9. PENDING SUPPLIER PAYMENTS & OVERDUE PAYABLES */}
      <Grid container spacing={3} mb={3.5}>
        {/* Overdue Suppliers */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Pending Supplier Payments (Overdue Payables)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Vendor balances requiring urgent payment settlement
                </Typography>
              </Box>
              <Chip label={`${purData.overduePayables.length} Overdue`} color="error" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell>Supplier Name</TableCell>
                    <TableCell align="right">Amount Due</TableCell>
                    <TableCell align="center">Due Date</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {purData.overduePayables.map((op, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{op.supplier}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.red }}>{formatCurrency(op.amount)}</TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{op.dueDate}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${op.daysOverdue} Days`} size="small" sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenPayment(op)}
                          sx={{ bgcolor: COLORS.green, fontSize: '0.7rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Record Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Goods Receipt Summary */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Goods Receipt Overview (GRN)
            </Typography>

            <Stack spacing={2}>
              {purData.goodsReceipts.map((grn, idx) => (
                <Box key={idx} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={800} color={COLORS.blue}>{grn.grnNo}</Typography>
                    <Chip label={grn.invoiceStatus} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, fontWeight: 700 }} />
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{grn.supplier}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {grn.warehouse} • {grn.qty} Units Received
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 10. INVENTORY REPLENISHMENT RECOMMENDATIONS */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Automated Procurement Replenishment Recommendations
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Low-stock SKUs requiring automated PO generation
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Min Stock</TableCell>
                <TableCell align="right">Suggested Purchase Qty</TableCell>
                <TableCell>Preferred Supplier</TableCell>
                <TableCell align="right">Last Price</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {purData.replenishmentSuggestions.map((rep, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{rep.name}</TableCell>
                  <TableCell align="right">
                    <Chip label={`${rep.stock} Units`} size="small" sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{rep.min}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.purple }}>{rep.suggestedQty}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{rep.supplier}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(rep.price)}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => navigate('/purchases/orders')}
                      sx={{ bgcolor: COLORS.red, fontSize: '0.7rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Generate PO
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 11. RECENT PURCHASE ACTIVITIES & ALERTS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Procurement Activity Log</Typography>
            </Box>
            <Stack spacing={2.5}>
              {purData.timeline.map((item) => (
                <Box key={item.id} display="flex" gap={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor:
                        item.type === 'po' ? alpha(COLORS.blue, 0.12) :
                        item.type === 'grn' ? alpha(COLORS.teal, 0.12) :
                        item.type === 'invoice' ? alpha(COLORS.purple, 0.12) :
                        alpha(COLORS.green, 0.12),
                      color:
                        item.type === 'po' ? COLORS.blue :
                        item.type === 'grn' ? COLORS.teal :
                        item.type === 'invoice' ? COLORS.purple :
                        COLORS.green,
                    }}
                  >
                    {item.type === 'po' ? <BookOnline size={18} /> :
                     item.type === 'grn' ? <FolderOpen size={18} /> :
                     item.type === 'invoice' ? <Receipt size={18} /> :
                     <CreditCard size={18} />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ref: {item.ref} • {item.user} • {item.time}
                    </Typography>
                  </Box>
                  <Chip label={item.amount} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Cost Analysis & Price Fluctuation */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Purchase Cost Analysis & Fluctuation
            </Typography>
            <Stack spacing={2}>
              {purData.costAnalysis.map((cost, idx) => (
                <Box key={idx} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" fontWeight={700}>{cost.name}</Typography>
                    <Chip
                      size="small"
                      label={`${cost.change > 0 ? '+' : ''}${cost.change}%`}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: cost.change > 0 ? alpha(COLORS.red, 0.12) : alpha(COLORS.green, 0.12),
                        color: cost.change > 0 ? COLORS.red : COLORS.green,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                    Current Cost: <strong>{formatCurrency(cost.currentCost)}</strong> (Prev: {formatCurrency(cost.prevCost)})
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 12. SMART PURCHASE INSIGHTS */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Smart Procurement Insights
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {purData.insights.map((ins) => (
          <Grid item xs={12} sm={6} md={3} key={ins.id}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Lightbulb size={20} color={ins.type === 'alert' ? COLORS.red : ins.type === 'warning' ? COLORS.orange : COLORS.blue} />
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  Procurement Tip
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {ins.text}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 13. PURCHASE COMPARISON */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Purchase Performance Comparison
      </Typography>
      <Grid container spacing={2.5} mb={4}>
        {purData.comparisons.map((comp, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {comp.period}
              </Typography>
              <Typography variant="h6" fontWeight={800} mt={0.5}>
                {formatCurrency(comp.current)}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="caption" color="text.secondary">Prev: {formatCurrency(comp.previous)}</Typography>
                <Chip
                  size="small"
                  icon={<TrendingUp size={12} />}
                  label={`+${comp.growth}%`}
                  sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 14. MATERIAL 3 FILTER DRAWER / BOTTOM SHEET */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 380 }, p: 3, bgcolor: isDark ? '#1E293B' : 'white' },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={800}>
            Purchase Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <X size={20} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Supplier</InputLabel>
            <Select value={filters.supplier} label="Supplier" onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}>
              <MenuItem value="All Suppliers">All Suppliers</MenuItem>
              <MenuItem value="ITC Limited">ITC Limited</MenuItem>
              <MenuItem value="Adani Wilmar">Adani Wilmar Supplies</MenuItem>
              <MenuItem value="Hindustan Unilever">Hindustan Unilever</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Warehouse</InputLabel>
            <Select value={filters.warehouse} label="Warehouse" onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}>
              <MenuItem value="All Warehouses">All Warehouses</MenuItem>
              <MenuItem value="Main Godown">Main Central Godown</MenuItem>
              <MenuItem value="Central WH">Central Warehouse WH-2</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Purchase Status</InputLabel>
            <Select value={filters.purchaseStatus} label="Purchase Status" onChange={(e) => setFilters({ ...filters, purchaseStatus: e.target.value })}>
              <MenuItem value="All Statuses">All Statuses</MenuItem>
              <MenuItem value="Open POs">Open POs</MenuItem>
              <MenuItem value="Pending GRN">Pending GRN</MenuItem>
              <MenuItem value="Pending Invoice">Pending Invoice</MenuItem>
              <MenuItem value="Completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setFilters({
              supplier: 'All Suppliers',
              warehouse: 'All Warehouses',
              category: 'All Categories',
              purchaseStatus: 'All Statuses',
              paymentStatus: 'All Payment Statuses',
              dateRange: 'This Month',
              gstType: 'All GST Types',
            })}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Reset Filters
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterDrawerOpen(false)}
            sx={{ bgcolor: COLORS.red, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* 15. RECORD PAYMENT DIALOG */}
      <Dialog open={recordPaymentDialogOpen} onClose={() => setRecordPaymentDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Supplier Payment</DialogTitle>
        <DialogContent dividers>
          {selectedOverdue && (
            <Stack spacing={2} py={1}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(COLORS.red, 0.08)}>
                <Typography variant="caption" color="text.secondary">Supplier</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedOverdue.supplier}</Typography>
                <Typography variant="caption" color="text.secondary">Terms: {selectedOverdue.terms}</Typography>
              </Box>
              <TextField
                label="Payment Amount (₹)"
                fullWidth
                size="small"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRecordPaymentDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setRecordPaymentDialogOpen(false)}
            sx={{ bgcolor: COLORS.green, textTransform: 'none', fontWeight: 700 }}
          >
            Confirm & Pay Supplier
          </Button>
        </DialogActions>
      </Dialog>

      {/* 16. EXPANDABLE SPEED DIAL FAB */}
      <SpeedDial
        ariaLabel="Purchase Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{
          sx: {
            bgcolor: COLORS.red,
            '&:hover': { bgcolor: alpha(COLORS.red, 0.9) },
            boxShadow: '0 8px 24px rgba(229, 57, 53, 0.4)',
          },
        }}
      >
        <SpeedDialAction
          icon={<BookOnline size={18} />}
          tooltipTitle="Purchase Order"
          onClick={() => navigate('/purchases/orders')}
        />
        <SpeedDialAction
          icon={<FolderOpen size={18} />}
          tooltipTitle="Goods Receipt (GRN)"
          onClick={() => navigate('/purchases/grn')}
        />
        <SpeedDialAction
          icon={<Receipt size={18} />}
          tooltipTitle="Purchase Invoice"
          onClick={() => navigate('/purchases/invoices')}
        />
        <SpeedDialAction
          icon={<CreditCard size={18} />}
          tooltipTitle="Supplier Payment"
          onClick={() => navigate('/purchases/payments')}
        />
        <SpeedDialAction
          icon={<Store size={18} />}
          tooltipTitle="Add Supplier"
          onClick={() => navigate('/purchases/suppliers')}
        />
      </SpeedDial>
    </Box>
  );
}
