# MyBudgeting App - Architecture & Testing Strategy

## Table of Contents
1. [Frontend Architecture](#frontend-architecture)
2. [Abstraction Layers](#abstraction-layers)
3. [Testing Strategy (L1-L4)](#testing-strategy)
4. [Implementation Plan](#implementation-plan)

---

## Frontend Architecture

### Current State
The app currently has all logic in components (mainly `App.tsx`), mixing:
- UI rendering
- State management
- Business logic
- Data transformations

### Recommended Pattern: **Feature-Sliced Design + Custom Hooks**

For React apps, the equivalent of ViewModels is achieved through:
1. **Custom Hooks** - Encapsulate business logic and state
2. **Services** - Handle API calls and external interactions
3. **Repositories** - Abstract data sources (API vs localStorage vs mock)
4. **Models/Types** - Define data structures
5. **Components** - Pure UI rendering (dumb components)

This is often called **"Separation of Concerns"** or **"Clean Architecture for React"**.

---

## Abstraction Layers

### Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  Components │  │    Pages    │  │   Layouts   │              │
│  │   (Dumb)    │  │  (Smart)    │  │             │              │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘              │
│         │                │                                       │
│         └────────┬───────┘                                       │
│                  ▼                                               │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    HOOKS LAYER                           │    │
│  │  useTransactions, useBuckets, useAuth, useCategories    │    │
│  │  (ViewModels - Business Logic + State)                  │    │
│  └──────────────────────────┬──────────────────────────────┘    │
└─────────────────────────────┼───────────────────────────────────┘
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                        SERVICE LAYER                             │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │              Services (API Abstraction)                  │    │
│  │  TransactionService, BucketService, AuthService         │    │
│  └──────────────────────────┬──────────────────────────────┘    │
│                             │                                    │
│  ┌──────────────────────────▼──────────────────────────────┐    │
│  │            Repository Layer (Data Source)                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │    │
│  │  │ APIRepository│  │LocalStorage │  │MockRepository│      │    │
│  │  │             │  │ Repository  │  │  (Testing)  │      │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘      │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Python FastAPI)                  │
│                    PostgreSQL / External APIs                    │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
budgeting_app/
├── src/                            # SOURCE CODE
│   ├── components/                 # PRESENTATION - Dumb UI components
│   │   ├── common/                 # Shared components
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── index.ts
│   │   ├── auth/                   # Auth-specific components
│   │   ├── dashboard/              # Dashboard components
│   │   ├── transactions/           # Transaction components
│   │   ├── buckets/                # Bucket components
│   │   └── categories/             # Category components
│   │
│   ├── pages/                      # PRESENTATION - Smart components (containers)
│   │   ├── DashboardPage.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── BucketsPage.tsx
│   │   ├── CategoriesPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── auth/
│   │       ├── LoginPage.tsx
│   │       ├── SignUpPage.tsx
│   │       └── ForgotPasswordPage.tsx
│   │
│   ├── hooks/                      # BUSINESS LOGIC - Custom hooks (ViewModels)
│   │   ├── useAuth.ts
│   │   ├── useTransactions.ts
│   │   ├── useBuckets.ts
│   │   ├── useCategories.ts
│   │   ├── useSettings.ts
│   │   └── useDashboard.ts
│   │
│   ├── services/                   # SERVICE LAYER - API abstraction
│   │   ├── api/
│   │   │   ├── apiClient.ts        # Axios/fetch wrapper
│   │   │   ├── authApi.ts
│   │   │   ├── transactionsApi.ts
│   │   │   ├── bucketsApi.ts
│   │   │   └── categoriesApi.ts
│   │   ├── authService.ts
│   │   ├── transactionService.ts
│   │   ├── bucketService.ts
│   │   └── categoryService.ts
│   │
│   ├── repositories/               # DATA LAYER - Data source abstraction
│   │   ├── interfaces/
│   │   │   ├── ITransactionRepository.ts
│   │   │   ├── IBucketRepository.ts
│   │   │   ├── ICategoryRepository.ts
│   │   │   └── IAuthRepository.ts
│   │   ├── api/                    # API implementations (production)
│   │   │   ├── TransactionApiRepository.ts
│   │   │   ├── BucketApiRepository.ts
│   │   │   ├── CategoryApiRepository.ts
│   │   │   └── AuthApiRepository.ts
│   │   ├── localStorage/           # LocalStorage implementations (offline/dev)
│   │   │   ├── TransactionLocalRepository.ts
│   │   │   ├── BucketLocalRepository.ts
│   │   │   ├── CategoryLocalRepository.ts
│   │   │   └── AuthLocalRepository.ts
│   │   └── mock/                   # Mock implementations (testing)
│   │       ├── TransactionMockRepository.ts
│   │       ├── BucketMockRepository.ts
│   │       ├── CategoryMockRepository.ts
│   │       └── AuthMockRepository.ts
│   │
│   ├── models/                     # DATA MODELS - Types & interfaces
│   │   ├── Transaction.ts
│   │   ├── Bucket.ts
│   │   ├── Category.ts
│   │   ├── User.ts
│   │   └── index.ts
│   │
│   ├── context/                    # REACT CONTEXT - Global state
│   │   ├── AuthContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── AppContext.tsx          # Dependency injection
│   │
│   ├── utils/                      # UTILITIES
│   │   ├── formatters.ts           # Currency, date formatting
│   │   ├── validators.ts           # Form validation
│   │   ├── constants.ts
│   │   └── helpers.ts
│   │
│   └── config/                     # CONFIGURATION
│       ├── environment.ts
│       └── featureFlags.ts
│
├── tests/                          # ALL TEST FILES (separate from src)
│   ├── L1-UnitTests/               # L1 - Unit tests (Vitest)
│   │   ├── utils/
│   │   │   └── formatters.test.ts
│   │   ├── services/
│   │   │   └── transactionService.test.ts
│   │   └── hooks/
│   │       └── useTransactions.test.ts
│   │
│   ├── L2-IntegrationTests/        # L2 - Integration tests (Vitest + MSW)
│   │   ├── components/
│   │   │   └── TransactionList.test.tsx
│   │   └── pages/
│   │       └── TransactionsPage.test.tsx
│   │
│   ├── L3-E2ETests/                # L3 - End-to-End tests (Playwright)
│   │   ├── pages/                  # Page Object Models
│   │   │   ├── LoginPage.ts
│   │   │   ├── DashboardPage.ts
│   │   │   └── TransactionsPage.ts
│   │   ├── auth.spec.ts
│   │   ├── transactions.spec.ts
│   │   └── critical-flows.spec.ts
│   │
│   ├── L4-ManualTests/             # L4 - Manual/Exploratory test checklists
│   │   ├── visual-ux-checklist.md
│   │   ├── accessibility-checklist.md
│   │   └── edge-cases-checklist.md
│   │
│   ├── fixtures/                   # Shared test data
│   │   ├── transactions.ts
│   │   ├── buckets.ts
│   │   ├── categories.ts
│   │   └── users.ts
│   │
│   ├── mocks/                      # Mock handlers (MSW)
│   │   ├── handlers.ts
│   │   └── server.ts
│   │
│   └── setup.ts                    # Test setup file
│
├── docs/                           # DOCUMENTATION
│   ├── ROADMAP.md
│   └── ARCHITECTURE.md
│
└── backend/                        # PYTHON BACKEND (FastAPI)
    └── ...
```

### Why Separate `tests/` Folder (Not Colocated)?

There are two common approaches for organizing test files:

| Approach | Structure | Pros | Cons |
|----------|-----------|------|------|
| **Colocated** | `Button.tsx` + `Button.test.tsx` in same folder | Easy to find tests, encourages testing | Clutters source folders, harder to exclude from builds |
| **Separate** | All tests in `tests/` folder | Clean src folder, easy CI/CD config, clear separation | Need to navigate between folders |

**We're using the separate `tests/` folder approach because:**
1. Cleaner `src/` directory - only production code
2. Easier to configure build tools to exclude tests
3. Simpler CI/CD pipeline configuration
4. E2E tests (Playwright) naturally live outside `src/` anyway
5. Consistent structure for all test levels (L1, L2, L3)

> **Note:** The `__tests__` naming convention (with double underscores) is a **legacy Jest convention**. Jest auto-discovers test files in folders named `__tests__`. Modern tools like Vitest and Playwright don't require this naming - they use glob patterns in config. We use plain `tests/` for simplicity.

---

## Example Implementation

### 1. Repository Interface (Data Contract)

```typescript
// src/repositories/interfaces/ITransactionRepository.ts
import { Transaction, NewTransaction } from '@/models/Transaction';

export interface ITransactionRepository {
  getAll(): Promise<Transaction[]>;
  getById(id: string): Promise<Transaction | null>;
  create(transaction: NewTransaction): Promise<Transaction>;
  update(id: string, transaction: Partial<Transaction>): Promise<Transaction>;
  delete(id: string): Promise<void>;
  getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]>;
  getByCategory(categoryId: string): Promise<Transaction[]>;
}
```

### 2. API Repository Implementation

```typescript
// src/repositories/api/TransactionApiRepository.ts
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { apiClient } from '@/services/api/apiClient';
import { Transaction, NewTransaction } from '@/models/Transaction';

export class TransactionApiRepository implements ITransactionRepository {
  private baseUrl = '/api/transactions';

  async getAll(): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(this.baseUrl);
    return response.data;
  }

  async getById(id: string): Promise<Transaction | null> {
    const response = await apiClient.get<Transaction>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  async create(transaction: NewTransaction): Promise<Transaction> {
    const response = await apiClient.post<Transaction>(this.baseUrl, transaction);
    return response.data;
  }

  async update(id: string, transaction: Partial<Transaction>): Promise<Transaction> {
    const response = await apiClient.put<Transaction>(`${this.baseUrl}/${id}`, transaction);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(this.baseUrl, {
      params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    });
    return response.data;
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    const response = await apiClient.get<Transaction[]>(this.baseUrl, {
      params: { categoryId }
    });
    return response.data;
  }
}
```

### 3. LocalStorage Repository Implementation

```typescript
// src/repositories/localStorage/TransactionLocalRepository.ts
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { Transaction, NewTransaction } from '@/models/Transaction';

const STORAGE_KEY = 'budgeting_transactions';

export class TransactionLocalRepository implements ITransactionRepository {
  private getStoredTransactions(): Transaction[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveTransactions(transactions: Transaction[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  }

  async getAll(): Promise<Transaction[]> {
    return this.getStoredTransactions();
  }

  async getById(id: string): Promise<Transaction | null> {
    const transactions = this.getStoredTransactions();
    return transactions.find(t => t.id === id) || null;
  }

  async create(transaction: NewTransaction): Promise<Transaction> {
    const transactions = this.getStoredTransactions();
    const newTransaction: Transaction = {
      ...transaction,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    transactions.push(newTransaction);
    this.saveTransactions(transactions);
    return newTransaction;
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const transactions = this.getStoredTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    transactions[index] = {
      ...transactions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveTransactions(transactions);
    return transactions[index];
  }

  async delete(id: string): Promise<void> {
    const transactions = this.getStoredTransactions();
    const filtered = transactions.filter(t => t.id !== id);
    this.saveTransactions(filtered);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    const transactions = this.getStoredTransactions();
    return transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    const transactions = this.getStoredTransactions();
    return transactions.filter(t => t.categoryId === categoryId);
  }
}
```

### 4. Mock Repository Implementation (Testing)

```typescript
// src/repositories/mock/TransactionMockRepository.ts
import { ITransactionRepository } from '../interfaces/ITransactionRepository';
import { Transaction, NewTransaction } from '@/models/Transaction';

// Sample mock data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Monthly Salary',
    amount: 5000,
    type: 'income',
    categoryId: 'cat-income-1',
    date: '2026-01-15',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: '2',
    description: 'Grocery Shopping',
    amount: 150,
    type: 'expense',
    categoryId: 'cat-food-1',
    date: '2026-01-16',
    createdAt: '2026-01-16T14:30:00Z',
    updatedAt: '2026-01-16T14:30:00Z',
  },
  {
    id: '3',
    description: 'Electric Bill',
    amount: 85,
    type: 'expense',
    categoryId: 'cat-utilities-1',
    date: '2026-01-10',
    createdAt: '2026-01-10T09:00:00Z',
    updatedAt: '2026-01-10T09:00:00Z',
  },
];

export class TransactionMockRepository implements ITransactionRepository {
  private transactions: Transaction[] = [...mockTransactions];

  async getAll(): Promise<Transaction[]> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return [...this.transactions];
  }

  async getById(id: string): Promise<Transaction | null> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.transactions.find(t => t.id === id) || null;
  }

  async create(transaction: NewTransaction): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const newTransaction: Transaction = {
      ...transaction,
      id: `mock-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.transactions.push(newTransaction);
    return newTransaction;
  }

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const index = this.transactions.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Transaction not found');

    this.transactions[index] = {
      ...this.transactions[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    return this.transactions[index];
  }

  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.transactions = this.transactions.filter(t => t.id !== id);
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
  }

  async getByCategory(categoryId: string): Promise<Transaction[]> {
    await new Promise(resolve => setTimeout(resolve, 50));
    return this.transactions.filter(t => t.categoryId === categoryId);
  }

  // Test helper: reset to initial mock data
  reset(): void {
    this.transactions = [...mockTransactions];
  }
}
```

### 5. Service Layer

```typescript
// src/services/transactionService.ts
import { ITransactionRepository } from '@/repositories/interfaces/ITransactionRepository';
import { Transaction, NewTransaction, TransactionSummary } from '@/models/Transaction';

export class TransactionService {
  constructor(private repository: ITransactionRepository) {}

  async getAllTransactions(): Promise<Transaction[]> {
    return this.repository.getAll();
  }

  async createTransaction(transaction: NewTransaction): Promise<Transaction> {
    // Business logic validation
    if (transaction.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    return this.repository.create(transaction);
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return this.repository.update(id, data);
  }

  async deleteTransaction(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async getTransactionSummary(): Promise<TransactionSummary> {
    const transactions = await this.repository.getAll();

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netAmount: income - expenses,
      transactionCount: transactions.length,
    };
  }
}
```

### 6. Custom Hook (ViewModel)

```typescript
// src/hooks/useTransactions.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Transaction, NewTransaction, TransactionFilters } from '@/models/Transaction';

export interface UseTransactionsReturn {
  // State
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addTransaction: (transaction: NewTransaction) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Filters
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  clearFilters: () => void;

  // Computed
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netAmount: number;
  };
}

const defaultFilters: TransactionFilters = {
  search: '',
  categoryId: null,
  type: null,
  startDate: null,
  endDate: null,
};

export function useTransactions(): UseTransactionsReturn {
  const { transactionService } = useApp();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);

  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await transactionService.getAllTransactions();
        setTransactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, [transactionService]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filters.search && !t.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.categoryId && t.categoryId !== filters.categoryId) {
        return false;
      }
      if (filters.type && t.type !== filters.type) {
        return false;
      }
      if (filters.startDate && new Date(t.date) < new Date(filters.startDate)) {
        return false;
      }
      if (filters.endDate && new Date(t.date) > new Date(filters.endDate)) {
        return false;
      }
      return true;
    });
  }, [transactions, filters]);

  // Calculate summary
  const summary = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      netAmount: income - expenses,
    };
  }, [transactions]);

  // Actions
  const addTransaction = useCallback(async (transaction: NewTransaction) => {
    try {
      const newTransaction = await transactionService.createTransaction(transaction);
      setTransactions(prev => [...prev, newTransaction]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add transaction');
      throw err;
    }
  }, [transactionService]);

  const updateTransaction = useCallback(async (id: string, data: Partial<Transaction>) => {
    try {
      const updated = await transactionService.updateTransaction(id, data);
      setTransactions(prev => prev.map(t => t.id === id ? updated : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
      throw err;
    }
  }, [transactionService]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete transaction');
      throw err;
    }
  }, [transactionService]);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  return {
    transactions,
    filteredTransactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filters,
    setFilters,
    clearFilters,
    summary,
  };
}
```

### 7. Dependency Injection Context

```typescript
// src/context/AppContext.tsx
import React, { createContext, useContext, useMemo } from 'react';
import { TransactionService } from '@/services/transactionService';
import { BucketService } from '@/services/bucketService';
import { CategoryService } from '@/services/categoryService';
import { AuthService } from '@/services/authService';

// Repository implementations
import { TransactionApiRepository } from '@/repositories/api/TransactionApiRepository';
import { TransactionLocalRepository } from '@/repositories/localStorage/TransactionLocalRepository';
import { TransactionMockRepository } from '@/repositories/mock/TransactionMockRepository';

import { BucketApiRepository } from '@/repositories/api/BucketApiRepository';
import { BucketLocalRepository } from '@/repositories/localStorage/BucketLocalRepository';

import { CategoryApiRepository } from '@/repositories/api/CategoryApiRepository';
import { CategoryLocalRepository } from '@/repositories/localStorage/CategoryLocalRepository';

import { AuthApiRepository } from '@/repositories/api/AuthApiRepository';
import { AuthLocalRepository } from '@/repositories/localStorage/AuthLocalRepository';

// Environment-based configuration
import { config } from '@/config/environment';

type DataSource = 'api' | 'localStorage' | 'mock';

interface AppContextType {
  transactionService: TransactionService;
  bucketService: BucketService;
  categoryService: CategoryService;
  authService: AuthService;
}

const AppContext = createContext<AppContextType | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
  dataSource?: DataSource; // Allow override for testing
}

// Factory function to create repositories based on data source
function createRepositories(source: DataSource) {
  switch (source) {
    case 'api':
      return {
        transaction: new TransactionApiRepository(),
        bucket: new BucketApiRepository(),
        category: new CategoryApiRepository(),
        auth: new AuthApiRepository(),
      };
    case 'localStorage':
      return {
        transaction: new TransactionLocalRepository(),
        bucket: new BucketLocalRepository(),
        category: new CategoryLocalRepository(),
        auth: new AuthLocalRepository(),
      };
    case 'mock':
      return {
        transaction: new TransactionMockRepository(),
        bucket: new BucketMockRepository(),
        category: new CategoryMockRepository(),
        auth: new AuthMockRepository(),
      };
  }
}

export function AppProvider({ children, dataSource }: AppProviderProps) {
  const services = useMemo(() => {
    // Determine data source: prop override > env config > default to localStorage
    const source = dataSource ?? config.dataSource ?? 'localStorage';

    // Create repositories based on data source
    const repos = createRepositories(source);

    // Create services with injected repositories
    return {
      transactionService: new TransactionService(repos.transaction),
      bucketService: new BucketService(repos.bucket),
      categoryService: new CategoryService(repos.category),
      authService: new AuthService(repos.auth),
    };
  }, [dataSource]);

  return (
    <AppContext.Provider value={services}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
```

### 8. Environment Configuration

```typescript
// src/config/environment.ts
type DataSource = 'api' | 'localStorage' | 'mock';

interface Config {
  dataSource: DataSource;
  apiBaseUrl: string;
  isDevelopment: boolean;
}

export const config: Config = {
  // Use localStorage for development, api for production
  dataSource: (import.meta.env.VITE_DATA_SOURCE as DataSource) ||
    (import.meta.env.DEV ? 'localStorage' : 'api'),

  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',

  isDevelopment: import.meta.env.DEV,
};
```

```env
# .env.development (localStorage for local dev)
VITE_DATA_SOURCE=localStorage

# .env.production (API for production)
VITE_DATA_SOURCE=api
VITE_API_URL=https://api.mybudgetingapp.com

# .env.test (mock for testing)
VITE_DATA_SOURCE=mock
```

### 9. Page Component (Smart Component)

```typescript
// src/pages/TransactionsPage.tsx
import React, { useState } from 'react';
import { useTransactions } from '@/hooks/useTransactions';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionSummary } from '@/components/transactions/TransactionSummary';
import { TransactionForm } from '@/components/transactions/TransactionForm';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function TransactionsPage() {
  const {
    filteredTransactions,
    isLoading,
    error,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    filters,
    setFilters,
    summary,
  } = useTransactions();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="transactions-page">
      <TransactionSummary summary={summary} />

      <TransactionFilters
        filters={filters}
        onChange={setFilters}
        onAddClick={() => setIsFormOpen(true)}
      />

      {filteredTransactions.length === 0 ? (
        <EmptyState
          title="No transactions"
          description="Add your first transaction to get started"
          actionLabel="Add Transaction"
          onAction={() => setIsFormOpen(true)}
        />
      ) : (
        <TransactionList
          transactions={filteredTransactions}
          onEdit={setEditingTransaction}
          onDelete={deleteTransaction}
        />
      )}

      <Modal isOpen={isFormOpen || !!editingTransaction} onClose={() => {
        setIsFormOpen(false);
        setEditingTransaction(null);
      }}>
        <TransactionForm
          transaction={editingTransaction}
          onSubmit={async (data) => {
            if (editingTransaction) {
              await updateTransaction(editingTransaction.id, data);
            } else {
              await addTransaction(data);
            }
            setIsFormOpen(false);
            setEditingTransaction(null);
          }}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }}
        />
      </Modal>
    </div>
  );
}
```

---

## Testing Strategy

### Test Pyramid Overview

```
                    ▲
                   /│\
                  / │ \        L4: Manual/Exploratory
                 /  │  \       (Human verification)
                /───┼───\
               /    │    \     L3: E2E Tests (Playwright)
              /     │     \    (Full user journeys)
             /──────┼──────\
            /       │       \  L2: Integration Tests
           /        │        \ (Component + Hook + Service)
          /─────────┼─────────\
         /          │          \ L1: Unit Tests (Vitest)
        /           │           \(Functions, Utils, Services)
       ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔

       More tests ◄───────────► Fewer tests
       Faster     ◄───────────► Slower
       Isolated   ◄───────────► Integrated
```

### Test Levels

| Level | Name | What to Test | Tools | Speed | Coverage Goal |
|-------|------|--------------|-------|-------|---------------|
| **L1** | Unit Tests | Pure functions, utilities, services (mocked), hooks (isolated) | Vitest, React Testing Library | Very Fast | 70-80% |
| **L2** | Integration Tests | Components with hooks, service + repository, API contracts | Vitest, MSW (Mock Service Worker) | Fast | 50-60% |
| **L3** | E2E Tests | User flows, critical paths, cross-browser | Playwright | Slow | 20-30% |
| **L4** | Manual/Exploratory | Edge cases, UX validation, accessibility | Human + Playwright trace | Slowest | As needed |

---

## L1: Unit Tests (Vitest)

### What to Test
- Utility functions (formatters, validators, helpers)
- Service methods (with mocked repositories)
- Custom hooks (isolated with mock services)
- Pure components (snapshot/render tests)

### Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Start MSW server for API mocking
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
```

### Example L1 Tests

```typescript
// tests/unit/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate, formatPercentage } from '@/utils/formatters';

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('formats ZAR correctly', () => {
    expect(formatCurrency(1234.56, 'ZAR')).toBe('R1,234.56');
  });

  it('handles zero', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });

  it('handles negative numbers', () => {
    expect(formatCurrency(-500, 'USD')).toBe('-$500.00');
  });
});
```

```typescript
// tests/unit/services/transactionService.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionService } from '@/services/transactionService';
import { ITransactionRepository } from '@/repositories/interfaces/ITransactionRepository';

describe('TransactionService', () => {
  let service: TransactionService;
  let mockRepository: ITransactionRepository;

  const mockTransactions = [
    { id: '1', description: 'Salary', amount: 5000, type: 'income', categoryId: 'cat1', date: '2026-01-15', createdAt: '', updatedAt: '' },
    { id: '2', description: 'Groceries', amount: 150, type: 'expense', categoryId: 'cat2', date: '2026-01-15', createdAt: '', updatedAt: '' },
  ];

  beforeEach(() => {
    mockRepository = {
      getAll: vi.fn().mockResolvedValue(mockTransactions),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      getByDateRange: vi.fn(),
      getByCategory: vi.fn(),
    };
    service = new TransactionService(mockRepository);
  });

  describe('getTransactionSummary', () => {
    it('calculates correct totals', async () => {
      const summary = await service.getTransactionSummary();

      expect(summary.totalIncome).toBe(5000);
      expect(summary.totalExpenses).toBe(150);
      expect(summary.netAmount).toBe(4850);
    });
  });

  describe('createTransaction', () => {
    it('throws error for zero amount', async () => {
      await expect(service.createTransaction({
        description: 'Test',
        amount: 0,
        type: 'expense',
        categoryId: 'cat1',
        date: '2026-01-15',
      })).rejects.toThrow('Amount must be greater than 0');
    });
  });
});
```

---

## L2: Integration Tests

### What to Test
- Components with their hooks
- Service + Repository integration
- API contract validation (with MSW)
- Form submissions and state updates

### Setup (MSW - Mock Service Worker)

```bash
npm install -D msw
```

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/transactions', () => {
    return HttpResponse.json([
      { id: '1', description: 'Coffee', amount: 5, type: 'expense', categoryId: 'cat1', date: '2026-01-15' },
      { id: '2', description: 'Salary', amount: 5000, type: 'income', categoryId: 'cat2', date: '2026-01-15' },
    ]);
  }),

  http.post('/api/transactions', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ ...body, id: 'new-id', createdAt: new Date().toISOString() }, { status: 201 });
  }),

  http.delete('/api/transactions/:id', () => {
    return HttpResponse.json({ success: true });
  }),
];
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Example L2 Tests

```typescript
// tests/integration/pages/TransactionsPage.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransactionsPage } from '@/pages/TransactionsPage';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      <AppProvider>
        {component}
      </AppProvider>
    </ThemeProvider>
  );
};

