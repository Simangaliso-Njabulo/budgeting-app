// tests/L1-UnitTests/utils/helpers.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateTotalIncome,
  calculateTotalExpenses,
  calculateNetAmount,
  calculateTotalAllocated,
  calculateTotalSpent,
  calculateRemainingBudget,
  calculateBucketUtilization,
  isBucketOverBudget,
  getBucketsByCategory,
  getTransactionsByCategory,
  getTransactionsByBucket,
  getTransactionsByDateRange,
  getTransactionsForDay,
  groupTransactionsByDate,
  calculateCategorySpending,
  calculateCategoryIncome,
  getActiveCategories,
  sortTransactionsByDate,
  getRecentTransactions,
  calculateSpendingTrend,
  generateId,
  deepClone,
} from '../../../src/utils/helpers';
import {
  mockTransactions,
  mockBuckets,
  mockCategories,
  createMockTransaction,
  createMockBucket,
} from '../../fixtures';

describe('calculateTotalIncome', () => {
  it('calculates total income from transactions', () => {
    const result = calculateTotalIncome(mockTransactions);
    expect(result).toBe(5000); // Only the salary transaction
  });

  it('returns 0 for empty array', () => {
    expect(calculateTotalIncome([])).toBe(0);
  });

  it('returns 0 when no income transactions', () => {
    const expenses = mockTransactions.filter(t => t.type === 'expense');
    expect(calculateTotalIncome(expenses)).toBe(0);
  });
});

describe('calculateTotalExpenses', () => {
  it('calculates total expenses from transactions', () => {
    const result = calculateTotalExpenses(mockTransactions);
    // Coffee (4.50) + Grocery (89) + Netflix (15.99) + Gas (45) = 154.49
    expect(result).toBeCloseTo(154.49);
  });

  it('returns 0 for empty array', () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });

  it('returns 0 when no expense transactions', () => {
    const income = mockTransactions.filter(t => t.type === 'income');
    expect(calculateTotalExpenses(income)).toBe(0);
  });
});

describe('calculateNetAmount', () => {
  it('calculates income minus expenses', () => {
    const result = calculateNetAmount(mockTransactions);
    // 5000 - 154.49 = 4845.51
    expect(result).toBeCloseTo(4845.51);
  });

  it('returns 0 for empty array', () => {
    expect(calculateNetAmount([])).toBe(0);
  });

  it('returns negative when expenses exceed income', () => {
    const expenses = [
      createMockTransaction({ type: 'expense', amount: 1000 }),
      createMockTransaction({ type: 'income', amount: 500 }),
    ];
    expect(calculateNetAmount(expenses)).toBe(-500);
  });
});

describe('calculateTotalAllocated', () => {
  it('calculates total allocated from buckets', () => {
    const result = calculateTotalAllocated(mockBuckets);
    // 800 + 1500 + 300 + 200 + 500 = 3300
    expect(result).toBe(3300);
  });

  it('returns 0 for empty array', () => {
    expect(calculateTotalAllocated([])).toBe(0);
  });
});

describe('calculateTotalSpent', () => {
  it('calculates total actual spent from buckets', () => {
    const result = calculateTotalSpent(mockBuckets);
    // 650 + 1500 + 220 + 180 + 500 = 3050
    expect(result).toBe(3050);
  });

  it('returns 0 for empty array', () => {
    expect(calculateTotalSpent([])).toBe(0);
  });
});

describe('calculateRemainingBudget', () => {
  it('calculates remaining budget', () => {
    const result = calculateRemainingBudget(5000, mockBuckets);
    // 5000 - 3300 = 1700
    expect(result).toBe(1700);
  });

  it('returns 0 when over-allocated', () => {
    const overBudgetBuckets = [createMockBucket({ allocated: 6000 })];
    expect(calculateRemainingBudget(5000, overBudgetBuckets)).toBe(0);
  });

  it('returns full income for empty buckets', () => {
    expect(calculateRemainingBudget(5000, [])).toBe(5000);
  });
});

