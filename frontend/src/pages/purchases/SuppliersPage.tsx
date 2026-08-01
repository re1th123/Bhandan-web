import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Plus as AddIcon,
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  Users,
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Building,
  Calendar,
  Filter as FilterIcon,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import useAuthStore from '../../stores/authStore';
import supabase from '../../lib/supabase';

// Indian Currency Helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Interface definition matching database & extra computed fields
export interface SupplierItem {
  id: string;
  business_id: string;
  name: string;
  gstin?: string;
  pan?: string;
  address?: string;
  phone?: string;
  payment_terms?: string;
  category?: string;
  is_active: boolean;
  outstanding_balance: number;
  overdue_balance: number;
  last_purchase_date: string;
  total_purchase_value: number;
}

const MOCK_SUPPLIERS: SupplierItem[] = [
  {
    id: 'sup-1',
    business_id: 'b1',
    name: 'Reliance Retail Wholesale Pvt Ltd',
    gstin: '27AAACR5532R1Z8',
    pan: 'AAACR5532R',
    address: 'Bandra-Kurla Complex, Mumbai, Maharashtra 400051',
    phone: '+91 98201 12345',
    payment_terms: 'Net 30',
    category: 'FMCG Distributors',
    is_active: true,
    outstanding_balance: 485000,
    overdue_balance: 120000,
    last_purchase_date: '2026-07-22',
    total_purchase_value: 2850000,
  },
  {
    id: 'sup-2',
    business_id: 'b1',
    name: 'Shree Cement & Packaging Ltd',
    gstin: '24AABCS8891P1ZX',
    pan: 'AABCS8891P',
    address: 'GIDC Estate, Phase 3, Ahmedabad, Gujarat 382445',
    phone: '+91 94260 88765',
    payment_terms: 'Net 15',
    category: 'Packaging',
    is_active: true,
    outstanding_balance: 210000,
    overdue_balance: 0,
    last_purchase_date: '2026-07-20',
    total_purchase_value: 1420000,
  },
  {
    id: 'sup-3',
    business_id: 'b1',
    name: 'Mahalaxmi Grains & Agro Mills',
    gstin: '27AAGFM1092M1ZN',
    pan: 'AAGFM1092M',
    address: 'APMC Market Yard, Vashi, Navi Mumbai 400705',
    phone: '+91 98694 54321',
    payment_terms: 'Immediate / Cash',
    category: 'Raw Materials',
    is_active: true,
    outstanding_balance: 95000,
    overdue_balance: 45000,
    last_purchase_date: '2026-07-24',
    total_purchase_value: 1980000,
  },
  {
    id: 'sup-4',
    business_id: 'b1',
    name: 'Godrej Consumer Products Supply',
    gstin: '27AAACG1204N1ZD',
    pan: 'AAACG1204N',
    address: 'Vikhroli East, Mumbai, Maharashtra 400079',
    phone: '+91 91672 33445',
    payment_terms: 'Net 45',
    category: 'FMCG Distributors',
    is_active: true,
    outstanding_balance: 620000,
    overdue_balance: 180000,
    last_purchase_date: '2026-07-15',
    total_purchase_value: 3450000,
  },
  {
    id: 'sup-5',
    business_id: 'b1',
    name: 'Vardhman Polytech Packaging',
    gstin: '03AABCV9921K1ZU',
    pan: 'AABCV9921K',
    address: 'Focal Point, Ludhiana, Punjab 141010',
    phone: '+91 98140 77112',
    payment_terms: 'Net 30',
    category: 'Packaging',
    is_active: false,
    outstanding_balance: 0,
    overdue_balance: 0,
    last_purchase_date: '2026-05-10',
    total_purchase_value: 680000,
  },
  {
    id: 'sup-6',
    business_id: 'b1',
    name: 'Apex Express Logistics & Transport',
    gstin: '27AADCA4412B1Z1',
    pan: 'AADCA4412B',
    address: 'Bhiwandi Integrated Warehousing Zone, Thane 421302',
    phone: '+91 98210 99887',
    payment_terms: 'Net 15',
    category: 'Logistics',
    is_active: true,
    outstanding_balance: 145000,
    overdue_balance: 0,
    last_purchase_date: '2026-07-23',
    total_purchase_value: 920000,
  },
];

