import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  Table, TableBody, TableCell, TableHead, TableRow,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  InputAdornment, IconButton, Select, MenuItem, FormControl, InputLabel,
  alpha, useTheme, LinearProgress, Tooltip, Avatar,
} from '@mui/material';
import {
  AccountBalance, Add, Search, FilterList, TrendingUp, TrendingDown,
  AccountTree, Edit, Visibility, ArrowUpward, ArrowDownward,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_00_00_000) return `₹${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000) return `₹${(n / 1_00_000).toFixed(1)}L`;
  return `₹${(n / 1000).toFixed(1)}K`;
};

const CATEGORY_COLORS: Record<string, string> = {
  Asset: '#5C6BC0', Liability: '#E53935', Equity: '#43A047',
  Revenue: '#00897B', Expense: '#F9A825',
};

const MOCK_ACCOUNTS = [
  { id: '1', code: '1001', name: 'Cash in Hand', category: 'Asset', account_type: 'Cash', is_active: true, balance: 45000 },
  { id: '2', code: '1002', name: 'HDFC Bank Account', category: 'Asset', account_type: 'Bank', is_active: true, balance: 285000 },
  { id: '3', code: '1100', name: 'Accounts Receivable', category: 'Asset', account_type: 'Receivable', is_active: true, balance: 124500 },
  { id: '4', code: '1200', name: 'Inventory', category: 'Asset', account_type: 'Stock', is_active: true, balance: 380000 },
  { id: '5', code: '2001', name: 'Accounts Payable', category: 'Liability', account_type: 'Payable', is_active: true, balance: 87300 },
  { id: '6', code: '2100', name: 'GST Payable', category: 'Liability', account_type: 'GST', is_active: true, balance: 18500 },
  { id: '7', code: '3001', name: 'Owner Capital', category: 'Equity', account_type: 'Capital', is_active: true, balance: 500000 },
  { id: '8', code: '3100', name: 'Retained Earnings', category: 'Equity', account_type: 'Retained', is_active: true, balance: 146700 },
  { id: '9', code: '4001', name: 'Sales Revenue', category: 'Revenue', account_type: 'Sales', is_active: true, balance: 485000 },
  { id: '10', code: '4100', name: 'Other Income', category: 'Revenue', account_type: 'Income', is_active: true, balance: 12500 },
  { id: '11', code: '5001', name: 'Cost of Goods Sold', category: 'Expense', account_type: 'COGS', is_active: true, balance: 320000 },
  { id: '12', code: '5100', name: 'Salary Expense', category: 'Expense', account_type: 'Expense', is_active: true, balance: 45000 },
  { id: '13', code: '5200', name: 'Rent Expense', category: 'Expense', account_type: 'Expense', is_active: true, balance: 15000 },
  { id: '14', code: '5300', name: 'Transport Expense', category: 'Expense', account_type: 'Expense', is_active: true, balance: 8500 },
];

const ChartOfAccountsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const bizId = useAuthStore((s) => s.activeBusiness?.id);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({ code: '', name: '', category: 'Asset', account_type: 'Cash' });

  const { data: accounts } = useQuery({
    queryKey: ['chart-of-accounts', bizId],
    queryFn: async () => {
      if (!bizId) return MOCK_ACCOUNTS;
      const { data } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('business_id', bizId)
        .eq('is_active', true)
        .order('code');
      return (data && data.length > 0) ? data : MOCK_ACCOUNTS;
    },
  });

  const allAccounts = accounts || MOCK_ACCOUNTS;
  const filtered = allAccounts.filter((a: any) =>
    (filterCategory === 'All' || a.category === filterCategory) &&
    (a.name.toLowerCase().includes(search.toLowerCase()) || a.code.includes(search))
  );

  // KPI aggregates
  const totalAssets = allAccounts.filter((a: any) => a.category === 'Asset').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalLiabilities = allAccounts.filter((a: any) => a.category === 'Liability').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalEquity = allAccounts.filter((a: any) => a.category === 'Equity').reduce((s: number, a: any) => s + (a.balance || 0), 0);
  const totalRevenue = allAccounts.filter((a: any) => a.category === 'Revenue').reduce((s: number, a: any) => s + (a.balance || 0), 0);

  // Pie chart data
  const pieData = Object.entries(
    allAccounts.reduce((acc: any, a: any) => {
      acc[a.category] = (acc[a.category] || 0) + Math.abs(a.balance || 0);
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));

  const categories = ['All', 'Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <Box>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={800} mb={0.5}>Chart of Accounts</Typography>
            <Typography variant="body2" color="text.secondary">
              Complete accounting hierarchy — Assets, Liabilities, Equity, Revenue & Expenses
            </Typography>
          </Box>
          <Button
            variant="contained" startIcon={<Add />}
            onClick={() => setAddOpen(true)}
            sx={{ borderRadius: 2.5, background: 'linear-gradient(135deg, #7B1FA2, #4A148C)' }}
          >
            Add Account
          </Button>
        </Box>
      </motion.div>

      {/* KPI Cards */}
      <Grid container spacing={2.5} mb={3}>
        {[
          { label: 'Total Assets', value: fmtShort(totalAssets), color: '#5C6BC0', icon: <TrendingUp /> },
          { label: 'Total Liabilities', value: fmtShort(totalLiabilities), color: '#E53935', icon: <TrendingDown /> },
          { label: 'Owner Equity', value: fmtShort(totalEquity), color: '#43A047', icon: <AccountBalance /> },
          { label: 'Total Revenue', value: fmtShort(totalRevenue), color: '#00897B', icon: <AccountTree /> },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={kpi.label}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.4 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2.5 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box sx={{
                      width: 44, height: 44, borderRadius: 2.5,
                      background: `linear-gradient(135deg, ${kpi.color}, ${alpha(kpi.color, 0.7)})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: `0 4px 12px ${alpha(kpi.color, 0.35)}`,
                      '& svg': { color: 'white', fontSize: 22 },
                    }}>
                      {kpi.icon}
                    </Box>
                  </Box>
                  <Typography variant="h5" fontWeight={800} mb={0.5}>{kpi.value}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{kpi.label}</Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2.5}>
        {/* Accounts Table */}
        <Grid item xs={12} lg={8}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                {/* Toolbar */}
                <Box display="flex" gap={1.5} mb={2} flexWrap="wrap" alignItems="center">
                  <TextField
                    size="small"
                    placeholder="Search accounts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><Search sx={{ fontSize: 18, color: 'text.secondary' }} /></InputAdornment> }}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <Box display="flex" gap={0.75} flexWrap="wrap">
                    {categories.map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        onClick={() => setFilterCategory(cat)}
                        sx={{
                          fontWeight: 600,
                          bgcolor: filterCategory === cat
                            ? alpha(CATEGORY_COLORS[cat] || '#5C6BC0', 0.15)
                            : 'transparent',
                          color: filterCategory === cat
                            ? (CATEGORY_COLORS[cat] || '#5C6BC0')
                            : 'text.secondary',
                          border: `1px solid ${filterCategory === cat ? (CATEGORY_COLORS[cat] || '#5C6BC0') : 'transparent'}`,
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </Box>
                </Box>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Account Name</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell align="right">Balance</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((account: any, i: number) => (
                      <TableRow
                        key={account.id || i}
                        sx={{ '&:hover': { bgcolor: alpha(CATEGORY_COLORS[account.category] || '#5C6BC0', 0.04) }, cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Typography variant="caption" fontWeight={700} fontFamily="monospace" color="primary.main">
                            {account.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box sx={{
                              width: 8, height: 8, borderRadius: '50%',
                              bgcolor: CATEGORY_COLORS[account.category] || '#5C6BC0',
                              flexShrink: 0,
                            }} />
                            <Typography variant="body2" fontWeight={600}>{account.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={account.category}
                            size="small"
                            sx={{
                              bgcolor: alpha(CATEGORY_COLORS[account.category] || '#5C6BC0', 0.12),
                              color: CATEGORY_COLORS[account.category] || '#5C6BC0',
                              fontWeight: 700, fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">{account.account_type}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body2" fontWeight={700}
                            color={account.category === 'Expense' || account.category === 'Liability' ? 'error.main' : 'success.main'}
                          >
                            {fmt(account.balance || 0)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={account.is_active ? 'Active' : 'Inactive'}
                            size="small"
                            sx={{
                              bgcolor: alpha(account.is_active ? '#43A047' : '#9E9E9E', 0.12),
                              color: account.is_active ? '#43A047' : '#9E9E9E',
                              fontWeight: 700, fontSize: '0.65rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Showing {filtered.length} of {allAccounts.length} accounts
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Assets = Liabilities + Equity → {fmt(totalAssets)} = {fmt(totalLiabilities + totalEquity)}
                    {Math.abs(totalAssets - totalLiabilities - totalEquity) < 1
                      ? ' ✅' : ' ⚠️ Imbalanced'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Right panel */}
        <Grid item xs={12} lg={4}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
            {/* Category Distribution */}
            <Card sx={{ mb: 2.5 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Account Distribution</Typography>
                <Box height={200}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={75} innerRadius={45}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={CATEGORY_COLORS[entry.name] || '#9E9E9E'} />
                        ))}
                      </Pie>
                      <RTooltip
                        formatter={(v: number, n: string) => [fmt(v), n]}
                        contentStyle={{
                          background: isDark ? '#1A1D35' : '#fff',
                          border: `1px solid ${isDark ? '#2E3155' : '#E0E3F0'}`,
                          borderRadius: 8, fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                {Object.entries(CATEGORY_COLORS).map(([cat, color]) => {
                  const total = allAccounts.filter((a: any) => a.category === cat).reduce((s: number, a: any) => s + Math.abs(a.balance || 0), 0);
                  return total > 0 ? (
                    <Box key={cat} display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: color }} />
                        <Typography variant="caption" fontWeight={600}>{cat}</Typography>
                      </Box>
                      <Typography variant="caption" fontWeight={700} color={color}>{fmtShort(total)}</Typography>
                    </Box>
                  ) : null;
                })}
              </CardContent>
            </Card>

            {/* Accounting Equation */}
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>Accounting Equation</Typography>
                <Box sx={{
                  p: 2, borderRadius: 2,
                  bgcolor: alpha(Math.abs(totalAssets - totalLiabilities - totalEquity) < 1 ? '#43A047' : '#E53935', 0.08),
                  border: `1px solid ${alpha(Math.abs(totalAssets - totalLiabilities - totalEquity) < 1 ? '#43A047' : '#E53935', 0.2)}`,
                  mb: 2,
                }}>
                  <Typography variant="body2" fontWeight={700} textAlign="center" mb={1}>
                    Assets = Liabilities + Equity
                  </Typography>
                  <Typography variant="h6" fontWeight={800} textAlign="center" color="primary.main">
                    {fmt(totalAssets)} = {fmt(totalLiabilities + totalEquity)}
                  </Typography>
                  <Typography
                    variant="caption" display="block" textAlign="center" mt={0.5}
                    color={Math.abs(totalAssets - totalLiabilities - totalEquity) < 1 ? 'success.main' : 'error.main'}
                    fontWeight={700}
                  >
                    {Math.abs(totalAssets - totalLiabilities - totalEquity) < 1 ? '✅ Books are balanced' : '⚠️ Imbalance detected'}
                  </Typography>
                </Box>
                {[
                  { label: 'Total Assets', value: totalAssets, color: '#5C6BC0' },
                  { label: 'Total Liabilities', value: totalLiabilities, color: '#E53935' },
                  { label: 'Owner Equity', value: totalEquity, color: '#43A047' },
                  { label: 'Total Revenue', value: totalRevenue, color: '#00897B' },
                ].map((item) => (
                  <Box key={item.label} display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                    <Typography variant="body2" fontWeight={700} color={item.color}>{fmt(item.value)}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Add Account Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add New Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={6}>
              <TextField fullWidth label="Account Code" value={newAccount.code}
                onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })} placeholder="e.g. 1005" />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={newAccount.category} label="Category"
                  onChange={(e) => setNewAccount({ ...newAccount, category: e.target.value })}>
                  {['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'].map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Account Name" value={newAccount.name}
                onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })} placeholder="e.g. HDFC Savings Account" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <InputLabel>Account Type</InputLabel>
                <Select value={newAccount.account_type} label="Account Type"
                  onChange={(e) => setNewAccount({ ...newAccount, account_type: e.target.value })}>
                  {['Cash', 'Bank', 'GST', 'Sales', 'Expense', 'Receivable', 'Payable', 'Stock', 'Capital', 'Income'].map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddOpen(false)}
            sx={{ borderRadius: 2, background: 'linear-gradient(135deg, #7B1FA2, #4A148C)' }}>
            Create Account
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ChartOfAccountsPage;
