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
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  TrendingUp,
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
  Layers,
  AlertTriangle,
  Eye,
  Printer,
  Share2,
  ShoppingBag,
  Award,
  Zap,
  RotateCcw,
  Target,
  UserPlus,
  Percent,
  Clock,
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

// Utility formatters
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

// Semantic Color Palette
const COLORS = {
  green: '#2E7D32',
  greenLight: '#E8F5E9',
  blue: '#1976D2',
  blueLight: '#E3F2FD',
  orange: '#ED6C02',
  orangeLight: '#FFF3E0',
  red: '#D32F2F',
  redLight: '#FFEBEE',
  purple: '#9C27B0',
  purpleLight: '#F3E5F5',
  teal: '#00796B',
  neutralDark: '#1E293B',
  neutralGrey: '#64748B',
  bgLight: '#F8FAFC',
};

const MotionCard = motion.create(Card);

// MOCK DATA Fallback
const MOCK_SALES_DATA = {
  kpis: {
    todaySales: 185400,
    todayInvoices: 14,
    todayGrowth: 18.4,
    weekSales: 942000,
    weekInvoices: 86,
    weekGrowth: 12.2,
    monthSales: 3850000,
    monthTarget: 5000000,
    avgInvoiceValue: 13240,
    avgInvoiceGrowth: 5.8,
    grossProfit: 770000,
    grossMarginPercent: 20.0,
    profitGrowth: 2.1,
    pendingReceivables: 1420000,
    unpaidInvoicesCount: 32,
    overdueReceivables: 480000,
    todayPayments: {
      cash: 45000,
      upi: 68400,
      bank: 50000,
      cheque: 22000,
      total: 185400,
    },
    customerCount: {
      active: 340,
      newThisMonth: 28,
      repeat: 312,
    },
  },
  trendSeries: {
    Daily: [
      { name: 'Mon', sales: 120000, profit: 24000, orders: 10 },
      { name: 'Tue', sales: 145000, profit: 29000, orders: 12 },
      { name: 'Wed', sales: 160000, profit: 32000, orders: 15 },
      { name: 'Thu', sales: 130000, profit: 26000, orders: 11 },
      { name: 'Fri', sales: 210000, profit: 42000, orders: 18 },
      { name: 'Sat', sales: 185400, profit: 37080, orders: 14 },
      { name: 'Sun', sales: 90000, profit: 18000, orders: 7 },
    ],
    Weekly: [
      { name: 'Week 1', sales: 820000, profit: 164000, orders: 65 },
      { name: 'Week 2', sales: 910000, profit: 182000, orders: 74 },
      { name: 'Week 3', sales: 942000, profit: 188400, orders: 86 },
      { name: 'Week 4', sales: 1178000, profit: 235600, orders: 98 },
    ],
    Monthly: [
      { name: 'Jan', sales: 3100000, profit: 620000, orders: 250 },
      { name: 'Feb', sales: 3400000, profit: 680000, orders: 275 },
      { name: 'Mar', sales: 4200000, profit: 840000, orders: 320 },
      { name: 'Apr', sales: 3600000, profit: 720000, orders: 290 },
      { name: 'May', sales: 3900000, profit: 780000, orders: 310 },
      { name: 'Jun', sales: 3850000, profit: 770000, orders: 305 },
    ],
    Quarterly: [
      { name: 'Q1 FY26', sales: 10700000, profit: 2140000, orders: 845 },
      { name: 'Q2 FY26', sales: 11350000, profit: 2270000, orders: 905 },
      { name: 'Q3 FY26', sales: 12900000, profit: 2580000, orders: 1020 },
      { name: 'Q4 FY26', sales: 14200000, profit: 2840000, orders: 1150 },
    ],
    Yearly: [
      { name: 'FY 2023-24', sales: 38000000, profit: 7600000, orders: 3100 },
      { name: 'FY 2024-25', sales: 44500000, profit: 8900000, orders: 3650 },
      { name: 'FY 2025-26', sales: 49150000, profit: 9830000, orders: 3920 },
    ],
  },
  topCustomers: [
    { id: '1', name: 'Metro Retailers Pvt Ltd', total: 685000, outstanding: 120000, lastDate: '2026-07-24', creditStatus: 'within' },
    { id: '2', name: 'Apex Traders & Distributors', total: 540000, outstanding: 195000, lastDate: '2026-07-23', creditStatus: 'near' },
    { id: '3', name: 'Shree Balaji Enterprises', total: 420000, outstanding: 250000, lastDate: '2026-07-20', creditStatus: 'exceeded' },
    { id: '4', name: 'Royal Supermarket Chain', total: 390000, outstanding: 45000, lastDate: '2026-07-25', creditStatus: 'within' },
    { id: '5', name: 'Kishan General Stores', total: 310000, outstanding: 85000, lastDate: '2026-07-22', creditStatus: 'within' },
  ],
  newCustomersList: [
    { name: 'Sunrise Mart - Thane', date: '2026-07-24', category: 'Retailer' },
    { name: 'Gupta Wholesale House', date: '2026-07-22', category: 'Wholesaler' },
    { name: 'Vanguard Electronics', date: '2026-07-20', category: 'Distributor' },
    { name: 'Om Swastik Hardware', date: '2026-07-18', category: 'Retailer' },
  ],
  customerCreditLimits: {
    withinLimit: 280,
    nearLimit: 45,
    exceededLimit: 15,
  },
  topProducts: [
    { name: 'Basmati Rice Premium 25kg', qty: 450, revenue: 1125000, profit: 225000, stock: 120, lowStock: false },
    { name: 'Fortune Sunflower Oil 15L', qty: 320, revenue: 672000, profit: 100800, stock: 15, lowStock: true },
    { name: 'Tata Salt Crystal 1kg Box', qty: 1200, revenue: 336000, profit: 67200, stock: 450, lowStock: false },
    { name: 'Aashirvaad Shuddh Atta 10kg', qty: 280, revenue: 140000, profit: 28000, stock: 8, lowStock: true },
    { name: 'Red Label Tea Pack 1kg', qty: 190, revenue: 114000, profit: 22800, stock: 85, lowStock: false },
  ],
  categoryBreakdown: {
    byCategory: [
      { name: 'FMCG & Groceries', value: 1850000 },
      { name: 'Personal Care', value: 850000 },
      { name: 'Beverages', value: 650000 },
      { name: 'Packaged Snacks', value: 500000 },
    ],
    byWarehouse: [
      { name: 'Main Central Warehouse', value: 2400000 },
      { name: 'City Distribution Depot', value: 1050000 },
      { name: 'Retail Store Counter', value: 400000 },
    ],
    byGstRate: [
      { name: 'GST 18%', value: 1950000 },
      { name: 'GST 12%', value: 1100000 },
      { name: 'GST 5%', value: 650000 },
      { name: 'GST 0% (Exempt)', value: 150000 },
    ],
    byCustomerCategory: [
      { name: 'Wholesalers', value: 2100000 },
      { name: 'Retailers', value: 1250000 },
      { name: 'Institutional / Direct', value: 500000 },
    ],
  },
  collectionsAging: {
    total: 1420000,
    current: 650000,
    days30: 290000,
    days60: 260000,
    days90Plus: 220000,
  },
  overdueInvoices: [
    { invoiceNo: 'INV-2026-0104', customer: 'Shree Balaji Enterprises', amount: 150000, dueDate: '2026-06-30', daysOverdue: 25 },
    { invoiceNo: 'INV-2026-0112', customer: 'Apex Traders & Distributors', amount: 110000, dueDate: '2026-07-05', daysOverdue: 20 },
    { invoiceNo: 'INV-2026-0128', customer: 'National Traders Co.', amount: 95000, dueDate: '2026-07-10', daysOverdue: 15 },
    { invoiceNo: 'INV-2026-0135', customer: 'Standard Mart', amount: 75000, dueDate: '2026-07-12', daysOverdue: 13 },
    { invoiceNo: 'INV-2026-0142', customer: 'Suraj Supermarket', amount: 50000, dueDate: '2026-07-15', daysOverdue: 10 },
  ],
  paymentDistribution: [
    { name: 'UPI / QR', value: 68400, percent: 37 },
    { name: 'Bank Transfer', value: 50000, percent: 27 },
    { name: 'Cash Deposit', value: 45000, percent: 24 },
    { name: 'Cheque Clearance', value: 22000, percent: 12 },
  ],
  pendingActivities: [
    { title: 'Pending Sales Orders', count: 8, amount: 420000, chipColor: COLORS.blue, severity: 'info' },
    { title: 'Delivery Challans Pending Invoice', count: 5, amount: 280000, chipColor: COLORS.orange, severity: 'warning' },
    { title: 'Partially Paid Invoices', count: 14, amount: 650000, chipColor: COLORS.purple, severity: 'info' },
    { title: 'Customer Credit Holds', count: 3, amount: 380000, chipColor: COLORS.red, severity: 'critical' },
    { title: 'Sales Returns Pending Approval', count: 2, amount: 45000, chipColor: COLORS.orange, severity: 'warning' },
    { title: 'Credit Notes Pending Issue', count: 4, amount: 32000, chipColor: COLORS.teal, severity: 'info' },
    { title: 'High Value Orders Awaiting Dispatch', count: 2, amount: 350000, chipColor: COLORS.green, severity: 'action' },
  ],
  recentInvoices: [
    { invoiceNo: 'INV-2026-0198', customer: 'Metro Retailers Pvt Ltd', amount: 85400, status: 'Paid', date: '2026-07-25', mode: 'UPI' },
    { invoiceNo: 'INV-2026-0197', customer: 'Royal Supermarket Chain', amount: 42000, status: 'Paid', date: '2026-07-25', mode: 'Cash' },
    { invoiceNo: 'INV-2026-0196', customer: 'Apex Traders & Distributors', amount: 110000, status: 'Unpaid', date: '2026-07-24', mode: 'Credit' },
    { invoiceNo: 'INV-2026-0195', customer: 'Kishan General Stores', amount: 28500, status: 'Partially Paid', date: '2026-07-24', mode: 'Bank' },
    { invoiceNo: 'INV-2026-0194', customer: 'Sunrise Mart - Thane', amount: 19200, status: 'Paid', date: '2026-07-23', mode: 'UPI' },
  ],
  businessInsights: [
    { title: 'Best Selling Product Today', value: 'Basmati Rice Premium 25kg', detail: '45 Bags (₹1.12L)', type: 'star', color: COLORS.green },
    { title: 'Highest Revenue Customer', value: 'Metro Retailers Pvt Ltd', detail: '₹6.85L Total Purchases', type: 'award', color: COLORS.purple },
    { title: 'Fastest Growing Product', value: 'Fortune Sunflower Oil 15L', detail: '+45% MoM Demand', type: 'growth', color: COLORS.blue },
    { title: 'Slowest Selling Product', value: 'Whole Wheat Flakes 500g', detail: '2 Units Sold in 30 days', type: 'slow', color: COLORS.orange },
    { title: 'Highest Margin Product', value: 'Organic Honey Glass Jar 500g', detail: '34.5% Gross Margin', type: 'margin', color: COLORS.teal },
    { title: 'Most Returned Product', value: 'Plastic Container Set 3pc', detail: '4 Returns (Damaged Seal)', type: 'alert', color: COLORS.red },
  ],
  salesComparisons: [
    { period: 'Today vs Yesterday', current: 185400, previous: 156500, growth: 18.4, positive: true },
    { period: 'This Week vs Last Week', current: 942000, previous: 839500, growth: 12.2, positive: true },
    { period: 'This Month vs Last Month', current: 3850000, previous: 3330000, growth: 15.6, positive: true },
    { period: 'Current FY vs Previous FY', current: 49150000, previous: 39600000, growth: 24.1, positive: true },
  ],
};

