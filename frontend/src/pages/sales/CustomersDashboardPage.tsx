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
  Users,
  UserCheck,
  UserPlus,
  Clock,
  DollarSign,
  CreditCard,
  Plus,
  Filter,
  RefreshCw,
  X,
  FileText,
  Truck,
  Package,
  AlertTriangle,
  Download,
  BookOpen,
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
  ShieldAlert,
  Star,
  Check,
  Phone,
  Mail,
  Receipt,
  Landmark,
  PiggyBank,
  Sliders,
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
  blue: '#1976D2',
  blueLight: '#E3F2FD',
  green: '#43A047',
  greenLight: '#E8F5E9',
  orange: '#FB8C00',
  orangeLight: '#FFF3E0',
  red: '#E53935',
  redLight: '#FFEBEE',
  purple: '#8E24AA',
  purpleLight: '#F3E5F5',
  teal: '#00897B',
  gold: '#D4AF37',
  gray: '#64748B',
  bgLight: '#F8FAFC',
};

const MotionCard = motion.create(Card);

// MOCK DATA Fallback for Customer Financial Health & Receivables
const MOCK_CUSTOMER_DATA = {
  kpis: {
    totalCustomers: 340,
    activeCustomers: 312,
    newCustomersThisMonth: 28,
    inactiveCustomersCount: 28,
    totalReceivable: 1420000,
    overdueAmount: 480000,
    collectionRate: 78.4,
    todayCollections: 185400,
    todayPaymentsCount: 18,
    todayGrowth: 14.2,
    monthlySales: 3850000,
    monthlyInvoicesCount: 240,
    monthlySalesGrowth: 15.6,
    pendingInvoicesCount: 32,
    pendingInvoicesValue: 1420000,
    avgDaysOutstanding: 18,
    overCreditLimitCount: 15,
    nearCreditLimitCount: 45,
    activeLoansCount: 8,
    totalLoanBalance: 450000,
    loanInterestEarned: 38500,
    repeatCustomersCount: 312,
    retentionRate: 91.7,
  },
  overviewSegments: [
    { label: 'Wholesale Customers', count: 180, revenue: '₹24.5L', color: COLORS.blue, sub: 'B2B Bulk Buyers' },
    { label: 'Retail Supermarkets', count: 90, revenue: '₹9.8L', color: COLORS.green, sub: 'Chain Stores' },
    { label: 'VIP Accounts', count: 40, revenue: '₹4.2L', color: COLORS.purple, sub: 'High Volume Accounts' },
    { label: 'High Risk Overdue', count: 15, revenue: '₹4.8L Due', color: COLORS.red, sub: 'Over Credit Limit' },
    { label: 'Inactive (>90 Days)', count: 15, revenue: '₹0.0L', color: COLORS.orange, sub: 'Re-engagement Target' },
  ],
  trendSeries: {
    Daily: [
      { name: 'Mon', revenue: 145000, collections: 120000, newCustomers: 3 },
      { name: 'Tue', revenue: 168000, collections: 155000, newCustomers: 4 },
      { name: 'Wed', revenue: 210000, collections: 190000, newCustomers: 6 },
      { name: 'Thu', revenue: 135000, collections: 110000, newCustomers: 2 },
      { name: 'Fri', revenue: 240000, collections: 215000, newCustomers: 7 },
      { name: 'Sat', revenue: 185400, collections: 185400, newCustomers: 4 },
      { name: 'Sun', revenue: 58000, collections: 45000, newCustomers: 2 },
    ],
    Weekly: [
      { name: 'Week 1', revenue: 840000, collections: 780000, newCustomers: 6 },
      { name: 'Week 2', revenue: 920000, collections: 890000, newCustomers: 8 },
      { name: 'Week 3', revenue: 980000, collections: 940000, newCustomers: 7 },
      { name: 'Week 4', revenue: 1110000, collections: 1050000, newCustomers: 7 },
    ],
    Monthly: [
      { name: 'Feb', revenue: 3100000, collections: 2950000, newCustomers: 20 },
      { name: 'Mar', revenue: 3450000, collections: 3300000, newCustomers: 24 },
      { name: 'Apr', revenue: 3200000, collections: 3100000, newCustomers: 22 },
      { name: 'May', revenue: 3550000, collections: 3400000, newCustomers: 25 },
      { name: 'Jun', revenue: 3330000, collections: 3200000, newCustomers: 21 },
      { name: 'Jul (Est)', revenue: 3850000, collections: 3715000, newCustomers: 28 },
    ],
    Yearly: [
      { name: 'FY 2023-24', revenue: 38500000, collections: 37200000, newCustomers: 180 },
      { name: 'FY 2024-25', revenue: 42400000, collections: 41100000, newCustomers: 210 },
      { name: 'FY 2025-26', revenue: 49150000, collections: 47800000, newCustomers: 250 },
    ],
  },
  paymentMethods: [
    { name: 'UPI & QR Code', value: 37, amount: 1424500, color: COLORS.green },
    { name: 'Bank Transfer (NEFT/RTGS)', value: 27, amount: 1039500, color: COLORS.blue },
    { name: 'Cash Collections', value: 24, amount: 924000, color: COLORS.purple },
    { name: 'Cheque & PDC', value: 12, amount: 462000, color: COLORS.orange },
  ],
  topCustomers: [
    {
      id: 'cust-1',
      name: 'Metro Retailers Pvt Ltd',
      tier: 'VIP Platinum',
      category: 'Wholesale Chain',
      totalPurchases: 685000,
      outstanding: 120000,
      creditLimit: 300000,
      lastDate: '2026-07-24',
      orderCount: 42,
      avgOrderValue: 16309,
      phone: '+91 98200 99887',
      creditStatus: 'Within Limit',
    },
    {
      id: 'cust-2',
      name: 'Apex Traders & Distributors',
      tier: 'Gold Partner',
      category: 'Wholesaler',
      totalPurchases: 540000,
      outstanding: 195000,
      creditLimit: 200000,
      lastDate: '2026-07-23',
      orderCount: 32,
      avgOrderValue: 16875,
      phone: '+91 98211 88776',
      creditStatus: 'Near Limit',
    },
    {
      id: 'cust-3',
      name: 'Shree Balaji Enterprises',
      tier: 'Silver Retail',
      category: 'Supermarket',
      totalPurchases: 420000,
      outstanding: 250000,
      creditLimit: 150000,
      lastDate: '2026-07-20',
      orderCount: 28,
      avgOrderValue: 15000,
      phone: '+91 98333 77665',
      creditStatus: 'Exceeded Limit',
    },
    {
      id: 'cust-4',
      name: 'Royal Supermarket Chain',
      tier: 'VIP Platinum',
      category: 'Retail Chain',
      totalPurchases: 390000,
      outstanding: 45000,
      creditLimit: 250000,
      lastDate: '2026-07-25',
      orderCount: 25,
      avgOrderValue: 15600,
      phone: '+91 98444 66554',
      creditStatus: 'Within Limit',
    },
    {
      id: 'cust-5',
      name: 'Kishan General Stores',
      tier: 'Gold Partner',
      category: 'Retail Store',
      totalPurchases: 310000,
      outstanding: 85000,
      creditLimit: 100000,
      lastDate: '2026-07-22',
      orderCount: 20,
      avgOrderValue: 15500,
      phone: '+91 98555 55443',
      creditStatus: 'Within Limit',
    },
  ],
  overdueReceivables: [
    { customer: 'Shree Balaji Enterprises', amount: 250000, dueDate: '2026-07-05', daysOverdue: 20, creditLimit: 150000, risk: 'Critical' },
    { customer: 'Apex Traders & Distributors', amount: 195000, dueDate: '2026-07-12', daysOverdue: 13, creditLimit: 200000, risk: 'High' },
    { customer: 'Metro Retailers Pvt Ltd', amount: 120000, dueDate: '2026-07-18', daysOverdue: 7, creditLimit: 300000, risk: 'Low' },
  ],
  customerLoansList: [
    { customer: 'Shree Balaji Enterprises', principal: 200000, outstanding: 150000, interest: 18000, nextDue: '2026-08-05' },
    { customer: 'Kishan General Stores', principal: 100000, outstanding: 75000, interest: 8500, nextDue: '2026-08-10' },
    { customer: 'Apex Traders & Distributors', principal: 300000, outstanding: 225000, interest: 12000, nextDue: '2026-08-15' },
  ],
  timeline: [
    { id: 1, type: 'payment', title: 'Payment of ₹85,000 received from Royal Supermarket', time: '1 hour ago', ref: 'PAY-C-2026-104', user: 'Admin' },
    { id: 2, type: 'invoice', title: 'Tax Invoice INV-2026-089 issued to Metro Retailers', time: '3 hours ago', ref: 'INV-0089', user: 'Rahul K.' },
    { id: 3, type: 'credit_note', title: 'Credit Note CN-2026-014 issued to Kishan Stores', time: '5 hours ago', ref: 'CN-0014', user: 'Priya M.' },
    { id: 4, type: 'loan', title: 'Loan Repayment of ₹25,000 recorded from Shree Balaji', time: '1 day ago', ref: 'LNP-2026-022', user: 'Admin' },
  ],
  insights: [
    { id: 1, text: 'Shree Balaji Enterprises outstanding balance (₹2.5L) exceeds credit limit (₹1.5L) by ₹1L. Credit hold recommended.', type: 'alert' },
    { id: 2, text: 'Daily collections increased by 14.2% today (₹1.85L collected). Collection efficiency is strong.', type: 'info' },
    { id: 3, text: '15 customers are currently over their assigned credit limits. Review credit terms.', type: 'warning' },
    { id: 4, text: 'Metro Retailers Pvt Ltd repeat order frequency improved to every 4 days.', type: 'info' },
  ],
  comparisonMatrix: [
    { metric: 'Total Monthly Sales', custA: '₹6.85L (Metro Retailers)', custB: '₹5.40L (Apex Traders)', winner: 'Customer A' },
    { metric: 'Outstanding Receivables', custA: '₹1.20L (17% of limit)', custB: '₹1.95L (97% of limit)', winner: 'Customer A' },
    { metric: 'Average Order Value', custA: '₹16,309', custB: '₹16,875', winner: 'Customer B' },
    { metric: 'Payment Collection Speed', custA: '7 Days Avg', custB: '13 Days Avg', winner: 'Customer A' },
    { metric: 'Credit Limit Usage', custA: '40% Utilized', custB: '97.5% Utilized', winner: 'Customer A' },
  ],
};

