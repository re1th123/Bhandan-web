import React, { useState, lazy, Suspense } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  alpha,
  useTheme,
  LinearProgress,
  Stack,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  YAxis as RechartsYAxis,
  XAxis as RechartsXAxis,
} from 'recharts';
import {
  IndianRupee,
  TrendingUp,
  Activity,
  Landmark,
  Plus,
  FileText,
} from 'lucide-react';
import dayjs from 'dayjs';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const ExpensesDashboardPage = lazy(() => import('./ExpensesDashboardPage').catch(() => ({ default: () => <Box p={3}>Expenses Module (Not Found)</Box> })));
const LoansDashboardPage = lazy(() => import('./LoansDashboardPage').catch(() => ({ default: () => <Box p={3}>Loans Module (Not Found)</Box> })));
const ChartOfAccountsPage = lazy(() => import('./ChartOfAccountsPage').catch(() => ({ default: () => <Box p={3}>Chart of Accounts Module (Not Found)</Box> })));
const JournalEntriesPage = lazy(() => import('./JournalEntriesPage').catch(() => ({ default: () => <Box p={3}>Journal Entries Module (Not Found)</Box> })));
const BankAccountsPage = lazy(() => import('./BankAccountsPage').catch(() => ({ default: () => <Box p={3}>Bank Accounts Module (Not Found)</Box> })));
const OpeningBalancesPage = lazy(() => import('./OpeningBalancesPage').catch(() => ({ default: () => <Box p={3}>Opening Balances Module (Not Found)</Box> })));

const MotionCard = motion.create(Card);

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const COLORS = {
  green: '#43A047',
  blue: '#1976D2',
  orange: '#FB8C00',
  red: '#E53935',
  purple: '#8E24AA',
  teal: '#00897B',
};

const cashFlowData = [
  { month: 'Apr', inflow: 3200000, outflow: 2100000 },
  { month: 'May', inflow: 2800000, outflow: 2300000 },
  { month: 'Jun', inflow: 3500000, outflow: 2200000 },
  { month: 'Jul', inflow: 3900000, outflow: 2500000 },
  { month: 'Aug', inflow: 4100000, outflow: 2800000 },
  { month: 'Sep', inflow: 4500000, outflow: 3000000 },
  { month: 'Oct', inflow: 4800000, outflow: 3200000 },
  { month: 'Nov', inflow: 5200000, outflow: 3500000 },
  { month: 'Dec', inflow: 4900000, outflow: 3800000 },
  { month: 'Jan', inflow: 5100000, outflow: 3600000 },
  { month: 'Feb', inflow: 5500000, outflow: 4000000 },
  { month: 'Mar', inflow: 6000000, outflow: 4200000 },
];

const expenseAllocationData = [
  { name: 'Salaries & Wages', value: 820000, color: COLORS.blue },
  { name: 'Raw Materials', value: 450000, color: COLORS.green },
  { name: 'Rent & Utilities', value: 280000, color: COLORS.orange },
  { name: 'Marketing', value: 160000, color: COLORS.purple },
  { name: 'Logistics', value: 130000, color: COLORS.red },
];

const bankAccountsData = [
  { name: 'HDFC Current A/C', balance: 2240000, primary: true },
  { name: 'ICICI Savings A/C', balance: 1580000, primary: false },
  { name: 'SBI Business A/C', balance: 700000, primary: false },
];

const loansData = [
  { name: 'Business Term Loan', balance: 1800000, total: 2500000 },
  { name: 'Working Capital', balance: 1050000, total: 1500000 },
  { name: 'Equipment Finance', balance: 400000, total: 800000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 1.5,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 1,
        }}
      >
        <Typography variant="body2" fontWeight="bold" mb={1}>
          {label}
        </Typography>
        {payload.map((entry: any, index: number) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: entry.color }}>
              {entry.name}
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatCurrency(entry.value)}
            </Typography>
          </Box>
        ))}
      </Box>
    );
  }
  return null;
};

