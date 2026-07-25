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
  Plus,
  Filter,
  RefreshCw,
  X,
  AlertTriangle,
  Clock,
  Download,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Calendar,
  Layers,
  Lightbulb,
  Receipt,
  Landmark,
  ArrowRightLeft,
  FileText,
  CreditCard,
  Percent,
  RotateCcw,
  Users,
  Building2,
  Wallet,
  CircleDollarSign,
  ChevronRight,
  Banknote,
  Scale,
  BookOpen,
  CheckSquare,
  XCircle,
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
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// Colors
const C = {
  green: '#2E7D32',
  greenLight: '#E8F5E9',
  orange: '#E65100',
  orangeLight: '#FFF3E0',
  emerald: '#00897B',
  emeraldLight: '#E0F2F1',
  red: '#C62828',
  redLight: '#FFEBEE',
  amber: '#F57F17',
  amberLight: '#FFFDE7',
  blue: '#1565C0',
  blueLight: '#E3F2FD',
  purple: '#6A1B9A',
  purpleLight: '#F3E5F5',
  gray: '#546E7A',
  bg: '#F8FAFC',
};

const MotionCard = motion.create(Card);
const MotionPaper = motion.create(Paper);

// ── MOCK DATA ──────────────────────────────────────────────────────────────
const MOCK = {
  kpis: {
    loansGivenTotal: 1850000,
    loansGivenOutstanding: 1220000,
    loansTakenTotal: 680000,
    loansTakenOutstanding: 410000,
    interestReceivable: 68500,
    interestPayable: 24200,
    todayCollections: 45000,
    todayPayments: 18000,
    netLoanPosition: 810000, // given - taken outstanding
    percentRecovered: 66,
    avgInterestRate: 12.5,
    totalInterestEarned: 142000,
    totalInterestPaid: 52000,
    netInterestIncome: 90000,
    onTimePayments: 68,
    latePayments: 12,
    missedPayments: 4,
    overdueLoansCount: 6,
    repaymentPct: 85,
  },
  portfolioDistribution: [
    { name: 'Customer Loans', value: 620000, color: C.green },
    { name: 'Supplier Loans', value: 240000, color: C.orange },
    { name: 'Employee Advances', value: 85000, color: C.blue },
    { name: 'Personal Loans', value: 180000, color: C.purple },
    { name: 'Business Loans', value: 95000, color: C.emerald },
    { name: 'Third-Party', value: 0, color: C.gray },
  ],
  loanStatusDist: [
    { name: 'Active', value: 14, color: C.green },
    { name: 'Partially Paid', value: 8, color: C.amber },
    { name: 'Overdue', value: 6, color: C.red },
    { name: 'Closed', value: 22, color: C.blue },
    { name: 'Written Off', value: 1, color: C.gray },
  ],
  cashflowSeries: {
    Daily: [
      { name: 'Mon', issued: 50000, repayments: 45000, intEarned: 2100, intPaid: 800 },
      { name: 'Tue', issued: 0, repayments: 25000, intEarned: 2100, intPaid: 800 },
      { name: 'Wed', issued: 150000, repayments: 18000, intEarned: 2100, intPaid: 800 },
      { name: 'Thu', issued: 0, repayments: 62000, intEarned: 2100, intPaid: 800 },
      { name: 'Fri', issued: 0, repayments: 45000, intEarned: 2100, intPaid: 800 },
      { name: 'Sat', issued: 0, repayments: 45000, intEarned: 2100, intPaid: 800 },
    ],
    Monthly: [
      { name: 'Feb', issued: 280000, repayments: 195000, intEarned: 11500, intPaid: 4200 },
      { name: 'Mar', issued: 350000, repayments: 240000, intEarned: 13200, intPaid: 4800 },
      { name: 'Apr', issued: 120000, repayments: 280000, intEarned: 12800, intPaid: 4500 },
      { name: 'May', issued: 450000, repayments: 210000, intEarned: 14100, intPaid: 5100 },
      { name: 'Jun', issued: 180000, repayments: 320000, intEarned: 13500, intPaid: 4900 },
      { name: 'Jul', issued: 200000, repayments: 185000, intEarned: 14400, intPaid: 5200 },
    ],
    Quarterly: [
      { name: 'Q1 FY26', issued: 820000, repayments: 620000, intEarned: 36000, intPaid: 13200 },
      { name: 'Q2 FY26', issued: 640000, repayments: 750000, intEarned: 38500, intPaid: 14100 },
      { name: 'Q3 FY26', issued: 950000, repayments: 820000, intEarned: 41200, intPaid: 15400 },
      { name: 'Q4 FY26', issued: 390000, repayments: 465000, intEarned: 26300, intPaid: 9300 },
    ],
  },
  monthlyTrend: [
    { name: 'Aug', given: 200000, recovered: 140000, interest: 9200 },
    { name: 'Sep', given: 320000, recovered: 280000, interest: 10800 },
    { name: 'Oct', given: 180000, recovered: 210000, interest: 9600 },
    { name: 'Nov', given: 450000, recovered: 380000, interest: 12400 },
    { name: 'Dec', given: 120000, recovered: 165000, interest: 8800 },
    { name: 'Jan', given: 380000, recovered: 290000, interest: 11200 },
    { name: 'Feb', given: 280000, recovered: 195000, interest: 11500 },
    { name: 'Mar', given: 350000, recovered: 240000, interest: 13200 },
    { name: 'Apr', given: 120000, recovered: 280000, interest: 12800 },
    { name: 'May', given: 450000, recovered: 210000, interest: 14100 },
    { name: 'Jun', given: 180000, recovered: 320000, interest: 13500 },
    { name: 'Jul', given: 200000, recovered: 185000, interest: 14400 },
  ],
  upcomingDue: [
    { id: 1, name: 'Metro Retailers Pvt Ltd', type: 'Customer', dueDate: '2026-07-28', amount: 75000, daysLeft: 3 },
    { id: 2, name: 'Kishan General Stores', type: 'Customer', dueDate: '2026-07-30', amount: 32000, daysLeft: 5 },
    { id: 3, name: 'ITC Limited (Supplier)', type: 'Supplier', dueDate: '2026-08-05', amount: 120000, daysLeft: 11 },
    { id: 4, name: 'Staff Advance — Raj Kumar', type: 'Employee', dueDate: '2026-08-01', amount: 8500, daysLeft: 7 },
  ],
  overdueLoans: [
    { borrower: 'Shree Balaji Enterprises', outstanding: 150000, interestDue: 18000, daysOverdue: 22, type: 'Customer' },
    { borrower: 'Apex Traders & Co.', outstanding: 85000, interestDue: 9800, daysOverdue: 14, type: 'Customer' },
    { borrower: 'Personal — Family Loan', outstanding: 180000, interestDue: 21600, daysOverdue: 45, type: 'Personal' },
  ],
  agingBuckets: [
    { range: '0–30 Days', count: 8, principal: 480000, interest: 8200, outstanding: 488200 },
    { range: '31–60 Days', count: 5, principal: 320000, interest: 12400, outstanding: 332400 },
    { range: '61–90 Days', count: 4, principal: 215000, interest: 14800, outstanding: 229800 },
    { range: '91–180 Days', count: 3, principal: 145000, interest: 18600, outstanding: 163600 },
    { range: '180+ Days', count: 2, principal: 60000, interest: 14500, outstanding: 74500 },
  ],
  loanCategories: [
    { label: 'Customer Loans', count: 12, outstanding: 620000, color: C.green, icon: <Users size={20} /> },
    { label: 'Supplier Loans', count: 4, outstanding: 240000, color: C.orange, icon: <Building2 size={20} /> },
    { label: 'Employee Advances', count: 6, outstanding: 85000, color: C.blue, icon: <Wallet size={20} /> },
    { label: 'Personal Loans', count: 3, outstanding: 180000, color: C.purple, icon: <CircleDollarSign size={20} /> },
    { label: 'Business Loans', count: 2, outstanding: 95000, color: C.emerald, icon: <Landmark size={20} /> },
    { label: 'Short-Term Loans', count: 14, outstanding: 420000, color: C.amber, icon: <Clock size={20} /> },
    { label: 'Long-Term Loans', count: 7, outstanding: 800000, color: C.gray, icon: <Layers size={20} /> },
  ],
  healthIndicators: [
    { label: 'No Critical Overdue Loans (>90 Days)', status: 'warning', ok: false },
    { label: 'Interest Accrual Updated for All Loans', status: 'ok', ok: true },
    { label: 'Collections On Track (>80% Repayment Rate)', status: 'ok', ok: true },
    { label: 'Repayment Schedules All Active', status: 'ok', ok: true },
    { label: 'No Missing Loan Agreement Documents', status: 'warning', ok: false },
  ],
  accrualSummary: {
    today: 2150,
    thisMonth: 68500,
    financialYear: 142000,
    totalOutstanding: 68500,
  },
  timeline: [
    { id: 1, type: 'issued', title: 'New Loan Issued — Kishan General Stores (₹75,000)', time: '2 hours ago', ref: 'LN-2026-088', amount: 75000 },
    { id: 2, type: 'repaid', title: 'Loan Repayment Received — Metro Retailers (₹45,000)', time: '5 hours ago', ref: 'LRP-2026-062', amount: 45000 },
    { id: 3, type: 'interest', title: 'Interest Posted for July 2026 — All Active Loans', time: '1 day ago', ref: 'INT-2026-07', amount: 14400 },
    { id: 4, type: 'closed', title: 'Loan Closed — Royal Supermarket (₹1,20,000 settled)', time: '3 days ago', ref: 'LN-2026-071', amount: 120000 },
    { id: 5, type: 'penalty', title: 'Late Penalty Applied — Apex Traders (₹850 penalty)', time: '4 days ago', ref: 'PEN-2026-009', amount: 850 },
  ],
};

