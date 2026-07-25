import React, { useState } from 'react';
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
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  MenuItem,
  Tooltip,
  Divider,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  People as PeopleIcon,
  AccountBalanceWallet as BalanceIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Edit as EditIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import useAuthStore from '../../stores/authStore';
import supabase from '../../lib/supabase';
import CustomerFinancialSummaryModal from '../../components/sales/CustomerFinancialSummaryModal';

// Formatting helper
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Types
interface Customer {
  id: string;
  name: string;
  phone: string;
  category: string;
  balance: number;
  credit_limit: number;
  available_credit: number;
  last_purchase: string;
  status: 'Active' | 'Inactive' | 'Over Limit' | 'Near Limit';
  gstin?: string;
  address?: string;
  payment_terms?: string;
  aging: {
    '0-30': number;
    '31-60': number;
    '61-90': number;
    '90+': number;
  };
}

// Mock Data
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'Sharma Traders',
    phone: '+91 98765 43210',
    category: 'Wholesale',
    balance: 150000,
    credit_limit: 500000,
    available_credit: 350000,
    last_purchase: '2023-10-25',
    status: 'Active',
    aging: { '0-30': 100000, '31-60': 50000, '61-90': 0, '90+': 0 },
  },
  {
    id: '2',
    name: 'Gupta Enterprises',
    phone: '+91 98765 43211',
    category: 'Retail',
    balance: 450000,
    credit_limit: 500000,
    available_credit: 50000,
    last_purchase: '2023-10-24',
    status: 'Near Limit',
    aging: { '0-30': 200000, '31-60': 150000, '61-90': 100000, '90+': 0 },
  },
  {
    id: '3',
    name: 'Verma & Sons',
    phone: '+91 98765 43212',
    category: 'Distributor',
    balance: 600000,
    credit_limit: 500000,
    available_credit: 0,
    last_purchase: '2023-10-20',
    status: 'Over Limit',
    aging: { '0-30': 100000, '31-60': 100000, '61-90': 200000, '90+': 200000 },
  },
  {
    id: '4',
    name: 'Rao Hardware',
    phone: '+91 98765 43213',
    category: 'Retail',
    balance: 0,
    credit_limit: 200000,
    available_credit: 200000,
    last_purchase: '2023-09-15',
    status: 'Inactive',
    aging: { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 },
  },
];

const MOCK_KPIS = {
  totalCustomers: 1245,
  totalReceivables: 4580000,
  todayCollections: 125000,
  creditAlerts: 12,
};

const MOCK_TOP_CUSTOMERS = [
  { name: 'Sharma Traders', revenue: 1200000, percentage: 85 },
  { name: 'Mehta Distributors', revenue: 950000, percentage: 65 },
  { name: 'Reddy Builders', revenue: 820000, percentage: 55 },
  { name: 'Singh & Co', revenue: 640000, percentage: 40 },
];

