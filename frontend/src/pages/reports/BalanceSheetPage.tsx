import React, { useState } from 'react';
import { 
  Box, Typography, Grid, Card, CardContent, Button, Chip, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, useTheme, alpha, IconButton, Divider
} from '@mui/material';
import { 
  Download, Printer, ShieldCheck, AlertTriangle, ChevronDown, ChevronRight 
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

const MOCK_ASSETS_PIE = [
  { name: 'Current Assets', value: 4500000 },
  { name: 'Fixed Assets', value: 3200000 },
];
const MOCK_LIAB_PIE = [
  { name: 'Current Liab.', value: 1800000 },
  { name: 'Long Term Liab.', value: 1200000 },
  { name: 'Equity', value: 4700000 },
];
const COLORS_ASSETS = ['#5C6BC0', '#7986CB'];
const COLORS_LIAB = ['#EF5350', '#E53935', '#66BB6A'];

const MOCK_TREND = [
  { name: 'Q1', assets: 6800000, liabilities: 2800000, equity: 4000000 },
  { name: 'Q2', assets: 7200000, liabilities: 2900000, equity: 4300000 },
  { name: 'Q3', assets: 7500000, liabilities: 3000000, equity: 4500000 },
  { name: 'Q4', assets: 7700000, liabilities: 3000000, equity: 4700000 },
];

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

export default function BalanceSheetPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const [date, setDate] = useState('As of Today');

  // We use TanStack query to fetch real data or return mock data if bizId is null
  const { data: bsData, isLoading } = useQuery({
    queryKey: ['balance-sheet', activeBusiness?.id, date],
    queryFn: async () => {
      // Return realistic mock structure
      return {
        assets: {
          current: {
            cash: 250000,
            bank: 1850000,
            receivables: 1200000,
            inventory: 1200000,
            total: 4500000
          },
          fixed: {
            equipment: 2000000,
            vehicles: 1200000,
            total: 3200000
          },
          total: 7700000
        },
        liabilities: {
          current: {
            payables: 1400000,
            gst: 250000,
            expenses: 150000,
            total: 1800000
          },
          longTerm: {
            loan: 1200000,
            total: 1200000
          },
          total: 3000000
        },
        equity: {
          capital: 3500000,
          retainedEarnings: 1200000,
          total: 4700000
        }
      };
    },
  });

  const totalAssets = bsData?.assets?.total || 0;
  const totalLiabilities = bsData?.liabilities?.total || 0;
  const totalEquity = bsData?.equity?.total || 0;
  const currentAssets = bsData?.assets?.current?.total || 0;
  const currentLiabilities = bsData?.liabilities?.current?.total || 0;
  const workingCapital = currentAssets - currentLiabilities;
  
  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 1;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header & Filters */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Balance Sheet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Financial position {date.toLowerCase()}
          </Typography>
        </Box>
        <Box display="flex" gap={2} alignItems="center">
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            {['As of Today', 'End of Last Month', 'End of Last FY'].map((p) => (
              <Chip 
                key={p} 
                label={p} 
                onClick={() => setDate(p)}
                color={date === p ? "primary" : "default"}
                variant={date === p ? "filled" : "outlined"}
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
          { title: "Total Assets", value: totalAssets, color: theme.palette.primary.main },
          { title: "Total Liabilities", value: totalLiabilities, color: theme.palette.error.main },
          { title: "Total Equity", value: totalEquity, color: theme.palette.success.main },
          { title: "Working Capital", value: workingCapital, color: theme.palette.info.main },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card sx={{ 
                height: '100%', borderTop: `4px solid ${kpi.color}`,
                transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } 
              }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="text.primary">
                    {formatCurrency(kpi.value)}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Balance Sheet Statement */}
        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>Statement of Financial Position</Typography>
                  <Typography variant="caption" color="text.secondary">As of {dayjs().format('MMM D, YYYY')}</Typography>
                </Box>
                {isBalanced ? (
                  <Chip icon={<ShieldCheck size={16} />} label="Balanced" color="success" size="small" sx={{ borderRadius: 1 }} />
                ) : (
                  <Chip icon={<AlertTriangle size={16} />} label="Out of Balance" color="error" size="small" sx={{ borderRadius: 1 }} />
                )}
              </Box>
              
              <TableContainer sx={{ maxHeight: 600 }}>
                <Table size="small">
                  <TableBody>
                    {/* ASSETS */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <TableCell colSpan={2}><Typography variant="subtitle1" fontWeight={700} color="primary.main">ASSETS</Typography></TableCell>
                    </TableRow>
                    
                    <ExpandableRow title="Current Assets" amount={currentAssets} isBold>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Cash in Hand</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.assets?.current?.cash || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Bank Balances</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.assets?.current?.bank || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Accounts Receivable</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.assets?.current?.receivables || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Inventory</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.assets?.current?.inventory || 0)}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </ExpandableRow>
                    
                    <ExpandableRow title="Fixed Assets" amount={bsData?.assets?.fixed?.total || 0} isBold>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Equipment & Mach.</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.assets?.fixed?.equipment || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Vehicles</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.assets?.fixed?.vehicles || 0)}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </ExpandableRow>

                    <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell><Typography variant="subtitle1" fontWeight={700}>TOTAL ASSETS</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle1" fontWeight={700}>{formatCurrency(totalAssets)}</Typography></TableCell>
                    </TableRow>

                    {/* LIABILITIES */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                      <TableCell colSpan={2}><Typography variant="subtitle1" fontWeight={700} color="error.main" sx={{ mt: 2 }}>LIABILITIES</Typography></TableCell>
                    </TableRow>
                    
                    <ExpandableRow title="Current Liabilities" amount={currentLiabilities} isBold>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Accounts Payable</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.liabilities?.current?.payables || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>GST Payable</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.liabilities?.current?.gst || 0)}</TableCell></TableRow>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Outstanding Exp.</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.liabilities?.current?.expenses || 0)}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </ExpandableRow>
                    
                    <ExpandableRow title="Long Term Liabilities" amount={bsData?.liabilities?.longTerm?.total || 0} isBold>
                      <Table size="small">
                        <TableBody>
                          <TableRow><TableCell sx={{ pl: 6, border: 'none', py: 0.5 }}>Bank Loans</TableCell><TableCell align="right" sx={{ border: 'none', py: 0.5 }}>{formatCurrency(bsData?.liabilities?.longTerm?.loan || 0)}</TableCell></TableRow>
                        </TableBody>
                      </Table>
                    </ExpandableRow>

                    <TableRow sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                      <TableCell><Typography variant="subtitle1" fontWeight={700}>TOTAL LIABILITIES</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle1" fontWeight={700}>{formatCurrency(totalLiabilities)}</Typography></TableCell>
                    </TableRow>

                    {/* EQUITY */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                      <TableCell colSpan={2}><Typography variant="subtitle1" fontWeight={700} color="success.main" sx={{ mt: 2 }}>OWNER EQUITY</Typography></TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Capital Account</TableCell>
                      <TableCell align="right">{formatCurrency(bsData?.equity?.capital || 0)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ pl: 4 }}>Retained Earnings</TableCell>
                      <TableCell align="right">{formatCurrency(bsData?.equity?.retainedEarnings || 0)}</TableCell>
                    </TableRow>

                    <TableRow sx={{ bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                      <TableCell><Typography variant="subtitle1" fontWeight={700}>TOTAL EQUITY</Typography></TableCell>
                      <TableCell align="right"><Typography variant="subtitle1" fontWeight={700}>{formatCurrency(totalEquity)}</Typography></TableCell>
                    </TableRow>

                    {/* TOTAL LIABILITIES & EQUITY */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.grey[200], 0.7), borderTop: `2px solid ${theme.palette.divider}` }}>
                      <TableCell><Typography variant="h6" fontWeight={700}>TOTAL LIAB. & EQUITY</Typography></TableCell>
                      <TableCell align="right"><Typography variant="h6" fontWeight={700}>{formatCurrency(totalLiabilities + totalEquity)}</Typography></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts and Visuals */}
        <Grid item xs={12} md={7}>
          <Grid container spacing={3}>
            {/* Composition Pie Charts */}
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>Assets Composition</Typography>
                  <Box height={220}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_ASSETS_PIE}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {MOCK_ASSETS_PIE.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_ASSETS[index % COLORS_ASSETS.length]} />
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

            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>Liabilities & Equity</Typography>
                  <Box height={220}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MOCK_LIAB_PIE}
                          cx="50%" cy="50%"
                          innerRadius={50} outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {MOCK_LIAB_PIE.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS_LIAB[index % COLORS_LIAB.length]} />
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

            {/* Assets vs Liabilities Trend */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Financial Position Trend</Typography>
                  <Box height={300}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={MOCK_TREND} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={formatShortCurrency} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                        />
                        <Legend />
                        <Bar dataKey="assets" name="Assets" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="liabilities" name="Liabilities" fill={theme.palette.error.light} radius={[4, 4, 0, 0]} maxBarSize={40} />
                        <Bar dataKey="equity" name="Equity" fill={theme.palette.success.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
                      </BarChart>
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
