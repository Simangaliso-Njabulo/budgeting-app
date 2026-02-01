// src/components/Settings.tsx
import { useState } from 'react';
import { Moon, Sun, Coins, CalendarDays, Check, Download, Trash2, Shield, Lock, LogOut, Camera, Mail, User, ChevronRight } from 'lucide-react';
import { useTheme, CURRENCIES } from '../context/ThemeContext';

interface SettingsProps {
  user?: { name: string; email: string };
  payDate?: number;
  onUpdatePayDate?: (payDate: number) => void;
  onLogout?: () => void;
}

const Settings = ({ user, payDate = 1, onUpdatePayDate, onLogout }: SettingsProps) => {
  const { theme, setTheme, currency, setCurrency } = useTheme();
  const [payDateInput, setPayDateInput] = useState(payDate.toString());

  // Notification settings
  const [notifications, setNotifications] = useState({
    budgetAlerts: true,
    weeklyReports: true,
    transactionAlerts: false,
    savingsGoals: true,
  });

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
                <span className="theme-toggle-label">Dark</span>
              </button>
              <button
                className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun className="theme-toggle-icon" />
                <span className="theme-toggle-label">Light</span>
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

      {/* Budget Cycle Section */}
      {onUpdatePayDate && (
        <div className="settings-section">
          <h2 className="settings-section-title">Budget Cycle</h2>
          <div className="settings-card">
            <div className="settings-row" style={{ alignItems: 'flex-start' }}>
              <div className="settings-row-info">
                <span className="settings-row-label">Pay Day</span>
                <span className="settings-row-description">
                  Day of month you receive your salary. Your budget month runs from this day to the day before next pay day.
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div className="settings-select-wrapper">
                  <CalendarDays className="settings-select-icon" />
                  <select
                    className="settings-select"
                    value={payDateInput}
                    onChange={(e) => setPayDateInput(e.target.value)}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day === 1 ? '1st (calendar month)' : day}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="settings-save-btn"
                  style={{ padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                  onClick={() => {
                    const val = parseInt(payDateInput, 10);
                    if (val >= 1 && val <= 31) {
                      onUpdatePayDate(val);
                    }
                  }}
                >
                  <Check size={16} />
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Profile</h2>
        <div className="settings-card">
          <div className="settings-profile">
            <div className="settings-avatar">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
              <button className="settings-avatar-edit">
                <Camera className="settings-avatar-edit-icon" />
              </button>
            </div>
            <div className="settings-profile-info">
              <span className="settings-profile-name">{user?.name || 'User'}</span>
              <span className="settings-profile-email">{user?.email || 'user@example.com'}</span>
            </div>
          </div>
          <div className="settings-form-group">
            <label className="settings-form-label">
              <User className="settings-form-icon" />
              Display Name
            </label>
            <input
              type="text"
              className="settings-currency-input"
              defaultValue={user?.name || 'User'}
              placeholder="Enter your name"
            />
          </div>
          <div className="settings-form-group">
            <label className="settings-form-label">
              <Mail className="settings-form-icon" />
              Email Address
            </label>
            <input
              type="email"
              className="settings-currency-input"
              defaultValue={user?.email || 'user@example.com'}
              placeholder="Enter your email"
            />
          </div>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Notifications</h2>
        <div className="settings-card">
          <div className="settings-notification-row">
            <div className="settings-notification-info">
              <span className="settings-notification-label">Budget Alerts</span>
              <span className="settings-notification-desc">Get notified when you exceed budget limits</span>
            </div>
            <button
              className={`settings-toggle ${notifications.budgetAlerts ? 'active' : ''}`}
              onClick={() => setNotifications({ ...notifications, budgetAlerts: !notifications.budgetAlerts })}
            />
          </div>
          <div className="settings-notification-row">
            <div className="settings-notification-info">
              <span className="settings-notification-label">Weekly Reports</span>
              <span className="settings-notification-desc">Receive weekly spending summaries</span>
            </div>
            <button
              className={`settings-toggle ${notifications.weeklyReports ? 'active' : ''}`}
              onClick={() => setNotifications({ ...notifications, weeklyReports: !notifications.weeklyReports })}
            />
          </div>
          <div className="settings-notification-row">
            <div className="settings-notification-info">
              <span className="settings-notification-label">Transaction Alerts</span>
              <span className="settings-notification-desc">Get notified for every transaction</span>
            </div>
            <button
              className={`settings-toggle ${notifications.transactionAlerts ? 'active' : ''}`}
              onClick={() => setNotifications({ ...notifications, transactionAlerts: !notifications.transactionAlerts })}
            />
          </div>
          <div className="settings-notification-row">
            <div className="settings-notification-info">
              <span className="settings-notification-label">Savings Goals</span>
              <span className="settings-notification-desc">Alerts when reaching savings milestones</span>
            </div>
            <button
              className={`settings-toggle ${notifications.savingsGoals ? 'active' : ''}`}
              onClick={() => setNotifications({ ...notifications, savingsGoals: !notifications.savingsGoals })}
            />
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="settings-section">
        <h2 className="settings-section-title">Security</h2>
        <div className="settings-card">
          <div className="settings-security-item">
            <div className="settings-security-left">
              <div className="settings-security-icon">
                <Lock className="h-5 w-5" />
              </div>
              <div className="settings-security-info">
                <span className="settings-security-label">Change Password</span>
                <span className="settings-security-desc">Update your account password</span>
              </div>
            </div>
            <button className="settings-security-btn">
              Change
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="settings-security-item">
            <div className="settings-security-left">
              <div className="settings-security-icon">
                <Shield className="h-5 w-5" />
              </div>
              <div className="settings-security-info">
                <span className="settings-security-label">Two-Factor Authentication</span>
                <span className="settings-security-desc">Add an extra layer of security</span>
              </div>
            </div>
            <button className="settings-security-btn">
              Enable
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
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

      {/* Logout Section */}
      {onLogout && (
        <div className="settings-section">
          <div className="settings-card">
            <button className="settings-action-btn settings-action-btn-danger" onClick={onLogout} style={{ width: '100%', justifyContent: 'center' }}>
              <LogOut className="settings-btn-icon" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* About Section */}
      <div className="settings-section">
        <div className="settings-card">
          <div className="settings-about">
            <p className="settings-version">MyBudgeting App v1.0.0</p>
            <div className="settings-links">
              <a href="#" className="settings-link">Privacy Policy</a>
              <a href="#" className="settings-link">Terms of Service</a>
              <a href="#" className="settings-link">Help Center</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
