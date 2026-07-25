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
import PurchaseReturnModal from '../../components/purchases/PurchaseReturnModal';

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
  gold: '#D4AF37',
  silver: '#9E9E9E',
  platinum: '#E5E4E2',
  bgLight: '#F8FAFC',
};

const MotionCard = motion.create(Card);

// MOCK DATA Fallback for Supplier Control Center
const MOCK_SUPPLIER_DATA = {
  kpis: {
    activeSuppliersCount: 84,
    newSuppliersThisMonth: 6,
    inactiveSuppliersCount: 12,
    totalPayable: 1280000,
    overduePayable: 340000,
    dueThisWeek: 210000,
    todayPurchases: 145000,
    thisMonthPurchases: 2840000,
    prevMonthPurchases: 2540000,
    pendingPOsCount: 12,
    pendingGRNsCount: 4,
    delayedDeliveriesCount: 3,
    paidThisMonth: 1850000,
    pendingPaymentsCount: 18,
    overduePaymentsCount: 5,
    debitNotesCount: 4,
    returnedGoodsValue: 45000,
    pendingResolutionsCount: 1,
    preferredSuppliersCount: 22,
    avgPurchasePerPreferred: 125000,
    purchaseFrequencyDays: 4,
    avgSupplierRating: 4.6,
    bestSupplierName: 'ITC Limited - Wholesale Div',
    lowestRatedSupplierName: 'Apex Raw Spices Trading',
  },
  overviewCategories: [
    { label: 'Active Suppliers', count: 84, color: COLORS.green, sub: 'Regular trading partners' },
    { label: 'Preferred Suppliers', count: 22, color: COLORS.purple, sub: 'Platinum & Gold Tier' },
    { label: 'Blocked / On Hold', count: 3, color: COLORS.red, sub: 'Credit limit or quality hold' },
    { label: 'New This Month', count: 6, color: COLORS.blue, sub: 'Onboarded in July' },
    { label: 'Inactive (>90 Days)', count: 12, color: COLORS.orange, sub: 'No purchases recently' },
  ],
  trendSeries: {
    Weekly: [
      { name: 'Week 1', purchases: 620000, payments: 580000, returns: 10000 },
      { name: 'Week 2', purchases: 710000, payments: 690000, returns: 15000 },
      { name: 'Week 3', purchases: 790000, purchasesTarget: 750000, payments: 720000, returns: 12000 },
      { name: 'Week 4', purchases: 720000, payments: 650000, returns: 8000 },
    ],
    Monthly: [
      { name: 'Feb', purchases: 2550000, payments: 2400000, returns: 35000 },
      { name: 'Mar', purchases: 3100000, payments: 2950000, returns: 50000 },
      { name: 'Apr', purchases: 2600000, payments: 2500000, returns: 28000 },
      { name: 'May', purchases: 2750000, payments: 2650000, returns: 32000 },
      { name: 'Jun', purchases: 2840000, payments: 2700000, returns: 40000 },
      { name: 'Jul (Est)', purchases: 2980000, payments: 2850000, returns: 45000 },
    ],
    Quarterly: [
      { name: 'Q1 FY26', purchases: 8050000, payments: 7850000, returns: 110000 },
      { name: 'Q2 FY26', purchases: 8450000, payments: 8200000, returns: 125000 },
      { name: 'Q3 FY26', purchases: 9200000, payments: 8900000, returns: 140000 },
      { name: 'Q4 FY26', purchases: 9800000, payments: 9600000, returns: 150000 },
    ],
    Yearly: [
      { name: 'FY 2023-24', purchases: 28500000, payments: 27800000, returns: 420000 },
      { name: 'FY 2024-25', purchases: 32400000, payments: 31800000, returns: 480000 },
      { name: 'FY 2025-26', purchases: 35500000, payments: 34900000, returns: 510000 },
    ],
  },
  topSuppliers: [
    {
      id: 'sup-1',
      name: 'ITC Limited - Wholesale Div',
      tier: 'Platinum',
      category: 'FMCG & Grains',
      totalValue: 620000,
      outstanding: 140000,
      lastDate: '2026-07-24',
      ordersCount: 24,
      avgInvoice: 25833,
      paymentStatus: 'Regular',
      onTimePercent: 96,
      avgLeadDays: 2,
      qualityScore: 4.9,
      rating: 5,
      riskLevel: 'Low',
      phone: '+91 98200 11223',
    },
    {
      id: 'sup-2',
      name: 'Adani Wilmar Supplies Ltd',
      tier: 'Gold',
      category: 'Edible Oils & Foods',
      totalValue: 480000,
      outstanding: 185000,
      lastDate: '2026-07-23',
      ordersCount: 18,
      avgInvoice: 26666,
      paymentStatus: 'Overdue (15d)',
      onTimePercent: 92,
      avgLeadDays: 3,
      qualityScore: 4.5,
      rating: 4.5,
      riskLevel: 'Medium',
      phone: '+91 98211 44556',
    },
    {
      id: 'sup-3',
      name: 'Hindustan Unilever Distributor',
      tier: 'Platinum',
      category: 'Personal Care & Soaps',
      totalValue: 410000,
      outstanding: 95000,
      lastDate: '2026-07-22',
      ordersCount: 16,
      avgInvoice: 25625,
      paymentStatus: 'Regular',
      onTimePercent: 98,
      avgLeadDays: 1,
      qualityScore: 5.0,
      rating: 5,
      riskLevel: 'Low',
      phone: '+91 98333 77889',
    },
    {
      id: 'sup-4',
      name: 'Nestle India Wholesale Agent',
      tier: 'Silver',
      category: 'Beverages & Dairy',
      totalValue: 350000,
      outstanding: 110000,
      lastDate: '2026-07-20',
      ordersCount: 14,
      avgInvoice: 25000,
      paymentStatus: 'Overdue (13d)',
      onTimePercent: 88,
      avgLeadDays: 4,
      qualityScore: 4.2,
      rating: 4,
      riskLevel: 'Medium',
      phone: '+91 98444 11223',
    },
    {
      id: 'sup-5',
      name: 'Parle Products Agency',
      tier: 'Gold',
      category: 'Confectionery',
      totalValue: 290000,
      outstanding: 60000,
      lastDate: '2026-07-21',
      ordersCount: 12,
      avgInvoice: 24166,
      paymentStatus: 'Regular',
      onTimePercent: 94,
      avgLeadDays: 2,
      qualityScore: 4.6,
      rating: 4.5,
      riskLevel: 'Low',
      phone: '+91 98555 99001',
    },
  ],
  overduePayables: [
    { supplier: 'Adani Wilmar Supplies Ltd', amount: 185000, dueDate: '2026-07-10', daysOverdue: 15, terms: 'Net 15 Days', risk: 'High' },
    { supplier: 'Nestle India Wholesale Agent', amount: 110000, dueDate: '2026-07-12', daysOverdue: 13, terms: 'Net 30 Days', risk: 'Medium' },
    { supplier: 'Apex Raw Spices Trading', amount: 45000, dueDate: '2026-07-05', daysOverdue: 20, terms: 'Net 10 Days', risk: 'Critical' },
  ],
  priceTrends: [
    { product: 'Basmati Rice Premium 25kg', lowestSupplier: 'ITC Limited', lowestPrice: 2350, highestSupplier: 'Local Mandi Agency', highestPrice: 2550, avgPrice: 2450, trend: '+4.2%' },
    { product: 'Fortune Sunflower Oil 15L', lowestSupplier: 'Adani Wilmar', lowestPrice: 1780, highestSupplier: 'City Super Stockist', highestPrice: 1920, avgPrice: 1850, trend: '-5.1%' },
    { product: 'Aashirvaad Shuddh Atta 10kg', lowestSupplier: 'ITC Limited', lowestPrice: 405, highestSupplier: 'Shree Mills Corp', highestPrice: 435, avgPrice: 420, trend: '0.0%' },
  ],
  qualityMetrics: {
    damagedGoodsCount: 5,
    incorrectDeliveriesCount: 2,
    quantityShortagesCount: 3,
    debitNotesCount: 4,
    avgQualityRating: 4.6,
    suppliersWithIssuesCount: 2,
  },
  riskIndicators: [
    { supplier: 'Apex Raw Spices Trading', risk: 'Critical', reason: 'High return rate (8%) & 20 days overdue payable', action: 'Block Orders' },
    { supplier: 'Adani Wilmar Supplies Ltd', risk: 'Medium', reason: 'Payable balance ₹1.85L exceeds Net 15 terms', action: 'Schedule Payment' },
    { supplier: 'Nestle India Wholesale Agent', risk: 'Medium', reason: 'Lead time increased from 2 to 4 days', action: 'Review Lead Time' },
  ],
  timeline: [
    { id: 1, type: 'payment', title: 'Payment of ₹1,40,000 sent to ITC Limited', time: '2 hours ago', ref: 'PAY-2026-098', user: 'Rahul K.' },
    { id: 2, type: 'grn', title: 'Goods Received (GRN-2026-0104) from Parle', time: '4 hours ago', ref: 'GRN-0104', user: 'Priya M.' },
    { id: 3, type: 'po', title: 'Purchase Order PO-2026-0098 issued to Havells', time: '6 hours ago', ref: 'PO-0098', user: 'Amit S.' },
    { id: 4, type: 'debit', title: 'Debit Note DN-2026-012 generated for Adani Wilmar', time: '1 day ago', ref: 'DN-0012', user: 'Suresh V.' },
  ],
  insights: [
    { id: 1, text: 'ITC Limited is your top supplier offering 4.2% lower price on Atta & Grains.', type: 'info' },
    { id: 2, text: '3 supplier payments worth ₹3.4L are overdue. Settle now to maintain credit terms.', type: 'warning' },
    { id: 3, text: 'Apex Raw Spices Trading quality rating dropped to 3.2. Consider switching vendor.', type: 'alert' },
    { id: 4, text: 'Adani Wilmar edible oil prices dropped by 5.1%. High purchasing savings opportunity.', type: 'info' },
  ],
  comparisonMatrix: [
    { metric: 'Avg Purchase Price (Atta 10kg)', supplierA: '₹405 (ITC)', supplierB: '₹425 (Shree Mills)', winner: 'Supplier A' },
    { metric: 'On-Time Delivery Rate', supplierA: '96%', supplierB: '88%', winner: 'Supplier A' },
    { metric: 'Lead Time (Days)', supplierA: '2 Days', supplierB: '4 Days', winner: 'Supplier A' },
    { metric: 'Credit Terms', supplierA: 'Net 30 Days', supplierB: 'Net 15 Days', winner: 'Supplier A' },
    { metric: 'Quality Rating', supplierA: '4.9 ★', supplierB: '4.2 ★', winner: 'Supplier A' },
  ],
};

