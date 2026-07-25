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
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Package,
  AlertTriangle,
  XCircle,
  Archive,
  ArrowRightLeft,
  FileText,
  Truck,
  Plus,
  Settings,
  BarChart2,
  List,
  CheckCircle,
  Lightbulb,
  Clock,
  ClipboardList,
  ShoppingCart,
  Download,
  Upload,
  Filter,
  RefreshCw,
  X,
  Layers,
  Award,
  Zap,
  RotateCcw,
  Building2,
  Percent,
  AlertCircle,
  DollarSign,
  Calendar,
  Check,
} from 'lucide-react';
import {
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
  AreaChart,
  Area,
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
  primary: '#5C6BC0',
  success: '#43A047',
  info: '#0288D1',
  warning: '#F9A825',
  error: '#E53935',
  purple: '#7B1FA2',
  teal: '#00796B',
  gray: '#64748B',
  bgLight: '#F8FAFC',
};

const MotionCard = motion.create(Card);

// MOCK DATA Fallback
const MOCK_INVENTORY_DATA = {
  kpis: {
    totalValue: 4500000,
    valueGrowth: 12.5,
    totalQuantity: 15420,
    skuCount: 450,
    avgStockPerProduct: 34,
    lowStockCount: 45,
    criticalLowCount: 12,
    outOfStockCount: 12,
    overstockedCount: 28,
    overstockedValue: 500000,
    receivedToday: 1250,
    soldToday: 840,
    netChangeToday: 410,
    pendingReceiptsCount: 5,
    pendingReceiptsValue: 320000,
    pendingTransfersCount: 3,
    delayedTransfersCount: 1,
  },
  health: {
    healthy: 65,
    low: 15,
    overstock: 12,
    dead: 8,
    slowMoving: 18,
    fastMoving: 42,
  },
  valueSeries: {
    Weekly: [
      { name: 'Week 1', value: 4100000, turnover: 4.2 },
      { name: 'Week 2', value: 4250000, turnover: 4.5 },
      { name: 'Week 3', value: 4380000, turnover: 4.8 },
      { name: 'Week 4', value: 4500000, turnover: 5.1 },
    ],
    Monthly: [
      { name: 'Jan', value: 3800000, turnover: 3.8 },
      { name: 'Feb', value: 3950000, turnover: 4.1 },
      { name: 'Mar', value: 4200000, turnover: 4.6 },
      { name: 'Apr', value: 4100000, turnover: 4.4 },
      { name: 'May', value: 4350000, turnover: 4.9 },
      { name: 'Jun', value: 4500000, turnover: 5.1 },
    ],
    Quarterly: [
      { name: 'Q1 FY26', value: 3900000, turnover: 4.0 },
      { name: 'Q2 FY26', value: 4150000, turnover: 4.4 },
      { name: 'Q3 FY26', value: 4350000, turnover: 4.8 },
      { name: 'Q4 FY26', value: 4500000, turnover: 5.1 },
    ],
    Yearly: [
      { name: 'FY 2023-24', value: 3200000, turnover: 3.5 },
      { name: 'FY 2024-25', value: 3900000, turnover: 4.2 },
      { name: 'FY 2025-26', value: 4500000, turnover: 5.1 },
    ],
  },
  categoryValue: [
    { name: 'FMCG & Groceries', value: 1800000, skus: 180 },
    { name: 'Personal Care', value: 1200000, skus: 120 },
    { name: 'Beverages', value: 800000, skus: 80 },
    { name: 'Packaged Foods', value: 700000, skus: 70 },
  ],
  warehouseValue: [
    { name: 'Main Central Godown', value: 2500000, count: 220, capacity: 85, lowStock: 15, transfers: 2, receipts: 3, accuracy: 98.4 },
    { name: 'Central Warehouse WH-2', value: 1500000, count: 150, capacity: 60, lowStock: 8, transfers: 1, receipts: 2, accuracy: 99.1 },
    { name: 'City Distribution Depot', value: 500000, count: 80, capacity: 90, lowStock: 22, transfers: 0, receipts: 0, accuracy: 96.5 },
  ],
  lowStockItems: [
    { id: 1, name: 'Aashirvaad Shuddh Atta 10kg', qty: 8, min: 25, reorder: 50, supplier: 'ITC Ltd', lastPurchase: '2026-07-10', critical: true },
    { id: 2, name: 'Fortune Sunflower Oil 15L', qty: 15, min: 30, reorder: 60, supplier: 'Adani Wilmar', lastPurchase: '2026-07-12', critical: true },
    { id: 3, name: 'Samsung 43" Smart TV', qty: 5, min: 10, reorder: 20, supplier: 'Samsung India', lastPurchase: '2026-07-01', critical: false },
    { id: 4, name: 'Levi\'s 501 Jeans (32)', qty: 2, min: 15, reorder: 30, supplier: 'Apparel Dist.', lastPurchase: '2026-06-25', critical: true },
    { id: 5, name: 'Havells Ceiling Fan 1200mm', qty: 8, min: 20, reorder: 50, supplier: 'Havells Corp', lastPurchase: '2026-07-08', critical: false },
  ],
  movementSeries: [
    { name: 'Mon', received: 450, sold: 320, adjustments: 10, transfers: 25 },
    { name: 'Tue', received: 600, sold: 410, adjustments: -5, transfers: 40 },
    { name: 'Wed', received: 850, sold: 520, adjustments: 0, transfers: 30 },
    { name: 'Thu', received: 300, sold: 380, adjustments: -12, transfers: 15 },
    { name: 'Fri', received: 1100, sold: 740, adjustments: 8, transfers: 60 },
    { name: 'Sat', received: 1250, sold: 840, adjustments: 0, transfers: 45 },
    { name: 'Sun', received: 200, sold: 190, adjustments: 0, transfers: 10 },
  ],
  productPerformance: {
    fastMoving: [
      { name: 'Basmati Rice Premium 25kg', stock: 120, value: 300000, avgCost: 2500, daysIdle: 1, lastSale: 'Today' },
      { name: 'Tata Salt Crystal 1kg Box', stock: 450, value: 67500, avgCost: 150, daysIdle: 1, lastSale: 'Today' },
      { name: 'Red Label Tea Pack 1kg', stock: 85, value: 42500, avgCost: 500, daysIdle: 2, lastSale: 'Yesterday' },
    ],
    slowMoving: [
      { name: 'Whole Wheat Flakes 500g', stock: 140, value: 28000, avgCost: 200, daysIdle: 42, lastSale: '42 days ago' },
      { name: 'Plastic Container Set 3pc', stock: 95, value: 19000, avgCost: 200, daysIdle: 55, lastSale: '55 days ago' },
    ],
    highestValue: [
      { name: 'Samsung 43" Smart TV', stock: 5, value: 160000, avgCost: 32000, daysIdle: 5, lastSale: '5 days ago' },
      { name: 'Basmati Rice Premium 25kg', stock: 120, value: 300000, avgCost: 2500, daysIdle: 1, lastSale: 'Today' },
    ],
  },
  deadStock: {
    days30: [
      { name: 'Organic Honey Glass Jar 500g', stock: 65, value: 22750, warehouse: 'Main Central Godown', action: 'Discount 15%' },
    ],
    days60: [
      { name: 'Whole Wheat Flakes 500g', stock: 140, value: 28000, warehouse: 'Central Warehouse WH-2', action: 'Transfer to Store' },
    ],
    days90Plus: [
      { name: 'Plastic Container Set 3pc', stock: 95, value: 19000, warehouse: 'City Distribution Depot', action: 'Liquidate' },
      { name: 'Stainless Steel Flask 1L', stock: 110, value: 55000, warehouse: 'Main Central Godown', action: 'Return Supplier' },
    ],
  },
  inventoryAlerts: [
    { title: 'Negative Stock Risk', count: 2, severity: 'critical', desc: 'SKUs with negative balance after unposted GRNs' },
    { title: 'Pending GRNs Awaiting Verification', count: 5, severity: 'warning', desc: 'Goods receipts awaiting QC signoff' },
    { title: 'Damaged Stock Identified', count: 18, severity: 'warning', desc: 'Units marked damaged during physical count' },
    { title: 'Expired / Near Expiry Batches', count: 4, severity: 'critical', desc: 'Batches expiring within 30 days' },
  ],
  physicalCount: {
    lastCountDate: '2026-07-01',
    nextCountDate: '2026-08-01',
    pendingVarianceReviews: 3,
    approvedAdjustments: 14,
    variances: [
      { product: 'Tata Salt Crystal 1kg Box', expected: 465, counted: 450, diff: -15, valueDiff: -2250, status: 'Pending Review' },
      { product: 'Basmati Rice Premium 25kg', expected: 118, counted: 120, diff: 2, valueDiff: 5000, status: 'Approved' },
      { product: 'Fortune Sunflower Oil 15L', expected: 18, counted: 15, diff: -3, valueDiff: -6300, status: 'Pending Review' },
    ],
  },
  timeline: [
    { id: 1, type: 'receive', title: 'GRN-2026-089 Received (ITC Ltd)', time: '2 hours ago', user: 'Rahul K.', ref: 'GRN-2026-089', qty: '+450 Units' },
    { id: 2, type: 'transfer', title: 'Stock Transfer to Retail Depot', time: '4 hours ago', user: 'System', ref: 'ST-2026-042', qty: '60 Units' },
    { id: 3, type: 'sale', title: 'Sales Dispatch SO-4421', time: '5 hours ago', user: 'Priya M.', ref: 'INV-2026-0198', qty: '-120 Units' },
    { id: 4, type: 'adjust', title: 'Stock Adjustment (Damaged Box)', time: '1 day ago', user: 'Amit S.', ref: 'ADJ-2026-012', qty: '-5 Units' },
  ],
  insights: [
    { id: 1, text: 'FMCG category accounts for 40% of total inventory value.', type: 'info' },
    { id: 2, text: '12 items critically out of stock across all locations. Restock required.', type: 'warning' },
    { id: 3, text: 'City Distribution Depot is at 90% capacity. Consider pausing incoming transfers.', type: 'alert' },
    { id: 4, text: 'Stock turnover improved by 8.5% over the previous month.', type: 'info' },
  ],
  comparisons: [
    { period: 'Today vs Yesterday Movement', current: 410, previous: 280, growth: 46.4, positive: true },
    { period: 'This Week vs Last Week Received', current: 4750, previous: 4200, growth: 13.0, positive: true },
    { period: 'This Month vs Last Month Value', current: 4500000, previous: 4000000, growth: 12.5, positive: true },
    { period: 'Current FY vs Previous FY Turnover', current: 5.1, previous: 4.2, growth: 21.4, positive: true },
  ],
};