export default function SalesDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State Management
  const [timeframe, setTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Daily');
  const [chartMetric, setChartMetric] = useState<'sales' | 'profit' | 'orders'>('sales');
  const [categoryTab, setCategoryTab] = useState<number>(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick Payment Modal state
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');

  // Filter State
  const [filters, setFilters] = useState({
    dateRange: 'This Month',
    customer: 'All Customers',
    warehouse: 'All Warehouses',
    product: 'All Products',
    category: 'All Categories',
    paymentStatus: 'All Statuses',
    invoiceStatus: 'All Invoices',
    gstType: 'All GST Types',
  });

  // Query Supabase with Fallback to Mock Data
  const { data: salesData, refetch } = useQuery({
    queryKey: ['salesDashboard', activeBusiness?.id, filters],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: dbInvoices } = await supabase
            .from('tax_invoices')
            .select('*')
            .eq('business_id', activeBusiness.id);

          if (dbInvoices && dbInvoices.length > 0) {
            const totalVal = dbInvoices.reduce((acc, inv) => acc + (inv.total_amount || 0), 0);
            return {
              ...MOCK_SALES_DATA,
              kpis: {
                ...MOCK_SALES_DATA.kpis,
                monthSales: totalVal || MOCK_SALES_DATA.kpis.monthSales,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Using offline mock sales data:', err);
      }
      return MOCK_SALES_DATA;
    },
    initialData: MOCK_SALES_DATA,
  });

  // Handle Manual Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenRecordPayment = (inv: any) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.amount ? inv.amount.toString() : '');
    setRecordPaymentDialogOpen(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateRange !== 'This Month') count++;
    if (filters.customer !== 'All Customers') count++;
    if (filters.warehouse !== 'All Warehouses') count++;
    if (filters.product !== 'All Products') count++;
    if (filters.category !== 'All Categories') count++;
    if (filters.paymentStatus !== 'All Statuses') count++;
    if (filters.invoiceStatus !== 'All Invoices') count++;
    if (filters.gstType !== 'All GST Types') count++;
    return count;
  }, [filters]);

  const chartSeries = salesData.trendSeries[timeframe] || salesData.trendSeries.Daily;

  // Render Empty State View
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh' }}>
        {/* App Bar Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Sales Dashboard
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

        {/* Empty State Banner */}
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
              bgcolor: alpha(COLORS.blue, 0.1),
              color: COLORS.blue,
              mx: 'auto',
              mb: 3,
            }}
          >
            <ShoppingBag size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No Sales Data Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Start issuing tax invoices, creating sales orders, or recording customer payments to activate real-time analytics and insights.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/sales/invoices')}
              sx={{ bgcolor: COLORS.green, px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Create Your First Invoice
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
            Sales Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {dayjs().format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Quick Search Input */}
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
            <Search size={18} color={COLORS.neutralGrey} />
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
              placeholder="Search sales, invoices..."
              inputProps={{ 'aria-label': 'search sales dashboard' }}
            />
          </Paper>

          {/* Filter Trigger Button */}
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
              borderColor: activeFiltersCount > 0 ? COLORS.blue : theme.palette.divider,
              color: activeFiltersCount > 0 ? COLORS.blue : 'text.primary',
              bgcolor: activeFiltersCount > 0 ? alpha(COLORS.blue, 0.08) : isDark ? '#1E293B' : 'white',
              textTransform: 'none',
              fontWeight: 600,
              height: 40,
            }}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {/* Refresh Action */}
          <Tooltip title="Recalculate & Refresh Metrics">
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

          {/* Notification Icon */}
          <IconButton sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
            <Badge badgeContent={3} color="error">
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

      {/* 2. SALES SUMMARY CARDS (KPIs) */}
      <Grid container spacing={2.5} mb={3.5}>
        {/* Today's Sales */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.green, 0.2)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.green, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Today's Sales
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green} mt={0.5}>
                    {formatCurrency(salesData.kpis.todaySales)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, width: 42, height: 42 }}>
                  <DollarSign size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  icon={<TrendingUp size={12} />}
                  label={`+${salesData.kpis.todayGrowth}%`}
                  sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {salesData.kpis.todayInvoices} Invoices Issued
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* This Week's Sales */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.blue, 0.2)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.blue, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    This Week's Sales
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.blue} mt={0.5}>
                    {formatCurrency(salesData.kpis.weekSales)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <TrendingUp size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  icon={<TrendingUp size={12} />}
                  label={`+${salesData.kpis.weekGrowth}%`}
                  sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {salesData.kpis.weekInvoices} Invoices Count
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* This Month's Sales vs Target */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.purple, 0.2)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.purple, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    This Month's Sales
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.purple} mt={0.5}>
                    {formatCurrency(salesData.kpis.monthSales)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <Target size={22} />
                </Avatar>
              </Box>
              <Box mt={1.5}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>Target: {formatCurrency(salesData.kpis.monthTarget)}</Typography>
                  <Typography variant="caption" fontWeight={700} color={COLORS.purple}>
                    {Math.round((salesData.kpis.monthSales / salesData.kpis.monthTarget) * 100)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, Math.round((salesData.kpis.monthSales / salesData.kpis.monthTarget) * 100))}
                  sx={{ height: 6, borderRadius: 3, bgcolor: alpha(COLORS.purple, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.purple } }}
                />
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Average Invoice Value */}
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
                    Avg Invoice Value
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {formatCurrency(salesData.kpis.avgInvoiceValue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.12), color: COLORS.teal, width: 42, height: 42 }}>
                  <Receipt size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  icon={<TrendingUp size={12} />}
                  label={`+${salesData.kpis.avgInvoiceGrowth}%`}
                  sx={{ bgcolor: alpha(COLORS.teal, 0.12), color: COLORS.teal, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  vs Last Month Avg
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Gross Profit & Margin */}
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
                    Gross Profit
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green} mt={0.5}>
                    {formatCurrency(salesData.kpis.grossProfit)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, width: 42, height: 42 }}>
                  <Percent size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  label={`${salesData.kpis.grossMarginPercent}% Margin`}
                  sx={{ bgcolor: alpha(COLORS.green, 0.15), color: COLORS.green, fontWeight: 800, fontSize: '0.75rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  +{salesData.kpis.profitGrowth}% Trend
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Pending Receivables & Overdue */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.red, 0.3)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.red, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Pending Receivables
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {formatCurrency(salesData.kpis.pendingReceivables)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, width: 42, height: 42 }}>
                  <AlertTriangle size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={1.5} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`Overdue: ${formatCurrency(salesData.kpis.overdueReceivables)}`}
                  sx={{ bgcolor: alpha(COLORS.red, 0.15), color: COLORS.red, fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {salesData.kpis.unpaidInvoicesCount} Unpaid Invoices
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Payments Received Today */}
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
                    Collected Today
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green} mt={0.5}>
                    {formatCurrency(salesData.kpis.todayPayments.total)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, width: 42, height: 42 }}>
                  <CreditCard size={22} />
                </Avatar>
              </Box>
              <Box mt={1.5} display="flex" gap={0.5} flexWrap="wrap">
                <Chip size="small" label={`Cash: ${formatCurrency(salesData.kpis.todayPayments.cash)}`} sx={{ fontSize: '0.65rem', height: 20 }} />
                <Chip size="small" label={`UPI: ${formatCurrency(salesData.kpis.todayPayments.upi)}`} sx={{ fontSize: '0.65rem', height: 20, bgcolor: alpha(COLORS.blue, 0.1), color: COLORS.blue }} />
                <Chip size="small" label={`Bank: ${formatCurrency(salesData.kpis.todayPayments.bank)}`} sx={{ fontSize: '0.65rem', height: 20 }} />
              </Box>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Active Customer Count */}
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
                    Active Customers
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {salesData.kpis.customerCount.active}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <Users size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  icon={<UserPlus size={12} />}
                  label={`+${salesData.kpis.customerCount.newThisMonth} New`}
                  sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {salesData.kpis.customerCount.repeat} Repeat Buyers
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 3. QUICK ACTIONS BAR */}
      <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2} color="text.primary">
          Quick Sales Operations
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'New Tax Invoice', icon: <FileText size={20} />, path: '/sales/invoices', color: COLORS.green },
            { label: 'New Sales Order', icon: <ShoppingBag size={20} />, path: '/sales/orders', color: COLORS.blue },
            { label: 'Create Delivery Challan', icon: <Truck size={20} />, path: '/sales/challans', color: COLORS.purple },
            { label: 'Record Payment', icon: <CreditCard size={20} />, path: '/sales/payments', color: COLORS.teal },
            { label: 'Customer Ledger', icon: <Users size={20} />, path: '/sales/customers', color: COLORS.neutralGrey },
            { label: 'Sales Return', icon: <RotateCcw size={20} />, path: '/sales/invoices', color: COLORS.orange },
            { label: 'Credit Note', icon: <Receipt size={20} />, path: '/sales/credit-notes', color: COLORS.red },
            { label: 'View All Sales', icon: <Layers size={20} />, path: '/sales/invoices', color: COLORS.blue },
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

      {/* 4 & 5. SALES TREND ANALYTICS + REVENUE VS TARGET */}
      <Grid container spacing={3} mb={3.5}>
        {/* Interactive Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Sales Trend Analytics
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Track performance trends across custom timeframes
                </Typography>
              </Box>

              {/* Timeframe & Metric Selectors */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {/* Metric Selector */}
                <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                  <Button
                    size="small"
                    onClick={() => setChartMetric('sales')}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: chartMetric === 'sales' ? COLORS.green : 'transparent',
                      color: chartMetric === 'sales' ? 'white' : 'text.secondary',
                      '&:hover': { bgcolor: chartMetric === 'sales' ? COLORS.green : alpha(COLORS.green, 0.1) },
                    }}
                  >
                    Sales (₹)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setChartMetric('profit')}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: chartMetric === 'profit' ? COLORS.purple : 'transparent',
                      color: chartMetric === 'profit' ? 'white' : 'text.secondary',
                      '&:hover': { bgcolor: chartMetric === 'profit' ? COLORS.purple : alpha(COLORS.purple, 0.1) },
                    }}
                  >
                    Profit
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
                      '&:hover': { bgcolor: chartMetric === 'orders' ? COLORS.blue : alpha(COLORS.blue, 0.1) },
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
                      onClick={() => setTimeframe(tf)}
                      sx={{
                        px: 1.2,
                        py: 0.5,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        bgcolor: timeframe === tf ? (isDark ? '#334155' : 'white') : 'transparent',
                        color: timeframe === tf ? 'text.primary' : 'text.secondary',
                        boxShadow: timeframe === tf ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                      }}
                    >
                      {tf}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Box>

            {/* Recharts Area Chart */}
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.neutralGrey }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: COLORS.neutralGrey }}
                  tickFormatter={(val) => (chartMetric === 'orders' ? val : `₹${val >= 100000 ? `${(val / 100000).toFixed(1)}L` : `${val / 1000}k`}`)}
                />
                <RechartsTooltip
                  formatter={(val: number) => (chartMetric === 'orders' ? `${val} Orders` : formatCurrency(val))}
                  contentStyle={{ backgroundColor: isDark ? '#1E293B' : 'white', borderRadius: 12, borderColor: theme.palette.divider }}
                />
                {chartMetric === 'sales' && (
                  <Area type="monotone" dataKey="sales" stroke={COLORS.green} strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                )}
                {chartMetric === 'profit' && (
                  <Area type="monotone" dataKey="profit" stroke={COLORS.purple} strokeWidth={3} fillOpacity={1} fill="url(#profitGrad)" />
                )}
                {chartMetric === 'orders' && (
                  <Area type="monotone" dataKey="orders" stroke={COLORS.blue} strokeWidth={3} fillOpacity={1} fill="url(#ordersGrad)" />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Revenue vs Target Card */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box>
              <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 38, height: 38 }}>
                  <Target size={20} />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Revenue vs Target
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Monthly Sales Target Progress
                  </Typography>
                </Box>
              </Box>

              {/* Progress Gauge */}
              <Box textAlign="center" my={3} position="relative">
                <Box display="inline-flex" position="relative" alignItems="center" justifyContent="center">
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={160}
                    thickness={8}
                    sx={{ color: theme.palette.divider }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(100, Math.round((salesData.kpis.monthSales / salesData.kpis.monthTarget) * 100))}
                    size={160}
                    thickness={8}
                    sx={{
                      color: COLORS.purple,
                      position: 'absolute',
                      left: 0,
                      '& .MuiCircularProgress-circle': { strokeLinecap: 'round' },
                    }}
                  />
                  <Box position="absolute" display="flex" flexDirection="column" alignItems="center">
                    <Typography variant="h4" fontWeight={900} color={COLORS.purple}>
                      {Math.round((salesData.kpis.monthSales / salesData.kpis.monthTarget) * 100)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      Achieved
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Target Breakdown Numbers */}
              <Stack spacing={1.5}>
                <Box display="flex" justifyContent="space-between" p={1.5} borderRadius={2.5} bgcolor={isDark ? '#0F172A' : COLORS.bgLight}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>Monthly Target</Typography>
                  <Typography variant="body2" fontWeight={800}>{formatCurrency(salesData.kpis.monthTarget)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" p={1.5} borderRadius={2.5} bgcolor={alpha(COLORS.green, 0.08)}>
                  <Typography variant="body2" color={COLORS.green} fontWeight={600}>Sales Achieved</Typography>
                  <Typography variant="body2" fontWeight={800} color={COLORS.green}>{formatCurrency(salesData.kpis.monthSales)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" p={1.5} borderRadius={2.5} bgcolor={alpha(COLORS.orange, 0.08)}>
                  <Typography variant="body2" color={COLORS.orange} fontWeight={600}>Remaining Balance</Typography>
                  <Typography variant="body2" fontWeight={800} color={COLORS.orange}>
                    {formatCurrency(Math.max(0, salesData.kpis.monthTarget - salesData.kpis.monthSales))}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box mt={2} pt={2} borderTop={`1px solid ${theme.palette.divider}`}>
              <Typography variant="caption" color="text.secondary" display="block" textAlign="center">
                Required daily run-rate: <strong>₹57,500/day</strong> for remaining days
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* 6. CUSTOMER INSIGHTS & CREDIT STATUS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Top Customers */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Top Purchasing Customers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Highest volume buyers & outstanding status
                </Typography>
              </Box>
              <Button size="small" onClick={() => navigate('/sales/customers')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                View Customers
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell>Customer Name</TableCell>
                    <TableCell align="right">Total Purchase</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                    <TableCell align="center">Credit Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesData.topCustomers.map((cust) => (
                    <TableRow key={cust.id} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{cust.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.green }}>
                        {formatCurrency(cust.total)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(cust.outstanding)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          size="small"
                          label={
                            cust.creditStatus === 'within' ? 'Within Limit' : cust.creditStatus === 'near' ? 'Near Limit' : 'Exceeded'
                          }
                          sx={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            bgcolor:
                              cust.creditStatus === 'within'
                                ? alpha(COLORS.green, 0.12)
                                : cust.creditStatus === 'near'
                                ? alpha(COLORS.orange, 0.12)
                                : alpha(COLORS.red, 0.12),
                            color:
                              cust.creditStatus === 'within'
                                ? COLORS.green
                                : cust.creditStatus === 'near'
                                ? COLORS.orange
                                : COLORS.red,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Customer Credit Status & New Customers */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Customer Credit Status
            </Typography>

            {/* Credit Limit Meters */}
            <Stack spacing={2} mb={3}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.green}>Within Credit Limit</Typography>
                  <Typography variant="caption" fontWeight={800}>{salesData.customerCreditLimits.withinLimit} Customers</Typography>
                </Box>
                <LinearProgress variant="determinate" value={82} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.green, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.green } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.orange}>Near Credit Limit (80%+)</Typography>
                  <Typography variant="caption" fontWeight={800}>{salesData.customerCreditLimits.nearLimit} Customers</Typography>
                </Box>
                <LinearProgress variant="determinate" value={13} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.orange, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.orange } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.red}>Exceeded Credit Limit</Typography>
                  <Typography variant="caption" fontWeight={800}>{salesData.customerCreditLimits.exceededLimit} Accounts Blocked</Typography>
                </Box>
                <LinearProgress variant="determinate" value={5} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.red, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.red } }} />
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Recent New Customers */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="subtitle2" fontWeight={800}>
                Recently Added Customers ({salesData.kpis.customerCount.newThisMonth} this month)
              </Typography>
            </Box>
            <Stack spacing={1}>
              {salesData.newCustomersList.map((nc, idx) => (
                <Box key={idx} display="flex" justifyContent="space-between" alignItems="center" p={1} borderRadius={2} bgcolor={isDark ? '#0F172A' : COLORS.bgLight}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar sx={{ width: 30, height: 30, fontSize: '0.75rem', bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, fontWeight: 700 }}>
                      {nc.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block" lineHeight={1.2}>
                        {nc.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                        {nc.category}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">{dayjs(nc.date).format('MMM D')}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 7. PRODUCT PERFORMANCE (TOP SELLING PRODUCTS) */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Top Selling Products
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fastest moving SKUs by volume and revenue generated
            </Typography>
          </Box>
          <Button size="small" onClick={() => navigate('/inventory/products')} sx={{ textTransform: 'none', fontWeight: 700 }}>
            View All Products
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Qty Sold</TableCell>
                <TableCell align="right">Revenue Generated</TableCell>
                <TableCell align="right">Gross Profit</TableCell>
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="center">Stock Alert</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.topProducts.map((prod, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{prod.name}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{prod.qty.toLocaleString()} Units</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.green }}>{formatCurrency(prod.revenue)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: COLORS.purple }}>{formatCurrency(prod.profit)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{prod.stock}</TableCell>
                  <TableCell align="center">
                    {prod.lowStock ? (
                      <Chip label="Low Stock Warning" size="small" sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.68rem' }} />
                    ) : (
                      <Chip label="Sufficient" size="small" sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, fontWeight: 700, fontSize: '0.68rem' }} />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 8. SALES CATEGORY ANALYSIS & PAYMENT MODE ANALYSIS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Category Breakdown Charts */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>
                Sales Category Breakdown
              </Typography>

              <Tabs
                value={categoryTab}
                onChange={(_, val) => setCategoryTab(val)}
                sx={{ minHeight: 32, '& .MuiTab-root': { py: 0.5, px: 1.5, minHeight: 32, fontSize: '0.75rem', fontWeight: 700 } }}
              >
                <Tab label="Category" />
                <Tab label="Warehouse" />
                <Tab label="GST Rate" />
                <Tab label="Customer Type" />
              </Tabs>
            </Box>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={
                  categoryTab === 0
                    ? salesData.categoryBreakdown.byCategory
                    : categoryTab === 1
                    ? salesData.categoryBreakdown.byWarehouse
                    : categoryTab === 2
                    ? salesData.categoryBreakdown.byGstRate
                    : salesData.categoryBreakdown.byCustomerCategory
                }
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.neutralGrey }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.neutralGrey }} tickFormatter={(v) => `₹${v / 100000}L`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="value" fill={COLORS.blue} radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Payment Analysis Donut Chart */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={1}>
              Payment Mode Distribution
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Collections breakdown by channel
            </Typography>

            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={salesData.paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {[COLORS.blue, COLORS.teal, COLORS.green, COLORS.orange].map((col, idx) => (
                    <Cell key={idx} fill={col} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 9. COLLECTIONS DASHBOARD & AGING DISTRIBUTION */}
      <Grid container spacing={3} mb={3.5}>
        {/* Aging Receivables */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={1}>
              Collections & Receivables Aging
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={3}>
              Total Receivable: <strong>{formatCurrency(salesData.collectionsAging.total)}</strong>
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.green}>Current (0 - 30 Days)</Typography>
                  <Typography variant="caption" fontWeight={800}>{formatCurrency(salesData.collectionsAging.current)}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={46} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.green, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.green } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.blue}>30 - 60 Days</Typography>
                  <Typography variant="caption" fontWeight={800}>{formatCurrency(salesData.collectionsAging.days30)}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={20} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.blue, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.blue } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.orange}>60 - 90 Days</Typography>
                  <Typography variant="caption" fontWeight={800}>{formatCurrency(salesData.collectionsAging.days60)}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={18} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.orange, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.orange } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.red}>90+ Days (High Risk)</Typography>
                  <Typography variant="caption" fontWeight={800}>{formatCurrency(salesData.collectionsAging.days90Plus)}</Typography>
                </Box>
                <LinearProgress variant="determinate" value={16} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.red, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.red } }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Overdue Invoices Quick Actions List */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Overdue Invoices Action List
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  High-priority collections requiring immediate follow up
                </Typography>
              </Box>
              <Chip label={`${salesData.overdueInvoices.length} Overdue`} color="error" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell>Invoice No</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salesData.overdueInvoices.map((inv, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 700, color: COLORS.blue }}>{inv.invoiceNo}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{inv.customer}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.red }}>{formatCurrency(inv.amount)}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${inv.daysOverdue} Days`} size="small" sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenRecordPayment(inv)}
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
      </Grid>

      {/* 10. PENDING SALES ACTIVITIES (ALERTS) */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={800} mb={2}>
          Pending Sales Activities & Operations Alerts
        </Typography>

        <Grid container spacing={2}>
          {salesData.pendingActivities.map((act, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: `1px solid ${alpha(act.chipColor, 0.25)}`,
                  bgcolor: alpha(act.chipColor, 0.04),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {act.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {act.count} items • {formatCurrency(act.amount)}
                  </Typography>
                </Box>
                <Chip
                  label={`${act.count}`}
                  size="small"
                  sx={{ bgcolor: act.chipColor, color: 'white', fontWeight: 800, borderRadius: 2 }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 11. RECENT SALES ACTIVITY TABLE */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Recent Sales Activity
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Latest transactions recorded across all channels
            </Typography>
          </Box>
          <Button size="small" onClick={() => navigate('/sales/invoices')} sx={{ textTransform: 'none', fontWeight: 700 }}>
            View All Invoices
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Invoice No</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell align="center">Payment Status</TableCell>
                <TableCell align="center">Invoice Date</TableCell>
                <TableCell align="center">Mode</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {salesData.recentInvoices.map((inv, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700, color: COLORS.blue }}>{inv.invoiceNo}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{inv.customer}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCurrency(inv.amount)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={inv.status}
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor:
                          inv.status === 'Paid'
                            ? alpha(COLORS.green, 0.12)
                            : inv.status === 'Partially Paid'
                            ? alpha(COLORS.orange, 0.12)
                            : alpha(COLORS.red, 0.12),
                        color:
                          inv.status === 'Paid'
                            ? COLORS.green
                            : inv.status === 'Partially Paid'
                            ? COLORS.orange
                            : COLORS.red,
                      }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{inv.date}</TableCell>
                  <TableCell align="center">
                    <Chip label={inv.mode} size="small" variant="outlined" sx={{ fontSize: '0.68rem' }} />
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="View Invoice">
                        <IconButton size="small"><Eye size={16} /></IconButton>
                      </Tooltip>
                      <Tooltip title="Print">
                        <IconButton size="small"><Printer size={16} /></IconButton>
                      </Tooltip>
                      <Tooltip title="Share WhatsApp">
                        <IconButton size="small"><Share2 size={16} /></IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 12. BUSINESS INSIGHTS (SMART CARDS) */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Smart Business Insights
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {salesData.businessInsights.map((ins, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} mb={1}>
                <Avatar sx={{ bgcolor: alpha(ins.color, 0.12), color: ins.color, width: 36, height: 36 }}>
                  {ins.type === 'star' && <Award size={18} />}
                  {ins.type === 'award' && <Users size={18} />}
                  {ins.type === 'growth' && <Zap size={18} />}
                  {ins.type === 'slow' && <Clock size={18} />}
                  {ins.type === 'margin' && <Percent size={18} />}
                  {ins.type === 'alert' && <RotateCcw size={18} />}
                </Avatar>
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  {ins.title}
                </Typography>
              </Box>
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                {ins.value}
              </Typography>
              <Typography variant="caption" color={ins.color} fontWeight={700}>
                {ins.detail}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 13. SALES PERFORMANCE COMPARISON */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Sales Performance Comparison
      </Typography>
      <Grid container spacing={2.5} mb={4}>
        {salesData.salesComparisons.map((comp, idx) => (
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
                  sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, fontWeight: 800, fontSize: '0.7rem', height: 20 }}
                />
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 14. MATERIAL 3 FILTER BOTTOM SHEET / DRAWER */}
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
            Dashboard Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <X size={20} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Date Range</InputLabel>
            <Select value={filters.dateRange} label="Date Range" onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Yesterday">Yesterday</MenuItem>
              <MenuItem value="This Week">This Week</MenuItem>
              <MenuItem value="This Month">This Month</MenuItem>
              <MenuItem value="This Quarter">This Quarter</MenuItem>
              <MenuItem value="Financial Year">This Financial Year</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Customer</InputLabel>
            <Select value={filters.customer} label="Customer" onChange={(e) => setFilters({ ...filters, customer: e.target.value })}>
              <MenuItem value="All Customers">All Customers</MenuItem>
              <MenuItem value="Metro Retailers">Metro Retailers Pvt Ltd</MenuItem>
              <MenuItem value="Apex Traders">Apex Traders & Distributors</MenuItem>
              <MenuItem value="Shree Balaji">Shree Balaji Enterprises</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Warehouse</InputLabel>
            <Select value={filters.warehouse} label="Warehouse" onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}>
              <MenuItem value="All Warehouses">All Warehouses</MenuItem>
              <MenuItem value="Main Godown">Main Central Warehouse</MenuItem>
              <MenuItem value="City Depot">City Distribution Depot</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Payment Status</InputLabel>
            <Select value={filters.paymentStatus} label="Payment Status" onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}>
              <MenuItem value="All Statuses">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
              <MenuItem value="Partially Paid">Partially Paid</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>GST Type</InputLabel>
            <Select value={filters.gstType} label="GST Type" onChange={(e) => setFilters({ ...filters, gstType: e.target.value })}>
              <MenuItem value="All GST Types">All GST Types</MenuItem>
              <MenuItem value="Intrastate">Intrastate (CGST + SGST)</MenuItem>
              <MenuItem value="Interstate">Interstate (IGST)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setFilters({
              dateRange: 'This Month',
              customer: 'All Customers',
              warehouse: 'All Warehouses',
              product: 'All Products',
              category: 'All Categories',
              paymentStatus: 'All Statuses',
              invoiceStatus: 'All Invoices',
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
            sx={{ bgcolor: COLORS.green, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* 15. RECORD PAYMENT DIALOG */}
      <Dialog open={recordPaymentDialogOpen} onClose={() => setRecordPaymentDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Customer Payment</DialogTitle>
        <DialogContent dividers>
          {selectedInvoice && (
            <Stack spacing={2} py={1}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(COLORS.blue, 0.08)}>
                <Typography variant="caption" color="text.secondary">Invoice</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedInvoice.invoiceNo} — {selectedInvoice.customer}</Typography>
              </Box>
              <TextField
                label="Payment Amount (₹)"
                fullWidth
                size="small"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <FormControl fullWidth size="small">
                <InputLabel>Payment Mode</InputLabel>
                <Select value={paymentMode} label="Payment Mode" onChange={(e) => setPaymentMode(e.target.value)}>
                  <MenuItem value="UPI">UPI / QR Code</MenuItem>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Bank">Bank Transfer (NEFT/IMPS)</MenuItem>
                  <MenuItem value="Cheque">Cheque</MenuItem>
                </Select>
              </FormControl>
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
            Confirm & Save Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* 16. SPEED DIAL EXPANDABLE FAB */}
      <SpeedDial
        ariaLabel="Sales Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{
          sx: {
            bgcolor: COLORS.green,
            '&:hover': { bgcolor: alpha(COLORS.green, 0.9) },
            boxShadow: '0 8px 24px rgba(46, 125, 50, 0.4)',
          },
        }}
      >
        <SpeedDialAction
          icon={<FileText size={18} />}
          tooltipTitle="New Tax Invoice"
          onClick={() => navigate('/sales/invoices')}
        />
        <SpeedDialAction
          icon={<ShoppingBag size={18} />}
          tooltipTitle="New Sales Order"
          onClick={() => navigate('/sales/orders')}
        />
        <SpeedDialAction
          icon={<Truck size={18} />}
          tooltipTitle="Delivery Challan"
          onClick={() => navigate('/sales/challans')}
        />
        <SpeedDialAction
          icon={<CreditCard size={18} />}
          tooltipTitle="Record Payment"
          onClick={() => navigate('/sales/payments')}
        />
        <SpeedDialAction
          icon={<Receipt size={18} />}
          tooltipTitle="Credit Note"
          onClick={() => navigate('/sales/credit-notes')}
        />
      </SpeedDial>
    </Box>
  );
}
