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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Divider,
  useTheme,
  alpha,
  Tooltip,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Avatar
} from '@mui/material';
import {
  Plus,
  Search,
  Users,
  Shield,
  UserPlus,
  UserCheck,
  Lock,
  Unlock,
  Mail,
  Phone,
  Eye,
  Edit,
  Trash2,
  X,
  Settings,
  Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Accountant' | 'Employee' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastLogin: string;
}

const MOCK_USERS: User[] = [
  {
    id: 'USR-001',
    name: 'Rahul Sharma',
    email: 'rahul.s@bandhan.com',
    phone: '+91 9876543210',
    role: 'Owner',
    status: 'Active',
    lastLogin: '2026-07-25T10:30:00Z',
  },
  {
    id: 'USR-002',
    name: 'Priya Patel',
    email: 'priya.p@bandhan.com',
    phone: '+91 9876543211',
    role: 'Owner',
    status: 'Active',
    lastLogin: '2026-07-24T15:45:00Z',
  },
  {
    id: 'USR-003',
    name: 'Amit Kumar',
    email: 'amit.k@bandhan.com',
    phone: '+91 9876543212',
    role: 'Accountant',
    status: 'Active',
    lastLogin: '2026-07-25T09:15:00Z',
  },
  {
    id: 'USR-004',
    name: 'Sneha Gupta',
    email: 'sneha.g@bandhan.com',
    phone: '+91 9876543213',
    role: 'Employee',
    status: 'Active',
    lastLogin: '2026-07-23T11:20:00Z',
  },
  {
    id: 'USR-005',
    name: 'Vikram Singh',
    email: 'vikram.s@bandhan.com',
    phone: '+91 9876543214',
    role: 'Viewer',
    status: 'Inactive',
    lastLogin: '2026-07-10T14:00:00Z',
  }
];

const UsersRolesPage: React.FC = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Owner': return { bg: alpha('#6A1B9A', 0.1), color: '#6A1B9A' };
      case 'Accountant': return { bg: alpha('#1565C0', 0.1), color: '#1565C0' };
      case 'Employee': return { bg: alpha('#2E7D32', 0.1), color: '#2E7D32' };
      case 'Viewer': return { bg: alpha('#546E7A', 0.1), color: '#546E7A' };
      default: return { bg: alpha('#546E7A', 0.1), color: '#546E7A' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      default: return 'default';
    }
  };

  const filteredUsers = MOCK_USERS.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = MOCK_USERS.length;
  const activeUsers = MOCK_USERS.filter(u => u.status === 'Active').length;
  const totalOwners = MOCK_USERS.filter(u => u.role === 'Owner').length;
  const totalAccountants = MOCK_USERS.filter(u => u.role === 'Accountant').length;

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsEditUserOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Users & Roles
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage system users, access roles, and permissions
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => setIsAddUserOpen(true)}
          sx={{ bgcolor: theme.palette.primary.main }}
        >
          Add New User
        </Button>
      </Stack>

      {/* KPI Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                    <Users size={24} color={theme.palette.primary.main} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Users</Typography>
                    <Typography variant="h5" fontWeight="bold">{totalUsers}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.1) }}>
                    <UserCheck size={24} color={theme.palette.success.main} />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Active Users</Typography>
                    <Typography variant="h5" fontWeight="bold">{activeUsers}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#6A1B9A', 0.1) }}>
                    <Star size={24} color="#6A1B9A" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Owners</Typography>
                    <Typography variant="h5" fontWeight="bold">{totalOwners}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }}>
            <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#1565C0', 0.1) }}>
                    <Shield size={24} color="#1565C0" />
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Accountants</Typography>
                    <Typography variant="h5" fontWeight="bold">{totalAccountants}</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
        <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <TextField
              size="small"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            <Button startIcon={<Settings size={18} />} variant="outlined">
              Manage Roles
            </Button>
          </Stack>
        </Box>

        <TableContainer component={Paper} elevation={0}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell>User</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 36, height: 36 }}>
                        {user.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">{user.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user.id}</Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
                        <Mail size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2">{user.email}</Typography>
                      </Stack>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Phone size={14} color={theme.palette.text.secondary} />
                        <Typography variant="body2" color="text.secondary">{user.phone}</Typography>
                      </Stack>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      sx={{ 
                        bgcolor: getRoleColor(user.role).bg,
                        color: getRoleColor(user.role).color,
                        fontWeight: 'bold'
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status} 
                      size="small" 
                      color={getStatusColor(user.status) as any}
                      variant={user.status === 'Active' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {dayjs(user.lastLogin).format('DD MMM YYYY, hh:mm A')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <Tooltip title="Edit User">
                        <IconButton size="small" color="primary" onClick={() => handleEditClick(user)}>
                          <Edit size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={user.status === 'Active' ? 'Deactivate' : 'Activate'}>
                        <Switch size="small" checked={user.status === 'Active'} color="success" />
                      </Tooltip>
                      {user.role !== 'Owner' && (
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error">
                            <Trash2 size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Add New User</Typography>
            <IconButton onClick={() => setIsAddUserOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Address" type="email" required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select label="Role" defaultValue="">
                  <MenuItem value="Owner">Owner</MenuItem>
                  <MenuItem value="Accountant">Accountant</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Temporary Password" type="password" required variant="outlined" />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" fontWeight="bold" mb={1}>Business Access Permissions</Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <FormControlLabel control={<Switch defaultChecked color="primary" />} label="Sales & Invoicing" />
                <FormControlLabel control={<Switch defaultChecked color="primary" />} label="Purchases & Inventory" />
                <FormControlLabel control={<Switch color="primary" />} label="Financial Reports" />
                <FormControlLabel control={<Switch color="primary" />} label="Settings & Configuration" />
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setIsAddUserOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary">Create User</Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onClose={() => setIsEditUserOpen(false)} maxWidth="sm" fullWidth>
         <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">Edit User</Typography>
            <IconButton onClick={() => setIsEditUserOpen(false)} size="small">
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField fullWidth label="Full Name" defaultValue={selectedUser?.name} required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email Address" type="email" defaultValue={selectedUser?.email} required variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone Number" defaultValue={selectedUser?.phone} required variant="outlined" />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select label="Role" defaultValue={selectedUser?.role || ''}>
                  <MenuItem value="Owner">Owner</MenuItem>
                  <MenuItem value="Accountant">Accountant</MenuItem>
                  <MenuItem value="Employee">Employee</MenuItem>
                  <MenuItem value="Viewer">Viewer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
             <Grid item xs={12}>
              <FormControlLabel 
                control={<Switch checked={selectedUser?.status === 'Active'} color="success" />} 
                label="Account Active" 
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button onClick={() => setIsEditUserOpen(false)} color="inherit">Cancel</Button>
          <Button variant="contained" color="primary">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsersRolesPage;