export default function LoansDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [dateFilter, setDateFilter] = useState<'Today' | 'This Week' | 'This Month' | 'Quarter' | 'Financial Year'>('This Month');
  const [cashflowTimeframe, setCashflowTimeframe] = useState<'Daily' | 'Monthly' | 'Quarterly'>('Monthly');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [paymentAmt, setPaymentAmt] = useState('');
  const [newLoanOpen, setNewLoanOpen] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    loanType: 'All Types',
    category: 'All Categories',
    status: 'All Statuses',
  });

  const { data: loanData, refetch } = useQuery({
    queryKey: ['loansDashboardData', activeBusiness?.id, dateFilter],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data } = await supabase.from('loans').select('*').eq('business_id', activeBusiness.id);
          if (data && data.length > 0) return { ...MOCK, kpis: { ...MOCK.kpis } };
        }
      } catch (e) { console.warn('Using offline loan mock data', e); }
      return MOCK;
    },
    initialData: MOCK,
  });

  const handleRefresh = async () => { setIsRefreshing(true); await refetch(); setTimeout(() => setIsRefreshing(false), 600); };
  const handleRecordPayment = (loan: any) => { setSelectedLoan(loan); setPaymentAmt(''); setRecordPaymentOpen(true); };

  const currentCashflow = loanData.cashflowSeries[cashflowTimeframe];

  // ── EMPTY STATE ─────────────────────────────────────────────────────────
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : C.bg, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" fontWeight={800}>Loan Dashboard</Typography>
          <FormControlLabel
            control={<Switch checked={testEmptyState} onChange={(e) => setTestEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" fontWeight={700}>Empty State Preview</Typography>}
          />
        </Box>
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 4, border: `1px dashed ${theme.palette.divider}`, bgcolor: isDark ? '#1E293B' : 'white', maxWidth: 560, mx: 'auto', mt: 6 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: alpha(C.green, 0.1), color: C.green, mx: 'auto', mb: 3 }}>
            <Landmark size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>No Loans Available</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 380, mx: 'auto' }}>
            Loans issued or borrowed will appear here with repayment schedules, interest accrual tracking, and overdue monitoring.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setNewLoanOpen(true)} sx={{ bgcolor: C.green, px: 3, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>
              Create First Loan
            </Button>
            <Button variant="outlined" onClick={() => setTestEmptyState(false)} sx={{ px: 3, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}>
              Load Demo Data
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ── MAIN DASHBOARD ───────────────────────────────────────────────────────
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: isDark ? '#0F172A' : C.bg, minHeight: '100vh', pb: 14 }}>

      {/* ── TOP APP BAR ─────────────────────────────────────────────────── */}
      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" color="text.primary">
            Loan Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Lending & Borrowing Command Center • {dayjs().format('dddd, MMMM D, YYYY')} • FY 2026-27
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Date Filter Chips */}
          <Stack direction="row" spacing={0.5}>
            {(['Today', 'This Week', 'This Month', 'Quarter', 'Financial Year'] as const).map((df) => (
              <Chip
                key={df}
                label={df}
                size="small"
                onClick={() => setDateFilter(df)}
                sx={{
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  bgcolor: dateFilter === df ? C.green : (isDark ? '#1E293B' : 'white'),
                  color: dateFilter === df ? 'white' : 'text.secondary',
                  border: `1px solid ${dateFilter === df ? C.green : theme.palette.divider}`,
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>

          {/* Search */}
          <Paper elevation={0} sx={{ p: '2px 8px', display: 'flex', alignItems: 'center', width: 220, border: `1px solid ${theme.palette.divider}`, borderRadius: 3, bgcolor: isDark ? '#1E293B' : 'white' }}>
            <Search size={16} color={C.gray} />
            <InputBase sx={{ ml: 1, flex: 1, fontSize: '0.85rem' }} placeholder="Search loans, borrowers…" />
          </Paper>

          {/* Filter Trigger */}
          <Button variant="outlined" onClick={() => setFilterDrawerOpen(true)} startIcon={<Filter size={18} />}
            sx={{ borderRadius: 3, borderColor: theme.palette.divider, color: 'text.primary', bgcolor: isDark ? '#1E293B' : 'white', textTransform: 'none', fontWeight: 600, height: 40 }}>
            Filters
          </Button>

          {/* Refresh */}
          <Tooltip title="Recalculate Loan Metrics">
            <IconButton onClick={handleRefresh} sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
              <RefreshCw size={18} />
            </IconButton>
          </Tooltip>

          {/* Bell */}
          <IconButton sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
            <Badge badgeContent={6} color="error"><Bell size={18} /></Badge>
          </IconButton>

          {/* Empty Toggle */}
          <FormControlLabel
            control={<Switch size="small" checked={testEmptyState} onChange={(e) => setTestEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" color="text.secondary">Empty Demo</Typography>}
          />
        </Stack>
      </Box>

      {/* ── 6 HERO KPI CARDS ────────────────────────────────────────────── */}
      <Grid container spacing={2.5} mb={3}>
        {[
          {
            title: 'Total Loans Given', color: C.green, icon: <TrendingUp size={22} />,
            main: formatCurrency(loanData.kpis.loansGivenTotal),
            sub: `Outstanding: ${formatCurrency(loanData.kpis.loansGivenOutstanding)}`,
            chip: 'Receivable Asset',
          },
          {
            title: 'Total Loans Taken', color: C.orange, icon: <TrendingDown size={22} />,
            main: formatCurrency(loanData.kpis.loansTakenTotal),
            sub: `Outstanding: ${formatCurrency(loanData.kpis.loansTakenOutstanding)}`,
            chip: 'Payable Liability',
          },
          {
            title: 'Interest Receivable', color: C.emerald, icon: <Percent size={22} />,
            main: formatCurrency(loanData.kpis.interestReceivable),
            sub: `Accrued on Loans Given • ${dateFilter}`,
            chip: 'Income Earned',
          },
          {
            title: 'Interest Payable', color: C.red, icon: <AlertTriangle size={22} />,
            main: formatCurrency(loanData.kpis.interestPayable),
            sub: `Owed on Loans Taken • ${dateFilter}`,
            chip: 'Cost Liability',
          },
          {
            title: "Today's Collections", color: C.blue, icon: <Banknote size={22} />,
            main: formatCurrency(loanData.kpis.todayCollections),
            sub: 'Repayments received today',
            chip: 'Cash Inflow',
          },
          {
            title: "Today's Payments", color: C.purple, icon: <CreditCard size={22} />,
            main: formatCurrency(loanData.kpis.todayPayments),
            sub: 'Repayments made today',
            chip: 'Cash Outflow',
          },
        ].map((card, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={2} key={idx}>
            <MotionCard whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
              sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: `1px solid ${alpha(card.color, 0.25)}`, bgcolor: isDark ? '#1E293B' : 'white' }}>
              <CardContent sx={{ pb: '12px !important' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.4} lineHeight={1.3}>
                    {card.title}
                  </Typography>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(card.color, 0.12), color: card.color }}>
                    {card.icon}
                  </Avatar>
                </Box>
                <Typography variant="h6" fontWeight={800} color={card.color}>{card.main}</Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>{card.sub}</Typography>
                <Chip size="small" label={card.chip} sx={{ mt: 1, height: 20, fontSize: '0.62rem', fontWeight: 700, bgcolor: alpha(card.color, 0.1), color: card.color }} />
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* ── NET LOAN POSITION + PORTFOLIO DONUT ─────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Net Loan Position */}
        <Grid item xs={12} md={4}>
          <MotionCard whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
            sx={{ borderRadius: 4, height: '100%', border: `2px solid ${alpha(C.green, 0.4)}`, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 8px 32px rgba(46,125,50,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} mb={3} color="text.primary">Net Loan Position</Typography>

              <Stack spacing={1.5}>
                {[
                  { label: 'Loans Given (Outstanding)', value: loanData.kpis.loansGivenOutstanding, color: C.green },
                  { label: 'Loans Taken (Outstanding)', value: -loanData.kpis.loansTakenOutstanding, color: C.orange },
                ].map((row) => (
                  <Box key={row.label} display="flex" justifyContent="space-between" alignItems="center" p={1.5} borderRadius={2}
                    bgcolor={alpha(row.color, 0.06)} border={`1px solid ${alpha(row.color, 0.2)}`}>
                    <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
                    <Typography variant="body2" fontWeight={800} color={row.color}>
                      {row.value < 0 ? `−${formatCurrency(Math.abs(row.value))}` : formatCurrency(row.value)}
                    </Typography>
                  </Box>
                ))}

                <Divider />

                <Box p={2} borderRadius={3} bgcolor={alpha(C.green, 0.08)} border={`2px solid ${C.green}`} textAlign="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">Net Loan Position (Asset)</Typography>
                  <Typography variant="h4" fontWeight={900} color={C.green} mt={0.5}>
                    +{formatCurrency(loanData.kpis.netLoanPosition)}
                  </Typography>
                  <Chip label="Positive Position ✓" size="small" sx={{ mt: 1, bgcolor: alpha(C.green, 0.15), color: C.green, fontWeight: 800 }} />
                </Box>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Portfolio Distribution Donut */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 4, height: '100%', bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>Loan Portfolio Distribution</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>
              Outstanding balance split by loan category
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={loanData.portfolioDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value" paddingAngle={3}>
                      {loanData.portfolioDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Stack spacing={1.2}>
                  {loanData.portfolioDistribution.filter(p => p.value > 0).map((p, i) => (
                    <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box width={10} height={10} borderRadius="50%" bgcolor={p.color} />
                        <Typography variant="caption" fontWeight={600}>{p.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={800} color={p.color}>{formatCurrency(p.value)}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* ── QUICK ACTIONS BAR ───────────────────────────────────────────── */}
      <Paper sx={{ p: 2.5, mb: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2}>Quick Loan Operations</Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'New Loan', icon: <Plus size={20} />, color: C.green, action: () => setNewLoanOpen(true) },
            { label: 'Receive Repayment', icon: <Banknote size={20} />, color: C.blue, action: () => setRecordPaymentOpen(true) },
            { label: 'Make Payment', icon: <CreditCard size={20} />, color: C.orange, action: () => {} },
            { label: 'Calculate Interest', icon: <Percent size={20} />, color: C.emerald, action: () => {} },
            { label: 'Loan Statement', icon: <FileText size={20} />, color: C.gray, action: () => {} },
            { label: 'Loan Register', icon: <BookOpen size={20} />, color: C.purple, action: () => {} },
            { label: 'Interest Posting', icon: <RotateCcw size={20} />, color: C.amber, action: () => {} },
            { label: 'Close Loan', icon: <CheckCircle2 size={20} />, color: C.blue, action: () => {} },
            { label: 'Loan Reports', icon: <BarChart2 size={20} />, color: C.red, action: () => {} },
          ].map((a, i) => (
            <Grid item xs={6} sm={4} md={1.33} key={i}>
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

      {/* ── CASH FLOW CHART + INTEREST SUMMARY ──────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Cash Flow Line Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 400, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Loan Cash Flow — Issued vs Repayments</Typography>
                <Typography variant="caption" color="text.secondary">Track loan disbursements vs collections and interest flows</Typography>
              </Box>
              <Stack direction="row" bgcolor={isDark ? '#0F172A' : C.bg} p={0.5} borderRadius={2.5}>
                {(['Daily', 'Monthly', 'Quarterly'] as const).map((tf) => (
                  <Button key={tf} size="small" onClick={() => setCashflowTimeframe(tf)}
                    sx={{ px: 1.2, py: 0.5, borderRadius: 2, fontSize: '0.75rem', fontWeight: 700,
                      bgcolor: cashflowTimeframe === tf ? (isDark ? '#334155' : 'white') : 'transparent',
                      color: cashflowTimeframe === tf ? 'text.primary' : 'text.secondary' }}>
                    {tf}
                  </Button>
                ))}
              </Stack>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={currentCashflow} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="greenLine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={C.green} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={C.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: C.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: C.gray }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" name="Loans Issued" dataKey="issued" stroke={C.green} strokeWidth={3} dot={{ r: 4, fill: C.green }} />
                <Line type="monotone" name="Repayments" dataKey="repayments" stroke={C.blue} strokeWidth={3} dot={{ r: 4, fill: C.blue }} />
                <Line type="monotone" name="Interest Earned" dataKey="intEarned" stroke={C.emerald} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
                <Line type="monotone" name="Interest Paid" dataKey="intPaid" stroke={C.red} strokeWidth={2} strokeDasharray="5 3" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Interest Summary + Repayment Performance */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5} height="100%">
            {/* Interest Summary */}
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <Typography variant="h6" fontWeight={800} mb={2}>Interest Summary</Typography>
              {[
                { label: 'Total Interest Earned', value: loanData.kpis.totalInterestEarned, color: C.emerald },
                { label: 'Total Interest Paid', value: loanData.kpis.totalInterestPaid, color: C.red },
                { label: 'Net Interest Income', value: loanData.kpis.netInterestIncome, color: C.green },
              ].map((row) => (
                <Box key={row.label} display="flex" justifyContent="space-between" alignItems="center" py={1} borderBottom={`1px solid ${theme.palette.divider}`}>
                  <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
                  <Typography variant="body2" fontWeight={800} color={row.color}>{formatCurrency(row.value)}</Typography>
                </Box>
              ))}
              <Box display="flex" justifyContent="space-between" alignItems="center" pt={1}>
                <Typography variant="body2" fontWeight={600}>Avg Interest Rate</Typography>
                <Typography variant="body2" fontWeight={800} color={C.blue}>{loanData.kpis.avgInterestRate}% p.a.</Typography>
              </Box>
            </Paper>

            {/* Repayment Performance */}
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flex: 1 }}>
              <Typography variant="h6" fontWeight={800} mb={2}>Repayment Performance</Typography>
              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={0.5}>
                  <Typography variant="caption" fontWeight={600}>Overall Repayment Rate</Typography>
                  <Typography variant="caption" fontWeight={800} color={C.green}>{loanData.kpis.repaymentPct}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={loanData.kpis.repaymentPct}
                  sx={{ height: 8, borderRadius: 4, bgcolor: alpha(C.green, 0.12), '& .MuiLinearProgress-bar': { bgcolor: C.green, borderRadius: 4 } }} />
              </Box>
              {[
                { label: 'On-Time Payments', count: loanData.kpis.onTimePayments, color: C.green },
                { label: 'Late Payments', count: loanData.kpis.latePayments, color: C.amber },
                { label: 'Missed Payments', count: loanData.kpis.missedPayments, color: C.red },
                { label: 'Overdue Loans', count: loanData.kpis.overdueLoansCount, color: C.red },
              ].map((row) => (
                <Box key={row.label} display="flex" justifyContent="space-between" alignItems="center" py={0.8}>
                  <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
                  <Chip size="small" label={row.count} sx={{ bgcolor: alpha(row.color, 0.12), color: row.color, fontWeight: 800, height: 22 }} />
                </Box>
              ))}
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* ── UPCOMING DUE + OVERDUE LOANS ────────────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Upcoming Due Payments */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Clock size={20} color={C.blue} />
              <Typography variant="h6" fontWeight={800}>Upcoming Loan Due Payments</Typography>
            </Box>
            <Stack spacing={2}>
              {loanData.upcomingDue.map((due) => (
                <Box key={due.id} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : C.bg} border={`1px solid ${theme.palette.divider}`}
                  display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={800}>{due.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Due: {due.dueDate} •
                      <span style={{ color: due.daysLeft <= 3 ? C.red : C.amber, fontWeight: 700 }}> {due.daysLeft} days left</span>
                    </Typography>
                    <Chip size="small" label={due.type} sx={{ mt: 0.5, height: 18, fontSize: '0.6rem', bgcolor: alpha(C.blue, 0.1), color: C.blue, fontWeight: 700 }} />
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="subtitle2" fontWeight={800} color={C.blue}>{formatCurrency(due.amount)}</Typography>
                    <Button size="small" variant="contained" onClick={() => handleRecordPayment(due)}
                      sx={{ mt: 0.5, bgcolor: C.green, fontSize: '0.68rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                      Record
                    </Button>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Overdue Loans */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: `1px solid ${alpha(C.red, 0.2)}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <AlertTriangle size={20} color={C.red} />
                <Typography variant="h6" fontWeight={800} color={C.red}>Overdue Loans</Typography>
              </Box>
              <Chip label={`${loanData.overdueLoans.length} Overdue`} size="small" sx={{ bgcolor: alpha(C.red, 0.12), color: C.red, fontWeight: 800 }} />
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell>Borrower</TableCell>
                    <TableCell align="right">Outstanding</TableCell>
                    <TableCell align="center">Days Overdue</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loanData.overdueLoans.map((od, i) => (
                    <TableRow key={i} hover sx={{ bgcolor: alpha(C.red, 0.02) }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>{od.borrower}</Typography>
                        <Typography variant="caption" color="text.secondary">Interest Due: {formatCurrency(od.interestDue)}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: C.red }}>{formatCurrency(od.outstanding)}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${od.daysOverdue}d`} size="small" sx={{ bgcolor: alpha(C.red, 0.15), color: C.red, fontWeight: 800, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell align="center">
                        <Button size="small" variant="contained" onClick={() => handleRecordPayment(od)}
                          sx={{ bgcolor: C.orange, fontSize: '0.68rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
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

      {/* ── MONTHLY TREND + LOAN STATUS + AGING ─────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Monthly Trend BarChart */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={0.5}>12-Month Loan Trend</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mb={2}>Loans Given vs Recovered vs Interest Collected</Typography>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={loanData.monthlyTrend} margin={{ top: 5, right: 5, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: C.gray }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="given" name="Loans Given" fill={C.green} radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="recovered" name="Recovered" fill={C.blue} radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="interest" name="Interest Collected" fill={C.emerald} radius={[4, 4, 0, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Loan Status Pie + Aging Table */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={2.5} height="100%">
            {/* Status Donut */}
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              <Typography variant="h6" fontWeight={800} mb={1}>Loan Status Distribution</Typography>
              <Box display="flex" alignItems="center" gap={3}>
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={loanData.loanStatusDist} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                      {loanData.loanStatusDist.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Stack spacing={0.8} flex={1}>
                  {loanData.loanStatusDist.map((s, i) => (
                    <Box key={i} display="flex" justifyContent="space-between">
                      <Box display="flex" alignItems="center" gap={0.8}>
                        <Box width={8} height={8} borderRadius="50%" bgcolor={s.color} />
                        <Typography variant="caption" fontWeight={600}>{s.name}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={800}>{s.value} Loans</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>

            {/* Aging Buckets */}
            <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flex: 1 }}>
              <Typography variant="h6" fontWeight={800} mb={1.5}>Loan Aging Analysis</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', fontSize: '0.72rem' } }}>
                      <TableCell>Aging Bucket</TableCell>
                      <TableCell align="center">Count</TableCell>
                      <TableCell align="right">Outstanding</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loanData.agingBuckets.map((b, i) => (
                      <TableRow key={i} hover>
                        <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{b.range}</TableCell>
                        <TableCell align="center"><Chip label={b.count} size="small" sx={{ height: 20, fontWeight: 800 }} /></TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.8rem', color: i >= 3 ? C.red : i >= 1 ? C.amber : 'text.primary' }}>
                          {formatCurrency(b.outstanding)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* ── LOAN CATEGORY CARDS ─────────────────────────────────────────── */}
      <Typography variant="h6" fontWeight={800} mb={2}>Loan Categories</Typography>
      <Grid container spacing={2} mb={3}>
        {loanData.loanCategories.map((cat, i) => (
          <Grid item xs={6} sm={4} md={3} lg={12 / 7} key={i}>
            <MotionPaper whileHover={{ y: -3 }} transition={{ duration: 0.2 }}
              sx={{ p: 2, borderRadius: 3, bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${alpha(cat.color, 0.25)}`, cursor: 'pointer', height: '100%' }}>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Box color={cat.color}>{cat.icon}</Box>
                <Typography variant="caption" fontWeight={700} lineHeight={1.2}>{cat.label}</Typography>
              </Box>
              <Typography variant="h6" fontWeight={800} color={cat.color}>{cat.count}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">Loans</Typography>
              <Typography variant="caption" fontWeight={700} color="text.primary">{formatCurrency(cat.outstanding)}</Typography>
            </MotionPaper>
          </Grid>
        ))}
      </Grid>

      {/* ── INTEREST ACCRUAL + HEALTH INDICATORS ────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Interest Accrual Summary */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>Interest Accrual Summary</Typography>
            {[
              { label: 'Accrued Today', value: loanData.accrualSummary.today },
              { label: 'Accrued This Month', value: loanData.accrualSummary.thisMonth },
              { label: 'Accrued This Financial Year', value: loanData.accrualSummary.financialYear },
              { label: 'Total Outstanding Interest', value: loanData.accrualSummary.totalOutstanding },
            ].map((row) => (
              <Box key={row.label} display="flex" justifyContent="space-between" py={1.2} borderBottom={`1px solid ${theme.palette.divider}`}>
                <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
                <Typography variant="body2" fontWeight={800} color={C.emerald}>{formatCurrency(row.value)}</Typography>
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Loan Health Indicators */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>Loan Health Indicators</Typography>
            <Stack spacing={1.5}>
              {loanData.healthIndicators.map((hi, i) => (
                <Box key={i} p={1.5} borderRadius={3} display="flex" alignItems="center" gap={2}
                  bgcolor={hi.ok ? alpha(C.green, 0.06) : alpha(C.amber, 0.08)}
                  border={`1px solid ${hi.ok ? alpha(C.green, 0.2) : alpha(C.amber, 0.25)}`}>
                  {hi.ok
                    ? <CheckCircle2 size={20} color={C.green} />
                    : <AlertCircle size={20} color={C.amber} />}
                  <Typography variant="body2" fontWeight={600}>{hi.label}</Typography>
                  <Box ml="auto">
                    <Chip size="small" label={hi.ok ? 'OK' : 'Action Needed'}
                      sx={{ bgcolor: hi.ok ? alpha(C.green, 0.15) : alpha(C.amber, 0.2), color: hi.ok ? C.green : C.amber, fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ── ACTIVITY TIMELINE + SMART INSIGHTS ──────────────────────────── */}
      <Grid container spacing={3} mb={3}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Loan Activity Timeline</Typography>
            </Box>
            <Stack spacing={2.5}>
              {loanData.timeline.map((item) => {
                const colors: Record<string, string> = { issued: C.green, repaid: C.blue, interest: C.emerald, closed: C.gray, penalty: C.red };
                const icons: Record<string, React.ReactNode> = {
                  issued: <Landmark size={18} />, repaid: <Banknote size={18} />,
                  interest: <Percent size={18} />, closed: <CheckCircle2 size={18} />, penalty: <AlertTriangle size={18} />,
                };
                const c = colors[item.type] || C.gray;
                return (
                  <Box key={item.id} display="flex" gap={2} alignItems="center">
                    <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(c, 0.12), color: c }}>
                      {icons[item.type]}
                    </Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Ref: {item.ref} • {item.time} • {formatCurrency(item.amount)}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        {/* Smart Insights */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>Smart Loan Business Insights</Typography>
            <Stack spacing={2}>
              {[
                { text: `Net loan position is +${formatCurrency(loanData.kpis.netLoanPosition)} — you are a net lender.`, type: 'info' },
                { text: `₹${formatCurrency(loanData.kpis.interestReceivable)} interest receivable. Post to P&L for accurate reporting.`, type: 'info' },
                { text: `${loanData.kpis.overdueLoansCount} loans are overdue. Immediate collection follow-up required.`, type: 'alert' },
                { text: `Repayment rate is ${loanData.kpis.repaymentPct}% — above 80% threshold. Portfolio is healthy.`, type: 'info' },
              ].map((ins, i) => (
                <Box key={i} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : C.bg} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Lightbulb size={18} color={ins.type === 'alert' ? C.red : C.blue} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">Loan Analytics</Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>{ins.text}</Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* ── FILTER DRAWER ───────────────────────────────────────────────── */}
      <Drawer anchor="right" open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, p: 3, bgcolor: isDark ? '#1E293B' : 'white' } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={800}>Loan Filters</Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}><X size={20} /></IconButton>
        </Box>
        <Stack spacing={2.5}>
          {[
            { label: 'Loan Type', key: 'loanType', options: ['All Types', 'Loans Given', 'Loans Taken'] },
            { label: 'Category', key: 'category', options: ['All Categories', 'Customer Loans', 'Supplier Loans', 'Employee Advances', 'Personal Loans', 'Business Loans'] },
            { label: 'Status', key: 'status', options: ['All Statuses', 'Active', 'Overdue', 'Partially Paid', 'Closed', 'Written Off'] },
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
          <Button variant="outlined" fullWidth onClick={() => setFilters({ loanType: 'All Types', category: 'All Categories', status: 'All Statuses' })}
            sx={{ textTransform: 'none', borderRadius: 2 }}>Reset</Button>
          <Button variant="contained" fullWidth onClick={() => setFilterDrawerOpen(false)}
            sx={{ bgcolor: C.green, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}>Apply</Button>
        </Box>
      </Drawer>

      {/* ── RECORD PAYMENT DIALOG ───────────────────────────────────────── */}
      <Dialog open={recordPaymentOpen} onClose={() => setRecordPaymentOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Record Loan Repayment</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} py={1}>
            {selectedLoan && (
              <Box p={1.5} borderRadius={2} bgcolor={alpha(C.green, 0.08)}>
                <Typography variant="caption" color="text.secondary">Borrower / Account</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedLoan.name || selectedLoan.borrower}</Typography>
              </Box>
            )}
            <TextField label="Repayment Amount (₹)" fullWidth size="small" value={paymentAmt} onChange={(e) => setPaymentAmt(e.target.value)} />
            <TextField label="Payment Date" fullWidth size="small" type="date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} />
            <TextField label="Reference / Cheque No." fullWidth size="small" placeholder="e.g. UPI-TXN-8842" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRecordPaymentOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => setRecordPaymentOpen(false)}
            sx={{ bgcolor: C.green, textTransform: 'none', fontWeight: 700 }}>Confirm Repayment</Button>
        </DialogActions>
      </Dialog>

      {/* ── NEW LOAN DIALOG ─────────────────────────────────────────────── */}
      <Dialog open={newLoanOpen} onClose={() => setNewLoanOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Issue New Loan</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} py={1}>
            <FormControl fullWidth size="small">
              <InputLabel>Loan Type</InputLabel>
              <Select defaultValue="Loans Given" label="Loan Type">
                <MenuItem value="Loans Given">Loan Given (Receivable)</MenuItem>
                <MenuItem value="Loans Taken">Loan Taken (Payable)</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select defaultValue="Customer Loans" label="Category">
                <MenuItem value="Customer Loans">Customer Loan</MenuItem>
                <MenuItem value="Supplier Loans">Supplier Loan</MenuItem>
                <MenuItem value="Employee Advances">Employee Advance</MenuItem>
                <MenuItem value="Personal Loans">Personal Loan</MenuItem>
                <MenuItem value="Business Loans">Business Loan</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Borrower / Lender Name" fullWidth size="small" placeholder="e.g. Metro Retailers Pvt Ltd" />
            <TextField label="Principal Amount (₹)" fullWidth size="small" placeholder="e.g. 100000" />
            <TextField label="Interest Rate (% p.a.)" fullWidth size="small" placeholder="e.g. 12" />
            <TextField label="Loan Start Date" fullWidth size="small" type="date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setNewLoanOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={() => setNewLoanOpen(false)}
            sx={{ bgcolor: C.green, textTransform: 'none', fontWeight: 700 }}>Issue Loan</Button>
        </DialogActions>
      </Dialog>

      {/* ── SPEED DIAL FAB ──────────────────────────────────────────────── */}
      <SpeedDial ariaLabel="Loan Quick Actions" sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{ sx: { bgcolor: C.green, '&:hover': { bgcolor: alpha(C.green, 0.9) }, boxShadow: '0 8px 24px rgba(46,125,50,0.35)' } }}>
        <SpeedDialAction icon={<Landmark size={18} />} tooltipTitle="Issue Loan" onClick={() => setNewLoanOpen(true)} />
        <SpeedDialAction icon={<Banknote size={18} />} tooltipTitle="Record Repayment" onClick={() => setRecordPaymentOpen(true)} />
        <SpeedDialAction icon={<Percent size={18} />} tooltipTitle="Post Interest" onClick={() => {}} />
        <SpeedDialAction icon={<CheckCircle2 size={18} />} tooltipTitle="Close Loan" onClick={() => {}} />
        <SpeedDialAction icon={<Download size={18} />} tooltipTitle="Export Statement" onClick={() => {}} />
      </SpeedDial>
    </Box>
  );
}
