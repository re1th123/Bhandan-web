import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Stack,
  IconButton, TextField, Divider, alpha, useTheme, InputAdornment, 
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, Chip
} from '@mui/material';
import {
  Search, IndianRupee, CheckCircle2, AlertTriangle, Edit, X, Calendar, FileText
} from 'lucide-react';
import { motion } from 'framer-motion';

// --- Types ---
interface OpeningBalance {
  id: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  debit: number;
  credit: number;
  isEditing?: boolean;
}

// --- Mock Data ---
const MOCK_DATA: OpeningBalance[] = [
  { id: 'ACC-1001', accountName: 'Cash in Hand', accountType: 'Asset', debit: 50000, credit: 0 },
  { id: 'ACC-1002', accountName: 'HDFC Bank Account', accountType: 'Asset', debit: 1545000, credit: 0 },
  { id: 'ACC-1003', accountName: 'Inventory', accountType: 'Asset', debit: 2500000, credit: 0 },
  { id: 'ACC-1004', accountName: 'Accounts Receivable', accountType: 'Asset', debit: 850000, credit: 0 },
  { id: 'ACC-2001', accountName: 'Accounts Payable', accountType: 'Liability', debit: 0, credit: 1200000 },
  { id: 'ACC-2002', accountName: 'GST Payable', accountType: 'Liability', debit: 0, credit: 145000 },
  { id: 'ACC-2003', accountName: 'Bank Loan - SBI', accountType: 'Liability', debit: 0, credit: 800000 },
  { id: 'ACC-3001', accountName: 'Owner Capital', accountType: 'Equity', debit: 0, credit: 2800000 },
  { id: 'ACC-3002', accountName: 'Retained Earnings', accountType: 'Equity', debit: 0, credit: 0 }, // Balanced initially
];

const OpeningBalancesPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [year, setYear] = useState('2025-2026');
  const [balances, setBalances] = useState<OpeningBalance[]>(MOCK_DATA);

  // Calculations
  const { totalDebit, totalCredit, difference } = useMemo(() => {
    const td = balances.reduce((sum, b) => sum + (Number(b.debit) || 0), 0);
    const tc = balances.reduce((sum, b) => sum + (Number(b.credit) || 0), 0);
    return { totalDebit: td, totalCredit: tc, difference: Math.abs(td - tc) };
  }, [balances]);

  const isBalanced = totalDebit === totalCredit;
  const accountsSet = balances.filter(b => b.debit > 0 || b.credit > 0).length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  };

  const toggleEdit = (id: string) => {
    setBalances(balances.map(b => b.id === id ? { ...b, isEditing: !b.isEditing } : b));
  };

  const handleBalanceChange = (id: string, field: 'debit' | 'credit', value: string) => {
    const numValue = parseFloat(value) || 0;
    setBalances(balances.map(b => {
      if (b.id === id) {
        // Enforce either debit or credit, not both
        if (field === 'debit' && numValue > 0) return { ...b, debit: numValue, credit: 0 };
        if (field === 'credit' && numValue > 0) return { ...b, debit: 0, credit: numValue };
        return { ...b, [field]: numValue };
      }
      return b;
    }));
  };

  const handleSaveAll = () => {
    setBalances(balances.map(b => ({ ...b, isEditing: false })));
    // Implement save API call here
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Opening Balances
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Set and verify account opening balances for the financial year
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              startAdornment={<InputAdornment position="start"><Calendar size={18} /></InputAdornment>}
              sx={{ bgcolor: theme.palette.background.paper }}
            >
              <MenuItem value="2023-2024">FY 2023-24</MenuItem>
              <MenuItem value="2024-2025">FY 2024-25</MenuItem>
              <MenuItem value="2025-2026">FY 2025-26</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAll}
            disabled={!isBalanced || balances.every(b => !b.isEditing)}
            sx={{ textTransform: 'none', px: 3 }}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={1}>Total Debit</Typography>
              <Typography variant="h6" fontWeight="bold" color="info.main">{formatCurrency(totalDebit)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={1}>Total Credit</Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">{formatCurrency(totalCredit)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2, bgcolor: isBalanced ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.error.main, 0.1) }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <Typography variant="body2" color="text.secondary">Difference</Typography>
                {isBalanced ? <CheckCircle2 size={16} color={theme.palette.success.main} /> : <AlertTriangle size={16} color={theme.palette.error.main} />}
              </Stack>
              <Typography variant="h6" fontWeight="bold" color={isBalanced ? 'success.main' : 'error.main'}>
                {formatCurrency(difference)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" mb={1}>Accounts Set</Typography>
              <Typography variant="h6" fontWeight="bold">{accountsSet} / {balances.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Balance Indicator Alert */}
      {!isBalanced && (
        <Card sx={{ mb: 3, bgcolor: alpha(theme.palette.error.main, 0.1), border: `1px solid ${theme.palette.error.main}`, borderRadius: 2 }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AlertTriangle color={theme.palette.error.main} />
              <Typography color="error.dark" variant="body2" fontWeight="medium">
                The opening balances are not balanced. Difference: <strong>{formatCurrency(difference)}</strong>. Debits must equal Credits to proceed.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Main Table */}
      <Card sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>,
            }}
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
          />
        </Box>
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Debit Amount (₹)</TableCell>
                <TableCell align="right">Credit Amount (₹)</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {balances
                .filter(b => b.accountName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <FileText size={18} color={theme.palette.text.secondary} />
                      <Box>
                        <Typography variant="body2" fontWeight="medium">{row.accountName}</Typography>
                        <Typography variant="caption" color="text.secondary">{row.id}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.accountType} 
                      size="small" 
                      sx={{ 
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        color: theme.palette.text.primary,
                        fontWeight: 500
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    {row.isEditing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={row.debit === 0 ? '' : row.debit}
                        onChange={(e) => handleBalanceChange(row.id, 'debit', e.target.value)}
                        placeholder="0.00"
                        sx={{ width: 120, input: { textAlign: 'right' } }}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight={row.debit > 0 ? "bold" : "regular"} color={row.debit > 0 ? "info.main" : "text.secondary"}>
                        {row.debit > 0 ? formatCurrency(row.debit) : '-'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {row.isEditing ? (
                      <TextField
                        size="small"
                        type="number"
                        value={row.credit === 0 ? '' : row.credit}
                        onChange={(e) => handleBalanceChange(row.id, 'credit', e.target.value)}
                        placeholder="0.00"
                        sx={{ width: 120, input: { textAlign: 'right' } }}
                      />
                    ) : (
                      <Typography variant="body2" fontWeight={row.credit > 0 ? "bold" : "regular"} color={row.credit > 0 ? "warning.main" : "text.secondary"}>
                        {row.credit > 0 ? formatCurrency(row.credit) : '-'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => toggleEdit(row.id)} color={row.isEditing ? 'primary' : 'default'}>
                      {row.isEditing ? <CheckCircle2 size={18} /> : <Edit size={18} />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default OpeningBalancesPage;
