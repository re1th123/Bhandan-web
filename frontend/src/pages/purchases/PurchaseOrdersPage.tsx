import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Divider, alpha, useTheme, Tooltip, MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Plus, Search, Filter, Eye, FileText, Package, Clock, CheckCircle2, X, Truck, ShoppingCart, IndianRupee, Edit
} from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const mockPOs = [
  { id: 'PO-2026-001', supplier: 'Reliance Retail Wholesale', date: '2026-07-20', expDelivery: '2026-07-28', items: 15, total: 450000, status: 'Received' },
  { id: 'PO-2026-002', supplier: 'ITC Limited', date: '2026-07-21', expDelivery: '2026-07-27', items: 8, total: 125000, status: 'Approved' },
  { id: 'PO-2026-003', supplier: 'Hindustan Unilever', date: '2026-07-22', expDelivery: '2026-07-30', items: 25, total: 850000, status: 'Pending Approval' },
  { id: 'PO-2026-004', supplier: 'Britannia Industries', date: '2026-07-23', expDelivery: '2026-08-01', items: 12, total: 230000, status: 'Partially Received' },
  { id: 'PO-2026-005', supplier: 'Adani Wilmar', date: '2026-07-24', expDelivery: '2026-08-05', items: 5, total: 600000, status: 'Draft' },
  { id: 'PO-2026-006', supplier: 'Patanjali Ayurved', date: '2026-07-25', expDelivery: '2026-08-02', items: 18, total: 320000, status: 'Pending Approval' },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Received': return '#2E7D32';
    case 'Approved': return '#1565C0';
    case 'Pending Approval': return '#E65100';
    case 'Partially Received': return '#00695C';
    case 'Draft': return '#546E7A';
    case 'Cancelled': return '#C62828';
    default: return '#546E7A';
  }
};

const PurchaseOrdersPage = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [openDialog, setOpenDialog] = useState(false);

  const filteredPOs = mockPOs.filter(po => 
    (filterStatus === 'All' || po.status === filterStatus) &&
    (po.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || po.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCart size={32} color={theme.palette.primary.main} />
          Purchase Orders
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenDialog(true)}>
          Create PO
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total POs', value: '1,245', icon: <FileText size={24} color="#1565C0" />, bg: alpha('#1565C0', 0.1) },
          { title: 'Pending Approval', value: '18', icon: <Clock size={24} color="#E65100" />, bg: alpha('#E65100', 0.1) },
          { title: 'Approved POs', value: '842', icon: <CheckCircle2 size={24} color="#00695C" />, bg: alpha('#00695C', 0.1) },
          { title: 'Received POs', value: '385', icon: <Package size={24} color="#2E7D32" />, bg: alpha('#2E7D32', 0.1) },
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
            placeholder="Search POs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>,
            }}
            sx={{ width: 250 }}
          />
          <TextField
            select
            size="small"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ width: 200 }}
          >
            {['All', 'Draft', 'Pending Approval', 'Approved', 'Partially Received', 'Received', 'Cancelled'].map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
          <Button startIcon={<Filter size={18} />} variant="outlined">Advanced Filters</Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell fontWeight="bold">PO No.</TableCell>
                <TableCell fontWeight="bold">Supplier</TableCell>
                <TableCell fontWeight="bold">Date</TableCell>
                <TableCell fontWeight="bold">Expected Delivery</TableCell>
                <TableCell fontWeight="bold">Items</TableCell>
                <TableCell fontWeight="bold" align="right">Total Amount</TableCell>
                <TableCell fontWeight="bold">Status</TableCell>
                <TableCell fontWeight="bold" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPOs.map((po, idx) => (
                <TableRow key={po.id} hover>
                  <TableCell fontWeight="medium">{po.id}</TableCell>
                  <TableCell>{po.supplier}</TableCell>
                  <TableCell>{dayjs(po.date).format('DD MMM YYYY')}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Truck size={16} color={theme.palette.text.secondary} />
                      {dayjs(po.expDelivery).format('DD MMM YYYY')}
                    </Box>
                  </TableCell>
                  <TableCell>{po.items}</TableCell>
                  <TableCell align="right" fontWeight="medium">{formatCurrency(po.total)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={po.status} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(getStatusColor(po.status), 0.1), 
                        color: getStatusColor(po.status),
                        fontWeight: 600,
                        borderRadius: 1
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small"><Eye size={18} /></IconButton>
                    </Tooltip>
                    {po.status === 'Pending Approval' && (
                      <>
                        <Tooltip title="Approve">
                          <IconButton size="small" color="success"><CheckCircle2 size={18} /></IconButton>
                        </Tooltip>
                        <Tooltip title="Reject">
                          <IconButton size="small" color="error"><X size={18} /></IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New Purchase Order
          <IconButton onClick={() => setOpenDialog(false)}><X size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField select fullWidth label="Supplier" defaultValue="Reliance Retail Wholesale">
                {['Reliance Retail Wholesale', 'ITC Limited', 'Hindustan Unilever'].map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField type="date" fullWidth label="Date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField type="date" fullWidth label="Expected Delivery Date" defaultValue={dayjs().add(7, 'day').format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Line Items</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell>Product</TableCell>
                      <TableCell>Qty</TableCell>
                      <TableCell>Rate</TableCell>
                      <TableCell>GST %</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><TextField size="small" placeholder="Item Name" /></TableCell>
                      <TableCell><TextField size="small" type="number" placeholder="0" sx={{ width: 80 }} /></TableCell>
                      <TableCell><TextField size="small" type="number" placeholder="0.00" sx={{ width: 100 }} /></TableCell>
                      <TableCell><TextField size="small" type="number" placeholder="18" sx={{ width: 80 }} /></TableCell>
                      <TableCell><TextField size="small" disabled placeholder="0.00" sx={{ width: 120 }} /></TableCell>
                      <TableCell><IconButton color="error" size="small"><X size={18} /></IconButton></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Button startIcon={<Plus size={16} />} sx={{ mt: 1 }}>Add Item</Button>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="outlined">Save as Draft</Button>
          <Button variant="contained">Submit for Approval</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchaseOrdersPage;
