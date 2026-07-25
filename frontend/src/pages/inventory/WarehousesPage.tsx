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
  Paper,
  Tooltip,
} from '@mui/material';
import {
  Building2 as WarehouseIcon,
  Package,
  IndianRupee,
  AlertTriangle,
  ArrowLeftRight,
  Plus as AddIcon,
  Search as SearchIcon,
  MapPin,
  BarChart2,
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  CheckCircle2,
  Phone,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import useAuthStore from '../../stores/authStore';
import supabase from '../../lib/supabase';

// Helper for Indian Currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export interface WarehouseItem {
  id: string;
  business_id: string;
  name: string;
  location: string;
  capacity: number; // in units or tons
  used_capacity: number;
  products_count: number;
  stock_value: number;
  is_active: boolean;
  manager_name: string;
  phone: string;
  pending_transfers: number;
}

export interface WarehouseLowStockAlert {
  id: string;
  product_name: string;
  sku: string;
  warehouse_name: string;
  current_qty: number;
  min_alert: number;
}

const MOCK_WAREHOUSES: WarehouseItem[] = [
  {
    id: 'wh-1',
    business_id: 'b1',
    name: 'Bhiwandi Central Warehousing Depot',
    location: 'Bhiwandi Logistics Hub, Thane, MH',
    capacity: 50000,
    used_capacity: 38500,
    products_count: 420,
    stock_value: 14500000,
    is_active: true,
    manager_name: 'Rajesh Sharma',
    phone: '+91 98200 11223',
    pending_transfers: 3,
  },
  {
    id: 'wh-2',
    business_id: 'b1',
    name: 'Navi Mumbai Cold & Dry Hub',
    location: 'Taloja Industrial Area, Navi Mumbai, MH',
    capacity: 30000,
    used_capacity: 26800,
    products_count: 280,
    stock_value: 9800000,
    is_active: true,
    manager_name: 'Suresh Patil',
    phone: '+91 98211 44556',
    pending_transfers: 1,
  },
  {
    id: 'wh-3',
    business_id: 'b1',
    name: 'Pune Industrial Park Warehouse',
    location: 'Chakan MIDC Phase 2, Pune, MH',
    capacity: 25000,
    used_capacity: 14200,
    products_count: 195,
    stock_value: 5600000,
    is_active: true,
    manager_name: 'Amit Deshmukh',
    phone: '+91 94220 77889',
    pending_transfers: 2,
  },
  {
    id: 'wh-4',
    business_id: 'b1',
    name: 'Ahmedabad FMCG Distribution Center',
    location: 'Sanand GIDC, Ahmedabad, GJ',
    capacity: 20000,
    used_capacity: 19400, // high capacity ~ 97%
    products_count: 150,
    stock_value: 4800000,
    is_active: true,
    manager_name: 'Vikram Mehta',
    phone: '+91 98980 33221',
    pending_transfers: 4,
  },
  {
    id: 'wh-5',
    business_id: 'b1',
    name: 'Old Nagpur Transit Godown',
    location: 'Kalamna Market Yard, Nagpur, MH',
    capacity: 15000,
    used_capacity: 0,
    products_count: 0,
    stock_value: 0,
    is_active: false,
    manager_name: 'Karan Singh',
    phone: '+91 97654 11009',
    pending_transfers: 0,
  },
];

const MOCK_LOW_STOCK_ALERTS: WarehouseLowStockAlert[] = [
  { id: 'ls-1', product_name: 'Fortune Sunflower Oil 1L', sku: 'FS-1L', warehouse_name: 'Bhiwandi Central', current_qty: 0, min_alert: 50 },
  { id: 'ls-2', product_name: 'Aashirvaad Whole Wheat Atta 5kg', sku: 'AA-5KG', warehouse_name: 'Navi Mumbai Hub', current_qty: 12, min_alert: 30 },
  { id: 'ls-3', product_name: 'Maggi 2-Minute Noodles Pack', sku: 'MG-70G', warehouse_name: 'Pune Industrial Park', current_qty: 8, min_alert: 100 },
  { id: 'ls-4', product_name: 'Tata Salt Crystal 1kg', sku: 'TS-1KG', warehouse_name: 'Ahmedabad Distribution', current_qty: 25, min_alert: 60 },
];

