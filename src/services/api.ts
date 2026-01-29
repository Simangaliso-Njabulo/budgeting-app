// API Service for connecting to the backend

const API_BASE_URL = 'http://localhost:8000/api';

// Token storage
let accessToken: string | null = localStorage.getItem('accessToken');
let refreshToken: string | null = localStorage.getItem('refreshToken');

export const setTokens = (access: string, refresh: string) => {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};

export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

export const getAccessToken = () => accessToken;

// Generic fetch wrapper with auth
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 - try to refresh token
  if (response.status === 401 && refreshToken) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry the request with new token
      (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`;
      return fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });
    }
  }

  return response;
};

const tryRefreshToken = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh?refresh_token=${refreshToken}`, {
      method: 'POST',
    });
    if (response.ok) {
      const data = await response.json();
      setTokens(data.access_token, data.refresh_token);
      return true;
    }
  } catch {
    // Refresh failed
  }
  clearTokens();
  return false;
};

// Auth API
export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Registration failed');
    }
    return response.json();
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Login failed');
    }
    const data = await response.json();
    setTokens(data.access_token, data.refresh_token);
    return data;
  },

  logout: () => {
    clearTokens();
  },

  getMe: async () => {
    const response = await fetchWithAuth('/users/me');
    if (!response.ok) {
      throw new Error('Failed to get user');
    }
    return response.json();
  },
};

// Categories API
export const categoriesApi = {
  getAll: async () => {
    const response = await fetchWithAuth('/categories');
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  },

  create: async (data: { name: string; color: string; icon?: string; type: string }) => {
    const response = await fetchWithAuth('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create category');
    return response.json();
  },

  update: async (id: string, data: Partial<{ name: string; color: string; icon: string; type: string }>) => {
    const response = await fetchWithAuth(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update category');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetchWithAuth(`/categories/${id}?hard_delete=true`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete category');
    // 204 No Content - no body to parse
    return { success: true };
  },
};

// Buckets API
export const bucketsApi = {
  getAll: async () => {
    const response = await fetchWithAuth('/buckets');
    if (!response.ok) throw new Error('Failed to fetch buckets');
    return response.json();
  },

  create: async (data: { name: string; allocated: number; category_id?: string }) => {
    const response = await fetchWithAuth('/buckets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create bucket');
    return response.json();
  },

  update: async (id: string, data: Partial<{ name: string; allocated: number; category_id: string }>) => {
    const response = await fetchWithAuth(`/buckets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update bucket');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetchWithAuth(`/buckets/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete bucket');
    // 204 No Content - no body to parse
    return { success: true };
  },

  getStats: async (id: string) => {
    const response = await fetchWithAuth(`/buckets/${id}/stats`);
    if (!response.ok) throw new Error('Failed to fetch bucket stats');
    return response.json();
  },
};

// Transactions API
export const transactionsApi = {
  getAll: async (params?: {
    type?: string;
    category_id?: string;
    bucket_id?: string;
    start_date?: string;
    end_date?: string;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
    }
    const query = queryParams.toString();
    const response = await fetchWithAuth(`/transactions${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  create: async (data: {
    description: string;
    amount: number;
    type: string;
    date: string;
    category_id?: string;
    bucket_id?: string;
    notes?: string;
    is_recurring?: boolean;
    recurring_interval?: string;
  }) => {
    const response = await fetchWithAuth('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create transaction');
    return response.json();
  },

  update: async (id: string, data: Partial<{
    description: string;
    amount: number;
    type: string;
    date: string;
    category_id: string;
    bucket_id: string;
    notes: string;
  }>) => {
    const response = await fetchWithAuth(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update transaction');
    return response.json();
  },

  delete: async (id: string) => {
    const response = await fetchWithAuth(`/transactions/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete transaction');
    // 204 No Content - no body to parse
    return { success: true };
  },

  getSummary: async (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('start_date', startDate);
    if (endDate) queryParams.append('end_date', endDate);
    const query = queryParams.toString();
    const response = await fetchWithAuth(`/transactions/summary${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch summary');
    return response.json();
  },
};

// Monthly Income API
export const monthlyIncomeApi = {
  getAll: async (year?: number) => {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year.toString());
    const query = queryParams.toString();
    const response = await fetchWithAuth(`/monthly-income${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch monthly incomes');
    return response.json();
  },

  get: async (year: number, month: number) => {
    const response = await fetchWithAuth(`/monthly-income/${year}/${month}`);
    if (!response.ok) throw new Error('Failed to fetch monthly income');
    return response.json();
  },

  update: async (year: number, month: number, data: { amount?: number; savings_target?: number }) => {
    const response = await fetchWithAuth(`/monthly-income/${year}/${month}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update monthly income');
    return response.json();
  },

  getTrends: async (months?: number) => {
    const queryParams = new URLSearchParams();
    if (months) queryParams.append('months', months.toString());
    const query = queryParams.toString();
    const response = await fetchWithAuth(`/monthly-income/trends${query ? `?${query}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch trends');
    return response.json();
  },
};

// Users API
export const usersApi = {
  updateMe: async (data: Partial<{
    name: string;
    currency: string;
    theme: string;
    accent_color: string;
    monthly_income: number;
    savings_target: number;
  }>) => {
    const response = await fetchWithAuth('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },
};