describe('TransactionsPage Integration', () => {
  it('displays transactions after loading', async () => {
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Coffee')).toBeInTheDocument();
      expect(screen.getByText('Salary')).toBeInTheDocument();
    });
  });

  it('filters transactions by search', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Coffee')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search transactions...');
    await user.type(searchInput, 'coffee');

    expect(screen.getByText('Coffee')).toBeInTheDocument();
    expect(screen.queryByText('Salary')).not.toBeInTheDocument();
  });
});
```

---

## L3: E2E Tests (Playwright)

### What to Test
- Complete user journeys
- Critical business flows
- Cross-browser compatibility

### Setup

```bash
npm install -D @playwright/test
npx playwright install
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Page Object Model

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByPlaceholder('Enter your email');
    this.passwordInput = page.getByPlaceholder('Enter your password');
    this.submitButton = page.getByRole('button', { name: /sign in/i });
    this.errorMessage = page.locator('.auth-error');
  }

  async goto() {
    await this.page.goto('/');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### Example E2E Tests

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Authentication', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('admin@budgetwise.com', 'admin123');

    await expect(page.locator('.stat-card')).toBeVisible();
  });

  test('invalid credentials show error message', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('wrong@email.com', 'wrongpassword');

    await loginPage.expectError('Invalid email or password');
  });
});
```

```typescript
// tests/e2e/transactions.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@budgetwise.com', 'admin123');
    await page.click('.nav-item:has-text("Transactions")');
  });

  test('can add a new transaction', async ({ page }) => {
    await page.getByRole('button', { name: /add/i }).click();

    await page.getByLabel('Description').fill('Test Expense');
    await page.getByLabel('Amount').fill('50');
    await page.getByRole('button', { name: /save/i }).click();

    await expect(page.getByText('Test Expense')).toBeVisible();
  });

  test('can search transactions', async ({ page }) => {
    await page.getByPlaceholder('Search').fill('coffee');

    await expect(page.getByText('Coffee')).toBeVisible();
  });
});
```

---

## L4: Manual/Exploratory Testing

### Checklist

```markdown
## Manual Testing Checklist

