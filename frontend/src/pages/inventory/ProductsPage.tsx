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
  Paper,
  IconButton,
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
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Plus as AddIcon,
  Edit2 as EditIcon,
  Trash2 as DeleteIcon,
  TrendingUp,
  AlertTriangle,
  Package,
  IndianRupee,
  MoreVertical,
  Filter as FilterIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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

// Types
interface Product {
  id: string;
  business_id: string;
  name: string;
  sku: string;
  hsn_code: string;
  category: string;
  wholesale_price: number;
  price: number; // selling price
  cost_price: number;
  min_stock_alert: number;
  warehouse_id: string;
  is_active: boolean;
  stock_qty: number; // joined/computed
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
}

// Mock Data Fallback
const MOCK_PRODUCTS: Product[] = [
  { id: '1', business_id: 'b1', name: 'Tata Salt 1kg', sku: 'TS-1KG', hsn_code: '25010010', category: 'Groceries', wholesale_price: 22, price: 25, cost_price: 18, min_stock_alert: 50, warehouse_id: 'w1', is_active: true, stock_qty: 450 },
  { id: '2', business_id: 'b1', name: 'Aashirvaad Atta 5kg', sku: 'AA-5KG', hsn_code: '11010000', category: 'Groceries', wholesale_price: 210, price: 230, cost_price: 190, min_stock_alert: 20, warehouse_id: 'w1', is_active: true, stock_qty: 15 },
  { id: '3', business_id: 'b1', name: 'Maggi 2-Minute Noodles', sku: 'MG-70G', hsn_code: '19023010', category: 'Snacks', wholesale_price: 12, price: 14, cost_price: 10, min_stock_alert: 100, warehouse_id: 'w2', is_active: true, stock_qty: 8 },
  { id: '4', business_id: 'b1', name: 'Parle-G Gold', sku: 'PG-GLD', hsn_code: '19053100', category: 'Snacks', wholesale_price: 18, price: 20, cost_price: 15, min_stock_alert: 30, warehouse_id: 'w2', is_active: true, stock_qty: 150 },
  { id: '5', business_id: 'b1', name: 'Fortune Sunflower Oil 1L', sku: 'FS-1L', hsn_code: '15121110', category: 'Groceries', wholesale_price: 135, price: 150, cost_price: 120, min_stock_alert: 40, warehouse_id: 'w1', is_active: true, stock_qty: 0 },
];

const MOCK_WAREHOUSES: Warehouse[] = [
  { id: 'all', name: 'All Warehouses', location: '' },
  { id: 'w1', name: 'Main Godown', location: 'Mumbai' },
  { id: 'w2', name: 'Secondary Hub', location: 'Pune' },
];

const MOCK_MOVEMENT_DATA = [
  { name: 'Mon', in: 40, out: 24 },
  { name: 'Tue', in: 30, out: 13 },
  { name: 'Wed', in: 20, out: 58 },
  { name: 'Thu', in: 27, out: 39 },
  { name: 'Fri', in: 18, out: 48 },
  { name: 'Sat', in: 23, out: 38 },
  { name: 'Sun', in: 34, out: 43 },
];

const CATEGORIES = ['All', 'Groceries', 'Snacks', 'Beverages', 'Personal Care'];

import { fetchBusinessTableData, insertBusinessTableData } from '../../lib/dataStore';
import { useQueryClient } from '@tanstack/react-query';

