import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  Avatar,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Event as EventIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { Users, DollarSign, Clock, Calendar, TrendingUp, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';

const MotionCard = motion.create(Card);

// Constants
const COLORS = {
  green: '#43A047',
  blue: '#1976D2',
  orange: '#FB8C00',
  red: '#E53935',
  purple: '#8E24AA',
  teal: '#00897B',
};

// Utils
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// Mock Data
const PAYROLL_TREND_DATA = [
  { month: 'Feb', cost: 740000 },
  { month: 'Mar', cost: 750000 },
  { month: 'Apr', cost: 780000 },
  { month: 'May', cost: 785000 },
  { month: 'Jun', cost: 800000 },
  { month: 'Jul', cost: 820000 },
];

const DEPT_BREAKDOWN_DATA = [
  { name: 'Sales', value: 14, color: COLORS.blue },
  { name: 'Operations', value: 12, color: COLORS.teal },
  { name: 'Finance', value: 8, color: COLORS.purple },
  { name: 'Admin', value: 6, color: COLORS.orange },
];

const RECENT_HIRES = [
  { id: 1, name: 'Rahul Sharma', dept: 'Sales', joinDate: '2026-07-15', status: 'Probation' },
  { id: 2, name: 'Priya Patel', dept: 'Operations', joinDate: '2026-07-10', status: 'Probation' },
  { id: 3, name: 'Amit Kumar', dept: 'Finance', joinDate: '2026-06-01', status: 'Active' },
  { id: 4, name: 'Sneha Reddy', dept: 'Admin', joinDate: '2026-05-20', status: 'Active' },
];

const DIRECTORY_DATA = [
  { id: 101, name: 'Anil Desai', dept: 'Operations', designation: 'Operations Manager', contact: 'anil@example.com', status: 'Active' },
  { id: 102, name: 'Sunita Verma', dept: 'Sales', designation: 'Sales Head', contact: 'sunita@example.com', status: 'Active' },
  { id: 103, name: 'Vikram Singh', dept: 'Finance', designation: 'Senior Accountant', contact: 'vikram@example.com', status: 'On Leave' },
  { id: 104, name: 'Neha Gupta', dept: 'Admin', designation: 'HR Executive', contact: 'neha@example.com', status: 'Active' },
  { id: 105, name: 'Rajesh Khanna', dept: 'Sales', designation: 'Sales Executive', contact: 'rajesh@example.com', status: 'Active' },
  { id: 106, name: 'Kavita Joshi', dept: 'Operations', designation: 'Logistics Coordinator', contact: 'kavita@example.com', status: 'Active' },
  { id: 107, name: 'Sanjay Dutt', dept: 'Sales', designation: 'Sales Executive', contact: 'sanjay@example.com', status: 'Probation' },
  { id: 108, name: 'Pooja Bhatt', dept: 'Finance', designation: 'Financial Analyst', contact: 'pooja@example.com', status: 'Active' },
  { id: 109, name: 'Ravi Teja', dept: 'Operations', designation: 'Warehouse Supervisor', contact: 'ravi@example.com', status: 'Active' },
  { id: 110, name: 'Deepa Mehta', dept: 'Admin', designation: 'Office Assistant', contact: 'deepa@example.com', status: 'Probation' },
];

const RECENT_PAYROLL_RUNS = [
  { id: 1, month: 'June 2026', runDate: '2026-06-30', totalEmployees: 47, totalAmount: 800000, status: 'Paid' },
  { id: 2, month: 'May 2026', runDate: '2026-05-31', totalEmployees: 45, totalAmount: 785000, status: 'Paid' },
  { id: 3, month: 'April 2026', runDate: '2026-04-30', totalEmployees: 42, totalAmount: 780000, status: 'Paid' },
];

const LEAVE_REQUESTS = [
  { id: 1, employee: 'Vikram Singh', type: 'Sick Leave', duration: '2 Days (28-29 Jul)', status: 'Approved' },
  { id: 2, employee: 'Kavita Joshi', type: 'Casual Leave', duration: '1 Day (31 Jul)', status: 'Pending' },
  { id: 3, employee: 'Sunita Verma', type: 'Earned Leave', duration: '5 Days (10-14 Aug)', status: 'Pending' },
];

export default function EmployeeDashboardPage() {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  const activeBusiness = useAuthStore((s) => s.activeBusiness);
  
  // Dummy query just to show standard pattern
  const { data: stats } = useQuery({
    queryKey: ['employeeStats', activeBusiness?.id],
    queryFn: async () => {
      // Typically fetch from supabase here, using mock fallback for now
      return { headcount: 48, payroll: 820000, attendance: 94.6, pendingLeaves: 7 };
    },
    enabled: !!activeBusiness?.id
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const filteredDirectory = DIRECTORY_DATA.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    emp.dept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Workforce Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Employee directory, payroll tracking, and attendance insights for FY 2025-26 — {dayjs().format('MMMM D, YYYY')}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="outlined" startIcon={<AddIcon />}>
            Add Employee
          </Button>
          <Button variant="outlined" color="primary" startIcon={<PaymentIcon />}>
            Run Payroll
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="employee dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Directory" />
          <Tab label="Payroll Summary" />
          <Tab label="Attendance & Leaves" />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      {activeTab === 0 && (
        <Box>
          {/* KPI Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="600">
                      TOTAL HEADCOUNT
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.teal, 0.1) }}>
                      <Users size={20} color={COLORS.teal} />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    48
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp size={16} style={{ marginRight: 4 }} />
                      +6 new hires this quarter
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Active employees
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="600">
                      MONTHLY PAYROLL COST
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.green, 0.1) }}>
                      <DollarSign size={20} color={COLORS.green} />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    {formatCurrency(820000)}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp size={16} style={{ marginRight: 4 }} />
                      +2.4% growth
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Current month commitment
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="600">
                      ATTENDANCE RATE
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.blue, 0.1) }}>
                      <Clock size={20} color={COLORS.blue} />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    94.6%
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingUp size={16} style={{ marginRight: 4, transform: 'rotate(180deg)' }} />
                      -1.2% vs last month
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Average daily presence
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography color="text.secondary" variant="subtitle2" fontWeight="600">
                      PENDING LEAVE APPROVALS
                    </Typography>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(COLORS.orange, 0.1) }}>
                      <Calendar size={20} color={COLORS.orange} />
                    </Box>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                    7
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="warning.main">
                      3 urgent requests
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Requires action
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          </Grid>

          {/* Charts Section */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Payroll Cost Trend
                  </Typography>
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={PAYROLL_TREND_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.teal} stopOpacity={0.8}/>
                            <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} 
                        />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <Tooltip 
                          formatter={(value: number) => [formatCurrency(value), 'Payroll Cost']}
                          contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Area type="monotone" dataKey="cost" stroke={COLORS.teal} fillOpacity={1} fill="url(#colorCost)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Department Breakdown
                  </Typography>
                  <Box sx={{ height: 300, mt: 2, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={DEPT_BREAKDOWN_DATA}
                          cx="50%"
                          cy="45%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {DEPT_BREAKDOWN_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ 
                      position: 'absolute', 
                      top: '45%', 
                      left: '50%', 
                      transform: 'translate(-50%, -50%)',
                      textAlign: 'center'
                    }}>
                      <Typography variant="h5" fontWeight="bold">48</Typography>
                      <Typography variant="caption" color="text.secondary">Total</Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Bottom Section */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Recent Hires & Changes</Typography>
                    <Button size="small">View All</Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Join Date</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {RECENT_HIRES.map((row) => (
                          <TableRow key={row.id} hover>
                            <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem', bgcolor: COLORS.blue }}>
                                {row.name.charAt(0)}
                              </Avatar>
                              <Typography variant="body2">{row.name}</Typography>
                            </TableCell>
                            <TableCell>{row.dept}</TableCell>
                            <TableCell>{dayjs(row.joinDate).format('MMM D, YYYY')}</TableCell>
                            <TableCell>
                              <Chip 
                                label={row.status} 
                                size="small" 
                                color={row.status === 'Active' ? 'success' : 'warning'} 
                                variant="outlined"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Upcoming Events</Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2, display: 'flex', gap: 2 }}>
                        <Briefcase size={24} color={theme.palette.primary.main} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Work Anniversaries</Typography>
                          <Typography variant="body2" color="text.secondary">3 this month</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(COLORS.orange, 0.05), borderRadius: 2, display: 'flex', gap: 2 }}>
                        <EventIcon sx={{ color: COLORS.orange }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Birthdays</Typography>
                          <Typography variant="body2" color="text.secondary">2 this week</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(COLORS.green, 0.05), borderRadius: 2, display: 'flex', gap: 2 }}>
                        <EventIcon sx={{ color: COLORS.green }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Upcoming Holidays</Typography>
                          <Typography variant="body2" color="text.secondary">Aug 15 - Independence Day</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box sx={{ p: 2, bgcolor: alpha(COLORS.purple, 0.05), borderRadius: 2, display: 'flex', gap: 2 }}>
                        <Briefcase size={24} color={COLORS.purple} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">Training Schedules</Typography>
                          <Typography variant="body2" color="text.secondary">POSH Training - Aug 5</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 1 && (
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <TextField
                placeholder="Search employees..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <Button startIcon={<FilterIcon />} variant="outlined" size="small">
                Filters
              </Button>
            </Box>
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Department</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Contact</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDirectory.map((emp) => (
                    <TableRow key={emp.id} hover>
                      <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.secondary.main }}>
                          {emp.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="500">{emp.name}</Typography>
                      </TableCell>
                      <TableCell>{emp.dept}</TableCell>
                      <TableCell>{emp.designation}</TableCell>
                      <TableCell>{emp.contact}</TableCell>
                      <TableCell>
                        <Chip 
                          label={emp.status} 
                          size="small" 
                          color={emp.status === 'Active' ? 'success' : emp.status === 'Probation' ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {activeTab === 2 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Current Month Payroll Projection (July 2026)</Typography>
                  <Grid container spacing={4} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={4}>
                      <Typography color="text.secondary">Total Gross Salary</Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">{formatCurrency(950000)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography color="text.secondary">Total Deductions</Typography>
                      <Typography variant="h4" fontWeight="bold" color="error.main">{formatCurrency(130000)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography color="text.secondary">Net Payable</Typography>
                      <Typography variant="h4" fontWeight="bold" color="success.main">{formatCurrency(820000)}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Department-wise Payroll</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Department</TableCell>
                          <TableCell align="right">Headcount</TableCell>
                          <TableCell align="right">Cost</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {DEPT_BREAKDOWN_DATA.map((dept) => (
                          <TableRow key={dept.name}>
                            <TableCell>{dept.name}</TableCell>
                            <TableCell align="right">{dept.value}</TableCell>
                            <TableCell align="right">{formatCurrency((820000 * dept.value) / 48)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Recent Payroll Runs</Typography>
                    <Button size="small">View All</Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Month</TableCell>
                          <TableCell>Date Run</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {RECENT_PAYROLL_RUNS.map((run) => (
                          <TableRow key={run.id}>
                            <TableCell fontWeight="500">{run.month}</TableCell>
                            <TableCell>{dayjs(run.runDate).format('MMM D, YYYY')}</TableCell>
                            <TableCell align="right">{formatCurrency(run.totalAmount)}</TableCell>
                            <TableCell>
                              <Chip label={run.status} size="small" color="success" />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {activeTab === 3 && (
        <Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Attendance Highlights (Last 30 Days)</Typography>
                  <Box sx={{ display: 'flex', gap: 4, mb: 4, mt: 2 }}>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">94.6%</Typography>
                      <Typography color="text.secondary">Avg Present</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">3.2%</Typography>
                      <Typography color="text.secondary">Avg Leaves</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">2.2%</Typography>
                      <Typography color="text.secondary">Avg Absent</Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="subtitle2" gutterBottom>Attendance Rate Trend</Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Week 1 (Jul 1 - Jul 7)</Typography>
                        <Typography variant="body2" fontWeight="bold">96%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={96} color="success" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Week 2 (Jul 8 - Jul 14)</Typography>
                        <Typography variant="body2" fontWeight="bold">92%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={92} color="warning" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Week 3 (Jul 15 - Jul 21)</Typography>
                        <Typography variant="body2" fontWeight="bold">95%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={95} color="success" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">Week 4 (Jul 22 - Jul 28)</Typography>
                        <Typography variant="body2" fontWeight="bold">97%</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={97} color="success" sx={{ height: 8, borderRadius: 4 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">Recent Leave Requests</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {LEAVE_REQUESTS.map((req) => (
                      <Box key={req.id} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">{req.employee}</Typography>
                          <Chip 
                            label={req.status} 
                            size="small" 
                            color={req.status === 'Approved' ? 'success' : 'warning'} 
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">{req.type}</Typography>
                        <Typography variant="body2" color="text.secondary">{req.duration}</Typography>
                        {req.status === 'Pending' && (
                          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
                            <Button size="small" variant="contained" color="success" disableElevation fullWidth>Approve</Button>
                            <Button size="small" variant="outlined" color="error" fullWidth>Reject</Button>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
}
