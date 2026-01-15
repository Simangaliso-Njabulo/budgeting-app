// src/components/Settings.tsx
import { useState, useEffect } from 'react';
import { Moon, Sun, Coins, Download, Trash2, Check, Wallet, PiggyBank } from 'lucide-react';
import { useTheme, CURRENCIES } from '../context/ThemeContext';
import type { Income } from '../types';

interface SettingsProps {
  income: Income;
  onUpdateIncome: (income: Income) => void;
}

const Settings = ({ income, onUpdateIncome }: SettingsProps) => {
  const { theme, setTheme, currency, setCurrency, formatCurrency } = useTheme();

  // Store display values with currency symbol
  const [incomeDisplay, setIncomeDisplay] = useState(formatCurrency(income.amount));
  const [savingsDisplay, setSavingsDisplay] = useState(formatCurrency(income.savings));
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Update display values when currency changes
  useEffect(() => {
    const incomeNum = parseNumber(incomeDisplay);
    const savingsNum = parseNumber(savingsDisplay);
    setIncomeDisplay(formatCurrency(incomeNum));
    setSavingsDisplay(formatCurrency(savingsNum));
  }, [currency]);

  // Parse number from formatted string (removes currency symbol and commas)
  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Handle input change - allow typing numbers, auto-format on blur
  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow typing numbers and currency symbols
    setIncomeDisplay(value);
  };

  const handleSavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSavingsDisplay(value);
  };

  // Format on blur
  const handleIncomeBlur = () => {
    const num = parseNumber(incomeDisplay);
    setIncomeDisplay(formatCurrency(num));
  };

  const handleSavingsBlur = () => {
    const num = parseNumber(savingsDisplay);
    setSavingsDisplay(formatCurrency(num));
  };

  // Focus - show just the number for easier editing
  const handleIncomeFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const num = parseNumber(incomeDisplay);
    setIncomeDisplay(num.toString());
    e.target.select();
  };

  const handleSavingsFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const num = parseNumber(savingsDisplay);
    setSavingsDisplay(num.toString());
    e.target.select();
  };

  const handleSaveIncome = () => {
    const newIncome: Income = {
      amount: parseNumber(incomeDisplay),
      savings: parseNumber(savingsDisplay),
    };
    onUpdateIncome(newIncome);
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2000);
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    alert('CSV export coming soon!');
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    alert('PDF export coming soon!');
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      // TODO: Implement data clear
      alert('Data cleared!');
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Customize your experience and manage your account</p>
      </div>

      {/* Appearance Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Appearance</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Theme</span>
              <span className="settings-row-description">Choose your preferred color scheme</span>
            </div>
            <div className="theme-toggle-group">
              <button
                className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="theme-toggle-icon" />
                <span>Dark</span>
              </button>
              <button
                className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun className="theme-toggle-icon" />
                <span>Light</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Currency Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Currency</h2>
        <div className="settings-card">
          <div className="settings-row">
            <div className="settings-row-info">
              <span className="settings-row-label">Display Currency</span>
              <span className="settings-row-description">Select your preferred currency format</span>
            </div>
            <div className="settings-select-wrapper">
              <Coins className="settings-select-icon" />
              <select
                className="settings-select"
                value={currency.code}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} - {curr.name} ({curr.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Account Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Account</h2>
        <div className="settings-card">
          <div className="settings-form-group">
            <label className="settings-form-label">
              <Wallet className="settings-form-icon" />
              Monthly Income
            </label>
            <input
              type="text"
              className="settings-currency-input"
              value={incomeDisplay}
              onChange={handleIncomeChange}
              onBlur={handleIncomeBlur}
              onFocus={handleIncomeFocus}
              placeholder={formatCurrency(5000)}
            />
          </div>

          <div className="settings-form-group">
            <label className="settings-form-label">
              <PiggyBank className="settings-form-icon" />
              Target Savings
            </label>
            <input
              type="text"
              className="settings-currency-input"
              value={savingsDisplay}
              onChange={handleSavingsChange}
              onBlur={handleSavingsBlur}
              onFocus={handleSavingsFocus}
              placeholder={formatCurrency(1000)}
            />
          </div>

          <button className="settings-save-btn" onClick={handleSaveIncome}>
            {showSaveSuccess ? (
              <>
                <Check className="settings-btn-icon" />
                Saved!
              </>
            ) : (
              'Update Income Settings'
            )}
          </button>
        </div>
      </div>

      {/* Data Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Data</h2>
        <div className="settings-card">
          <div className="settings-data-actions">
            <button className="settings-action-btn" onClick={handleExportCSV}>
              <Download className="settings-btn-icon" />
              Export to CSV
            </button>
            <button className="settings-action-btn" onClick={handleExportPDF}>
              <Download className="settings-btn-icon" />
              Export to PDF
            </button>
            <button className="settings-action-btn settings-action-btn-danger" onClick={handleClearData}>
              <Trash2 className="settings-btn-icon" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
