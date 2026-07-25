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
  TextField,
  IconButton,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Alert,
  Card,
  CardContent,
  useTheme,
  alpha,
  Stack,
} from '@mui/material';
import {
  RotateCcw,
  Building2,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle2,
  X,
  IndianRupee,
  Receipt,
} from 'lucide-react';
import dayjs from 'dayjs';

interface PurchaseReturnModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (returnRecord: any) => void;
}

const MOCK_SUPPLIERS = [
  { id: 'sup-1', name: 'MTR Traders', outstanding: 120000 },
  { id: 'sup-2', name: 'Adani Wilmar Supplies', outstanding: 85000 },
  { id: 'sup-3', name: 'HUL Wholesale Distributor', outstanding: 45000 },
];

const MOCK_ORIGINAL_BILLS = [
  {
    id: 'bill-101',
    supplierId: 'sup-1',
    billNo: 'PUR-2026-881',
    itemName: 'Grade A Jute Bags 50kg',
    originalQty: 10000,
    ratePerUnit: 20,
    totalBillAmount: 200000,
    amountPaid: 80000,
    currentBalance: 120000,
  },
  {
    id: 'bill-102',
    supplierId: 'sup-2',
    billNo: 'PUR-2026-742',
    itemName: 'Refined Oil Tins 15L',
    originalQty: 500,
    ratePerUnit: 1700,
    totalBillAmount: 850000,
    amountPaid: 765000,
    currentBalance: 85000,
  },
];

