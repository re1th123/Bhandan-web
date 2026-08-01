import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Divider,
  Paper,
  TableContainer,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Receipt,
  Download,
  Visibility,
  Print,
  Delete,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';
import { pdf } from '@react-pdf/renderer';
import TaxInvoicePdf from '../../components/pdf/TaxInvoicePdf';
import QuickSaleModal from '../../components/sales/QuickSaleModal';

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Types
interface TaxInvoice {
  id: string;
  business_id: string;
  invoice_no: string;
  customer_id: string;
  date: string;
  due_date: string;
  total_amount: number;
  gst_amount: number;
  items_json: any;
  payment_status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  created_at: string;
  customers?: {
    name: string;
    gstin: string;
  };
}

// Mock Data Fallbacks
const MOCK_INVOICES: TaxInvoice[] = [
  {
    id: '1',
    business_id: 'biz-1',
    invoice_no: 'TAX-2025-001',
    customer_id: 'cust-1',
    date: '2026-07-01',
    due_date: '2026-07-15',
    total_amount: 118000,
    gst_amount: 18000,
    payment_status: 'Paid',
    items_json: [],
    created_at: '2026-07-01T10:00:00Z',
    customers: { name: 'Acme Corp', gstin: '27AADCB2230M1Z2' },
  },
  {
    id: '2',
    business_id: 'biz-1',
    invoice_no: 'TAX-2025-002',
    customer_id: 'cust-2',
    date: '2026-07-10',
    due_date: '2026-07-24',
    total_amount: 59000,
    gst_amount: 9000,
    payment_status: 'Unpaid',
    items_json: [],
    created_at: '2026-07-10T11:00:00Z',
    customers: { name: 'TechSolutions Ltd', gstin: '29ABCDE1234F1Z5' },
  },
  {
    id: '3',
    business_id: 'biz-1',
    invoice_no: 'TAX-2025-003',
    customer_id: 'cust-3',
    date: '2026-06-15',
    due_date: '2026-06-30',
    total_amount: 236000,
    gst_amount: 36000,
    payment_status: 'Overdue',
    items_json: [],
    created_at: '2026-06-15T09:30:00Z',
    customers: { name: 'Global Industries', gstin: '07BBDDE4455G1Z9' },
  },
  {
    id: '4',
    business_id: 'biz-1',
    invoice_no: 'TAX-2025-004',
    customer_id: 'cust-1',
    date: '2026-07-20',
    due_date: '2026-08-05',
    total_amount: 47200,
    gst_amount: 7200,
    payment_status: 'Partial',
    items_json: [],
    created_at: '2026-07-20T14:15:00Z',
    customers: { name: 'Acme Corp', gstin: '27AADCB2230M1Z2' },
  }
];

import { fetchBusinessTableData } from '../../lib/dataStore';

