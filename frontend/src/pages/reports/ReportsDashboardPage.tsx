import React, { useState, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Tabs,
  Tab,
  useTheme,
  alpha,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  BarChart2,
  Receipt,
  Download,
  ShieldCheck,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import dayjs from 'dayjs';

import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';

const MotionCard = motion.create(Card);

const ProfitLossPage = lazy(() => import('./ProfitLossPage'));
const BalanceSheetPage = lazy(() => import('./BalanceSheetPage'));
const TrialBalancePage = lazy(() => import('./TrialBalancePage'));
const GSTDashboardPage = lazy(() => import('./GSTDashboardPage'));
const GSTReportsPage = lazy(() => import('./GSTReportsPage'));

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `reports-tab-${index}`,
    'aria-controls': `reports-tabpanel-${index}`,
  };
}

// Data for P&L Waterfall/Bar Simulation
const plData = [
  { name: 'Revenue', amount: 1500000, color: '#43A047' },
  { name: 'COGS', amount: -600000, color: '#E53935' },
  { name: 'Gross Profit', amount: 900000, color: '#43A047' },
  { name: 'Opex', amount: -400000, color: '#E53935' },
  { name: 'EBITDA', amount: 500000, color: '#1976D2' },
  { name: 'Depreciation', amount: -100000, color: '#E53935' },
  { name: 'Taxes', amount: -100000, color: '#E53935' },
  { name: 'Net Profit', amount: 300000, color: '#1976D2' },
];