export default function InventoryDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [valueTimeframe, setValueTimeframe] = useState<'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [deadStockTab, setDeadStockTab] = useState<number>(0);
  const [productPerfTab, setProductPerfTab] = useState<number>(0);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Quick PO Dialog State
  const [createPODialogOpen, setCreatePODialogOpen] = useState(false);
  const [selectedLowStockItem, setSelectedLowStockItem] = useState<any>(null);
  const [poQty, setPoQty] = useState('');

  // Filters State
  const [filters, setFilters] = useState({
    warehouse: 'All Warehouses',
    category: 'All Categories',
    supplier: 'All Suppliers',
    product: 'All Products',
    stockStatus: 'All Statuses',
    valueRange: 'All Values',
    movementType: 'All Movements',
    dateRange: 'This Month',
  });

  // Query Supabase with Fallback
  const { data: invData, refetch } = useQuery({
    queryKey: ['inventoryDashboardData', activeBusiness?.id, filters],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: dbProducts } = await supabase
            .from('products')
            .select('*')
            .eq('business_id', activeBusiness.id);

          if (dbProducts && dbProducts.length > 0) {
            return {
              ...MOCK_INVENTORY_DATA,
              kpis: {
                ...MOCK_INVENTORY_DATA.kpis,
                skuCount: dbProducts.length,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Using offline mock inventory data:', err);
      }
      return MOCK_INVENTORY_DATA;
    },
    initialData: MOCK_INVENTORY_DATA,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenCreatePO = (item: any) => {
    setSelectedLowStockItem(item);
    setPoQty(item.reorder ? item.reorder.toString() : '50');
    setCreatePODialogOpen(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.warehouse !== 'All Warehouses') count++;
    if (filters.category !== 'All Categories') count++;
    if (filters.supplier !== 'All Suppliers') count++;
    if (filters.product !== 'All Products') count++;
    if (filters.stockStatus !== 'All Statuses') count++;
    if (filters.valueRange !== 'All Values') count++;
    if (filters.movementType !== 'All Movements') count++;
    if (filters.dateRange !== 'This Month') count++;
    return count;
  }, [filters]);

  const currentValSeries = invData.valueSeries[valueTimeframe] || invData.valueSeries.Monthly;

  // Empty State Preview Render
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Inventory Dashboard
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
              bgcolor: alpha(COLORS.info, 0.1),
              color: COLORS.info,
              mx: 'auto',
              mb: 3,
            }}
          >
            <Package size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No Inventory Items Added
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Add products, set up warehouses, or create your first Goods Receipt Note (GRN) to populate live stock command center analytics.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/inventory/products')}
              sx={{ bgcolor: COLORS.primary, px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Add First Product
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
            Inventory Dashboard
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
              placeholder="Search products, SKUs..."
              inputProps={{ 'aria-label': 'search inventory' }}
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
              borderColor: activeFiltersCount > 0 ? COLORS.info : theme.palette.divider,
              color: activeFiltersCount > 0 ? COLORS.info : 'text.primary',
              bgcolor: activeFiltersCount > 0 ? alpha(COLORS.info, 0.08) : isDark ? '#1E293B' : 'white',
              textTransform: 'none',
              fontWeight: 600,
              height: 40,
            }}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {/* Refresh Action */}
          <Tooltip title="Recalculate & Refresh Inventory Metrics">
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
            <Badge badgeContent={4} color="error">
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

      {/* 2. INVENTORY KPI CARDS */}
      <Grid container spacing={2.5} mb={3.5}>
        {/* Total Inventory Value */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.primary, 0.2)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.primary, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Total Inventory Value
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.primary} mt={0.5}>
                    {formatCurrency(invData.kpis.totalValue)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.primary, 0.12), color: COLORS.primary, width: 42, height: 42 }}>
                  <BarChart2 size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  icon={<TrendingUp size={12} />}
                  label={`+${invData.kpis.valueGrowth}%`}
                  sx={{ bgcolor: alpha(COLORS.success, 0.12), color: COLORS.success, fontWeight: 700, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  vs Last Month
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Total Stock Quantity */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.info, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Total Stock Quantity
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {invData.kpis.totalQuantity.toLocaleString()} Units
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.info, 0.12), color: COLORS.info, width: 42, height: 42 }}>
                  <Package size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${invData.kpis.skuCount} SKUs`} sx={{ bgcolor: alpha(COLORS.info, 0.12), color: COLORS.info, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Avg {invData.kpis.avgStockPerProduct} Units/SKU
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Low Stock Items */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.warning, 0.3)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.warning, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Low Stock Items
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.warning} mt={0.5}>
                    {invData.kpis.lowStockCount} SKUs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.warning, 0.12), color: COLORS.warning, width: 42, height: 42 }}>
                  <AlertTriangle size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  label={`${invData.kpis.criticalLowCount} Critical`}
                  sx={{ bgcolor: alpha(COLORS.error, 0.12), color: COLORS.error, fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Below Reorder Level
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Out of Stock */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.error, 0.3)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.error, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Out of Stock
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.error} mt={0.5}>
                    {invData.kpis.outOfStockCount} SKUs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.error, 0.12), color: COLORS.error, width: 42, height: 42 }}>
                  <XCircle size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  label="Urgent Restocking Needed"
                  sx={{ bgcolor: alpha(COLORS.error, 0.15), color: COLORS.error, fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Overstocked Products */}
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
                    Overstocked Items
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.purple} mt={0.5}>
                    {invData.kpis.overstockedCount} SKUs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <Archive size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Trapped Val: <strong>{formatCurrency(invData.kpis.overstockedValue)}</strong>
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Today's Stock Movement */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.success, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Today's Movement
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.success} mt={0.5}>
                    +{invData.kpis.netChangeToday} Units
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.success, 0.12), color: COLORS.success, width: 42, height: 42 }}>
                  <ArrowRightLeft size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`In: +${invData.kpis.receivedToday}`} sx={{ bgcolor: alpha(COLORS.success, 0.12), color: COLORS.success, fontSize: '0.65rem', height: 20 }} />
                <Chip size="small" label={`Out: -${invData.kpis.soldToday}`} sx={{ bgcolor: alpha(COLORS.info, 0.12), color: COLORS.info, fontSize: '0.65rem', height: 20 }} />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Pending Receipts */}
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
                    Pending Receipts
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {invData.kpis.pendingReceiptsCount} POs / GRNs
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.primary, 0.12), color: COLORS.primary, width: 42, height: 42 }}>
                  <FileText size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Val: <strong>{formatCurrency(invData.kpis.pendingReceiptsValue)}</strong> Expected
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Pending Transfers */}
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
                    Pending Transfers
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {invData.kpis.pendingTransfersCount} In-Transit
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.info, 0.12), color: COLORS.info, width: 42, height: 42 }}>
                  <Truck size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip
                  size="small"
                  label={`${invData.kpis.delayedTransfersCount} Delayed`}
                  sx={{ bgcolor: alpha(COLORS.warning, 0.15), color: COLORS.warning, fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 3. QUICK ACTIONS BAR */}
      <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2} color="text.primary">
          Quick Warehouse & Inventory Operations
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'Add Product', icon: <Plus size={20} />, path: '/inventory/products', color: COLORS.primary },
            { label: 'New Purchase Order', icon: <ShoppingCart size={20} />, path: '/purchases/orders', color: COLORS.info },
            { label: 'Create GRN', icon: <Download size={20} />, path: '/purchases/grn', color: COLORS.success },
            { label: 'Stock Adjustment', icon: <Settings size={20} />, path: '/inventory/stock-ledger', color: COLORS.warning },
            { label: 'Stock Transfer', icon: <Truck size={20} />, path: '/inventory/warehouses', color: COLORS.purple },
            { label: 'Physical Count', icon: <ClipboardList size={20} />, path: '/inventory/stock-ledger', color: COLORS.primary },
            { label: 'Reorder Suggestions', icon: <Lightbulb size={20} />, path: '/inventory/products', color: COLORS.warning },
            { label: 'View Products', icon: <List size={20} />, path: '/inventory/products', color: COLORS.info },
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

      {/* 4 & 5. INVENTORY HEALTH & INVENTORY VALUE ANALYSIS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Health Overview */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={1}>
              Inventory Health Monitor
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={3}>
              Stock distribution by movement & restocking risk
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.success}>Healthy Stock</Typography>
                  <Typography variant="caption" fontWeight={800}>{invData.health.healthy}% ({invData.health.fastMoving}% Fast Moving)</Typography>
                </Box>
                <LinearProgress variant="determinate" value={invData.health.healthy} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.success, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.success } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.warning}>Low Stock Warning</Typography>
                  <Typography variant="caption" fontWeight={800}>{invData.health.low}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={invData.health.low} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.warning, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.warning } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.purple}>Overstocked</Typography>
                  <Typography variant="caption" fontWeight={800}>{invData.health.overstock}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={invData.health.overstock} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.purple, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.purple } }} />
              </Box>

              <Box>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600} color={COLORS.error}>Dead / Non-Moving</Typography>
                  <Typography variant="caption" fontWeight={800}>{invData.health.dead}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={invData.health.dead} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(COLORS.error, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.error } }} />
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Value & Turnover Chart */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Inventory Value & Stock Turnover
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Valuation trend across custom reporting periods
                </Typography>
              </Box>

              <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                {(['Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map((tf) => (
                  <Button
                    key={tf}
                    size="small"
                    onClick={() => setValueTimeframe(tf)}
                    sx={{
                      px: 1.2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: valueTimeframe === tf ? (isDark ? '#334155' : 'white') : 'transparent',
                      color: valueTimeframe === tf ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    {tf}
                  </Button>
                ))}
              </Stack>
            </Box>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={currentValSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="invValGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} tickFormatter={(val) => `₹${val / 100000}L`} />
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Area type="monotone" dataKey="value" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#invValGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 6. WAREHOUSE SUMMARY & CAPACITY CARDS */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Warehouse Overview & Operations
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {invData.warehouseValue.map((wh, idx) => (
          <Grid item xs={12} md={4} key={idx}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 4,
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1px solid ${theme.palette.divider}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': { transform: 'translateY(-3px)' },
              }}
              onClick={() => navigate('/inventory/warehouses')}
            >
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {wh.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {wh.count} SKUs Stocked
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.info, 0.12), color: COLORS.info, width: 36, height: 36 }}>
                  <Building2 size={18} />
                </Avatar>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Stock Value</Typography>
                <Typography variant="body2" fontWeight={800} color={COLORS.primary}>{formatCurrency(wh.value)}</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Inventory Accuracy</Typography>
                <Typography variant="body2" fontWeight={800} color={COLORS.success}>{wh.accuracy}%</Typography>
              </Box>

              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body2" color="text.secondary">Low Stock / Transfers</Typography>
                <Stack direction="row" spacing={0.5}>
                  <Chip label={`${wh.lowStock} Low`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(COLORS.warning, 0.12), color: COLORS.warning, fontWeight: 700 }} />
                  <Chip label={`${wh.transfers} Pending`} size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, fontWeight: 700 }} />
                </Stack>
              </Box>

              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Capacity Utilization ({wh.capacity}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={wh.capacity}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(wh.capacity > 85 ? COLORS.error : COLORS.primary, 0.15),
                  '& .MuiLinearProgress-bar': { bgcolor: wh.capacity > 85 ? COLORS.error : COLORS.primary },
                }}
              />
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 7. LOW STOCK & INTELLIGENT REORDER SECTION */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Low Stock & Intelligent Reorder List
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Items at or below reorder threshold requiring purchase orders
            </Typography>
          </Box>
          <Button size="small" onClick={() => navigate('/inventory/products')} sx={{ textTransform: 'none', fontWeight: 700 }}>
            View All SKUs
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Current Qty</TableCell>
                <TableCell align="right">Min Stock</TableCell>
                <TableCell align="right">Recommended Reorder</TableCell>
                <TableCell>Preferred Supplier</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invData.lowStockItems.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {item.critical && <AlertTriangle size={16} color={COLORS.error} />}
                      {item.name}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={`${item.qty} Units`}
                      size="small"
                      sx={{
                        bgcolor: item.qty === 0 ? alpha(COLORS.error, 0.12) : alpha(COLORS.warning, 0.12),
                        color: item.qty === 0 ? COLORS.error : COLORS.warning,
                        fontWeight: 800,
                        fontSize: '0.7rem',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{item.min}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.primary }}>{item.reorder}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{item.supplier}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleOpenCreatePO(item)}
                      sx={{ bgcolor: COLORS.primary, fontSize: '0.7rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Create PO
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 8. STOCK MOVEMENT ANALYTICS CHART */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 380, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Stock Movement Analytics (Inbound vs Outbound)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Units received, sold, adjusted, and transferred daily
            </Typography>
          </Box>
        </Box>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={invData.movementSeries} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} />
            <RechartsTooltip />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="received" name="Stock Received" fill={COLORS.success} radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="sold" name="Stock Sold" fill={COLORS.info} radius={[4, 4, 0, 0]} maxBarSize={30} />
            <Bar dataKey="transfers" name="Transfers" fill={COLORS.purple} radius={[4, 4, 0, 0]} maxBarSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      {/* 9. PRODUCT PERFORMANCE & DEAD STOCK ANALYSIS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Fast vs Slow Moving Products */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>
                Product Performance Breakdown
              </Typography>

              <Tabs
                value={productPerfTab}
                onChange={(_, val) => setProductPerfTab(val)}
                sx={{ minHeight: 32, '& .MuiTab-root': { py: 0.5, px: 1, minHeight: 32, fontSize: '0.7rem', fontWeight: 700 } }}
              >
                <Tab label="Fast Moving" />
                <Tab label="Slow Moving" />
                <Tab label="Highest Value" />
              </Tabs>
            </Box>

            <Stack spacing={1.5}>
              {(productPerfTab === 0
                ? invData.productPerformance.fastMoving
                : productPerfTab === 1
                ? invData.productPerformance.slowMoving
                : invData.productPerformance.highestValue
              ).map((p, idx) => (
                <Box key={idx} p={1.5} borderRadius={2.5} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Stock: {p.stock} Units • Val: {formatCurrency(p.value)}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" fontWeight={700} display="block" color={productPerfTab === 1 ? COLORS.warning : COLORS.success}>
                      {p.lastSale}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontSize="0.65rem">
                      Idle: {p.daysIdle} days
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Dead Stock Analysis */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Dead Stock & Trapped Capital
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Non-moving inventory analysis
                </Typography>
              </Box>

              <Tabs
                value={deadStockTab}
                onChange={(_, val) => setDeadStockTab(val)}
                sx={{ minHeight: 32, '& .MuiTab-root': { py: 0.5, px: 1, minHeight: 32, fontSize: '0.7rem', fontWeight: 700 } }}
              >
                <Tab label="30 Days" />
                <Tab label="60 Days" />
                <Tab label="90+ Days" />
              </Tabs>
            </Box>

            <Stack spacing={1.5}>
              {(deadStockTab === 0
                ? invData.deadStock.days30
                : deadStockTab === 1
                ? invData.deadStock.days60
                : invData.deadStock.days90Plus
              ).map((ds, idx) => (
                <Box key={idx} p={1.5} borderRadius={2.5} bgcolor={alpha(COLORS.error, 0.04)} border={`1px solid ${alpha(COLORS.error, 0.2)}`} display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{ds.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ds.stock} Units • {ds.warehouse}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2" fontWeight={800} color={COLORS.error}>
                      {formatCurrency(ds.value)}
                    </Typography>
                    <Chip label={ds.action} size="small" sx={{ fontSize: '0.65rem', height: 20, bgcolor: alpha(COLORS.error, 0.15), color: COLORS.error, fontWeight: 700 }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 10. PHYSICAL STOCK COUNT & VARIANCE MONITOR */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Physical Stock Count & Variance Audits
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last Count: <strong>{invData.physicalCount.lastCountDate}</strong> • Next Scheduled: <strong>{invData.physicalCount.nextCountDate}</strong>
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<ClipboardList size={18} />}
            onClick={() => navigate('/inventory/stock-ledger')}
            sx={{ bgcolor: COLORS.primary, textTransform: 'none', fontWeight: 700, borderRadius: 2.5 }}
          >
            Start Physical Count
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Product Name</TableCell>
                <TableCell align="right">Expected Qty</TableCell>
                <TableCell align="right">Counted Qty</TableCell>
                <TableCell align="right">Difference</TableCell>
                <TableCell align="right">Value Difference</TableCell>
                <TableCell align="center">Review Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invData.physicalCount.variances.map((varItem, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{varItem.product}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{varItem.expected}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{varItem.counted}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: varItem.diff < 0 ? COLORS.error : COLORS.success }}>
                    {varItem.diff > 0 ? `+${varItem.diff}` : varItem.diff}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: varItem.valueDiff < 0 ? COLORS.error : COLORS.success }}>
                    {formatCurrency(varItem.valueDiff)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={varItem.status}
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor: varItem.status === 'Approved' ? alpha(COLORS.success, 0.12) : alpha(COLORS.warning, 0.12),
                        color: varItem.status === 'Approved' ? COLORS.success : COLORS.warning,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 11. RECENT INVENTORY ACTIVITIES & ALERTS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Activity Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Inventory Movement Activity</Typography>
            </Box>
            <Stack spacing={2.5}>
              {invData.timeline.map((item) => (
                <Box key={item.id} display="flex" gap={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor:
                        item.type === 'receive' ? alpha(COLORS.success, 0.12) :
                        item.type === 'transfer' ? alpha(COLORS.purple, 0.12) :
                        item.type === 'sale' ? alpha(COLORS.info, 0.12) :
                        alpha(COLORS.warning, 0.12),
                      color:
                        item.type === 'receive' ? COLORS.success :
                        item.type === 'transfer' ? COLORS.purple :
                        item.type === 'sale' ? COLORS.info :
                        COLORS.warning,
                    }}
                  >
                    {item.type === 'receive' ? <Download size={18} /> :
                     item.type === 'transfer' ? <Truck size={18} /> :
                     item.type === 'sale' ? <Upload size={18} /> :
                     <Settings size={18} />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ref: {item.ref} • {item.user} • {item.time}
                    </Typography>
                  </Box>
                  <Chip label={item.qty} size="small" sx={{ fontWeight: 800, fontSize: '0.7rem' }} />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Operational Alerts */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Critical Inventory Alerts
            </Typography>
            <Stack spacing={2}>
              {invData.inventoryAlerts.map((alt, idx) => (
                <Box key={idx} p={2} borderRadius={3} bgcolor={alpha(alt.severity === 'critical' ? COLORS.error : COLORS.warning, 0.05)} border={`1px solid ${alpha(alt.severity === 'critical' ? COLORS.error : COLORS.warning, 0.2)}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2" fontWeight={700} color={alt.severity === 'critical' ? COLORS.error : COLORS.warning}>
                      {alt.title}
                    </Typography>
                    <Chip label={`${alt.count}`} size="small" color={alt.severity === 'critical' ? 'error' : 'warning'} sx={{ fontWeight: 800 }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {alt.desc}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 12. SMART INVENTORY INSIGHTS */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Smart Inventory Executive Insights
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {invData.insights.map((ins) => (
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
                <Lightbulb size={20} color={ins.type === 'alert' ? COLORS.error : ins.type === 'warning' ? COLORS.warning : COLORS.info} />
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                  Recommendation
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {ins.text}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 13. INVENTORY PERFORMANCE COMPARISON */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Inventory Performance Comparison
      </Typography>
      <Grid container spacing={2.5} mb={4}>
        {invData.comparisons.map((comp, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {comp.period}
              </Typography>
              <Typography variant="h6" fontWeight={800} mt={0.5}>
                {comp.current.toLocaleString()}
              </Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                <Typography variant="caption" color="text.secondary">Prev: {comp.previous.toLocaleString()}</Typography>
                <Chip
                  size="small"
                  icon={<TrendingUp size={12} />}
                  label={`+${comp.growth}%`}
                  sx={{ bgcolor: alpha(COLORS.success, 0.12), color: COLORS.success, fontWeight: 800, fontSize: '0.7rem', height: 20 }}
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
            Inventory Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <X size={20} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Warehouse</InputLabel>
            <Select value={filters.warehouse} label="Warehouse" onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}>
              <MenuItem value="All Warehouses">All Warehouses</MenuItem>
              <MenuItem value="Main Godown">Main Central Godown</MenuItem>
              <MenuItem value="Central WH">Central Warehouse WH-2</MenuItem>
              <MenuItem value="City Depot">City Distribution Depot</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select value={filters.category} label="Category" onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              <MenuItem value="All Categories">All Categories</MenuItem>
              <MenuItem value="FMCG">FMCG & Groceries</MenuItem>
              <MenuItem value="Personal Care">Personal Care</MenuItem>
              <MenuItem value="Beverages">Beverages</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Stock Status</InputLabel>
            <Select value={filters.stockStatus} label="Stock Status" onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}>
              <MenuItem value="All Statuses">All Statuses</MenuItem>
              <MenuItem value="Healthy">Healthy Stock</MenuItem>
              <MenuItem value="Low Stock">Low Stock</MenuItem>
              <MenuItem value="Out of Stock">Out of Stock</MenuItem>
              <MenuItem value="Overstocked">Overstocked</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Movement Type</InputLabel>
            <Select value={filters.movementType} label="Movement Type" onChange={(e) => setFilters({ ...filters, movementType: e.target.value })}>
              <MenuItem value="All Movements">All Movements</MenuItem>
              <MenuItem value="Fast Moving">Fast Moving</MenuItem>
              <MenuItem value="Slow Moving">Slow Moving</MenuItem>
              <MenuItem value="Dead Stock">Dead Stock (Non-Moving)</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setFilters({
              warehouse: 'All Warehouses',
              category: 'All Categories',
              supplier: 'All Suppliers',
              product: 'All Products',
              stockStatus: 'All Statuses',
              valueRange: 'All Values',
              movementType: 'All Movements',
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
            sx={{ bgcolor: COLORS.primary, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* 15. CREATE PO MODAL */}
      <Dialog open={createPODialogOpen} onClose={() => setCreatePODialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Create Quick Purchase Order</DialogTitle>
        <DialogContent dividers>
          {selectedLowStockItem && (
            <Stack spacing={2} py={1}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(COLORS.info, 0.08)}>
                <Typography variant="caption" color="text.secondary">Product</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedLowStockItem.name}</Typography>
                <Typography variant="caption" color="text.secondary">Preferred Supplier: {selectedLowStockItem.supplier}</Typography>
              </Box>
              <TextField
                label="Reorder Quantity (Units)"
                fullWidth
                size="small"
                value={poQty}
                onChange={(e) => setPoQty(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreatePODialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setCreatePODialogOpen(false)}
            sx={{ bgcolor: COLORS.primary, textTransform: 'none', fontWeight: 700 }}
          >
            Generate Purchase Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* 16. EXPANDABLE SPEED DIAL FAB */}
      <SpeedDial
        ariaLabel="Inventory Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{
          sx: {
            bgcolor: COLORS.primary,
            '&:hover': { bgcolor: alpha(COLORS.primary, 0.9) },
            boxShadow: '0 8px 24px rgba(92, 107, 192, 0.4)',
          },
        }}
      >
        <SpeedDialAction
          icon={<Plus size={18} />}
          tooltipTitle="Add Product"
          onClick={() => navigate('/inventory/products')}
        />
        <SpeedDialAction
          icon={<ShoppingCart size={18} />}
          tooltipTitle="New PO"
          onClick={() => navigate('/purchases/orders')}
        />
        <SpeedDialAction
          icon={<Download size={18} />}
          tooltipTitle="Create GRN"
          onClick={() => navigate('/purchases/grn')}
        />
        <SpeedDialAction
          icon={<Settings size={18} />}
          tooltipTitle="Stock Adjustment"
          onClick={() => navigate('/inventory/stock-ledger')}
        />
        <SpeedDialAction
          icon={<Truck size={18} />}
          tooltipTitle="Stock Transfer"
          onClick={() => navigate('/inventory/warehouses')}
        />
      </SpeedDial>
    </Box>
  );
}
