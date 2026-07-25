import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, IconButton, Button, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress,
  Stack, Divider, useTheme, alpha, Paper, Tooltip, InputBase, Drawer,
  FormControl, InputLabel, Select, MenuItem, SpeedDial, SpeedDialIcon, SpeedDialAction,
  Badge, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Switch, FormControlLabel,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search, Bell, TrendingUp, TrendingDown, Plus, Filter, RefreshCw, X,
  AlertTriangle, Clock, Download, CheckCircle2, AlertCircle, BarChart2,
  Layers, Lightbulb, Receipt, Building2, CreditCard, Percent, Users, Wallet,
  CircleDollarSign, Banknote, ChevronRight, Upload, Calendar, ArrowUpRight,
  ArrowDownRight, CheckSquare, XCircle, PieChart as PieIcon, Sliders, ShieldAlert,
  HelpCircle, Tag, Truck, Zap, Fuel, Home, Wrench, Package, Cpu, FileText
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

// Formatters
const fc = (v: number) => {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
};

// Semantic Color System
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
  kpis: {
    todayExpenses: 14500, todayEntries: 6, vsYesterdayPct: 12,
    monthlyExpenses: 640000, prevMonthExpenses: 585000, monthlyGrowthPct: 9.4,
    cashOutflow: { cash: 85000, bank: 420000, upi: 135000, total: 640000 },
    pending: { pendingApproval: 45000, pendingPayment: 82000, total: 127000, count: 5 },
    recurring: { dueThisWeek: 48000, dueThisMonth: 125000, overdue: 12000, count: 8 },
    budget: { allocated: 750000, used: 640000, remaining: 110000, consumedPct: 85.3 },
    warehouse: { count: 3, highestWh: 'Main Central Godown', highestAmount: 320000, totalWhExp: 540000 },
    avgDailySpend: 21333, weeklyTrendPct: 4.2, avgTransactionVal: 3200,
  },
  overview: {
    today: 14500, weekly: 149000, monthly: 640000, yearly: 6850000,
    avgDaily: 21333, avgTxn: 3200,
  },
  categories: [
    { name: 'Salaries & Wages', amount: 240000, pct: 37.5, trend: '+4.2%', color: C.blue, icon: <Users size={18} /> },
    { name: 'Warehouse Rent', amount: 96000, pct: 15.0, trend: '0.0%', color: C.purple, icon: <Home size={18} /> },
    { name: 'Transport & Freight', amount: 85000, pct: 13.3, trend: '-2.1%', color: C.teal, icon: <Truck size={18} /> },
    { name: 'Fuel Expenses', amount: 54000, pct: 8.4, trend: '+18.5%', color: C.orange, icon: <Fuel size={18} /> },
    { name: 'Electricity & Utilities', amount: 42000, pct: 6.6, trend: '+12.0%', color: C.amber, icon: <Zap size={18} /> },
    { name: 'Packaging Materials', amount: 38000, pct: 5.9, trend: '+8.4%', color: C.green, icon: <Package size={18} /> },
    { name: 'Repairs & Maintenance', amount: 35000, pct: 5.5, trend: '+15.2%', color: C.red, icon: <Wrench size={18} /> },
    { name: 'Office Supplies & Misc', amount: 50000, pct: 7.8, trend: '+1.5%', color: C.gray, icon: <Cpu size={18} /> },
  ],
  trendSeries: {
    Daily: [
      { t: 'Mon', exp: 18500, prev: 16000 },
      { t: 'Tue', exp: 22000, prev: 19500 },
      { t: 'Wed', exp: 14500, prev: 21000 },
      { t: 'Thu', exp: 31000, prev: 24000 },
      { t: 'Fri', exp: 26500, prev: 22500 },
      { t: 'Sat', exp: 14500, prev: 13000 },
      { t: 'Sun', exp: 8000, prev: 9500 },
    ],
    Weekly: [
      { t: 'Week 1', exp: 142000, prev: 135000 },
      { t: 'Week 2', exp: 168000, prev: 152000 },
      { t: 'Week 3', exp: 149000, prev: 144000 },
      { t: 'Week 4', exp: 181000, prev: 154000 },
    ],
    Monthly: [
      { t: 'Feb', exp: 520000, prev: 490000 },
      { t: 'Mar', exp: 580000, prev: 540000 },
      { t: 'Apr', exp: 540000, prev: 510000 },
      { t: 'May', exp: 610000, prev: 570000 },
      { t: 'Jun', exp: 585000, prev: 560000 },
      { t: 'Jul', exp: 640000, prev: 585000 },
    ],
    Quarterly: [
      { t: 'Q1 FY26', exp: 1640000, prev: 1520000 },
      { t: 'Q2 FY26', exp: 1770000, prev: 1650000 },
      { t: 'Q3 FY26', exp: 1890000, prev: 1780000 },
      { t: 'Q4 FY26', exp: 1550000, prev: 1480000 },
    ],
    Yearly: [
      { t: 'FY 2024', exp: 5400000, prev: 4800000 },
      { t: 'FY 2025', exp: 6200000, prev: 5400000 },
      { t: 'FY 2026', exp: 6850000, prev: 6200000 },
    ],
  },
  warehouses: [
    { name: 'Main Central Godown', total: 320000, labor: 140000, utility: 28000, maintenance: 22000, transport: 130000 },
    { name: 'City Distribution Depot', total: 145000, labor: 65000, utility: 11000, maintenance: 8000, transport: 61000 },
    { name: 'East Zone Warehouse', total: 75000, labor: 35000, utility: 3000, maintenance: 5000, transport: 32000 },
  ],
  budgetItems: [
    { category: 'Salaries & Wages', budget: 250000, actual: 240000, variance: 10000, pct: 96.0, over: false },
    { category: 'Warehouse Rent', budget: 96000, actual: 96000, variance: 0, pct: 100.0, over: false },
    { category: 'Transport & Freight', budget: 90000, actual: 85000, variance: 5000, pct: 94.4, over: false },
    { category: 'Fuel Expenses', budget: 45000, actual: 54000, variance: -9000, pct: 120.0, over: true },
    { category: 'Electricity & Utilities', budget: 35000, actual: 42000, variance: -7000, pct: 120.0, over: true },
    { category: 'Packaging Materials', budget: 40000, actual: 38000, variance: 2000, pct: 95.0, over: false },
    { category: 'Repairs & Maintenance', budget: 25000, actual: 35000, variance: -10000, pct: 140.0, over: true },
    { category: 'Office Supplies & Misc', budget: 60000, actual: 50000, variance: 10000, pct: 83.3, over: false },
  ],
  pendingExpenses: [
    { id: 1, name: 'Forklift Engine Overhaul', category: 'Repairs & Maintenance', amount: 22000, date: '2026-07-24', dueDate: '2026-07-28', status: 'Pending Approval', wh: 'Main Central Godown' },
    { id: 2, name: 'Diesel Refill — Fleet Trucks', category: 'Fuel Expenses', amount: 18500, date: '2026-07-25', dueDate: '2026-07-26', status: 'Pending Payment', wh: 'Main Central Godown' },
    { id: 3, name: 'Corrugated Boxes Batch 44', category: 'Packaging Materials', amount: 38000, date: '2026-07-22', dueDate: '2026-07-30', status: 'Approved', wh: 'City Distribution Depot' },
    { id: 4, name: 'CCTV AMC Q2 Renewal', category: 'Office Supplies & Misc', amount: 12000, date: '2026-07-15', dueDate: '2026-07-20', status: 'Overdue', wh: 'East Zone Warehouse' },
  ],
  recurringExpenses: [
    { name: 'Godown A Monthly Rent', amount: 96000, dueDate: '2026-08-01', freq: 'Monthly', status: 'Due Soon', autoReminder: true },
    { name: 'Torrent Power Electricity Bill', amount: 42000, dueDate: '2026-08-05', freq: 'Monthly', status: 'Due Soon', autoReminder: true },
    { name: 'Jio Fiber Commercial Broadband', amount: 4999, dueDate: '2026-08-02', freq: 'Monthly', status: 'Auto-Pay', autoReminder: true },
    { name: 'Warehouse Fire Insurance Premium', amount: 12000, dueDate: '2026-07-28', freq: 'Quarterly', status: 'Overdue', autoReminder: true },
    { name: 'Staff Tea & Refreshments Vendor', amount: 8500, dueDate: '2026-07-31', freq: 'Monthly', status: 'Due Soon', autoReminder: false },
  ],
  paymentMethods: [
    { mode: 'Bank Transfer (NEFT/RTGS)', amount: 420000, pct: 65.6, count: 18, color: C.blue },
    { mode: 'UPI & QR Code', amount: 135000, pct: 21.1, count: 42, color: C.teal },
    { mode: 'Cash Payment', amount: 85000, pct: 13.3, count: 26, color: C.orange },
  ],
  approvalSummary: { pending: 3, approved: 42, rejected: 2, avgApprovalHours: 4.5 },
  timeline: [
    { id: 1, type: 'added', title: 'New Expense Added — Diesel Refill ₹18,500', time: '10 mins ago', user: 'Ramesh Kumar (Logistics Manager)', mode: 'UPI', wh: 'Main Central Godown' },
    { id: 2, type: 'receipt', title: 'Receipt Uploaded — Corrugated Boxes ₹38,000', time: '1 hour ago', user: 'Sunil Sharma (Store Keeper)', mode: 'Bank Transfer', wh: 'City Distribution Depot' },
    { id: 3, type: 'payment', title: 'Payment Recorded — Staff Daily Wages ₹14,500', time: '3 hours ago', user: 'Accountant', mode: 'Cash', wh: 'Main Central Godown' },
    { id: 4, type: 'approved', title: 'Approval Granted — Forklift Maintenance ₹22,000', time: '5 hours ago', user: 'Owner', mode: 'Cheque', wh: 'Main Central Godown' },
    { id: 5, type: 'recurring', title: 'Recurring Bill Alert — Warehouse Rent Due in 6 days', time: '1 day ago', user: 'System Auto-Reminder', mode: 'Bank Transfer', wh: 'All Warehouses' },
  ],
  insights: [
    { text: 'Fuel expenses increased by 18.5% this month due to extra inter-depot trips.', type: 'alert' },
    { text: 'Electricity bill exceeded budget by ₹7,000 (120% consumed). Review AC usage.', type: 'alert' },
    { text: 'Repairs & maintenance cost is 40% over budget due to forklift engine overhaul.', type: 'alert' },
    { text: 'Main Central Godown accounts for 59% of total operational spending.', type: 'info' },
    { text: 'Transport expenses dropped by 2.1% after route optimization.', type: 'positive' },
    { text: 'Warehouse Rent of ₹96,000 is due in 6 days (1st August).', type: 'info' },
  ],
};

