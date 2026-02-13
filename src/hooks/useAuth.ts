import { useState, useEffect, useCallback } from 'react';
import { userService, getCurrentUserId } from '../db';
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
  const [isAuthenticated, setIsAuthenticated] = useState(!!getCurrentUserId());
  const [authPage, setAuthPage] = useState<'login' | 'signup' | 'forgot'>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const dbUser = await userService.getMe();
    const userData: User = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      currency: dbUser.currency,
      theme: dbUser.theme,
      accent_color: dbUser.accentColor,
      monthly_income: dbUser.monthlyIncome,
      savings_target: dbUser.savingsTarget,
    };
    setUser(userData);
    return userData;
  }, []);

  // Check auth status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (getCurrentUserId()) {
        try {
          await onAuthenticated();
          setIsAuthenticated(true);
        } catch {
          userService.logout();
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, [onAuthenticated]);

  const handleLogin = async (email: string, password: string) => {
    await userService.login(email, password);
    await onAuthenticated();
    setIsAuthenticated(true);
    showToast('Welcome back!', 'success');
  };

  const handleSignUp = async (name: string, email: string, password: string) => {
    await userService.register(name, email, password);
    await userService.login(email, password);
    await onAuthenticated();
    setIsAuthenticated(true);
    showToast('Account created successfully!', 'success');
  };

  const handleForgotPassword = async (email: string, newPassword: string) => {
    await userService.resetPassword(email, newPassword);
    showToast('Password reset successfully! You can now sign in.', 'success');
  };

  const handleLogout = () => {
    userService.logout();
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
