// src/context/ThemeContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Theme, AccentColor } from '../types';

// Currency configuration
export interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

interface ThemeContextType {
  theme: Theme;
  accentColor: AccentColor;
  currency: CurrencyConfig;
  setTheme: (theme: Theme) => void;
  setAccentColor: (color: AccentColor) => void;
  setCurrency: (currencyCode: string) => void;
  toggleTheme: () => void;
  formatCurrency: (amount: number) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY_THEME = 'budgetpro-theme';
const STORAGE_KEY_ACCENT = 'budgetpro-accent';
const STORAGE_KEY_CURRENCY = 'budgetpro-currency';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return (saved as Theme) || 'dark';
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACCENT);
    return (saved as AccentColor) || 'purple';
  });

  const [currency, setCurrencyState] = useState<CurrencyConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
    const found = CURRENCIES.find(c => c.code === saved);
    return found || CURRENCIES[0]; // Default to USD
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
  }, [theme]);

  // Apply accent color to document
  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accentColor);
    localStorage.setItem(STORAGE_KEY_ACCENT, accentColor);
  }, [accentColor]);

  // Save currency to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CURRENCY, currency.code);
  }, [currency]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const setCurrency = (currencyCode: string) => {
    const found = CURRENCIES.find(c => c.code === currencyCode);
    if (found) {
      setCurrencyState(found);
    }
  };

  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const formatCurrency = (amount: number): string => {
    return `${currency.symbol}${amount.toLocaleString()}`;
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      accentColor,
      currency,
      setTheme,
      setAccentColor,
      setCurrency,
      toggleTheme,
      formatCurrency
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