const CATEGORIES = ['All', 'FMCG Distributors', 'Raw Materials', 'Packaging', 'Logistics'];
const STATUSES = ['All', 'Active', 'Inactive', 'Overdue'];

import { fetchBusinessTableData, insertBusinessTableData } from '../../lib/dataStore';
import { useQueryClient } from '@tanstack/react-query';

export default function SuppliersPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { activeBusiness } = useAuthStore();
  const businessId = activeBusiness?.id || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form State for New Supplier
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    phone: '',
    gstin: '',
    pan: '',
    address: '',
    payment_terms: 'Net 30',
    category: 'FMCG Distributors',
  });

  // Query suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ['suppliers', businessId],
    queryFn: () => fetchBusinessTableData<SupplierItem>(businessId, 'suppliers', MOCK_SUPPLIERS),
    enabled: !!businessId,
  });

  const handleSaveSupplier = async () => {
    if (!newSupplier.name.trim()) return;

    const itemToInsert: Partial<SupplierItem> = {
      name: newSupplier.name.trim(),
      phone: newSupplier.phone.trim(),
      gstin: newSupplier.gstin.trim(),
      pan: newSupplier.pan.trim(),
      address: newSupplier.address.trim(),
      payment_terms: newSupplier.payment_terms,
      category: newSupplier.category,
      is_active: true,
      outstanding_balance: 0,
      overdue_balance: 0,
      last_purchase_date: new Date().toISOString().split('T')[0],
      total_purchase_value: 0,
    };

    await insertBusinessTableData(businessId, 'suppliers', itemToInsert as SupplierItem);
    queryClient.invalidateQueries({ queryKey: ['suppliers', businessId] });
    setIsAddDialogOpen(false);

    setNewSupplier({
      name: '',
      phone: '',
      gstin: '',
      pan: '',
      address: '',
      payment_terms: 'Net 30',
      category: 'FMCG Distributors',
    });
  };

  // Filtered Suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((sup) => {
      const matchesSearch =
        sup.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sup.gstin && sup.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (sup.phone && sup.phone.includes(searchQuery));
      const matchesCategory = selectedCategory === 'All' || sup.category === selectedCategory;

      let matchesStatus = true;
      if (selectedStatus === 'Active') matchesStatus = sup.is_active;
      else if (selectedStatus === 'Inactive') matchesStatus = !sup.is_active;
      else if (selectedStatus === 'Overdue') matchesStatus = sup.overdue_balance > 0;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [suppliers, searchQuery, selectedCategory, selectedStatus]);

  // Calculated KPIs
  const kpis = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((s) => s.is_active).length;
    const totalPayables = suppliers.reduce((acc, s) => acc + (s.outstanding_balance || 0), 0);
    const overduePayables = suppliers.reduce((acc, s) => acc + (s.overdue_balance || 0), 0);
    return { total, active, totalPayables, overduePayables };
  }, [suppliers]);

  // Top suppliers by purchase value
  const topSuppliers = useMemo(() => {
    const sorted = [...suppliers].sort((a, b) => b.total_purchase_value - a.total_purchase_value);
    const maxVal = sorted[0]?.total_purchase_value || 1;
    return sorted.slice(0, 5).map((s) => ({
      ...s,
      percentage: Math.round((s.total_purchase_value / maxVal) * 100),
    }));
  }, [suppliers]);

  // Supplier Aging Buckets
  const agingBuckets = useMemo(() => {
    return [
      { label: '0-30 Days', amount: Math.round(kpis.totalPayables * 0.45), color: '#43A047' },
      { label: '31-60 Days', amount: Math.round(kpis.totalPayables * 0.3), color: '#0288D1' },
      { label: '61-90 Days', amount: Math.round(kpis.totalPayables * 0.15), color: '#FB8C00' },
      { label: '90+ Days', amount: Math.round(kpis.totalPayables * 0.1), color: '#E53935' },
    ];
  }, [kpis.totalPayables]);

  const handleAddSupplierSubmit = () => {
    setIsAddDialogOpen(false);
    setNewSupplier({
      name: '',
      phone: '',
      gstin: '',
      pan: '',
      address: '',
      payment_terms: 'Net 30',
      category: 'FMCG Distributors',
    });
  };

  const getStatusChip = (sup: SupplierItem) => {
    if (!sup.is_active) {
      return <Chip label="Inactive" size="small" sx={{ bgcolor: alpha('#757575', 0.12), color: '#757575', fontWeight: 600 }} />;
    }
    if (sup.overdue_balance > 0) {
      return <Chip label="Overdue" size="small" sx={{ bgcolor: alpha('#E53935', 0.12), color: '#E53935', fontWeight: 600 }} />;
    }
    return <Chip label="Active" size="small" sx={{ bgcolor: alpha('#43A047', 0.12), color: '#43A047', fontWeight: 600 }} />;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Top Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Supplier Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Track vendors, payables, payment terms, and purchase histories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{
            bgcolor: '#0288D1',
            '&:hover': { bgcolor: '#0277BD' },
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
            py: 1,
            boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)',
          }}
        >
          Add Supplier
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Suppliers', value: kpis.total, icon: Users, color: '#0288D1', sub: `${kpis.active} active vendors` },
          { title: 'Total Payables', value: formatCurrency(kpis.totalPayables), icon: IndianRupee, color: '#E53935', sub: 'Outstanding to vendors' },
          { title: 'Overdue Payables', value: formatCurrency(kpis.overduePayables), icon: AlertTriangle, color: '#E53935', sub: 'Past agreed credit terms' },
          { title: 'Active Suppliers', value: kpis.active, icon: CheckCircle2, color: '#43A047', sub: `${Math.round((kpis.active / (kpis.total || 1)) * 100)}% active rate` },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-2px)' },
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight="600" textTransform="uppercase">
                        {kpi.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="700" sx={{ mt: 0.5, color: kpi.title.includes('Payable') ? '#E53935' : 'text.primary' }}>
                        {kpi.value}
                      </Typography>
                    </Box>
                    <Box sx={{ p: 1.2, borderRadius: 2, bgcolor: alpha(kpi.color, 0.12), color: kpi.color }}>
                      <kpi.icon size={22} />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                    {kpi.sub}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Analytics Row: Top Suppliers & Payables Aging */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Top Suppliers by Purchase Value */}
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TrendingUp size={20} color="#0288D1" />
                  <Typography variant="h6" fontWeight="700">
                    Top Suppliers by Purchase Value
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  YTD Purchases
                </Typography>
              </Box>
              <Stack spacing={2.5}>
                {topSuppliers.map((s, idx) => (
                  <Box key={s.id}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                      <Typography variant="body2" fontWeight="600" color="text.primary">
                        {idx + 1}. {s.name}
                      </Typography>
                      <Typography variant="body2" fontWeight="700" color="#0288D1">
                        {formatCurrency(s.total_purchase_value)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={s.percentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha('#0288D1', 0.1),
                        '& .MuiLinearProgress-bar': { bgcolor: '#0288D1', borderRadius: 4 },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Accounts Payable Aging */}
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Typography variant="h6" fontWeight="700">
                    Payables Aging Buckets
                  </Typography>
                  <Typography variant="caption" color="error.main" fontWeight="600">
                    {formatCurrency(kpis.totalPayables)} Total
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {agingBuckets.map((bucket, idx) => {
                    const pct = Math.round((bucket.amount / (kpis.totalPayables || 1)) * 100);
                    return (
                      <Box key={idx} sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(bucket.color, 0.05), border: `1px solid ${alpha(bucket.color, 0.2)}` }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="600" style={{ color: bucket.color }}>
                            {bucket.label}
                          </Typography>
                          <Typography variant="body2" fontWeight="700">
                            {formatCurrency(bucket.amount)} ({pct}%)
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={pct}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(bucket.color, 0.15),
                            '& .MuiLinearProgress-bar': { bgcolor: bucket.color, borderRadius: 3 },
                          }}
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </Box>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px border', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                <AlertTriangle size={16} color="#E53935" />
                <Typography variant="caption" color="text.secondary">
                  Action required for 90+ days overdue suppliers to maintain credit standing.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter & Toolbar */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              size="small"
              placeholder="Search supplier by name, GSTIN, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', md: 320 } }}
            />

            {/* Category Filter Chips */}
            <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', width: { xs: '100%', md: 'auto' } }}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  color={selectedCategory === cat ? 'primary' : 'default'}
                  variant={selectedCategory === cat ? 'filled' : 'outlined'}
                  sx={{
                    borderRadius: 2,
                    cursor: 'pointer',
                    fontWeight: 500,
                    ...(selectedCategory === cat && { bgcolor: '#0288D1' }),
                  }}
                />
              ))}
            </Stack>

            {/* Status Select */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
                sx={{ borderRadius: 2 }}
              >
                {STATUSES.map((st) => (
                  <MenuItem key={st} value={st}>
                    {st}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Supplier Info</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Phone & Contact</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>GSTIN & PAN</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Category & Terms</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Outstanding Payables</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Last Purchase</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', align: 'center' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', align: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSuppliers.map((sup) => (
                <TableRow key={sup.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: alpha('#0288D1', 0.15), color: '#0288D1', fontWeight: 700, width: 36, height: 36, fontSize: '0.9rem' }}>
                        {sup.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600" color="text.primary">
                          {sup.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sup.address}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Phone size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2">{sup.phone || 'N/A'}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2" fontWeight="500">{sup.gstin || 'Unregistered'}</Typography>
                    <Typography variant="caption" color="text.secondary">PAN: {sup.pan || 'N/A'}</Typography>
                  </TableCell>

                  <TableCell>
                    <Chip label={sup.category || 'General'} size="small" variant="outlined" sx={{ borderRadius: 1.5, fontSize: '0.7rem', mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Terms: {sup.payment_terms || 'Net 30'}
                    </Typography>
                  </TableCell>

                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="700" color={sup.outstanding_balance > 0 ? '#E53935' : 'text.primary'}>
                      {formatCurrency(sup.outstanding_balance)}
                    </Typography>
                    {sup.overdue_balance > 0 && (
                      <Typography variant="caption" color="error.main" fontWeight="600" sx={{ display: 'block' }}>
                        Overdue: {formatCurrency(sup.overdue_balance)}
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Calendar size={14} color={theme.palette.text.secondary} />
                      <Typography variant="body2">{dayjs(sup.last_purchase_date).format('DD MMM YYYY')}</Typography>
                    </Box>
                  </TableCell>

                  <TableCell align="center">{getStatusChip(sup)}</TableCell>

                  <TableCell align="center">
                    <IconButton size="small" color="primary" sx={{ mr: 0.5 }}>
                      <EditIcon size={16} />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No suppliers matching criteria.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Supplier Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Building size={20} color="#0288D1" />
          <Typography variant="h6" fontWeight="700">Add New Supplier</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Supplier Business Name *"
                variant="outlined"
                size="small"
                value={newSupplier.name}
                onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Phone Number"
                variant="outlined"
                size="small"
                value={newSupplier.phone}
                onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="GSTIN Number"
                variant="outlined"
                size="small"
                placeholder="27AAAAA0000A1Z5"
                value={newSupplier.gstin}
                onChange={(e) => setNewSupplier({ ...newSupplier, gstin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="PAN Number"
                variant="outlined"
                size="small"
                placeholder="AAAAA0000A"
                value={newSupplier.pan}
                onChange={(e) => setNewSupplier({ ...newSupplier, pan: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={newSupplier.category}
                  onChange={(e) => setNewSupplier({ ...newSupplier, category: e.target.value })}
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Payment Terms</InputLabel>
                <Select
                  label="Payment Terms"
                  value={newSupplier.payment_terms}
                  onChange={(e) => setNewSupplier({ ...newSupplier, payment_terms: e.target.value })}
                >
                  <MenuItem value="Immediate / Cash">Immediate / Cash</MenuItem>
                  <MenuItem value="Net 15">Net 15 Days</MenuItem>
                  <MenuItem value="Net 30">Net 30 Days</MenuItem>
                  <MenuItem value="Net 45">Net 45 Days</MenuItem>
                  <MenuItem value="Net 60">Net 60 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Registered Address"
                variant="outlined"
                size="small"
                value={newSupplier.address}
                onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveSupplier}
            sx={{ bgcolor: '#0288D1', '&:hover': { bgcolor: '#0277BD' }, textTransform: 'none', px: 3 }}
          >
            Save Supplier
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
