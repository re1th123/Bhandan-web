import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, IconButton, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress,
  Stack, Divider, useTheme, alpha, Paper, Tooltip, InputBase, Drawer,
  FormControl, InputLabel, Select, MenuItem, SpeedDial, SpeedDialIcon, SpeedDialAction,
  Badge, Dialog, DialogTitle, DialogContent, DialogActions, Switch, FormControlLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search, Bell, TrendingUp, TrendingDown, Plus, Filter, RefreshCw, X,
  AlertTriangle, Clock, Download, CheckCircle2, AlertCircle, BarChart2,
  Layers, Lightbulb, Receipt, Landmark, FileText, CreditCard, Percent,
  Users, Building2, Wallet, CircleDollarSign, Banknote, Scale, BookOpen,
  ChevronRight, Printer, Share2, Star, Eye, ArrowRightLeft, Package,
  TrendingDown as TDown, PieChart as PieIcon,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

// ── Formatters ──────────────────────────────────────────────────────────────
const fc = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};

// ── Color palette ────────────────────────────────────────────────────────────
const C = {
  blue: '#1565C0', blueL: '#E3F2FD',
  green: '#2E7D32', greenL: '#E8F5E9',
  orange: '#E65100', orangeL: '#FFF3E0',
  red: '#C62828', redL: '#FFEBEE',
  purple: '#6A1B9A', purpleL: '#F3E5F5',
  teal: '#00695C', tealL: '#E0F2F1',
  amber: '#F57F17', amberL: '#FFFDE7',
  gray: '#546E7A',
  bg: '#F8FAFC',
};

const MC = motion.create(Card);
const MP = motion.create(Paper);

// ── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK = {
  meta: { businessName: 'Bandhan Wholesale Pvt Ltd', fy: 'FY 2026-27', lastUpdated: '25 Jul 2026, 8:30 PM' },
  healthScore: 88,
  kpis: {
    grossRevenue: 3850000, netRevenue: 3620000, revenueGrowth: 14.2,
    totalExpenses: 2770000, opExpenses: 2340000, nonOpExpenses: 430000, expGrowth: 8.6,
    netProfit: 840000, grossProfit: 1480000, netMargin: 21.8, gpMargin: 38.4,
    cashInHand: 185000, bankBalance: 1240000, totalCash: 1425000,
    arOutstanding: 1420000, arOverdue: 480000, arCustomerCount: 32,
    apOutstanding: 980000, apUpcoming: 345000, apOverdue: 125000,
    inventoryValue: 2840000, inventoryCost: 2450000, slowMoving: 320000,
    currentAssets: 4850000, currentLiabilities: 2640000, workingCapital: 2210000,
  },
  plSnapshot: {
    revenue: 3850000, cogs: 2370000, grossProfit: 1480000,
    opExpenses: 640000, netProfit: 840000, netMargin: 21.8,
  },
  bsSnapshot: {
    currentAssets: 4850000, fixedAssets: 2200000,
    currentLiabilities: 2640000, ltLiabilities: 800000, equity: 3610000,
  },
  cashFlowSummary: {
    inflows: 3715000, outflows: 2895000, net: 820000,
    opening: 605000, closing: 1425000,
    operating: 920000, investing: -180000, financing: 80000,
  },
  trialBalance: { status: 'Balanced', totalDebit: 12450000, totalCredit: 12450000, diff: 0 },

  revExpSeries: {
    Monthly: [
      { m: 'Feb', rev: 3100000, exp: 2380000, profit: 720000 },
      { m: 'Mar', rev: 3450000, exp: 2580000, profit: 870000 },
      { m: 'Apr', rev: 3200000, exp: 2440000, profit: 760000 },
      { m: 'May', rev: 3550000, exp: 2640000, profit: 910000 },
      { m: 'Jun', rev: 3330000, exp: 2540000, profit: 790000 },
      { m: 'Jul', rev: 3850000, exp: 2770000, profit: 1080000 },
    ],
    Quarterly: [
      { m: 'Q1', rev: 9750000, exp: 7400000, profit: 2350000 },
      { m: 'Q2', rev: 10130000, exp: 7620000, profit: 2510000 },
      { m: 'Q3', rev: 11080000, exp: 8280000, profit: 2800000 },
      { m: 'Q4', rev: 7000000, exp: 5390000, profit: 1610000 },
    ],
    Yearly: [
      { m: 'FY24', rev: 32000000, exp: 25600000, profit: 6400000 },
      { m: 'FY25', rev: 38500000, exp: 29800000, profit: 8700000 },
      { m: 'FY26 (Est)', rev: 43000000, exp: 33000000, profit: 10000000 },
    ],
  },
  cashflowSeries: [
    { m: 'Feb', inflow: 2950000, outflow: 2380000, net: 570000 },
    { m: 'Mar', inflow: 3300000, outflow: 2580000, net: 720000 },
    { m: 'Apr', inflow: 3100000, outflow: 2440000, net: 660000 },
    { m: 'May', inflow: 3400000, outflow: 2640000, net: 760000 },
    { m: 'Jun', inflow: 3200000, outflow: 2540000, net: 660000 },
    { m: 'Jul', inflow: 3715000, outflow: 2895000, net: 820000 },
  ],
  expBreakdown: [
    { name: 'Salary & Wages', value: 940000, color: C.blue },
    { name: 'Purchases / COGS', value: 2370000, color: C.orange },
    { name: 'Transport & Logistics', value: 185000, color: C.teal },
    { name: 'Rent & Premises', value: 96000, color: C.purple },
    { name: 'Utilities', value: 42000, color: C.amber },
    { name: 'Office & Admin', value: 68000, color: C.gray },
    { name: 'Maintenance', value: 35000, color: C.red },
    { name: 'Miscellaneous', value: 34000, color: C.green },
  ],
  revByCustomer: [
    { name: 'Metro Retailers', rev: 685000 },
    { name: 'Apex Traders', rev: 540000 },
    { name: 'Shree Balaji', rev: 420000 },
    { name: 'Royal Supermarket', rev: 390000 },
    { name: 'Kishan Stores', rev: 310000 },
    { name: 'Others', rev: 1505000 },
  ],
  arAging: [
    { bucket: '0–30 Days', amount: 680000, customers: 18, rate: 94 },
    { bucket: '31–60 Days', amount: 340000, customers: 9, rate: 72 },
    { bucket: '61–90 Days', amount: 220000, customers: 4, rate: 48 },
    { bucket: '90+ Days', amount: 180000, customers: 1, rate: 21 },
  ],
  apAging: [
    { bucket: '0–30 Days', amount: 540000, suppliers: 10 },
    { bucket: '31–60 Days', amount: 285000, suppliers: 5 },
    { bucket: '61–90 Days', amount: 120000, suppliers: 2 },
    { bucket: '90+ Days', amount: 35000, suppliers: 1 },
  ],
  topCustomers: [
    { name: 'Metro Retailers Pvt Ltd', revenue: 685000, outstanding: 120000, avgDays: 7, growth: 18 },
    { name: 'Apex Traders & Distributors', revenue: 540000, outstanding: 195000, avgDays: 13, growth: 12 },
    { name: 'Shree Balaji Enterprises', revenue: 420000, outstanding: 250000, avgDays: 21, growth: -4 },
    { name: 'Royal Supermarket Chain', revenue: 390000, outstanding: 45000, avgDays: 5, growth: 22 },
  ],
  topSuppliers: [
    { name: 'ITC Limited – Wholesale', purchases: 620000, outstanding: 85000, performance: 'Excellent' },
    { name: 'Adani Wilmar Supplies', purchases: 480000, outstanding: 120000, performance: 'Good' },
    { name: 'HUL Distributor', purchases: 410000, outstanding: 60000, performance: 'Good' },
    { name: 'Britannia Industries', purchases: 285000, outstanding: 45000, performance: 'Average' },
  ],
  loanSummary: { given: 1850000, taken: 680000, outstandingPrincipal: 1630000, intReceivable: 68500, intPayable: 24200 },
  taxSummary: { gstPayable: 145000, itcAvailable: 395000, tdsDeducted: 24500, tcsPending: 12000, pendingFilings: 2 },
  bankSummary: [
    { bank: 'SBI Current A/C — ****4421', balance: 840000, recentDeposit: 185000, recentWithdrawal: 95000, pending: 0 },
    { bank: 'HDFC OD A/C — ****8872', balance: 400000, recentDeposit: 50000, recentWithdrawal: 120000, pending: 2 },
  ],
  cashBook: { opening: 85000, received: 340000, paid: 240000, closing: 185000 },
  recentReports: [
    { name: 'P&L Statement – June 2026', date: '2026-07-10', user: 'Admin', fav: true },
    { name: 'Balance Sheet – Q1 FY27', date: '2026-07-14', user: 'Accountant', fav: false },
    { name: 'GST Dashboard – July 2026', date: '2026-07-20', user: 'Tax Consultant', fav: true },
    { name: 'AR Aging Report – July 2026', date: '2026-07-22', user: 'Admin', fav: false },
  ],
  insights: [
    { text: 'Revenue grew by 14.2% this month vs previous period. Strong upward momentum.', type: 'positive' },
    { text: 'Net profit margin improved to 21.8% — highest in last 6 months.', type: 'positive' },
    { text: '₹1,80,000 in customer receivables are overdue by more than 90 days — escalate collection.', type: 'alert' },
    { text: 'Salary & wages account for 34% of total operating expenses.', type: 'neutral' },
    { text: 'Cash flow is positive for the fourth consecutive month (Net +₹8.2L).', type: 'positive' },
    { text: 'GSTR-1 filing due in 17 days. Ensure all invoices have GSTIN.', type: 'alert' },
  ],
  reportLibrary: [
    {
      category: 'Financial Statements', color: C.blue, icon: <Scale size={18} />,
      reports: [
        { name: 'Trial Balance', desc: 'Debit & credit verification', path: '/reports/trial-balance', last: '25 Jul' },
        { name: 'Profit & Loss', desc: 'Revenue, expense & profit', path: '/reports/profit-loss', last: '25 Jul' },
        { name: 'Balance Sheet', desc: 'Assets, liabilities & equity', path: '/reports/balance-sheet', last: '24 Jul' },
        { name: 'Cash Flow Statement', desc: 'Operating/investing/financing', path: '/finance/banks', last: '20 Jul' },
      ],
    },
    {
      category: 'Sales & Revenue', color: C.green, icon: <TrendingUp size={18} />,
      reports: [
        { name: 'Sales Report', desc: 'Revenue by product & customer', path: '/sales/dashboard', last: '25 Jul' },
        { name: 'Customer Sales Analysis', desc: 'Top customers by revenue', path: '/sales/customers-dashboard', last: '24 Jul' },
        { name: 'Revenue Report', desc: 'Period-wise revenue trend', path: '/sales/dashboard', last: '22 Jul' },
      ],
    },
    {
      category: 'Purchase & Payables', color: C.orange, icon: <Package size={18} />,
      reports: [
        { name: 'Purchase Report', desc: 'Purchase trend & vendor analysis', path: '/purchases/dashboard', last: '25 Jul' },
        { name: 'Supplier Analysis', desc: 'Top suppliers & payables', path: '/purchases/suppliers-dashboard', last: '23 Jul' },
      ],
    },
    {
      category: 'GST & Tax Compliance', color: C.amber, icon: <Receipt size={18} />,
      reports: [
        { name: 'GST Dashboard', desc: 'Output, ITC & filing status', path: '/reports/gst-dashboard', last: '25 Jul' },
        { name: 'Output GST Register', desc: 'Sales tax collected', path: '/reports/gst', last: '25 Jul' },
        { name: 'GSTR-1 Export', desc: 'Outward supplies return', path: '/reports/gst-dashboard', last: '20 Jul' },
        { name: 'HSN Summary', desc: 'HSN-wise sales summary', path: '/reports/gst', last: '20 Jul' },
      ],
    },
    {
      category: 'Inventory Reports', color: C.teal, icon: <Layers size={18} />,
      reports: [
        { name: 'Inventory Valuation', desc: 'Stock value & cost', path: '/inventory/dashboard', last: '25 Jul' },
        { name: 'Low Stock Report', desc: 'Items below reorder level', path: '/inventory/dashboard', last: '24 Jul' },
        { name: 'Stock Movement', desc: 'Inward & outward movement', path: '/inventory/stock-ledger', last: '22 Jul' },
      ],
    },
    {
      category: 'Loan Reports', color: C.purple, icon: <Landmark size={18} />,
      reports: [
        { name: 'Loan Register', desc: 'All active loans', path: '/finance/loans-dashboard', last: '25 Jul' },
        { name: 'Interest Report', desc: 'Interest earned & paid', path: '/finance/loans-dashboard', last: '20 Jul' },
        { name: 'Repayment Report', desc: 'Repayment schedule & status', path: '/finance/loans-dashboard', last: '20 Jul' },
      ],
    },
    {
      category: 'Employee Reports', color: C.gray, icon: <Users size={18} />,
      reports: [
        { name: 'Employee Dashboard', desc: 'Attendance & wage overview', path: '/employees/dashboard', last: '25 Jul' },
        { name: 'Wage Report', desc: 'Daily & monthly wage summary', path: '/employees/dashboard', last: '24 Jul' },
        { name: 'Attendance Report', desc: 'Attendance roster & analytics', path: '/employees/dashboard', last: '24 Jul' },
      ],
    },
    {
      category: 'Expense Reports', color: C.red, icon: <CreditCard size={18} />,
      reports: [
        { name: 'Expense by Category', desc: 'Category-wise expense analysis', path: '/finance/accounts', last: '25 Jul' },
        { name: 'Expense Trend', desc: 'Monthly expense trend', path: '/reports/profit-loss', last: '22 Jul' },
      ],
    },
  ],
};

