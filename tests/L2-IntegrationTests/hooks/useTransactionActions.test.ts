// tests/L2-IntegrationTests/hooks/useTransactionActions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTransactionActions } from '../../../src/hooks/useTransactionActions';
import type { Transaction, Bucket } from '../../../src/types';

// Mock the API module
vi.mock('../../../src/services/api', () => ({
  transactionsApi: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the transform function
vi.mock('../../../src/hooks/useBudgetData', () => ({
  transformTransaction: vi.fn((tx: Record<string, unknown>) => ({
    id: tx.id as string,
    description: tx.description as string,
    amount: Number(tx.amount) || 0,
    type: tx.type as 'income' | 'expense',
    categoryId: (tx.category_id as string) || '',
    bucketId: tx.bucket_id as string | undefined,
    date: new Date(tx.date as string),
    notes: tx.notes as string | undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
}));

import { transactionsApi } from '../../../src/services/api';

const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Coffee',
    amount: 4.50,
    type: 'expense',
    categoryId: '1',
    date: new Date('2026-01-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

function createHookOptions() {
  return {
    transactions: mockTransactions,
    setTransactions: vi.fn((updater: unknown) => {
      if (typeof updater === 'function') {
        return (updater as (prev: Transaction[]) => Transaction[])(mockTransactions);
      }
      return updater;
    }),
    setBuckets: vi.fn((updater: unknown) => {
      if (typeof updater === 'function') {
        return (updater as (prev: Bucket[]) => Bucket[])([]);
      }
      return updater;
    }),
    recalculateBucketSpending: vi.fn((txList: Transaction[], bucketList: Bucket[]) => bucketList),
    fetchTrends: vi.fn(),
    showToast: vi.fn(),
  };
}

describe('useTransactionActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('starts with no editing transaction', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      expect(result.current.editingTransaction).toBeUndefined();
      expect(result.current.isTransactionModalOpen).toBe(false);
    });

    it('starts with empty filter state', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      expect(result.current.txSearchQuery).toBe('');
      expect(result.current.txCategoryFilter).toBe('');
      expect(result.current.txTypeFilter).toBe('');
      expect(result.current.txDateRange).toEqual({ start: '', end: '' });
    });
  });

  describe('modal management', () => {
    it('opens new transaction modal', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.openNewTransactionModal();
      });

      expect(result.current.isTransactionModalOpen).toBe(true);
      expect(result.current.editingTransaction).toBeUndefined();
    });

    it('closes transaction modal', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.openNewTransactionModal();
      });

      act(() => {
        result.current.closeTransactionModal();
      });

      expect(result.current.isTransactionModalOpen).toBe(false);
      expect(result.current.editingTransaction).toBeUndefined();
    });

    it('opens edit modal with transaction data', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.handleEditTransaction(mockTransactions[0]);
      });

      expect(result.current.isTransactionModalOpen).toBe(true);
      expect(result.current.editingTransaction).toEqual(mockTransactions[0]);
    });
  });

  describe('filterTransactions', () => {
    const transactions: Transaction[] = [
      {
        id: '1', description: 'Coffee Shop', amount: 4.50, type: 'expense',
        categoryId: 'cat-1', date: new Date('2026-01-15'),
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: '2', description: 'Monthly Salary', amount: 5000, type: 'income',
        categoryId: 'cat-2', date: new Date('2026-01-01'),
        createdAt: new Date(), updatedAt: new Date(),
      },
      {
        id: '3', description: 'Grocery Store', amount: 89, type: 'expense',
        categoryId: 'cat-1', date: new Date('2026-02-10'),
        createdAt: new Date(), updatedAt: new Date(),
      },
    ];

    it('returns all transactions when no filters set', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      const filtered = result.current.filterTransactions(transactions);
      expect(filtered).toHaveLength(3);
    });

    it('filters by search query', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.setTxSearchQuery('coffee');
      });

      const filtered = result.current.filterTransactions(transactions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toBe('Coffee Shop');
    });

    it('filters by category', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.setTxCategoryFilter('cat-1');
      });

      const filtered = result.current.filterTransactions(transactions);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(t => t.categoryId === 'cat-1')).toBe(true);
    });

    it('filters by type', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.setTxTypeFilter('income');
      });

      const filtered = result.current.filterTransactions(transactions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].type).toBe('income');
    });

    it('filters by date range', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.setTxDateRange({ start: '2026-01-01', end: '2026-01-31' });
      });

      const filtered = result.current.filterTransactions(transactions);
      expect(filtered).toHaveLength(2);
    });

    it('combines multiple filters', () => {
      const options = createHookOptions();
      const { result } = renderHook(() => useTransactionActions(options));

      act(() => {
        result.current.setTxTypeFilter('expense');
        result.current.setTxCategoryFilter('cat-1');
        result.current.setTxDateRange({ start: '2026-01-01', end: '2026-01-31' });
      });

      const filtered = result.current.filterTransactions(transactions);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].description).toBe('Coffee Shop');
    });
  });

  describe('deleteTransaction', () => {
    it('calls API and shows toast on success', async () => {
      const options = createHookOptions();
      vi.mocked(transactionsApi.delete).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useTransactionActions(options));

      await act(async () => {
        await result.current.handleDeleteTransaction(mockTransactions[0]);
      });

      expect(transactionsApi.delete).toHaveBeenCalledWith('1');
      expect(options.showToast).toHaveBeenCalledWith('Transaction deleted', 'info');
    });

    it('shows error toast on failure', async () => {
      const options = createHookOptions();
      vi.mocked(transactionsApi.delete).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTransactionActions(options));

      await act(async () => {
        await result.current.handleDeleteTransaction(mockTransactions[0]);
      });

      expect(options.showToast).toHaveBeenCalledWith('Failed to delete transaction', 'error');
    });
  });
});
