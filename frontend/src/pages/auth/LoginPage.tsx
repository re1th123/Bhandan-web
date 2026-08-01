import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, Alert, CircularProgress,
  Tabs, Tab, Checkbox, FormControlLabel, LinearProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  Stack, Divider, Chip, Paper, Grid
} from '@mui/material';
import {
  Visibility, VisibilityOff, Lock, Email, Person, Business as BusinessIcon,
  Phone as PhoneIcon, ReceiptLong, CheckCircle, Security, ArrowForward, VpnKey
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore, DEFAULT_DEMO_BUSINESS } from '../../stores/authStore';

// ==========================================
// ZOD VALIDATION SCHEMAS
// ==========================================

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  business_name: z.string().min(2, 'Business name is required'),
  phone: z.string().regex(/^[0-9+\s-]{10,15}$/, 'Enter a valid 10-digit phone number'),
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Enter a valid 15-character GSTIN (e.g. 27AABCB1234D1ZB)').or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ['confirm_password'],
});

const resetSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type ResetForm = z.infer<typeof resetSchema>;

// Password Strength Evaluator
const calculatePasswordStrength = (pass: string): { score: number; label: string; color: string } => {
  if (!pass) return { score: 0, label: '', color: '#e0e0e0' };
  let score = 0;
  if (pass.length >= 8) score += 25;
  if (/[A-Z]/.test(pass)) score += 25;
  if (/[0-9]/.test(pass)) score += 25;
  if (/[^a-zA-Z0-9]/.test(pass)) score += 25;

  if (score <= 25) return { score, label: 'Weak', color: '#E53935' };
  if (score <= 50) return { score, label: 'Fair', color: '#F9A825' };
  if (score <= 75) return { score, label: 'Good', color: '#0288D1' };
  return { score, label: 'Strong & Secure', color: '#43A047' };
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const setActiveBusiness = useAuthStore((s) => s.setActiveBusiness);
  const setBusinesses = useAuthStore((s) => s.setBusinesses);

  const [tab, setTab] = useState<0 | 1>(0);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Brute-force Rate Limiting State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  // Forgot Password Modal State
  const [openResetModal, setOpenResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Countdown timer for lockout
  useEffect(() => {
    let interval: any;
    if (lockoutTimer > 0) {
      interval = setInterval(() => {
        setLockoutTimer((prev) => prev - 1);
      }, 1000);
    } else if (lockoutTimer === 0 && failedAttempts >= 5) {
      setFailedAttempts(0);
    }
    return () => clearInterval(interval);
  }, [lockoutTimer, failedAttempts]);

  // Forms
  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      business_name: '',
      phone: '',
      gstin: '',
      password: '',
      confirm_password: '',
    },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const watchPassword = registerForm.watch('password') || '';
  const passwordStrength = calculatePasswordStrength(watchPassword);

  // ----------------------------------------
  // LOGIN SUBMIT HANDLER
  // ----------------------------------------
  // ----------------------------------------
  // LOGIN SUBMIT HANDLER
  // ----------------------------------------
  const onLoginSubmit = async (data: LoginForm) => {
    if (lockoutTimer > 0) {
      setError(`Too many failed attempts. Account temporarily locked. Please wait ${lockoutTimer}s.`);
      return;
    }

    setLoading(true);
    setError('');

    const inputEmail = data.email.trim().toLowerCase();
    const inputPassword = data.password;

    // 1. Check local registered users registry
    const regUsersRaw = localStorage.getItem('bandhan_registered_users');
    const regUsers: any[] = regUsersRaw ? JSON.parse(regUsersRaw) : [];
    const localUser = regUsers.find((u: any) => u.email && u.email.toLowerCase() === inputEmail);

    if (localUser) {
      if (localUser.password === inputPassword) {
        // Valid registered credentials!
        setFailedAttempts(0);
        setLockoutTimer(0);

        setSession(
          { access_token: `token_${Date.now()}`, expires_at: 9999999999 },
          {
            id: localUser.id || `u_${Date.now()}`,
            email: localUser.email,
            full_name: localUser.full_name,
          }
        );

        setBusinesses([localUser.business]);
        setActiveBusiness(localUser.business);
        setLoading(false);
        setSuccessMsg('Authentication successful! Redirecting to ERP Dashboard...');
        setTimeout(() => navigate('/dashboard'), 800);
        return;
      } else {
        // Password mismatch for registered user
        setLoading(false);
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);
        if (attempts >= 5) {
          setLockoutTimer(60);
          setError('Maximum 5 failed attempts reached. Account locked for 60 seconds for security.');
        } else {
          setError(`Incorrect password for ${inputEmail}. (${5 - attempts} attempts remaining)`);
        }
        return;
      }
    }

    // 2. Demo credentials check
    if (inputEmail === 'owner@bandhanwholesale.com' || inputEmail === 'admin@bandhan.com' || inputEmail === 'demo@bandhan.com') {
      setFailedAttempts(0);
      setLockoutTimer(0);
      setSession(
        { access_token: 'demo-token', expires_at: 9999999999 },
        { id: 'u0000000-0000-4000-8000-000000000001', email: inputEmail, full_name: 'Bandhan Admin' }
      );
      setActiveBusiness(DEFAULT_DEMO_BUSINESS);
      setLoading(false);
      setSuccessMsg('Demo authentication successful! Redirecting to ERP Dashboard...');
      setTimeout(() => navigate('/dashboard'), 800);
      return;
    }

    // 3. Fallback to Supabase Cloud Auth
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setLoading(false);
        const attempts = failedAttempts + 1;
        setFailedAttempts(attempts);

        if (attempts >= 5) {
          setLockoutTimer(60);
          setError('Maximum 5 failed attempts reached. Account locked for 60 seconds for security.');
        } else {
          setError(`${authError.message}. (${5 - attempts} attempts remaining before lockout)`);
        }
        return;
      }

      if (authData.session && authData.user) {
        setFailedAttempts(0);
        setLockoutTimer(0);
        const userObj = {
          id: authData.user.id,
          email: authData.user.email ?? '',
          full_name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0],
        };
        setSession(authData.session, userObj);

        // Fetch or assign real business for authenticated user
        const userBusiness = {
          id: 'b_' + authData.user.id.slice(0, 8),
          name: authData.user.user_metadata?.business_name || `${userObj.full_name}'s Enterprise`,
          gstin: authData.user.user_metadata?.gstin || '',
          phone: authData.user.user_metadata?.phone || '',
          address: 'Registered Premises',
          fy_start_month: 4,
          default_currency: 'INR',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setBusinesses([userBusiness]);
        setActiveBusiness(userBusiness);

        setLoading(false);
        setSuccessMsg('Authentication successful! Redirecting to ERP Dashboard...');
        setTimeout(() => navigate('/dashboard'), 800);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication service unreachable.');
    }
  };

  // ----------------------------------------
  // QUICK DEMO LOGIN HANDLER
  // ----------------------------------------
  const handleQuickDemoLogin = () => {
    setLoading(true);
    setError('');
    setFailedAttempts(0);
    setLockoutTimer(0);
    setTimeout(() => {
      setSession(
        { access_token: 'demo-token', expires_at: 9999999999 },
        { id: 'u0000000-0000-4000-8000-000000000001', email: 'owner@bandhanwholesale.com', full_name: 'Bandhan Admin' }
      );
      setActiveBusiness(DEFAULT_DEMO_BUSINESS);
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  // ----------------------------------------
  // REGISTRATION SUBMIT HANDLER
  // ----------------------------------------
  const onRegisterSubmit = async (data: RegisterForm) => {
    setLoading(true);
    setError('');

    try {
      // 1. Create Business Record object
      const newBusiness = {
        id: 'b_' + Date.now().toString().slice(-8),
        name: data.business_name,
        gstin: data.gstin || '',
        phone: data.phone,
        email: data.email,
        address: 'Registered Business Premises',
        fy_start_month: 4,
        default_currency: 'INR',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 2. Register User in Supabase Auth
      let authUser: any = null;
      let authSession: any = null;

      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.full_name,
              business_name: data.business_name,
              phone: data.phone,
              gstin: data.gstin,
            },
          },
        });
        if (!authError && authData) {
          authUser = authData.user;
          authSession = authData.session;
        }
      } catch (e) {
        console.warn('Cloud signUp skipped, registering user locally:', e);
      }

      // 3. Save User & Business to Local Registered Users Store
      const regUsersRaw = localStorage.getItem('bandhan_registered_users');
      const regUsers: any[] = regUsersRaw ? JSON.parse(regUsersRaw) : [];
      const userRecord = {
        id: authUser?.id || 'u_' + Date.now(),
        email: data.email.trim().toLowerCase(),
        password: data.password,
        full_name: data.full_name,
        business: newBusiness,
      };

      // Replace existing or add new
      const existingIdx = regUsers.findIndex((u: any) => u.email === userRecord.email);
      if (existingIdx >= 0) {
        regUsers[existingIdx] = userRecord;
      } else {
        regUsers.push(userRecord);
      }
      localStorage.setItem('bandhan_registered_users', JSON.stringify(regUsers));

      // 4. Set Active Session & Business
      setSession(
        authSession || { access_token: `token_${Date.now()}`, expires_at: 9999999999 },
        {
          id: userRecord.id,
          email: data.email,
          full_name: data.full_name,
        }
      );
      setBusinesses([newBusiness]);
      setActiveBusiness(newBusiness);

      setFailedAttempts(0);
      setLockoutTimer(0);
      setLoading(false);
      setSuccessMsg(`Business "${data.business_name}" registered successfully! Redirecting to ERP Dashboard...`);
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  // ----------------------------------------
  // PASSWORD RESET HANDLER
  // ----------------------------------------
  const onResetSubmit = async (data: ResetForm) => {
    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setOpenResetModal(false);
      setSuccessMsg(`Password reset instructions sent to ${data.email}. Check your inbox.`);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0F1123 0%, #1A1D35 50%, #12152E 100%)',
      }}
    >
      {/* Dynamic Background Glows */}
      <Box
        sx={{
          position: 'absolute',
          width: 600,
          height: 600,
          borderRadius: '50%',
          top: -200,
          left: -200,
          background: 'radial-gradient(circle, rgba(92,107,192,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          bottom: -200,
          right: -100,
          background: 'radial-gradient(circle, rgba(0,137,123,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Left Promotional Panel */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          justify: 'center',
          alignItems: 'center',
          p: 6,
        }}
      >
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <Box sx={{ maxWidth: 480, color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: 3.5,
                  background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(92,107,192,0.4)',
                }}
              >
                <Typography variant="h4" fontWeight={800} color="white">
                  B
                </Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
                  Bandhan ERP
                </Typography>
                <Typography variant="caption" sx={{ color: '#9FA8DA', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                  Wholesale Enterprise Control System
                </Typography>
              </Box>
            </Box>

            <Typography variant="h3" fontWeight={700} sx={{ mb: 2, lineHeight: 1.25 }}>
              Enterprise ERP for Wholesale Leaders
            </Typography>

            <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.7)', mb: 5, lineHeight: 1.7 }}>
              Complete GST invoicing, inventory valuation, Accounts Receivable & Payable, double-entry ledger, and real-time financial statements built for Indian wholesale operations.
            </Typography>

            {/* Value Highlights */}
            <Stack spacing={2.5}>
              {[
                { title: 'Offline-First & Cloud Sync', desc: 'Continuous operations with automatic multi-device synchronization' },
                { title: 'GST Statutory Compliance', desc: 'Automated GSTR-1, GSTR-3B summaries and dynamic PDF Tax Invoices' },
                { title: 'ACID Double-Entry Accounting', desc: 'Strict debit = credit ledger balance enforcement across all vouchers' },
              ].map((feat, idx) => (
                <Box key={idx} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      bgcolor: 'rgba(92,107,192,0.2)',
                      border: '1px solid rgba(92,107,192,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.5,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 16, color: '#7986CB' }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600} color="white">
                      {feat.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                      {feat.desc}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Box>
        </motion.div>
      </Box>

      {/* Right Authentication Panel */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          p: { xs: 2, sm: 4 },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: 480 }}
        >
          <Card
            elevation={0}
            sx={{
              background: 'rgba(26, 29, 53, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header Tabs */}
            <Box sx={{ borderBottom: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.2)' }}>
              <Tabs
                value={tab}
                onChange={(_, val) => { setTab(val); setError(''); setSuccessMsg(''); }}
                variant="fullWidth"
                textColor="inherit"
                TabIndicatorProps={{ style: { backgroundColor: '#5C6BC0', height: 3 } }}
              >
                <Tab label="Sign In" sx={{ color: 'white', py: 2.5, fontWeight: 600 }} />
                <Tab label="Register Business" sx={{ color: 'white', py: 2.5, fontWeight: 600 }} />
              </Tabs>
            </Box>

            <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
              {/* Notification Alerts */}
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              {successMsg && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
                  {successMsg}
                </Alert>
              )}

              {/* Lockout Warning */}
              {lockoutTimer > 0 && (
                <Alert severity="warning" icon={<Security />} sx={{ mb: 3, borderRadius: 2 }}>
                  Brute-force protection active. Please wait <strong>{lockoutTimer} seconds</strong> before trying again.
                </Alert>
              )}

              {/* ==================================== */}
              {/* TAB 0: SIGN IN FORM                  */}
              {/* ==================================== */}
              {tab === 0 && (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <Stack spacing={2.5}>
                    <TextField
                      label="Email Address"
                      type="email"
                      fullWidth
                      disabled={lockoutTimer > 0}
                      {...loginForm.register('email')}
                      error={!!loginForm.formState.errors.email}
                      helperText={loginForm.formState.errors.email?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email sx={{ color: '#7986CB' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                    />

                    <TextField
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      disabled={lockoutTimer > 0}
                      {...loginForm.register('password')}
                      error={!!loginForm.formState.errors.password}
                      helperText={loginForm.formState.errors.password?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock sx={{ color: '#7986CB' }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'white' }}>
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <FormControlLabel
                        control={<Checkbox {...loginForm.register('rememberMe')} defaultChecked sx={{ color: '#7986CB', '&.Mui-checked': { color: '#5C6BC0' } }} />}
                        label={<Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>Remember me</Typography>}
                      />
                      <Button
                        size="small"
                        onClick={() => setOpenResetModal(true)}
                        sx={{ color: '#9FA8DA', textTransform: 'none', fontWeight: 600 }}
                      >
                        Forgot Password?
                      </Button>
                    </Box>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading || lockoutTimer > 0}
                      sx={{
                        py: 1.6,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        boxShadow: '0 8px 24px rgba(92,107,192,0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #3949AB 0%, #283593 100%)' },
                      }}
                    >
                      {loading ? <CircularProgress size={26} color="inherit" /> : 'Sign In to Bandhan ERP'}
                    </Button>

                    <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }}>
                      <Chip label="OR" size="small" sx={{ bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }} />
                    </Divider>

                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleQuickDemoLogin}
                      disabled={loading}
                      endIcon={<ArrowForward />}
                      sx={{
                        py: 1.4,
                        borderRadius: 2.5,
                        color: '#7986CB',
                        borderColor: 'rgba(121,134,203,0.4)',
                        fontWeight: 600,
                        '&:hover': { borderColor: '#7986CB', bgcolor: 'rgba(121,134,203,0.1)' },
                      }}
                    >
                      Quick Demo Login (Bypass Auth)
                    </Button>
                  </Stack>
                </form>
              )}

              {/* ==================================== */}
              {/* TAB 1: REGISTRATION FORM             */}
              {/* ==================================== */}
              {tab === 1 && (
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <Stack spacing={2}>
                    <TextField
                      label="Full Name"
                      fullWidth
                      {...registerForm.register('full_name')}
                      error={!!registerForm.formState.errors.full_name}
                      helperText={registerForm.formState.errors.full_name?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start"><Person sx={{ color: '#7986CB' }} /></InputAdornment> }}
                      sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                    />

                    <TextField
                      label="Business Name"
                      fullWidth
                      {...registerForm.register('business_name')}
                      error={!!registerForm.formState.errors.business_name}
                      helperText={registerForm.formState.errors.business_name?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: '#7986CB' }} /></InputAdornment> }}
                      sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Email Address"
                          type="email"
                          fullWidth
                          {...registerForm.register('email')}
                          error={!!registerForm.formState.errors.email}
                          helperText={registerForm.formState.errors.email?.message}
                          InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#7986CB' }} /></InputAdornment> }}
                          sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Phone Number"
                          fullWidth
                          {...registerForm.register('phone')}
                          error={!!registerForm.formState.errors.phone}
                          helperText={registerForm.formState.errors.phone?.message}
                          InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#7986CB' }} /></InputAdornment> }}
                          sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      label="GSTIN (Optional)"
                      placeholder="e.g. 27AABCB1234D1ZB"
                      fullWidth
                      {...registerForm.register('gstin')}
                      error={!!registerForm.formState.errors.gstin}
                      helperText={registerForm.formState.errors.gstin?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start"><ReceiptLong sx={{ color: '#7986CB' }} /></InputAdornment> }}
                      sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                    />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Password"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          {...registerForm.register('password')}
                          error={!!registerForm.formState.errors.password}
                          helperText={registerForm.formState.errors.password?.message}
                          InputProps={{ startAdornment: <InputAdornment position="start"><Lock sx={{ color: '#7986CB' }} /></InputAdornment> }}
                          sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Confirm Password"
                          type={showPassword ? 'text' : 'password'}
                          fullWidth
                          {...registerForm.register('confirm_password')}
                          error={!!registerForm.formState.errors.confirm_password}
                          helperText={registerForm.formState.errors.confirm_password?.message}
                          InputProps={{ startAdornment: <InputAdornment position="start"><VpnKey sx={{ color: '#7986CB' }} /></InputAdornment> }}
                          sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
                        />
                      </Grid>
                    </Grid>

                    {/* Password Strength Indicator */}
                    {watchPassword && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                            Password Strength:
                          </Typography>
                          <Typography variant="caption" fontWeight={700} sx={{ color: passwordStrength.color }}>
                            {passwordStrength.label}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={passwordStrength.score}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '& .MuiLinearProgress-bar': { bgcolor: passwordStrength.color },
                          }}
                        />
                      </Box>
                    )}

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading}
                      sx={{
                        py: 1.6,
                        mt: 1,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #00897B 0%, #00695C 100%)',
                        fontWeight: 700,
                        fontSize: '1rem',
                        boxShadow: '0 8px 24px rgba(0,137,123,0.4)',
                        '&:hover': { background: 'linear-gradient(135deg, #00695C 0%, #004D40 100%)' },
                      }}
                    >
                      {loading ? <CircularProgress size={26} color="inherit" /> : 'Register Business & Create Account'}
                    </Button>
                  </Stack>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </Box>

      {/* Forgot Password Dialog */}
      <Dialog
        open={openResetModal}
        onClose={() => setOpenResetModal(false)}
        PaperProps={{
          sx: {
            bgcolor: '#1A1D35',
            color: 'white',
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: { xs: 300, sm: 400 },
          },
        }}
      >
        <form onSubmit={resetForm.handleSubmit(onResetSubmit)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Reset Your Password</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
              Enter your registered email address below. We will send a secure link to reset your password.
            </Typography>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              autoFocus
              {...resetForm.register('email')}
              error={!!resetForm.formState.errors.email}
              helperText={resetForm.formState.errors.email?.message}
              InputProps={{ startAdornment: <InputAdornment position="start"><Email sx={{ color: '#7986CB' }} /></InputAdornment> }}
              sx={{ input: { color: 'white' }, label: { color: 'rgba(255,255,255,0.7)' } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenResetModal(false)} sx={{ color: 'rgba(255,255,255,0.7)' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={resetLoading}
              sx={{ bgcolor: '#5C6BC0', '&:hover': { bgcolor: '#3949AB' } }}
            >
              {resetLoading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Link'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LoginPage;