export default function ExpensesDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  const [trendTf, setTrendTf] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Yearly'>('Monthly');
  const [filterOpen, setFilterOpen] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);
  const [recordPayOpen, setRecordPayOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<any>(null);

  const [filters, setFilters] = useState({ category: 'All Categories', warehouse: 'All Warehouses', paymentMode: 'All Modes' });

  const { data: d, refetch } = useQuery({
    queryKey: ['expenseDashboardData', activeBusiness?.id, trendTf],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data } = await supabase.from('journal_entries').select('*').eq('business_id', activeBusiness.id);
          if (data && data.length > 0) return MOCK;
        }
      } catch (e) { console.warn('Using offline expense mock data', e); }
      return MOCK;
    },
    initialData: MOCK,
  });

  const handleRefresh = async () => { setRefreshing(true); await refetch(); setTimeout(() => setRefreshing(false), 600); };
  const currentTrend = d.trendSeries[trendTf];

  // ── EMPTY STATE PREVIEW ───────────────────────────────────────────────────
  if (emptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : C.bg, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" mb={4}>
          <Typography variant="h4" fontWeight={800}>Expense Dashboard</Typography>
          <FormControlLabel control={<Switch checked={emptyState} onChange={(e) => setEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" fontWeight={700}>Empty Demo</Typography>} />
        </Box>
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${theme.palette.divider}`, bgcolor: isDark ? '#1E293B' : 'white', maxWidth: 560, mx: 'auto', mt: 6 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(C.orange, 0.1), color: C.orange, mx: 'auto', mb: 3 }}>
            <Receipt size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>No Expenses Recorded</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 380, mx: 'auto' }}>
            Operational expenses, recurring bills, and warehouse costs will appear here with real-time budget tracking and cost analytics.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setAddExpenseOpen(true)}
              sx={{ bgcolor: C.orange, px: 3, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Record First Expense</Button>
            <Button variant="outlined" onClick={() => setEmptyState(false)} sx={{ px: 3, textTransform: 'none', borderRadius: 2 }}>Load Demo Data</Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ── MAIN DASHBOARD ─────────────────────────────────────────────────────────
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: isDark ? '#0F172A' : C.bg, minHeight: '100vh', pb: 14 }}>

      {/* ── TOP APP BAR ───────────────────────────────────────────────────── */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" color="text.primary">
            Expense Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Business Expense Management Center • {dayjs().format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <Paper elevation={0} sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 220, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: isDark ? '#1E293B' : 'white' }}>
            <Search size={16} color={C.gray} /><InputBase sx={{ ml: 1, flex: 1, fontSize: '0.85rem' }} placeholder="Search expenses…" />
          </Paper>

          <Button variant="outlined" onClick={() => setFilterOpen(true)} startIcon={<Filter size={18} />}
            sx={{ borderRadius: 3, borderColor: theme.palette.divider, color: 'text.primary', bgcolor: isDark ? '#1E293B' : 'white', textTransform: 'none', fontWeight: 600, height: 40 }}>Filters</Button>

          <Tooltip title="Refresh Dashboard">
            <IconButton onClick={handleRefresh} sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
              <RefreshCw size={18} />
            </IconButton>
          </Tooltip>

          <IconButton sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
            <Badge badgeContent={d.pendingExpenses.length} color="error"><Bell size={18} /></Badge>
          </IconButton>

          <FormControlLabel control={<Switch size="small" checked={emptyState} onChange={(e) => setEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" color="text.secondary">Empty Demo</Typography>} />
        </Stack>
      </Box>

      {/* ── 8 EXPENSE KPI CARDS ────────────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { title: "Today's Expenses", color: C.orange, icon: <Receipt size={20} />, main: fc(d.kpis.todayExpenses), chip: `+${d.kpis.vsYesterdayPct}% vs Yesterday`, sub: `${d.kpis.todayEntries} Expense Entries` },
          { title: 'Monthly Expenses', color: C.blue, icon: <Calendar size={20} />, main: fc(d.kpis.monthlyExpenses), chip: `+${d.kpis.monthlyGrowthPct}% vs Prev Month`, sub: `Prev Month: ${fc(d.kpis.prevMonthExpenses)}` },
          { title: 'Cash Outflow', color: C.teal, icon: <Banknote size={20} />, main: fc(d.kpis.cashOutflow.total), chip: `Bank: ${fc(d.kpis.cashOutflow.bank)}`, sub: `Cash: ${fc(d.kpis.cashOutflow.cash)} • UPI: ${fc(d.kpis.cashOutflow.upi)}` },
          { title: 'Pending Expenses', color: C.red, icon: <Clock size={20} />, main: fc(d.kpis.pending.total), chip: `${d.kpis.pending.count} Items Pending`, sub: `Approval: ${fc(d.kpis.pending.pendingApproval)} • Pay: ${fc(d.kpis.pending.pendingPayment)}` },
          { title: 'Recurring Expenses', color: C.amber, icon: <RefreshCw size={20} />, main: fc(d.kpis.recurring.dueThisWeek), chip: `${d.kpis.recurring.count} Total Bills`, sub: `Due Month: ${fc(d.kpis.recurring.dueThisMonth)} • Overdue: ${fc(d.kpis.recurring.overdue)}` },
          { title: 'Expense Budget', color: d.kpis.budget.consumedPct > 90 ? C.red : C.green, icon: <Sliders size={20} />, main: fc(d.kpis.budget.used), chip: `${d.kpis.budget.consumedPct}% Consumed`, sub: `Allocated: ${fc(d.kpis.budget.allocated)} • Left: ${fc(d.kpis.budget.remaining)}` },
          { title: 'Warehouse Expenses', color: C.purple, icon: <Building2 size={20} />, main: fc(d.kpis.warehouse.totalWhExp), chip: `3 Godowns Active`, sub: `Highest: ${d.kpis.warehouse.highestWh}` },
          { title: 'Avg Daily Spend', color: C.gray, icon: <TrendingUp size={20} />, main: fc(d.kpis.avgDailySpend), chip: `Weekly: +${d.kpis.weeklyTrendPct}%`, sub: `Avg Txn: ${fc(d.kpis.avgTransactionVal)}` },
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

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────────── */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2}>Quick Expense Operations</Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'Add Expense', icon: <Plus size={20} />, color: C.orange, action: () => setAddExpenseOpen(true) },
            { label: 'Upload Receipt', icon: <Upload size={20} />, color: C.blue, action: () => {} },
            { label: 'Record Payment', icon: <Banknote size={20} />, color: C.green, action: () => setRecordPayOpen(true) },
            { label: 'Expense Categories', icon: <Tag size={20} />, color: C.purple, action: () => {} },
            { label: 'Expense Report', icon: <FileText size={20} />, color: C.gray, action: () => navigate('/reports/finance-dashboard') },
            { label: 'Budget Settings', icon: <Sliders size={20} />, color: C.teal, action: () => {} },
            { label: 'Recurring Expenses', icon: <RefreshCw size={20} />, color: C.amber, action: () => {} },
            { label: 'Expense Analytics', icon: <BarChart2 size={20} />, color: C.red, action: () => {} },
          ].map((a, i) => (
            <Grid item xs={6} sm={3} md={1.5} key={i}>
              <Button variant="outlined" fullWidth onClick={a.action}
                sx={{ py: 1.5, px: 1, display: 'flex', flexDirection: 'column', gap: 0.8, borderRadius: 3, borderColor: theme.palette.divider, color: 'text.primary',
                  '&:hover': { borderColor: a.color, bgcolor: alpha(a.color, 0.07), transform: 'translateY(-2px)' }, transition: 'all 0.2s ease' }}>
                <Box sx={{ color: a.color }}>{a.icon}</Box>
                <Typography variant="caption" fontWeight={700} textAlign="center" lineHeight={1.2}>{a.label}</Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ── EXPENSE OVERVIEW CARDS ────────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { label: "Today's Expense", amount: d.overview.today, color: C.orange, sub: '6 Transactions' },
          { label: 'Weekly Expenses', amount: d.overview.weekly, color: C.blue, sub: 'Last 7 Days' },
          { label: 'Monthly Expenses', amount: d.overview.monthly, color: C.purple, sub: 'Current Month' },
          { label: 'Yearly Expenses', amount: d.overview.yearly, color: C.gray, sub: 'FY 2026-27' },
          { label: 'Avg Daily Spend', amount: d.overview.avgDaily, color: C.teal, sub: 'Daily Average' },
          { label: 'Avg Txn Value', amount: d.overview.avgTxn, color: C.green, sub: 'Per Voucher' },
        ].map((o, i) => (
          <Grid item xs={6} sm={4} md={2} key={i}>
            <Paper sx={{ p: 2, borderRadius: 3, bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">{o.label}</Typography>
              <Typography variant="h6" fontWeight={800} color={o.color} mt={0.5}>{fc(o.amount)}</Typography>
              <Typography variant="caption" color="text.secondary">{o.sub}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* ── EXPENSE TREND CHART + CATEGORY ANALYTICS ─────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Trend Analysis */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Expense Trend Analysis</Typography>
                <Typography variant="caption" color="text.secondary">Operational spending progression over time</Typography>
              </Box>
              <Stack direction="row" bgcolor={isDark ? '#0F172A' : C.bg} p={0.5} borderRadius={2.5}>
                {(['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] as const).map((tf) => (
                  <Button key={tf} size="small" onClick={() => setTrendTf(tf)}
                    sx={{ px: 1.2, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
                      bgcolor: trendTf === tf ? (isDark ? '#334155' : 'white') : 'transparent',
                      color: trendTf === tf ? 'text.primary' : 'text.secondary' }}>
                    {tf}
                  </Button>
                ))}
              </Stack>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: C.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.gray }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <RTooltip formatter={(v: number) => fc(v)} />
                <Line type="monotone" name="Current Period" dataKey="exp" stroke={C.orange} strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" name="Previous Period" dataKey="prev" stroke={C.gray} strokeWidth={2} strokeDasharray="5 3" dot={false} />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Category Distribution Pie */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>Category-Wise Expense Distribution</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Share of total operating expenses</Typography>
            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} sm={6}>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={d.categories} cx="50%" cy="50%" innerRadius={50} outerRadius={85} dataKey="amount" paddingAngle={2}>
                      {d.categories.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <RTooltip formatter={(v: number) => fc(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1}>
                  {d.categories.slice(0, 6).map((cat, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <Box width={8} height={8} borderRadius="50%" bgcolor={cat.color} flexShrink={0} />
                        <Typography variant="caption" fontWeight={600} noWrap>{cat.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={800} color={cat.color}>{fc(cat.amount)}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ── EXPENSE CATEGORIES RANKING CARDS ───────────────────────────── */}
      <Typography variant="h6" fontWeight={800} mb={2}>Category Analytics & Ranking</Typography>
      <Grid container spacing={2} mb={3}>
        {d.categories.map((cat, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <MP whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
              sx={{ p: 2, borderRadius: 3, bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${alpha(cat.color, 0.25)}` }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(cat.color, 0.12), color: cat.color }}>{cat.icon}</Avatar>
                  <Typography variant="subtitle2" fontWeight={800}>{cat.name}</Typography>
                </Box>
                <Chip size="small" label={`${cat.pct}%`} sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, bgcolor: alpha(cat.color, 0.12), color: cat.color }} />
              </Box>
              <Typography variant="h6" fontWeight={800} color={cat.color}>{fc(cat.amount)}</Typography>
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={0.5}>
                <Typography variant="caption" color="text.secondary">Monthly Trend: <span style={{ color: cat.trend.startsWith('+') ? C.red : C.green, fontWeight: 700 }}>{cat.trend}</span></Typography>
                <Button size="small" onClick={() => setAddExpenseOpen(true)} sx={{ fontSize: '0.65rem', p: 0, textTransform: 'none', fontWeight: 700 }}>+ Expense</Button>
              </Box>
            </MP>
          </Grid>
        ))}
      </Grid>

      {/* ── BUDGET MONITORING + WAREHOUSE EXPENSES ──────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Budget Monitoring */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Budget Monitoring & Variance</Typography>
                <Typography variant="caption" color="text.secondary">Allocated budget vs consumed expenses by category</Typography>
              </Box>
              <Chip label={`${d.kpis.budget.consumedPct}% Overall Consumed`} size="small" sx={{ bgcolor: alpha(C.orange, 0.12), color: C.orange, fontWeight: 800 }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' } }}>
                    <TableCell>Category</TableCell><TableCell align="right">Budget</TableCell>
                    <TableCell align="right">Actual</TableCell><TableCell align="center">% Used</TableCell>
                    <TableCell align="right">Variance</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.budgetItems.map((b, i) => (
                    <TableRow key={i} hover sx={{ bgcolor: b.over ? alpha(C.red, 0.04) : 'transparent' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{b.category}</TableCell>
                      <TableCell align="right">{fc(b.budget)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: b.over ? C.red : C.green }}>{fc(b.actual)}</TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <LinearProgress variant="determinate" value={Math.min(b.pct, 100)}
                            sx={{ flex: 1, height: 5, borderRadius: 3, bgcolor: alpha(C.gray, 0.15), '& .MuiLinearProgress-bar': { bgcolor: b.over ? C.red : C.green } }} />
                          <Typography variant="caption" fontWeight={800} color={b.over ? C.red : C.green}>{b.pct}%</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: b.variance < 0 ? C.red : C.green }}>
                        {b.variance < 0 ? `(${fc(Math.abs(b.variance))})` : `+${fc(b.variance)}`}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Warehouse Expense Analysis */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight={800}>Warehouse Expense Analysis</Typography>
              <Button size="small" onClick={() => navigate('/inventory/warehouses')} sx={{ textTransform: 'none', fontWeight: 700 }}>Warehouses</Button>
            </Box>
            <Stack spacing={2}>
              {d.warehouses.map((w, i) => (
                <Box key={i} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : C.bg} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="subtitle2" fontWeight={800}>{w.name}</Typography>
                    <Typography variant="subtitle2" fontWeight={900} color={C.purple}>{fc(w.total)}</Typography>
                  </Box>
                  <Grid container spacing={1}>
                    {[
                      { label: 'Labor', val: w.labor, color: C.blue },
                      { label: 'Utility', val: w.utility, color: C.amber },
                      { label: 'Maint.', val: w.maintenance, color: C.red },
                      { label: 'Transport', val: w.transport, color: C.teal },
                    ].map((sub, si) => (
                      <Grid item xs={3} key={si}>
                        <Typography variant="caption" color="text.secondary" display="block">{sub.label}</Typography>
                        <Typography variant="caption" fontWeight={800} color={sub.color}>{fc(sub.val)}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ── PENDING EXPENSES + RECURRING BILLS ────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Pending Expenses Table */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${alpha(C.red, 0.2)}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <Clock size={20} color={C.red} />
                <Typography variant="h6" fontWeight={800}>Pending Expenses & Approvals</Typography>
              </Box>
              <Chip label={`${d.pendingExpenses.length} Pending Items`} size="small" sx={{ bgcolor: alpha(C.red, 0.12), color: C.red, fontWeight: 800 }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' } }}>
                    <TableCell>Expense Name</TableCell><TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Status</TableCell><TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {d.pendingExpenses.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{p.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{p.category} • {p.wh}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: C.red }}>{fc(p.amount)}</TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={p.status}
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800,
                            bgcolor: alpha(p.status === 'Approved' ? C.green : p.status === 'Overdue' ? C.red : C.orange, 0.12),
                            color: p.status === 'Approved' ? C.green : p.status === 'Overdue' ? C.red : C.orange }} />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="contained" onClick={() => { setSelectedPending(p); setRecordPayOpen(true); }}
                          sx={{ bgcolor: C.orange, fontSize: '0.68rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                          Action
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Recurring Expenses */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <RefreshCw size={20} color={C.amber} />
              <Typography variant="h6" fontWeight={800}>Recurring Operational Bills</Typography>
            </Box>
            <Stack spacing={1.5}>
              {d.recurringExpenses.map((r, i) => (
                <Box key={i} p={1.5} borderRadius={3} bgcolor={isDark ? '#0F172A' : C.bg} border={`1px solid ${theme.palette.divider}`}
                  display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={700}>{r.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Due: {r.dueDate} • {r.freq}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="subtitle2" fontWeight={800} color={C.blue}>{fc(r.amount)}</Typography>
                    <Button size="small" variant="contained" onClick={() => setRecordPayOpen(true)}
                      sx={{ mt: 0.5, bgcolor: C.green, fontSize: '0.65rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                      Pay Now
                    </Button>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ── PAYMENT METHODS + APPROVAL SUMMARY ─────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Payment Methods */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>Payment Method Breakdown</Typography>
            <Stack spacing={2}>
              {d.paymentMethods.map((pm, i) => (
                <Box key={i}>
                  <Box display="flex" justifyContent="space-between" mb={0.5}>
                    <Typography variant="body2" fontWeight={700}>{pm.mode}</Typography>
                    <Typography variant="body2" fontWeight={800} color={pm.color}>{fc(pm.amount)} ({pm.pct}%)</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={pm.pct}
                    sx={{ height: 8, borderRadius: 4, bgcolor: alpha(pm.color, 0.12), '& .MuiLinearProgress-bar': { bgcolor: pm.color, borderRadius: 4 } }} />
                  <Typography variant="caption" color="text.secondary" display="block" mt={0.3}>{pm.count} Transactions</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Approval Summary */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>Expense Approval Summary</Typography>
            <Grid container spacing={2} mb={2}>
              {[
                { label: 'Pending Approvals', val: d.approvalSummary.pending, color: C.orange },
                { label: 'Approved Expenses', val: d.approvalSummary.approved, color: C.green },
                { label: 'Rejected Expenses', val: d.approvalSummary.rejected, color: C.red },
                { label: 'Avg Approval Time', val: `${d.approvalSummary.avgApprovalHours} hrs`, color: C.blue },
              ].map((a, i) => (
                <Grid item xs={6} key={i}>
                  <Box p={2} borderRadius={3} bgcolor={alpha(a.color, 0.08)} border={`1px solid ${alpha(a.color, 0.2)}`}>
                    <Typography variant="caption" color="text.secondary" fontWeight={700}>{a.label}</Typography>
                    <Typography variant="h5" fontWeight={900} color={a.color} mt={0.5}>{a.val}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ── RECENT ACTIVITY + SMART INSIGHTS ────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Expense Activity Timeline</Typography>
            </Box>
            <Stack spacing={2.5}>
              {d.timeline.map((t) => (
                <Box key={t.id} display="flex" gap={2} alignItems="center">
                  <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(C.orange, 0.12), color: C.orange }}>
                    <Receipt size={18} />
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={700}>{t.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.user} • {t.mode} • {t.wh} • {t.time}
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
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Lightbulb size={20} color={C.orange} />
              <Typography variant="h6" fontWeight={800}>Smart Expense Insights</Typography>
            </Box>
            <Stack spacing={2}>
              {d.insights.map((ins, i) => (
                <Box key={i} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : C.bg} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <AlertTriangle size={16} color={ins.type === 'alert' ? C.red : ins.type === 'positive' ? C.green : C.blue} />
                    <Typography variant="caption" fontWeight={700} textTransform="uppercase"
                      color={ins.type === 'alert' ? C.red : ins.type === 'positive' ? C.green : C.blue}>
                      {ins.type === 'alert' ? 'Cost Alert' : ins.type === 'positive' ? 'Saving Opportunity' : 'Operational Info'}
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
          <Typography variant="h6" fontWeight={800}>Expense Filters</Typography>
          <IconButton onClick={() => setFilterOpen(false)}><X size={20} /></IconButton>
        </Box>
        <Stack spacing={2.5}>
          {[
            { label: 'Category', key: 'category', options: ['All Categories', 'Salaries & Wages', 'Warehouse Rent', 'Transport', 'Fuel', 'Electricity', 'Maintenance'] },
            { label: 'Warehouse', key: 'warehouse', options: ['All Warehouses', 'Main Central Godown', 'City Distribution Depot', 'East Zone Warehouse'] },
            { label: 'Payment Mode', key: 'paymentMode', options: ['All Modes', 'Bank Transfer', 'UPI & QR', 'Cash Payment'] },
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
          <Button variant="outlined" fullWidth onClick={() => setFilters({ category: 'All Categories', warehouse: 'All Warehouses', paymentMode: 'All Modes' })}
            sx={{ textTransform: 'none', borderRadius: 2 }}>Reset</Button>
          <Button variant="contained" fullWidth onClick={() => setFilterOpen(false)}
            sx={{ bgcolor: C.orange, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Apply Filters</Button>
        </Box>
      </Drawer>

      {/* ── ADD EXPENSE DIALOG ────────────────────────────────────────────── */}
      <Dialog open={addExpenseOpen} onClose={() => setAddExpenseOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Operational Expense</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} py={1}>
            <TextField label="Expense Title / Description" fullWidth size="small" placeholder="e.g. Fuel Refill for Fleet Truck #4" />
            <FormControl fullWidth size="small">
              <InputLabel>Expense Category</InputLabel>
              <Select defaultValue="Fuel Expenses" label="Expense Category">
                {d.categories.map((c) => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField label="Amount (₹)" fullWidth size="small" placeholder="e.g. 18500" />
            <FormControl fullWidth size="small">
              <InputLabel>Warehouse / Location</InputLabel>
              <Select defaultValue="Main Central Godown" label="Warehouse / Location">
                {d.warehouses.map((w) => <MenuItem key={w.name} value={w.name}>{w.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Payment Mode</InputLabel>
              <Select defaultValue="UPI & QR Code" label="Payment Mode">
                <MenuItem value="UPI & QR Code">UPI & QR Code</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</MenuItem>
                <MenuItem value="Cash Payment">Cash Payment</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Expense Date" fullWidth size="small" type="date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddExpenseOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddExpenseOpen(false)}
            sx={{ bgcolor: C.orange, textTransform: 'none', fontWeight: 700 }}>Record Expense</Button>
        </DialogActions>
      </Dialog>

      {/* ── RECORD PAYMENT DIALOG ─────────────────────────────────────────── */}
      <Dialog open={recordPayOpen} onClose={() => setRecordPayOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Expense Payment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} py={1}>
            {selectedPending && (
              <Box p={1.5} borderRadius={2} bgcolor={alpha(C.orange, 0.08)}>
                <Typography variant="caption" color="text.secondary">Expense Item</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedPending.name}</Typography>
                <Typography variant="caption" color="text.secondary">{selectedPending.category}</Typography>
              </Box>
            )}
            <TextField label="Payment Amount (₹)" fullWidth size="small" defaultValue={selectedPending?.amount || ''} placeholder="e.g. 18500" />
            <TextField label="Payment Reference / Transaction ID" fullWidth size="small" placeholder="e.g. UPI-TXN-998822" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRecordPayOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => setRecordPayOpen(false)}
            sx={{ bgcolor: C.green, textTransform: 'none', fontWeight: 700 }}>Confirm Payment</Button>
        </DialogActions>
      </Dialog>

      {/* ── SPEED DIAL FAB ─────────────────────────────────────────────────── */}
      <SpeedDial ariaLabel="Expense Actions" sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{ sx: { bgcolor: C.orange, '&:hover': { bgcolor: alpha(C.orange, 0.9) }, boxShadow: '0 8px 24px rgba(230,81,0,0.4)' } }}>
        <SpeedDialAction icon={<Plus size={18} />} tooltipTitle="Add Expense" onClick={() => setAddExpenseOpen(true)} />
        <SpeedDialAction icon={<Upload size={18} />} tooltipTitle="Upload Receipt" onClick={() => {}} />
        <SpeedDialAction icon={<Banknote size={18} />} tooltipTitle="Record Payment" onClick={() => setRecordPayOpen(true)} />
        <SpeedDialAction icon={<RefreshCw size={18} />} tooltipTitle="Add Recurring" onClick={() => {}} />
        <SpeedDialAction icon={<FileText size={18} />} tooltipTitle="Expense Report" onClick={() => navigate('/reports/finance-dashboard')} />
        <SpeedDialAction icon={<Sliders size={18} />} tooltipTitle="Budget Setup" onClick={() => {}} />
      </SpeedDial>
    </Box>
  );
}
