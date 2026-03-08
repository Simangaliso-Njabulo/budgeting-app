import { db, type DbTransaction } from './database';
import { parseLocalDate, toLocalMidnightEnd } from '../utils/helpers';
import type { Transaction } from '../types';

function toTransaction(tx: DbTransaction): Transaction {
  return {
    id: tx.id,
    description: tx.description,
    amount: tx.amount,
    type: tx.type,
    categoryId: tx.categoryId || '',
    bucketId: tx.bucketId,
    date: tx.date,
    notes: tx.notes,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  };
}

export const transactionService = {
  async getAll(userId: string): Promise<Transaction[]> {
    const records = await db.transactions
      .where('userId')
      .equals(userId)
      .toArray();
    return records.map(toTransaction);
  },

  async create(
    userId: string,
    data: {
      description: string;
      amount: number;
      type: string;
      date: string;
      categoryId?: string;
      bucketId?: string;
      notes?: string;
      isRecurring?: boolean;
      recurringInterval?: string;
    }
  ): Promise<Transaction> {
    const now = new Date();
    const record: DbTransaction = {
      id: crypto.randomUUID(),
      userId,
      categoryId: data.categoryId || undefined,
      bucketId: data.bucketId || undefined,
      description: data.description,
      amount: data.amount,
      type: data.type as 'income' | 'expense',
      date: parseLocalDate(data.date),
      notes: data.notes,
      isRecurring: data.isRecurring || false,
      recurringInterval: data.recurringInterval,
      createdAt: now,
      updatedAt: now,
    };
    await db.transactions.add(record);
    return toTransaction(record);
  },

  async update(
    id: string,
    data: Partial<{
      description: string;
      amount: number;
      type: string;
      date: string;
      categoryId: string;
      bucketId: string;
      notes: string;
    }>
  ): Promise<Transaction> {
    const updateData: Record<string, unknown> = {
      ...data,
      updatedAt: new Date(),
    };
    // Convert date string to local Date object if present
    if (data.date) {
      updateData.date = parseLocalDate(data.date);
    }
    await db.transactions.update(id, updateData);
    const record = await db.transactions.get(id);
    if (!record) throw new Error('Transaction not found');
    return toTransaction(record);
  },

  async delete(id: string): Promise<void> {
    await db.transactions.delete(id);
  },

  async getSummary(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ totalIncome: number; totalExpenses: number; count: number }> {
    let collection = db.transactions.where('userId').equals(userId);
    let records = await collection.toArray();

    if (startDate) {
      const start = parseLocalDate(startDate);
      records = records.filter((tx) => tx.date >= start);
    }
    if (endDate) {
      const end = toLocalMidnightEnd(endDate);
      records = records.filter((tx) => tx.date <= end);
    }

    let totalIncome = 0;
    let totalExpenses = 0;
    for (const tx of records) {
      if (tx.type === 'income') totalIncome += tx.amount;
      else totalExpenses += tx.amount;
    }

    return { totalIncome, totalExpenses, count: records.length };
  },
};
