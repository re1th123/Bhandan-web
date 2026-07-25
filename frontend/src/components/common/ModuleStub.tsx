import React from 'react';
import { Box, Typography, Card, CardContent, Button, alpha, useTheme } from '@mui/material';
import { Construction } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface ModuleStubProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ModuleStub: React.FC<ModuleStubProps> = ({ title, description, icon, color }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Card sx={{ maxWidth: 480, width: '100%', textAlign: 'center', p: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                width: 80, height: 80, borderRadius: 4, mx: 'auto', mb: 3,
                background: `linear-gradient(135deg, ${color}, ${alpha(color, 0.6)})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 8px 24px ${alpha(color, 0.3)}`,
                '& svg': { color: 'white', fontSize: 38 },
              }}
            >
              {icon}
            </Box>
            <Typography variant="h5" fontWeight={700} mb={1}>{title}</Typography>
            <Typography variant="body2" color="text.secondary" mb={3} lineHeight={1.8}>
              {description}
            </Typography>
            <Box display="flex" gap={1.5} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Construction />}
                sx={{ borderRadius: 2.5 }}
                disabled
              >
                Coming Soon
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                sx={{ borderRadius: 2.5 }}
              >
                Back to Dashboard
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
};

export default ModuleStub;