export default function ReportsDashboardPage() {
  const theme = useTheme();
  const activeBusiness = useAuthStore((s) => s.activeBusiness);
  const bizId = activeBusiness?.id;
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const currentDate = dayjs().format('MMMM D, YYYY');

  // We could fetch real data here if needed
  const { data: kpiData, isLoading } = useQuery({
    queryKey: ['reportsOverviewKpi', bizId],
    queryFn: async () => {
      // Mocked for the overview since it aggregates complex data
      return {
        netProfitMargin: 18.4,
        netProfitGrowth: 2.1,
        ebitda: 2860000,
        ebitdaGrowth: 6.8,
        totalTaxLiability: 480000,
        outputGST: 820000,
        inputITC: 340000,
        roa: 12.6,
      };
    },
    enabled: !!bizId,
  });

  return (
    <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
            Reports & Analytics Hub
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
            Financial intelligence, compliance tracking, and business insights for FY 2025-26 — {currentDate}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Download />} color="primary">
            Download Monthly Pack
          </Button>
          <Button variant="outlined" startIcon={<ShieldCheck />} color="primary">
            Run GST Audit
          </Button>
        </Stack>
      </Box>

      {/* Top Sub-Navigation Tab Bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" {...a11yProps(0)} sx={{ fontWeight: 600 }} />
          <Tab label="Profit & Loss" {...a11yProps(1)} sx={{ fontWeight: 600 }} />
          <Tab label="Balance Sheet" {...a11yProps(2)} sx={{ fontWeight: 600 }} />
          <Tab label="Trial Balance" {...a11yProps(3)} sx={{ fontWeight: 600 }} />
          <Tab label="GST Intelligence" {...a11yProps(4)} sx={{ fontWeight: 600 }} />
          <Tab label="GST Reports" {...a11yProps(5)} sx={{ fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <CustomTabPanel value={tabValue} index={0}>
        {/* Overview Tab Content */}
        
        {/* KPI Cards Row */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Net Profit Margin */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    NET PROFIT MARGIN
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#43A047', 0.1) }}>
                    <TrendingUp size={20} color="#43A047" />
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {kpiData?.netProfitMargin ?? '18.4'}%
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 500, mb: 0.5 }}>
                  +{kpiData?.netProfitGrowth ?? '2.1'}% improvement
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Revenue minus all expenses
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* EBITDA */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    EBITDA
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#1976D2', 0.1) }}>
                    <BarChart2 size={20} color="#1976D2" />
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {kpiData ? formatCurrency(kpiData.ebitda) : '₹28.6L'}
                </Typography>
                <Typography variant="body2" color="success.main" sx={{ fontWeight: 500, mb: 0.5 }}>
                  +{kpiData?.ebitdaGrowth ?? '6.8'}% growth
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Earnings before interest, taxes, depreciation
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Total Tax Liability */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    TOTAL TAX LIABILITY
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#8E24AA', 0.1) }}>
                    <Receipt size={20} color="#8E24AA" />
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {kpiData ? formatCurrency(kpiData.totalTaxLiability) : '₹4.8L'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Output GST: {kpiData ? formatCurrency(kpiData.outputGST) : '₹8.2L'} | Input ITC: {kpiData ? formatCurrency(kpiData.inputITC) : '₹3.4L'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Current period GST liability
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>

          {/* Return on Assets */}
          <Grid item xs={12} sm={6} md={3}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              sx={{ height: '100%' }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    RETURN ON ASSETS
                  </Typography>
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: alpha('#FB8C00', 0.1) }}>
                    <TrendingUp size={20} color="#FB8C00" />
                  </Box>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {kpiData?.roa ?? '12.6'}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, visibility: 'hidden' }}>
                  Placeholder
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total net income / total assets
                </Typography>
              </CardContent>
            </MotionCard>
          </Grid>
        </Grid>

        {/* Charts Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Consolidated P&L Summary Visualizer */}
          <Grid item xs={12} md={8}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  Consolidated P&L Summary Visualizer
                </Typography>
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={plData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                      <YAxis tickFormatter={(val) => formatCurrency(Math.abs(val))} axisLine={false} tickLine={false} tick={{ fill: theme.palette.text.secondary }} />
                      <Tooltip
                        cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          borderColor: theme.palette.divider,
                          borderRadius: 8,
                          boxShadow: theme.shadows[3],
                        }}
                        formatter={(value: number) => [formatCurrency(Math.abs(value)), value >= 0 ? 'Positive' : 'Reduction']}
                      />
                      <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
                        {plData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* GST Filing Readiness */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  GST Filing Readiness
                </Typography>
                
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>GSTR-1 (Sales)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#43A047' }}>
                      <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>Filed</Typography>
                      <CheckCircle size={18} />
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>GSTR-3B (Summary)</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', color: '#FB8C00' }}>
                      <Typography variant="body2" sx={{ mr: 1, fontWeight: 600 }}>Pending</Typography>
                      <Clock size={18} />
                    </Box>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>GSTR-2B (Purchases)</Typography>
                    <Typography variant="body2" sx={{ color: '#1976D2', fontWeight: 600 }}>
                      Auto-populated
                    </Typography>
                  </Box>
                  
                  <Divider />
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>ITC Reconciliation</Typography>
                    <Typography variant="body2" sx={{ color: '#43A047', fontWeight: 600 }}>
                      94% matched
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.1), borderRadius: 2 }}>
                    <Typography variant="body2" color="warning.dark" sx={{ fontWeight: 600, textAlign: 'center' }}>
                      Next filing deadline: Aug 11, 2026
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
              <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                <Button variant="contained" color="primary" fullWidth size="large">
                  Start Filing
                </Button>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Financial Snapshot Cards */}
        <Grid container spacing={3}>
          {/* Revenue Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Revenue Summary
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹1.50Cr</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">COGS</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹60.00L</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Gross Margin %</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#43A047' }}>60%</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Expense Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Expense Summary
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Operating Expenses</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹40.00L</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Non-Operating</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹20.00L</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹60.00L</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Balance Summary */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Balance Summary
                </Typography>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Assets</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹2.40Cr</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Total Liabilities</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>₹1.10Cr</Typography>
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">Net Worth</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#1976D2' }}>₹1.30Cr</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
          <ProfitLossPage />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={2}>
        <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
          <BalanceSheetPage />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={3}>
        <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
          <TrialBalancePage />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={4}>
        <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
          <GSTDashboardPage />
        </Suspense>
      </CustomTabPanel>
      <CustomTabPanel value={tabValue} index={5}>
        <Suspense fallback={<Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>}>
          <GSTReportsPage />
        </Suspense>
      </CustomTabPanel>
    </Box>
  );
}
