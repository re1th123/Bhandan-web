import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Grid,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  IconButton,
  Tooltip,
  Alert,
  useTheme,
  alpha,
  TextField,
} from '@mui/material';
import {
  User,
  Phone,
  MessageSquare,
  ShoppingBag,
  Landmark,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Plus,
  Banknote,
  Percent,
  X,
  FileText,
} from 'lucide-react';
import dayjs from 'dayjs';

interface CustomerFinancialSummaryModalProps {
  open: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    gstin?: string;
    creditLimit?: number;
    overdueDays?: number;
    // Goods Ledger
    totalSales: number;
    goodsReturned: number;
    salesAmountReceived: number;
    // Loan Ledger
    loanPrincipal: number;
    loanRatePercent: number; // e.g. 1.5% per month
    loanStartDate: string; // e.g. '2026-04-01'
    loanRepaid: number;
  };
}

export default function CustomerFinancialSummaryModal({ open, onClose, customer }: CustomerFinancialSummaryModalProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // ── GOODS LEDGER CALCULATIONS ─────────────────────────────────────────────
  const goodsCalculations = useMemo(() => {
    const netSales = customer.totalSales - customer.goodsReturned;
    const goodsBalance = Math.max(0, netSales - customer.salesAmountReceived);
    return {
      netSales,
      goodsBalance,
    };
  }, [customer]);

  // ── LOAN LEDGER CALCULATIONS (Auto interest starting from loan date) ──────
  const loanCalculations = useMemo(() => {
    const start = dayjs(customer.loanStartDate);
    const today = dayjs();
    const monthsElapsed = Math.max(1, today.diff(start, 'month', true)); // decimal months

    // Simple interest = Principal * Rate% * Months
    const interestTillToday = Math.round((customer.loanPrincipal * customer.loanRatePercent * monthsElapsed) / 100);
    const totalLoanDue = customer.loanPrincipal + interestTillToday;
    const loanBalance = Math.max(0, totalLoanDue - customer.loanRepaid);

    return {
      monthsElapsed: monthsElapsed.toFixed(1),
      interestTillToday,
      totalLoanDue,
      loanBalance,
    };
  }, [customer]);

  // ── CONSOLIDATED FINAL OUTSTANDING ────────────────────────────────────────
  const totalOutstandingDue = goodsCalculations.goodsBalance + loanCalculations.loanBalance;

  // ── WHATSAPP MESSAGE GENERATOR ───────────────────────────────────────────
  const handleSendWhatsApp = () => {
    const msg = `Hello ${customer.name},\n\n*Bandhan Wholesale Statement Summary*\n----------------------------------\n🛒 *Goods Account Balance:* ₹${goodsCalculations.goodsBalance.toLocaleString()}\n🏦 *Loan Account Balance:* ₹${loanCalculations.loanBalance.toLocaleString()} (incl. interest)\n\n👉 *Total Outstanding Due:* *₹${totalOutstandingDue.toLocaleString()}*\n\nPlease arrange payment at your earliest convenience. Thank you!`;
    const encoded = encodeURIComponent(msg);
    const phoneNo = customer.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phoneNo}?text=${encoded}`, '_blank');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
            }}
          >
            <User size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              {customer.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Customer Financial Summary • 3-Ledger Consolidated Statement
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="contained"
            color="success"
            startIcon={<MessageSquare size={16} />}
            onClick={handleSendWhatsApp}
            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
          >
            WhatsApp Reminder
          </Button>
          <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {/* CUSTOMER HEADER STRIP */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, bgcolor: isDark ? '#0F172A' : '#F1F5F9' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary" display="block">Phone Number</Typography>
              <Typography variant="body2" fontWeight={700}>{customer.phone || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary" display="block">GSTIN</Typography>
              <Typography variant="body2" fontWeight={700}>{customer.gstin || 'Unregistered'}</Typography>
            </Grid>
            <Grid item xs={6} sm={4}>
              <Typography variant="caption" color="text.secondary" display="block">Credit Limit Status</Typography>
              <Chip
                label={customer.creditLimit ? `Limit: ₹${customer.creditLimit.toLocaleString()}` : 'No Limit Set'}
                size="small"
                color={totalOutstandingDue > (customer.creditLimit || 0) ? 'error' : 'default'}
                sx={{ fontWeight: 700 }}
              />
            </Grid>
          </Grid>

          {customer.overdueDays && customer.overdueDays > 0 ? (
            <Alert severity="error" icon={<AlertTriangle size={18} />} sx={{ mt: 1.5, borderRadius: 2, py: 0 }}>
              <strong>Payment Overdue:</strong> Invoice payments are overdue by <strong>{customer.overdueDays} days</strong>.
            </Alert>
          ) : null}
        </Paper>

        <Grid container spacing={3}>
          {/* LEDGER 1: GOODS ACCOUNT (Sales Side) */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 3.5,
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1.5px solid ${alpha(theme.palette.info.main, 0.3)}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <ShoppingBag size={20} color={theme.palette.info.main} />
                <Typography variant="subtitle1" fontWeight={800} color="info.main">
                  GOODS ACCOUNT (Sales Ledger)
                </Typography>
              </Box>

              <Stack spacing={1.2}>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">Total Sales</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{customer.totalSales.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">Goods Returned (Sales Returns)</Typography>
                  <Typography variant="body2" fontWeight={600} color="error.main">
                    -₹{customer.goodsReturned.toLocaleString()}
                  </Typography>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" fontWeight={700}>Net Sales</Typography>
                  <Typography variant="body2" fontWeight={800}>₹{goodsCalculations.netSales.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">Amount Received (Collections)</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    -₹{customer.salesAmountReceived.toLocaleString()}
                  </Typography>
                </Box>

                <Box
                  p={1.5}
                  mt={1}
                  borderRadius={2.5}
                  bgcolor={alpha(theme.palette.info.main, 0.08)}
                  border={`1px solid ${alpha(theme.palette.info.main, 0.25)}`}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2" fontWeight={800} color="info.dark">
                    Goods Balance
                  </Typography>
                  <Typography variant="h6" fontWeight={900} color="info.main">
                    ₹{goodsCalculations.goodsBalance.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* LEDGER 2: LOAN ACCOUNT (Interest Auto-Calculated From Loan Date) */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                height: '100%',
                borderRadius: 3.5,
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1.5px solid ${alpha(theme.palette.warning.main, 0.4)}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Landmark size={20} color={theme.palette.warning.main} />
                <Typography variant="subtitle1" fontWeight={800} color="warning.main">
                  LOAN ACCOUNT (Interest Accrual)
                </Typography>
              </Box>

              <Stack spacing={1.2}>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">Loan Principal Borrowed</Typography>
                  <Typography variant="body2" fontWeight={600}>₹{customer.loanPrincipal.toLocaleString()}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">
                    Interest ({customer.loanRatePercent}% / mo since {customer.loanStartDate})
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="warning.main">
                    +₹{loanCalculations.interestTillToday.toLocaleString()}
                  </Typography>
                </Box>

                <Divider />

                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" fontWeight={700}>Total Principal + Interest</Typography>
                  <Typography variant="body2" fontWeight={800}>₹{loanCalculations.totalLoanDue.toLocaleString()}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" py={0.5}>
                  <Typography variant="body2" color="text.secondary">Loan Amount Repaid</Typography>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    -₹{customer.loanRepaid.toLocaleString()}
                  </Typography>
                </Box>

                <Box
                  p={1.5}
                  mt={1}
                  borderRadius={2.5}
                  bgcolor={alpha(theme.palette.warning.main, 0.08)}
                  border={`1px solid ${alpha(theme.palette.warning.main, 0.3)}`}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="subtitle2" fontWeight={800} color="warning.dark">
                    Loan Balance
                  </Typography>
                  <Typography variant="h6" fontWeight={900} color="warning.main">
                    ₹{loanCalculations.loanBalance.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        {/* FINAL CONSOLIDATED STATEMENT SUMMARY */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 3,
            borderRadius: 4,
            bgcolor: totalOutstandingDue > 0 ? alpha(theme.palette.error.main, 0.04) : alpha(theme.palette.success.main, 0.04),
            border: `2px solid ${totalOutstandingDue > 0 ? theme.palette.error.main : theme.palette.success.main}`,
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} textTransform="uppercase" letterSpacing={0.5} mb={2} color="text.secondary">
            FINAL CONSOLIDATED OUTSTANDING SUMMARY
          </Typography>

          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(theme.palette.info.main, 0.1)}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>Goods Balance</Typography>
                <Typography variant="h6" fontWeight={800} color="info.main">₹{goodsCalculations.goodsBalance.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(theme.palette.warning.main, 0.1)}>
                <Typography variant="caption" color="text.secondary" fontWeight={700}>Loan Balance (incl. Int)</Typography>
                <Typography variant="h6" fontWeight={800} color="warning.main">₹{loanCalculations.loanBalance.toLocaleString()}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box p={1.5} borderRadius={2} bgcolor={totalOutstandingDue > 0 ? alpha(theme.palette.error.main, 0.15) : alpha(theme.palette.success.main, 0.15)}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>TOTAL OUTSTANDING DUE</Typography>
                <Typography variant="h5" fontWeight={900} color={totalOutstandingDue > 0 ? 'error.main' : 'success.main'}>
                  ₹{totalOutstandingDue.toLocaleString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">Close</Button>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<Banknote size={18} />} sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}>
            Record Goods Collection
          </Button>
          <Button variant="contained" color="warning" startIcon={<Landmark size={18} />} sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 800 }}>
            Record Loan Repayment
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
