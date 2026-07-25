import React, { useState, useMemo } from 'react';
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
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  alpha,
  useTheme,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Book as JournalIcon,
  ShoppingCart as PurchaseIcon,
  PointOfSale as SalesIcon,
  Delete as DeleteIcon,
  AccountBalance,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

// --- Interfaces ---

interface ChartOfAccount {
  id: string;
  business_id: string;
  code: string;
  name: string;
  category: string;
  account_type: string;
}

interface JournalEntryLine {
  id: string;
  journal_id: string;
  account_id: string;
  debit_amount: number;
  credit_amount: number;
  description?: string;
  account?: ChartOfAccount;
}

interface JournalEntry {
  id: string;
  business_id: string;
  journal_number: string;
  entry_date: string;
  voucher_type: string;
  reference_module?: string;
  narration?: string;
  status: 'Draft' | 'Approved' | 'Posted';
  lines?: JournalEntryLine[];
}

// --- Mock Data ---

const MOCK_ACCOUNTS: ChartOfAccount[] = [
  { id: 'acc-1', business_id: 'biz-1', code: '1001', name: 'Cash', category: 'Asset', account_type: 'Current Asset' },
  { id: 'acc-2', business_id: 'biz-1', code: '1002', name: 'HDFC Bank', category: 'Asset', account_type: 'Bank' },
  { id: 'acc-3', business_id: 'biz-1', code: '2001', name: 'Accounts Payable', category: 'Liability', account_type: 'Current Liability' },
  { id: 'acc-4', business_id: 'biz-1', code: '3001', name: 'Sales Revenue', category: 'Revenue', account_type: 'Income' },
  { id: 'acc-5', business_id: 'biz-1', code: '4001', name: 'Office Supplies', category: 'Expense', account_type: 'Expense' },
  { id: 'acc-6', business_id: 'biz-1', code: '4002', name: 'Rent', category: 'Expense', account_type: 'Expense' },
];

const MOCK_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'je-1',
    business_id: 'biz-1',
    journal_number: 'JV-2025-001',
    entry_date: '2025-07-20',
    voucher_type: 'Journal',
    narration: 'Monthly rent accrued',
    status: 'Posted',
    lines: [
      { id: 'l1', journal_id: 'je-1', account_id: 'acc-6', debit_amount: 50000, credit_amount: 0, description: 'Rent Expense' },
      { id: 'l2', journal_id: 'je-1', account_id: 'acc-3', debit_amount: 0, credit_amount: 50000, description: 'Payable' },
    ],
  },
  {
    id: 'je-2',
    business_id: 'biz-1',
    journal_number: 'PV-2025-015',
    entry_date: '2025-07-21',
    voucher_type: 'Payment',
    narration: 'Paid office rent',
    status: 'Posted',
    lines: [
      { id: 'l3', journal_id: 'je-2', account_id: 'acc-3', debit_amount: 50000, credit_amount: 0, description: 'Payable settled' },
      { id: 'l4', journal_id: 'je-2', account_id: 'acc-2', debit_amount: 0, credit_amount: 50000, description: 'Bank payment' },
    ],
  },
  {
    id: 'je-3',
    business_id: 'biz-1',
    journal_number: 'RV-2025-008',
    entry_date: '2025-07-22',
    voucher_type: 'Receipt',
    narration: 'Cash sales received',
    status: 'Posted',
    lines: [
      { id: 'l5', journal_id: 'je-3', account_id: 'acc-1', debit_amount: 25000, credit_amount: 0, description: 'Cash in' },
      { id: 'l6', journal_id: 'je-3', account_id: 'acc-4', debit_amount: 0, credit_amount: 25000, description: 'Sales' },
    ],
  },
  {
    id: 'je-4',
    business_id: 'biz-1',
    journal_number: 'SV-2025-042',
    entry_date: '2025-07-24',
    voucher_type: 'Sales',
    narration: 'Credit sales to ABC Corp',
    status: 'Draft',
    lines: [
      { id: 'l7', journal_id: 'je-4', account_id: 'acc-1', debit_amount: 150000, credit_amount: 0, description: 'Receivable' },
      { id: 'l8', journal_id: 'je-4', account_id: 'acc-4', debit_amount: 0, credit_amount: 150000, description: 'Sales Revenue' },
    ],
  }
];

// --- Utilities ---
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