### Visual/UX Review
- [ ] All pages render correctly in Chrome/Firefox/Safari
- [ ] Mobile responsive
- [ ] Dark/Light themes work
- [ ] Animations are smooth

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast passes WCAG 2.1 AA

### Edge Cases
- [ ] Empty states display correctly
- [ ] Very long text truncates properly
- [ ] Large numbers format correctly
- [ ] Network timeout handling
```

---

## NPM Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",

    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:e2e:report": "playwright show-report",

    "test:all": "npm run test:coverage && npm run test:e2e"
  }
}
```

---

## Implementation Plan

### Phase 1: Setup Testing Infrastructure
- [ ] Install Vitest and configure
- [ ] Install Playwright and configure
- [ ] Create test utilities and fixtures
- [ ] Set up MSW for API mocking

### Phase 2: Refactor to Clean Architecture
- [ ] Create repository interfaces
- [ ] Implement API repositories
- [ ] Create service layer
- [ ] Create custom hooks (ViewModels)
- [ ] Create AppContext for dependency injection

### Phase 3: Write L1 Tests
- [ ] Test utility functions
- [ ] Test services with mocked repositories
- [ ] Test custom hooks

### Phase 4: Write L2 Tests
- [ ] Test page components with providers
- [ ] Test form submissions

### Phase 5: Write L3 E2E Tests
- [ ] Create Page Object Models
- [ ] Test authentication flows
- [ ] Test critical user journeys
- [ ] Cross-browser testing

### Phase 6: Backend Integration
- [ ] Connect to Python FastAPI backend
- [ ] Real API integration

---

## Summary

| Layer | Pattern | Testing |
|-------|---------|---------|
| **UI** | Dumb Components | Snapshot, Visual |
| **Pages** | Smart Components | Integration |
| **Hooks** | ViewModels (Logic) | Unit + Integration |
| **Services** | Business Logic | Unit |
| **Repositories** | Data Abstraction | Integration |
| **API** | External Calls | E2E + Contract |

---

*Last Updated: January 17, 2026*
