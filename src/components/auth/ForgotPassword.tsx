// src/components/auth/ForgotPassword.tsx
import { useState } from 'react';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onResetPassword: (email: string) => void;
  onNavigate: (page: 'login') => void;
}

const ForgotPassword = ({ onResetPassword, onNavigate }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
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

    setIsLoading(true);
    try {
      await onResetPassword(email);
      setSuccess(true);
    } catch {
      setError('Failed to send reset email. Please try again.');
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
            <svg className="auth-logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#7dd3fc" />
                </linearGradient>
              </defs>
              <rect x="8" y="16" width="48" height="36" rx="4" stroke="url(#logoGrad3)" strokeWidth="3" fill="none" />
              <path d="M8 28h48" stroke="url(#logoGrad3)" strokeWidth="3" />
              <circle cx="20" cy="40" r="6" fill="url(#logoGrad3)" opacity="0.3" />
              <circle cx="44" cy="40" r="6" fill="url(#logoGrad3)" opacity="0.3" />
            </svg>
            <h1 className="auth-logo-title">BudgetWise</h1>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">Reset your password</h2>
            <p className="auth-subtitle">
              {success
                ? 'Check your email for reset instructions'
                : "Enter your email and we'll send you a reset link"}
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
              <span>Password reset email sent! Check your inbox.</span>
            </div>
          ) : (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrapper">
                  <Mail className="auth-input-icon" />
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

              <button type="submit" className="auth-submit-btn" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
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
