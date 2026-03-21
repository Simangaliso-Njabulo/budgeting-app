import Dexie, { type Table } from 'dexie';

// ── Interfaces ──────────────────────────────────────────────────────

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  currency: string;
  theme: string;
  accentColor: string;
  monthlyIncome: number;
  savingsTarget: number;
  payDate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbCategory {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  type: 'expense' | 'income' | 'both';
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbBucket {
  id: string;
  userId: string;
  year: number;
  month: number;
  categoryId?: string;
  name: string;
  allocated: number;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbTransaction {
  id: string;
  userId: string;
  categoryId?: string;
  bucketId?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: Date;
  notes?: string;
  isRecurring: boolean;
  recurringInterval?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbMonthlyIncome {
  id: string;
  userId: string;
  year: number;
  month: number;
  amount: number;
  savingsTarget: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Database ────────────────────────────────────────────────────────

class BudgetDatabase extends Dexie {
  users!: Table<DbUser, string>;
  categories!: Table<DbCategory, string>;
  buckets!: Table<DbBucket, string>;
  transactions!: Table<DbTransaction, string>;
  monthlyIncomes!: Table<DbMonthlyIncome, string>;

  constructor() {
    super('BudgetingApp');

    this.version(2).stores({
      users: 'id, &email',
      categories: 'id, userId, name, type, isDeleted',
      buckets: 'id, userId, [userId+year+month], categoryId, name',
      transactions: 'id, userId, categoryId, bucketId, type, date',
      monthlyIncomes: 'id, userId, [year+month], [userId+year+month]',
    });
  }
}

export const db = new BudgetDatabase();
