'use client';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import { Button, Box } from '@mui/material';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#111',
      paper: '#1e1e1e',
      theme: '#333',
      hover: '#222',
    },
  },
});

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#eee',
      paper: '#ffffff',
      theme: '#f5f5f5',
      hover: '#e0e0e0',
    },
  },
});

const modernTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f3e8d9',
    },
    secondary: {
      main: '#f7d2be',
    },
    background: {
      default: '#414599',
      paper: '#2c3e50',  // Changed from white to a dark blue-gray
      theme: '#5e72ac',
      hover: '#414599',
    },
    text: {
      primary: '#f3e8d9',  // Light color for primary text
      secondary: '#f7d2be',  // Light color for secondary text
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
    },
  },
  shape: {
    borderRadius: 8,
  },
});

const themes = {
  light: lightTheme,
  dark: darkTheme,
  modern: modernTheme,
};

export default function ClientThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState('light');

  const handleThemeChange = (theme) => {
    setCurrentTheme(theme);
  };

  if (!themes[currentTheme]) {
    return null; // or a loading spinner
  }

  return (
    <ThemeProvider theme={themes[currentTheme]}>
      <Box sx={{ position: 'fixed', top: 10, right: 10, zIndex: 1000 }}>
        <Button onClick={() => handleThemeChange('light')} sx={{ mr: 1 }}>Light</Button>
        <Button onClick={() => handleThemeChange('dark')} sx={{ mr: 1 }}>Dark</Button>
        <Button onClick={() => handleThemeChange('modern')}>Modern</Button>
      </Box>
      {children}
    </ThemeProvider>
  );
}
