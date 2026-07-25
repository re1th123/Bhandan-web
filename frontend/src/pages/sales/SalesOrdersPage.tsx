import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Chip, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  alpha, useTheme, InputAdornment, MenuItem, Fab, Tooltip
} from '@mui/material';
import {
  Plus, Search, Filter, Eye, FileText, Package, Clock, CheckCircle2,
  X, Truck, Edit
} from 'lucide-react';
import dayjs from 'dayjs';

interface SalesOrder {
  id: string;
  orderNo: string;
  customerName: string;
  date: string;
  itemsCount: number;
  totalAmount: number;
  status: 'Draft' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled';
}

const mockOrders: SalesOrder[] = [
  { id: '1', orderNo: 'SO-2023-001', customerName: 'Ramesh Provision Store', date: '2023-10-01', itemsCount: 15, totalAmount: 45000, status: 'Delivered' },
  { id: '2', orderNo: 'SO-2023-002', customerName: 'Gupta Supermarket', date: '2023-10-02', itemsCount: 8, totalAmount: 28500, status: 'Processing' },
  { id: '3', orderNo: 'SO-2023-003', customerName: 'Balaji Traders', date: '2023-10-03', itemsCount: 42, totalAmount: 125000, status: 'Confirmed' },
  { id: '4', orderNo: 'SO-2023-004', customerName: 'Sharma General Store', date: '2023-10-04', itemsCount: 5, totalAmount: 12000, status: 'Draft' },
  { id: '5', orderNo: 'SO-2023-005', customerName: 'City Mart', date: '2023-10-05', itemsCount: 110, totalAmount: 340000, status: 'Delivered' },
  { id: '6', orderNo: 'SO-2023-006', customerName: 'Patel Brothers', date: '2023-10-06', itemsCount: 3, totalAmount: 5600, status: 'Cancelled' },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function SalesOrdersPage() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SalesOrder | null>(null);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'default';
      case 'Confirmed': return 'info';
      case 'Processing': return 'warning';
      case 'Delivered': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const kpis = [
    { title: 'Total Orders', value: '1,245', icon: FileText, color: theme.palette.primary.main },
    { title: 'Pending Orders', value: '34', icon: Clock, color: theme.palette.warning.main },
    { title: 'Confirmed Orders', value: '89', icon: CheckCircle2, color: theme.palette.info.main },
    { title: 'Delivered Orders', value: '1,122', icon: Truck, color: theme.palette.success.main },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Sales Orders</Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenCreate(true)}>
          Create Order
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {kpis.map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="textSecondary" variant="subtitle2">{kpi.title}</Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 1 }}>{kpi.value}</Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(kpi.color, 0.1), color: kpi.color }}>
                  <kpi.icon size={24} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              placeholder="Search by Order No or Customer..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={20} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Status"
              variant="outlined"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Confirmed">Confirmed</MenuItem>
              <MenuItem value="Processing">Processing</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Cancelled">Cancelled</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell>Order No</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell align="right">Total Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell fontWeight="medium">{order.orderNo}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{dayjs(order.date).format('DD MMM YYYY')}</TableCell>
                    <TableCell align="right">{order.itemsCount}</TableCell>
                    <TableCell align="right" fontWeight="bold">{formatCurrency(order.totalAmount)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        size="small" 
                        color={getStatusColor(order.status) as any}
                        variant={order.status === 'Draft' ? 'outlined' : 'filled'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => { setSelectedOrder(order); setOpenView(true); }}>
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No sales orders found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Fab 
        color="primary" 
        sx={{ position: 'fixed', bottom: 32, right: 32 }}
        onClick={() => setOpenCreate(true)}
      >
        <Plus />
      </Fab>

      {/* Create Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create New Sales Order
          <IconButton onClick={() => setOpenCreate(false)} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Customer Name" placeholder="Select Customer" required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Order Date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Line Items</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Rate (₹)</TableCell>
                      <TableCell align="right">Amount (₹)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell><TextField size="small" placeholder="Item Name" fullWidth /></TableCell>
                      <TableCell align="right"><TextField size="small" type="number" sx={{ width: 80 }} /></TableCell>
                      <TableCell align="right"><TextField size="small" type="number" sx={{ width: 100 }} /></TableCell>
                      <TableCell align="right"><TextField size="small" disabled sx={{ width: 100 }} /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Button startIcon={<Plus size={16} />} sx={{ mt: 1 }}>Add Item</Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenCreate(false)}>Create Order</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Order Details: {selectedOrder?.orderNo}
          <IconButton onClick={() => setOpenView(false)} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Customer</Typography>
                <Typography fontWeight="medium">{selectedOrder.customerName}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Date</Typography>
                <Typography>{dayjs(selectedOrder.date).format('DD MMM YYYY')}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Total Items</Typography>
                <Typography>{selectedOrder.itemsCount}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Total Amount</Typography>
                <Typography fontWeight="bold">{formatCurrency(selectedOrder.totalAmount)}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Status</Typography>
                <Chip 
                  label={selectedOrder.status} 
                  size="small" 
                  color={getStatusColor(selectedOrder.status) as any}
                />
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenView(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