describe('calculateBucketUtilization', () => {
  it('calculates utilization percentage', () => {
    const bucket = createMockBucket({ allocated: 100, actual: 75 });
    expect(calculateBucketUtilization(bucket)).toBe(75);
  });

  it('returns 0 when allocated is 0', () => {
    const bucket = createMockBucket({ allocated: 0, actual: 50 });
    expect(calculateBucketUtilization(bucket)).toBe(0);
  });

  it('can exceed 100% for over-budget', () => {
    const bucket = createMockBucket({ allocated: 100, actual: 150 });
    expect(calculateBucketUtilization(bucket)).toBe(150);
  });
});

describe('isBucketOverBudget', () => {
  it('returns true when actual exceeds allocated', () => {
    const bucket = createMockBucket({ allocated: 100, actual: 150 });
    expect(isBucketOverBudget(bucket)).toBe(true);
  });

  it('returns false when actual is under allocated', () => {
    const bucket = createMockBucket({ allocated: 100, actual: 75 });
    expect(isBucketOverBudget(bucket)).toBe(false);
  });

  it('returns false when actual equals allocated', () => {
    const bucket = createMockBucket({ allocated: 100, actual: 100 });
    expect(isBucketOverBudget(bucket)).toBe(false);
  });
});

describe('getBucketsByCategory', () => {
  it('filters buckets by category', () => {
    const result = getBucketsByCategory(mockBuckets, '1');
    // Food & Groceries, Rent, Transportation are in category 1
    expect(result).toHaveLength(3);
    expect(result.every(b => b.categoryId === '1')).toBe(true);
  });

  it('returns empty array for non-existent category', () => {
    expect(getBucketsByCategory(mockBuckets, 'non-existent')).toHaveLength(0);
  });
});

describe('getTransactionsByCategory', () => {
  it('filters transactions by category', () => {
    const result = getTransactionsByCategory(mockTransactions, '1');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(t => t.categoryId === '1')).toBe(true);
  });

  it('returns empty array for non-existent category', () => {
    expect(getTransactionsByCategory(mockTransactions, 'non-existent')).toHaveLength(0);
  });
});

describe('getTransactionsByBucket', () => {
  it('filters transactions by bucket', () => {
    const result = getTransactionsByBucket(mockTransactions, '1');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every(t => t.bucketId === '1')).toBe(true);
  });

  it('returns empty array for non-existent bucket', () => {
    expect(getTransactionsByBucket(mockTransactions, 'non-existent')).toHaveLength(0);
  });
});

describe('getTransactionsByDateRange', () => {
  it('filters transactions within date range', () => {
    const start = new Date('2026-01-01');
    const end = new Date('2026-01-31');
    const result = getTransactionsByDateRange(mockTransactions, start, end);
    expect(result.length).toBeGreaterThan(0);
    result.forEach(t => {
      const txDate = new Date(t.date);
      expect(txDate >= start && txDate <= end).toBe(true);
    });
  });

  it('returns empty array when no transactions in range', () => {
    const start = new Date('2020-01-01');
    const end = new Date('2020-01-31');
    expect(getTransactionsByDateRange(mockTransactions, start, end)).toHaveLength(0);
  });
});

describe('getTransactionsForDay', () => {
  it('returns transactions for specific day', () => {
    const today = new Date('2026-01-15');
    const transactions = [
      createMockTransaction({ date: new Date('2026-01-15T10:00:00') }),
      createMockTransaction({ date: new Date('2026-01-15T15:00:00') }),
      createMockTransaction({ date: new Date('2026-01-16T10:00:00') }),
    ];
    const result = getTransactionsForDay(transactions, today);
    expect(result).toHaveLength(2);
  });
});

describe('groupTransactionsByDate', () => {
  it('groups transactions by date', () => {
    const transactions = [
      createMockTransaction({ date: new Date('2026-01-15') }),
      createMockTransaction({ date: new Date('2026-01-15') }),
      createMockTransaction({ date: new Date('2026-01-16') }),
    ];
    const result = groupTransactionsByDate(transactions);
    expect(result.size).toBe(2);
    expect(result.get('2026-01-15')).toHaveLength(2);
    expect(result.get('2026-01-16')).toHaveLength(1);
  });

  it('returns empty map for empty array', () => {
    expect(groupTransactionsByDate([]).size).toBe(0);
  });
});

