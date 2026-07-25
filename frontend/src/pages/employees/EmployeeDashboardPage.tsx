import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  Chip,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tabs,
  Tab,
  Stack,
  Divider,
  useTheme,
  alpha,
  Paper,
  Tooltip,
  InputBase,
  Drawer,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SpeedDial,
  SpeedDialIcon,
  SpeedDialAction,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Rating,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  Users,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  CreditCard,
  Plus,
  Filter,
  RefreshCw,
  X,
  FileText,
  Truck,
  Package,
  AlertTriangle,
  Download,
  BookOpen,
  FolderOpen,
  Award,
  Zap,
  RotateCcw,
  Percent,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Calendar,
  Layers,
  ArrowRightLeft,
  Building2,
  Eye,
  Printer,
  Share2,
  Lightbulb,
  ShieldAlert,
  Star,
  Check,
  Phone,
  Mail,
  UserPlus,
  CalendarCheck,
  Briefcase,
  Sliders,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

import supabase from '../../lib/supabase';
import useAuthStore from '../../stores/authStore';

// Formatters
const formatCurrency = (amount: number) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

// Colors
const COLORS = {
  green: '#43A047',
  greenLight: '#E8F5E9',
  blue: '#1976D2',
  blueLight: '#E3F2FD',
  orange: '#FB8C00',
  orangeLight: '#FFF3E0',
  red: '#E53935',
  redLight: '#FFEBEE',
  purple: '#8E24AA',
  purpleLight: '#F3E5F5',
  teal: '#00897B',
  gray: '#64748B',
  bgLight: '#F8FAFC',
};

const MotionCard = motion.create(Card);

