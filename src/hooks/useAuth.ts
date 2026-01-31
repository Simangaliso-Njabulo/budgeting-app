import { useState, useEffect, useCallback } from 'react';
import {
  authApi,
  usersApi,
  getAccessToken,
  clearTokens,
} from '../services/api';
import type { ToastType } from '../components';

interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  theme: string;
  accent_color: string;
  monthly_income: number;
  savings_target: number;
}

interface UseAuthOptions {
  onAuthenticated: () => Promise<void>;
  showToast: (message: string, type?: ToastType) => void;
  onLogoutCleanup: () => void;
}

export function useAuth({ onAuthenticated, showToast, onLogoutCleanup }: UseAuthOptions) {
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const userData = await usersApi.getMe();
    setUser(userData);
    return userData;
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (getAccessToken()) {
        try {
          await onAuthenticated();
          setIsAuthenticated(true);
        } catch {
          clearTokens();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [onAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    await authApi.login(email, password);
    await onAuthenticated();
    setIsAuthenticated(true);
    showToast('Welcome back!', 'success');
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    await authApi.register(name, email, password);
    await authApi.login(email, password);
    await onAuthenticated();
    setIsAuthenticated(true);
    showToast('Account created successfully!', 'success');
  };

  const handleForgotPassword = async (email: string, newPassword: string) => {
    await authApi.resetPassword(email, newPassword);
    showToast('Password reset successfully! You can now sign in.', 'success');
  };

  const handleLogout = () => {
    authApi.logout();
    setUser(null);
    setIsAuthenticated(false);
    setAuthPage('login');
    onLogoutCleanup();
    showToast('Signed out successfully', 'info');
  };

  return {
    isAuthenticated,
    authPage,
    setAuthPage,
    user,
    setUser,
    isLoading,
    setIsLoading,
    fetchUser,
    handleLogin,
    handleSignUp,
    handleForgotPassword,
    handleLogout,
  };
}
