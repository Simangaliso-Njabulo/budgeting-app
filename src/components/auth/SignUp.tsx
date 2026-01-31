// src/components/auth/SignUp.tsx
import { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, AlertCircle, User, ArrowLeft } from 'lucide-react';

interface SignUpProps {
  onSignUp: (name: string, email: string, password: string) => void;
  onNavigate: (page: 'login') => void;
}

const SignUp = ({ onSignUp, onNavigate }: SignUpProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthText = () => {
    if (password.length === 0) return '';
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  const getStrengthClass = (index: number) => {
    if (index >= passwordStrength) return '';
    if (passwordStrength <= 1) return 'active';
    if (passwordStrength === 2) return 'active medium';
    return 'active strong';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await onSignUp(name, email, password);
    } catch {
      setError('Failed to create account. Please try again.');
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
                <linearGradient id="logoGradPurple2" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="50%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </linearGradient>
                <linearGradient id="dollarGradPurple2" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" stroke="url(#logoGradPurple2)" strokeWidth="2.5" fill="none" opacity="0.5" />
              <circle cx="32" cy="32" r="24" fill="rgba(139, 92, 246, 0.12)" />
              <text x="32" y="42" textAnchor="middle" fontSize="32" fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" fill="url(#dollarGradPurple2)">$</text>
            </svg>
            <h1 className="auth-logo-title">MyBudgeting App</h1>
          </div>

          <div className="auth-header">
            <h2 className="auth-title">Create your account</h2>
            <p className="auth-subtitle">Start your journey to financial freedom</p>
          </div>

          {error && (
            <div className="auth-error">
              <AlertCircle className="auth-error-icon" />
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-label">Full Name</label>
              <div className="auth-input-wrapper">
                <User className="auth-input-icon" size={18} />
                <input
                  type="text"
                  className="auth-input"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
            </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {password && (
                <>
                  <div className="password-strength">
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} className={`password-strength-bar ${getStrengthClass(i)}`} />
                    ))}
                  </div>
                  <span className="password-strength-text">{getStrengthText()}</span>
                </>
              )}
            </div>

            <div className="auth-input-group">
              <label className="auth-label">Confirm Password</label>
              <div className="auth-input-wrapper">
                <Lock className="auth-input-icon" size={18} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="auth-input"
                  placeholder="Confirm your password"
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
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
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

export default SignUp;
