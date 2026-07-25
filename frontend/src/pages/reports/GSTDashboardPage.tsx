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
  FileText,
  DollarSign,
  CreditCard,
  Plus,
  Filter,
  RefreshCw,
  X,
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
  Gavel,
  CheckSquare,
  FileCheck,
  Receipt,
  Truck,
  Landmark,
  Scale,
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
  LineChart,
  Line,
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

// MOCK DATA Fallback for GST Compliance Center
const MOCK_GST_DATA = {
  kpis: {
    gstin: '27AABCB1234C1Z5',
    financialYear: 'FY 2026-27',
    complianceScore: 92,
    outputGstTotal: 540000,
    cgstOutput: 270000,
    sgstOutput: 270000,
    igstOutput: 0,
    outputGrowthMom: 11.4,
    eligibleItcTotal: 395000,
    ineligibleItc: 12000,
    pendingItc: 28000,
    claimedItc: 355000,
    remainingItc: 40000,
    netGstPayable: 145000,
    netGstRefund: 0,
    taxableSalesTotal: 3000000,
    salesGstCollected: 540000,
    salesInvoiceCount: 240,
    avgSalesInvoice: 12500,
    taxablePurchasesTotal: 2200000,
    purchasesGstPaid: 395000,
    supplierCount: 18,
  },
  filingStatus: [
    { returnType: 'GSTR-1', status: 'Pending', dueDate: '2026-08-11', daysLeft: 17, description: 'Outward Supplies Return' },
    { returnType: 'GSTR-3B', status: 'Pending', dueDate: '2026-08-20', daysLeft: 26, description: 'Monthly Summary & Tax Payment' },
    { returnType: 'GSTR-9', status: 'In Progress', dueDate: '2026-12-31', progress: 45, description: 'Annual GST Return' },
  ],
  otherReturns: [
    { name: 'CMP-08', status: 'N/A' },
    { name: 'GSTR-4', status: 'N/A' },
    { name: 'GSTR-6', status: 'Filed' },
    { name: 'GSTR-7', status: 'N/A' },
    { name: 'GSTR-8', status: 'N/A' },
  ],
  liabilitySummaryTable: [
    { taxType: 'CGST', output: 270000, input: 197500, adjustment: 0, net: 72500 },
    { taxType: 'SGST', output: 270000, input: 197500, adjustment: 0, net: 72500 },
    { taxType: 'IGST', output: 0, input: 0, adjustment: 0, net: 0 },
    { taxType: 'CESS', output: 0, input: 0, adjustment: 0, net: 0 },
  ],
  trendSeries: {
    Monthly: [
      { name: 'Feb', output: 480000, input: 350000, net: 130000, sales: 2650000 },
      { name: 'Mar', output: 560000, input: 410000, net: 150000, sales: 3100000 },
      { name: 'Apr', output: 490000, input: 360000, net: 130000, sales: 2720000 },
      { name: 'May', output: 520000, input: 380000, net: 140000, sales: 2890000 },
      { name: 'Jun', output: 485000, input: 355000, net: 130000, sales: 2690000 },
      { name: 'Jul (Est)', output: 540000, input: 395000, net: 145000, sales: 3000000 },
    ],
    Quarterly: [
      { name: 'Q1 FY26', output: 1495000, input: 1095000, net: 400000, sales: 8300000 },
      { name: 'Q2 FY26', output: 1585000, input: 1160000, net: 425000, sales: 8800000 },
      { name: 'Q3 FY26', output: 1720000, input: 1260000, net: 460000, sales: 9550000 },
      { name: 'Q4 FY26', output: 1810000, input: 1320000, net: 490000, sales: 10050000 },
    ],
    Yearly: [
      { name: 'FY 2023-24', output: 5400000, input: 3950000, net: 1450000, sales: 30000000 },
      { name: 'FY 2024-25', output: 6100000, input: 4450000, net: 1650000, sales: 33800000 },
      { name: 'FY 2025-26', output: 6610000, input: 4835000, net: 1775000, sales: 36700000 },
    ],
  },
  reconciliation: {
    salesMatched: 225,
    salesPending: 10,
    salesMismatchVal: 15000,
    purchasesMatched: 165,
    purchasesPending: 12,
    purchasesMismatchVal: 28000,
    validGstin: 295,
    invalidGstin: 3,
    missingGstin: 6,
    missingHsnCount: 8,
    incorrectRateCount: 2,
    hsnReadinessPct: 96,
  },
  hsnSummary: [
    { hsnCode: '1001', description: 'Wheat & Meslin Grains', qtySold: 4500, taxableValue: 1440000, gstCollected: 72000, rate: '5%' },
    { hsnCode: '1512', description: 'Sunflower & Edible Oils', qtySold: 3200, taxableValue: 896000, gstCollected: 107520, rate: '12%' },
    { hsnCode: '0902', description: 'Tea & Coffee Blends', qtySold: 1200, taxableValue: 664000, gstCollected: 119520, rate: '18%' },
  ],
  ewayBillStatus: { generated: 142, pending: 4, expired: 1, missing: 4 },
  eInvoiceStatus: { irnGenerated: 198, pendingIrn: 3, rejected: 0, missingQr: 2 },
  rcmSummary: { purchases: 85000, gstPayable: 15300, pendingSelfInvoices: 2 },
  tdsTcsSummary: { tdsDeducted: 24500, tdsPayable: 0, tcsCollected: 12000, pendingFilings: 1 },
  topCustomersGst: [
    { name: 'Metro Retailers Pvt Ltd', taxableSales: 685000, gstAmount: 123300, invoiceCount: 42 },
    { name: 'Apex Traders & Distributors', taxableSales: 540000, gstAmount: 97200, invoiceCount: 32 },
    { name: 'Shree Balaji Enterprises', taxableSales: 420000, gstAmount: 75600, invoiceCount: 28 },
  ],
  topSuppliersGst: [
    { name: 'ITC Limited - Wholesale Div', purchaseVal: 620000, gstPaid: 111600, eligibleItc: 111600 },
    { name: 'Adani Wilmar Supplies Ltd', purchaseVal: 480000, gstPaid: 57600, eligibleItc: 57600 },
    { name: 'Hindustan Unilever Distributor', purchaseVal: 410000, gstPaid: 73800, eligibleItc: 73800 },
  ],
  complianceAlerts: [
    { id: 1, text: 'GSTR-1 due in 17 days for July 2026.', type: 'info' },
    { id: 2, text: '6 sales invoices missing customer GSTIN numbers.', type: 'alert' },
    { id: 3, text: '8 products missing mandatory 4-digit HSN codes.', type: 'alert' },
    { id: 4, text: 'ITC mismatch of ₹28,000 detected between GSTR-2B and Books.', type: 'warning' },
    { id: 5, text: '4 dispatches over ₹50k missing generated E-Way Bills.', type: 'warning' },
  ],
  timeline: [
    { id: 1, type: 'filed', title: 'GSTR-3B for June 2026 successfully filed', time: '5 days ago', ref: 'ARN-270626-88', user: 'Tax Consultant' },
    { id: 2, type: 'reconciliation', title: 'Completed GSTR-2B vs Books Purchase Reconciliation', time: '1 week ago', ref: 'REC-2026-07', user: 'Accountant' },
    { id: 3, type: 'einvoice', title: 'IRN Generated for Invoice INV-2026-089 (Metro Retailers)', time: '3 hours ago', ref: 'IRN-98442', user: 'Sales Manager' },
    { id: 4, type: 'itc', title: 'Eligible Input Tax Credit updated (+₹3.95L)', time: '2 days ago', ref: 'ITC-2026-07', user: 'System' },
  ],
  insights: [
    { id: 1, text: 'Net GST liability for July is ₹1,45,000. Settle before 20th Aug to avoid interest.', type: 'info' },
    { id: 2, text: 'Eligible ITC utilization is at 90%. ₹40,000 additional ITC remaining in ledger.', type: 'info' },
    { id: 3, text: 'Sales under HSN 1001 (Wheat) account for 48% of total taxable revenue.', type: 'info' },
    { id: 4, text: 'Your Statutory Compliance Score improved from 86% to 92% this month.', type: 'info' },
  ],
};