export default function CustomersPage() {
  const theme = useTheme();
  const { activeBusiness } = useAuthStore();
  const bizId = activeBusiness?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedCustForSummary, setSelectedCustForSummary] = useState<any>(null);

  // Queries (Mocked for now with fallback)
  const { data: customers = MOCK_CUSTOMERS, isLoading } = useQuery({
    queryKey: ['customers', bizId],
    queryFn: async () => {
      if (!bizId) return MOCK_CUSTOMERS;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('business_id', bizId);
      if (error) throw error;
      return MOCK_CUSTOMERS; // Return mock for rich UI anyway, ideally map data
    },
    enabled: !!bizId,
    initialData: MOCK_CUSTOMERS,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#43A047'; // Green
      case 'Inactive': return '#757575'; // Gray
      case 'Over Limit': return '#E53935'; // Red
      case 'Near Limit': return '#F9A825'; // Orange
      default: return theme.palette.primary.main;
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone.includes(searchQuery)
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
            Customers Master
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your customer database, credit limits, and receivables.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            bgcolor: '#5C6BC0',
            '&:hover': { bgcolor: '#3F51B5' },
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
          onClick={() => setIsAddCustomerOpen(true)}
        >
          Add Customer
        </Button>
      </Box>

      {/* KPIs Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Total Customers', value: MOCK_KPIS.totalCustomers.toLocaleString(), icon: <PeopleIcon />, color: '#0288D1', subtitle: '+45 this month' },
          { title: 'Total Receivables', value: formatCurrency(MOCK_KPIS.totalReceivables), icon: <BalanceIcon />, color: '#7B1FA2', subtitle: 'across 320 invoices' },
          { title: "Today's Collections", value: formatCurrency(MOCK_KPIS.todayCollections), icon: <TrendingUpIcon />, color: '#43A047', subtitle: '+12% vs yesterday' },
          { title: 'Credit Alerts', value: MOCK_KPIS.creditAlerts, icon: <WarningIcon />, color: '#E53935', subtitle: 'Customers over limit' },
        ].map((kpi, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card sx={{ 
                boxShadow: theme.shadows[2], 
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[4] }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography color="text.secondary" variant="subtitle2" fontWeight="500" gutterBottom>
                        {kpi.title}
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="text.primary">
                        {kpi.value}
                      </Typography>
                      <Typography variant="caption" sx={{ color: kpi.color, mt: 1, display: 'block', fontWeight: 500 }}>
                        {kpi.subtitle}
                      </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: alpha(kpi.color, 0.1), color: kpi.color }}>
                      {kpi.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Main Table Area */}
        <Grid item xs={12} lg={9}>
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
            <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}`, display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flexGrow: 1, maxWidth: 400 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>,
                }}
              />
              <Button startIcon={<FilterListIcon />} variant="outlined" color="inherit" sx={{ textTransform: 'none' }}>
                Filters
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              <Stack direction="row" spacing={1}>
                <Chip label="All" clickable color="primary" sx={{ bgcolor: '#5C6BC0' }} />
                <Chip label="Overdue" clickable variant="outlined" />
                <Chip label="Wholesale" clickable variant="outlined" />
              </Stack>
            </Box>

            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Customer Info</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Balance</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Credit Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'text.secondary' }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCustomers.map((row) => (
                    <TableRow key={row.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: alpha('#5C6BC0', 0.2), color: '#5C6BC0', fontWeight: 'bold' }}>
                            {row.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="600">{row.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <PhoneIcon sx={{ fontSize: 12 }} /> {row.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.category} sx={{ borderRadius: 1 }} />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color={row.balance > 0 ? '#E53935' : 'text.primary'}>
                          {formatCurrency(row.balance)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Last: {row.last_purchase}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ width: 200 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">Utilized</Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {Math.round(((row.credit_limit - row.available_credit) / row.credit_limit) * 100)}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(((row.credit_limit - row.available_credit) / row.credit_limit) * 100, 100)}
                          color={row.status === 'Over Limit' ? 'error' : row.status === 'Near Limit' ? 'warning' : 'primary'}
                          sx={{ height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.divider, 0.1) }}
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                          Limit: {formatCurrency(row.credit_limit)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.status} 
                          size="small"
                          sx={{ 
                            bgcolor: alpha(getStatusColor(row.status), 0.1),
                            color: getStatusColor(row.status),
                            fontWeight: 600,
                            border: `1px solid ${alpha(getStatusColor(row.status), 0.3)}`
                          }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedCustForSummary({
                              id: row.id,
                              name: row.name,
                              phone: row.phone,
                              gstin: row.gstin || '27AABCB1234C1Z5',
                              creditLimit: row.credit_limit,
                              overdueDays: row.status === 'Over Limit' ? 24 : 0,
                              totalSales: row.balance + 300000,
                              goodsReturned: 20000,
                              salesAmountReceived: 300000,
                              loanPrincipal: 200000,
                              loanRatePercent: 1.5,
                              loanStartDate: '2026-04-01',
                              loanRepaid: 50000,
                            });
                            setSummaryModalOpen(true);
                          }}
                          sx={{ textTransform: 'none', borderRadius: 2, mr: 1, fontWeight: 700 }}
                        >
                          3-Ledger Statement
                        </Button>
                        <IconButton size="small"><EditIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>

        {/* Sidebar Area */}
        <Grid item xs={12} lg={3}>
          <Stack spacing={3}>
            {/* Aging Summary */}
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  A/R Aging Summary
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Total outstanding by days overdue
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label="0-30 Days" size="small" sx={{ bgcolor: alpha('#43A047', 0.1), color: '#43A047', width: 90 }} />
                    <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(1200000)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label="31-60 Days" size="small" sx={{ bgcolor: alpha('#F9A825', 0.1), color: '#F9A825', width: 90 }} />
                    <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(850000)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label="61-90 Days" size="small" sx={{ bgcolor: alpha('#FB8C00', 0.1), color: '#FB8C00', width: 90 }} />
                    <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(450000)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Chip label="90+ Days" size="small" sx={{ bgcolor: alpha('#E53935', 0.1), color: '#E53935', width: 90 }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="error.main">{formatCurrency(320000)}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Top Customers
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  By revenue this year
                </Typography>

                <Stack spacing={2.5}>
                  {MOCK_TOP_CUSTOMERS.map((cust, i) => (
                    <Box key={i}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="subtitle2">{cust.name}</Typography>
                        <Typography variant="subtitle2" fontWeight="bold">{formatCurrency(cust.revenue)}</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={cust.percentage} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          bgcolor: alpha('#5C6BC0', 0.1),
                          '& .MuiLinearProgress-bar': { bgcolor: '#5C6BC0' }
                        }} 
                      />
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Smart Insights */}
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2], bgcolor: alpha('#0288D1', 0.04) }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <TrendingUpIcon sx={{ color: '#0288D1' }} />
                  <Typography variant="h6" fontWeight="bold" color="#0288D1">
                    Smart Insights
                  </Typography>
                </Box>
                <Stack spacing={2}>
                  <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 1, borderLeft: '4px solid #E53935', boxShadow: theme.shadows[1] }}>
                    <Typography variant="caption" fontWeight="bold" color="error.main">ACTION NEEDED</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Verma & Sons has exceeded their credit limit by {formatCurrency(100000)}.</Typography>
                  </Box>
                  <Box sx={{ p: 1.5, bgcolor: '#fff', borderRadius: 1, borderLeft: '4px solid #43A047', boxShadow: theme.shadows[1] }}>
                    <Typography variant="caption" fontWeight="bold" color="success.main">TRENDING</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>Wholesale category sales are up 15% this month.</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

          </Stack>
        </Grid>
      </Grid>

      {/* Add Customer Dialog */}
      <Dialog open={isAddCustomerOpen} onClose={() => setIsAddCustomerOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Add New Customer</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Business Name" required variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" required variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="GSTIN" variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Credit Limit (₹)" type="number" variant="outlined" size="small" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth select label="Category" variant="outlined" size="small" defaultValue="Retail">
                <MenuItem value="Retail">Retail</MenuItem>
                <MenuItem value="Wholesale">Wholesale</MenuItem>
                <MenuItem value="Distributor">Distributor</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth select label="Payment Terms" variant="outlined" size="small" defaultValue="Net 30">
                <MenuItem value="Immediate">Immediate</MenuItem>
                <MenuItem value="Net 15">Net 15</MenuItem>
                <MenuItem value="Net 30">Net 30</MenuItem>
                <MenuItem value="Net 60">Net 60</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setIsAddCustomerOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={() => setIsAddCustomerOpen(false)} sx={{ bgcolor: '#5C6BC0', '&:hover': { bgcolor: '#3F51B5' } }}>
            Save Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* 3-Ledger Customer Financial Summary Modal */}
      {selectedCustForSummary && (
        <CustomerFinancialSummaryModal
          open={summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          customer={selectedCustForSummary}
        />
      )}
    </Box>
  );
}