export default function CustomersDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [trendTimeframe, setTrendTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [selectedOverdue, setSelectedOverdue] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [recordLoanRepaymentOpen, setRecordLoanRepaymentOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [loanRepayAmount, setLoanRepayAmount] = useState('');
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    category: 'All Categories',
    creditStatus: 'All Statuses',
    paymentStatus: 'All Payment Statuses',
    loanStatus: 'All Loan Statuses',
    dateRange: 'This Month',
  });

  // Query Supabase with Fallback
  const { data: custData, refetch } = useQuery({
    queryKey: ['customersDashboardData', activeBusiness?.id, filters],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: dbCustomers } = await supabase
            .from('customers')
            .select('*')
            .eq('business_id', activeBusiness.id);

          if (dbCustomers && dbCustomers.length > 0) {
            return {
              ...MOCK_CUSTOMER_DATA,
              kpis: {
                ...MOCK_CUSTOMER_DATA.kpis,
                totalCustomers: dbCustomers.length,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Using offline mock customer data:', err);
      }
      return MOCK_CUSTOMER_DATA;
    },
    initialData: MOCK_CUSTOMER_DATA,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenPayment = (item: any) => {
    setSelectedOverdue(item);
    setPaymentAmount(item.amount ? item.amount.toString() : '');
    setRecordPaymentDialogOpen(true);
  };

  const handleOpenLoanRepayment = (loan: any) => {
    setSelectedLoan(loan);
    setLoanRepayAmount(loan.outstanding ? loan.outstanding.toString() : '');
    setRecordLoanRepaymentOpen(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.category !== 'All Categories') count++;
    if (filters.creditStatus !== 'All Statuses') count++;
    if (filters.paymentStatus !== 'All Payment Statuses') count++;
    if (filters.loanStatus !== 'All Loan Statuses') count++;
    if (filters.dateRange !== 'This Month') count++;
    return count;
  }, [filters]);

  const currentSeries = custData.trendSeries[trendTimeframe] || custData.trendSeries.Daily;

  // Empty State Preview Render
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Customer Dashboard
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
              bgcolor: alpha(COLORS.blue, 0.1),
              color: COLORS.blue,
              mx: 'auto',
              mb: 3,
            }}
          >
            <Users size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No Wholesale Customer Accounts Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Add B2B wholesale buyers, supermarket chains, and retailers to track accounts receivable, credit limits, daily collections, and customer loans.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/sales/customers')}
              sx={{ bgcolor: COLORS.blue, px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Add New Customer
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
            Customer Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Customer Relationship & Accounts Receivable Control Center • {dayjs().format('dddd, MMMM D, YYYY')}
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
              placeholder="Search customers, GSTIN, phone..."
              inputProps={{ 'aria-label': 'search customer dashboard' }}
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
          <Tooltip title="Recalculate Customer Financial Metrics">
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

      {/* 2. CUSTOMER KPI CARDS (8 Cards) */}
      <Grid container spacing={2.5} mb={3.5}>
        {/* Total Customers */}
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
                    Total Customers
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.blue} mt={0.5}>
                    {custData.kpis.totalCustomers} Accounts
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <Users size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${custData.kpis.newCustomersThisMonth} New`} sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {custData.kpis.activeCustomers} Active • {custData.kpis.inactiveCustomersCount} Inactive
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Total Accounts Receivable */}
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
                    Accounts Receivable
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.red} mt={0.5}>
                    {formatCurrency(custData.kpis.totalReceivable)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, width: 42, height: 42 }}>
                  <AlertTriangle size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`Overdue: ${formatCurrency(custData.kpis.overdueAmount)}`} sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Rate: {custData.kpis.collectionRate}%
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Today's Collections */}
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
                    Today's Collections
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green} mt={0.5}>
                    {formatCurrency(custData.kpis.todayCollections)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, width: 42, height: 42 }}>
                  <CreditCard size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${custData.kpis.todayGrowth}% vs Prev Day`} sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {custData.kpis.todayPaymentsCount} Payments
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Monthly Customer Sales */}
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
                    Monthly Customer Revenue
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.purple} mt={0.5}>
                    {formatCurrency(custData.kpis.monthlySales)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <TrendingUp size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${custData.kpis.monthlySalesGrowth}% Growth`} sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {custData.kpis.monthlyInvoicesCount} Invoices
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Pending Invoices */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.orange, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Pending Invoices
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.orange} mt={0.5}>
                    {custData.kpis.pendingInvoicesCount} Unpaid
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, width: 42, height: 42 }}>
                  <Receipt size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Val: <strong>{formatCurrency(custData.kpis.pendingInvoicesValue)}</strong> • {custData.kpis.avgDaysOutstanding}d Avg DSO
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Credit Limit Alerts */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.red, 0.3)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Credit Limit Alerts
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.red} mt={0.5}>
                    {custData.kpis.overCreditLimitCount} Exceeded
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, width: 42, height: 42 }}>
                  <ShieldAlert size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${custData.kpis.nearCreditLimitCount} Near Limit`} sx={{ bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Customer Loans */}
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
                    Customer Loans
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.teal} mt={0.5}>
                    {formatCurrency(custData.kpis.totalLoanBalance)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.12), color: COLORS.teal, width: 42, height: 42 }}>
                  <Landmark size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {custData.kpis.activeLoansCount} Active Loans • Interest: <strong>{formatCurrency(custData.kpis.loanInterestEarned)}</strong>
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Customer Retention */}
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
                    Customer Retention Rate
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {custData.kpis.retentionRate}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <UserCheck size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {custData.kpis.repeatCustomersCount} Repeat Buyers
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 3. QUICK ACTIONS BAR */}
      <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2} color="text.primary">
          Quick Customer & Receivables Operations
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'Add Customer', icon: <UserPlus size={20} />, path: '/sales/customers', color: COLORS.blue },
            { label: 'Create Invoice', icon: <Receipt size={20} />, path: '/sales/invoices', color: COLORS.purple },
            { label: 'Record Payment', icon: <CreditCard size={20} />, path: '/sales/payments', color: COLORS.green },
            { label: 'Customer Ledger', icon: <FileText size={20} />, path: '/sales/customers', color: COLORS.gray },
            { label: 'Customer Statement', icon: <Layers size={20} />, path: '/sales/customers', color: COLORS.teal },
            { label: 'Customer Report', icon: <BarChart2 size={20} />, path: '/reports/profit-loss', color: COLORS.red },
            { label: 'Compare Accounts', icon: <ArrowRightLeft size={20} />, action: () => setCompareModalOpen(true), color: COLORS.gold },
            { label: 'Customer Loans', icon: <Landmark size={20} />, path: '/sales/customers', color: COLORS.orange },
          ].map((action, idx) => (
            <Grid item xs={6} sm={3} md={1.5} key={idx}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => (action.action ? action.action() : action.path && navigate(action.path))}
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

      {/* 4. CUSTOMER OVERVIEW & SEGMENTATION */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={800} mb={2}>
          Customer Base Overview & Segmentation
        </Typography>
        <Grid container spacing={2}>
          {custData.overviewSegments.map((seg, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={idx}>
              <Paper
                elevation={0}
                onClick={() => navigate('/sales/customers')}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(seg.color, 0.06),
                  border: `1px solid ${alpha(seg.color, 0.2)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(seg.color, 0.12) },
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block">
                  {seg.label}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={seg.color} mt={0.5}>
                  {seg.count} Accounts
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Revenue: <strong>{seg.revenue}</strong>
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 5. TOP CUSTOMERS RANKING & CREDIT PROFILES */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Top Wholesale Customer Accounts & Financial Health
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {custData.topCustomers.map((cust) => (
          <Grid item xs={12} sm={6} md={2.4} key={cust.id}>
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
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Chip
                    size="small"
                    label={cust.tier}
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor:
                        cust.tier.includes('Platinum') ? alpha(COLORS.purple, 0.15) :
                        cust.tier.includes('Gold') ? alpha(COLORS.gold, 0.2) :
                        alpha(COLORS.blue, 0.15),
                      color:
                        cust.tier.includes('Platinum') ? COLORS.purple :
                        cust.tier.includes('Gold') ? COLORS.gold :
                        COLORS.blue,
                    }}
                  />
                  <Chip
                    size="small"
                    label={cust.creditStatus}
                    sx={{
                      fontSize: '0.6rem',
                      fontWeight: 700,
                      height: 18,
                      bgcolor:
                        cust.creditStatus === 'Exceeded Limit' ? alpha(COLORS.red, 0.15) :
                        cust.creditStatus === 'Near Limit' ? alpha(COLORS.orange, 0.15) :
                        alpha(COLORS.green, 0.15),
                      color:
                        cust.creditStatus === 'Exceeded Limit' ? COLORS.red :
                        cust.creditStatus === 'Near Limit' ? COLORS.orange :
                        COLORS.green,
                    }}
                  />
                </Box>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom lineHeight={1.3}>
                  {cust.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Purchased: <strong style={{ color: COLORS.purple }}>{formatCurrency(cust.totalPurchases)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Receivable: <strong style={{ color: cust.outstanding > cust.creditLimit ? COLORS.red : COLORS.gray }}>{formatCurrency(cust.outstanding)}</strong>
                </Typography>

                {/* Credit Limit Usage Progress Bar */}
                <Box mt={1} mb={1}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="caption" fontSize="0.65rem">Credit Limit</Typography>
                    <Typography variant="caption" fontWeight={700} fontSize="0.65rem">{formatCurrency(cust.creditLimit)}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.round((cust.outstanding / cust.creditLimit) * 100))}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: alpha(COLORS.blue, 0.12),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: cust.outstanding > cust.creditLimit ? COLORS.red : cust.outstanding > (cust.creditLimit * 0.8) ? COLORS.orange : COLORS.green,
                      },
                    }}
                  />
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/sales/customers')}
                sx={{ mt: 2, fontSize: '0.7rem', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                View Customer Profile
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 6 & 7. REVENUE ANALYTICS + ACCOUNTS RECEIVABLE AGING */}
      <Grid container spacing={3} mb={3.5}>
        {/* Trend Chart */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Customer Revenue & Daily Collections Trend
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Compare invoiced sales revenue vs customer payment receipts
                </Typography>
              </Box>

              <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((tf) => (
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
            </Box>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={currentSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} tickFormatter={(val) => `₹${val / 100000}L`} />
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Area type="monotone" name="Invoiced Revenue" dataKey="revenue" stroke={COLORS.blue} strokeWidth={3} fillOpacity={1} fill="url(#revGrad)" />
                <Area type="monotone" name="Collections" dataKey="collections" stroke={COLORS.green} strokeWidth={3} fillOpacity={1} fill="url(#colGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Accounts Receivable Overdue Table */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Overdue Accounts Receivable
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Customer invoices requiring payment follow-up
                </Typography>
              </Box>
              <Chip label="High Collection Priority" color="error" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell>Customer</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {custData.overdueReceivables.map((op, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{op.customer}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.red, fontSize: '0.8rem' }}>{formatCurrency(op.amount)}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${op.daysOverdue}d`} size="small" sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenPayment(op)}
                          sx={{ bgcolor: COLORS.green, fontSize: '0.68rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Collect
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

      {/* 8. CUSTOMER LOAN SUMMARY & REPAYMENTS */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Active Customer Loans & Financing Balances
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track active financing extended to wholesale buyers & accrued interest
            </Typography>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Customer Name</TableCell>
                <TableCell align="right">Principal Amount</TableCell>
                <TableCell align="right">Outstanding Loan</TableCell>
                <TableCell align="right">Accrued Interest</TableCell>
                <TableCell align="center">Next Payment Due</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {custData.customerLoansList.map((loan, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{loan.customer}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(loan.principal)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.teal }}>{formatCurrency(loan.outstanding)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: COLORS.green }}>{formatCurrency(loan.interest)}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{loan.nextDue}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenLoanRepayment(loan)}
                      sx={{ bgcolor: COLORS.teal, fontSize: '0.7rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Record Repayment
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 9. RECENT CUSTOMER ACTIVITIES & SMART INSIGHTS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Customer Activity Log</Typography>
            </Box>
            <Stack spacing={2.5}>
              {custData.timeline.map((item) => (
                <Box key={item.id} display="flex" gap={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor:
                        item.type === 'payment' ? alpha(COLORS.green, 0.12) :
                        item.type === 'invoice' ? alpha(COLORS.blue, 0.12) :
                        item.type === 'loan' ? alpha(COLORS.teal, 0.12) :
                        alpha(COLORS.orange, 0.12),
                      color:
                        item.type === 'payment' ? COLORS.green :
                        item.type === 'invoice' ? COLORS.blue :
                        item.type === 'loan' ? COLORS.teal :
                        COLORS.orange,
                    }}
                  >
                    {item.type === 'payment' ? <CreditCard size={18} /> :
                     item.type === 'invoice' ? <Receipt size={18} /> :
                     item.type === 'loan' ? <Landmark size={18} /> :
                     <RotateCcw size={18} />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ref: {item.ref} • {item.user} • {item.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Smart Insights */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Smart Customer Business Insights
            </Typography>
            <Stack spacing={2}>
              {custData.insights.map((ins) => (
                <Box key={ins.id} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Lightbulb size={18} color={ins.type === 'alert' ? COLORS.red : ins.type === 'warning' ? COLORS.orange : COLORS.blue} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                      Accounts Intelligence
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {ins.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 10. MATERIAL 3 FILTER DRAWER / BOTTOM SHEET */}
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
            Customer Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <X size={20} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={filters.category} label="Category" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <MenuItem value="All Categories">All Categories</MenuItem>
              <MenuItem value="Wholesale Chain">Wholesale Chain</MenuItem>
              <MenuItem value="Supermarket">Supermarket</MenuItem>
              <MenuItem value="Retail Store">Retail Store</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Credit Status</InputLabel>
            <Select value={filters.creditStatus} label="Credit Status" onChange={(e) => setFilters({ ...filters, creditStatus: e.target.value })}>
              <MenuItem value="All Statuses">All Credit Statuses</MenuItem>
              <MenuItem value="Within Limit">Within Limit</MenuItem>
              <MenuItem value="Near Limit">Near Limit</MenuItem>
              <MenuItem value="Exceeded Limit">Exceeded Limit</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Loan Status</InputLabel>
            <Select value={filters.loanStatus} label="Loan Status" onChange={(e) => setFilters({ ...filters, loanStatus: e.target.value })}>
              <MenuItem value="All Loan Statuses">All Loan Statuses</MenuItem>
              <MenuItem value="Active Loan">Has Active Loan</MenuItem>
              <MenuItem value="No Loan">No Loan</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setFilters({
              category: 'All Categories',
              creditStatus: 'All Statuses',
              paymentStatus: 'All Payment Statuses',
              loanStatus: 'All Loan Statuses',
              dateRange: 'This Month',
            })}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Reset Filters
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterDrawerOpen(false)}
            sx={{ bgcolor: COLORS.blue, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* 11. RECORD CUSTOMER PAYMENT DIALOG */}
      <Dialog open={recordPaymentDialogOpen} onClose={() => setRecordPaymentDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Customer Payment</DialogTitle>
        <DialogContent dividers>
          {selectedOverdue && (
            <Stack spacing={2} py={1}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(COLORS.green, 0.08)}>
                <Typography variant="caption" color="text.secondary">Customer</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedOverdue.customer}</Typography>
              </Box>
              <TextField
                label="Collection Amount (₹)"
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
            Confirm Collection
          </Button>
        </DialogActions>
      </Dialog>

      {/* 12. RECORD LOAN REPAYMENT DIALOG */}
      <Dialog open={recordLoanRepaymentOpen} onClose={() => setRecordLoanRepaymentOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Loan Repayment</DialogTitle>
        <DialogContent dividers>
          {selectedLoan && (
            <Stack spacing={2} py={1}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(COLORS.teal, 0.08)}>
                <Typography variant="caption" color="text.secondary">Borrower Account</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedLoan.customer}</Typography>
                <Typography variant="caption" color="text.secondary">Accrued Interest: {formatCurrency(selectedLoan.interest)}</Typography>
              </Box>
              <TextField
                label="Loan Repayment Amount (₹)"
                fullWidth
                size="small"
                value={loanRepayAmount}
                onChange={(e) => setLoanRepayAmount(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRecordLoanRepaymentOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setRecordLoanRepaymentOpen(false)}
            sx={{ bgcolor: COLORS.teal, textTransform: 'none', fontWeight: 700 }}
          >
            Confirm Repayment
          </Button>
        </DialogActions>
      </Dialog>

      {/* 13. CUSTOMER COMPARISON MODAL */}
      <Dialog open={compareModalOpen} onClose={() => setCompareModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Customer Accounts Side-by-Side Comparison</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                <TableCell>Financial Metric</TableCell>
                <TableCell>Metro Retailers</TableCell>
                <TableCell>Apex Traders</TableCell>
                <TableCell align="center">Top Performer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {custData.comparisonMatrix.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{row.metric}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.custA}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.custB}</TableCell>
                  <TableCell align="center">
                    <Chip label={row.winner} size="small" sx={{ bgcolor: alpha(COLORS.green, 0.15), color: COLORS.green, fontWeight: 800, fontSize: '0.65rem' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompareModalOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* 14. EXPANDABLE SPEED DIAL FAB */}
      <SpeedDial
        ariaLabel="Customer Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{
          sx: {
            bgcolor: COLORS.blue,
            '&:hover': { bgcolor: alpha(COLORS.blue, 0.9) },
            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
          },
        }}
      >
        <SpeedDialAction
          icon={<UserPlus size={18} />}
          tooltipTitle="Add Customer"
          onClick={() => navigate('/sales/customers')}
        />
        <SpeedDialAction
          icon={<Receipt size={18} />}
          tooltipTitle="Create Invoice"
          onClick={() => navigate('/sales/invoices')}
        />
        <SpeedDialAction
          icon={<CreditCard size={18} />}
          tooltipTitle="Record Payment"
          onClick={() => navigate('/sales/payments')}
        />
        <SpeedDialAction
          icon={<Landmark size={18} />}
          tooltipTitle="Record Loan Repayment"
          onClick={() => setRecordLoanRepaymentOpen(true)}
        />
      </SpeedDial>
    </Box>
  );
}
