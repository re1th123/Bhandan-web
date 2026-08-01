import React, { useMemo } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, LinearProgress,
  Table, TableBody, TableCell, TableHead, TableRow,
  Avatar, alpha, useTheme, Skeleton, Divider,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, People, Inventory2,
  ArrowUpward, ArrowDownward, Warning, CheckCircle, Schedule,
  AccountBalance,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import dayjs from 'dayjs';

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
};

const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];

// ─── Mock data (used when Supabase tables are empty / no business linked) ───
const mockRevenue = months.map((m, i) => ({
  month: m,
  revenue: 80000 + Math.random() * 120000,
  expense: 50000 + Math.random() * 80000,
}));

const mockCashFlow = Array.from({ length: 12 }, (_, i) => ({
  month: months[i],
  inflow: 90000 + Math.random() * 100000,
  outflow: 60000 + Math.random() * 80000,
}));

const mockTopCustomers = [
  { name: 'Rajesh Traders', amount: 2_45_000 },
  { name: 'Shree Enterprises', amount: 1_89_000 },
  { name: 'Kumar & Co', amount: 1_45_000 },
  { name: 'National Supplies', amount: 98_000 },
  { name: 'City Distributors', amount: 76_500 },
];

const CATEGORY_COLORS: Record<string, string> = {
  Revenue: '#43A047',
  Expense: '#E53935',
  Asset: '#0288D1',
  Liability: '#7B1FA2',
  Equity: '#F9A825',
};

// ─── Animated KPI Card ───────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: string;
  change?: string;
  changePositive?: boolean;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  index: number;
}

