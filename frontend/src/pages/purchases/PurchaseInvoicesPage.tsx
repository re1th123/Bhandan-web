import React, { useState } from 'react';
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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Receipt as ReceiptIcon,
  AccountBalanceWallet as PaymentIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { supabase } from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';
import { alpha, useTheme } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// --- Types ---
interface LineItem {
  id: string;
  product_name: string;
  quantity: number;
  rate: number;
  gst_rate: number;
  cgst: number;
  sgst: number;
  total: number;
}

interface PurchaseInvoice {
  id: string;
  business_id: string;
  invoice_no: string;
  supplier_id: string;
  supplier_name: string; // From join
  date: string;
  due_date: string;
  total_amount: number;
  gst_amount: number;
  items_json: LineItem[];
  payment_status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  amount_paid: number;
  created_at: string;
}

interface Supplier {
  id: string;
  name: string;
  gstin: string;
}

// --- Mock Data ---
const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'TechCorp Electronics', gstin: '27AADCB2230M1Z2' },
  { id: 's2', name: 'Global Traders', gstin: '29BBDCB2230M1Z2' },
  { id: 's3', name: 'Mega Supplies Ltd', gstin: '24CCDCB2230M1Z2' },
];

const mockInvoices: PurchaseInvoice[] = [
  {
    id: 'pi1',
    business_id: 'biz1',
    invoice_no: 'PINV-2025-001',
    supplier_id: 's1',
    supplier_name: 'TechCorp Electronics',
    date: '2025-05-10',
    due_date: '2025-06-10',
    total_amount: 118000,
    gst_amount: 18000,
    amount_paid: 118000,
    payment_status: 'Paid',
    items_json: [
      { id: 'i1', product_name: 'Laptops', quantity: 2, rate: 50000, gst_rate: 18, cgst: 9000, sgst: 9000, total: 118000 }
    ],
    created_at: '2025-05-10T10:00:00Z',
  },
  {
    id: 'pi2',
    business_id: 'biz1',
    invoice_no: 'PINV-2025-002',
    supplier_id: 's2',
    supplier_name: 'Global Traders',
    date: '2025-06-20',
    due_date: '2025-07-20',
    total_amount: 250000,
    gst_amount: 38135.6,
    amount_paid: 100000,
    payment_status: 'Partial',
    items_json: [],
    created_at: '2025-06-20T11:00:00Z',
  },
  {
    id: 'pi3',
    business_id: 'biz1',
    invoice_no: 'PINV-2025-003',
    supplier_id: 's3',
    supplier_name: 'Mega Supplies Ltd',
    date: '2025-07-01',
    due_date: dayjs().subtract(5, 'day').format('YYYY-MM-DD'),
    total_amount: 75000,
    gst_amount: 11440.6,
    amount_paid: 0,
    payment_status: 'Overdue',
    items_json: [],
    created_at: '2025-07-01T09:30:00Z',
  },
  {
    id: 'pi4',
    business_id: 'biz1',
    invoice_no: 'PINV-2025-004',
    supplier_id: 's1',
    supplier_name: 'TechCorp Electronics',
    date: '2025-07-22',
    due_date: dayjs().add(15, 'day').format('YYYY-MM-DD'),
    total_amount: 450000,
    gst_amount: 68644,
    amount_paid: 0,
    payment_status: 'Unpaid',
    items_json: [],
    created_at: '2025-07-22T14:15:00Z',
  },
];

const mockSupplierPayables = [
  { name: 'TechCorp Electronics', payable: 450000, paid: 118000 },
  { name: 'Global Traders', payable: 150000, paid: 100000 },
  { name: 'Mega Supplies', payable: 75000, paid: 0 },
];

// --- Helpers ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Paid': return '#43A047';
    case 'Partial': return '#F9A825';
    case 'Unpaid': return '#E53935';
    case 'Overdue': return '#B71C1C';
    default: return '#757575';
  }
};

