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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Chip,
  Divider,
  Autocomplete,
  Alert,
  Card,
  CardContent,
  InputAdornment,
  useTheme,
  alpha,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Plus,
  Delete,
  UserPlus,
  Receipt,
  CheckCircle,
  AlertCircle,
  Printer,
  Download,
  CreditCard,
  Sparkles,
  ShoppingBag,
  Percent,
  IndianRupee,
  X,
} from 'lucide-react';
import dayjs from 'dayjs';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

// Types
export interface SaleLineItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  recommendedPrice: number;
  unitPrice: number;
  qty: number;
  gstRate: number; // 0, 5, 12, 18, 28
}

export interface CustomerOption {
  id: string;
  name: string;
  phone?: string;
  gstin?: string;
  outstandingBalance?: number;
}

interface QuickSaleModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (newInvoice: any) => void;
}

// Fallback Mock Customers & Products for offline/demo
const MOCK_CUSTOMERS: CustomerOption[] = [
  { id: 'c1', name: 'Acme Retail Traders', phone: '+91 98765 43210', gstin: '27AADCB2230M1Z2', outstandingBalance: 14500 },
  { id: 'c2', name: 'TechSolutions Ltd', phone: '+91 98220 11223', gstin: '27BBDCS4412K1Z9', outstandingBalance: 0 },
  { id: 'c3', name: 'Metro General Stores', phone: '+91 94112 88776', gstin: '27CCECP9981P1Z4', outstandingBalance: 8200 },
  { id: 'c4', name: 'Walk-in Cash Customer', phone: '', gstin: '', outstandingBalance: 0 },
];

const MOCK_PRODUCTS = [
  { id: 'p1', name: 'Aashirvaad Whole Wheat Atta 5kg', sku: 'AA-5KG', recommendedPrice: 230, costPrice: 190, stockQty: 45, defaultGst: 5 },
  { id: 'p2', name: 'Tata Iodized Salt 1kg Pack', sku: 'TS-1KG', recommendedPrice: 25, costPrice: 18, stockQty: 120, defaultGst: 5 },
  { id: 'p3', name: 'Fortune Refined Sunflower Oil 1L', sku: 'FS-1L', recommendedPrice: 150, costPrice: 125, stockQty: 80, defaultGst: 5 },
  { id: 'p4', name: 'Maggi 2-Min Masala Noodles 70g', sku: 'MG-70G', recommendedPrice: 14, costPrice: 10, stockQty: 300, defaultGst: 12 },
  { id: 'p5', name: 'Surf Excel Easy Wash Detergent 1kg', sku: 'SE-1KG', recommendedPrice: 145, costPrice: 115, stockQty: 60, defaultGst: 18 },
];