// MOCK DATA Fallback for Employee Operations
const MOCK_EMPLOYEE_DATA = {
  kpis: {
    totalEmployees: 42,
    activeEmployees: 38,
    inactiveEmployees: 4,
    newThisMonth: 3,
    presentToday: 36,
    absentToday: 4,
    halfDayToday: 2,
    attendanceRate: 85.7,
    todayLaborCost: 18500,
    prevDayLaborCost: 17580,
    costGrowth: 5.2,
    totalOutstandingWages: 68000,
    awaitingPaymentCount: 14,
    overdueWagesCount: 3,
    thisMonthWages: 485000,
    prevMonthWages: 447000,
    wageGrowth: 8.4,
    monthlyAvgAttendance: 88.5,
    weeklyTrend: 2.1,
    availableStaff: 36,
    onLeave: 3,
    holiday: 1,
    overtimeHoursToday: 28,
    overtimeCostToday: 4200,
  },
  workforceOverview: [
    { type: 'Permanent Staff', count: 24, avgWage: '₹750/day', color: COLORS.blue },
    { type: 'Daily Wage Workers', count: 12, avgWage: '₹550/day', color: COLORS.green },
    { type: 'Temporary / Contract', count: 6, avgWage: '₹480/day', color: COLORS.orange },
    { type: 'Employees on Leave', count: 3, avgWage: '-', color: COLORS.purple },
  ],
  trendSeries: {
    Daily: [
      { name: 'Mon', attendance: 38, laborCost: 19200, overtimeHours: 24 },
      { name: 'Tue', attendance: 37, laborCost: 18800, overtimeHours: 20 },
      { name: 'Wed', attendance: 39, laborCost: 19800, overtimeHours: 32 },
      { name: 'Thu', attendance: 35, laborCost: 17900, overtimeHours: 18 },
      { name: 'Fri', attendance: 38, laborCost: 19100, overtimeHours: 26 },
      { name: 'Sat', attendance: 36, laborCost: 18500, overtimeHours: 28 },
      { name: 'Sun', attendance: 12, laborCost: 7500, overtimeHours: 8 },
    ],
    Weekly: [
      { name: 'Week 1', attendance: 89, laborCost: 115000, overtimeHours: 140 },
      { name: 'Week 2', attendance: 91, laborCost: 122000, overtimeHours: 165 },
      { name: 'Week 3', attendance: 87, laborCost: 118000, overtimeHours: 130 },
      { name: 'Week 4', attendance: 88, laborCost: 120000, overtimeHours: 150 },
    ],
    Monthly: [
      { name: 'Feb', attendance: 86, laborCost: 440000, overtimeHours: 520 },
      { name: 'Mar', attendance: 89, laborCost: 475000, overtimeHours: 580 },
      { name: 'Apr', attendance: 87, laborCost: 450000, overtimeHours: 510 },
      { name: 'May', attendance: 88, laborCost: 462000, overtimeHours: 540 },
      { name: 'Jun', attendance: 89, laborCost: 470000, overtimeHours: 560 },
      { name: 'Jul (Est)', attendance: 88.5, laborCost: 485000, overtimeHours: 590 },
    ],
    Yearly: [
      { name: 'FY 2023-24', attendance: 87, laborCost: 5200000, overtimeHours: 6200 },
      { name: 'FY 2024-25', attendance: 89, laborCost: 5650000, overtimeHours: 6700 },
      { name: 'FY 2025-26', attendance: 90, laborCost: 6100000, overtimeHours: 7100 },
    ],
  },
  warehouseDistribution: [
    { warehouse: 'Main Central Godown', present: 20, absent: 2, laborCost: 10500, overtime: 16 },
    { warehouse: 'Central Warehouse WH-2', present: 10, absent: 1, laborCost: 5200, overtime: 8 },
    { warehouse: 'City Distribution Depot', present: 6, absent: 1, laborCost: 2800, overtime: 4 },
  ],
  todayAttendanceList: [
    { id: '1', name: 'Ramesh Kumar', role: 'Head Warehouse Manager', warehouse: 'Main Central Godown', checkIn: '08:45 AM', checkOut: '06:30 PM', status: 'Present', dailyWage: 850, phone: '+91 98111 22334' },
    { id: '2', name: 'Suresh Verma', role: 'Senior Forklift Operator', warehouse: 'Main Central Godown', checkIn: '09:00 AM', checkOut: '06:00 PM', status: 'Present', dailyWage: 750, phone: '+91 98222 33445' },
    { id: '3', name: 'Amit Singh', role: 'Inventory Loader & Helper', warehouse: 'Central Warehouse WH-2', checkIn: '09:15 AM', checkOut: '06:00 PM', status: 'Present', dailyWage: 550, phone: '+91 98333 44556' },
    { id: '4', name: 'Vikram Patel', role: 'Dispatch Coordinator', warehouse: 'City Distribution Depot', checkIn: '-', checkOut: '-', status: 'Absent', dailyWage: 700, phone: '+91 98444 55667' },
    { id: '5', name: 'Deepak Sharma', role: 'Loading Staff Worker', warehouse: 'Main Central Godown', checkIn: '09:05 AM', checkOut: '02:00 PM', status: 'Half Day', dailyWage: 500, phone: '+91 98555 66778' },
  ],
  pendingWagesList: [
    { id: '1', employee: 'Vikram Patel', role: 'Dispatch Coordinator', outstanding: 8400, daysPending: 12, lastPaid: '2026-07-12', status: 'Overdue' },
    { id: '2', employee: 'Deepak Sharma', role: 'Loading Staff Worker', outstanding: 6000, daysPending: 10, lastPaid: '2026-07-14', status: 'Overdue' },
    { id: '3', employee: 'Rajesh Yadav', role: 'Daily Wage Helper', outstanding: 4500, daysPending: 7, lastPaid: '2026-07-17', status: 'Pending' },
    { id: '4', employee: 'Manoj Tiwari', role: 'Godown Assistant', outstanding: 3800, daysPending: 5, lastPaid: '2026-07-19', status: 'Pending' },
  ],
  topPerformers: [
    { name: 'Ramesh Kumar', attendancePct: 100, daysWorked: 26, overtimeHrs: 18, wageEarned: 22100, badge: 'Perfect Attendance' },
    { name: 'Suresh Verma', attendancePct: 96, daysWorked: 25, overtimeHrs: 22, wageEarned: 19750, badge: 'Overtime Star' },
    { name: 'Amit Singh', attendancePct: 96, daysWorked: 25, overtimeHrs: 14, wageEarned: 14500, badge: 'Reliable Worker' },
  ],
  timeline: [
    { id: 1, type: 'wage', title: 'Wage Payment of ₹12,500 disbursed to Ramesh Kumar', time: '1 hour ago', ref: 'PAY-W-2026-089', user: 'Admin' },
    { id: 2, type: 'attendance', title: 'Marked Attendance (36 Present, 4 Absent)', time: '3 hours ago', ref: 'ATT-2026-0725', user: 'Ramesh K.' },
    { id: 3, type: 'onboarding', title: 'New Employee Added: Manoj Tiwari (Godown Assistant)', time: '1 day ago', ref: 'EMP-0042', user: 'Admin' },
    { id: 4, type: 'overtime', title: 'Approved 28 Hours total Overtime for WH-1 & WH-2', time: '1 day ago', ref: 'OT-2026-044', user: 'Suresh V.' },
  ],
  insights: [
    { id: 1, text: 'Main Central Godown overtime increased by 18% this week. Consider hiring 2 daily workers.', type: 'warning' },
    { id: 2, text: '3 employees have pending wages overdue by >10 days totaling ₹18,900.', type: 'alert' },
    { id: 3, text: 'Ramesh Kumar achieved 100% perfect attendance for July 2026.', type: 'info' },
    { id: 4, text: 'Labor cost efficiency improved by 4.2% compared to last month.', type: 'info' },
  ],
  comparisonMatrix: [
    { metric: 'Attendance Rate', empA: '100% (Ramesh K.)', empB: '85% (Vikram P.)', winner: 'Employee A' },
    { metric: 'Overtime Hours Worked', empA: '18 Hours', empB: '6 Hours', winner: 'Employee A' },
    { metric: 'Monthly Days Worked', empA: '26 Days', empB: '21 Days', winner: 'Employee A' },
    { metric: 'Monthly Wage Earned', empA: '₹22,100', empB: '₹14,700', winner: 'Employee A' },
  ],
};