export default function FinanceReportsDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  const [period, setPeriod] = useState<'This Month' | 'Quarter' | 'Financial Year'>('This Month');
  const [chartTf, setChartTf] = useState<'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [filterOpen, setFilterOpen] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  const [filters, setFilters] = useState({ fy: 'FY 2026-27', warehouse: 'All Warehouses', paymentMode: 'All Modes' });

  const { data: d, refetch } = useQuery({
    queryKey: ['financeReportsDashboard', activeBusiness?.id, period],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: inv } = await supabase.from('tax_invoices').select('*').eq('business_id', activeBusiness.id);
          if (inv && inv.length > 0) return MOCK;
        }
      } catch (e) { console.warn('Finance Reports fallback:', e); }
      return MOCK;
    },
    initialData: MOCK,
  });

  const handleRefresh = async () => { setRefreshing(true); await refetch(); setTimeout(() => setRefreshing(false), 600); };

  // ── EMPTY STATE ────────────────────────────────────────────────────────────
  if (emptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : C.bg, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Typography variant="h4" fontWeight={800}>Financial Reports Dashboard</Typography>
          <FormControlLabel control={<Switch checked={emptyState} onChange={(e) => setEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" fontWeight={700}>Empty Demo</Typography>} />
        </Box>
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${theme.palette.divider}`, bgcolor: isDark ? '#1E293B' : 'white', maxWidth: 560, mx: 'auto', mt: 6 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(C.blue, 0.1), color: C.blue, mx: 'auto', mb: 3 }}>
            <BarChart2 size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>No Financial Data Available</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 380, mx: 'auto' }}>
            Record sales invoices, purchase bills, and journal entries to activate real-time financial reports and business intelligence.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => navigate('/sales/invoices')}
              sx={{ bgcolor: C.blue, px: 3, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Create Invoice</Button>
            <Button variant="outlined" onClick={() => setEmptyState(false)} sx={{ px: 3, textTransform: 'none', borderRadius: 2 }}>Load Demo</Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  const currentSeries = d.revExpSeries[chartTf];

  // ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: isDark ? '#0F172A' : C.bg, minHeight: '100vh', pb: 14 }}>

      {/* ── TOP APP BAR ───────────────────────────────────────────────────── */}
      <Box display="flex" flexDirection={{ xs: 'column', lg: 'row' }} justifyContent="space-between" alignItems={{ lg: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" color="text.primary">
            Financial Reports Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {d.meta.businessName} • {d.meta.fy} • Last updated: {d.meta.lastUpdated}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Period Chips */}
          <Stack direction="row" spacing={0.5}>
            {(['This Month', 'Quarter', 'Financial Year'] as const).map((p) => (
              <Chip key={p} label={p} size="small" onClick={() => setPeriod(p)}
                sx={{ fontWeight: 700, fontSize: '0.72rem', cursor: 'pointer',
                  bgcolor: period === p ? C.blue : (isDark ? '#1E293B' : 'white'),
                  color: period === p ? 'white' : 'text.secondary',
                  border: `1px solid ${period === p ? C.blue : theme.palette.divider}` }} />
            ))}
          </Stack>

          {/* Search */}
          <Paper elevation={0} sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 220, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: isDark ? '#1E293B' : 'white' }}>
            <Search size={16} color={C.gray} /><InputBase sx={{ ml: 1, flex: 1, fontSize: '0.85rem' }} placeholder="Search reports…" />
          </Paper>

          <Button variant="contained" startIcon={<Download size={18} />} onClick={() => setExportOpen(true)}
            sx={{ bgcolor: C.blue, borderRadius: 3, textTransform: 'none', fontWeight: 700, height: 40 }}>Export</Button>

          <Button variant="outlined" onClick={() => setFilterOpen(true)} startIcon={<Filter size={18} />}
            sx={{ borderRadius: 3, borderColor: theme.palette.divider, color: 'text.primary', bgcolor: isDark ? '#1E293B' : 'white', textTransform: 'none', fontWeight: 600, height: 40 }}>Filters</Button>

          <Tooltip title="Refresh Metrics">
            <IconButton onClick={handleRefresh} sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
              <RefreshCw size={18} />
            </IconButton>
          </Tooltip>

          <IconButton sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
            <Badge badgeContent={3} color="error"><Bell size={18} /></Badge>
          </IconButton>

          <FormControlLabel control={<Switch size="small" checked={emptyState} onChange={(e) => setEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" color="text.secondary">Empty Demo</Typography>} />
        </Stack>
      </Box>

      {/* ── 8 KPI CARDS ─────────────────────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { title: 'Gross Revenue', color: C.green, icon: <TrendingUp size={20} />, main: fc(d.kpis.grossRevenue), chip: `+${d.kpis.revenueGrowth}% Growth`, sub: `Net: ${fc(d.kpis.netRevenue)}` },
          { title: 'Total Expenses', color: C.orange, icon: <TDown size={20} />, main: fc(d.kpis.totalExpenses), chip: `+${d.kpis.expGrowth}% Growth`, sub: `OpEx: ${fc(d.kpis.opExpenses)}` },
          { title: 'Net Profit', color: C.blue, icon: <BarChart2 size={20} />, main: fc(d.kpis.netProfit), chip: `${d.kpis.netMargin}% Margin`, sub: `Gross: ${fc(d.kpis.grossProfit)}` },
          { title: 'Cash Position', color: C.teal, icon: <Wallet size={20} />, main: fc(d.kpis.totalCash), chip: `Bank: ${fc(d.kpis.bankBalance)}`, sub: `Cash in Hand: ${fc(d.kpis.cashInHand)}` },
          { title: 'Accounts Receivable', color: C.amber, icon: <Users size={20} />, main: fc(d.kpis.arOutstanding), chip: `Overdue: ${fc(d.kpis.arOverdue)}`, sub: `${d.kpis.arCustomerCount} Customers Pending` },
          { title: 'Accounts Payable', color: C.red, icon: <Building2 size={20} />, main: fc(d.kpis.apOutstanding), chip: `Overdue: ${fc(d.kpis.apOverdue)}`, sub: `Upcoming: ${fc(d.kpis.apUpcoming)}` },
          { title: 'Inventory Value', color: C.purple, icon: <Package size={20} />, main: fc(d.kpis.inventoryValue), chip: `Slow Moving: ${fc(d.kpis.slowMoving)}`, sub: `Cost: ${fc(d.kpis.inventoryCost)}` },
          { title: 'Working Capital', color: C.gray, icon: <Scale size={20} />, main: fc(d.kpis.workingCapital), chip: d.kpis.workingCapital > 0 ? 'Healthy Liquidity ✓' : 'Low Liquidity ⚠', sub: `Assets − Liabilities` },
        ].map((k, i) => (
          <Grid item xs={12} sm={6} md={3} xl={1.5} key={i}>
            <MC whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
              sx={{ borderRadius: 4, border: `1px solid ${alpha(k.color, 0.25)}`, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.4} lineHeight={1.3}>{k.title}</Typography>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(k.color, 0.12), color: k.color }}>{k.icon}</Avatar>
                </Box>
                <Typography variant="h6" fontWeight={800} color={k.color}>{k.main}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>{k.sub}</Typography>
                <Chip size="small" label={k.chip} sx={{ mt: 1, height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(k.color, 0.1), color: k.color }} />
              </CardContent>
            </MC>
          </Grid>
        ))}
      </Grid>

      {/* ── FINANCIAL HEALTH SCORE + P&L SNAPSHOT + BALANCE SHEET ─────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Health Score */}
        <Grid item xs={12} md={3}>
          <MC whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
            sx={{ borderRadius: 4, height: '100%', border: `2px solid ${alpha(C.green, 0.4)}`, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 8px 32px rgba(46,125,50,0.08)' }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={800} mb={2}>Financial Health Score</Typography>
              <Box position="relative" display="inline-flex" mb={2}>
                <Box sx={{
                  width: 120, height: 120, borderRadius: '50%',
                  background: `conic-gradient(${C.green} ${d.healthScore * 3.6}deg, ${alpha(C.green, 0.12)} 0deg)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 32px ${alpha(C.green, 0.25)}`,
                }}>
                  <Box sx={{ width: 88, height: 88, borderRadius: '50%', bgcolor: isDark ? '#1E293B' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <Typography variant="h4" fontWeight={900} color={C.green}>{d.healthScore}</Typography>
                    <Typography variant="caption" color={C.green} fontWeight={700}>%</Typography>
                  </Box>
                </Box>
              </Box>
              <Chip label="Excellent ★" sx={{ bgcolor: alpha(C.green, 0.15), color: C.green, fontWeight: 800, mb: 2 }} />
              <Stack spacing={0.8}>
                {[
                  { label: 'Profitability', pct: 92 }, { label: 'Liquidity', pct: 88 },
                  { label: 'Cash Flow', pct: 85 }, { label: 'Debt Ratio', pct: 79 },
                ].map((m) => (
                  <Box key={m.label}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="caption" fontWeight={600}>{m.label}</Typography>
                      <Typography variant="caption" fontWeight={800}>{m.pct}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={m.pct}
                      sx={{ height: 4, borderRadius: 2, bgcolor: alpha(C.green, 0.12), '& .MuiLinearProgress-bar': { bgcolor: C.green } }} />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </MC>
        </Grid>

        {/* P&L Snapshot */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>P&L Snapshot</Typography>
              <Chip label={`Margin ${d.plSnapshot.netMargin}%`} size="small" sx={{ bgcolor: alpha(C.green, 0.12), color: C.green, fontWeight: 800 }} />
            </Box>
            {[
              { label: 'Gross Revenue', value: d.plSnapshot.revenue, color: C.green },
              { label: 'Cost of Goods Sold', value: -d.plSnapshot.cogs, color: C.red },
              { label: 'Gross Profit', value: d.plSnapshot.grossProfit, color: C.blue, bold: true },
              { label: 'Operating Expenses', value: -d.plSnapshot.opExpenses, color: C.orange },
              { label: 'Net Profit', value: d.plSnapshot.netProfit, color: C.green, bold: true, large: true },
            ].map((row, i) => (
              <Box key={i} display="flex" justifyContent="space-between" py={0.9}
                borderBottom={i < 4 ? `1px solid ${theme.palette.divider}` : 'none'}>
                <Typography variant="body2" fontWeight={row.bold ? 800 : 500}>{row.label}</Typography>
                <Typography variant={row.large ? 'subtitle1' : 'body2'} fontWeight={800} color={row.color}>
                  {row.value < 0 ? `(${fc(Math.abs(row.value))})` : fc(row.value)}
                </Typography>
              </Box>
            ))}
            <Button fullWidth variant="outlined" onClick={() => navigate('/reports/profit-loss')} size="small"
              endIcon={<ChevronRight size={16} />} sx={{ mt: 2, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
              View Full P&L Statement
            </Button>
          </Paper>
        </Grid>

        {/* Balance Sheet Snapshot */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>Balance Sheet Snapshot</Typography>
            <Box mb={1.5}>
              <Typography variant="caption" fontWeight={800} color={C.blue} textTransform="uppercase">Assets</Typography>
              <Box display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="body2">Current Assets</Typography>
                <Typography variant="body2" fontWeight={700}>{fc(d.bsSnapshot.currentAssets)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" py={0.5} borderBottom={`1px solid ${theme.palette.divider}`}>
                <Typography variant="body2">Fixed Assets</Typography>
                <Typography variant="body2" fontWeight={700}>{fc(d.bsSnapshot.fixedAssets)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="body2" fontWeight={800}>Total Assets</Typography>
                <Typography variant="body2" fontWeight={800} color={C.blue}>{fc(d.bsSnapshot.currentAssets + d.bsSnapshot.fixedAssets)}</Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box mb={1.5}>
              <Typography variant="caption" fontWeight={800} color={C.red} textTransform="uppercase">Liabilities & Equity</Typography>
              <Box display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="body2">Current Liabilities</Typography>
                <Typography variant="body2" fontWeight={700} color={C.red}>{fc(d.bsSnapshot.currentLiabilities)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="body2">LT Liabilities</Typography>
                <Typography variant="body2" fontWeight={700} color={C.red}>{fc(d.bsSnapshot.ltLiabilities)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="body2" fontWeight={800}>Owner Equity</Typography>
                <Typography variant="body2" fontWeight={800} color={C.green}>{fc(d.bsSnapshot.equity)}</Typography>
              </Box>
            </Box>
            <Button fullWidth variant="outlined" onClick={() => navigate('/reports/balance-sheet')} size="small"
              endIcon={<ChevronRight size={16} />} sx={{ mt: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
              View Full Balance Sheet
            </Button>
          </Paper>
        </Grid>

        {/* Cash Flow + Trial Balance */}
        <Grid item xs={12} md={3}>
          <Stack spacing={2.5} height="100%">
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flex: 1 }}>
              <Typography variant="h6" fontWeight={800} mb={2}>Cash Flow Summary</Typography>
              {[
                { label: 'Cash Inflows', value: d.cashFlowSummary.inflows, color: C.green },
                { label: 'Cash Outflows', value: d.cashFlowSummary.outflows, color: C.red },
                { label: 'Net Cash Flow', value: d.cashFlowSummary.net, color: C.blue, bold: true },
                { label: 'Opening Cash', value: d.cashFlowSummary.opening, color: C.gray },
                { label: 'Closing Cash', value: d.cashFlowSummary.closing, color: C.teal, bold: true },
              ].map((row, i) => (
                <Box key={i} display="flex" justifyContent="space-between" py={0.6} borderBottom={i < 4 ? `1px solid ${theme.palette.divider}` : 'none'}>
                  <Typography variant="caption" fontWeight={row.bold ? 800 : 500}>{row.label}</Typography>
                  <Typography variant="caption" fontWeight={800} color={row.color}>{fc(row.value)}</Typography>
                </Box>
              ))}
            </Paper>

            <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <Box display="flex" justifyContent="space-between" mb={1.5}>
                <Typography variant="subtitle2" fontWeight={800}>Trial Balance</Typography>
                <Chip size="small" label={d.trialBalance.status}
                  sx={{ bgcolor: alpha(C.green, 0.15), color: C.green, fontWeight: 800, fontSize: '0.7rem' }} />
              </Box>
              <Box display="flex" justifyContent="space-between" py={0.5}>
                <Typography variant="caption">Total Debit</Typography>
                <Typography variant="caption" fontWeight={700}>{fc(d.trialBalance.totalDebit)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" py={0.5} mb={1}>
                <Typography variant="caption">Total Credit</Typography>
                <Typography variant="caption" fontWeight={700}>{fc(d.trialBalance.totalCredit)}</Typography>
              </Box>
              <Button fullWidth variant="outlined" onClick={() => navigate('/reports/trial-balance')} size="small"
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.75rem' }}>
                Open Trial Balance
              </Button>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* ── REV vs EXP CHART + EXPENSE BREAKDOWN PIE ─────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Revenue vs Expenses Chart */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Revenue vs Expenses vs Profit Trend</Typography>
                <Typography variant="caption" color="text.secondary">Period-wise financial performance comparison</Typography>
              </Box>
              <Stack direction="row" bgcolor={isDark ? '#0F172A' : C.bg} p={0.5} borderRadius={2.5}>
                {(['Monthly', 'Quarterly', 'Yearly'] as const).map((tf) => (
                  <Button key={tf} size="small" onClick={() => setChartTf(tf)}
                    sx={{ px: 1.2, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
                      bgcolor: chartTf === tf ? (isDark ? '#334155' : 'white') : 'transparent',
                      color: chartTf === tf ? 'text.primary' : 'text.secondary' }}>
                    {tf}
                  </Button>
                ))}
              </Stack>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentSeries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: C.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.gray }} tickFormatter={(v) => `₹${v / 100000}L`} />
                <RTooltip formatter={(v: number) => fc(v)} />
                <Line type="monotone" name="Revenue" dataKey="rev" stroke={C.green} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Expenses" dataKey="exp" stroke={C.red} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Net Profit" dataKey="profit" stroke={C.blue} strokeWidth={3} strokeDasharray="5 3" dot={{ r: 4 }} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Expense Breakdown Pie */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>Expense Breakdown by Category</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Click any segment to drill down into transactions</Typography>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={6}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={d.expBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={88} dataKey="value" paddingAngle={2}>
                      {d.expBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <RTooltip formatter={(v: number) => fc(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  {d.expBreakdown.map((e, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <Box width={8} height={8} borderRadius="50%" bgcolor={e.color} flexShrink={0} />
                        <Typography variant="caption" fontWeight={600} noWrap>{e.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={800} color={e.color}>{fc(e.value)}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ── CASH FLOW AREA CHART + REVENUE BY CUSTOMER BAR ───────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>Monthly Cash Flow Trend</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Cash inflows vs outflows and net position</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={d.cashflowSeries} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="inG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="outG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.red} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.gray }} tickFormatter={(v) => `₹${v / 100000}L`} />
                <RTooltip formatter={(v: number) => fc(v)} />
                <Area type="monotone" name="Cash In" dataKey="inflow" stroke={C.green} strokeWidth={2} fill="url(#inG)" />
                <Area type="monotone" name="Cash Out" dataKey="outflow" stroke={C.red} strokeWidth={2} fill="url(#outG)" />
                <Line type="monotone" name="Net Cash" dataKey="net" stroke={C.blue} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>Revenue by Top Customers</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Customer-wise revenue contribution this period</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={d.revByCustomer} layout="vertical" margin={{ top: 5, right: 10, left: 50, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.gray }} tickFormatter={(v) => `₹${v / 100000}L`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.gray }} width={80} />
                <RTooltip formatter={(v: number) => fc(v)} />
                <Bar dataKey="rev" name="Revenue" fill={C.blue} radius={[0, 6, 6, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ── AR & AP AGING ─────────────────────────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>Accounts Receivable Aging</Typography>
              <Button size="small" onClick={() => navigate('/sales/customers-dashboard')} sx={{ textTransform: 'none', fontWeight: 700 }}>View AR Report</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' } }}>
                    <TableCell>Aging Bucket</TableCell><TableCell align="right">Outstanding</TableCell>
                    <TableCell align="center">Customers</TableCell><TableCell align="center">Collection Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.arAging.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{row.bucket}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: i >= 2 ? C.red : i === 1 ? C.amber : 'text.primary' }}>{fc(row.amount)}</TableCell>
                      <TableCell align="center"><Chip label={row.customers} size="small" sx={{ height: 20, fontWeight: 800 }} /></TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LinearProgress variant="determinate" value={row.rate}
                            sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: alpha(C.green, 0.12), '& .MuiLinearProgress-bar': { bgcolor: row.rate > 70 ? C.green : row.rate > 40 ? C.amber : C.red } }} />
                          <Typography variant="caption" fontWeight={700}>{row.rate}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>Accounts Payable Aging</Typography>
              <Button size="small" onClick={() => navigate('/purchases/suppliers-dashboard')} sx={{ textTransform: 'none', fontWeight: 700 }}>View AP Report</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' } }}>
                    <TableCell>Aging Bucket</TableCell><TableCell align="right">Outstanding</TableCell><TableCell align="center">Suppliers</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.apAging.map((row, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{row.bucket}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: i >= 2 ? C.red : i === 1 ? C.amber : 'text.primary' }}>{fc(row.amount)}</TableCell>
                      <TableCell align="center"><Chip label={row.suppliers} size="small" sx={{ height: 20, fontWeight: 800 }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ── SUPPLEMENTARY FINANCIAL SUMMARIES ────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Loan Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Landmark size={18} color={C.purple} />
              <Typography variant="subtitle1" fontWeight={800}>Loan Summary</Typography>
            </Box>
            {[
              { label: 'Loans Given', value: fc(d.loanSummary.given) },
              { label: 'Loans Taken', value: fc(d.loanSummary.taken) },
              { label: 'Outstanding Principal', value: fc(d.loanSummary.outstandingPrincipal) },
              { label: 'Interest Receivable', value: fc(d.loanSummary.intReceivable), color: C.green },
              { label: 'Interest Payable', value: fc(d.loanSummary.intPayable), color: C.red },
            ].map((r, i) => (
              <Box key={i} display="flex" justifyContent="space-between" py={0.6} borderBottom={i < 4 ? `1px solid ${theme.palette.divider}` : 'none'}>
                <Typography variant="caption">{r.label}</Typography>
                <Typography variant="caption" fontWeight={800} color={r.color || 'text.primary'}>{r.value}</Typography>
              </Box>
            ))}
            <Button fullWidth size="small" variant="outlined" onClick={() => navigate('/finance/loans-dashboard')}
              sx={{ mt: 1.5, textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem' }}>Loan Report</Button>
          </Paper>
        </Grid>

        {/* Tax Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Receipt size={18} color={C.amber} />
              <Typography variant="subtitle1" fontWeight={800}>GST & Tax Summary</Typography>
            </Box>
            {[
              { label: 'GST Payable (Net)', value: fc(d.taxSummary.gstPayable), color: C.red },
              { label: 'ITC Available', value: fc(d.taxSummary.itcAvailable), color: C.green },
              { label: 'TDS Deducted', value: fc(d.taxSummary.tdsDeducted) },
              { label: 'TCS Pending', value: fc(d.taxSummary.tcsPending) },
              { label: 'Pending Filings', value: `${d.taxSummary.pendingFilings} Returns`, color: C.amber },
            ].map((r, i) => (
              <Box key={i} display="flex" justifyContent="space-between" py={0.6} borderBottom={i < 4 ? `1px solid ${theme.palette.divider}` : 'none'}>
                <Typography variant="caption">{r.label}</Typography>
                <Typography variant="caption" fontWeight={800} color={r.color || 'text.primary'}>{r.value}</Typography>
              </Box>
            ))}
            <Button fullWidth size="small" variant="outlined" onClick={() => navigate('/reports/gst-dashboard')}
              sx={{ mt: 1.5, textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem' }}>GST Dashboard</Button>
          </Paper>
        </Grid>

        {/* Bank Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Building2 size={18} color={C.teal} />
              <Typography variant="subtitle1" fontWeight={800}>Bank Accounts</Typography>
            </Box>
            {d.bankSummary.map((b, i) => (
              <Box key={i} p={1.5} borderRadius={2} mb={1} bgcolor={isDark ? '#0F172A' : C.bg} border={`1px solid ${theme.palette.divider}`}>
                <Typography variant="caption" fontWeight={700} display="block">{b.bank}</Typography>
                <Box display="flex" justifyContent="space-between" mt={0.5}>
                  <Typography variant="caption" color="text.secondary">Balance</Typography>
                  <Typography variant="caption" fontWeight={800} color={C.teal}>{fc(b.balance)}</Typography>
                </Box>
                {b.pending > 0 && <Chip label={`${b.pending} Pending Recon`} size="small" sx={{ mt: 0.5, height: 18, fontSize: '0.6rem', bgcolor: alpha(C.amber, 0.15), color: C.amber, fontWeight: 700 }} />}
              </Box>
            ))}
            <Button fullWidth size="small" variant="outlined" onClick={() => navigate('/finance/banks')}
              sx={{ mt: 0.5, textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem' }}>Bank Book</Button>
          </Paper>
        </Grid>

        {/* Cash Book Summary */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Banknote size={18} color={C.green} />
              <Typography variant="subtitle1" fontWeight={800}>Cash Book</Typography>
            </Box>
            {[
              { label: 'Opening Balance', value: fc(d.cashBook.opening), color: C.gray },
              { label: 'Cash Received', value: `+${fc(d.cashBook.received)}`, color: C.green },
              { label: 'Cash Paid', value: `(${fc(d.cashBook.paid)})`, color: C.red },
              { label: 'Closing Balance', value: fc(d.cashBook.closing), color: C.teal, bold: true },
            ].map((r, i) => (
              <Box key={i} display="flex" justifyContent="space-between" py={0.8} borderBottom={i < 3 ? `1px solid ${theme.palette.divider}` : 'none'}>
                <Typography variant="caption" fontWeight={r.bold ? 800 : 500}>{r.label}</Typography>
                <Typography variant="caption" fontWeight={800} color={r.color}>{r.value}</Typography>
              </Box>
            ))}
            <Button fullWidth size="small" variant="outlined" onClick={() => navigate('/finance/journal')}
              sx={{ mt: 1.5, textTransform: 'none', borderRadius: 2, fontWeight: 700, fontSize: '0.72rem' }}>View Cash Book</Button>
          </Paper>
        </Grid>
      </Grid>

      {/* ── TOP CUSTOMERS + TOP SUPPLIERS ────────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={800}>Top Revenue Customers</Typography>
              <Button size="small" onClick={() => navigate('/sales/customers-dashboard')} sx={{ textTransform: 'none', fontWeight: 700 }}>View All</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' } }}>
                    <TableCell>Customer</TableCell><TableCell align="right">Revenue</TableCell>
                    <TableCell align="right">Outstanding</TableCell><TableCell align="center">Growth</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.topCustomers.map((c, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{c.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: C.green }}>{fc(c.revenue)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: C.red }}>{fc(c.outstanding)}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={`${c.growth > 0 ? '+' : ''}${c.growth}%`}
                          sx={{ height: 20, fontWeight: 800, fontSize: '0.65rem', bgcolor: alpha(c.growth > 0 ? C.green : C.red, 0.12), color: c.growth > 0 ? C.green : C.red }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6" fontWeight={800}>Top Suppliers by Purchase</Typography>
              <Button size="small" onClick={() => navigate('/purchases/suppliers-dashboard')} sx={{ textTransform: 'none', fontWeight: 700 }}>View All</Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' } }}>
                    <TableCell>Supplier</TableCell><TableCell align="right">Purchases</TableCell>
                    <TableCell align="right">Outstanding</TableCell><TableCell align="center">Performance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.topSuppliers.map((s, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{s.name}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: C.blue }}>{fc(s.purchases)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{fc(s.outstanding)}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={s.performance}
                          sx={{ height: 20, fontWeight: 800, fontSize: '0.65rem',
                            bgcolor: alpha(s.performance === 'Excellent' ? C.green : s.performance === 'Good' ? C.blue : C.amber, 0.12),
                            color: s.performance === 'Excellent' ? C.green : s.performance === 'Good' ? C.blue : C.amber }} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* ── REPORT LIBRARY GRID ───────────────────────────────────────────── */}
      <Typography variant="h6" fontWeight={800} mb={2}>📁 Report Library — Quick Access</Typography>
      <Grid container spacing={2.5} mb={3}>
        {d.reportLibrary.map((cat, ci) => (
          <Grid item xs={12} sm={6} lg={3} key={ci}>
            <Paper sx={{ p: 2.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${alpha(cat.color, 0.2)}` }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(cat.color, 0.12), color: cat.color }}>{cat.icon}</Avatar>
                <Typography variant="subtitle2" fontWeight={800} color={cat.color}>{cat.category}</Typography>
              </Box>
              <Stack spacing={1}>
                {cat.reports.map((r, ri) => (
                  <Box key={ri} display="flex" justifyContent="space-between" alignItems="center" p={1} borderRadius={2}
                    onClick={() => navigate(r.path)} sx={{ cursor: 'pointer', '&:hover': { bgcolor: alpha(cat.color, 0.06) } }}>
                    <Box>
                      <Typography variant="caption" fontWeight={700} display="block">{r.name}</Typography>
                      <Typography variant="caption" color="text.secondary" fontSize="0.65rem">{r.desc}</Typography>
                    </Box>
                    <ChevronRight size={14} color={cat.color} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── RECENT REPORTS + AI INSIGHTS ─────────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recently Viewed Reports</Typography>
            </Box>
            <Stack spacing={1.5}>
              {d.recentReports.map((r, i) => (
                <Box key={i} display="flex" justifyContent="space-between" alignItems="center" p={1.5} borderRadius={3}
                  bgcolor={isDark ? '#0F172A' : C.bg} border={`1px solid ${theme.palette.divider}`}>
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{r.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.date} • {r.user}</Typography>
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    {r.fav && <Star size={14} color={C.amber} fill={C.amber} />}
                    <Eye size={14} color={C.gray} />
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Lightbulb size={20} color={C.blue} />
              <Typography variant="h6" fontWeight={800}>AI Financial Intelligence Insights</Typography>
            </Box>
            <Stack spacing={1.5}>
              {d.insights.map((ins, i) => (
                <Box key={i} p={2} borderRadius={3}
                  bgcolor={ins.type === 'alert' ? alpha(C.red, 0.05) : ins.type === 'positive' ? alpha(C.green, 0.05) : (isDark ? '#0F172A' : C.bg)}
                  border={`1px solid ${ins.type === 'alert' ? alpha(C.red, 0.2) : ins.type === 'positive' ? alpha(C.green, 0.2) : theme.palette.divider}`}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    {ins.type === 'alert' ? <AlertTriangle size={16} color={C.red} /> : ins.type === 'positive' ? <TrendingUp size={16} color={C.green} /> : <Lightbulb size={16} color={C.blue} />}
                    <Typography variant="caption" fontWeight={700} textTransform="uppercase"
                      color={ins.type === 'alert' ? C.red : ins.type === 'positive' ? C.green : C.blue}>
                      {ins.type === 'alert' ? 'Action Required' : ins.type === 'positive' ? 'Positive Signal' : 'Analytics Insight'}
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{ins.text}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ── FILTER DRAWER ─────────────────────────────────────────────────── */}
      <Drawer anchor="right" open={filterOpen} onClose={() => setFilterOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, p: 3, bgcolor: isDark ? '#1E293B' : 'white' } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={800}>Report Filters</Typography>
          <IconButton onClick={() => setFilterOpen(false)}><X size={20} /></IconButton>
        </Box>
        <Stack spacing={2.5}>
          {[
            { label: 'Financial Year', key: 'fy', options: ['FY 2026-27', 'FY 2025-26', 'FY 2024-25'] },
            { label: 'Warehouse', key: 'warehouse', options: ['All Warehouses', 'Main Central Godown', 'Central WH-2', 'City Distribution Depot'] },
            { label: 'Payment Mode', key: 'paymentMode', options: ['All Modes', 'UPI & QR', 'Bank Transfer', 'Cash', 'Cheque'] },
          ].map((f) => (
            <FormControl key={f.key} fullWidth size="small">
              <InputLabel>{f.label}</InputLabel>
              <Select value={(filters as any)[f.key]} label={f.label} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}>
                {f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
              </Select>
            </FormControl>
          ))}
        </Stack>
        <Box mt={4} display="flex" gap={2}>
          <Button variant="outlined" fullWidth onClick={() => setFilters({ fy: 'FY 2026-27', warehouse: 'All Warehouses', paymentMode: 'All Modes' })}
            sx={{ textTransform: 'none', borderRadius: 2 }}>Reset</Button>
          <Button variant="contained" fullWidth onClick={() => setFilterOpen(false)}
            sx={{ bgcolor: C.blue, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Apply Filters</Button>
        </Box>
      </Drawer>

      {/* ── EXPORT DIALOG ─────────────────────────────────────────────────── */}
      <Dialog open={exportOpen} onClose={() => setExportOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Export Financial Reports</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} py={1}>
            <Typography variant="body2" color="text.secondary">Choose export format for financial reports package:</Typography>
            {[
              { label: 'PDF Report Package', icon: <FileText size={18} />, color: C.red },
              { label: 'Excel Workbook (.xlsx)', icon: <BarChart2 size={18} />, color: C.green },
              { label: 'CSV Data Export', icon: <Download size={18} />, color: C.blue },
              { label: 'Print Financial Statements', icon: <Printer size={18} />, color: C.gray },
            ].map((fmt, i) => (
              <Button key={i} variant="outlined" fullWidth startIcon={fmt.icon}
                onClick={() => setExportOpen(false)}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, justifyContent: 'flex-start',
                  borderColor: alpha(fmt.color, 0.4), color: fmt.color }}>
                {fmt.label}
              </Button>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setExportOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* ── SPEED DIAL FAB ─────────────────────────────────────────────────── */}
      <SpeedDial ariaLabel="Financial Reports Actions" sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{ sx: { bgcolor: C.blue, '&:hover': { bgcolor: alpha(C.blue, 0.9) }, boxShadow: '0 8px 24px rgba(21,101,192,0.4)' } }}>
        <SpeedDialAction icon={<Download size={18} />} tooltipTitle="Export PDF" onClick={() => setExportOpen(true)} />
        <SpeedDialAction icon={<BarChart2 size={18} />} tooltipTitle="Export Excel" onClick={() => setExportOpen(true)} />
        <SpeedDialAction icon={<Printer size={18} />} tooltipTitle="Print Reports" onClick={() => setExportOpen(true)} />
        <SpeedDialAction icon={<Share2 size={18} />} tooltipTitle="Share Reports" onClick={() => setExportOpen(true)} />
      </SpeedDial>
    </Box>
  );
}
