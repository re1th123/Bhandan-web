import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Stack,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Plus,
  Filter,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Eye,
  Download,
  X,
  CreditCard,
  Wallet,
  Landmark,
  FileText
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';
import dayjs from 'dayjs';

// --- Types ---
interface Customer {
  id: string;
  name: string;
  phone: string;
}

interface Payment {
  id: string;
  receipt_no: string;
  customer_id: string;
  customer_name: string;
  payment_date: string;
  amount: number;
  payment_method: string;
  reference_no: string;
  status: 'completed' | 'pending' | 'failed' | 'partially_allocated';
  allocated_invoices: { invoice_no: string; amount: number }[];
  notes?: string;
}

interface OutstandingInvoice {
  id: string;
  invoice_no: string;
  total_amount: number;
  due_date: string;
  outstanding_amount: number;
  customer_id: string;
}

// --- Mock Data Fallbacks ---
const MOCK_CUSTOMERS: Customer[] = [
  { id: 'c1', name: 'Acme Traders', phone: '9876543210' },
  { id: 'c2', name: 'Global Logistics', phone: '8765432109' },
  { id: 'c3', name: 'City Mart', phone: '7654321098' },
];

const MOCK_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    receipt_no: 'RCT-2026-001',
    customer_id: 'c1',
    customer_name: 'Acme Traders',
    payment_date: '2026-07-25',
    amount: 55000,
    payment_method: 'Bank Transfer',
    reference_no: 'UTR123456789',
    status: 'completed',
    allocated_invoices: [{ invoice_no: 'INV-26-042', amount: 55000 }]
  },
  {
    id: 'p2',
    receipt_no: 'RCT-2026-002',
    customer_id: 'c2',
    customer_name: 'Global Logistics',
    payment_date: '2026-07-24',
    amount: 15000,
    payment_method: 'UPI',
    reference_no: 'UPI987654321',
    status: 'completed',
    allocated_invoices: [{ invoice_no: 'INV-26-040', amount: 10000 }, { invoice_no: 'INV-26-041', amount: 5000 }]
  },
  {
    id: 'p3',
    receipt_no: 'RCT-2026-003',
    customer_id: 'c3',
    customer_name: 'City Mart',
    payment_date: '2026-07-23',
    amount: 8000,
    payment_method: 'Cash',
    reference_no: '',
    status: 'partially_allocated',
    allocated_invoices: [{ invoice_no: 'INV-26-039', amount: 5000 }]
  },
  {
    id: 'p4',
    receipt_no: 'RCT-2026-004',
    customer_id: 'c1',
    customer_name: 'Acme Traders',
    payment_date: '2026-07-20',
    amount: 120000,
    payment_method: 'Cheque',
    reference_no: 'CHQ-882211',
    status: 'pending',
    allocated_invoices: []
  }
];

const MOCK_OUTSTANDING_INVOICES: OutstandingInvoice[] = [
  { id: 'i1', invoice_no: 'INV-26-050', total_amount: 25000, outstanding_amount: 25000, due_date: '2026-07-20', customer_id: 'c1' },
  { id: 'i2', invoice_no: 'INV-26-051', total_amount: 45000, outstanding_amount: 15000, due_date: '2026-07-22', customer_id: 'c1' },
  { id: 'i3', invoice_no: 'INV-26-052', total_amount: 12000, outstanding_amount: 12000, due_date: '2026-07-26', customer_id: 'c2' },
];

const MOCK_TREND_DATA = Array.from({ length: 30 }).map((_, i) => ({
  date: dayjs().subtract(29 - i, 'day').format('MMM DD'),
  amount: Math.floor(Math.random() * 50000) + 10000
}));

// --- Utilities ---
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

const formatShortCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

const getStatusColor = (status: string, theme: any) => {
  switch (status.toLowerCase()) {
    case 'completed': return theme.palette.success.main;
    case 'pending': return theme.palette.warning.main;
    case 'failed': return theme.palette.error.main;
    case 'partially_allocated': return theme.palette.info.main;
    default: return theme.palette.grey[500];
  }
};

const getMethodIcon = (method: string) => {
  switch (method.toLowerCase()) {
    case 'cash': return <Wallet size={16} />;
    case 'upi': return <CreditCard size={16} />;
    case 'bank transfer': return <Landmark size={16} />;
    case 'cheque': return <FileText size={16} />;
    default: return <IndianRupee size={16} />;
  }
};

