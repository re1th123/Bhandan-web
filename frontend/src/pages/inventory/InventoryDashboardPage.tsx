import React, { useState, Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
  useTheme,
  alpha,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  CompareArrows as CompareArrowsIcon,
  Autorenew as AutorenewIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  Warehouse as WarehouseIcon,
  AutoAwesome as AutoAwesomeIcon,
  LocalShipping as LocalShippingIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';
import { ResponsiveContainer, Treemap } from 'recharts';
import dayjs from 'dayjs';

const MotionCard = motion.create(Card);

// Lazy load other tab pages
const ProductsPage = lazy(() => import('./ProductsPage'));
const WarehousesPage = lazy(() => import('./WarehousesPage'));
const StockLedgerPage = lazy(() => import('./StockLedgerPage'));

const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Mock data for Treemap (Stock Velocity Map)
const treeMapData = [
  { name: 'ELECTRONICS: X-Series Hubs', size: 4000, fill: '#43A047' },
  { name: 'ACCESSORIES: USB-C Cables', size: 3000, fill: '#43A047' },
  { name: 'COMPONENTS: Resistors', size: 2000, fill: '#43A047' },
  { name: 'OLD GEN: Adapters', size: 1000, fill: '#9e9e9e' },
  { name: 'SPARE PARTS: Cases', size: 500, fill: '#9e9e9e' },
  { name: 'ACCESSORIES: Keyboards', size: 1500, fill: '#43A047' },
];

const COLORS = {
  green: '#43A047',
  blue: '#1976D2',
  orange: '#FB8C00',
  red: '#E53935',
  purple: '#8E24AA',
  teal: '#00897B',
};

// Treemap custom content
const CustomizedContent = (props: any) => {
  const { root, depth, x, y, width, height, index, payload, colors, rank, name, fill } = props;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: fill,
          stroke: '#fff',
          strokeWidth: 2 / (depth + 1e-10),
          strokeOpacity: 1 / (depth + 1e-10),
        }}
      />
      {width > 50 && height > 30 ? (
        <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={12}>
          {name}
        </text>
      ) : null}
    </g>
  );
};


