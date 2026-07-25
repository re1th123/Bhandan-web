import React, { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack, Chip,
  IconButton, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Divider, alpha, useTheme, InputAdornment, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip
} from '@mui/material';
import {
  Plus, Search, Building2, CreditCard, IndianRupee, Eye, Edit, Trash2, X,
  CheckCircle2, AlertTriangle, ArrowRightLeft, Banknote
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
interface Transaction {
  id: string;
  date: string;
  description: string;
  type: 'Credit' | 'Debit';
  amount: number;
}

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  branch: string;
  balance: number;
  upiId: string;
  type: 'Current' | 'Savings' | 'OD';
  status: 'Active' | 'Inactive';
  lastTransactions: Transaction[];
}

// --- Mock Data ---
const MOCK_ACCOUNTS: BankAccount[] = [
  {
    id: 'ACC-001',
    bankName: 'HDFC Bank',
    accountNumber: 'XXXX XXXX 1234',
    ifsc: 'HDFC0001234',
    branch: 'Koramangala, Bangalore',
    balance: 1545000,
    upiId: 'bhandan.hdfc@okaxis',
    type: 'Current',
    status: 'Active',
    lastTransactions: [
      { id: 'T1', date: '2026-07-25', description: 'Client Payment - Acme Corp', type: 'Credit', amount: 50000 },
      { id: 'T2', date: '2026-07-24', description: 'Vendor Payment - Tech Solutions', type: 'Debit', amount: 15000 },
      { id: 'T3', date: '2026-07-22', description: 'Office Rent', type: 'Debit', amount: 45000 },
    ],
  },
  {
    id: 'ACC-002',
    bankName: 'State Bank of India',
    accountNumber: 'XXXX XXXX 5678',
    ifsc: 'SBIN0005678',
    branch: 'MG Road, Bangalore',
    balance: 2450000,
    upiId: 'bhandan.sbi@ybl',
    type: 'Current',
    status: 'Active',
    lastTransactions: [
      { id: 'T4', date: '2026-07-23', description: 'Bulk Material Purchase', type: 'Debit', amount: 120000 },
      { id: 'T5', date: '2026-07-21', description: 'Client Advance', type: 'Credit', amount: 300000 },
    ],
  },
  {
    id: 'ACC-003',
    bankName: 'ICICI Bank',
    accountNumber: 'XXXX XXXX 9012',
    ifsc: 'ICIC0009012',
    branch: 'Indiranagar, Bangalore',
    balance: 85000,
    upiId: 'bhandan.icici@icici',
    type: 'Savings',
    status: 'Inactive',
    lastTransactions: [
      { id: 'T6', date: '2026-06-15', description: 'Interest Credit', type: 'Credit', amount: 1250 },
    ],
  },
];

const BankAccountsPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  
  // KPI Calculations
  const totalBalance = MOCK_ACCOUNTS.reduce((sum, acc) => sum + (acc.status === 'Active' ? acc.balance : 0), 0);
  const activeAccounts = MOCK_ACCOUNTS.filter(a => a.status === 'Active').length;
  const totalUpi = MOCK_ACCOUNTS.filter(a => a.upiId).length;
  const unreconciled = 12; // Mock value

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const handleOpenAdd = () => setOpenAddDialog(true);
  const handleCloseAdd = () => setOpenAddDialog(false);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Bank Accounts
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your business bank accounts and UPI IDs
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleOpenAdd}
          sx={{ bgcolor: theme.palette.primary.main, textTransform: 'none', px: 3, py: 1 }}
        >
          Add Bank Account
        </Button>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        {[
          { title: 'Total Bank Balance', value: formatCurrency(totalBalance), icon: <IndianRupee size={24} />, color: theme.palette.success.main },
          { title: 'Active Accounts', value: activeAccounts, icon: <Building2 size={24} />, color: theme.palette.info.main },
          { title: 'Active UPI IDs', value: totalUpi, icon: <Banknote size={24} />, color: theme.palette.warning.main },
          { title: 'Unreconciled Trans.', value: unreconciled, icon: <AlertTriangle size={24} />, color: theme.palette.error.main },
        ].map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
                        {kpi.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        {kpi.value}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(kpi.color, 0.1), color: kpi.color }}>
                      {kpi.icon}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Search Bar */}
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <TextField
            fullWidth
            placeholder="Search accounts by bank name, account number or UPI ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={20} color={theme.palette.text.secondary} />
                </InputAdornment>
              ),
              sx: { borderRadius: 2, bgcolor: theme.palette.background.default }
            }}
            variant="outlined"
            size="small"
          />
        </CardContent>
      </Card>

      {/* Bank Accounts Grid */}
      <Grid container spacing={3}>
        {MOCK_ACCOUNTS.filter(a => a.bankName.toLowerCase().includes(searchTerm.toLowerCase()) || a.accountNumber.includes(searchTerm)).map((account, index) => (
          <Grid item xs={12} md={6} lg={4} key={account.id}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.1 }}>
              <Card sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ p: 1.5, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                        <Building2 size={24} />
                      </Box>
                      <Box>
                        <Typography variant="h6" fontWeight="bold">
                          {account.bankName}
                        </Typography>
                        <Chip
                          label={account.status}
                          size="small"
                          sx={{
                            bgcolor: account.status === 'Active' ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1),
                            color: account.status === 'Active' ? theme.palette.success.dark : theme.palette.error.dark,
                            fontWeight: 'bold', mt: 0.5
                          }}
                        />
                      </Box>
                    </Box>
                    <IconButton size="small"><Edit size={18} /></IconButton>
                  </Stack>

                  <Grid container spacing={2} mb={3}>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Account Number</Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CreditCard size={14} /> {account.accountNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                      <Typography variant="body1" fontWeight="bold" color="primary">
                        {formatCurrency(account.balance)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">IFSC / Branch</Typography>
                      <Typography variant="body2">{account.ifsc}</Typography>
                      <Typography variant="caption" color="text.secondary">{account.branch}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" color="text.secondary">UPI ID</Typography>
                      <Typography variant="body2">{account.upiId || 'N/A'}</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ mb: 2 }} />
                  
                  <Typography variant="subtitle2" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ArrowRightLeft size={16} /> Recent Transactions
                  </Typography>
                  
                  <Stack spacing={1}>
                    {account.lastTransactions.map((tx) => (
                      <Box key={tx.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 1 }}>
                        <Box>
                          <Typography variant="caption" display="block" color="text.secondary">{tx.date}</Typography>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{tx.description}</Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="bold" color={tx.type === 'Credit' ? 'success.main' : 'error.main'}>
                          {tx.type === 'Credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
                <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <Button variant="outlined" size="small" startIcon={<Eye size={16} />}>View Details</Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Add Bank Account Dialog */}
      <Dialog open={openAddDialog} onClose={handleCloseAdd} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Add Bank Account</Typography>
          <IconButton onClick={handleCloseAdd}><X size={20} /></IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Bank Name" placeholder="e.g. State Bank of India" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Account Number" required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="IFSC Code" required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Branch Name" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select label="Account Type" defaultValue="Current">
                  <MenuItem value="Current">Current Account</MenuItem>
                  <MenuItem value="Savings">Savings Account</MenuItem>
                  <MenuItem value="OD">Overdraft (OD)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Opening Balance" type="number" 
                InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="UPI ID (Optional)" placeholder="e.g. bhandan@bank" />
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseAdd} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCloseAdd} color="primary">Save Account</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BankAccountsPage;
