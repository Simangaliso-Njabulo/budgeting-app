// src/components/auth/Login.tsx
import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
  onNavigate: (page: 'signup' | 'forgot') => void;
}

const Login = ({ onLogin, onNavigate }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(email, password);
    } catch {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-logo">
            <svg className="auth-logo-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="logoGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </linearGradient>
                <linearGradient id="dollarGradPurple" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" stroke="url(#logoGradPurple)" strokeWidth="2.5" fill="none" opacity="0.5" />
              <circle cx="32" cy="32" r="24" fill="rgba(139, 92, 246, 0.12)" />
              <text x="32" y="42" textAnchor="middle" fontSize="32" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" fill="url(#dollarGradPurple)">$</text>
            </svg>
            <h1 className="auth-logo-title">MyBudgeting App</h1>
            <p className="auth-logo-subtitle">Smart Money Management</p>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to continue managing your finances</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

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
              <label className="auth-label">Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
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

            <div className="auth-options">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  className="auth-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="auth-remember-label">Remember me</span>
              </label>
              <button
                type="button"
                className="auth-forgot"
                onClick={() => onNavigate('forgot')}
              >
                Forgot password?
              </button>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <button
              type="button"
              className="auth-footer-link"
              onClick={() => onNavigate('signup')}
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
