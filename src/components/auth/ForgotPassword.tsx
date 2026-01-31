// src/components/auth/ForgotPassword.tsx
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import AppLogo from '../common/AppLogo';

interface ForgotPasswordProps {
  onResetPassword: (email: string, newPassword: string) => Promise<void>;
  onNavigate: (page: 'login') => void;
}

const ForgotPassword = ({ onResetPassword, onNavigate }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await onResetPassword(email, newPassword);
      setSuccess(true);
    } catch {
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <button className="auth-back" onClick={() => onNavigate('login')}>
            <ArrowLeft className="auth-back-icon" />
            Back to login
          </button>

          <div className="auth-logo">
            <AppLogo className="auth-logo-icon" />
            <h1 className="auth-logo-title">MyBudgeting App</h1>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">Reset your password</h2>
            <p className="auth-subtitle">
              {success
                ? 'Your password has been reset successfully'
                : 'Enter your email and choose a new password'}
            </p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="auth-success">
              <CheckCircle className="auth-success-icon" />
              <span>Password reset successful! You can now sign in with your new password.</span>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" size={18} />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">New Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="auth-input-group">
                <label className="auth-label">Confirm Password</label>
                <div className="auth-input-wrapper">
                  <Lock className="auth-input-icon" size={18} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="auth-input-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="auth-footer">
            Remember your password?{' '}
            <button
              type="button"
              className="auth-footer-link"
              onClick={() => onNavigate('login')}
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