const PAYMENT_METHODS = ['Cash', 'UPI', 'Bank Transfer', 'Cheque'];
const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

export default function CustomerPaymentsPage() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const activeBusiness = (user as any)?.activeBusiness;
  const bizId = activeBusiness?.id || null;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterMethod, setFilterMethod] = useState('All');
  
  // Dialog states
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [selectedPaymentDetail, setSelectedPaymentDetail] = useState<Payment | null>(null);

  // --- Data Fetching ---
  const { data: payments = MOCK_PAYMENTS, isLoading: paymentsLoading } = useQuery({
    queryKey: ['customer_payments', bizId],
    queryFn: async () => {
      if (!bizId) return MOCK_PAYMENTS;
      const { data, error } = await supabase
        .from('customer_payments')
        .select('*')
        .eq('business_id', bizId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data?.length ? data : MOCK_PAYMENTS;
    }
  });

  const { data: customers = MOCK_CUSTOMERS } = useQuery({
    queryKey: ['customers', bizId],
    queryFn: async () => {
      if (!bizId) return MOCK_CUSTOMERS;
      const { data, error } = await supabase.from('customers').select('*').eq('business_id', bizId);
      if (error) throw error;
      return data?.length ? data : MOCK_CUSTOMERS;
    }
  });

  const { data: outstandingInvoices = MOCK_OUTSTANDING_INVOICES } = useQuery({
    queryKey: ['outstanding_invoices', bizId],
    queryFn: async () => {
      if (!bizId) return MOCK_OUTSTANDING_INVOICES;
      // Mocking for now as complex join needed
      return MOCK_OUTSTANDING_INVOICES;
    }
  });

  // --- Calculations ---
  const todayCollections = useMemo(() => {
    const today = dayjs().format('YYYY-MM-DD');
    return payments.filter(p => p.payment_date === today).reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const totalReceivables = 1450000; // Mocked KPI
  const overdueCollections = 320000; // Mocked KPI
  const collectionEfficiency = 85.5; // Mocked KPI

  const methodDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    payments.forEach(p => {
      dist[p.payment_method] = (dist[p.payment_method] || 0) + p.amount;
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  }, [payments]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = p.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.receipt_no.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMethod = filterMethod === 'All' || p.payment_method === filterMethod;
      return matchesSearch && matchesMethod;
    });
  }, [payments, searchTerm, filterMethod]);

  // --- Handlers ---
  const handleOpenRecord = () => setIsRecordPaymentOpen(true);
  const handleCloseRecord = () => setIsRecordPaymentOpen(false);
  const handleViewReceipt = (payment: Payment) => setSelectedPaymentDetail(payment);
  const handleCloseReceipt = () => setSelectedPaymentDetail(null);

  // --- Record Payment State ---
  const [recordData, setRecordData] = useState({
    customerId: null as string | null,
    paymentDate: dayjs().format('YYYY-MM-DD'),
    amount: '',
    paymentMethod: 'Bank Transfer',
    referenceNo: '',
  });

  const [allocations, setAllocations] = useState<Record<string, number>>({});

  const currentCustomerInvoices = useMemo(() => {
    return outstandingInvoices.filter(inv => inv.customer_id === recordData.customerId);
  }, [outstandingInvoices, recordData.customerId]);

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (Number(val) || 0), 0);
  const unallocatedAmount = (Number(recordData.amount) || 0) - totalAllocated;

  const handleAutoAllocate = () => {
    let remainingAmount = Number(recordData.amount) || 0;
    const newAllocations: Record<string, number> = {};
    
    // Sort by due date ascending
    const sortedInvoices = [...currentCustomerInvoices].sort((a, b) => dayjs(a.due_date).diff(dayjs(b.due_date)));
    
    sortedInvoices.forEach(inv => {
      if (remainingAmount > 0) {
        const allocAmount = Math.min(remainingAmount, inv.outstanding_amount);
        newAllocations[inv.id] = allocAmount;
        remainingAmount -= allocAmount;
      }
    });
    setAllocations(newAllocations);
  };

  const handleAllocationChange = (invId: string, value: string) => {
    const numValue = Number(value);
    setAllocations(prev => ({
      ...prev,
      [invId]: isNaN(numValue) ? 0 : numValue
    }));
  };

  const handleSavePayment = () => {
    // In a real app, send to Supabase here
    setIsRecordPaymentOpen(false);
    setRecordData({
      customerId: null,
      paymentDate: dayjs().format('YYYY-MM-DD'),
      amount: '',
      paymentMethod: 'Bank Transfer',
      referenceNo: '',
    });
    setAllocations({});
  };

  if (paymentsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            Customer Payments
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage receipts, collections, and invoice allocations
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleOpenRecord}
          sx={{
            bgcolor: theme.palette.primary.main,
            '&:hover': { bgcolor: theme.palette.primary.dark },
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600
          }}
        >
          Record Payment
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: "Today's Collections", value: formatCurrency(todayCollections), icon: <IndianRupee />, color: '#4CAF50' },
          { title: 'Total Receivables', value: formatShortCurrency(totalReceivables), icon: <AlertCircle />, color: '#F44336' },
          { title: 'Overdue Collections', value: formatShortCurrency(overdueCollections), icon: <TrendingUp />, color: '#FF9800' },
          { title: 'Collection Efficiency', value: `${collectionEfficiency}%`, icon: <CheckCircle2 />, color: '#2196F3' }
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: theme.shadows[2],
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                      {kpi.title}
                    </Typography>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 2, 
                      bgcolor: alpha(kpi.color, 0.1),
                      color: kpi.color,
                      display: 'flex'
                    }}>
                      {kpi.icon}
                    </Box>
                  </Stack>
                  <Typography variant="h4" fontWeight={700}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>30-Day Collection Trend</Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} tickFormatter={(val) => `₹${val/1000}k`} />
                    <RechartsTooltip 
                      cursor={{ fill: alpha(theme.palette.primary.main, 0.05) }}
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: theme.shadows[3] }}
                      formatter={(value: number) => [formatCurrency(value), 'Amount']}
                    />
                    <Bar dataKey="amount" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={3}>Payment Methods</Typography>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={methodDistribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {methodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table Section */}
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2] }}>
        <Box sx={{ p: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            placeholder="Search by receipt or customer..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 250 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={filterMethod}
              label="Payment Method"
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <MenuItem value="All">All Methods</MenuItem>
              {PAYMENT_METHODS.map(m => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<Filter size={18} />}>
            More Filters
          </Button>
        </Box>

        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Receipt No</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }} align="right">Amount</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow 
                  key={payment.id} 
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => handleViewReceipt(payment)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600} color="primary.main">
                      {payment.receipt_no}
                    </Typography>
                  </TableCell>
                  <TableCell>{dayjs(payment.payment_date).format('DD MMM YYYY')}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{payment.customer_name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                        {getMethodIcon(payment.payment_method)}
                      </Box>
                      <Typography variant="body2">{payment.payment_method}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(payment.amount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={payment.status.replace('_', ' ').toUpperCase()}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(payment.status, theme), 0.1),
                        color: getStatusColor(payment.status, theme),
                        fontWeight: 600,
                        fontSize: '0.7rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      handleViewReceipt(payment);
                    }}>
                      <Eye size={18} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" color="text.secondary">No payments found matching criteria.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Record Payment Dialog */}
      <Dialog open={isRecordPaymentOpen} onClose={handleCloseRecord} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Record Payment</Typography>
          <IconButton size="small" onClick={handleCloseRecord}><X size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={customers}
                getOptionLabel={(opt) => opt.name}
                onChange={(_, val) => setRecordData(prev => ({ ...prev, customerId: val?.id || null }))}
                renderInput={(params) => <TextField {...params} label="Select Customer" fullWidth required />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                type="date"
                label="Payment Date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={recordData.paymentDate}
                onChange={(e) => setRecordData(prev => ({ ...prev, paymentDate: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                type="number"
                label="Amount Received"
                fullWidth
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
                value={recordData.amount}
                onChange={(e) => setRecordData(prev => ({ ...prev, amount: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={recordData.paymentMethod}
                  label="Payment Method"
                  onChange={(e) => setRecordData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  {PAYMENT_METHODS.map(m => (
                    <MenuItem key={m} value={m}>{m}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Reference / Cheque No"
                fullWidth
                value={recordData.referenceNo}
                onChange={(e) => setRecordData(prev => ({ ...prev, referenceNo: e.target.value }))}
              />
            </Grid>
          </Grid>

          {recordData.customerId && currentCustomerInvoices.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle1" fontWeight={600}>Allocate to Invoices</Typography>
                <Button variant="outlined" size="small" onClick={handleAutoAllocate} disabled={!recordData.amount}>
                  Auto-Allocate Oldest First
                </Button>
              </Stack>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <TableRow>
                      <TableCell>Invoice No</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell align="right">Total Amt</TableCell>
                      <TableCell align="right">Outstanding</TableCell>
                      <TableCell align="right" sx={{ width: 150 }}>Allocate Amt (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentCustomerInvoices.map(inv => (
                      <TableRow key={inv.id}>
                        <TableCell><Typography variant="body2" fontWeight={500}>{inv.invoice_no}</Typography></TableCell>
                        <TableCell>{dayjs(inv.due_date).format('DD/MM/YYYY')}</TableCell>
                        <TableCell align="right">{formatCurrency(inv.total_amount)}</TableCell>
                        <TableCell align="right">{formatCurrency(inv.outstanding_amount)}</TableCell>
                        <TableCell align="right">
                          <TextField
                            size="small"
                            type="number"
                            value={allocations[inv.id] || ''}
                            onChange={(e) => handleAllocationChange(inv.id, e.target.value)}
                            inputProps={{ max: inv.outstanding_amount, min: 0 }}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                {unallocatedAmount > 0 ? (
                  <Alert severity="warning" icon={false} sx={{ py: 0, px: 2 }}>
                    Unallocated: <strong>{formatCurrency(unallocatedAmount)}</strong>
                  </Alert>
                ) : unallocatedAmount < 0 ? (
                  <Alert severity="error" icon={false} sx={{ py: 0, px: 2 }}>
                    Over-allocated: <strong>{formatCurrency(Math.abs(unallocatedAmount))}</strong>
                  </Alert>
                ) : (
                  <Alert severity="success" icon={false} sx={{ py: 0, px: 2 }}>
                    Fully Allocated
                  </Alert>
                )}
                <Typography variant="subtitle1" fontWeight={600}>
                  Total Allocated: {formatCurrency(totalAllocated)}
                </Typography>
              </Box>
            </Box>
          )}
          {recordData.customerId && currentCustomerInvoices.length === 0 && (
            <Alert severity="info" sx={{ mt: 4 }}>No outstanding invoices found for this customer. Payment will be kept as advance.</Alert>
          )}
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseRecord} color="inherit">Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSavePayment}
            disabled={!recordData.customerId || !recordData.amount || unallocatedAmount < 0}
          >
            Save Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Detail Modal */}
      <Dialog open={!!selectedPaymentDetail} onClose={handleCloseReceipt} maxWidth="sm" fullWidth>
        {selectedPaymentDetail && (
          <>
            <DialogTitle sx={{ pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" fontWeight={700}>Payment Receipt</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton size="small"><Download size={20} /></IconButton>
                <IconButton size="small" onClick={handleCloseReceipt}><X size={20} /></IconButton>
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: 2, mb: 3, textAlign: 'center' }}>
                <Typography variant="h3" fontWeight={700} color="primary.main" mb={1}>
                  {formatCurrency(selectedPaymentDetail.amount)}
                </Typography>
                <Chip
                  label={selectedPaymentDetail.status.replace('_', ' ').toUpperCase()}
                  size="small"
                  sx={{
                    bgcolor: alpha(getStatusColor(selectedPaymentDetail.status, theme), 0.1),
                    color: getStatusColor(selectedPaymentDetail.status, theme),
                    fontWeight: 600,
                  }}
                />
              </Box>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Receipt No</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedPaymentDetail.receipt_no}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body1" fontWeight={600}>{dayjs(selectedPaymentDetail.payment_date).format('DD MMM YYYY')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Customer</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedPaymentDetail.customer_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                  <Typography variant="body1" fontWeight={600}>{selectedPaymentDetail.payment_method}</Typography>
                </Grid>
                {selectedPaymentDetail.reference_no && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">Reference / UTR No.</Typography>
                    <Typography variant="body1" fontWeight={600}>{selectedPaymentDetail.reference_no}</Typography>
                  </Grid>
                )}
              </Grid>

              {selectedPaymentDetail.allocated_invoices.length > 0 && (
                <>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Allocated To</Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                        <TableRow>
                          <TableCell>Invoice No</TableCell>
                          <TableCell align="right">Allocated Amount</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedPaymentDetail.allocated_invoices.map((ai, i) => (
                          <TableRow key={i}>
                            <TableCell><Typography variant="body2" fontWeight={500}>{ai.invoice_no}</Typography></TableCell>
                            <TableCell align="right"><Typography variant="body2" fontWeight={600}>{formatCurrency(ai.amount)}</Typography></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
