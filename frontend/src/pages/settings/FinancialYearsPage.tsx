import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import {
  Plus,
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Settings,
  Eye,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

interface FinancialYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Open' | 'Locked' | 'Closed';
  transactionCount: number;
  isActive: boolean;
}

const MOCK_FINANCIAL_YEARS: FinancialYear[] = [
  {
    id: 'FY-2526',
    name: '2025-26',
    startDate: '2025-04-01',
    endDate: '2026-03-31',
    status: 'Open',
    transactionCount: 4521,
    isActive: true,
  },
  {
    id: 'FY-2425',
    name: '2024-25',
    startDate: '2024-04-01',
    endDate: '2025-03-31',
    status: 'Locked',
    transactionCount: 12450,
    isActive: false,
  },
  {
    id: 'FY-2324',
    name: '2023-24',
    startDate: '2023-04-01',
    endDate: '2024-03-31',
    status: 'Closed',
    transactionCount: 10892,
    isActive: false,
  }
];

const FinancialYearsPage: React.FC = () => {
  const theme = useTheme();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLockConfirmOpen, setIsLockConfirmOpen] = useState(false);
  const [selectedFy, setSelectedFy] = useState<FinancialYear | null>(null);

  const totalFys = MOCK_FINANCIAL_YEARS.length;
  const openFys = MOCK_FINANCIAL_YEARS.filter(fy => fy.status === 'Open').length;
  const lockedFys = MOCK_FINANCIAL_YEARS.filter(fy => fy.status === 'Locked').length;
  const currentFy = MOCK_FINANCIAL_YEARS.find(fy => fy.isActive);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'success';
      case 'Locked': return 'warning';
      case 'Closed': return 'error';
      default: return 'default';
    }
  };

  const handleLockUnlockClick = (fy: FinancialYear) => {
    setSelectedFy(fy);
    setIsLockConfirmOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Financial Years
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage accounting periods and year-end closing
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setIsCreateOpen(true)}
          sx={{ bgcolor: theme.palette.primary.main }}
        >
          Create New FY
        </Button>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.primary.main}` }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Calendar size={24} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Current FY</Typography>
                    <Typography variant="h5" fontWeight="bold">{currentFy?.name || 'N/A'}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                    <Clock size={24} color={theme.palette.info.main} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total FYs</Typography>
                    <Typography variant="h5" fontWeight="bold">{totalFys}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <CheckCircle2 size={24} color={theme.palette.success.main} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Open Periods</Typography>
                    <Typography variant="h5" fontWeight="bold">{openFys}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                    <Lock size={24} color={theme.palette.warning.main} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Locked Periods</Typography>
                    <Typography variant="h5" fontWeight="bold">{lockedFys}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell>Financial Year</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Transactions Count</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {MOCK_FINANCIAL_YEARS.map((fy) => (
                <TableRow key={fy.id} hover sx={{ bgcolor: fy.isActive ? alpha(theme.palette.primary.main, 0.02) : 'inherit' }}>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="body1" fontWeight={fy.isActive ? 'bold' : 'normal'}>
                        {fy.name}
                      </Typography>
                      {fy.isActive && (
                        <Chip label="Current" size="small" color="primary" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{dayjs(fy.startDate).format('DD MMM YYYY')}</TableCell>
                  <TableCell>{dayjs(fy.endDate).format('DD MMM YYYY')}</TableCell>
                  <TableCell>
                    <Chip 
                      label={fy.status} 
                      size="small" 
                      color={getStatusColor(fy.status) as any}
                      icon={fy.status === 'Locked' ? <Lock size={14} /> : fy.status === 'Closed' ? <Shield size={14} /> : <Unlock size={14} />}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">{fy.transactionCount.toLocaleString('en-IN')}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Tooltip title="View Details">
                        <IconButton size="small" color="primary">
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={fy.status === 'Open' ? 'Lock Year' : fy.status === 'Locked' ? 'Unlock Year' : 'Closed'}>
                        <IconButton 
                          size="small" 
                          color={fy.status === 'Open' ? 'warning' : 'info'}
                          onClick={() => handleLockUnlockClick(fy)}
                          disabled={fy.status === 'Closed'}
                        >
                          {fy.status === 'Open' ? <Lock size={18} /> : <Unlock size={18} />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Settings">
                        <IconButton size="small" color="default">
                          <Settings size={18} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create New FY Dialog */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Create Financial Year</Typography>
            <IconButton onClick={() => setIsCreateOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
               <TextField 
                fullWidth 
                label="Financial Year Name (e.g., 2026-27)" 
                required 
                variant="outlined" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Start Date" 
                type="date" 
                required 
                InputLabelProps={{ shrink: true }}
                variant="outlined" 
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="End Date" 
                type="date" 
                required 
                InputLabelProps={{ shrink: true }}
                variant="outlined" 
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.1), borderRadius: 1, display: 'flex', gap: 1 }}>
                <AlertTriangle size={20} color={theme.palette.info.main} />
                <Typography variant="body2" color="text.secondary">
                  Creating a new financial year will not automatically close the current one. You can run multiple open financial years simultaneously if required.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setIsCreateOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary">Create FY</Button>
        </DialogActions>
      </Dialog>

      {/* Lock/Unlock Confirm Dialog */}
      <Dialog open={isLockConfirmOpen} onClose={() => setIsLockConfirmOpen(false)} maxWidth="xs" fullWidth>
         <DialogTitle>
           {selectedFy?.status === 'Open' ? 'Lock Financial Year?' : 'Unlock Financial Year?'}
         </DialogTitle>
         <DialogContent>
           <Typography variant="body1" mb={2}>
             Are you sure you want to {selectedFy?.status === 'Open' ? 'lock' : 'unlock'} the financial year <strong>{selectedFy?.name}</strong>?
           </Typography>
           {selectedFy?.status === 'Open' && (
             <Typography variant="body2" color="error">
               Locking a financial year prevents any new transactions or modifications to existing transactions within this period.
             </Typography>
           )}
         </DialogContent>
         <DialogActions sx={{ p: 2 }}>
           <Button onClick={() => setIsLockConfirmOpen(false)} color="inherit">Cancel</Button>
           <Button 
            variant="contained" 
            color={selectedFy?.status === 'Open' ? 'warning' : 'primary'}
            onClick={() => setIsLockConfirmOpen(false)}
           >
             Yes, {selectedFy?.status === 'Open' ? 'Lock' : 'Unlock'} It
           </Button>
         </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialYearsPage;