const getVoucherColor = (type: string) => {
  switch (type) {
    case 'Receipt': return '#2196F3'; // Blue
    case 'Payment': return '#F44336'; // Red
    case 'Journal': return '#9C27B0'; // Purple
    case 'Purchase': return '#FF9800'; // Orange
    case 'Sales': return '#4CAF50'; // Green
    default: return '#757575';
  }
};

const getVoucherIcon = (type: string) => {
  switch (type) {
    case 'Receipt': return <ReceiptIcon fontSize="small" />;
    case 'Payment': return <PaymentIcon fontSize="small" />;
    case 'Journal': return <JournalIcon fontSize="small" />;
    case 'Purchase': return <PurchaseIcon fontSize="small" />;
    case 'Sales': return <SalesIcon fontSize="small" />;
    default: return <JournalIcon fontSize="small" />;
  }
};

// --- Components ---

export default function JournalEntriesPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  
  const [filterType, setFilterType] = useState<string>('All');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  // Queries
  const { data: entries = [] } = useQuery({
    queryKey: ['journal-entries', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return MOCK_JOURNAL_ENTRIES;
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`*, lines:journal_entry_lines(*)`)
        .eq('business_id', activeBusiness.id)
        .order('entry_date', { ascending: false });
      if (error) {
        console.error('Error fetching journal entries:', error);
        return MOCK_JOURNAL_ENTRIES;
      }
      return (data as JournalEntry[]) || MOCK_JOURNAL_ENTRIES;
    },
    initialData: MOCK_JOURNAL_ENTRIES,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts', activeBusiness?.id],
    queryFn: async () => {
      if (!activeBusiness) return MOCK_ACCOUNTS;
      const { data, error } = await supabase
        .from('chart_of_accounts')
        .select('*')
        .eq('business_id', activeBusiness.id);
      if (error) return MOCK_ACCOUNTS;
      return (data as ChartOfAccount[]) || MOCK_ACCOUNTS;
    },
    initialData: MOCK_ACCOUNTS,
  });

  // Calculate KPIs
  const kpis = useMemo(() => {
    let totalDebit = 0;
    let totalCredit = 0;
    let pendingCount = 0;
    
    entries.forEach(entry => {
      if (entry.status === 'Draft') pendingCount++;
      entry.lines?.forEach(line => {
        totalDebit += Number(line.debit_amount) || 0;
        totalCredit += Number(line.credit_amount) || 0;
      });
    });

    return { totalEntries: entries.length, totalDebit, totalCredit, pendingCount };
  }, [entries]);

  // Chart Data
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => {
      counts[e.voucher_type] = (counts[e.voucher_type] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      color: getVoucherColor(key)
    }));
  }, [entries]);

  const filteredEntries = filterType === 'All' 
    ? entries 
    : entries.filter(e => e.voucher_type === filterType);

  // Form State for Creation
  const [formDate, setFormDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [formType, setFormType] = useState('Journal');
  const [formNarration, setFormNarration] = useState('');
  const [formLines, setFormLines] = useState<Partial<JournalEntryLine>[]>([
    { account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
    { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }
  ]);

  const handleAddLine = () => {
    setFormLines([...formLines, { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }]);
  };

  const handleRemoveLine = (index: number) => {
    setFormLines(formLines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof JournalEntryLine, value: any) => {
    const newLines = [...formLines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormLines(newLines);
  };

  const formTotalDebit = formLines.reduce((acc, curr) => acc + (Number(curr.debit_amount) || 0), 0);
  const formTotalCredit = formLines.reduce((acc, curr) => acc + (Number(curr.credit_amount) || 0), 0);
  const isBalanced = formTotalDebit === formTotalCredit && formTotalDebit > 0;

  const handleCreate = () => {
    if (!isBalanced) return;
    // Mock save
    setCreateModalOpen(false);
    // Reset form
    setFormDate(dayjs().format('YYYY-MM-DD'));
    setFormType('Journal');
    setFormNarration('');
    setFormLines([
      { account_id: '', debit_amount: 0, credit_amount: 0, description: '' },
      { account_id: '', debit_amount: 0, credit_amount: 0, description: '' }
    ]);
  };

  const getAccountName = (id: string) => accounts.find(a => a.id === id)?.name || 'Unknown Account';

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="600" color="primary.main">
          Journal Entries
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setCreateModalOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Create Journal Entry
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Entries', value: kpis.totalEntries.toString(), color: theme.palette.primary.main },
          { title: 'Total Debit', value: formatCurrency(kpis.totalDebit), color: '#d32f2f' },
          { title: 'Total Credit', value: formatCurrency(kpis.totalCredit), color: '#2e7d32' },
          { title: 'Pending Approval', value: kpis.pendingCount.toString(), color: '#ed6c02' },
        ].map((kpi, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: theme.shadows[2],
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)' }
              }}>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {kpi.title}
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" sx={{ color: kpi.color }}>
                    {kpi.value}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Main List */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, borderRadius: 3, boxShadow: theme.shadows[3], height: '100%' }}>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <FilterIcon color="action" />
              {['All', 'Receipt', 'Payment', 'Journal', 'Purchase', 'Sales'].map((type) => (
                <Chip
                  key={type}
                  label={type}
                  onClick={() => setFilterType(type)}
                  sx={{
                    bgcolor: filterType === type ? alpha(type === 'All' ? theme.palette.primary.main : getVoucherColor(type), 0.2) : 'transparent',
                    color: filterType === type ? (type === 'All' ? theme.palette.primary.main : getVoucherColor(type)) : 'text.secondary',
                    fontWeight: filterType === type ? 'bold' : 'normal',
                    border: '1px solid',
                    borderColor: filterType === type ? (type === 'All' ? theme.palette.primary.main : getVoucherColor(type)) : 'divider',
                  }}
                />
              ))}
            </Box>

            <TableContainer>
              <Table size="medium">
                <TableHead>
                  <TableRow sx={{ '& th': { color: 'text.secondary', fontWeight: 'bold', textTransform: 'uppercase' } }}>
                    <TableCell>Date</TableCell>
                    <TableCell>Journal No</TableCell>
                    <TableCell>Voucher</TableCell>
                    <TableCell>Narration</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredEntries.map((entry) => {
                      const totalAmt = entry.lines?.reduce((acc, line) => acc + (Number(line.debit_amount) || 0), 0) || 0;
                      return (
                        <motion.tr
                          key={entry.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          component={TableRow}
                          hover
                        >
                          <TableCell>{dayjs(entry.entry_date).format('DD MMM YYYY')}</TableCell>
                          <TableCell fontWeight="medium">{entry.journal_number}</TableCell>
                          <TableCell>
                            <Chip
                              icon={getVoucherIcon(entry.voucher_type)}
                              label={entry.voucher_type}
                              size="small"
                              sx={{
                                bgcolor: alpha(getVoucherColor(entry.voucher_type), 0.1),
                                color: getVoucherColor(entry.voucher_type),
                                fontWeight: 'bold',
                                borderRadius: 1
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {entry.narration || '-'}
                          </TableCell>
                          <TableCell align="right" fontWeight="bold">
                            {formatCurrency(totalAmt)}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="View Details">
                              <IconButton onClick={() => { setSelectedEntry(entry); setDetailModalOpen(true); }} color="primary">
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                  {filteredEntries.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No journal entries found.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Sidebar Widgets */}
        <Grid item xs={12} md={4}>
          <Stack spacing={3}>
            {/* Trial Balance Widget */}
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <AccountBalance color="primary" />
                  <Typography variant="h6" fontWeight="bold">Trial Balance Status</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography color="text.secondary">Total Debit:</Typography>
                  <Typography fontWeight="bold" color="error.main">{formatCurrency(kpis.totalDebit)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography color="text.secondary">Total Credit:</Typography>
                  <Typography fontWeight="bold" color="success.main">{formatCurrency(kpis.totalCredit)}</Typography>
                </Box>
                {kpis.totalDebit === kpis.totalCredit ? (
                  <Alert severity="success" icon={<CheckCircleIcon />} sx={{ borderRadius: 2 }}>
                    Books are perfectly balanced.
                  </Alert>
                ) : (
                  <Alert severity="error" icon={<WarningIcon />} sx={{ borderRadius: 2 }}>
                    Unbalanced books detected! Diff: {formatCurrency(Math.abs(kpis.totalDebit - kpis.totalCredit))}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Voucher Distribution */}
            <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[3] }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>Voucher Distribution</Typography>
                <Box sx={{ height: 250, width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      {/* Detail Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedEntry && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  Journal Entry: {selectedEntry.journal_number}
                </Typography>
                <Chip
                  icon={getVoucherIcon(selectedEntry.voucher_type)}
                  label={selectedEntry.voucher_type}
                  sx={{
                    bgcolor: alpha(getVoucherColor(selectedEntry.voucher_type), 0.1),
                    color: getVoucherColor(selectedEntry.voucher_type),
                    fontWeight: 'bold',
                  }}
                />
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {dayjs(selectedEntry.entry_date).format('DD MMMM YYYY')}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {selectedEntry.status}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Narration</Typography>
                  <Typography variant="body1">
                    {selectedEntry.narration || '-'}
                  </Typography>
                </Grid>
              </Grid>

              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                  <TableHead sx={{ bgcolor: 'background.default' }}>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Debit</TableCell>
                      <TableCell align="right">Credit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedEntry.lines?.map((line, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{getAccountName(line.account_id)}</TableCell>
                        <TableCell>{line.description || '-'}</TableCell>
                        <TableCell align="right" sx={{ color: line.debit_amount ? 'error.main' : 'inherit' }}>
                          {line.debit_amount ? formatCurrency(line.debit_amount) : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: line.credit_amount ? 'success.main' : 'inherit' }}>
                          {line.credit_amount ? formatCurrency(line.credit_amount) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { fontWeight: 'bold' }, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                      <TableCell colSpan={2} align="right">Total</TableCell>
                      <TableCell align="right" sx={{ color: 'error.main' }}>
                        {formatCurrency(selectedEntry.lines?.reduce((a, b) => a + (Number(b.debit_amount) || 0), 0) || 0)}
                      </TableCell>
                      <TableCell align="right" sx={{ color: 'success.main' }}>
                        {formatCurrency(selectedEntry.lines?.reduce((a, b) => a + (Number(b.credit_amount) || 0), 0) || 0)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Create Modal */}
      <Dialog 
        open={createModalOpen} 
        onClose={() => setCreateModalOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 'bold' }}>Create Journal Entry</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                label="Voucher Type"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                size="small"
              >
                {['Journal', 'Payment', 'Receipt', 'Purchase', 'Sales'].map(opt => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Reference"
                placeholder="Auto-generated"
                disabled
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Narration"
                value={formNarration}
                onChange={(e) => setFormNarration(e.target.value)}
                size="small"
                multiline
                rows={2}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>Ledger Lines</Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'background.default' }}>
                <TableRow>
                  <TableCell width="35%">Account</TableCell>
                  <TableCell width="30%">Description</TableCell>
                  <TableCell width="15%" align="right">Debit</TableCell>
                  <TableCell width="15%" align="right">Credit</TableCell>
                  <TableCell width="5%" align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formLines.map((line, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        value={line.account_id}
                        onChange={(e) => handleLineChange(idx, 'account_id', e.target.value)}
                      >
                        {accounts.map(acc => (
                          <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.code})</MenuItem>
                        ))}
                      </TextField>
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={line.description}
                        onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                        placeholder="Line description"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={line.debit_amount || ''}
                        onChange={(e) => {
                          handleLineChange(idx, 'debit_amount', Number(e.target.value));
                          if (Number(e.target.value) > 0) handleLineChange(idx, 'credit_amount', 0);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        inputProps={{ min: 0 }}
                        value={line.credit_amount || ''}
                        onChange={(e) => {
                          handleLineChange(idx, 'credit_amount', Number(e.target.value));
                          if (Number(e.target.value) > 0) handleLineChange(idx, 'debit_amount', 0);
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton color="error" onClick={() => handleRemoveLine(idx)} disabled={formLines.length <= 2}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Button startIcon={<AddIcon />} onClick={handleAddLine} variant="outlined" size="small">
              Add Line
            </Button>
            
            <Box display="flex" gap={3} alignItems="center" bgcolor="background.default" p={1} borderRadius={2} border={1} borderColor="divider">
              <Box>
                <Typography variant="caption" color="text.secondary">Total Debit</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="error.main">{formatCurrency(formTotalDebit)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Total Credit</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="success.main">{formatCurrency(formTotalCredit)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Difference</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color={isBalanced ? 'success.main' : 'error.main'}>
                  {formatCurrency(Math.abs(formTotalDebit - formTotalCredit))}
                </Typography>
              </Box>
              {isBalanced ? (
                <CheckCircleIcon color="success" />
              ) : (
                <WarningIcon color="error" />
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCreateModalOpen(false)} color="inherit">Cancel</Button>
          <Button 
            onClick={handleCreate} 
            variant="contained" 
            disabled={!isBalanced || formLines.some(l => !l.account_id)}
          >
            Save Journal Entry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