describe('calculateCategorySpending', () => {
  it('calculates spending for a category', () => {
    const result = calculateCategorySpending(mockTransactions, '1');
    // Coffee (4.50) + Grocery (89) + Gas (45) = 138.50
    expect(result).toBeCloseTo(138.50);
  });

  it('returns 0 for non-existent category', () => {
    expect(calculateCategorySpending(mockTransactions, 'non-existent')).toBe(0);
  });
});

describe('calculateCategoryIncome', () => {
  it('calculates income for a category', () => {
    const result = calculateCategoryIncome(mockTransactions, '4');
    expect(result).toBe(5000); // Salary
  });

  it('returns 0 for expense-only category', () => {
    expect(calculateCategoryIncome(mockTransactions, '2')).toBe(0);
  });
});

describe('getActiveCategories', () => {
  it('filters out deleted categories', () => {
    const result = getActiveCategories(mockCategories);
    expect(result.some(c => c.isDeleted)).toBe(false);
  });

  it('includes non-deleted categories', () => {
    const result = getActiveCategories(mockCategories);
    expect(result.length).toBe(mockCategories.filter(c => !c.isDeleted).length);
  });
});

describe('sortTransactionsByDate', () => {
  const transactions = [
    createMockTransaction({ date: new Date('2026-01-15') }),
    createMockTransaction({ date: new Date('2026-01-10') }),
    createMockTransaction({ date: new Date('2026-01-20') }),
  ];

  it('sorts descending by default (newest first)', () => {
    const result = sortTransactionsByDate(transactions);
    expect(new Date(result[0].date).getTime()).toBeGreaterThan(
      new Date(result[1].date).getTime()
    );
  });

  it('sorts ascending when specified', () => {
    const result = sortTransactionsByDate(transactions, 'asc');
    expect(new Date(result[0].date).getTime()).toBeLessThan(
      new Date(result[1].date).getTime()
    );
  });

  it('does not modify original array', () => {
    const original = [...transactions];
    sortTransactionsByDate(transactions);
    expect(transactions).toEqual(original);
  });
});

describe('getRecentTransactions', () => {
  it('returns the N most recent transactions', () => {
    const transactions = [
      createMockTransaction({ date: new Date('2026-01-15') }),
      createMockTransaction({ date: new Date('2026-01-10') }),
      createMockTransaction({ date: new Date('2026-01-20') }),
      createMockTransaction({ date: new Date('2026-01-05') }),
    ];
    const result = getRecentTransactions(transactions, 2);
    expect(result).toHaveLength(2);
    // Should be the two most recent
    expect(new Date(result[0].date).getDate()).toBe(20);
    expect(new Date(result[1].date).getDate()).toBe(15);
  });

  it('returns all transactions if limit exceeds count', () => {
    const transactions = [createMockTransaction()];
    const result = getRecentTransactions(transactions, 10);
    expect(result).toHaveLength(1);
  });
});

describe('calculateSpendingTrend', () => {
  it('returns spending data for each day in range', () => {
    const result = calculateSpendingTrend([], 7);
    expect(result).toHaveLength(7);
    result.forEach(day => {
      expect(day).toHaveProperty('date');
      expect(day).toHaveProperty('amount');
    });
  });

  it('calculates correct amounts per day', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactions = [
      createMockTransaction({ date: today, type: 'expense', amount: 50 }),
      createMockTransaction({ date: today, type: 'expense', amount: 30 }),
    ];
    const result = calculateSpendingTrend(transactions, 1);
    expect(result[0].amount).toBe(80);
  });

  it('excludes income transactions', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactions = [
      createMockTransaction({ date: today, type: 'income', amount: 1000 }),
    ];
    const result = calculateSpendingTrend(transactions, 1);
    expect(result[0].amount).toBe(0);
  });
});

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('generates string IDs', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('generates non-empty IDs', () => {
    expect(generateId().length).toBeGreaterThan(0);
  });
});

describe('deepClone', () => {
  it('creates a deep copy of an object', () => {
    const original = { a: 1, b: { c: 2 } };
    const clone = deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.b).not.toBe(original.b);
  });

  it('clones arrays', () => {
    const original = [1, [2, 3], { a: 4 }];
    const clone = deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone[1]).not.toBe(original[1]);
  });

  it('handles Date objects (as strings)', () => {
    const original = { date: new Date('2026-01-15') };
    const clone = deepClone(original);
    expect(clone.date).toBe(original.date.toISOString());
  });
});
