import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  Divider,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  AlertTitle,
  LinearProgress,
} from '@mui/material';
import {
  FileDownloadOutlined,
  RefreshOutlined,
  CheckCircleOutlined,
  WarningAmberOutlined,
  LightbulbOutlined,
  AssessmentOutlined,
  PictureAsPdfOutlined,
  DescriptionOutlined,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { alpha, useTheme } from '@mui/material/styles';

import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

interface GSTSummary {
  outputGST: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
  inputITC: {
    cgst: number;
    sgst: number;
    igst: number;
    total: number;
  };
  netLiability: number;
  taxableSales: number;
  taxablePurchases: number;
  complianceScore: number;
}

interface FilingStatus {
  type: string;
  status: 'Filed' | 'Pending' | 'Overdue';
  dueDate: string;
  daysRemaining: number;
}

interface HSNItem {
  hsnCode: string;
  description: string;
  quantity: number;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
}

interface TrendData {
  month: string;
  output: number;
  input: number;
  liability: number;
}

// ----------------------------------------------------------------------
// Mock Data
// ----------------------------------------------------------------------

const MOCK_SUMMARY: GSTSummary = {
  outputGST: {
    cgst: 450000,
    sgst: 450000,
    igst: 120000,
    total: 1020000,
  },
  inputITC: {
    cgst: 310000,
    sgst: 310000,
    igst: 50000,
    total: 670000,
  },
  netLiability: 350000,
  taxableSales: 5666666,
  taxablePurchases: 3722222,
  complianceScore: 94,
};

const MOCK_FILING_STATUS: FilingStatus[] = [
  { type: 'GSTR-1', status: 'Pending', dueDate: '2026-08-11', daysRemaining: 17 },
  { type: 'GSTR-3B', status: 'Pending', dueDate: '2026-08-20', daysRemaining: 26 },
  { type: 'GSTR-9', status: 'Filed', dueDate: '2026-12-31', daysRemaining: 158 },
];

const MOCK_HSN_DATA: HSNItem[] = [
  { hsnCode: '8517', description: 'Telephones and smartphones', quantity: 1250, taxableValue: 2500000, cgst: 225000, sgst: 225000, igst: 0 },
  { hsnCode: '8471', description: 'Automatic data processing machines', quantity: 450, taxableValue: 1800000, cgst: 162000, sgst: 162000, igst: 0 },
  { hsnCode: '8528', description: 'Monitors and projectors', quantity: 300, taxableValue: 900000, cgst: 0, sgst: 0, igst: 162000 },
];

const MOCK_TRENDS: TrendData[] = [
  { month: 'Feb', output: 850000, input: 600000, liability: 250000 },
  { month: 'Mar', output: 920000, input: 680000, liability: 240000 },
  { month: 'Apr', output: 1100000, input: 750000, liability: 350000 },
  { month: 'May', output: 950000, input: 710000, liability: 240000 },
  { month: 'Jun', output: 1050000, input: 820000, liability: 230000 },
  { month: 'Jul', output: 1020000, input: 670000, liability: 350000 },
];

// ----------------------------------------------------------------------
// Formatters
// ----------------------------------------------------------------------

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatShortCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return formatCurrency(amount);
};

// ----------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------