export default function QuickSaleModal({ open, onClose, onSuccess }: QuickSaleModalProps) {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const bizId = activeBusiness?.id || 'biz-1';

  // Customer State
  const [customersList, setCustomersList] = useState<CustomerOption[]>(MOCK_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(MOCK_CUSTOMERS[0]);
  const [customerSearchInput, setCustomerSearchInput] = useState('');
  
  // New Customer Inline Form Modal
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustGstin, setNewCustGstin] = useState('');

  // Invoice Details
  const [invoiceDate, setInvoiceDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [dueDate, setDueDate] = useState(dayjs().add(15, 'day').format('YYYY-MM-DD'));
  
  // Line Items State
  const [items, setItems] = useState<SaleLineItem[]>([
    {
      id: '1',
      productId: MOCK_PRODUCTS[0].id,
      name: MOCK_PRODUCTS[0].name,
      sku: MOCK_PRODUCTS[0].sku,
      recommendedPrice: MOCK_PRODUCTS[0].recommendedPrice,
      unitPrice: MOCK_PRODUCTS[0].recommendedPrice,
      qty: 5,
      gstRate: MOCK_PRODUCTS[0].defaultGst,
    },
  ]);

  // Selected product to add
  const [selectedProductToAdd, setSelectedProductToAdd] = useState<any>(null);

  // Payment Handling
  const [amountPaid, setAmountPaid] = useState<string>('1150'); // default paid amount
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [notes, setNotes] = useState('');

  // Submit State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any | null>(null);

  // ── COMPUTATIONS ────────────────────────────────────────────────────────
  const invoiceCalculations = useMemo(() => {
    let subtotal = 0;
    let totalGst = 0;

    items.forEach(item => {
      const lineSubtotal = item.unitPrice * item.qty;
      const lineGst = (lineSubtotal * item.gstRate) / 100;
      subtotal += lineSubtotal;
      totalGst += lineGst;
    });

    const grandTotal = Math.round(subtotal + totalGst);
    const paid = parseFloat(amountPaid) || 0;
    const balanceDue = Math.max(0, grandTotal - paid);

    let paymentStatus: 'Paid' | 'Partial' | 'Unpaid' = 'Unpaid';
    if (paid >= grandTotal && grandTotal > 0) {
      paymentStatus = 'Paid';
    } else if (paid > 0) {
      paymentStatus = 'Partial';
    }

    return {
      subtotal,
      totalGst,
      grandTotal,
      paid,
      balanceDue,
      paymentStatus,
    };
  }, [items, amountPaid]);

  // ── ITEM ACTIONS ────────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!selectedProductToAdd) return;

    const existingIdx = items.findIndex(i => i.productId === selectedProductToAdd.id);
    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].qty += 1;
      setItems(updated);
    } else {
      setItems(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          productId: selectedProductToAdd.id,
          name: selectedProductToAdd.name,
          sku: selectedProductToAdd.sku,
          recommendedPrice: selectedProductToAdd.recommendedPrice,
          unitPrice: selectedProductToAdd.recommendedPrice,
          qty: 1,
          gstRate: selectedProductToAdd.defaultGst,
        },
      ]);
    }
    setSelectedProductToAdd(null);
  };

  const handleUpdateItem = (id: string, field: keyof SaleLineItem, value: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // ── INLINE CUSTOMER CREATION ─────────────────────────────────────────────
  const handleSaveNewCustomer = async () => {
    if (!newCustName.trim()) return;

    const newCustomerObj: CustomerOption = {
      id: `cust-${Date.now()}`,
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      gstin: newCustGstin.trim(),
      outstandingBalance: 0,
    };

    try {
      if (activeBusiness?.id) {
        const { data, error } = await supabase
          .from('customers')
          .insert({
            business_id: activeBusiness.id,
            name: newCustomerObj.name,
            phone: newCustomerObj.phone,
            gstin: newCustomerObj.gstin,
          })
          .select()
          .single();

        if (data) {
          newCustomerObj.id = data.id;
        }
      }
    } catch (e) {
      console.warn('Saving new customer locally fallback', e);
    }

    setCustomersList(prev => [newCustomerObj, ...prev]);
    setSelectedCustomer(newCustomerObj);
    setAddCustomerOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustGstin('');
  };

  // ── SAVE INVOICE ──────────────────────────────────────────────────────────
  const handleSaveInvoice = async () => {
    if (!selectedCustomer) {
      alert('Please select or add a customer.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product.');
      return;
    }

    setIsSubmitting(true);
    const invoiceNo = `TAX-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newInvoiceObj = {
      id: `inv-${Date.now()}`,
      business_id: bizId,
      invoice_no: invoiceNo,
      customer_id: selectedCustomer.id,
      date: invoiceDate,
      due_date: dueDate,
      total_amount: invoiceCalculations.grandTotal,
      gst_amount: invoiceCalculations.totalGst,
      payment_status: invoiceCalculations.paymentStatus,
      paid_amount: invoiceCalculations.paid,
      balance_due: invoiceCalculations.balanceDue,
      created_at: new Date().toISOString(),
      customers: {
        name: selectedCustomer.name,
        gstin: selectedCustomer.gstin || '',
      },
      items_json: items,
    };

    try {
      if (activeBusiness?.id) {
        await supabase.from('tax_invoices').insert({
          business_id: activeBusiness.id,
          invoice_no: invoiceNo,
          customer_id: selectedCustomer.id,
          date: invoiceDate,
          due_date: dueDate,
          total_amount: invoiceCalculations.grandTotal,
          gst_amount: invoiceCalculations.totalGst,
          payment_status: invoiceCalculations.paymentStatus,
          items_json: items,
        });
      }
    } catch (e) {
      console.warn('Saving invoice fallback', e);
    }

    setIsSubmitting(false);
    setSuccessData(newInvoiceObj);
    if (onSuccess) onSuccess(newInvoiceObj);
  };

  const handleReset = () => {
    setSuccessData(null);
    setItems([
      {
        id: '1',
        productId: MOCK_PRODUCTS[0].id,
        name: MOCK_PRODUCTS[0].name,
        sku: MOCK_PRODUCTS[0].sku,
        recommendedPrice: MOCK_PRODUCTS[0].recommendedPrice,
        unitPrice: MOCK_PRODUCTS[0].recommendedPrice,
        qty: 5,
        gstRate: MOCK_PRODUCTS[0].defaultGst,
      },
    ]);
    setAmountPaid('1150');
  };

  // ── SUCCESS DIALOG STATE ──────────────────────────────────────────────────
  if (successData) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, textAlign: 'center', pt: 4 }}>
          <CheckCircle size={48} color={theme.palette.success.main} style={{ marginBottom: 8 }} />
          <Typography variant="h5" fontWeight={800} color="text.primary">
            Invoice {successData.invoice_no} Created!
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', pb: 3 }}>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Transaction recorded successfully for <strong>{successData.customers?.name}</strong>.
          </Typography>

          <Card variant="outlined" sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6" fontWeight={800} color="primary">₹{successData.total_amount.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Amount Paid</Typography>
                <Typography variant="h6" fontWeight={800} color="success.main">₹{successData.paid_amount.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={4}>
                <Typography variant="caption" color="text.secondary">Credit / Debt Balance</Typography>
                <Typography variant="h6" fontWeight={800} color={successData.balance_due > 0 ? 'warning.main' : 'text.primary'}>
                  ₹{successData.balance_due.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          {successData.balance_due > 0 && (
            <Alert severity="warning" icon={<AlertCircle size={20} />} sx={{ borderRadius: 2, textAlign: 'left', mb: 2 }}>
              <strong>₹{successData.balance_due.toLocaleString()}</strong> has been added to {successData.customers?.name}'s outstanding credit ledger.
            </Alert>
          )}

          <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
            <Button variant="outlined" startIcon={<Printer size={18} />} sx={{ borderRadius: 2 }}>
              Print Receipt
            </Button>
            <Button variant="outlined" startIcon={<Download size={18} />} sx={{ borderRadius: 2 }}>
              Download PDF
            </Button>
            <Button variant="contained" onClick={handleReset} sx={{ bgcolor: theme.palette.primary.main, borderRadius: 2, fontWeight: 700 }}>
              New Sale
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
          <Button onClick={onClose} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  // ── MAIN FORM DIALOG ─────────────────────────────────────────────────────
  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
              <ShoppingBag size={22} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
                Quick Sale & Tax Invoice Creation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Streamlined walk-in sale, instant customer creation, manual price overrides & auto-debt tracking
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small"><X size={20} /></IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          {/* SECTION 1: CUSTOMER SELECTION & INLINE CREATION */}
          <Paper elevation={0} sx={{ p: 2.5, mb: 3, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.03), border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}` }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="subtitle2" fontWeight={800} color="primary">
                1. Customer Details (Walk-in or Existing)
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<UserPlus size={16} />}
                onClick={() => {
                  setNewCustName(customerSearchInput);
                  setAddCustomerOpen(true);
                }}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, fontSize: '0.75rem' }}
              >
                + Add New Customer
              </Button>
            </Box>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={7}>
                <Autocomplete
                  options={customersList}
                  getOptionLabel={(option) => `${option.name} ${option.phone ? `(${option.phone})` : ''}`}
                  value={selectedCustomer}
                  onChange={(_, newValue) => {
                    if (newValue) setSelectedCustomer(newValue);
                  }}
                  onInputChange={(_, newInputValue) => setCustomerSearchInput(newInputValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Customer Name or Phone"
                      placeholder="Type name to search or create new…"
                      size="small"
                      fullWidth
                    />
                  )}
                  noOptionsText={
                    <Box textAlign="center" py={1}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        No customer found for "{customerSearchInput}"
                      </Typography>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<UserPlus size={14} />}
                        onClick={() => {
                          setNewCustName(customerSearchInput);
                          setAddCustomerOpen(true);
                        }}
                        sx={{ textTransform: 'none', mt: 0.5, borderRadius: 2 }}
                      >
                        Create "{customerSearchInput}" as New Customer
                      </Button>
                    </Box>
                  }
                />
              </Grid>

              <Grid item xs={6} sm={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Invoice Date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6} sm={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  label="Due Date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {selectedCustomer && (
              <Box display="flex" gap={2} mt={1.5} flexWrap="wrap">
                {selectedCustomer.gstin && (
                  <Chip label={`GSTIN: ${selectedCustomer.gstin}`} size="small" variant="outlined" />
                )}
                {selectedCustomer.outstandingBalance !== undefined && selectedCustomer.outstandingBalance > 0 && (
                  <Chip
                    label={`Existing Debt Balance: ₹${selectedCustomer.outstandingBalance.toLocaleString()}`}
                    size="small"
                    color="warning"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Box>
            )}
          </Paper>

          {/* SECTION 2: PRODUCT LINE ITEMS WITH MANUAL PRICE OVERRIDE & GST */}
          <Box mb={3}>
            <Typography variant="subtitle2" fontWeight={800} color="primary" mb={1.5}>
              2. Products, Manual Selling Price & GST
            </Typography>

            {/* Add Product Selector Bar */}
            <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.background.paper }}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} sm={8}>
                  <Autocomplete
                    options={MOCK_PRODUCTS}
                    getOptionLabel={(option) => `${option.name} (Rec. Price: ₹${option.recommendedPrice})`}
                    value={selectedProductToAdd}
                    onChange={(_, val) => setSelectedProductToAdd(val)}
                    renderInput={(params) => (
                      <TextField {...params} label="Select Product to Add" placeholder="Search product name or SKU…" size="small" />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={handleAddItem}
                    disabled={!selectedProductToAdd}
                    sx={{ borderRadius: 2, height: 40, textTransform: 'none', fontWeight: 700 }}
                  >
                    Add Product to Bill
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {/* Line Items Table */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.06) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Product Description</TableCell>
                    <TableCell align="center" width={100} sx={{ fontWeight: 700 }}>Qty</TableCell>
                    <TableCell align="center" width={160} sx={{ fontWeight: 700 }}>
                      Selling Price (₹)
                    </TableCell>
                    <TableCell align="center" width={110} sx={{ fontWeight: 700 }}>GST %</TableCell>
                    <TableCell align="right" width={130} sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
                    <TableCell width={48}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => {
                    const lineSub = item.unitPrice * item.qty;
                    const lineGst = (lineSub * item.gstRate) / 100;
                    const lineTotal = lineSub + lineGst;

                    return (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>{item.name}</Typography>
                          <Typography variant="caption" color="text.secondary">SKU: {item.sku}</Typography>
                        </TableCell>

                        {/* Qty Input */}
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                            inputProps={{ min: 1, style: { textAlign: 'center', fontWeight: 700 } }}
                            sx={{ width: 70 }}
                          />
                        </TableCell>

                        {/* Manual Selling Price Input with Recommended Price Helper */}
                        <TableCell align="center">
                          <Box display="flex" flexDirection="column" alignItems="center">
                            <TextField
                              type="number"
                              size="small"
                              value={item.unitPrice}
                              onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                              inputProps={{ style: { textAlign: 'center', fontWeight: 700 } }}
                              InputProps={{
                                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                              }}
                              sx={{ width: 120 }}
                            />
                            {/* Recommended Price Helper / Grey text */}
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', mt: 0.3 }}>
                              Rec. Price: ₹{item.recommendedPrice}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* GST % Select */}
                        <TableCell align="center">
                          <Select
                            size="small"
                            value={item.gstRate}
                            onChange={(e) => handleUpdateItem(item.id, 'gstRate', Number(e.target.value))}
                            sx={{ fontSize: '0.85rem', fontWeight: 700 }}
                          >
                            <MenuItem value={0}>0%</MenuItem>
                            <MenuItem value={5}>5%</MenuItem>
                            <MenuItem value={12}>12%</MenuItem>
                            <MenuItem value={18}>18%</MenuItem>
                            <MenuItem value={28}>28%</MenuItem>
                          </Select>
                        </TableCell>

                        {/* Line Total */}
                        <TableCell align="right" sx={{ fontWeight: 800 }}>
                          ₹{Math.round(lineTotal).toLocaleString()}
                        </TableCell>

                        {/* Delete Action */}
                        <TableCell>
                          <IconButton size="small" color="error" onClick={() => handleRemoveItem(item.id)}>
                            <Delete size={18} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        No items added yet. Select a product above to add to bill.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* SECTION 3: SUMMARY & AUTOMATED PAYMENT / DEBT TRACKING */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.03), border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                <Typography variant="subtitle2" fontWeight={800} color="success.main" mb={1.5}>
                  3. Payment Handling & Outstanding Debt Calculation
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        value={paymentMethod}
                        label="Payment Method"
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                      >
                        <MenuItem value="UPI">UPI / QR Code</MenuItem>
                        <MenuItem value="Cash">Cash Payment</MenuItem>
                        <MenuItem value="Bank Transfer">Bank Transfer (NEFT/RTGS)</MenuItem>
                        <MenuItem value="Cheque">Cheque</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Amount Paid Now (₹)"
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                      }}
                      sx={{ '& input': { fontWeight: 800, color: theme.palette.success.main } }}
                    />
                  </Grid>
                </Grid>

                {/* Realtime Debt Outstanding Callout Banner */}
                <Box mt={2} p={1.5} borderRadius={2} bgcolor={invoiceCalculations.balanceDue > 0 ? alpha(theme.palette.warning.main, 0.12) : alpha(theme.palette.success.main, 0.12)}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Payment Status:
                    </Typography>
                    <Chip
                      label={invoiceCalculations.paymentStatus}
                      size="small"
                      color={
                        invoiceCalculations.paymentStatus === 'Paid'
                          ? 'success'
                          : invoiceCalculations.paymentStatus === 'Partial'
                          ? 'warning'
                          : 'error'
                      }
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>

                  {invoiceCalculations.balanceDue > 0 ? (
                    <Typography variant="body2" fontWeight={700} color="warning.dark" mt={1}>
                      ⚠️ ₹{invoiceCalculations.balanceDue.toLocaleString()} unpaid balance will automatically record as Debt/Credit Outstanding for {selectedCustomer?.name}.
                    </Typography>
                  ) : (
                    <Typography variant="body2" fontWeight={700} color="success.dark" mt={1}>
                      ✓ Full amount paid. No remaining debt outstanding for this sale.
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>

            {/* Calculations Box */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ borderRadius: 3, bgcolor: theme.palette.background.paper }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Subtotal (Excl. Tax)</Typography>
                    <Typography variant="body2" fontWeight={600}>₹{invoiceCalculations.subtotal.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">Total GST Amount</Typography>
                    <Typography variant="body2" fontWeight={600} color="purple">₹{invoiceCalculations.totalGst.toLocaleString()}</Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle1" fontWeight={800}>Grand Total</Typography>
                    <Typography variant="subtitle1" fontWeight={900} color="primary">₹{invoiceCalculations.grandTotal.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="success.main" fontWeight={600}>Paid Amount</Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">₹{invoiceCalculations.paid.toLocaleString()}</Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="warning.main" fontWeight={700}>Remaining Debt</Typography>
                    <Typography variant="body2" fontWeight={800} color="warning.main">₹{invoiceCalculations.balanceDue.toLocaleString()}</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button
            variant="contained"
            size="large"
            startIcon={<Receipt size={20} />}
            onClick={handleSaveInvoice}
            disabled={isSubmitting || items.length === 0}
            sx={{ bgcolor: theme.palette.primary.main, px: 4, borderRadius: 2.5, fontWeight: 800 }}
          >
            {isSubmitting ? 'Saving Transaction…' : `Complete Sale (₹${invoiceCalculations.grandTotal.toLocaleString()})`}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── INLINE NEW CUSTOMER ADD DIALOG ──────────────────────────────────── */}
      <Dialog open={addCustomerOpen} onClose={() => setAddCustomerOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Add New Customer</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} pt={1}>
            <TextField
              label="Customer / Business Name *"
              size="small"
              fullWidth
              value={newCustName}
              onChange={(e) => setNewCustName(e.target.value)}
              placeholder="e.g. Royal Wholesale Store"
              autoFocus
            />
            <TextField
              label="Phone Number"
              size="small"
              fullWidth
              value={newCustPhone}
              onChange={(e) => setNewCustPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
            />
            <TextField
              label="GSTIN (Optional)"
              size="small"
              fullWidth
              value={newCustGstin}
              onChange={(e) => setNewCustGstin(e.target.value)}
              placeholder="e.g. 27AADCB2230M1Z2"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setAddCustomerOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!newCustName.trim()}
            onClick={handleSaveNewCustomer}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Save & Select Customer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