export default function SuppliersDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [trendTimeframe, setTrendTimeframe] = useState<'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [recordPaymentDialogOpen, setRecordPaymentDialogOpen] = useState(false);
  const [selectedOverdue, setSelectedOverdue] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [purchaseReturnOpen, setPurchaseReturnOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    category: 'All Categories',
    riskLevel: 'All Risk Levels',
    paymentStatus: 'All Payment Statuses',
    tier: 'All Tiers',
    dateRange: 'This Month',
  });

  // Query Supabase with Fallback
  const { data: supData, refetch } = useQuery({
    queryKey: ['suppliersDashboardData', activeBusiness?.id, filters],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: dbSuppliers } = await supabase
            .from('suppliers')
            .select('*')
            .eq('business_id', activeBusiness.id);

          if (dbSuppliers && dbSuppliers.length > 0) {
            return {
              ...MOCK_SUPPLIER_DATA,
              kpis: {
                ...MOCK_SUPPLIER_DATA.kpis,
                activeSuppliersCount: dbSuppliers.length,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Using offline mock suppliers data:', err);
      }
      return MOCK_SUPPLIER_DATA;
    },
    initialData: MOCK_SUPPLIER_DATA,
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
    if (filters.category !== 'All Categories') count++;
    if (filters.riskLevel !== 'All Risk Levels') count++;
    if (filters.paymentStatus !== 'All Payment Statuses') count++;
    if (filters.tier !== 'All Tiers') count++;
    if (filters.dateRange !== 'This Month') count++;
    return count;
  }, [filters]);

  const currentSeries = supData.trendSeries[trendTimeframe] || supData.trendSeries.Monthly;

  // Empty State Preview Render
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Suppliers Dashboard
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
            <Store size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No Supplier Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Add wholesale suppliers, manufacturers, and super-stockists to track liabilities, delivery lead times, price trends, and vendor performance.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/purchases/suppliers')}
              sx={{ bgcolor: COLORS.blue, px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Add New Supplier
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
            Suppliers Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Supplier Relationship & Procurement Control Center • {dayjs().format('dddd, MMMM D, YYYY')}
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
              placeholder="Search suppliers, GSTIN, contacts..."
              inputProps={{ 'aria-label': 'search suppliers dashboard' }}
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
          <Tooltip title="Recalculate Supplier Metrics">
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

      {/* 2. SUPPLIER KPI CARDS (8 Cards) */}
      <Grid container spacing={2.5} mb={3.5}>
        {/* Total Active Suppliers */}
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
                    Active Suppliers
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.blue} mt={0.5}>
                    {supData.kpis.activeSuppliersCount} Vendors
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <Store size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${supData.kpis.newSuppliersThisMonth} New`} sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {supData.kpis.inactiveSuppliersCount} Inactive
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Total Outstanding Payables */}
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
                    {formatCurrency(supData.kpis.totalPayable)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, width: 42, height: 42 }}>
                  <AlertTriangle size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`Overdue: ${formatCurrency(supData.kpis.overduePayable)}`} sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Due Wk: {formatCurrency(supData.kpis.dueThisWeek)}
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Purchase Value */}
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
                    Monthly Purchases
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.purple} mt={0.5}>
                    {formatCurrency(supData.kpis.thisMonthPurchases)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <ShoppingCart size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label="Today: ₹1.45L" sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Prev: {formatCurrency(supData.kpis.prevMonthPurchases)}
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Pending Deliveries */}
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
                    Pending Deliveries
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.teal} mt={0.5}>
                    {supData.kpis.pendingPOsCount} POs / {supData.kpis.pendingGRNsCount} GRNs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.12), color: COLORS.teal, width: 42, height: 42 }}>
                  <Truck size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${supData.kpis.delayedDeliveriesCount} Delayed`} sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.68rem', height: 22 }} />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Supplier Payments */}
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
                    Paid This Month
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green} mt={0.5}>
                    {formatCurrency(supData.kpis.paidThisMonth)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, width: 42, height: 42 }}>
                  <CreditCard size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {supData.kpis.pendingPaymentsCount} Pending • <strong style={{ color: COLORS.red }}>{supData.kpis.overduePaymentsCount} Overdue</strong>
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Purchase Returns & Debit Notes */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.red, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Debit Notes & Returns
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.red} mt={0.5}>
                    {formatCurrency(supData.kpis.returnedGoodsValue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, width: 42, height: 42 }}>
                  <RotateCcw size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${supData.kpis.debitNotesCount} Debit Notes`} sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {supData.kpis.pendingResolutionsCount} Pending
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Preferred Suppliers */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.gold, 0.4)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Preferred Suppliers
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.gold} mt={0.5}>
                    {supData.kpis.preferredSuppliersCount} Preferred
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.gold, 0.15), color: COLORS.gold, width: 42, height: 42 }}>
                  <Award size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Avg Order: <strong>{formatCurrency(supData.kpis.avgPurchasePerPreferred)}</strong> • Every {supData.kpis.purchaseFrequencyDays}d
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Supplier Rating & Quality */}
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
                    Avg Vendor Rating
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {supData.kpis.avgSupplierRating} ★
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <Star size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" noWrap fontWeight={500}>
                  Best: <strong>{supData.kpis.bestSupplierName}</strong>
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 3. QUICK ACTIONS BAR */}
      <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2} color="text.primary">
          Quick Supplier Operations
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'Add Supplier', icon: <Store size={20} />, path: '/purchases/suppliers', color: COLORS.blue },
            { label: 'New Purchase Order', icon: <BookOpen size={20} />, path: '/purchases/orders', color: COLORS.purple },
            { label: 'Record Payment', icon: <CreditCard size={20} />, path: '/purchases/payments', color: COLORS.green },
            { label: 'Supplier Ledger', icon: <FileText size={20} />, path: '/purchases/suppliers', color: COLORS.gray },
            { label: 'Supplier Statement', icon: <Layers size={20} />, path: '/purchases/suppliers', color: COLORS.teal },
            { label: 'Compare Vendors', icon: <ArrowRightLeft size={20} />, action: () => setCompareModalOpen(true), color: COLORS.gold },
            { label: 'Purchase Reports', icon: <BarChart2 size={20} />, path: '/reports/profit-loss', color: COLORS.red },
            { label: 'Contact Vendor', icon: <Phone size={20} />, path: '/purchases/suppliers', color: COLORS.orange },
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

      {/* 4. SUPPLIER OVERVIEW CATEGORIES */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={800} mb={2}>
          Supplier Relationship Directory Overview
        </Typography>
        <Grid container spacing={2}>
          {supData.overviewCategories.map((cat, idx) => (
            <Grid item xs={12} sm={6} md={2.4} key={idx}>
              <Paper
                elevation={0}
                onClick={() => navigate('/purchases/suppliers')}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(cat.color, 0.06),
                  border: `1px solid ${alpha(cat.color, 0.2)}`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: alpha(cat.color, 0.12) },
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block">
                  {cat.label}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={cat.color} mt={0.5}>
                  {cat.count} Suppliers
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {cat.sub}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 5. TOP SUPPLIERS PERFORMANCE CARDS */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Top Supplier Performance & Preferred Vendor Ranking
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {supData.topSuppliers.map((sup) => (
          <Grid item xs={12} sm={6} md={2.4} key={sup.id}>
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
                    label={sup.tier}
                    sx={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      bgcolor:
                        sup.tier === 'Platinum' ? alpha(COLORS.purple, 0.15) :
                        sup.tier === 'Gold' ? alpha(COLORS.gold, 0.2) :
                        alpha(COLORS.gray, 0.15),
                      color:
                        sup.tier === 'Platinum' ? COLORS.purple :
                        sup.tier === 'Gold' ? COLORS.gold :
                        COLORS.gray,
                    }}
                  />
                  <Rating value={sup.rating} readOnly size="small" precision={0.5} />
                </Box>
                <Typography variant="subtitle2" fontWeight={800} gutterBottom lineHeight={1.3}>
                  {sup.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Category: <strong>{sup.category}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Purchased: <strong style={{ color: COLORS.purple }}>{formatCurrency(sup.totalValue)}</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Payable: <strong style={{ color: sup.outstanding > 100000 ? COLORS.red : COLORS.gray }}>{formatCurrency(sup.outstanding)}</strong>
                </Typography>

                <Stack spacing={0.5} mt={1}>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">On-Time Delivery</Typography>
                    <Typography variant="caption" fontWeight={700} color={COLORS.green}>{sup.onTimePercent}%</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="caption" color="text.secondary">Avg Lead Time</Typography>
                    <Typography variant="caption" fontWeight={700}>{sup.avgLeadDays} Days</Typography>
                  </Box>
                </Stack>
              </Box>

              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate('/purchases/suppliers')}
                sx={{ mt: 2, fontSize: '0.7rem', textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
              >
                View Supplier Ledger
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 6 & 7. PURCHASE TREND ANALYTICS + OUTSTANDING PAYABLES */}
      <Grid container spacing={3} mb={3.5}>
        {/* Trend Chart */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Supplier Procurement & Payment Trends
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Compare total purchases vs vendor payment settlements
                </Typography>
              </Box>

              <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                {(['Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map((tf) => (
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
                  <linearGradient id="purGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.green} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} tickFormatter={(val) => `₹${val / 100000}L`} />
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Area type="monotone" name="Purchases" dataKey="purchases" stroke={COLORS.purple} strokeWidth={3} fillOpacity={1} fill="url(#purGrad)" />
                <Area type="monotone" name="Payments" dataKey="payments" stroke={COLORS.green} strokeWidth={3} fillOpacity={1} fill="url(#payGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Outstanding Payables */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Overdue Supplier Liabilities
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  High priority supplier payments past credit terms
                </Typography>
              </Box>
              <Chip label="Action Required" color="error" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell>Supplier</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Overdue</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {supData.overduePayables.map((op, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{op.supplier}</TableCell>
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
                          Pay
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

      {/* 8. SUPPLIER PRICE TREND ANALYSIS & COMPARISON */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Supplier Price Trend Analysis & Price Matrix
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Compare wholesale purchasing costs across multiple vendors
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowRightLeft size={16} />}
            onClick={() => setCompareModalOpen(true)}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Compare Side-by-Side
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Product Name</TableCell>
                <TableCell>Lowest Price Vendor</TableCell>
                <TableCell align="right">Lowest Price</TableCell>
                <TableCell>Highest Price Vendor</TableCell>
                <TableCell align="right">Highest Price</TableCell>
                <TableCell align="center">Price Fluctuation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {supData.priceTrends.map((pt, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{pt.product}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.green }}>{pt.lowestSupplier}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.green }}>{formatCurrency(pt.lowestPrice)}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.red }}>{pt.highestSupplier}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.red }}>{formatCurrency(pt.highestPrice)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={pt.trend}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        bgcolor: pt.trend.startsWith('-') ? alpha(COLORS.green, 0.12) : pt.trend === '0.0%' ? alpha(COLORS.gray, 0.12) : alpha(COLORS.red, 0.12),
                        color: pt.trend.startsWith('-') ? COLORS.green : pt.trend === '0.0%' ? COLORS.gray : COLORS.red,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 9. SUPPLIER RISK & QUALITY METRICS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Risk Indicators */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <ShieldAlert size={22} color={COLORS.red} />
              <Typography variant="h6" fontWeight={800}>Supplier Risk Indicators & Controls</Typography>
            </Box>
            <Stack spacing={2}>
              {supData.riskIndicators.map((ri, idx) => (
                <Box key={idx} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={800}>{ri.supplier}</Typography>
                    <Chip
                      label={ri.risk}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        bgcolor: ri.risk === 'Critical' ? alpha(COLORS.red, 0.2) : alpha(COLORS.orange, 0.2),
                        color: ri.risk === 'Critical' ? COLORS.red : COLORS.orange,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {ri.reason}
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color={COLORS.blue} display="block" mt={0.5}>
                    Suggested Action: {ri.action}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Quality Metrics */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Vendor Delivery & Quality Audits
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(COLORS.red, 0.08), border: `1px solid ${alpha(COLORS.red, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Damaged Goods Incidents</Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.red}>{supData.qualityMetrics.damagedGoodsCount} Items</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(COLORS.orange, 0.08), border: `1px solid ${alpha(COLORS.orange, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Incorrect Quantities</Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.orange}>{supData.qualityMetrics.quantityShortagesCount} Incidents</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(COLORS.purple, 0.08), border: `1px solid ${alpha(COLORS.purple, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Debit Notes Generated</Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.purple}>{supData.qualityMetrics.debitNotesCount} Debit Notes</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(COLORS.green, 0.08), border: `1px solid ${alpha(COLORS.green, 0.2)}` }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Vendor Quality Score</Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green}>{supData.qualityMetrics.avgQualityRating} / 5.0 ★</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* 10. RECENT ACTIVITY TIMELINE & SMART INSIGHTS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Supplier Activities Log</Typography>
            </Box>
            <Stack spacing={2.5}>
              {supData.timeline.map((item) => (
                <Box key={item.id} display="flex" gap={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor:
                        item.type === 'payment' ? alpha(COLORS.green, 0.12) :
                        item.type === 'grn' ? alpha(COLORS.teal, 0.12) :
                        item.type === 'po' ? alpha(COLORS.purple, 0.12) :
                        alpha(COLORS.red, 0.12),
                      color:
                        item.type === 'payment' ? COLORS.green :
                        item.type === 'grn' ? COLORS.teal :
                        item.type === 'po' ? COLORS.purple :
                        COLORS.red,
                    }}
                  >
                    {item.type === 'payment' ? <CreditCard size={18} /> :
                     item.type === 'grn' ? <FolderOpen size={18} /> :
                     item.type === 'po' ? <BookOpen size={18} /> :
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

        {/* Insights */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Smart Procurement Insights
            </Typography>
            <Stack spacing={2}>
              {supData.insights.map((ins) => (
                <Box key={ins.id} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Lightbulb size={18} color={ins.type === 'alert' ? COLORS.red : ins.type === 'warning' ? COLORS.orange : COLORS.blue} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                      Vendor Intelligence
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

      {/* 11. MATERIAL 3 FILTER DRAWER / BOTTOM SHEET */}
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
            Supplier Filters
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
              <MenuItem value="FMCG & Grains">FMCG & Grains</MenuItem>
              <MenuItem value="Edible Oils & Foods">Edible Oils & Foods</MenuItem>
              <MenuItem value="Personal Care & Soaps">Personal Care & Soaps</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Risk Level</InputLabel>
            <Select value={filters.riskLevel} label="Risk Level" onChange={(e) => setFilters({ ...filters, riskLevel: e.target.value })}>
              <MenuItem value="All Risk Levels">All Risk Levels</MenuItem>
              <MenuItem value="Low">Low Risk</MenuItem>
              <MenuItem value="Medium">Medium Risk</MenuItem>
              <MenuItem value="Critical">Critical Risk</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Vendor Tier</InputLabel>
            <Select value={filters.tier} label="Vendor Tier" onChange={(e) => setFilters({ ...filters, tier: e.target.value })}>
              <MenuItem value="All Tiers">All Tiers</MenuItem>
              <MenuItem value="Platinum">Platinum Tier</MenuItem>
              <MenuItem value="Gold">Gold Tier</MenuItem>
              <MenuItem value="Silver">Silver Tier</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setFilters({
              category: 'All Categories',
              riskLevel: 'All Risk Levels',
              paymentStatus: 'All Payment Statuses',
              tier: 'All Tiers',
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

      {/* 12. SUPPLIER COMPARISON MODAL */}
      <Dialog open={compareModalOpen} onClose={() => setCompareModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Vendor Side-by-Side Comparison</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                <TableCell>Evaluation Metric</TableCell>
                <TableCell>Supplier A (ITC Ltd)</TableCell>
                <TableCell>Supplier B (Shree Mills)</TableCell>
                <TableCell align="center">Recommendation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {supData.comparisonMatrix.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{row.metric}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.supplierA}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.supplierB}</TableCell>
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

      {/* 13. RECORD PAYMENT DIALOG */}
      <Dialog open={recordPaymentDialogOpen} onClose={() => setRecordPaymentDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Supplier Payment</DialogTitle>
        <DialogContent dividers>
          {selectedOverdue && (
            <Stack spacing={2} py={1}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(COLORS.orange, 0.08)}>
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
            Confirm & Pay Vendor
          </Button>
        </DialogActions>
      </Dialog>

      {/* 14. EXPANDABLE SPEED DIAL FAB */}
      <SpeedDial
        ariaLabel="Supplier Quick Actions"
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
          icon={<Store size={18} />}
          tooltipTitle="Add Supplier"
          onClick={() => navigate('/purchases/suppliers')}
        />
        <SpeedDialAction
          icon={<BookOpen size={18} />}
          tooltipTitle="New Purchase Order"
          onClick={() => navigate('/purchases/orders')}
        />
        <SpeedDialAction
          icon={<CreditCard size={18} />}
          tooltipTitle="Record Payment"
          onClick={() => navigate('/purchases/payments')}
        />
        <SpeedDialAction
          icon={<ArrowRightLeft size={18} />}
          tooltipTitle="Compare Vendors"
          onClick={() => setCompareModalOpen(true)}
        />
        <SpeedDialAction
          icon={<RotateCcw size={18} />}
          tooltipTitle="Purchase Return & Credit Note"
          onClick={() => setPurchaseReturnOpen(true)}
        />
      </SpeedDial>

      {/* Purchase Return Modal */}
      <PurchaseReturnModal
        open={purchaseReturnOpen}
        onClose={() => setPurchaseReturnOpen(false)}
      />
    </Box>
  );
}
