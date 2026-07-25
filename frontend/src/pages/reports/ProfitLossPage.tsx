import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Divider, useTheme, alpha, IconButton
} from '@mui/material';
import { 
  Download, Printer, TrendingUp, TrendingDown, ChevronDown, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatShortCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}k`;
  return `₹${amount}`;
};

// Mock Data
const MOCK_MONTHLY_DATA = [
  { name: 'Apr', revenue: 450000, expense: 320000, profit: 130000 },
  { name: 'May', revenue: 520000, expense: 340000, profit: 180000 },
  { name: 'Jun', revenue: 480000, expense: 310000, profit: 170000 },
  { name: 'Jul', revenue: 610000, expense: 380000, profit: 230000 },
  { name: 'Aug', revenue: 590000, expense: 390000, profit: 200000 },
  { name: 'Sep', revenue: 650000, expense: 410000, profit: 240000 },
  { name: 'Oct', revenue: 720000, expense: 450000, profit: 270000 },
  { name: 'Nov', revenue: 680000, expense: 430000, profit: 250000 },
  { name: 'Dec', revenue: 810000, expense: 490000, profit: 320000 },
  { name: 'Jan', revenue: 750000, expense: 460000, profit: 290000 },
  { name: 'Feb', revenue: 790000, expense: 470000, profit: 320000 },
  { name: 'Mar', revenue: 920000, expense: 520000, profit: 400000 },
];

const MOCK_EXPENSE_PIE = [
  { name: 'Salary', value: 1200000 },
  { name: 'Rent', value: 480000 },
  { name: 'Utilities', value: 150000 },
  { name: 'Transport', value: 240000 },
  { name: 'Marketing', value: 180000 },
];
const COLORS = ['#5C6BC0', '#42A5F5', '#66BB6A', '#FFA726', '#EF5350'];

const ExpandableRow = ({ title, amount, children, isBold = false, indent = 0 }: any) => {
  const [expanded, setExpanded] = useState(true);
  
  return (
    <>
      <TableRow 
        hover 
        onClick={() => children && setExpanded(!expanded)}
        sx={{ cursor: children ? 'pointer' : 'default', '& td': { borderBottom: 'none', py: 1 } }}
      >
        <TableCell sx={{ pl: indent * 4 + 2 }}>
          <Box display="flex" alignItems="center">
            {children && (
              <IconButton size="small" sx={{ mr: 1, p: 0.5 }}>
                {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </IconButton>
            )}
            {!children && <Box sx={{ width: 24, mr: 1 }} />}
            <Typography variant={isBold ? "subtitle2" : "body2"} fontWeight={isBold ? 600 : 400}>
              {title}
            </Typography>
          </Box>
        </TableCell>
        <TableCell align="right">
          <Typography variant={isBold ? "subtitle2" : "body2"} fontWeight={isBold ? 600 : 400}>
            {amount < 0 ? `(${formatCurrency(Math.abs(amount))})` : formatCurrency(amount)}
          </Typography>
        </TableCell>
      </TableRow>
      {children && (
        <AnimatePresence>
          {expanded && (
            <motion.tr
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'table-row' }}
            >
              <td colSpan={2} style={{ padding: 0 }}>
                <Box>{children}</Box>
              </td>
            </motion.tr>
          )}
        </AnimatePresence>
      )}
    </>
  );
};

export default function ProfitLossPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const [period, setPeriod] = useState('This FY');

  // We use TanStack query to fetch real data or return mock data if bizId is null
  const { data: plData, isLoading } = useQuery({
    queryKey: ['profit-loss', activeBusiness?.id, period],
    queryFn: async () => {
      // In a real implementation, you would call a Supabase RPC or aggregate from journal entries
      // For now, returning realistic mock structure
      return {
        income: {
          sales: 8500000,
          other: 150000,
          total: 8650000
        },
        cogs: {
          openingStock: 1200000,
          purchases: 4500000,
          closingStock: 1400000,
          total: 4300000
        },
        expenses: {
          salary: 1200000,
          rent: 480000,
          utilities: 150000,
          transport: 240000,
          marketing: 180000,
          total: 2250000
        }
      };
    },
  });

  const income = plData?.income?.total || 0;
  const cogs = plData?.cogs?.total || 0;
  const grossProfit = income - cogs;
  const grossMargin = income > 0 ? (grossProfit / income) * 100 : 0;
  
  const expenses = plData?.expenses?.total || 0;
  const netProfit = grossProfit - expenses;
  const netMargin = income > 0 ? (netProfit / income) * 100 : 0;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header & Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Profit & Loss Statement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Financial performance overview
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            {['This Month', 'This Quarter', 'This FY', 'Custom'].map((p) => (
              <Chip 
                key={p} 
                label={p} 
                onClick={() => setPeriod(p)}
                color={period === p ? "primary" : "default"}
                variant={period === p ? "filled" : "outlined"}
                sx={{ borderRadius: 1 }}
              />
            ))}
          </Box>
          <Button variant="outlined" startIcon={<Printer size={18} />}>
            Print
          </Button>
          <Button variant="contained" startIcon={<Download size={18} />}>
            Export
          </Button>
        </Box>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          { title: "Gross Revenue", value: income, change: 12.5, color: theme.palette.info.main },
          { title: "COGS", value: cogs, change: 5.2, color: theme.palette.warning.main, inverse: true },
          { title: "Gross Profit", value: grossProfit, suffix: ` (${grossMargin.toFixed(1)}%)`, change: 15.3, color: theme.palette.primary.main },
          { title: "Net Profit", value: netProfit, suffix: ` (${netMargin.toFixed(1)}%)`, change: 18.2, color: theme.palette.success.main },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card sx={{ 
                height: '100%', 
                transition: 'transform 0.2s', 
                '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } 
              }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {formatCurrency(kpi.value)}
                    {kpi.suffix && <Typography component="span" variant="body2" color="text.secondary">{kpi.suffix}</Typography>}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    {((kpi.change > 0 && !kpi.inverse) || (kpi.change < 0 && kpi.inverse)) ? (
                      <TrendingUp size={16} color={theme.palette.success.main} />
                    ) : (
                      <TrendingDown size={16} color={theme.palette.error.main} />
                    )}
                    <Typography 
                      variant="body2" 
                      color={((kpi.change > 0 && !kpi.inverse) || (kpi.change < 0 && kpi.inverse)) ? 'success.main' : 'error.main'}
                      fontWeight={500}
                    >
                      {Math.abs(kpi.change)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs prev period
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* P&L Statement Table */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" fontWeight={600}>Statement of Profit & Loss</Typography>
                <Typography variant="caption" color="text.secondary">For the period ending {dayjs().format('MMM D, YYYY')}</Typography>
              </Box>
              
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table size="small">
                  <TableBody>
                    {/* INCOME */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                      <TableCell colSpan={2}><Typography variant="subtitle2" fontWeight={600} color="primary.main">INCOME</Typography></TableCell>
                    </TableRow>
                    <ExpandableRow title="Total Income" amount={income} isBold>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Sales Revenue</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.income?.sales || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Other Income</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.income?.other || 0)}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </ExpandableRow>
                    
                    {/* COGS */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                      <TableCell colSpan={2}><Typography variant="subtitle2" fontWeight={600} color="warning.main">COST OF GOODS SOLD</Typography></TableCell>
                    </TableRow>
                    <ExpandableRow title="Total COGS" amount={cogs} isBold>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Opening Stock</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.cogs?.openingStock || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>(+) Purchases</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.cogs?.purchases || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>(-) Closing Stock</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>({formatCurrency(plData?.cogs?.closingStock || 0)})</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </ExpandableRow>

                    {/* GROSS PROFIT */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <TableCell><Typography variant="subtitle1" fontWeight={700}>GROSS PROFIT</Typography></TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" fontWeight={700}>{formatCurrency(grossProfit)}</Typography>
                        <Typography variant="caption" color="text.secondary">Margin: {grossMargin.toFixed(1)}%</Typography>
                      </TableCell>
                    </TableRow>

                    {/* EXPENSES */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.grey[100], 0.5) }}>
                      <TableCell colSpan={2}><Typography variant="subtitle2" fontWeight={600} color="error.main">OPERATING EXPENSES</Typography></TableCell>
                    </TableRow>
                    <ExpandableRow title="Total Operating Expenses" amount={expenses} isBold>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Salary & Wages</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.expenses?.salary || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Rent</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.expenses?.rent || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Utilities</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.expenses?.utilities || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Transport & Travel</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.expenses?.transport || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Marketing</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(plData?.expenses?.marketing || 0)}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </ExpandableRow>

                    {/* NET PROFIT */}
                    <TableRow sx={{ bgcolor: netProfit >= 0 ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1) }}>
                      <TableCell><Typography variant="h6" fontWeight={700} color={netProfit >= 0 ? "success.main" : "error.main"}>NET PROFIT</Typography></TableCell>
                      <TableCell align="right">
                        <Typography variant="h6" fontWeight={700} color={netProfit >= 0 ? "success.main" : "error.main"}>{formatCurrency(netProfit)}</Typography>
                        <Typography variant="caption" color="text.secondary">Margin: {netMargin.toFixed(1)}%</Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={3}>
            {/* Revenue vs Expense Bar Chart */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Income vs Expense (12 Months)</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_MONTHLY_DATA} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={formatShortCurrency} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                        />
                        <Legend />
                        <Bar dataKey="revenue" name="Income" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="expense" name="Expense" fill={theme.palette.error.light} radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Bottom Two Charts */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Net Profit Trend</Typography>
                  <Box height={250}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={MOCK_MONTHLY_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={formatShortCurrency} axisLine={false} tickLine={false} />
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Line type="monotone" dataKey="profit" name="Net Profit" stroke={theme.palette.success.main} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
                  <Box height={250}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_EXPENSE_PIE}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {MOCK_EXPENSE_PIE.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
