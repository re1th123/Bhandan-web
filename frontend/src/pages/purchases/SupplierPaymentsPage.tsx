import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Divider, alpha, useTheme, Tooltip, MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Plus, Search, Filter, Eye, FileText, CreditCard, Banknote, Clock, CheckCircle2, X, Building2, IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const mockPayments = [
  { id: 'PAY-2026-101', supplier: 'Reliance Retail Wholesale', invRef: 'INV-RR-001', date: '2026-07-25', amount: 450000, mode: 'Bank Transfer', status: 'Completed' },
  { id: 'PAY-2026-102', supplier: 'ITC Limited', invRef: 'INV-ITC-092', date: '2026-07-24', amount: 125000, mode: 'UPI', status: 'Completed' },
  { id: 'PAY-2026-103', supplier: 'Hindustan Unilever', invRef: 'INV-HUL-112', date: '2026-07-26', amount: 850000, mode: 'Cheque', status: 'Pending' },
  { id: 'PAY-2026-104', supplier: 'Britannia Industries', invRef: 'INV-BRT-334', date: '2026-07-20', amount: 230000, mode: 'Bank Transfer', status: 'Completed' },
  { id: 'PAY-2026-105', supplier: 'Adani Wilmar', invRef: 'INV-ADW-045', date: '2026-07-27', amount: 600000, mode: 'Cash', status: 'Pending' },
  { id: 'PAY-2026-106', supplier: 'Patanjali Ayurved', invRef: 'INV-PAT-881', date: '2026-07-15', amount: 320000, mode: 'Bank Transfer', status: 'Failed' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return '#2E7D32';
    case 'Pending': return '#E65100';
    case 'Failed': return '#C62828';
    default: return '#546E7A';
  }
};

const SupplierPaymentsPage = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);

  const filteredPayments = mockPayments.filter(pay => 
    (filterMode === 'All' || pay.mode === filterMode) &&
    (pay.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || pay.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Banknote size={32} color={theme.palette.primary.main} />
          Supplier Payments
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenDialog(true)}>
          Record Payment
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Payments (Month)', value: '₹42.5 L', icon: <IndianRupee size={24} color="#1565C0" />, bg: alpha('#1565C0', 0.1) },
          { title: 'Pending Payments', value: '₹14.2 L', icon: <Clock size={24} color="#E65100" />, bg: alpha('#E65100', 0.1) },
          { title: 'Overdue Amount', value: '₹3.8 L', icon: <X size={24} color="#C62828" />, bg: alpha('#C62828', 0.1) },
          { title: 'Avg Payment Days', value: '18 Days', icon: <Calendar size={24} color="#00695C" />, bg: alpha('#00695C', 0.1) },
        ].map((kpi, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: kpi.bg }}>
                    {kpi.icon}
                  </Box>
                  <Box>
                    <Typography color="text.secondary" variant="body2" fontWeight={500}>{kpi.title}</Typography>
                    <Typography variant="h5" fontWeight="bold">{kpi.value}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search Supplier, Payment No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>,
            }}
            sx={{ width: 300 }}
          />
          <TextField
            select
            size="small"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            sx={{ width: 200 }}
            label="Payment Mode"
          >
            {['All', 'Bank Transfer', 'UPI', 'Cheque', 'Cash'].map(mode => (
              <MenuItem key={mode} value={mode}>{mode}</MenuItem>
            ))}
          </TextField>
          <Button startIcon={<Filter size={18} />} variant="outlined">More Filters</Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell fontWeight="bold">Payment No.</TableCell>
                <TableCell fontWeight="bold">Supplier</TableCell>
                <TableCell fontWeight="bold">Invoice Ref</TableCell>
                <TableCell fontWeight="bold">Date</TableCell>
                <TableCell fontWeight="bold" align="right">Amount</TableCell>
                <TableCell fontWeight="bold">Mode</TableCell>
                <TableCell fontWeight="bold">Status</TableCell>
                <TableCell fontWeight="bold" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((pay) => (
                <TableRow key={pay.id} hover>
                  <TableCell fontWeight="medium">{pay.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Building2 size={16} color={theme.palette.text.secondary} />
                      {pay.supplier}
                    </Box>
                  </TableCell>
                  <TableCell>{pay.invRef}</TableCell>
                  <TableCell>{dayjs(pay.date).format('DD MMM YYYY')}</TableCell>
                  <TableCell align="right" fontWeight="bold">{formatCurrency(pay.amount)}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CreditCard size={16} color={theme.palette.text.secondary} />
                      {pay.mode}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={pay.status} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(getStatusColor(pay.status), 0.1), 
                        color: getStatusColor(pay.status),
                        fontWeight: 600,
                        borderRadius: 1
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Receipt">
                      <IconButton size="small"><FileText size={18} /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Record Supplier Payment
          <IconButton onClick={() => setOpenDialog(false)}><X size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField select fullWidth label="Select Supplier" defaultValue="">
                {['Reliance Retail Wholesale', 'ITC Limited', 'Hindustan Unilever'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Outstanding Balance: <strong>₹12,50,000</strong>
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Invoice Reference" placeholder="Optional" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField type="date" fullWidth label="Payment Date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Amount" 
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Payment Mode" defaultValue="Bank Transfer">
                {['Bank Transfer', 'UPI', 'Cheque', 'Cash'].map(m => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Reference Number" placeholder="Txn ID / Cheque No" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={2} label="Remarks" placeholder="Any additional notes..." />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary">Record Payment</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SupplierPaymentsPage;
