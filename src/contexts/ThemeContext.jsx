// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import Colors from '../../constants/colors'; // ✅ RUTA CORREGIDA

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children, initialTheme = 'light' }) => {
  const [theme, setThemeState] = useState(() => {
    // Intentar obtener el tema desde localStorage
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('kraken-theme');
      return savedTheme || initialTheme;
    }
    return initialTheme;
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // Detectar preferencia del sistema
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemPrefersDark(mediaQuery.matches);

      const handleChange = (e) => {
        setSystemPrefersDark(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Determinar el tema actual
  const actualTheme = theme === 'dark' ? 'dark' : 'light';

  // Obtener los colores basados en el tema actual
  const colors = Colors[actualTheme];

  // Función para cambiar el tema
  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kraken-theme', newTheme);
    }
  };

  // Función para alternar entre light y dark (no incluye system)
  const toggleTheme = () => {
    const newTheme = actualTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  // Aplicar el tema al documento
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', actualTheme);
      
      // Aplicar variables CSS personalizadas
      const root = document.documentElement;
      
      // Colores principales
      root.style.setProperty('--color-primary', colors.primary);
      root.style.setProperty('--color-primary-light', colors.primaryLight);
      root.style.setProperty('--color-secondary', colors.secondary);
      
      // Fondos
      root.style.setProperty('--color-background', colors.background);
      root.style.setProperty('--color-card-background', colors.cardBackground);
      root.style.setProperty('--color-surface', colors.surface);
      
      // Texto
      root.style.setProperty('--color-text-primary', colors.textPrimary);
      root.style.setProperty('--color-text-secondary', colors.textSecondary);
      root.style.setProperty('--color-text-placeholder', colors.textPlaceholder);
      
      // Estados
      root.style.setProperty('--color-success', colors.success);
      root.style.setProperty('--color-error', colors.error);
      root.style.setProperty('--color-warning', colors.warning);
      
      // Inputs
      root.style.setProperty('--color-input-background', colors.inputBackground);
      root.style.setProperty('--color-border', colors.borderColor);
      
      // Navegación
      root.style.setProperty('--color-tab-background', colors.tabBackground);
      root.style.setProperty('--color-tab-active', colors.tabActive);
      
      // Otros
      root.style.setProperty('--color-separator', colors.separator);
      root.style.setProperty('--color-overlay', colors.overlay);
    }
  }, [actualTheme, colors]);

  const value = {
    theme,
    actualTheme,
    colors,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

export default ThemeContext;