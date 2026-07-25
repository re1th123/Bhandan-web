import { createTheme, alpha } from '@mui/material/styles';

// Bandhan ERP Brand Palette — Material Design 3 inspired
const brandColors = {
  primary: {
    main: '#5C6BC0',       // Indigo — authority & trust
    light: '#8E99F3',
    dark: '#26418F',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#00897B',       // Teal — financial health
    light: '#4DB6AC',
    dark: '#005B4F',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#43A047',
    light: '#76D275',
    dark: '#00701A',
  },
  warning: {
    main: '#F9A825',
    light: '#FFD95A',
    dark: '#C17900',
  },
  error: {
    main: '#E53935',
    light: '#FF6F60',
    dark: '#AB000D',
  },
  info: {
    main: '#0288D1',
    light: '#5EB8FF',
    dark: '#005B9F',
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...brandColors,
    background: {
      default: '#F0F2F8',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1C2E',
      secondary: '#5A5D72',
    },
    divider: '#E0E3F0',
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 500 },
    body1: { fontSize: '0.9375rem' },
    body2: { fontSize: '0.875rem' },
    caption: { fontSize: '0.75rem', color: '#5A5D72' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(92,107,192,0.08), 0 1px 2px rgba(92,107,192,0.04)',
    '0 4px 6px rgba(92,107,192,0.08), 0 2px 4px rgba(92,107,192,0.04)',
    '0 10px 15px rgba(92,107,192,0.08), 0 4px 6px rgba(92,107,192,0.04)',
    '0 20px 25px rgba(92,107,192,0.08), 0 10px 10px rgba(92,107,192,0.04)',
    '0 25px 50px rgba(92,107,192,0.12)',
    ...Array(19).fill('none'),
  ] as any,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '@import': "url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap')",
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: '#5C6BC0 transparent',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#5C6BC0', borderRadius: '3px' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0 1px 0 #E0E3F0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E8EAF6',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(92,107,192,0.12)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 20px',
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(92,107,192,0.24)' },
        },
        contained: {
          background: 'linear-gradient(135deg, #5C6BC0, #3949AB)',
          '&:hover': { background: 'linear-gradient(135deg, #3949AB, #26418F)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '1px 8px',
          padding: '8px 12px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(92,107,192,0.16), rgba(92,107,192,0.08))',
            '&:hover': { background: 'linear-gradient(135deg, rgba(92,107,192,0.2), rgba(92,107,192,0.12))' },
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small', variant: 'outlined' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#5C6BC0',
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F0F2F8',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#5A5D72',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4 },
        bar: { borderRadius: 4 },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          fontSize: '0.75rem',
          backgroundColor: '#1A1C2E',
          padding: '6px 12px',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: '2px 0 20px rgba(92,107,192,0.08)',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...brandColors,
    primary: { ...brandColors.primary, main: '#7986CB', light: '#aab6fb', dark: '#49599a' },
    background: {
      default: '#0F1123',
      paper: '#1A1D35',
    },
    text: {
      primary: '#E8EAF6',
      secondary: '#9FA8DA',
    },
    divider: '#2E3155',
  },
  typography: lightTheme.typography,
  shape: lightTheme.shape,
  components: {
    ...lightTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #2E3155',
          background: '#1A1D35',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#0F1123',
            fontWeight: 700,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#9FA8DA',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '1px 8px',
          padding: '8px 12px',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(121,134,203,0.2), rgba(121,134,203,0.12))',
          },
        },
      },
    },
  },
});

// Gradient helpers
export const gradients = {
  primary: 'linear-gradient(135deg, #5C6BC0 0%, #3949AB 100%)',
  secondary: 'linear-gradient(135deg, #00897B 0%, #005B4F 100%)',
  revenue: 'linear-gradient(135deg, #43A047 0%, #1B5E20 100%)',
  expense: 'linear-gradient(135deg, #E53935 0%, #B71C1C 100%)',
  warning: 'linear-gradient(135deg, #F9A825 0%, #E65100 100%)',
  info: 'linear-gradient(135deg, #0288D1 0%, #01579B 100%)',
  purple: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)',
  card: (color: string) => `linear-gradient(135deg, ${alpha(color, 0.12)} 0%, ${alpha(color, 0.04)} 100%)`,
};
