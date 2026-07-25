import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Button, Chip, IconButton, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Divider, alpha, useTheme, Tooltip, MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Plus, Search, Filter, Eye, FileText, Package, Clock, CheckCircle2, X, AlertTriangle, Layers
} from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

const mockGRNs = [
  { id: 'GRN-2026-001', poRef: 'PO-2026-001', supplier: 'Reliance Retail Wholesale', date: '2026-07-25', items: 15, qcStatus: 'Accepted', warehouse: 'Mumbai Central WH' },
  { id: 'GRN-2026-002', poRef: 'PO-2026-004', supplier: 'Britannia Industries', date: '2026-07-25', items: 12, qcStatus: 'Partial', warehouse: 'Delhi North WH' },
  { id: 'GRN-2026-003', poRef: 'PO-2026-002', supplier: 'ITC Limited', date: '2026-07-24', items: 8, qcStatus: 'Pending QC', warehouse: 'Bangalore East WH' },
  { id: 'GRN-2026-004', poRef: 'PO-2026-008', supplier: 'Parle Products', date: '2026-07-24', items: 45, qcStatus: 'Rejected', warehouse: 'Mumbai Central WH' },
  { id: 'GRN-2026-005', poRef: 'PO-2026-012', supplier: 'Nestle India', date: '2026-07-23', items: 20, qcStatus: 'Accepted', warehouse: 'Pune South WH' },
];

const getQCStatusColor = (status: string) => {
  switch (status) {
    case 'Accepted': return '#2E7D32'; // Green
    case 'Pending QC': return '#E65100'; // Orange
    case 'Rejected': return '#C62828'; // Red
    case 'Partial': return '#1565C0'; // Blue
    default: return '#546E7A';
  }
};

const GRNPage = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const filteredGRNs = mockGRNs.filter(grn => 
    grn.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || 
    grn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grn.poRef.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Layers size={32} color={theme.palette.primary.main} />
          Goods Receipt Notes (GRN)
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpenDialog(true)}>
          Create GRN
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total GRNs', value: '458', icon: <FileText size={24} color="#1565C0" />, bg: alpha('#1565C0', 0.1) },
          { title: "Today's Receipts", value: '12', icon: <Package size={24} color="#00695C" />, bg: alpha('#00695C', 0.1) },
          { title: 'Pending QC', value: '5', icon: <Clock size={24} color="#E65100" />, bg: alpha('#E65100', 0.1) },
          { title: 'Accepted (Month)', value: '142', icon: <CheckCircle2 size={24} color="#2E7D32" />, bg: alpha('#2E7D32', 0.1) },
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
            placeholder="Search GRNs, PO Refs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>,
            }}
            sx={{ width: 280 }}
          />
          <Button startIcon={<Filter size={18} />} variant="outlined">Filters</Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell fontWeight="bold">GRN No.</TableCell>
                <TableCell fontWeight="bold">PO Ref</TableCell>
                <TableCell fontWeight="bold">Supplier</TableCell>
                <TableCell fontWeight="bold">Date</TableCell>
                <TableCell fontWeight="bold">Items Recv'd</TableCell>
                <TableCell fontWeight="bold">Warehouse</TableCell>
                <TableCell fontWeight="bold">QC Status</TableCell>
                <TableCell fontWeight="bold" align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredGRNs.map((grn) => (
                <TableRow key={grn.id} hover>
                  <TableCell fontWeight="medium">{grn.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary.main" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      {grn.poRef}
                    </Typography>
                  </TableCell>
                  <TableCell>{grn.supplier}</TableCell>
                  <TableCell>{dayjs(grn.date).format('DD MMM YYYY')}</TableCell>
                  <TableCell>{grn.items}</TableCell>
                  <TableCell>{grn.warehouse}</TableCell>
                  <TableCell>
                    <Chip 
                      label={grn.qcStatus} 
                      size="small" 
                      icon={grn.qcStatus === 'Rejected' ? <AlertTriangle size={14} /> : undefined}
                      sx={{ 
                        bgcolor: alpha(getQCStatusColor(grn.qcStatus), 0.1), 
                        color: getQCStatusColor(grn.qcStatus),
                        fontWeight: 600,
                        borderRadius: 1
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton size="small"><Eye size={18} /></IconButton>
                    </Tooltip>
                    {grn.qcStatus === 'Pending QC' && (
                      <Tooltip title="Perform QC">
                        <IconButton size="small" color="primary"><CheckCircle2 size={18} /></IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Create Goods Receipt Note (GRN)
          <IconButton onClick={() => setOpenDialog(false)}><X size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="PO Reference" placeholder="Enter PO Number" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField select fullWidth label="Warehouse" defaultValue="Mumbai Central WH">
                {['Mumbai Central WH', 'Delhi North WH', 'Bangalore East WH'].map(w => (
                  <MenuItem key={w} value={w}>{w}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField type="date" fullWidth label="Receipt Date" defaultValue={dayjs().format('YYYY-MM-DD')} InputLabelProps={{ shrink: true }} />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>Received Items vs Ordered</Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell>Product</TableCell>
                      <TableCell>Ordered Qty</TableCell>
                      <TableCell>Prev. Received</TableCell>
                      <TableCell>Now Receiving</TableCell>
                      <TableCell>QC Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Ashirvaad Atta 5kg</TableCell>
                      <TableCell>1000</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell><TextField size="small" type="number" defaultValue={1000} sx={{ width: 120 }} /></TableCell>
                      <TableCell><TextField size="small" placeholder="Packaging OK" fullWidth /></TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tata Salt 1kg</TableCell>
                      <TableCell>5000</TableCell>
                      <TableCell>2000</TableCell>
                      <TableCell><TextField size="small" type="number" defaultValue={3000} sx={{ width: 120 }} /></TableCell>
                      <TableCell><TextField size="small" placeholder="Pending lab test" fullWidth /></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" color="primary">Save GRN</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GRNPage;