export default function GSTDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [gstPeriod, setGstPeriod] = useState<'Current Month' | 'Previous Month' | 'Quarter' | 'Financial Year'>('Current Month');
  const [trendTimeframe, setTrendTimeframe] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState('JSON');

  // Filters State
  const [filters, setFilters] = useState({
    financialYear: 'FY 2026-27',
    warehouse: 'All Warehouses',
    gstType: 'All GST Types',
    invoiceType: 'All Invoices',
    filingStatus: 'All Statuses',
  });

  // Query Supabase with Fallback
  const { data: gstData, refetch } = useQuery({
    queryKey: ['gstDashboardData', activeBusiness?.id, filters, gstPeriod],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: dbInvoices } = await supabase
            .from('tax_invoices')
            .select('*')
            .eq('business_id', activeBusiness.id);

          if (dbInvoices && dbInvoices.length > 0) {
            const totalTax = dbInvoices.reduce((acc, inv) => acc + (inv.total_tax || 0), 0);
            return {
              ...MOCK_GST_DATA,
              kpis: {
                ...MOCK_GST_DATA.kpis,
                outputGstTotal: totalTax || MOCK_GST_DATA.kpis.outputGstTotal,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Using offline mock GST compliance data:', err);
      }
      return MOCK_GST_DATA;
    },
    initialData: MOCK_GST_DATA,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.warehouse !== 'All Warehouses') count++;
    if (filters.gstType !== 'All GST Types') count++;
    if (filters.invoiceType !== 'All Invoices') count++;
    if (filters.filingStatus !== 'All Statuses') count++;
    return count;
  }, [filters]);

  const currentSeries = gstData.trendSeries[trendTimeframe] || gstData.trendSeries.Monthly;

  // Empty State Preview Render
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              GST Dashboard & Compliance Hub
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {gstData.kpis.gstin} • {dayjs().format('dddd, MMMM D, YYYY')}
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
            <Gavel size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No GST Compliance Transactions Recorded
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Generate B2B tax invoices, log purchase bills, and perform GSTR-2B ITC reconciliation to activate real-time statutory GST compliance reporting.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => navigate('/sales/invoices')}
              sx={{ bgcolor: COLORS.blue, px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Create Tax Invoice
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
            GST Dashboard & Compliance Center
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            GSTIN: <strong>{gstData.kpis.gstin}</strong> • {gstData.kpis.financialYear} • {dayjs().format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Period Selector */}
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={gstPeriod}
              onChange={(e) => setGstPeriod(e.target.value as any)}
              sx={{ borderRadius: 3, fontSize: '0.85rem', fontWeight: 700, bgcolor: isDark ? '#1E293B' : 'white' }}
            >
              <MenuItem value="Current Month">Current Month</MenuItem>
              <MenuItem value="Previous Month">Previous Month</MenuItem>
              <MenuItem value="Quarter">Quarter (Q2)</MenuItem>
              <MenuItem value="Financial Year">FY 2026-27</MenuItem>
            </Select>
          </FormControl>

          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<Download size={18} />}
            onClick={() => setExportDialogOpen(true)}
            sx={{ bgcolor: COLORS.blue, borderRadius: 3, textTransform: 'none', fontWeight: 700, height: 40 }}
          >
            Export GSTR Reports
          </Button>

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
          <Tooltip title="Recalculate GST Obligations">
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

      {/* 2. GST KPI CARDS (6 Rich Cards) */}
      <Grid container spacing={2.5} mb={3.5}>
        {/* Output GST */}
        <Grid item xs={12} sm={6} md={2}>
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
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Output GST
              </Typography>
              <Typography variant="h6" fontWeight={800} color={COLORS.blue} mt={0.5}>
                {formatCurrency(gstData.kpis.outputGstTotal)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                CGST: {formatCurrency(gstData.kpis.cgstOutput)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                SGST: {formatCurrency(gstData.kpis.sgstOutput)}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Input GST / Eligible ITC */}
        <Grid item xs={12} sm={6} md={2}>
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
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Eligible ITC
              </Typography>
              <Typography variant="h6" fontWeight={800} color={COLORS.purple} mt={0.5}>
                {formatCurrency(gstData.kpis.eligibleItcTotal)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                Claimed: {formatCurrency(gstData.kpis.claimedItc)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Pending: {formatCurrency(gstData.kpis.pendingItc)}
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Net GST Liability */}
        <Grid item xs={12} sm={6} md={2.4}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.red, 0.3)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.red, 0.04)})`,
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Net GST Payable
              </Typography>
              <Typography variant="h5" fontWeight={800} color={COLORS.red} mt={0.5}>
                {formatCurrency(gstData.kpis.netGstPayable)}
              </Typography>
              <Chip size="small" label="Output − Eligible ITC" sx={{ mt: 1, bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 700, fontSize: '0.65rem' }} />
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Taxable Sales */}
        <Grid item xs={12} sm={6} md={2}>
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
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Taxable Sales
              </Typography>
              <Typography variant="h6" fontWeight={800} color="text.primary" mt={0.5}>
                {formatCurrency(gstData.kpis.taxableSalesTotal)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                {gstData.kpis.salesInvoiceCount} Invoices
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Taxable Purchases */}
        <Grid item xs={12} sm={6} md={2}>
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
              <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Taxable Purchases
              </Typography>
              <Typography variant="h6" fontWeight={800} color="text.primary" mt={0.5}>
                {formatCurrency(gstData.kpis.taxablePurchasesTotal)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                {gstData.kpis.supplierCount} Suppliers
              </Typography>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Compliance Score */}
        <Grid item xs={12} sm={6} md={1.6}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.green, 0.3)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
              textAlign: 'center',
            }}
          >
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                Compliance
              </Typography>
              <Typography variant="h4" fontWeight={800} color={COLORS.green} mt={0.5}>
                {gstData.kpis.complianceScore}%
              </Typography>
              <LinearProgress variant="determinate" value={gstData.kpis.complianceScore} sx={{ height: 4, borderRadius: 2, mt: 1, bgcolor: alpha(COLORS.green, 0.15), '& .MuiLinearProgress-bar': { bgcolor: COLORS.green } }} />
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 3. FILING STATUS CARDS SECTION */}
      <Typography variant="h6" fontWeight={800} mb={2}>
        Statutory GST Return Filing Readiness
      </Typography>
      <Grid container spacing={2.5} mb={3.5}>
        {gstData.filingStatus.map((ret, idx) => (
          <Grid item xs={12} sm={6} md={4} key={idx}>
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="h6" fontWeight={800} color={COLORS.blue}>{ret.returnType}</Typography>
                <Chip
                  label={ret.status}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.7rem',
                    bgcolor: ret.status === 'Filed' ? alpha(COLORS.green, 0.15) : alpha(COLORS.orange, 0.15),
                    color: ret.status === 'Filed' ? COLORS.green : COLORS.orange,
                  }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {ret.description}
              </Typography>

              <Divider sx={{ my: 1.5 }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Due Date: <strong>{ret.dueDate}</strong></Typography>
                  {ret.daysLeft && <Typography variant="caption" color={COLORS.red} fontWeight={700}>{ret.daysLeft} Days Remaining</Typography>}
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => setExportDialogOpen(true)}
                  sx={{ bgcolor: COLORS.blue, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                >
                  Export & File
                </Button>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* 4. GST LIABILITY & ADJUSTMENT SUMMARY TABLE */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={800} mb={2}>
          Statutory Tax Liability & Settlement Matrix
        </Typography>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Tax Head Type</TableCell>
                <TableCell align="right">Output GST Collected</TableCell>
                <TableCell align="right">Input ITC Available</TableCell>
                <TableCell align="right">Adjustments</TableCell>
                <TableCell align="right">Net GST Payable</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gstData.liabilitySummaryTable.map((row, idx) => (
                <TableRow key={idx} hover>
                  <TableCell sx={{ fontWeight: 800, color: COLORS.blue }}>{row.taxType}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(row.output)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: COLORS.purple }}>{formatCurrency(row.input)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 500 }}>{formatCurrency(row.adjustment)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800, color: row.net > 0 ? COLORS.red : COLORS.green }}>{formatCurrency(row.net)}</TableCell>
                </TableRow>
              ))}
              <TableRow sx={{ bgcolor: isDark ? '#0F172A' : COLORS.bgLight }}>
                <TableCell sx={{ fontWeight: 800 }}>Grand Total Net Payable</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>{formatCurrency(gstData.kpis.outputGstTotal)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.purple }}>{formatCurrency(gstData.kpis.eligibleItcTotal)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800 }}>₹0</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.red, fontSize: '1rem' }}>{formatCurrency(gstData.kpis.netGstPayable)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 5. GST TREND ANALYTICS CHARTS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Output vs Input vs Net GST LineChart */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Monthly GST Liability & ITC Trend
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Compare Output GST collected vs Eligible ITC claimed
                </Typography>
              </Box>

              <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                {(['Monthly', 'Quarterly', 'Yearly'] as const).map((tf) => (
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
              <LineChart data={currentSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} tickFormatter={(val) => `₹${val / 100000}L`} />
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Line type="monotone" name="Output GST" dataKey="output" stroke={COLORS.blue} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Eligible ITC" dataKey="input" stroke={COLORS.purple} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Net Payable" dataKey="net" stroke={COLORS.red} strokeWidth={3} strokeDasharray="5 5" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Taxable Sales BarChart */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>
              Taxable Sales Revenue
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={3}>
              Monthly B2B & B2C sales turnover subject to GST
            </Typography>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={currentSeries} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} tickFormatter={(v) => `₹${v / 100000}L`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="sales" name="Taxable Sales" fill={COLORS.teal} radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 6. GST RECONCILIATION STATUS & HSN SUMMARY */}
      <Grid container spacing={3} mb={3.5}>
        {/* Reconciliation Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>GSTR-2B vs Books Reconciliation</Typography>
              <Chip label="96% Matched" color="success" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.green, 0.08)} border={`1px solid ${alpha(COLORS.green, 0.2)}`}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>Sales Matched</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.green}>{gstData.reconciliation.salesMatched} Invoices</Typography>
                  <Typography variant="caption" color="text.secondary">Pending: {gstData.reconciliation.salesPending}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.purple, 0.08)} border={`1px solid ${alpha(COLORS.purple, 0.2)}`}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>ITC Matched (GSTR-2B)</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.purple}>{gstData.reconciliation.purchasesMatched} Bills</Typography>
                  <Typography variant="caption" color={COLORS.red} fontWeight={700}>Mismatch: ₹28k</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.blue, 0.08)} border={`1px solid ${alpha(COLORS.blue, 0.2)}`}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>GSTIN Validity</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.blue}>{gstData.reconciliation.validGstin} Valid</Typography>
                  <Typography variant="caption" color={COLORS.red} fontWeight={700}>6 Missing GSTIN</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.orange, 0.08)} border={`1px solid ${alpha(COLORS.orange, 0.2)}`}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>HSN Code Readiness</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.orange}>{gstData.reconciliation.hsnReadinessPct}% Ready</Typography>
                  <Typography variant="caption" color={COLORS.red} fontWeight={700}>8 Items Missing HSN</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* HSN Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>HSN Code Sales Summary</Typography>
              <Button size="small" onClick={() => navigate('/reports/gst')} sx={{ textTransform: 'none', fontWeight: 700 }}>
                View Full HSN Report
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary' } }}>
                    <TableCell>HSN</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Taxable Val</TableCell>
                    <TableCell align="right">GST Tax</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gstData.hsnSummary.map((hsn, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell sx={{ fontWeight: 800, color: COLORS.blue }}>{hsn.hsnCode}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem' }}>{hsn.description}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(hsn.taxableValue)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.red }}>{formatCurrency(hsn.gstCollected)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 7. PENDING COMPLIANCE ALERTS & E-WAY / E-INVOICE STATUS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Compliance Alerts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <ShieldAlert size={22} color={COLORS.red} />
              <Typography variant="h6" fontWeight={800}>Pending Statutory Compliance Alerts</Typography>
            </Box>
            <Stack spacing={1.5}>
              {gstData.complianceAlerts.map((ca) => (
                <Box key={ca.id} p={1.5} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Typography variant="body2" fontWeight={600} color={ca.type === 'alert' ? COLORS.red : COLORS.textPrimary}>
                    {ca.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* E-Way & E-Invoice Tracker */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>E-Way Bill & E-Invoice IRN Tracker</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.blue, 0.08)}>
                  <Typography variant="caption" color="text.secondary">E-Way Bills Generated</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.blue}>{gstData.ewayBillStatus.generated}</Typography>
                  <Typography variant="caption" color={COLORS.orange} fontWeight={700}>4 Pending Generation</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.purple, 0.08)}>
                  <Typography variant="caption" color="text.secondary">E-Invoices (IRN Generated)</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.purple}>{gstData.eInvoiceStatus.irnGenerated}</Typography>
                  <Typography variant="caption" color={COLORS.orange} fontWeight={700}>3 Pending IRN</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.teal, 0.08)}>
                  <Typography variant="caption" color="text.secondary">RCM GST Payable</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.teal}>{formatCurrency(gstData.rcmSummary.gstPayable)}</Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box p={2} borderRadius={3} bgcolor={alpha(COLORS.green, 0.08)}>
                  <Typography variant="caption" color="text.secondary">TDS Deducted</Typography>
                  <Typography variant="h6" fontWeight={800} color={COLORS.green}>{formatCurrency(gstData.tdsTcsSummary.tdsDeducted)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* 8. RECENT GST ACTIVITY LOG & SMART INSIGHTS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Statutory GST Activity Log</Typography>
            </Box>
            <Stack spacing={2.5}>
              {gstData.timeline.map((item) => (
                <Box key={item.id} display="flex" gap={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor:
                        item.type === 'filed' ? alpha(COLORS.green, 0.12) :
                        item.type === 'reconciliation' ? alpha(COLORS.purple, 0.12) :
                        item.type === 'einvoice' ? alpha(COLORS.blue, 0.12) :
                        alpha(COLORS.teal, 0.12),
                      color:
                        item.type === 'filed' ? COLORS.green :
                        item.type === 'reconciliation' ? COLORS.purple :
                        item.type === 'einvoice' ? COLORS.blue :
                        COLORS.teal,
                    }}
                  >
                    {item.type === 'filed' ? <FileCheck size={18} /> :
                     item.type === 'reconciliation' ? <Scale size={18} /> :
                     item.type === 'einvoice' ? <Receipt size={18} /> :
                     <Layers size={18} />}
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
              Smart Compliance Insights
            </Typography>
            <Stack spacing={2}>
              {gstData.insights.map((ins) => (
                <Box key={ins.id} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Lightbulb size={18} color={COLORS.blue} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                      Tax Analytics
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

      {/* 9. MATERIAL 3 FILTER DRAWER / BOTTOM SHEET */}
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
            GST Compliance Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <X size={20} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Financial Year</InputLabel>
            <Select value={filters.financialYear} label="Financial Year" onChange={(e) => setFilters({ ...filters, financialYear: e.target.value })}>
              <MenuItem value="FY 2026-27">FY 2026-27</MenuItem>
              <MenuItem value="FY 2025-26">FY 2025-26</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>GST Rate Type</InputLabel>
            <Select value={filters.gstType} label="GST Rate Type" onChange={(e) => setFilters({ ...filters, gstType: e.target.value })}>
              <MenuItem value="All GST Types">All GST Rates</MenuItem>
              <MenuItem value="18%">18% Tax Rate</MenuItem>
              <MenuItem value="12%">12% Tax Rate</MenuItem>
              <MenuItem value="5%">5% Tax Rate</MenuItem>
              <MenuItem value="0%">Exempt (0%)</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Invoice Type</InputLabel>
            <Select value={filters.invoiceType} label="Invoice Type" onChange={(e) => setFilters({ ...filters, invoiceType: e.target.value })}>
              <MenuItem value="All Invoices">All Invoice Types</MenuItem>
              <MenuItem value="B2B">B2B Registered</MenuItem>
              <MenuItem value="B2C">B2C Retail</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setFilters({
              financialYear: 'FY 2026-27',
              warehouse: 'All Warehouses',
              gstType: 'All GST Types',
              invoiceType: 'All Invoices',
              filingStatus: 'All Statuses',
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

      {/* 10. EXPORT REPORT DIALOG */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Export Statutory GST Returns</DialogTitle>
        <DialogContent dividers>
          <Stack spacing= {2} py={1}>
            <Typography variant="body2" color="text.secondary">
              Select export file format for GST portal filing:
            </Typography>
            <FormControl fullWidth size="small">
              <InputLabel>Format</InputLabel>
              <Select value={selectedExportFormat} label="Format" onChange={(e) => setSelectedExportFormat(e.target.value)}>
                <MenuItem value="JSON">Government Portal JSON Format</MenuItem>
                <MenuItem value="Excel">Detailed Excel Workbook (.xlsx)</MenuItem>
                <MenuItem value="PDF">Statutory PDF Summary Report</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setExportDialogOpen(false)}
            sx={{ bgcolor: COLORS.blue, textTransform: 'none', fontWeight: 700 }}
          >
            Generate & Download
          </Button>
        </DialogActions>
      </Dialog>

      {/* 11. EXPANDABLE SPEED DIAL FAB */}
      <SpeedDial
        ariaLabel="GST Operations Quick Actions"
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
          icon={<Receipt size={18} />}
          tooltipTitle="Record Sales Invoice"
          onClick={() => navigate('/sales/invoices')}
        />
        <SpeedDialAction
          icon={<BookOpen size={18} />}
          tooltipTitle="Record Purchase Invoice"
          onClick={() => navigate('/purchases/invoices')}
        />
        <SpeedDialAction
          icon={<Scale size={18} />}
          tooltipTitle="GSTR-2B Reconciliation"
          onClick={() => navigate('/reports/gst')}
        />
        <SpeedDialAction
          icon={<Download size={18} />}
          tooltipTitle="Export GSTR-1 / 3B"
          onClick={() => setExportDialogOpen(true)}
        />
      </SpeedDial>
    </Box>
  );
}