export default function InventoryDashboardPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const activeBusiness = useAuthStore((s) => s.activeBusiness);
  const bizId = activeBusiness?.id;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Mock Queries
  const { data: metrics } = useQuery({
    queryKey: ['inventoryMetrics', bizId],
    queryFn: async () => {
      // Return mock data for dashboard metrics
      return {
        turnoverRatio: 4.2,
        turnoverGrowth: 0.8,
        totalValuation: 18500000,
        warehousesCount: 4,
        stockoutAlerts: 12,
        utilization: 82,
      };
    },
  });

  const m = metrics || {
    turnoverRatio: 4.2,
    turnoverGrowth: 0.8,
    totalValuation: 18500000,
    warehousesCount: 4,
    stockoutAlerts: 12,
    utilization: 82,
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Inventory Intelligence
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time valuation, stock movement, and predictive reordering.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add Product
          </Button>
          <Button variant="outlined" startIcon={<CompareArrowsIcon />}>
            Stock Adjustment
          </Button>
        </Stack>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 4,
          borderBottom: 1,
          borderColor: 'divider',
          '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '1rem' },
        }}
      >
        <Tab label="Overview" />
        <Tab label="Products" />
        <Tab label="Warehouses" />
        <Tab label="Stock Ledger" />
      </Tabs>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Grid container spacing={3}>
                {/* KPI Cards */}
                <Grid item xs={12} sm={6} md={3}>
                  <MotionCard whileHover={{ y: -4 }} sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography color="text.secondary" variant="overline" fontWeight={600}>
                            STOCK TURNOVER RATIO
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                            {m.turnoverRatio}x
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.1), color: COLORS.teal }}>
                          <AutorenewIcon />
                        </Avatar>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          +{m.turnoverGrowth}% improvement
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          • Annualized average rotation
                        </Typography>
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <MotionCard whileHover={{ y: -4 }} sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography color="text.secondary" variant="overline" fontWeight={600}>
                            INVENTORY VALUATION
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                            {formatCurrency(m.totalValuation)}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.1), color: COLORS.blue }}>
                          <InventoryIcon />
                        </Avatar>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total Asset Value
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Spread across {m.warehousesCount} active warehouses
                        </Typography>
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <MotionCard whileHover={{ y: -4 }} sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography color="text.secondary" variant="overline" fontWeight={600}>
                            STOCKOUT ALERTS
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" color="error.main" sx={{ mt: 1 }}>
                            {m.stockoutAlerts}
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.1), color: COLORS.red }}>
                          <WarningIcon />
                        </Avatar>
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="error.main" fontWeight="bold">
                          High Priority warning
                        </Typography>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                        >
                          Resolve Now →
                        </Typography>
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <MotionCard whileHover={{ y: -4 }} sx={{ height: '100%', boxShadow: theme.shadows[2] }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography color="text.secondary" variant="overline" fontWeight={600}>
                            WAREHOUSE UTILIZATION
                          </Typography>
                          <Typography variant="h4" fontWeight="bold" sx={{ mt: 1 }}>
                            {m.utilization}%
                          </Typography>
                        </Box>
                        <Avatar sx={{ bgcolor: alpha(COLORS.orange, 0.1), color: COLORS.orange }}>
                          <WarehouseIcon />
                        </Avatar>
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        <Chip
                          label="Near Capacity"
                          size="small"
                          color="warning"
                          sx={{ mb: 1, height: 20, fontSize: '0.7rem' }}
                        />
                        <LinearProgress
                          variant="determinate"
                          value={m.utilization}
                          color="warning"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    </CardContent>
                  </MotionCard>
                </Grid>

                {/* Charts Section */}
                <Grid item xs={12} md={8}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            Stock Velocity Map
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Fast Moving vs Dead Stock. 85% of revenue driven by top 12% of SKUs.
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: COLORS.green, borderRadius: '50%' }} />
                            <Typography variant="caption">Fast Moving</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, bgcolor: '#9e9e9e', borderRadius: '50%' }} />
                            <Typography variant="caption">Dead Stock</Typography>
                          </Box>
                          <Button size="small" variant="outlined">
                            Last 30 Days
                          </Button>
                        </Box>
                      </Box>
                      <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                          <Treemap
                            data={treeMapData}
                            dataKey="size"
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent />}
                          />
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '150px',
                        height: '150px',
                        background: `radial-gradient(circle, ${alpha(COLORS.purple, 0.2)} 0%, transparent 70%)`,
                        transform: 'translate(30%, -30%)',
                      }}
                    />
                    <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                        <AutoAwesomeIcon sx={{ color: COLORS.purple }} />
                        <Typography variant="h6" fontWeight="bold">
                          Critical Reorders
                        </Typography>
                        <Chip
                          label="AI NUDGE"
                          size="small"
                          sx={{
                            bgcolor: alpha(COLORS.purple, 0.1),
                            color: COLORS.purple,
                            fontWeight: 'bold',
                            ml: 'auto',
                          }}
                        />
                      </Box>
                      
                      <List disablePadding sx={{ flexGrow: 1 }}>
                        <ListItem disablePadding sx={{ mb: 2 }}>
                          <ListItemText
                            primary="Fan Assembly X2"
                            secondary="2 Left • Lead time 14 days"
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                          <Button size="small" variant="outlined" color="primary">
                            Add 50
                          </Button>
                        </ListItem>
                        <Divider sx={{ my: 1 }} />
                        <ListItem disablePadding sx={{ mt: 2 }}>
                          <ListItemText
                            primary="Copper Interconnects"
                            secondary="15 Left • Lead time 5 days"
                            primaryTypographyProps={{ fontWeight: 600 }}
                          />
                          <Button size="small" variant="outlined" color="primary">
                            Add 200
                          </Button>
                        </ListItem>
                      </List>

                      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
                        Generate All POs
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Bottom Section */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Aging & Expiry Risk
                      </Typography>
                      <Box sx={{ mt: 3, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Near Expiry (0-30 Days)</Typography>
                          <Typography variant="body2" fontWeight="bold">25% of Stock</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={75} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            bgcolor: alpha(COLORS.red, 0.2),
                            '& .MuiLinearProgress-bar': {
                              bgcolor: COLORS.green
                            }
                          }} 
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" color="success.main">Safe</Typography>
                          <Typography variant="caption" color="error.main">At Risk</Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={4}>
                          <Typography variant="h5" color="warning.main" fontWeight="bold">18</Typography>
                          <Typography variant="caption" color="text.secondary">SKUs Aging &gt;900d</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="h5" color="error.main" fontWeight="bold">5</Typography>
                          <Typography variant="caption" color="text.secondary">Expired Lots</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="h5" color="info.main" fontWeight="bold">₹12.5k</Typography>
                          <Typography variant="caption" color="text.secondary">Liquidation Opp.</Typography>
                        </Grid>
                      </Grid>

                      <Button 
                        variant="text" 
                        endIcon={<ArrowForwardIcon />}
                        sx={{ px: 0 }}
                      >
                        View Detailed Report
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold">
                          Pending Warehouse Transfers
                        </Typography>
                        <Chip label="4 Ongoing" color="info" size="small" />
                      </Box>

                      <List sx={{ flexGrow: 1 }}>
                        <ListItem>
                          <ListItemIcon>
                            <LocalShippingIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold">Central Hub → Satellite-B</Typography>
                                <Chip label="In Transit" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
                              </Box>
                            }
                            secondary="Batch #TR-9902 • 140 Units"
                          />
                        </ListItem>
                        <Divider variant="inset" component="li" />
                        <ListItem>
                          <ListItemIcon>
                            <LocalShippingIcon color="action" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" fontWeight="bold">Satellite-A → Central Hub</Typography>
                                <Chip label="Processing" size="small" color="info" sx={{ height: 20, fontSize: '0.7rem' }} />
                              </Box>
                            }
                            secondary="Batch #TR-9908 • 25 Units"
                          />
                        </ListItem>
                      </List>

                      <Button variant="outlined" startIcon={<AddIcon />} fullWidth sx={{ mt: 2 }}>
                        Create Internal Transfer
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>

              </Grid>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Other Tabs with Lazy Loading */}
        {activeTab === 1 && (
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
            <ProductsPage />
          </Suspense>
        )}
        {activeTab === 2 && (
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
            <WarehousesPage />
          </Suspense>
        )}
        {activeTab === 3 && (
          <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>}>
            <StockLedgerPage />
          </Suspense>
        )}
      </Box>
    </Box>
  );
}