export default function PurchaseInvoicesPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Dialog States
  const [openCreate, setOpenCreate] = useState(false);
  const [openPayment, setOpenPayment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<PurchaseInvoice | null>(null);

  // Form States for Create Invoice
  const [supplierId, setSupplierId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState(dayjs().add(30, 'day').format('YYYY-MM-DD'));
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: '1', product_name: '', quantity: 1, rate: 0, gst_rate: 18, cgst: 0, sgst: 0, total: 0 }]);
  
  // Form States for Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');

  // Queries
  const { data: invoices = mockInvoices } = useQuery({
    queryKey: ['purchaseInvoices', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness?.id) return mockInvoices;
      const { data, error } = await supabase
        .from('purchase_invoices')
        .select('*, suppliers(name)')
        .eq('business_id', activeBusiness.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(d => ({
          ...d,
          supplier_name: (d.suppliers as any)?.name || 'Unknown',
        })) as PurchaseInvoice[];
      }
      return mockInvoices;
    },
  });

  const { data: suppliers = mockSuppliers } = useQuery({
    queryKey: ['suppliers', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness?.id) return mockSuppliers;
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('business_id', activeBusiness.id);
      if (error) throw error;
      return data?.length ? data : mockSuppliers;
    },
  });

  // Derived Data
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          inv.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.payment_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = invoices.length;
  const totalPurchaseValue = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.amount_paid, 0);
  const totalOutstanding = totalPurchaseValue - totalPaid;
  const totalOverdue = invoices.filter(i => i.payment_status === 'Overdue').reduce((sum, inv) => sum + (inv.total_amount - inv.amount_paid), 0);

  // Calculate Create Form Totals
  const formSubtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const formCgst = lineItems.reduce((sum, item) => sum + item.cgst, 0);
  const formSgst = lineItems.reduce((sum, item) => sum + item.sgst, 0);
  const formTotal = formSubtotal + formCgst + formSgst;

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { id: Date.now().toString(), product_name: '', quantity: 1, rate: 0, gst_rate: 18, cgst: 0, sgst: 0, total: 0 }]);
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems];
    const item = { ...newItems[index], [field]: value };
    
    if (['quantity', 'rate', 'gst_rate'].includes(field)) {
      const base = item.quantity * item.rate;
      const gstTotal = base * (item.gst_rate / 100);
      item.cgst = gstTotal / 2;
      item.sgst = gstTotal / 2;
      item.total = base + item.cgst + item.sgst;
    }
    
    newItems[index] = item;
    setLineItems(newItems);
  };

  const handleRemoveLineItem = (index: number) => {
    const newItems = [...lineItems];
    newItems.splice(index, 1);
    setLineItems(newItems);
  };

  const handleSaveInvoice = () => {
    setOpenCreate(false);
  };

  const handleRecordPayment = () => {
    setOpenPayment(false);
  };

  const openPaymentDialog = (invoice: PurchaseInvoice) => {
    setSelectedInvoice(invoice);
    setPaymentAmount((invoice.total_amount - invoice.amount_paid).toString());
    setOpenPayment(true);
  };

  // AP Aging Buckets logic
  const currentAP = invoices.filter(i => i.payment_status !== 'Paid' && dayjs(i.due_date).isAfter(dayjs())).reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);
  const ap1_30 = invoices.filter(i => i.payment_status !== 'Paid' && dayjs().diff(dayjs(i.due_date), 'day') > 0 && dayjs().diff(dayjs(i.due_date), 'day') <= 30).reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);
  const ap31_60 = invoices.filter(i => i.payment_status !== 'Paid' && dayjs().diff(dayjs(i.due_date), 'day') > 30 && dayjs().diff(dayjs(i.due_date), 'day') <= 60).reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);
  const ap60plus = invoices.filter(i => i.payment_status !== 'Paid' && dayjs().diff(dayjs(i.due_date), 'day') > 60).reduce((sum, i) => sum + (i.total_amount - i.amount_paid), 0);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Purchase Invoices</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          sx={{ bgcolor: '#5C6BC0', '&:hover': { bgcolor: '#3F51B5' } }}
          onClick={() => setOpenCreate(true)}
        >
          Create Bill
        </Button>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Purchases', value: formatCurrency(totalPurchaseValue), icon: <ReceiptIcon />, color: '#0288D1' },
          { label: 'Total Invoices', value: totalInvoices, icon: <CheckCircleIcon />, color: '#43A047' },
          { label: 'Outstanding Payables', value: formatCurrency(totalOutstanding), icon: <PaymentIcon />, color: '#F9A825' },
          { label: 'Overdue Payables', value: formatCurrency(totalOverdue), icon: <WarningIcon />, color: '#E53935' },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                p: 2, 
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
              }}>
                <Box sx={{ 
                  backgroundColor: alpha(kpi.color, 0.1), 
                  p: 1.5, 
                  borderRadius: 2, 
                  mr: 2,
                  display: 'flex',
                  color: kpi.color
                }}>
                  {kpi.icon}
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">{kpi.label}</Typography>
                  <Typography variant="h5" fontWeight="bold">{kpi.value}</Typography>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* AP Aging */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>AP Aging Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">Current</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(currentAP)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={totalOutstanding ? (currentAP / totalOutstanding) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#43A047', 0.2), '& .MuiLinearProgress-bar': { bgcolor: '#43A047' } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">1-30 Days Past Due</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(ap1_30)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={totalOutstanding ? (ap1_30 / totalOutstanding) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#F9A825', 0.2), '& .MuiLinearProgress-bar': { bgcolor: '#F9A825' } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">31-60 Days Past Due</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(ap31_60)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={totalOutstanding ? (ap31_60 / totalOutstanding) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#FB8C00', 0.2), '& .MuiLinearProgress-bar': { bgcolor: '#FB8C00' } }} />
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">60+ Days Past Due</Typography>
                    <Typography variant="body2" fontWeight="bold" color="error">{formatCurrency(ap60plus)}</Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={totalOutstanding ? (ap60plus / totalOutstanding) * 100 : 0} sx={{ height: 8, borderRadius: 4, bgcolor: alpha('#E53935', 0.2), '& .MuiLinearProgress-bar': { bgcolor: '#E53935' } }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Supplier Payables */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Supplier Payables</Typography>
              <Box sx={{ height: 250, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart data={mockSupplierPayables} layout="vertical" margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(val) => `₹${val/1000}k`} />
                    <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 12}} />
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="paid" name="Paid Amount" stackId="a" fill="#43A047" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="payable" name="Outstanding" stackId="a" fill="#E53935" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            placeholder="Search invoice or supplier..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Partial">Partial</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<FilterIcon />}>
            More Filters
          </Button>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <TableContainer component={Paper} elevation={1}>
        <Table sx={{ minWidth: 800 }}>
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Invoice No</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Supplier</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Due Date</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Amount</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="right">Balance</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredInvoices.map((invoice, idx) => {
              const statusColor = getStatusColor(invoice.payment_status);
              const balance = invoice.total_amount - invoice.amount_paid;
              return (
                <motion.tr
                  key={invoice.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ display: 'table-row', borderBottom: '1px solid rgba(224, 224, 224, 1)' }}
                >
                  <TableCell sx={{ fontWeight: 'medium' }}>{invoice.invoice_no}</TableCell>
                  <TableCell>{dayjs(invoice.date).format('DD MMM YYYY')}</TableCell>
                  <TableCell>{invoice.supplier_name}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: invoice.payment_status === 'Overdue' ? 'error.main' : 'inherit' }}>
                      {invoice.payment_status === 'Overdue' && <WarningIcon fontSize="small" color="error" />}
                      {dayjs(invoice.due_date).format('DD MMM YYYY')}
                    </Box>
                  </TableCell>
                  <TableCell align="right">{formatCurrency(invoice.total_amount)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: balance > 0 ? 'bold' : 'normal' }}>
                    {formatCurrency(balance)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={invoice.payment_status}
                      size="small"
                      sx={{
                        bgcolor: alpha(statusColor, 0.12),
                        color: statusColor,
                        fontWeight: 'bold',
                        minWidth: 80
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Record Payment">
                      <span>
                        <IconButton 
                          size="small" 
                          color="primary" 
                          disabled={invoice.payment_status === 'Paid'}
                          onClick={() => openPaymentDialog(invoice)}
                        >
                          <PaymentIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="More Actions">
                      <IconButton size="small">
                        <MoreVertIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </motion.tr>
              );
            })}
            {filteredInvoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="text.secondary">No invoices found matching criteria.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Invoice Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Record Purchase Invoice</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Supplier</InputLabel>
                <Select value={supplierId} label="Supplier" onChange={(e) => setSupplierId(e.target.value as string)}>
                  {suppliers.map(s => <MenuItem key={s.id} value={s.id}>{s.name} ({s.gstin})</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth size="small" label="Invoice No" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth size="small" type="date" label="Invoice Date" InputLabelProps={{ shrink: true }} value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField fullWidth size="small" type="date" label="Due Date" InputLabelProps={{ shrink: true }} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Line Items</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell>Product / Description</TableCell>
                  <TableCell width="10%">Qty</TableCell>
                  <TableCell width="15%">Rate (₹)</TableCell>
                  <TableCell width="10%">GST %</TableCell>
                  <TableCell width="12%">CGST (₹)</TableCell>
                  <TableCell width="12%">SGST (₹)</TableCell>
                  <TableCell width="15%" align="right">Total (₹)</TableCell>
                  <TableCell width="5%"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {lineItems.map((item, idx) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <TextField fullWidth size="small" variant="standard" placeholder="Item name" value={item.product_name} onChange={(e) => handleLineItemChange(idx, 'product_name', e.target.value)} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" variant="standard" type="number" value={item.quantity} onChange={(e) => handleLineItemChange(idx, 'quantity', Number(e.target.value))} />
                    </TableCell>
                    <TableCell>
                      <TextField fullWidth size="small" variant="standard" type="number" value={item.rate} onChange={(e) => handleLineItemChange(idx, 'rate', Number(e.target.value))} />
                    </TableCell>
                    <TableCell>
                      <Select fullWidth size="small" variant="standard" value={item.gst_rate} onChange={(e) => handleLineItemChange(idx, 'gst_rate', Number(e.target.value))}>
                        <MenuItem value={0}>0%</MenuItem>
                        <MenuItem value={5}>5%</MenuItem>
                        <MenuItem value={12}>12%</MenuItem>
                        <MenuItem value={18}>18%</MenuItem>
                        <MenuItem value={28}>28%</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell>{item.cgst.toFixed(2)}</TableCell>
                    <TableCell>{item.sgst.toFixed(2)}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>{item.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <IconButton size="small" color="error" onClick={() => handleRemoveLineItem(idx)} disabled={lineItems.length === 1}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button startIcon={<AddIcon />} onClick={handleAddLineItem} sx={{ mb: 3 }}>Add Row</Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Box sx={{ width: 300 }}>
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography align="right">Subtotal:</Typography></Grid>
                <Grid item xs={6}><Typography align="right">{formatCurrency(formSubtotal)}</Typography></Grid>
                <Grid item xs={6}><Typography align="right">CGST:</Typography></Grid>
                <Grid item xs={6}><Typography align="right">{formatCurrency(formCgst)}</Typography></Grid>
                <Grid item xs={6}><Typography align="right">SGST:</Typography></Grid>
                <Grid item xs={6}><Typography align="right">{formatCurrency(formSgst)}</Typography></Grid>
                <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
                <Grid item xs={6}><Typography align="right" variant="h6" fontWeight="bold">Total:</Typography></Grid>
                <Grid item xs={6}><Typography align="right" variant="h6" fontWeight="bold" color="primary.main">{formatCurrency(formTotal)}</Typography></Grid>
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenCreate(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleSaveInvoice} sx={{ bgcolor: '#5C6BC0' }}>Save Invoice</Button>
        </DialogActions>
      </Dialog>

      {/* Record Payment Dialog */}
      <Dialog open={openPayment} onClose={() => setOpenPayment(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Record Payment</DialogTitle>
        <DialogContent dividers>
          {selectedInvoice && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">Invoice No: {selectedInvoice.invoice_no}</Typography>
              <Typography variant="body2" color="text.secondary">Supplier: {selectedInvoice.supplier_name}</Typography>
              <Typography variant="body1" fontWeight="bold" sx={{ mt: 1 }}>
                Outstanding Amount: {formatCurrency(selectedInvoice.total_amount - selectedInvoice.amount_paid)}
              </Typography>
            </Box>
          )}
          
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Amount Paid"
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            <TextField
              fullWidth
              label="Payment Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <FormControl fullWidth>
              <InputLabel>Payment Mode</InputLabel>
              <Select value={paymentMode} label="Payment Mode" onChange={(e) => setPaymentMode(e.target.value)}>
                <MenuItem value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="Cheque">Cheque</MenuItem>
                <MenuItem value="Cash">Cash</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenPayment(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleRecordPayment} sx={{ bgcolor: '#43A047', '&:hover': { bgcolor: '#2E7D32' } }}>
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