export default function PurchaseReturnModal({ open, onClose, onSuccess }: PurchaseReturnModalProps) {
  const theme = useTheme();

  // State
  const [selectedSupplierId, setSelectedSupplierId] = useState('sup-1');
  const [selectedBillId, setSelectedBillId] = useState('bill-101');
  const [returnedQty, setReturnedQty] = useState<string>('500'); // e.g. 500 bags
  const [returnReason, setReturnReason] = useState('Quality Defect / Damaged Packaging');
  const [returnDate, setReturnDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  // Selected Bill Object
  const selectedBill = useMemo(() => {
    return MOCK_ORIGINAL_BILLS.find(b => b.id === selectedBillId) || MOCK_ORIGINAL_BILLS[0];
  }, [selectedBillId]);

  // Calculations
  const calculations = useMemo(() => {
    const qty = parseInt(returnedQty) || 0;
    const creditNoteAmount = qty * selectedBill.ratePerUnit;
    const revisedBillAmount = Math.max(0, selectedBill.totalBillAmount - creditNoteAmount);
    const revisedBalance = Math.max(0, revisedBillAmount - selectedBill.amountPaid);
    const reductionAmount = selectedBill.currentBalance - revisedBalance;

    return {
      qty,
      creditNoteAmount,
      revisedBillAmount,
      revisedBalance,
      reductionAmount,
    };
  }, [returnedQty, selectedBill]);

  const handleSubmitReturn = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const record = {
        returnNo: `PR-2026-${Math.floor(100 + Math.random() * 900)}`,
        supplierName: MOCK_SUPPLIERS.find(s => s.id === selectedSupplierId)?.name || 'Supplier',
        billNo: selectedBill.billNo,
        returnedQty: calculations.qty,
        creditNoteAmount: calculations.creditNoteAmount,
        revisedBillAmount: calculations.revisedBillAmount,
        revisedBalance: calculations.revisedBalance,
        date: returnDate,
      };
      setIsSubmitting(false);
      setSuccessData(record);
      if (onSuccess) onSuccess(record);
    }, 400);
  };

  const handleReset = () => {
    setSuccessData(null);
    setReturnedQty('500');
  };

  if (successData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 4 }}>
          <CheckCircle2 size={48} color={theme.palette.success.main} style={{ marginBottom: 8 }} />
          <Typography variant="h5" fontWeight={800} color="text.primary">
            Purchase Return & Credit Note Saved!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Credit Note <strong>{successData.returnNo}</strong> issued to <strong>{successData.supplierName}</strong> for returning <strong>{successData.returnedQty} items</strong>.
          </Typography>

          <Card variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Original Bill</Typography>
                <Typography variant="body2" fontWeight={800}>₹{selectedBill.totalBillAmount.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Credit Note Issued</Typography>
                <Typography variant="body2" fontWeight={900} color="error.main">-₹{successData.creditNoteAmount.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">New Revised Balance</Typography>
                <Typography variant="body2" fontWeight={900} color="primary">₹{successData.revisedBalance.toLocaleString()}</Typography>
              </Grid>
            </Grid>
          </Card>

          <Alert severity="success" sx={{ borderRadius: 2, textAlign: 'left', mb: 2 }}>
            Supplier balance for <strong>{successData.supplierName}</strong> reduced from ₹{selectedBill.currentBalance.toLocaleString()} to <strong>₹{successData.revisedBalance.toLocaleString()}</strong>.
          </Alert>

          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: 2 }}>
              Record Another Return
            </Button>
            <Button variant="contained" onClick={onClose} sx={{ borderRadius: 2, fontWeight: 700 }}>
              Done
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCcw size={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
              Record Purchase Return (Supplier Side)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Returning defective/damaged goods reduces the balance Bandhan owes the supplier
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        <Grid container spacing={2.5}>
          {/* Supplier & Bill Selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Supplier</InputLabel>
              <Select
                value={selectedSupplierId}
                label="Supplier"
                onChange={(e) => setSelectedSupplierId(e.target.value)}
              >
                {MOCK_SUPPLIERS.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name} (Current Outstanding: ₹{s.outstanding.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Original Purchase Bill</InputLabel>
              <Select
                value={selectedBillId}
                label="Original Purchase Bill"
                onChange={(e) => setSelectedBillId(e.target.value)}
              >
                {MOCK_ORIGINAL_BILLS.map((b) => (
                  <MenuItem key={b.id} value={b.id}>
                    {b.billNo} — {b.itemName} (Bill Total: ₹{b.totalBillAmount.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Original Bill Breakdown Card */}
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${theme.palette.divider}` }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Item Billed</Typography>
                  <Typography variant="body2" fontWeight={700}>{selectedBill.itemName}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Rate / Unit</Typography>
                  <Typography variant="body2" fontWeight={700}>₹{selectedBill.ratePerUnit} / unit</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Original Bill Amount</Typography>
                  <Typography variant="body2" fontWeight={700}>₹{selectedBill.totalBillAmount.toLocaleString()}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Current Supplier Balance</Typography>
                  <Typography variant="body2" fontWeight={800} color="warning.main">₹{selectedBill.currentBalance.toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Return Quantity & Reason */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Quantity Being Returned"
              value={returnedQty}
              onChange={(e) => setReturnedQty(e.target.value)}
              helperText={`Max returnable: ${selectedBill.originalQty} units`}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="Return Date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              label="Reason for Goods Return"
              value={returnReason}
              onChange={(e) => setReturnReason(e.target.value)}
              placeholder="e.g. Quality poor, 500 bags damaged during transit"
            />
          </Grid>
        </Grid>

        {/* Live Calculation Preview Card */}
        <Paper elevation={0} sx={{ p: 2.5, mt: 3, borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, 0.06), border: `1.5px solid ${alpha(theme.palette.warning.main, 0.3)}` }}>
          <Typography variant="subtitle2" fontWeight={800} color="warning.dark" mb={1.5}>
            Revised Bill & Supplier Balance Calculation Preview
          </Typography>

          <Stack spacing={1}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Original Bill Total</Typography>
              <Typography variant="body2" fontWeight={600}>₹{selectedBill.totalBillAmount.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="error.main" fontWeight={700}>
                Goods Returned ({calculations.qty} units × ₹{selectedBill.ratePerUnit})
              </Typography>
              <Typography variant="body2" fontWeight={800} color="error.main">
                -₹{calculations.creditNoteAmount.toLocaleString()}
              </Typography>
            </Box>
            <Divider />
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" fontWeight={700}>Revised Bill Total</Typography>
              <Typography variant="body2" fontWeight={800}>₹{calculations.revisedBillAmount.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">Already Paid Amount</Typography>
              <Typography variant="body2" fontWeight={600} color="success.main">-₹{selectedBill.amountPaid.toLocaleString()}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" pt={1}>
              <Typography variant="subtitle1" fontWeight={800} color="primary">
                Revised Remaining Balance Owed to Supplier
              </Typography>
              <Typography variant="subtitle1" fontWeight={900} color="primary">
                ₹{calculations.revisedBalance.toLocaleString()}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<RotateCcw size={18} />}
          onClick={handleSubmitReturn}
          disabled={isSubmitting || calculations.qty <= 0}
          sx={{ px: 3, borderRadius: 2.5, fontWeight: 800 }}
        >
          {isSubmitting ? 'Saving Return…' : `Issue Credit Note (₹${calculations.creditNoteAmount.toLocaleString()})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