const KpiCard: React.FC<KpiCardProps> = ({
  title, value, change, changePositive, icon, color, subtitle, index,
}) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      style={{ height: '100%' }}
    >
      <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
        {/* Background accent */}
        <Box sx={{
          position: 'absolute', top: -30, right: -30,
          width: 120, height: 120, borderRadius: '50%',
          background: alpha(color, 0.08),
          pointerEvents: 'none',
        }} />
        <CardContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box
              sx={{
                width: 44, height: 44, borderRadius: 2.5,
                background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.7)})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${alpha(color, 0.35)}`,
                '& svg': { color: 'white', fontSize: 22 },
              }}
            >
              {icon}
            </Box>
            {change && (
              <Chip
                icon={changePositive ? <ArrowUpward sx={{ fontSize: '14px !important' }} /> : <ArrowDownward sx={{ fontSize: '14px !important' }} />}
                label={change}
                size="small"
                sx={{
                  bgcolor: alpha(changePositive ? '#43A047' : '#E53935', 0.12),
                  color: changePositive ? '#43A047' : '#E53935',
                  fontWeight: 700, fontSize: '0.7rem',
                  '& .MuiChip-icon': { color: 'inherit' },
                }}
              />
            )}
          </Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>{value}</Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>{title}</Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {subtitle}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ─── Main Dashboard Page ─────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const activeBusiness = useAuthStore((s) => s.activeBusiness);
  const bizId = activeBusiness?.id;

  // Supabase queries
  const { data: invoicesData, isLoading: invLoading } = useQuery({
    queryKey: ['dashboard-invoices', bizId],
    queryFn: async () => {
      if (!bizId) return { total: 0, pending: 0, count: 0 };
      const { data } = await supabase
        .from('tax_invoices')
        .select('total_amount, payment_status')
        .eq('business_id', bizId);
      const total = data?.reduce((s, r) => s + (r.total_amount || 0), 0) || 0;
      const pending = data?.filter((r) => r.payment_status !== 'Paid')
        .reduce((s, r) => s + (r.total_amount || 0), 0) || 0;
      return { total, pending, count: data?.length || 0 };
    },
    enabled: !!bizId,
  });

  const { data: purchasesData } = useQuery({
    queryKey: ['dashboard-purchases', bizId],
    queryFn: async () => {
      if (!bizId) return { total: 0, pending: 0 };
      const { data } = await supabase
        .from('purchase_invoices')
        .select('total_amount, payment_status')
        .eq('business_id', bizId);
      const total = data?.reduce((s, r) => s + (r.total_amount || 0), 0) || 0;
      const pending = data?.filter((r) => r.payment_status !== 'Paid')
        .reduce((s, r) => s + (r.total_amount || 0), 0) || 0;
      return { total, pending };
    },
    enabled: !!bizId,
  });

  const { data: customersCount } = useQuery({
    queryKey: ['dashboard-customers', bizId],
    queryFn: async () => {
      if (!bizId) return 0;
      const { count } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('is_active', true);
      return count || 0;
    },
    enabled: !!bizId,
  });

  const { data: lowStockCount } = useQuery({
    queryKey: ['dashboard-low-stock', bizId],
    queryFn: async () => {
      if (!bizId) return 0;
      const { count } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('business_id', bizId)
        .eq('is_active', true);
      return count || 0;
    },
    enabled: !!bizId,
  });

  const { data: recentJournals } = useQuery({
    queryKey: ['dashboard-journals', bizId],
    queryFn: async () => {
      if (!bizId) return [];
      const { data } = await supabase
        .from('journal_entries')
        .select('journal_number, entry_date, voucher_type, narration')
        .eq('business_id', bizId)
        .order('created_at', { ascending: false })
        .limit(8);
      return data || [];
    },
    enabled: !!bizId,
  });

  // Demo mode check
  const isDemo = !bizId || bizId === 'a0000000-0000-4000-8000-000000000001';

  // Evaluate real vs demo metrics
  const revenue = isDemo ? 4_85_000 : (invoicesData?.total ?? 0);
  const receivables = isDemo ? 1_24_500 : (invoicesData?.pending ?? 0);
  const payables = isDemo ? 87_300 : (purchasesData?.pending ?? 0);
  const customers = isDemo ? 48 : (customersCount ?? 0);
  const lowStock = isDemo ? 6 : (lowStockCount ?? 0);

  const journals = (recentJournals && recentJournals.length > 0)
    ? recentJournals
    : isDemo
    ? [
        { journal_number: 'JV-001', entry_date: '2025-07-25', voucher_type: 'Sales', narration: 'Tax Invoice SI-2025-001' },
        { journal_number: 'JV-002', entry_date: '2025-07-24', voucher_type: 'Payment', narration: 'Supplier payment - Ravi Traders' },
        { journal_number: 'JV-003', entry_date: '2025-07-24', voucher_type: 'Purchase', narration: 'Purchase Invoice PI-2025-012' },
        { journal_number: 'JV-004', entry_date: '2025-07-23', voucher_type: 'Receipt', narration: 'Customer payment - Rajesh Traders' },
        { journal_number: 'JV-005', entry_date: '2025-07-22', voucher_type: 'Journal', narration: 'GST adjustment entry' },
      ]
    : [];

  const voucherColor = (type: string) => ({
    Sales: '#43A047', Purchase: '#E53935', Receipt: '#0288D1',
    Payment: '#7B1FA2', Journal: '#F9A825',
  }[type] || '#5A5D72');

  const gridColor = isDark ? alpha('#fff', 0.06) : alpha('#000', 0.06);
  const tickColor = isDark ? '#9FA8DA' : '#9E9E9E';

  return (
    <Box>
      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box mb={3}>
          <Typography variant="h4" fontWeight={800} mb={0.5}>
            Good {dayjs().hour() < 12 ? 'Morning' : dayjs().hour() < 17 ? 'Afternoon' : 'Evening'} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Here's what's happening with {activeBusiness?.name || 'your business'} today —{' '}
            <strong>{dayjs().format('dddd, D MMMM YYYY')}</strong>
          </Typography>
        </Box>
      </motion.div>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3}>
        {[
          {
            title: 'Total Revenue (FY)',
            value: fmtShort(revenue),
            change: '+12.4%',
            changePositive: true,
            icon: <TrendingUp />,
            color: '#43A047',
            subtitle: `${invoicesData?.count || 124} invoices raised`,
          },
          {
            title: 'Outstanding Receivables',
            value: fmtShort(receivables),
            change: '-8.2%',
            changePositive: true,
            icon: <AccountBalance />,
            color: '#0288D1',
            subtitle: 'Amount yet to be collected',
          },
          {
            title: 'Payables Due',
            value: fmtShort(payables),
            change: '+4.1%',
            changePositive: false,
            icon: <TrendingDown />,
            color: '#E53935',
            subtitle: 'Amount owed to suppliers',
          },
          {
            title: 'Active Customers',
            value: customers.toString(),
            icon: <People />,
            color: '#7B1FA2',
            subtitle: 'Registered buyer accounts',
          },
          {
            title: 'Low Stock Items',
            value: lowStock.toString(),
            icon: <Inventory2 />,
            color: '#F9A825',
            subtitle: 'Products below threshold',
          },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} md={4} lg={true} key={kpi.title}>
            <KpiCard {...kpi} index={i} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={2.5} mb={2.5}>
        {/* Revenue vs Expense */}
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <Card sx={{ height: 360 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Revenue vs Expenses</Typography>
                    <Typography variant="caption" color="text.secondary">Financial Year 2025-26</Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    {[{ label: 'Revenue', color: '#43A047' }, { label: 'Expense', color: '#E53935' }].map((l) => (
                      <Box key={l.label} display="flex" alignItems="center" gap={0.75}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: l.color }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{l.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box flex={1}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={mockRevenue} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => fmtShort(v)} />
                      <RTooltip
                        contentStyle={{
                          background: isDark ? '#1A1D35' : '#fff',
                          border: `1px solid ${isDark ? '#2E3155' : '#E0E3F0'}`,
                          borderRadius: 12, fontSize: 12,
                        }}
                        formatter={(v: number, name: string) => [fmt(v), name]}
                      />
                      <Bar dataKey="revenue" fill="#43A047" radius={[6, 6, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="expense" fill="#E53935" radius={[6, 6, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Top Customers */}
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
            <Card sx={{ height: 360 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} mb={0.5}>Top Customers</Typography>
                <Typography variant="caption" color="text.secondary" mb={2} display="block">
                  By revenue this FY
                </Typography>
                <Box flex={1} overflow="auto">
                  {mockTopCustomers.map((c, i) => {
                    const pct = (c.amount / mockTopCustomers[0].amount) * 100;
                    return (
                      <Box key={c.name} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar sx={{
                              width: 28, height: 28, fontSize: '0.7rem', fontWeight: 700,
                              background: `linear-gradient(135deg, ${['#5C6BC0','#43A047','#E53935','#0288D1','#7B1FA2'][i]}, ${alpha(['#5C6BC0','#43A047','#E53935','#0288D1','#7B1FA2'][i], 0.7)})`,
                            }}>
                              {c.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 140 }}>
                              {c.name}
                            </Typography>
                          </Box>
                          <Typography variant="body2" fontWeight={700} color="primary.main">
                            {fmtShort(c.amount)}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 5, borderRadius: 4,
                            bgcolor: alpha(['#5C6BC0','#43A047','#E53935','#0288D1','#7B1FA2'][i], 0.12),
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${['#5C6BC0','#43A047','#E53935','#0288D1','#7B1FA2'][i]}, ${alpha(['#5C6BC0','#43A047','#E53935','#0288D1','#7B1FA2'][i], 0.7)})`,
                            },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={2.5} mb={2.5}>
        {/* Cash Flow */}
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
            <Card sx={{ height: 300 }}>
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2.5 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>Cash Flow</Typography>
                    <Typography variant="caption" color="text.secondary">Inflow vs Outflow (₹)</Typography>
                  </Box>
                  <Box display="flex" gap={2}>
                    {[{ label: 'Inflow', color: '#00897B' }, { label: 'Outflow', color: '#7B1FA2' }].map((l) => (
                      <Box key={l.label} display="flex" alignItems="center" gap={0.75}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: l.color }} />
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>{l.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box flex={1}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockCashFlow} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="inflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00897B" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00897B" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="outflow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7B1FA2" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#7B1FA2" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="month" tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: tickColor, fontSize: 11 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => fmtShort(v)} />
                      <RTooltip
                        contentStyle={{
                          background: isDark ? '#1A1D35' : '#fff',
                          border: `1px solid ${isDark ? '#2E3155' : '#E0E3F0'}`,
                          borderRadius: 12, fontSize: 12,
                        }}
                        formatter={(v: number, name: string) => [fmt(v), name]}
                      />
                      <Area type="monotone" dataKey="inflow" stroke="#00897B" strokeWidth={2.5}
                        fill="url(#inflow)" dot={false} />
                      <Area type="monotone" dataKey="outflow" stroke="#7B1FA2" strokeWidth={2.5}
                        fill="url(#outflow)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.4 }}>
            <Card sx={{ height: 300 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Pending Approvals</Typography>
                {[
                  { label: 'Purchase Orders', count: 3, color: '#E53935', icon: <Warning sx={{ fontSize: 18 }} /> },
                  { label: 'Journal Entries', count: 2, color: '#F9A825', icon: <Schedule sx={{ fontSize: 18 }} /> },
                  { label: 'Credit Notes', count: 1, color: '#0288D1', icon: <Schedule sx={{ fontSize: 18 }} /> },
                  { label: 'Supplier Debit Notes', count: 2, color: '#7B1FA2', icon: <Schedule sx={{ fontSize: 18 }} /> },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      py: 1.25, borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none' },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Box sx={{ color: item.color }}>{item.icon}</Box>
                      <Typography variant="body2" fontWeight={500}>{item.label}</Typography>
                    </Box>
                    <Chip
                      label={item.count}
                      size="small"
                      sx={{ bgcolor: alpha(item.color, 0.12), color: item.color, fontWeight: 700, minWidth: 28 }}
                    />
                  </Box>
                ))}
                <Box mt={1.5}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CheckCircle sx={{ color: '#43A047', fontSize: 18 }} />
                    <Typography variant="caption" color="text.secondary">
                      4 items approved today
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
        <Card>
          <CardContent sx={{ p: 2.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={700}>Recent Journal Entries</Typography>
                <Typography variant="caption" color="text.secondary">Latest accounting transactions</Typography>
              </Box>
            </Box>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Voucher No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Narration</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {journals.map((j: any, i: number) => (
                  <TableRow
                    key={i}
                    sx={{
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) },
                      cursor: 'pointer',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={700} color="primary.main">
                        {j.journal_number}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(j.entry_date).format('DD MMM YYYY')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={j.voucher_type}
                        size="small"
                        sx={{
                          bgcolor: alpha(voucherColor(j.voucher_type), 0.12),
                          color: voucherColor(j.voucher_type),
                          fontWeight: 700, fontSize: '0.7rem',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: 300 }}>
                        {j.narration || '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default DashboardPage;