export default function TaxInvoicesPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const bizId = activeBusiness?.id || 'mock-biz-id';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<TaxInvoice | null>(null);

  // Queries
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['tax-invoices', bizId],
    queryFn: () => fetchBusinessTableData<TaxInvoice>(bizId, 'tax_invoices', MOCK_INVOICES),
    enabled: !!bizId,
  });

  // KPIs
  const totalInvoices = invoices.length;
  const totalRevenue = invoices.reduce((acc, inv) => acc + inv.total_amount, 0);
  const outstanding = invoices.filter(i => i.payment_status === 'Unpaid' || i.payment_status === 'Partial').reduce((acc, inv) => acc + inv.total_amount, 0);
  const overdue = invoices.filter(i => i.payment_status === 'Overdue').reduce((acc, inv) => acc + inv.total_amount, 0);

  // Filtered
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = inv.invoice_no.toLowerCase().includes(searchTerm.toLowerCase()) || inv.customers?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || inv.payment_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  // Chart Data
  const chartData = [
    { name: 'Paid', value: invoices.filter(i => i.payment_status === 'Paid').length, color: '#4CAF50' },
    { name: 'Partial', value: invoices.filter(i => i.payment_status === 'Partial').length, color: '#FF9800' },
    { name: 'Unpaid', value: invoices.filter(i => i.payment_status === 'Unpaid').length, color: '#F44336' },
    { name: 'Overdue', value: invoices.filter(i => i.payment_status === 'Overdue').length, color: '#B71C1C' },
  ].filter(d => d.value > 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return '#4CAF50';
      case 'Partial': return '#FF9800';
      case 'Unpaid': return '#F44336';
      case 'Overdue': return '#B71C1C';
      default: return '#757575';
    }
  };

  const handleRowClick = (invoice: TaxInvoice) => {
    setSelectedInvoice(invoice);
    setViewDialogOpen(true);
  };

  const handleDownloadPdf = async (invoice: TaxInvoice, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const blob = await pdf(<TaxInvoicePdf invoice={invoice} business={activeBusiness} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Tax-Invoice-${invoice.invoice_no}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF", error);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1A237E' }}>
        Tax Invoices
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage your GST-compliant invoices and track payments.
      </Typography>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Invoices', value: totalInvoices, color: '#2196F3' },
          { title: 'Total Revenue', value: formatCurrency(totalRevenue), color: '#4CAF50' },
          { title: 'Outstanding', value: formatCurrency(outstanding), color: '#FF9800' },
          { title: 'Overdue Amount', value: formatCurrency(overdue), color: '#F44336' },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)', 
                borderTop: `4px solid ${kpi.color}`,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#333' }}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* AR Aging */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>AR Aging Summary</Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: alpha('#4CAF50', 0.1), border: '1px solid', borderColor: '#4CAF50' }}>
                  <Typography variant="body2" color="#4CAF50" fontWeight="bold">Current</Typography>
                  <Typography variant="h6">{formatCurrency(outstanding * 0.4)}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: alpha('#FF9800', 0.1), border: '1px solid', borderColor: '#FF9800' }}>
                  <Typography variant="body2" color="#FF9800" fontWeight="bold">1-30 Days</Typography>
                  <Typography variant="h6">{formatCurrency(outstanding * 0.3)}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: alpha('#F44336', 0.1), border: '1px solid', borderColor: '#F44336' }}>
                  <Typography variant="body2" color="#F44336" fontWeight="bold">31-60 Days</Typography>
                  <Typography variant="h6">{formatCurrency(outstanding * 0.2)}</Typography>
                </Paper>
                <Paper sx={{ p: 2, flex: 1, minWidth: 150, bgcolor: alpha('#B71C1C', 0.1), border: '1px solid', borderColor: '#B71C1C' }}>
                  <Typography variant="body2" color="#B71C1C" fontWeight="bold">60+ Days</Typography>
                  <Typography variant="h6">{formatCurrency(overdue)}</Typography>
                </Paper>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Status Chart */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Status Breakdown</Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 4 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search invoice or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Paid">Paid</MenuItem>
              <MenuItem value="Partial">Partial</MenuItem>
              <MenuItem value="Unpaid">Unpaid</MenuItem>
              <MenuItem value="Overdue">Overdue</MenuItem>
            </Select>
          </FormControl>
          <Button variant="outlined" startIcon={<FilterList />}>Advanced Filters</Button>
          <Button variant="contained" sx={{ bgcolor: '#5C6BC0', '&:hover': { bgcolor: '#3F51B5' } }} startIcon={<Add />} onClick={() => setCreateDialogOpen(true)}>
            Create Invoice
          </Button>
        </Box>
        
        {/* Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: alpha('#5C6BC0', 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Invoice No</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Customer</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#555' }}>Due Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#555' }}>Amount</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: '#555' }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: '#555' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id} hover sx={{ cursor: 'pointer', '&:last-child td, &:last-child th': { border: 0 } }} onClick={() => handleRowClick(inv)}>
                  <TableCell sx={{ fontWeight: 500 }}>{inv.invoice_no}</TableCell>
                  <TableCell>{inv.customers?.name || 'Unknown'}</TableCell>
                  <TableCell>{dayjs(inv.date).format('DD MMM YYYY')}</TableCell>
                  <TableCell>{dayjs(inv.due_date).format('DD MMM YYYY')}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>{formatCurrency(inv.total_amount)}</TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={inv.payment_status} 
                      size="small"
                      sx={{ 
                        bgcolor: alpha(getStatusColor(inv.payment_status), 0.12),
                        color: getStatusColor(inv.payment_status),
                        fontWeight: 600,
                        minWidth: 80
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleRowClick(inv); }}><Visibility fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={(e) => handleDownloadPdf(inv, e)}><Download fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {filteredInvoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No invoices found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* FAB for Mobile/Quick Access */}
      <Fab 
        color="primary" 
        aria-label="add" 
        sx={{ position: 'fixed', bottom: 32, right: 32, bgcolor: '#5C6BC0', '&:hover': { bgcolor: '#3F51B5' }, display: { md: 'none' } }}
        onClick={() => setCreateDialogOpen(true)}
      >
        <Add />
      </Fab>

      {/* Streamlined Quick Sale & Invoice Creation Dialog */}
      <QuickSaleModal
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Invoice Detail Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
        {selectedInvoice && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>Invoice {selectedInvoice.invoice_no}</Typography>
                <Typography variant="body2" color="text.secondary">Billed to {selectedInvoice.customers?.name}</Typography>
              </Box>
              <Chip 
                label={selectedInvoice.payment_status} 
                sx={{ 
                  bgcolor: alpha(getStatusColor(selectedInvoice.payment_status), 0.12),
                  color: getStatusColor(selectedInvoice.payment_status),
                  fontWeight: 600
                }} 
              />
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Invoice Date</Typography>
                  <Typography variant="body1" fontWeight={500}>{dayjs(selectedInvoice.date).format('DD MMM YYYY')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Due Date</Typography>
                  <Typography variant="body1" fontWeight={500}>{dayjs(selectedInvoice.due_date).format('DD MMM YYYY')}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">GSTIN</Typography>
                  <Typography variant="body1" fontWeight={500}>{selectedInvoice.customers?.gstin || 'N/A'}</Typography>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary">Subtotal</Typography>
                <Typography>{formatCurrency(selectedInvoice.total_amount - selectedInvoice.gst_amount)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="text.secondary" sx={{ color: '#9C27B0' }}>Total GST</Typography>
                <Typography sx={{ color: '#9C27B0' }}>{formatCurrency(selectedInvoice.gst_amount)}</Typography>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="h6" fontWeight={700}>Total Amount</Typography>
                <Typography variant="h6" fontWeight={700} color="primary">{formatCurrency(selectedInvoice.total_amount)}</Typography>
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button startIcon={<Print />}>Print</Button>
              <Button startIcon={<Download />} onClick={() => handleDownloadPdf(selectedInvoice)}>PDF</Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setViewDialogOpen(false)} variant="contained" color="primary">Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