export default function FinanceDashboardPage() {
  const theme = useTheme();
  const activeBusiness = useAuthStore((s) => s.activeBusiness);
  const bizId = activeBusiness?.id;
  const [activeTab, setActiveTab] = useState(0);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['financeDashboard', bizId],
    queryFn: async () => {
      // Mocked data since we're setting up the structure first.
      return { loaded: true };
    },
    enabled: !!bizId,
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const currentDate = dayjs().format('DD MMM YYYY');
  const totalBankBalance = 4520000; // Mocked

  const renderOverview = () => (
    <Box sx={{ p: 3, pt: 4 }}>
      {/* KPI Cards Row */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            title: 'NET CASH FLOW',
            value: '₹24.8L',
            change: '+8.6%',
            subtitle: 'Operating cash flow MTD',
            icon: IndianRupee,
            color: COLORS.green,
            positive: true,
          },
          {
            title: 'WORKING CAPITAL RATIO',
            value: '1.8x',
            change: '',
            subtitle: 'Healthy range: >1.5x',
            subinfo: 'Current Assets / Current Liab.',
            icon: Activity,
            color: COLORS.blue,
          },
          {
            title: 'TOTAL BANK BALANCE',
            value: '₹45.2L',
            change: '',
            subtitle: 'Across 3 active accounts',
            icon: Landmark,
            color: COLORS.purple,
          },
          {
            title: 'OPERATING EXPENSES (MTD)',
            value: '₹18.4L',
            change: '+3.2%',
            subtitle: 'vs ₹17.8L last month',
            icon: TrendingUp,
            color: COLORS.orange,
            positive: false,
          },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight="bold">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" sx={{ my: 0.5 }}>
                      {kpi.value}
                    </Typography>
                    {kpi.change && (
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        sx={{ color: kpi.positive ? COLORS.green : COLORS.red }}
                      >
                        {kpi.change}
                        {kpi.positive ? ' increase' : ' increase'}
                      </Typography>
                    )}
                  </Box>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(kpi.color, 0.1),
                      color: kpi.color,
                    }}
                  >
                    <kpi.icon size={24} />
                  </Box>
                </Box>
                {kpi.subinfo && (
                  <Typography variant="body2" color="text.secondary" mb={0.5}>
                    {kpi.subinfo}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {kpi.subtitle}
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        ))}
      </Grid>

      {/* Middle Section: Cash Flow & Bank Accounts */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Cash Flow & Liquidity Projection
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cashFlowData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.green} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.8} />
                        <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                      tick={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="inflow"
                      name="Cash Inflow"
                      stroke={COLORS.green}
                      fillOpacity={1}
                      fill="url(#colorInflow)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outflow"
                      name="Cash Outflow"
                      stroke={COLORS.purple}
                      fillOpacity={1}
                      fill="url(#colorOutflow)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Bank Accounts
              </Typography>
              <Stack spacing={3}>
                {bankAccountsData.map((account, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Typography variant="body1" fontWeight="medium">
                          {account.name}
                        </Typography>
                        {account.primary && (
                          <Typography variant="caption" color="primary">
                            Primary Account
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {formatCurrency(account.balance)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(account.balance / totalBankBalance) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: account.primary ? COLORS.green : COLORS.blue,
                        },
                      }}
                    />
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Total Balance
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {formatCurrency(totalBankBalance)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Section: Expenses & Loans */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Expense Category Allocation
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={expenseAllocationData}
                    margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                    <RechartsXAxis type="number" hide />
                    <RechartsYAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: theme.palette.text.secondary }}
                      width={120}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.text.primary, 0.05) }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {expenseAllocationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                Active Loan Obligations
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 4, mb: 4, flexWrap: 'wrap' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Outstanding</Typography>
                  <Typography variant="h5" fontWeight="bold">₹32.5L</Typography>
                  <Typography variant="caption" color="text.secondary">across 3 loans</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Next EMI Due</Typography>
                  <Typography variant="h5" fontWeight="bold" color={COLORS.orange}>₹1.2L</Typography>
                  <Typography variant="caption" color="text.secondary">on 15 Aug</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Monthly EMI Burden</Typography>
                  <Typography variant="h5" fontWeight="bold">₹3.6L</Typography>
                </Box>
              </Box>

              <Stack spacing={2.5}>
                {loansData.map((loan, idx) => (
                  <Box key={idx}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight="medium">{loan.name}</Typography>
                      <Typography variant="body2" fontWeight="bold">{formatCurrency(loan.balance)}</Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={(loan.balance / loan.total) * 100}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.text.primary, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: COLORS.teal,
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Total amount: {formatCurrency(loan.total)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header Section */}
      <Box sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Finance Command Center
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Cash flow analytics, expense tracking, and financial health for FY 2025-26 — {currentDate}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<Plus size={18} />}>
              Record Expense
            </Button>
            <Button variant="outlined" startIcon={<FileText size={18} />}>
              Journal Entry
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Tabs Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              minWidth: 'auto',
              px: 2,
            },
          }}
        >
          <Tab label="Overview" />
          <Tab label="Expenses" />
          <Tab label="Loans" />
          <Tab label="Chart of Accounts" />
          <Tab label="Journal Entries" />
          <Tab label="Bank Accounts" />
          <Tab label="Opening Balances" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Suspense fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        }>
          {activeTab === 0 && renderOverview()}
          {activeTab === 1 && <ExpensesDashboardPage />}
          {activeTab === 2 && <LoansDashboardPage />}
          {activeTab === 3 && <ChartOfAccountsPage />}
          {activeTab === 4 && <JournalEntriesPage />}
          {activeTab === 5 && <BankAccountsPage />}
          {activeTab === 6 && <OpeningBalancesPage />}
        </Suspense>
      </Box>
    </Box>
  );
}
