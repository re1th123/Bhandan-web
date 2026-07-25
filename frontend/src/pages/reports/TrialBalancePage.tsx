import React, { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Button, Stack,
  Divider, alpha, useTheme, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import {
  Search, Download, Printer, FileText, CheckCircle2, AlertTriangle, 
  Calendar, Filter, CheckSquare
} from 'lucide-react';

// --- Types ---
interface TrialBalanceEntry {
  id: string;
  code: string;
  name: string;
  group: string;
  debit: number;
  credit: number;
}

// --- Mock Data ---
const MOCK_DATA: TrialBalanceEntry[] = [
  { id: '1', code: '1001', name: 'Cash in Hand', group: 'Current Assets', debit: 125000, credit: 0 },
  { id: '2', code: '1002', name: 'HDFC Bank Account', group: 'Current Assets', debit: 2450000, credit: 0 },
  { id: '3', code: '1003', name: 'Accounts Receivable', group: 'Current Assets', debit: 850000, credit: 0 },
  { id: '4', code: '1101', name: 'Office Equipment', group: 'Fixed Assets', debit: 450000, credit: 0 },
  { id: '5', code: '1102', name: 'Vehicles', group: 'Fixed Assets', debit: 1200000, credit: 0 },
  { id: '6', code: '2001', name: 'Accounts Payable', group: 'Current Liabilities', debit: 0, credit: 540000 },
  { id: '7', code: '2002', name: 'GST Payable', group: 'Current Liabilities', debit: 0, credit: 125000 },
  { id: '8', code: '2101', name: 'Bank Loan (Long Term)', group: 'Long-term Liabilities', debit: 0, credit: 1500000 },
  { id: '9', code: '3001', name: 'Owner Capital', group: 'Owner\'s Equity', debit: 0, credit: 3500000 },
  { id: '10', code: '4001', name: 'Sales Revenue', group: 'Revenue', debit: 0, credit: 4850000 },
  { id: '11', code: '4002', name: 'Service Income', group: 'Revenue', debit: 0, credit: 250000 },
  { id: '12', code: '5001', name: 'Cost of Goods Sold', group: 'Cost of Goods Sold', debit: 3200000, credit: 0 },
  { id: '13', code: '6001', name: 'Salaries Expense', group: 'Operating Expenses', debit: 850000, credit: 0 },
  { id: '14', code: '6002', name: 'Rent Expense', group: 'Operating Expenses', debit: 450000, credit: 0 },
  { id: '15', code: '6003', name: 'Utilities Expense', group: 'Operating Expenses', debit: 120000, credit: 0 },
  { id: '16', code: '6004', name: 'Marketing Expense', group: 'Operating Expenses', debit: 70000, credit: 0 },
];

const TrialBalancePage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  };

  // Grouping Data
  const groupedData = useMemo(() => {
    const groups: Record<string, TrialBalanceEntry[]> = {};
    const filtered = MOCK_DATA.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.code.includes(searchTerm) ||
      item.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.forEach(item => {
      if (!groups[item.group]) groups[item.group] = [];
      groups[item.group].push(item);
    });
    return groups;
  }, [searchTerm]);

  const { totalDebit, totalCredit } = useMemo(() => {
    return MOCK_DATA.reduce((acc, item) => ({
      totalDebit: acc.totalDebit + item.debit,
      totalCredit: acc.totalCredit + item.credit
    }), { totalDebit: 0, totalCredit: 0 });
  }, []);

  const isBalanced = totalDebit === totalCredit;
  const difference = Math.abs(totalDebit - totalCredit);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Area */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Trial Balance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            As of July 25, 2026
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<Calendar size={18} />}>
            Date Range
          </Button>
          <Button variant="outlined" startIcon={<Filter size={18} />}>
            Filter
          </Button>
          <Button variant="outlined" startIcon={<Printer size={18} />}>
            Print
          </Button>
          <Button variant="contained" color="primary" startIcon={<Download size={18} />} sx={{ textTransform: 'none' }}>
            Export
          </Button>
        </Stack>
      </Stack>

      {/* Summary Strip */}
      <Card sx={{ mb: 4, borderRadius: 2, bgcolor: isBalanced ? alpha(theme.palette.success.main, 0.05) : alpha(theme.palette.error.main, 0.05), border: `1px solid ${isBalanced ? alpha(theme.palette.success.main, 0.2) : alpha(theme.palette.error.main, 0.2)}` }}>
        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" justifyContent="space-around" alignItems="center" divider={<Divider orientation="vertical" flexItem />}>
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Total Debit Balance</Typography>
              <Typography variant="h5" fontWeight="bold" color="info.main">{formatCurrency(totalDebit)}</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Total Credit Balance</Typography>
              <Typography variant="h5" fontWeight="bold" color="warning.main">{formatCurrency(totalCredit)}</Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1}>Difference</Typography>
              <Typography variant="h5" fontWeight="bold" color={isBalanced ? 'text.secondary' : 'error.main'}>
                {formatCurrency(difference)}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary" textTransform="uppercase" letterSpacing={1} display="block" mb={0.5}>Status</Typography>
              {isBalanced ? (
                <Chip icon={<CheckCircle2 size={16} />} label="Balanced" color="success" size="small" sx={{ fontWeight: 'bold' }} />
              ) : (
                <Chip icon={<AlertTriangle size={16} />} label="Unbalanced" color="error" size="small" sx={{ fontWeight: 'bold' }} />
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Main Report Table */}
      <Card sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2, display: 'flex', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <TextField
            placeholder="Search accounts or groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search size={20} /></InputAdornment>,
            }}
            variant="outlined"
            size="small"
            sx={{ width: 350 }}
          />
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableRow>
                <TableCell sx={{ py: 1.5, fontWeight: 'bold' }}>Account Code</TableCell>
                <TableCell sx={{ py: 1.5, fontWeight: 'bold' }}>Account Name</TableCell>
                <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold' }}>Debit (₹)</TableCell>
                <TableCell align="right" sx={{ py: 1.5, fontWeight: 'bold' }}>Credit (₹)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(groupedData).map(([groupName, items]) => {
                const groupDebit = items.reduce((sum, item) => sum + item.debit, 0);
                const groupCredit = items.reduce((sum, item) => sum + item.credit, 0);

                return (
                  <React.Fragment key={groupName}>
                    {/* Group Header Row */}
                    <TableRow sx={{ bgcolor: alpha(theme.palette.grey[200], 0.5) }}>
                      <TableCell colSpan={2} sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                          {groupName}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color={groupDebit > 0 ? "info.main" : "text.secondary"}>
                          {groupDebit > 0 ? formatCurrency(groupDebit) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ py: 1.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold" color={groupCredit > 0 ? "warning.main" : "text.secondary"}>
                          {groupCredit > 0 ? formatCurrency(groupCredit) : '-'}
                        </Typography>
                      </TableCell>
                    </TableRow>

                    {/* Account Rows */}
                    {items.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell sx={{ color: theme.palette.text.secondary }}>{item.code}</TableCell>
                        <TableCell sx={{ pl: 4 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <FileText size={14} color={theme.palette.text.disabled} />
                            <Typography variant="body2">{item.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={item.debit > 0 ? "text.primary" : "text.disabled"}>
                            {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color={item.credit > 0 ? "text.primary" : "text.disabled"}>
                            {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </React.Fragment>
                );
              })}

              {/* Grand Total Row */}
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                <TableCell colSpan={2} sx={{ py: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" align="right">Grand Total:</Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="info.main">{formatCurrency(totalDebit)}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" color="warning.main">{formatCurrency(totalCredit)}</Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

export default TrialBalancePage;
