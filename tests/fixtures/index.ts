// tests/fixtures/index.ts
// Shared test data for all test levels

import type { Category, Transaction, Bucket, Income } from '../../src/types';

// Categories
export const mockCategories: Category[] = [
  { id: '1', name: 'Living Expenses', color: '#a78bfa', icon: 'home', type: 'expense' },
  { id: '2', name: 'Entertainment', color: '#6ee7b7', icon: 'entertainment', type: 'expense' },
  { id: '3', name: 'Investments', color: '#7dd3fc', icon: 'work', type: 'both' },
  { id: '4', name: 'Income', color: '#fdba74', icon: 'income', type: 'income' },
  { id: '5', name: 'Deleted Category', color: '#ff0000', type: 'expense', isDeleted: true, deletedAt: new Date() },
];

export const mockActiveCategories = mockCategories.filter(c => !c.isDeleted);

// Transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    description: 'Coffee Shop',
    amount: 4.50,
    type: 'expense',
    categoryId: '1',
    date: new Date('2026-01-15'),
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-15'),
  },
  {
    id: '2',
    description: 'Monthly Salary',
    amount: 5000,
    type: 'income',
    categoryId: '4',
    date: new Date('2026-01-01'),
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  },
  {
    id: '3',
    description: 'Grocery Store',
    amount: 89.00,
    type: 'expense',
    categoryId: '1',
    bucketId: '1',
    date: new Date('2026-01-14'),
    createdAt: new Date('2026-01-14'),
    updatedAt: new Date('2026-01-14'),
  },
  {
    id: '4',
    description: 'Netflix',
    amount: 15.99,
    type: 'expense',
    categoryId: '2',
    bucketId: '3',
    date: new Date('2026-01-10'),
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-01-10'),
  },
  {
    id: '5',
    description: 'Gas Station',
    amount: 45.00,
    type: 'expense',
    categoryId: '1',
    bucketId: '4',
    date: new Date('2026-01-12'),
    createdAt: new Date('2026-01-12'),
    updatedAt: new Date('2026-01-12'),
  },
];

// Buckets
export const mockBuckets: Bucket[] = [
  { id: '1', name: 'Food & Groceries', allocated: 800, actual: 650, categoryId: '1' },
  { id: '2', name: 'Rent', allocated: 1500, actual: 1500, categoryId: '1' },
  { id: '3', name: 'Entertainment', allocated: 300, actual: 220, categoryId: '2' },
  { id: '4', name: 'Transportation', allocated: 200, actual: 180, categoryId: '1' },
  { id: '5', name: 'Investments', allocated: 500, actual: 500, categoryId: '3' },
];

// Income
export const mockIncome: Income = {
  amount: 5000,
  savings: 1000,
  currency: 'USD',
};

// Users
export const mockUser = {
  name: 'Test User',
  email: 'test@example.com',
};

export const mockAdminUser = {
  name: 'Admin User',
  email: 'admin@budgetwise.com',
};

// Helper functions for creating test data
export function createMockTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: `tx-${Date.now()}`,
    description: 'Test Transaction',
    amount: 100,
    type: 'expense',
    categoryId: '1',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockBucket(overrides: Partial<Bucket> = {}): Bucket {
  return {
    id: `bucket-${Date.now()}`,
    name: 'Test Bucket',
    allocated: 500,
    actual: 0,
    categoryId: '1',
    ...overrides,
  };
}

export function createMockCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: `cat-${Date.now()}`,
    name: 'Test Category',
    color: '#8b5cf6',
    type: 'expense',
    ...overrides,
  };
}

// Utility for getting transactions by type
export function getIncomeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(t => t.type === 'income');
}

export function getExpenseTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.filter(t => t.type === 'expense');
}

// Calculate totals
export function calculateTotalIncome(transactions: Transaction[]): number {
  return getIncomeTransactions(transactions).reduce((sum, t) => sum + t.amount, 0);
}

export function calculateTotalExpenses(transactions: Transaction[]): number {
  return getExpenseTransactions(transactions).reduce((sum, t) => sum + t.amount, 0);
}

export function calculateNetAmount(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
}
