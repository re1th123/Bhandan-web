import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Button, Chip, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions, Stack,
  alpha, useTheme, InputAdornment, MenuItem, Fab, Tooltip
} from '@mui/material';
import {
  Plus, Search, Eye, FileText, Truck, Clock, CheckCircle2,
  X, MapPin, Package, RotateCcw
} from 'lucide-react';
import dayjs from 'dayjs';

interface DeliveryChallan {
  id: string;
  challanNo: string;
  customerName: string;
  soRef: string;
  date: string;
  itemsCount: number;
  vehicleNo: string;
  driverName: string;
  status: 'Generated' | 'Dispatched' | 'In Transit' | 'Delivered' | 'Returned';
}

const mockChallans: DeliveryChallan[] = [
  { id: '1', challanNo: 'DC-2023-001', customerName: 'Ramesh Provision Store', soRef: 'SO-2023-001', date: '2023-10-02', itemsCount: 15, vehicleNo: 'MH 12 AB 1234', driverName: 'Raju', status: 'Delivered' },
  { id: '2', challanNo: 'DC-2023-002', customerName: 'Gupta Supermarket', soRef: 'SO-2023-002', date: '2023-10-03', itemsCount: 8, vehicleNo: 'MH 14 XY 9876', driverName: 'Suresh', status: 'In Transit' },
  { id: '3', challanNo: 'DC-2023-003', customerName: 'Balaji Traders', soRef: 'SO-2023-003', date: '2023-10-04', itemsCount: 42, vehicleNo: 'MH 12 PQ 5555', driverName: 'Mahesh', status: 'Dispatched' },
  { id: '4', challanNo: 'DC-2023-004', customerName: 'Sharma General Store', soRef: 'SO-2023-004', date: '2023-10-05', itemsCount: 5, vehicleNo: '-', driverName: '-', status: 'Generated' },
  { id: '5', challanNo: 'DC-2023-005', customerName: 'City Mart', soRef: 'SO-2023-005', date: '2023-10-06', itemsCount: 110, vehicleNo: 'MH 12 MN 7777', driverName: 'Vikram', status: 'Delivered' },
  { id: '6', challanNo: 'DC-2023-006', customerName: 'Patel Brothers', soRef: 'SO-2023-007', date: '2023-10-07', itemsCount: 3, vehicleNo: 'MH 14 CD 2222', driverName: 'Babu', status: 'Returned' },
];

export default function DeliveryChallansPage() {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [openCreate, setOpenCreate] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);

  const filteredChallans = mockChallans.filter(challan => {
    const matchesSearch = challan.challanNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          challan.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          challan.soRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || challan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Generated': return 'info';
      case 'Dispatched': return 'warning';
      case 'In Transit': return 'secondary';
      case 'Delivered': return 'success';
      case 'Returned': return 'error';
      default: return 'default';
    }
  };

  const kpis = [
    { title: 'Total Challans', value: '458', icon: FileText, color: theme.palette.primary.main },
    { title: 'Dispatched Today', value: '12', icon: Truck, color: theme.palette.warning.main },
    { title: 'In Transit', value: '8', icon: MapPin, color: theme.palette.secondary.main },
    { title: 'Delivered', value: '412', icon: CheckCircle2, color: theme.palette.success.main },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">Delivery Challans</Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenCreate(true)}>
          Create Challan
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
              placeholder="Search by Challan, SO or Customer..."
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
              <MenuItem value="Generated">Generated</MenuItem>
              <MenuItem value="Dispatched">Dispatched</MenuItem>
              <MenuItem value="In Transit">In Transit</MenuItem>
              <MenuItem value="Delivered">Delivered</MenuItem>
              <MenuItem value="Returned">Returned</MenuItem>
            </TextField>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell>Challan No</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>SO Ref</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Items</TableCell>
                  <TableCell>Vehicle No</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredChallans.map((challan) => (
                  <TableRow key={challan.id} hover>
                    <TableCell fontWeight="medium">{challan.challanNo}</TableCell>
                    <TableCell>{challan.customerName}</TableCell>
                    <TableCell>{challan.soRef}</TableCell>
                    <TableCell>{dayjs(challan.date).format('DD MMM YYYY')}</TableCell>
                    <TableCell align="right">{challan.itemsCount}</TableCell>
                    <TableCell>{challan.vehicleNo}</TableCell>
                    <TableCell>
                      <Chip 
                        label={challan.status} 
                        size="small" 
                        color={getStatusColor(challan.status) as any}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => { setSelectedChallan(challan); setOpenView(true); }}>
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredChallans.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                      <Typography color="textSecondary">No delivery challans found.</Typography>
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
          Create Delivery Challan
          <IconButton onClick={() => setOpenCreate(false)} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Sales Order Reference" placeholder="Search SO Number" required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth type="date" label="Date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Vehicle Number" placeholder="e.g. MH 12 AB 1234" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Driver Name" placeholder="e.g. Ramesh" />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2 }}>Items to Dispatch</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Product</TableCell>
                      <TableCell align="right">SO Qty</TableCell>
                      <TableCell align="right">Dispatch Qty</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Aashirvaad Atta 5kg</TableCell>
                      <TableCell align="right">100</TableCell>
                      <TableCell align="right"><TextField size="small" type="number" sx={{ width: 80 }} defaultValue={100} /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setOpenCreate(false)}>Generate Challan</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openView} onClose={() => setOpenView(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Challan Details: {selectedChallan?.challanNo}
          <IconButton onClick={() => setOpenView(false)} size="small"><X size={20} /></IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedChallan && (
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Customer</Typography>
                <Typography fontWeight="medium">{selectedChallan.customerName}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">SO Reference</Typography>
                <Typography>{selectedChallan.soRef}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Date</Typography>
                <Typography>{dayjs(selectedChallan.date).format('DD MMM YYYY')}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Total Items</Typography>
                <Typography>{selectedChallan.itemsCount}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Vehicle & Driver</Typography>
                <Typography>{selectedChallan.vehicleNo} ({selectedChallan.driverName})</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography color="textSecondary">Status</Typography>
                <Chip 
                  label={selectedChallan.status} 
                  size="small" 
                  color={getStatusColor(selectedChallan.status) as any}
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
