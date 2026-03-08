// src/utils/helpers.ts

import type { Transaction, Bucket, Category } from '../types';

export function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function toLocalMidnightEnd(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 23, 59, 59, 999);
}

export function getTxDateString(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return toLocalDateString(d);
}

/**
 * Calculate total income from transactions
 */
export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate total expenses from transactions
 */
export function calculateTotalExpenses(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate net amount (income - expenses)
 */
export function calculateNetAmount(transactions: Transaction[]): number {
  return calculateTotalIncome(transactions) - calculateTotalExpenses(transactions);
}

/**
 * Calculate total allocated from buckets
 */
export function calculateTotalAllocated(buckets: Bucket[]): number {
  return buckets.reduce((sum, b) => sum + b.allocated, 0);
}

/**
 * Calculate total spent from buckets
 */
export function calculateTotalSpent(buckets: Bucket[]): number {
  return buckets.reduce((sum, b) => sum + b.actual, 0);
}

/**
 * Calculate remaining budget (income - allocated)
 */
export function calculateRemainingBudget(income: number, buckets: Bucket[]): number {
  const allocated = calculateTotalAllocated(buckets);
  return Math.max(0, income - allocated);
}

/**
 * Calculate bucket utilization percentage
 */
export function calculateBucketUtilization(bucket: Bucket): number {
  if (bucket.allocated === 0) return 0;
  return (bucket.actual / bucket.allocated) * 100;
}

/**
 * Check if bucket is over budget
 */
export function isBucketOverBudget(bucket: Bucket): boolean {
  return bucket.actual > bucket.allocated;
}

/**
 * Get buckets by category
 */
export function getBucketsByCategory(buckets: Bucket[], categoryId: string): Bucket[] {
  return buckets.filter(b => b.categoryId === categoryId);
}

/**
 * Get transactions by category
 */
export function getTransactionsByCategory(transactions: Transaction[], categoryId: string): Transaction[] {
  return transactions.filter(t => t.categoryId === categoryId);
}

/**
 * Get transactions by bucket
 */
export function getTransactionsByBucket(transactions: Transaction[], bucketId: string): Transaction[] {
  return transactions.filter(t => t.bucketId === bucketId);
}

/**
 * Get transactions by date range
 */
export function getTransactionsByDateRange(
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
): Transaction[] {
  return transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate >= startDate && txDate <= endDate;
  });
}

/**
 * Get transactions for a specific day
 */
export function getTransactionsForDay(transactions: Transaction[], date: Date): Transaction[] {
  return transactions.filter(t => {
    const txDate = new Date(t.date);
    return (
      txDate.getFullYear() === date.getFullYear() &&
      txDate.getMonth() === date.getMonth() &&
      txDate.getDate() === date.getDate()
    );
  });
}

/**
 * Group transactions by date
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach(tx => {
    const txDate = tx.date instanceof Date ? tx.date : new Date(tx.date);
    const dateKey = toLocalDateString(txDate);
    const existing = grouped.get(dateKey) || [];
    grouped.set(dateKey, [...existing, tx]);
  });

  return grouped;
}

/**
 * Calculate category spending from transactions
 */
export function calculateCategorySpending(
  transactions: Transaction[],
  categoryId: string
): number {
  return getTransactionsByCategory(transactions, categoryId)
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate category income from transactions
 */
export function calculateCategoryIncome(
  transactions: Transaction[],
  categoryId: string
): number {
  return getTransactionsByCategory(transactions, categoryId)
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Get active categories (not soft-deleted)
 */
export function getActiveCategories(categories: Category[]): Category[] {
  return categories.filter(c => !c.isDeleted);
}

/**
 * Sort transactions by date (newest first)
 */
export function sortTransactionsByDate(
  transactions: Transaction[],
  order: 'asc' | 'desc' = 'desc'
): Transaction[] {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Get recent transactions (last N)
 */
export function getRecentTransactions(transactions: Transaction[], limit: number): Transaction[] {
  return sortTransactionsByDate(transactions, 'desc').slice(0, limit);
}

/**
 * Calculate spending trend for last N days
 */
export function calculateSpendingTrend(
  transactions: Transaction[],
  days: number
): { date: string; amount: number }[] {
  const result: { date: string; amount: number }[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const dayTransactions = getTransactionsForDay(transactions, date);
    const totalSpent = dayTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    result.push({
      date: toLocalDateString(date),
      amount: totalSpent,
    });
  }

  return result;
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