export default function EmployeeDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeBusiness } = useAuthStore();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [trendTimeframe, setTrendTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Yearly'>('Daily');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [testEmptyState, setTestEmptyState] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [recordWagePaymentOpen, setRecordWagePaymentOpen] = useState(false);
  const [selectedPendingWage, setSelectedPendingWage] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [markAttendanceOpen, setMarkAttendanceOpen] = useState(false);
  const [compareModalOpen, setCompareModalOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    role: 'All Roles',
    warehouse: 'All Warehouses',
    attendanceStatus: 'All Statuses',
    wageStatus: 'All Wage Statuses',
    dateRange: 'This Month',
  });

  // Query Supabase with Fallback
  const { data: empData, refetch } = useQuery({
    queryKey: ['employeeDashboardData', activeBusiness?.id, filters],
    queryFn: async () => {
      try {
        if (activeBusiness?.id) {
          const { data: dbEmployees } = await supabase
            .from('employees')
            .select('*')
            .eq('business_id', activeBusiness.id);

          if (dbEmployees && dbEmployees.length > 0) {
            return {
              ...MOCK_EMPLOYEE_DATA,
              kpis: {
                ...MOCK_EMPLOYEE_DATA.kpis,
                totalEmployees: dbEmployees.length,
              },
            };
          }
        }
      } catch (err) {
        console.warn('Using offline mock employee data:', err);
      }
      return MOCK_EMPLOYEE_DATA;
    },
    initialData: MOCK_EMPLOYEE_DATA,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleOpenWagePayment = (item: any) => {
    setSelectedPendingWage(item);
    setPaymentAmount(item.outstanding ? item.outstanding.toString() : '');
    setRecordWagePaymentOpen(true);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.role !== 'All Roles') count++;
    if (filters.warehouse !== 'All Warehouses') count++;
    if (filters.attendanceStatus !== 'All Statuses') count++;
    if (filters.wageStatus !== 'All Wage Statuses') count++;
    if (filters.dateRange !== 'This Month') count++;
    return count;
  }, [filters]);

  const currentSeries = empData.trendSeries[trendTimeframe] || empData.trendSeries.Daily;

  // Empty State Preview Render
  if (testEmptyState) {
    return (
      <Box sx={{ flexGrow: 1, p: 3, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="text.primary">
              Employee Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {dayjs().format('dddd, MMMM D, YYYY')}
            </Typography>
          </Box>
          <FormControlLabel
            control={<Switch checked={testEmptyState} onChange={(e) => setTestEmptyState(e.target.checked)} color="primary" />}
            label={<Typography variant="caption" fontWeight="bold">Empty State Preview</Typography>}
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 4,
            border: `1px dashed ${theme.palette.divider}`,
            bgcolor: isDark ? '#1E293B' : 'white',
            maxWidth: 600,
            mx: 'auto',
            mt: 6,
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: alpha(COLORS.blue, 0.1),
              color: COLORS.blue,
              mx: 'auto',
              mb: 3,
            }}
          >
            <Users size={40} />
          </Avatar>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            No Employee Workforce Records Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Add warehouse staff, managers, daily wage workers, and loaders to track attendance, daily labor expenses, overtime, and wage disbursements.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<Plus size={18} />}
              onClick={() => setTestEmptyState(false)}
              sx={{ bgcolor: COLORS.blue, px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
            >
              Add First Employee
            </Button>
            <Button
              variant="outlined"
              onClick={() => setTestEmptyState(false)}
              sx={{ px: 3, py: 1, textTransform: 'none', borderRadius: 2, fontWeight: 600 }}
            >
              Load Demo Data
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, bgcolor: isDark ? '#0F172A' : COLORS.bgLight, minHeight: '100vh', pb: 12 }}>
      {/* 1. TOP APP BAR */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
            Employee Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Workforce Management & Daily Wage Command Center • {dayjs().format('dddd, MMMM D, YYYY')}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Quick Search */}
          <Paper
            elevation={0}
            sx={{
              p: '2px 8px',
              display: 'flex',
              alignItems: 'center',
              width: { xs: '100%', sm: 260 },
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <Search size={18} color={COLORS.gray} />
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.875rem' }}
              placeholder="Search staff, role, warehouse..."
              inputProps={{ 'aria-label': 'search employee dashboard' }}
            />
          </Paper>

          {/* Filter Trigger */}
          <Button
            variant="outlined"
            onClick={() => setFilterDrawerOpen(true)}
            startIcon={
              <Badge badgeContent={activeFiltersCount} color="error" variant="dot">
                <Filter size={18} />
              </Badge>
            }
            sx={{
              borderRadius: 3,
              borderColor: activeFiltersCount > 0 ? COLORS.blue : theme.palette.divider,
              color: activeFiltersCount > 0 ? COLORS.blue : 'text.primary',
              bgcolor: activeFiltersCount > 0 ? alpha(COLORS.blue, 0.08) : isDark ? '#1E293B' : 'white',
              textTransform: 'none',
              fontWeight: 600,
              height: 40,
            }}
          >
            Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Button>

          {/* Refresh Action */}
          <Tooltip title="Recalculate Labor & Attendance Metrics">
            <IconButton
              onClick={handleRefresh}
              sx={{
                bgcolor: isDark ? '#1E293B' : 'white',
                border: `1px solid ${theme.palette.divider}`,
                width: 40,
                height: 40,
              }}
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <IconButton sx={{ bgcolor: isDark ? '#1E293B' : 'white', border: `1px solid ${theme.palette.divider}`, width: 40, height: 40 }}>
            <Badge badgeContent={4} color="error">
              <Bell size={18} />
            </Badge>
          </IconButton>

          {/* Empty State Toggle */}
          <FormControlLabel
            control={<Switch size="small" checked={testEmptyState} onChange={(e) => setTestEmptyState(e.target.checked)} />}
            label={<Typography variant="caption" color="text.secondary">Empty Demo</Typography>}
            sx={{ ml: 0.5 }}
          />
        </Stack>
      </Box>

      {/* 2. EMPLOYEE KPI CARDS (8 Cards) */}
      <Grid container spacing={2.5} mb={3.5}>
        {/* Total Employees */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.blue, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Total Employees
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.blue} mt={0.5}>
                    {empData.kpis.totalEmployees} Staff
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <Users size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${empData.kpis.newThisMonth} New`} sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {empData.kpis.activeEmployees} Active • {empData.kpis.inactiveEmployees} Inactive
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Today's Attendance */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.green, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Today's Attendance
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.green} mt={0.5}>
                    {empData.kpis.attendanceRate}% Present
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, width: 42, height: 42 }}>
                  <UserCheck size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${empData.kpis.presentToday} Present`} sx={{ bgcolor: alpha(COLORS.green, 0.12), color: COLORS.green, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {empData.kpis.absentToday} Absent • {empData.kpis.halfDayToday} Half Day
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Today's Wage Cost */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.orange, 0.3)}`,
              background: `linear-gradient(135deg, ${isDark ? '#1E293B' : 'white'}, ${alpha(COLORS.orange, 0.03)})`,
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Today's Wage Cost
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.orange} mt={0.5}>
                    {formatCurrency(empData.kpis.todayLaborCost)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, width: 42, height: 42 }}>
                  <DollarSign size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${empData.kpis.costGrowth}% vs Prev Day`} sx={{ bgcolor: alpha(COLORS.orange, 0.12), color: COLORS.orange, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Pending Wage Payments */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.red, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Pending Wage Payments
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.red} mt={0.5}>
                    {formatCurrency(empData.kpis.totalOutstandingWages)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, width: 42, height: 42 }}>
                  <AlertTriangle size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`${empData.kpis.awaitingPaymentCount} Staff Pending`} sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 700, fontSize: '0.68rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  <strong style={{ color: COLORS.red }}>{empData.kpis.overdueWagesCount} Overdue</strong>
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Monthly Wage Expense */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.purple, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Monthly Wage Expense
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.purple} mt={0.5}>
                    {formatCurrency(empData.kpis.thisMonthWages)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <BarChart2 size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${empData.kpis.wageGrowth}% Growth`} sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Prev: {formatCurrency(empData.kpis.prevMonthWages)}
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Average Daily Attendance */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Monthly Avg Attendance
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {empData.kpis.monthlyAvgAttendance}%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, width: 42, height: 42 }}>
                  <CalendarCheck size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Chip size="small" label={`+${empData.kpis.weeklyTrend}% Wk Trend`} sx={{ bgcolor: alpha(COLORS.blue, 0.12), color: COLORS.blue, fontWeight: 700, fontSize: '0.7rem', height: 22 }} />
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Workforce Availability */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${alpha(COLORS.teal, 0.2)}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Workforce Availability
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color={COLORS.teal} mt={0.5}>
                    {empData.kpis.availableStaff} Available
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.teal, 0.12), color: COLORS.teal, width: 42, height: 42 }}>
                  <Briefcase size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  {empData.kpis.onLeave} On Leave • {empData.kpis.holiday} Holiday
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>

        {/* Overtime & Productivity */}
        <Grid item xs={12} sm={6} md={3}>
          <MotionCard
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            sx={{
              borderRadius: 4,
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: isDark ? '#1E293B' : 'white',
            }}
          >
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
                    Today's Overtime
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="text.primary" mt={0.5}>
                    {empData.kpis.overtimeHoursToday} Hours
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: alpha(COLORS.purple, 0.12), color: COLORS.purple, width: 42, height: 42 }}>
                  <Clock size={22} />
                </Avatar>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center" mt={2}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Overtime Cost: <strong>{formatCurrency(empData.kpis.overtimeCostToday)}</strong>
                </Typography>
              </Stack>
            </CardContent>
          </MotionCard>
        </Grid>
      </Grid>

      {/* 3. QUICK ACTIONS BAR */}
      <Paper sx={{ p: 2.5, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="subtitle1" fontWeight={800} mb={2} color="text.primary">
          Quick Workforce Operations
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { label: 'Add Employee', icon: <UserPlus size={20} />, path: '/employees', color: COLORS.blue },
            { label: 'Mark Attendance', icon: <CalendarCheck size={20} />, action: () => setMarkAttendanceOpen(true), color: COLORS.green },
            { label: 'Record Wage', icon: <DollarSign size={20} />, path: '/employees', color: COLORS.orange },
            { label: 'Record Payment', icon: <CreditCard size={20} />, path: '/employees', color: COLORS.purple },
            { label: 'Employee Ledger', icon: <FileText size={20} />, path: '/employees', color: COLORS.gray },
            { label: 'Attendance Report', icon: <BarChart2 size={20} />, path: '/reports/profit-loss', color: COLORS.teal },
            { label: 'Wage Report', icon: <Layers size={20} />, path: '/reports/profit-loss', color: COLORS.red },
            { label: 'Compare Staff', icon: <ArrowRightLeft size={20} />, action: () => setCompareModalOpen(true), color: COLORS.blue },
          ].map((action, idx) => (
            <Grid item xs={6} sm={3} md={1.5} key={idx}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => (action.action ? action.action() : action.path && navigate(action.path))}
                sx={{
                  py: 1.5,
                  px: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  borderRadius: 3,
                  borderColor: theme.palette.divider,
                  color: 'text.primary',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: alpha(action.color, 0.08),
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box sx={{ color: action.color }}>{action.icon}</Box>
                <Typography variant="caption" fontWeight={700} textAlign="center" lineHeight={1.2}>
                  {action.label}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 4. WORKFORCE OVERVIEW BREAKDOWN */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Typography variant="h6" fontWeight={800} mb={2}>
          Workforce Employment Overview
        </Typography>
        <Grid container spacing={2}>
          {empData.workforceOverview.map((wf, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(wf.color, 0.06),
                  border: `1px solid ${alpha(wf.color, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" display="block">
                  {wf.type}
                </Typography>
                <Typography variant="h5" fontWeight={800} color={wf.color} mt={0.5}>
                  {wf.count} Workers
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Avg Rate: <strong>{wf.avgWage}</strong>
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* 5 & 6. ATTENDANCE ANALYTICS + WAREHOUSE ALLOCATION */}
      <Grid container spacing={3} mb={3.5}>
        {/* Attendance & Wage Trend Chart */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} mb={3}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Attendance & Wage Expense Trends
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Track daily labor expense vs working staff attendance
                </Typography>
              </Box>

              <Stack direction="row" bgcolor={isDark ? '#0F172A' : COLORS.bgLight} p={0.5} borderRadius={2.5}>
                {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map((tf) => (
                  <Button
                    key={tf}
                    size="small"
                    onClick={() => setTrendTimeframe(tf)}
                    sx={{
                      px: 1.2,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: trendTimeframe === tf ? (isDark ? '#334155' : 'white') : 'transparent',
                      color: trendTimeframe === tf ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    {tf}
                  </Button>
                ))}
              </Stack>
            </Box>

            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={currentSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="laborGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.blue} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: COLORS.gray }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <RechartsTooltip formatter={(val: number) => formatCurrency(val)} />
                <Area type="monotone" name="Labor Cost" dataKey="laborCost" stroke={COLORS.blue} strokeWidth={3} fillOpacity={1} fill="url(#laborGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Warehouse Workforce Distribution */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', minHeight: 440, boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Warehouse Workforce Allocation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Staffing levels & present counts across godowns
                </Typography>
              </Box>
            </Box>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={empData.warehouseDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                <XAxis dataKey="warehouse" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: COLORS.gray }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.gray }} />
                <RechartsTooltip />
                <Bar dataKey="present" name="Present Staff" fill={COLORS.green} radius={[6, 6, 0, 0]} maxBarSize={30} />
                <Bar dataKey="absent" name="Absent Staff" fill={COLORS.red} radius={[6, 6, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* 7. TODAY'S ATTENDANCE STATUS GRID */}
      <Paper sx={{ p: 3, mb: 3.5, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Today's Attendance Roster & Check-In Log
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Real-time attendance status for warehouse staff and loaders
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={() => setMarkAttendanceOpen(true)}
            sx={{ bgcolor: COLORS.green, textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Mark Daily Attendance
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                <TableCell>Employee Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Warehouse</TableCell>
                <TableCell align="center">Check-In</TableCell>
                <TableCell align="center">Check-Out</TableCell>
                <TableCell align="right">Daily Rate</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empData.todayAttendanceList.map((emp) => (
                <TableRow key={emp.id} hover>
                  <TableCell sx={{ fontWeight: 700 }}>{emp.name}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{emp.role}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{emp.warehouse}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{emp.checkIn}</TableCell>
                  <TableCell align="center" sx={{ fontSize: '0.8rem' }}>{emp.checkOut}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(emp.dailyWage)}</TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={emp.status}
                      sx={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        bgcolor:
                          emp.status === 'Present' ? alpha(COLORS.green, 0.12) :
                          emp.status === 'Half Day' ? alpha(COLORS.orange, 0.12) :
                          alpha(COLORS.red, 0.12),
                        color:
                          emp.status === 'Present' ? COLORS.green :
                          emp.status === 'Half Day' ? COLORS.orange :
                          COLORS.red,
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* 8. PENDING WAGE PAYMENTS & OVERDUE WAGES */}
      <Grid container spacing={3} mb={3.5}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  Pending Wage Disbursements (Awaiting Payment)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Outstanding worker wages requiring payout settlement
                </Typography>
              </Box>
              <Chip label={`${empData.pendingWagesList.length} Pending`} color="error" size="small" sx={{ fontWeight: 800 }} />
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 700, color: 'text.secondary', borderBottom: `2px solid ${theme.palette.divider}` } }}>
                    <TableCell>Employee Name</TableCell>
                    <TableCell align="right">Outstanding Wage</TableCell>
                    <TableCell align="center">Days Pending</TableCell>
                    <TableCell align="center">Last Paid</TableCell>
                    <TableCell align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {empData.pendingWagesList.map((pw) => (
                    <TableRow key={pw.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>{pw.employee}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: COLORS.red }}>{formatCurrency(pw.outstanding)}</TableCell>
                      <TableCell align="center">
                        <Chip label={`${pw.daysPending}d`} size="small" sx={{ bgcolor: alpha(COLORS.red, 0.12), color: COLORS.red, fontWeight: 800, fontSize: '0.68rem' }} />
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>{pw.lastPaid}</TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenWagePayment(pw)}
                          sx={{ bgcolor: COLORS.green, fontSize: '0.68rem', textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                        >
                          Disburse Wage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Performers */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Top Performing Workforce
            </Typography>
            <Stack spacing={2}>
              {empData.topPerformers.map((tp, idx) => (
                <Box key={idx} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight={800}>{tp.name}</Typography>
                    <Chip label={tp.badge} size="small" sx={{ bgcolor: alpha(COLORS.purple, 0.15), color: COLORS.purple, fontWeight: 800, fontSize: '0.65rem' }} />
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Attendance: <strong style={{ color: COLORS.green }}>{tp.attendancePct}%</strong> ({tp.daysWorked} Days Worked)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Overtime: {tp.overtimeHrs} Hours • Wage Earned: <strong>{formatCurrency(tp.wageEarned)}</strong>
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 9. RECENT WORKFORCE ACTIVITIES & SMART INSIGHTS */}
      <Grid container spacing={3} mb={3.5}>
        {/* Timeline */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <Clock size={20} />
              <Typography variant="h6" fontWeight={800}>Recent Workforce Activity Log</Typography>
            </Box>
            <Stack spacing={2.5}>
              {empData.timeline.map((item) => (
                <Box key={item.id} display="flex" gap={2} alignItems="center">
                  <Avatar
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor:
                        item.type === 'wage' ? alpha(COLORS.green, 0.12) :
                        item.type === 'attendance' ? alpha(COLORS.blue, 0.12) :
                        item.type === 'onboarding' ? alpha(COLORS.purple, 0.12) :
                        alpha(COLORS.orange, 0.12),
                      color:
                        item.type === 'wage' ? COLORS.green :
                        item.type === 'attendance' ? COLORS.blue :
                        item.type === 'onboarding' ? COLORS.purple :
                        COLORS.orange,
                    }}
                  >
                    {item.type === 'wage' ? <CreditCard size={18} /> :
                     item.type === 'attendance' ? <CalendarCheck size={18} /> :
                     item.type === 'onboarding' ? <UserPlus size={18} /> :
                     <Clock size={18} />}
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="body2" fontWeight={700}>{item.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Ref: {item.ref} • {item.user} • {item.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        {/* Smart Insights */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, borderRadius: 4, bgcolor: isDark ? '#1E293B' : 'white', height: '100%', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Typography variant="h6" fontWeight={800} mb={2}>
              Smart Workforce Recommendations
            </Typography>
            <Stack spacing={2}>
              {empData.insights.map((ins) => (
                <Box key={ins.id} p={2} borderRadius={3} bgcolor={isDark ? '#0F172A' : COLORS.bgLight} border={`1px solid ${theme.palette.divider}`}>
                  <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                    <Lightbulb size={18} color={ins.type === 'alert' ? COLORS.red : ins.type === 'warning' ? COLORS.orange : COLORS.blue} />
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                      Labor Intelligence
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {ins.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* 10. MATERIAL 3 FILTER DRAWER / BOTTOM SHEET */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 380 }, p: 3, bgcolor: isDark ? '#1E293B' : 'white' },
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" fontWeight={800}>
            Employee Filters
          </Typography>
          <IconButton onClick={() => setFilterDrawerOpen(false)}>
            <X size={20} />
          </IconButton>
        </Box>

        <Stack spacing={2.5}>
          <FormControl fullWidth size="small">
            <InputLabel>Role</InputLabel>
            <Select value={filters.role} label="Role" onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
              <MenuItem value="All Roles">All Roles</MenuItem>
              <MenuItem value="Warehouse Manager">Warehouse Manager</MenuItem>
              <MenuItem value="Forklift Operator">Forklift Operator</MenuItem>
              <MenuItem value="Inventory Loader">Inventory Loader</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Warehouse</InputLabel>
            <Select value={filters.warehouse} label="Warehouse" onChange={(e) => setFilters({ ...filters, warehouse: e.target.value })}>
              <MenuItem value="All Warehouses">All Warehouses</MenuItem>
              <MenuItem value="Main Godown">Main Central Godown</MenuItem>
              <MenuItem value="Central WH">Central Warehouse WH-2</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Attendance Status</InputLabel>
            <Select value={filters.attendanceStatus} label="Attendance Status" onChange={(e) => setFilters({ ...filters, attendanceStatus: e.target.value })}>
              <MenuItem value="All Statuses">All Statuses</MenuItem>
              <MenuItem value="Present">Present</MenuItem>
              <MenuItem value="Absent">Absent</MenuItem>
              <MenuItem value="Half Day">Half Day</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Box mt={4} display="flex" gap={2}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setFilters({
              role: 'All Roles',
              warehouse: 'All Warehouses',
              attendanceStatus: 'All Statuses',
              wageStatus: 'All Wage Statuses',
              dateRange: 'This Month',
            })}
            sx={{ textTransform: 'none', borderRadius: 2 }}
          >
            Reset Filters
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setFilterDrawerOpen(false)}
            sx={{ bgcolor: COLORS.blue, textTransform: 'none', borderRadius: 2, fontWeight: 700 }}
          >
            Apply Filters
          </Button>
        </Box>
      </Drawer>

      {/* 11. MARK ATTENDANCE MODAL */}
      <Dialog open={markAttendanceOpen} onClose={() => setMarkAttendanceOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Mark Today's Attendance</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} py={1}>
            <Typography variant="body2" color="text.secondary">
              Date: <strong>{dayjs().format('MMMM D, YYYY')}</strong>
            </Typography>
            <TextField label="Present Count" type="number" defaultValue="36" fullWidth size="small" />
            <TextField label="Absent Count" type="number" defaultValue="4" fullWidth size="small" />
            <TextField label="Half Day Count" type="number" defaultValue="2" fullWidth size="small" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setMarkAttendanceOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setMarkAttendanceOpen(false)}
            sx={{ bgcolor: COLORS.green, textTransform: 'none', fontWeight: 700 }}
          >
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* 12. RECORD WAGE PAYMENT DIALOG */}
      <Dialog open={recordWagePaymentOpen} onClose={() => setRecordWagePaymentOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Disburse Employee Wage</DialogTitle>
        <DialogContent dividers>
          {selectedPendingWage && (
            <Stack spacing={2} py={1}>
              <Box p={1.5} borderRadius={2} bgcolor={alpha(COLORS.green, 0.08)}>
                <Typography variant="caption" color="text.secondary">Worker</Typography>
                <Typography variant="body2" fontWeight={800}>{selectedPendingWage.employee}</Typography>
                <Typography variant="caption" color="text.secondary">Role: {selectedPendingWage.role}</Typography>
              </Box>
              <TextField
                label="Disbursement Amount (₹)"
                fullWidth
                size="small"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setRecordWagePaymentOpen(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setRecordWagePaymentOpen(false)}
            sx={{ bgcolor: COLORS.green, textTransform: 'none', fontWeight: 700 }}
          >
            Disburse Wage Payment
          </Button>
        </DialogActions>
      </Dialog>

      {/* 13. EMPLOYEE COMPARISON MODAL */}
      <Dialog open={compareModalOpen} onClose={() => setCompareModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Workforce Staff Comparison</DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700 } }}>
                <TableCell>Metric</TableCell>
                <TableCell>Employee A (Ramesh K.)</TableCell>
                <TableCell>Employee B (Vikram P.)</TableCell>
                <TableCell align="center">Top Performer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {empData.comparisonMatrix.map((row, idx) => (
                <TableRow key={idx}>
                  <TableCell sx={{ fontWeight: 700, fontSize: '0.8rem' }}>{row.metric}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.empA}</TableCell>
                  <TableCell sx={{ fontSize: '0.8rem' }}>{row.empB}</TableCell>
                  <TableCell align="center">
                    <Chip label={row.winner} size="small" sx={{ bgcolor: alpha(COLORS.green, 0.15), color: COLORS.green, fontWeight: 800, fontSize: '0.65rem' }} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCompareModalOpen(false)} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* 14. EXPANDABLE SPEED DIAL FAB */}
      <SpeedDial
        ariaLabel="Employee Quick Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon openIcon={<X size={20} />} icon={<Plus size={24} />} />}
        FabProps={{
          sx: {
            bgcolor: COLORS.blue,
            '&:hover': { bgcolor: alpha(COLORS.blue, 0.9) },
            boxShadow: '0 8px 24px rgba(25, 118, 210, 0.4)',
          },
        }}
      >
        <SpeedDialAction
          icon={<UserPlus size={18} />}
          tooltipTitle="Add Employee"
          onClick={() => setTestEmptyState(false)}
        />
        <SpeedDialAction
          icon={<CalendarCheck size={18} />}
          tooltipTitle="Mark Attendance"
          onClick={() => setMarkAttendanceOpen(true)}
        />
        <SpeedDialAction
          icon={<CreditCard size={18} />}
          tooltipTitle="Disburse Wage"
          onClick={() => setRecordWagePaymentOpen(true)}
        />
        <SpeedDialAction
          icon={<ArrowRightLeft size={18} />}
          tooltipTitle="Compare Staff"
          onClick={() => setCompareModalOpen(true)}
        />
      </SpeedDial>
    </Box>
  );
}