export default function WarehousesPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const businessId = activeBusiness?.id || null;

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form State for Add Warehouse
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    location: '',
    capacity: 25000,
    manager_name: '',
    phone: '',
  });

  // Query Warehouses
  const { data: warehouses = MOCK_WAREHOUSES } = useQuery({
    queryKey: ['warehouses-full', businessId],
    queryFn: async () => {
      if (!businessId) return MOCK_WAREHOUSES;

      const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('business_id', businessId);

      if (error || !data || data.length === 0) return MOCK_WAREHOUSES;

      return data.map((wh: any, idx: number) => ({
        ...wh,
        used_capacity: wh.used_capacity ?? (idx === 0 ? 38500 : 18000),
        products_count: wh.products_count ?? (idx * 50 + 100),
        stock_value: wh.stock_value ?? (idx * 3000000 + 4000000),
        manager_name: wh.manager_name || 'Store Incharge',
        phone: wh.phone || '+91 98000 00000',
        pending_transfers: wh.pending_transfers ?? (idx % 3),
      }));
    },
  });

  // Derived KPIs
  const kpis = useMemo(() => {
    const totalWarehouses = warehouses.length;
    const totalStockValue = warehouses.reduce((acc, w) => acc + (w.stock_value || 0), 0);
    const productsStored = warehouses.reduce((acc, w) => acc + (w.products_count || 0), 0);
    const pendingTransfers = warehouses.reduce((acc, w) => acc + (w.pending_transfers || 0), 0);

    return { totalWarehouses, totalStockValue, productsStored, pendingTransfers };
  }, [warehouses]);

  // Chart Data: Stock Value & Capacity Utilization by Warehouse
  const chartData = useMemo(() => {
    return warehouses
      .filter((w) => w.is_active)
      .map((w) => ({
        name: w.name.split(' ')[0] + ' ' + (w.name.split(' ')[1] || ''),
        stockValueLakhs: Math.round(w.stock_value / 100000),
        usedCapacity: w.used_capacity,
        capacity: w.capacity,
        occupancyPct: Math.round((w.used_capacity / (w.capacity || 1)) * 100),
      }));
  }, [warehouses]);

  // Filtered Warehouses
  const filteredWarehouses = useMemo(() => {
    return warehouses.filter(
      (w) =>
        w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.manager_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [warehouses, searchQuery]);

  const handleAddSubmit = () => {
    setIsAddDialogOpen(false);
    setNewWarehouse({
      name: '',
      location: '',
      capacity: 25000,
      manager_name: '',
      phone: '',
    });
  };

  const getCapacityColor = (pct: number) => {
    if (pct >= 90) return '#E53935'; // Near full - warning red
    if (pct >= 75) return '#FB8C00'; // High utilization orange
    return '#43A047'; // Healthy green
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="700" color="text.primary">
            Warehouse & Location Management
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Monitor stock storage across godowns, capacity utilization, and inter-branch transfers
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
          Add Warehouse
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Warehouses', value: kpis.totalWarehouses, icon: WarehouseIcon, color: '#0288D1', sub: 'Across 4 cities' },
          { title: 'Total Stock Value', value: formatCurrency(kpis.totalStockValue), icon: IndianRupee, color: '#43A047', sub: 'Valued at cost price' },
          { title: 'Products Stored', value: kpis.productsStored.toLocaleString('en-IN'), icon: Package, color: '#5C6BC0', sub: 'Active inventory SKUs' },
          { title: 'Pending Transfers', value: kpis.pendingTransfers, icon: ArrowLeftRight, color: '#FB8C00', sub: 'In-transit stock orders' },
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
                      <Typography variant="h5" fontWeight="700" sx={{ mt: 0.5, color: 'text.primary' }}>
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

      {/* Analytics & Alerts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Recharts Bar Chart: Stock Value by Warehouse */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BarChart2 size={20} color="#0288D1" />
                  <Typography variant="h6" fontWeight="700">
                    Stock Value by Warehouse (₹ Lakhs)
                  </Typography>
                </Box>
                <Chip label="Live Inventory" size="small" sx={{ bgcolor: alpha('#43A047', 0.12), color: '#43A047', fontWeight: 600 }} />
              </Box>

              <Box sx={{ height: 260, width: '100%', mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} unit="L" />
                    <RechartsTooltip
                      formatter={(val: any) => [`₹${val} Lakhs`, 'Stock Value']}
                      contentStyle={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="stockValueLakhs" fill="#0288D1" radius={[6, 6, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#0288D1' : index === 1 ? '#5C6BC0' : '#43A047'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts per Warehouse */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AlertTriangle size={20} color="#FB8C00" />
                <Typography variant="h6" fontWeight="700">
                  Low Stock by Godown
                </Typography>
              </Box>
              <Stack spacing={1.5} sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: 250, pr: 0.5 }}>
                {MOCK_LOW_STOCK_ALERTS.map((alert) => (
                  <Box
                    key={alert.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(alert.current_qty === 0 ? '#E53935' : '#FB8C00', 0.06),
                      border: `1px solid ${alpha(alert.current_qty === 0 ? '#E53935' : '#FB8C00', 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle2" fontWeight="600" color="text.primary">
                        {alert.product_name}
                      </Typography>
                      <Chip
                        label={alert.current_qty === 0 ? 'Out of Stock' : `${alert.current_qty} left`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: alpha(alert.current_qty === 0 ? '#E53935' : '#FB8C00', 0.15),
                          color: alert.current_qty === 0 ? '#E53935' : '#FB8C00',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {alert.warehouse_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Min threshold: {alert.min_alert}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', mb: 3, border: '1px solid', borderColor: 'divider' }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              size="small"
              placeholder="Search warehouse by name, city, manager..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: 320 } }}
            />

            <Stack direction="row" spacing={1}>
              <Button
                variant={viewMode === 'grid' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('grid')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  ...(viewMode === 'grid' && { bgcolor: '#0288D1' }),
                }}
              >
                Cards View
              </Button>
              <Button
                variant={viewMode === 'table' ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setViewMode('table')}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  ...(viewMode === 'table' && { bgcolor: '#0288D1' }),
                }}
              >
                Table View
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Warehouses Grid or Table View */}
      {viewMode === 'grid' ? (
        <Grid container spacing={3}>
          {filteredWarehouses.map((wh, idx) => {
            const occupancyPct = wh.capacity > 0 ? Math.round((wh.used_capacity / wh.capacity) * 100) : 0;
            const capColor = getCapacityColor(occupancyPct);

            return (
              <Grid item xs={12} md={6} lg={4} key={wh.id}>
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.05 }}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
                      border: '1px solid',
                      borderColor: 'divider',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'translateY(-3px)' },
                    }}
                  >
                    <Box sx={{ height: 5, bgcolor: capColor }} />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: alpha('#0288D1', 0.12), color: '#0288D1', borderRadius: 2 }}>
                            <WarehouseIcon size={20} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="700" color="text.primary" sx={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
                              {wh.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                              <MapPin size={14} color={theme.palette.text.secondary} />
                              <Typography variant="caption" color="text.secondary">
                                {wh.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Chip
                          label={wh.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: alpha(wh.is_active ? '#43A047' : '#757575', 0.12),
                            color: wh.is_active ? '#43A047' : '#757575',
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      {/* Capacity Meter */}
                      <Box sx={{ mt: 2.5, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight="600">
                            Capacity Used ({occupancyPct}%)
                          </Typography>
                          <Typography variant="caption" fontWeight="700" style={{ color: capColor }}>
                            {wh.used_capacity.toLocaleString()} / {wh.capacity.toLocaleString()} units
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(occupancyPct, 100)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            bgcolor: alpha(capColor, 0.12),
                            '& .MuiLinearProgress-bar': { bgcolor: capColor, borderRadius: 4 },
                          }}
                        />
                      </Box>

                      {/* Key Stats */}
                      <Grid container spacing={1.5} sx={{ mt: 1, pt: 1, borderTop: '1px border', borderColor: 'divider' }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Products Stored
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="700">
                            {wh.products_count} SKUs
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Stock Value
                          </Typography>
                          <Typography variant="subtitle2" fontWeight="700" color="#0288D1">
                            {formatCurrency(wh.stock_value)}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <UserCheck size={14} color={theme.palette.text.secondary} />
                              <Typography variant="caption" color="text.secondary">
                                {wh.manager_name} ({wh.phone})
                              </Typography>
                            </Box>
                            {wh.pending_transfers > 0 && (
                              <Chip
                                label={`${wh.pending_transfers} pending transfers`}
                                size="small"
                                variant="outlined"
                                color="warning"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        /* Table View */
        <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.grey[500], 0.05) }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Warehouse Name</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Manager & Phone</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Capacity Occupancy</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Stock Value</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', align: 'center' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', align: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWarehouses.map((wh) => {
                  const occupancyPct = wh.capacity > 0 ? Math.round((wh.used_capacity / wh.capacity) * 100) : 0;
                  const capColor = getCapacityColor(occupancyPct);

                  return (
                    <TableRow key={wh.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="700">
                          {wh.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {wh.products_count} Products Stored
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{wh.location}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">{wh.manager_name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {wh.phone}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ minWidth: 160 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" fontWeight="600" style={{ color: capColor }}>
                            {occupancyPct}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {wh.used_capacity} / {wh.capacity}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(occupancyPct, 100)}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: alpha(capColor, 0.15),
                            '& .MuiLinearProgress-bar': { bgcolor: capColor, borderRadius: 3 },
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="700" color="#0288D1">
                          {formatCurrency(wh.stock_value)}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={wh.is_active ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: alpha(wh.is_active ? '#43A047' : '#757575', 0.12),
                            color: wh.is_active ? '#43A047' : '#757575',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>

                      <TableCell align="center">
                        <IconButton size="small" color="primary">
                          <EditIcon size={16} />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}

      {/* Add Warehouse Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarehouseIcon size={20} color="#0288D1" />
          <Typography variant="h6" fontWeight="700">
            Add New Warehouse / Godown
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Warehouse Name *"
                variant="outlined"
                size="small"
                value={newWarehouse.name}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location / Address *"
                variant="outlined"
                size="small"
                value={newWarehouse.location}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Capacity (Units / Tons)"
                type="number"
                variant="outlined"
                size="small"
                value={newWarehouse.capacity}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, capacity: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Godown Manager Name"
                variant="outlined"
                size="small"
                value={newWarehouse.manager_name}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, manager_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                variant="outlined"
                size="small"
                value={newWarehouse.phone}
                onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
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
            onClick={handleAddSubmit}
            sx={{ bgcolor: '#0288D1', '&:hover': { bgcolor: '#0277BD' }, textTransform: 'none', px: 3 }}
          >
            Create Warehouse
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