export default function ProductsPage() {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { activeBusiness } = useAuthStore();
  const businessId = activeBusiness?.id || 'b1';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodHsn, setProdHsn] = useState('');
  const [prodCategory, setProdCategory] = useState('Groceries');
  const [prodMinStock, setProdMinStock] = useState(20);
  const [prodCostPrice, setProdCostPrice] = useState(100);
  const [prodWholesalePrice, setProdWholesalePrice] = useState(120);
  const [prodPrice, setProdPrice] = useState(135);

  // Queries
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', businessId],
    queryFn: () => fetchBusinessTableData<Product>(businessId, 'products', MOCK_PRODUCTS),
    enabled: !!businessId,
  });

  const { data: warehouses = MOCK_WAREHOUSES } = useQuery({
    queryKey: ['warehouses', businessId],
    queryFn: () => fetchBusinessTableData<Warehouse>(businessId, 'warehouses', MOCK_WAREHOUSES),
    enabled: !!businessId,
  });

  const handleSaveProduct = async () => {
    if (!prodName) return;
    const newProd: Partial<Product> = {
      name: prodName,
      sku: prodSku || `SKU-${Date.now().toString().slice(-4)}`,
      hsn_code: prodHsn || '19053100',
      category: prodCategory,
      cost_price: Number(prodCostPrice) || 0,
      wholesale_price: Number(prodWholesalePrice) || 0,
      price: Number(prodPrice) || 0,
      min_stock_alert: Number(prodMinStock) || 10,
      warehouse_id: 'w1',
      is_active: true,
      stock_qty: 100,
    };

    await insertBusinessTableData(businessId, 'products', newProd as Product);
    queryClient.invalidateQueries({ queryKey: ['products', businessId] });
    setIsAddDialogOpen(false);

    // Reset form
    setProdName('');
    setProdSku('');
    setProdHsn('');
  };

  // Derived Data
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesWarehouse = selectedWarehouse === 'all' || p.warehouse_id === selectedWarehouse;
      return matchesSearch && matchesCategory && matchesWarehouse;
    });
  }, [products, searchQuery, selectedCategory, selectedWarehouse]);

  const kpis = useMemo(() => {
    const totalProducts = products.length;
    const inventoryValue = products.reduce((acc, p) => acc + (p.stock_qty * p.cost_price), 0);
    const lowStock = products.filter(p => p.stock_qty > 0 && p.stock_qty <= p.min_stock_alert).length;
    const outOfStock = products.filter(p => p.stock_qty === 0).length;
    return { totalProducts, inventoryValue, lowStock, outOfStock };
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.stock_qty <= p.min_stock_alert && p.stock_qty > 0);
  }, [products]);

  const getStockStatus = (qty: number, minAlert: number) => {
    if (qty === 0) return { label: 'Out of Stock', color: '#E53935' };
    if (qty <= minAlert) return { label: 'Low Stock', color: '#F9A825' };
    return { label: 'In Stock', color: '#43A047' };
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="700" color="text.primary">
          Inventory & Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
          sx={{
            bgcolor: '#5C6BC0',
            '&:hover': { bgcolor: '#3F51B5' },
            textTransform: 'none',
            borderRadius: 2,
            px: 3,
          }}
        >
          Add Product
        </Button>
      </Box>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Products', value: kpis.totalProducts, icon: Package, color: '#5C6BC0' },
          { title: 'Inventory Value', value: formatCurrency(kpis.inventoryValue), icon: IndianRupee, color: '#43A047' },
          { title: 'Low Stock Items', value: kpis.lowStock, icon: AlertTriangle, color: '#F9A825' },
          { title: 'Out of Stock', value: kpis.outOfStock, icon: TrendingUp, color: '#E53935' },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(kpi.color, 0.1), color: kpi.color, mr: 2 }}>
                    <kpi.icon size={24} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      {kpi.title}
                    </Typography>
                    <Typography variant="h5" fontWeight="700" sx={{ mt: 0.5 }}>
                      {kpi.value}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Inventory Health Overview */}
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>Inventory Health</Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Box sx={{ flex: kpis.totalProducts - kpis.lowStock - kpis.outOfStock, bgcolor: '#43A047', height: 12, borderRadius: 1 }} />
                <Box sx={{ flex: kpis.lowStock, bgcolor: '#F9A825', height: 12, borderRadius: 1 }} />
                <Box sx={{ flex: kpis.outOfStock, bgcolor: '#E53935', height: 12, borderRadius: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ w: 12, h: 12, borderRadius: '50%', bgcolor: '#43A047' }} />
                  <Typography variant="body2">Healthy ({kpis.totalProducts - kpis.lowStock - kpis.outOfStock})</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ w: 12, h: 12, borderRadius: '50%', bgcolor: '#F9A825' }} />
                  <Typography variant="body2">Low Stock ({kpis.lowStock})</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ w: 12, h: 12, borderRadius: '50%', bgcolor: '#E53935' }} />
                  <Typography variant="body2">Out of Stock ({kpis.outOfStock})</Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 4, height: 200 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Weekly Stock Movement</Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_MOVEMENT_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip cursor={{ fill: 'transparent' }} />
                    <Bar dataKey="in" name="Stock In" fill="#5C6BC0" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="out" name="Stock Out" fill="#0288D1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AlertTriangle color="#F9A825" size={20} />
                <Typography variant="h6" fontWeight="600">Reorder Alerts</Typography>
              </Box>
              <Stack spacing={2} sx={{ overflowY: 'auto', flexGrow: 1, maxHeight: 300, pr: 1 }}>
                <AnimatePresence>
                  {lowStockProducts.map((p) => (
                    <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
                      <Box sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="600">{p.name}</Typography>
                          <Typography variant="caption" color="text.secondary">SKU: {p.sku}</Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="subtitle2" color="error.main" fontWeight="700">{p.stock_qty} left</Typography>
                          <Typography variant="caption" color="text.secondary">Min: {p.min_stock_alert}</Typography>
                        </Box>
                      </Box>
                    </motion.div>
                  ))}
                  {lowStockProducts.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                      No low stock alerts!
                    </Typography>
                  )}
                </AnimatePresence>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Toolbar */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
            <TextField
              size="small"
              placeholder="Search products, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon size={20} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: { xs: '100%', sm: 300 } }}
            />
            
            <Stack direction="row" spacing={2} sx={{ overflowX: 'auto', width: { xs: '100%', sm: 'auto' }, pb: { xs: 1, sm: 0 } }}>
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  onClick={() => setSelectedCategory(cat)}
                  color={selectedCategory === cat ? 'primary' : 'default'}
                  variant={selectedCategory === cat ? 'filled' : 'outlined'}
                  sx={{ borderRadius: 2, cursor: 'pointer', fontWeight: 500 }}
                />
              ))}
            </Stack>

            <FormControl size="small" sx={{ minWidth: 200, display: { xs: 'none', md: 'block' } }}>
              <Select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <FilterIcon size={16} />
                  </InputAdornment>
                }
                sx={{ borderRadius: 2 }}
              >
                {warehouses.map(w => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Product Info</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>SKU/HSN</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem' }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', textAlign: 'right' }}>Pricing</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', align: 'center' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase', fontSize: '0.75rem', align: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.map((product) => {
                const status = getStockStatus(product.stock_qty, product.min_stock_alert);
                return (
                  <TableRow key={product.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2" fontWeight="600" color="text.primary">{product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{product.category}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="body2">{product.sku}</Typography>
                        <Typography variant="caption" color="text.secondary">{product.hsn_code}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" fontWeight="600">{product.stock_qty}</Typography>
                        <Box sx={{ width: 40, height: 20 }}>
                          {/* Sparkline mock */}
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[{v:10},{v:12},{v:8},{v:15},{v:product.stock_qty}]}>
                              <Line type="monotone" dataKey="v" stroke="#5C6BC0" strokeWidth={2} dot={false} isAnimationActive={false} />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography variant="body2" fontWeight="600">{formatCurrency(product.price)}</Typography>
                        <Tooltip title="Wholesale / Cost">
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(product.wholesale_price)} / {formatCurrency(product.cost_price)}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={status.label} 
                        size="small" 
                        sx={{ 
                          bgcolor: alpha(status.color, 0.1), 
                          color: status.color, 
                          fontWeight: 600,
                          borderRadius: 1
                        }} 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" sx={{ mr: 1 }}><EditIcon size={16} /></IconButton>
                      <IconButton size="small" color="error"><DeleteIcon size={16} /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No products found.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add Product Dialog (UI only) */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="700">Add New Product</Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Product Name" required variant="outlined" size="small" value={prodName} onChange={(e) => setProdName(e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="SKU" variant="outlined" size="small" value={prodSku} onChange={(e) => setProdSku(e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="HSN Code" variant="outlined" size="small" value={prodHsn} onChange={(e) => setProdHsn(e.target.value)} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select label="Category" value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Min Stock Alert" type="number" variant="outlined" size="small" value={prodMinStock} onChange={(e) => setProdMinStock(Number(e.target.value))} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Cost Price" type="number" variant="outlined" size="small" value={prodCostPrice} onChange={(e) => setProdCostPrice(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Wholesale Price" type="number" variant="outlined" size="small" value={prodWholesalePrice} onChange={(e) => setProdWholesalePrice(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Retail Price" type="number" variant="outlined" size="small" value={prodPrice} onChange={(e) => setProdPrice(Number(e.target.value))} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setIsAddDialogOpen(false)} color="inherit" sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProduct} sx={{ bgcolor: '#5C6BC0', '&:hover': { bgcolor: '#3F51B5' }, textTransform: 'none' }}>
            Save Product
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