export default function GSTReportsPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const [period, setPeriod] = useState('current_month');

  // Colors
  const colors = {
    purple: '#7B1FA2', // GST Output
    green: '#43A047',  // ITC
    red: '#E53935',    // Liability/Alerts
    blue: '#1976D2',   // Info
    warning: '#FFB300'
  };

  // Queries
  const { data: gstSummary, isLoading: summaryLoading } = useQuery({
    queryKey: ['gstSummary', activeBusiness?.id, period],
    queryFn: async () => {
      if (!activeBusiness?.id) return MOCK_SUMMARY;
      // In a real app, you would fetch from Supabase here.
      // For now, return mock data.
      return MOCK_SUMMARY;
    },
  });

  const { data: filingStatus } = useQuery({
    queryKey: ['filingStatus', activeBusiness?.id],
    queryFn: async () => MOCK_FILING_STATUS,
  });

  const { data: hsnData } = useQuery({
    queryKey: ['hsnData', activeBusiness?.id, period],
    queryFn: async () => MOCK_HSN_DATA,
  });

  const { data: trendData } = useQuery({
    queryKey: ['gstTrendData', activeBusiness?.id],
    queryFn: async () => MOCK_TRENDS,
  });

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } },
  };

  if (summaryLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const renderKPICard = (title: string, amount: number, color: string, subtitle?: string, breakdown?: { label: string, val: number }[]) => (
    <Card
      component={motion.div}
      variants={itemVariants}
      sx={{
        height: '100%',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] },
        borderTop: `4px solid ${color}`,
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ color, fontWeight: 'bold', my: 1 }}>
          {formatCurrency(amount)}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
        {breakdown && (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ mb: 1 }} />
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              {breakdown.map((b, i) => (
                <Box key={i} sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {b.label}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatShortCurrency(b.val)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            GST Statutory Compliance
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={`GSTIN: ${activeBusiness?.gstin || '27AADCB2230M1Z2'}`}
              size="small"
              sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 'bold' }}
            />
            <Typography variant="body2" color="text.secondary">
              Last synced: Today, 10:45 AM
            </Typography>
          </Stack>
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>GST Period</InputLabel>
            <Select
              value={period}
              label="GST Period"
              onChange={(e) => setPeriod(e.target.value)}
            >
              <MenuItem value="current_month">Current Month (Jul 2026)</MenuItem>
              <MenuItem value="last_month">Last Month (Jun 2026)</MenuItem>
              <MenuItem value="q1">Q1 (Apr-Jun 2026)</MenuItem>
              <MenuItem value="fy">FY 2026-27</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<RefreshOutlined />}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<FileDownloadOutlined />} color="primary">
            Export Reports
          </Button>
        </Stack>
      </Box>

      {/* Pending Compliance Alerts */}
      <Stack spacing={2} sx={{ mb: 4 }} component={motion.div} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Alert severity="warning" icon={<WarningAmberOutlined />} sx={{ borderRadius: 2 }}>
          <AlertTitle>Action Required: GSTR-1 Due Soon</AlertTitle>
          GSTR-1 for July 2026 is due in 17 days. Please review and finalize outward supplies.
        </Alert>
        <Alert severity="info" icon={<LightbulbOutlined />} sx={{ borderRadius: 2 }}>
          <strong>Smart Insight:</strong> 5 purchase invoices (₹45,000 ITC) are missing supplier GSTINs. Update them to claim full ITC.
        </Alert>
      </Stack>

      <motion.div variants={containerVariants} initial="hidden" animate="show">
        {/* KPI Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            {renderKPICard(
              'Total Output GST',
              gstSummary?.outputGST.total || 0,
              colors.purple,
              'Tax collected on sales',
              [
                { label: 'CGST', val: gstSummary?.outputGST.cgst || 0 },
                { label: 'SGST', val: gstSummary?.outputGST.sgst || 0 },
                { label: 'IGST', val: gstSummary?.outputGST.igst || 0 }
              ]
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            {renderKPICard(
              'Eligible Input Tax Credit',
              gstSummary?.inputITC.total || 0,
              colors.green,
              'Tax paid on purchases',
              [
                { label: 'CGST', val: gstSummary?.inputITC.cgst || 0 },
                { label: 'SGST', val: gstSummary?.inputITC.sgst || 0 },
                { label: 'IGST', val: gstSummary?.inputITC.igst || 0 }
              ]
            )}
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] },
                borderTop: `4px solid ${colors.red}`,
                bgcolor: alpha(colors.red, 0.05),
              }}
            >
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                  Net GST Liability
                </Typography>
                <Typography variant="h4" sx={{ color: colors.red, fontWeight: 'bold', my: 1 }}>
                  {formatCurrency(gstSummary?.netLiability || 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Payable by 20th Aug
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Divider sx={{ mb: 1, borderColor: alpha(colors.red, 0.2) }} />
                  <Typography variant="caption" display="block" color="text.secondary">
                    Calculation: Output GST - Input ITC
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600, width: '100%' }}>
                  GST Compliance Score
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-flex', mt: 2 }}>
                  <CircularProgress
                    variant="determinate"
                    value={100}
                    size={100}
                    thickness={4}
                    sx={{ color: theme.palette.grey[200] }}
                  />
                  <CircularProgress
                    variant="determinate"
                    value={gstSummary?.complianceScore || 0}
                    size={100}
                    thickness={4}
                    sx={{ color: colors.green, position: 'absolute', left: 0 }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h5" component="div" color="text.primary" fontWeight="bold">
                      {gstSummary?.complianceScore}%
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                  Based on on-time filing & data matching
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Sales & Purchases Overview */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Taxable Sales & Output Liability
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Taxable Value</Typography>
                  <Typography variant="h5" fontWeight="bold">{formatCurrency(gstSummary?.taxableSales || 0)}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Total Tax Amount</Typography>
                  <Typography variant="h5" fontWeight="bold" color={colors.purple}>{formatCurrency(gstSummary?.outputGST.total || 0)}</Typography>
                </Box>
              </Stack>
              <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(colors.purple, 0.1), '& .MuiLinearProgress-bar': { bgcolor: colors.purple } }} />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Taxable Purchases & Input Credit
              </Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Taxable Value</Typography>
                  <Typography variant="h5" fontWeight="bold">{formatCurrency(gstSummary?.taxablePurchases || 0)}</Typography>
                </Box>
                <Box textAlign="right">
                  <Typography variant="body2" color="text.secondary">Total ITC Claimed</Typography>
                  <Typography variant="h5" fontWeight="bold" color={colors.green}>{formatCurrency(gstSummary?.inputITC.total || 0)}</Typography>
                </Box>
              </Stack>
              <LinearProgress variant="determinate" value={100} sx={{ height: 8, borderRadius: 4, bgcolor: alpha(colors.green, 0.1), '& .MuiLinearProgress-bar': { bgcolor: colors.green } }} />
            </Paper>
          </Grid>
        </Grid>

        {/* Trend Chart & Filing Status */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 450 }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Monthly GST Liability & ITC Trend
              </Typography>
              <Box sx={{ height: 380, width: '100%', mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trendData || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                    <YAxis
                      yAxisId="left"
                      tickFormatter={(val) => formatShortCurrency(val)}
                      stroke={theme.palette.text.secondary}
                    />
                    <RechartsTooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="output" name="Output GST" fill={colors.purple} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar yAxisId="left" dataKey="input" name="Input ITC" fill={colors.green} radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Line yAxisId="left" type="monotone" dataKey="liability" name="Net Liability" stroke={colors.red} strokeWidth={3} dot={{ r: 4, fill: colors.red, strokeWidth: 2, stroke: '#fff' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 2, height: 450, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                Filing Status
              </Typography>
              <Stack spacing={3} sx={{ mt: 2, flexGrow: 1 }}>
                {filingStatus?.map((status, index) => (
                  <Box key={index}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {status.type}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Due: {dayjs(status.dueDate).format('DD MMM YYYY')}
                        </Typography>
                      </Box>
                      <Chip
                        label={status.status}
                        size="small"
                        icon={status.status === 'Filed' ? <CheckCircleOutlined /> : undefined}
                        sx={{
                          bgcolor: status.status === 'Filed' ? alpha(colors.green, 0.1) : alpha(colors.warning, 0.1),
                          color: status.status === 'Filed' ? colors.green : colors.warning,
                          fontWeight: 'bold'
                        }}
                      />
                    </Stack>
                    {status.status === 'Pending' && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                        <Typography variant="caption" color="error.main" fontWeight="medium">
                          {status.daysRemaining} days remaining
                        </Typography>
                        <Button size="small" variant="outlined" color="primary">
                          Prepare
                        </Button>
                      </Stack>
                    )}
                    {index < filingStatus.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* Detailed Tables Section */}
        <Grid container spacing={3}>
          {/* GST Liability Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">GST Liability Summary</Typography>
                <Button startIcon={<AssessmentOutlined />} size="small">Detailed View</Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary' }}>Tax Component</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary' }}>Output Tax</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary' }}>Input ITC</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary' }}>Net Payable</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow hover>
                      <TableCell fontWeight="medium">CGST</TableCell>
                      <TableCell align="right">{formatCurrency(gstSummary?.outputGST.cgst || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(gstSummary?.inputITC.cgst || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(Math.max(0, (gstSummary?.outputGST.cgst || 0) - (gstSummary?.inputITC.cgst || 0)))}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell fontWeight="medium">SGST</TableCell>
                      <TableCell align="right">{formatCurrency(gstSummary?.outputGST.sgst || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(gstSummary?.inputITC.sgst || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(Math.max(0, (gstSummary?.outputGST.sgst || 0) - (gstSummary?.inputITC.sgst || 0)))}</TableCell>
                    </TableRow>
                    <TableRow hover>
                      <TableCell fontWeight="medium">IGST</TableCell>
                      <TableCell align="right">{formatCurrency(gstSummary?.outputGST.igst || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(gstSummary?.inputITC.igst || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(Math.max(0, (gstSummary?.outputGST.igst || 0) - (gstSummary?.inputITC.igst || 0)))}</TableCell>
                    </TableRow>
                    <TableRow sx={{ bgcolor: alpha(theme.palette.action.hover, 0.5) }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.purple }}>{formatCurrency(gstSummary?.outputGST.total || 0)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.green }}>{formatCurrency(gstSummary?.inputITC.total || 0)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', color: colors.red }}>{formatCurrency(gstSummary?.netLiability || 0)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* HSN Summary Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 0, borderRadius: 2, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">HSN Summary (Outward Supplies)</Typography>
                <Button startIcon={<FileDownloadOutlined />} size="small">Export HSN</Button>
              </Box>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>HSN Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Quantity</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>Taxable Value</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>CGST</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>SGST</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold', textTransform: 'uppercase', color: 'text.secondary', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>IGST</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {hsnData?.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ fontWeight: 'medium' }}>{row.hsnCode}</TableCell>
                        <TableCell>{row.description}</TableCell>
                        <TableCell align="right">{row.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(row.taxableValue)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.cgst)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.sgst)}</TableCell>
                        <TableCell align="right">{formatCurrency(row.igst)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Shortcuts Section */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Registers & Quick Exports
          </Typography>
          <Grid container spacing={2}>
            {['GSTR-1 JSON', 'GSTR-3B Summary Excel', 'Outward Supply Register', 'Input Tax Register'].map((item, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={item.includes('JSON') ? <DescriptionOutlined /> : item.includes('Excel') ? <AssessmentOutlined /> : <PictureAsPdfOutlined />}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 2,
                    color: 'text.primary',
                    borderColor: theme.palette.divider,
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  {item}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Box>
      </motion.div>
    </Box>
  );
}
