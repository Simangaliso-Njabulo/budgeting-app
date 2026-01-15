// src/types/index.ts

// Theme types
export type Theme = 'dark' | 'light';
export type AccentColor = 'purple' | 'blue' | 'green' | 'orange';

export interface AppSettings {
  theme: Theme;
  accentColor: AccentColor;
  currency: string;
}

// Income configuration
export interface Income {
  amount: number;
  savings: number;
  currency?: string;
}

// Bucket (budget allocation)
export interface Bucket {
  id: string;
  name: string;
  allocated: number;
  actual: number;
  categoryId: string;
  icon?: string;
  color?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Transaction
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  bucketId?: string;
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category with soft delete support
export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type?: 'expense' | 'income' | 'both';
  isDeleted?: boolean;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Chart data for visualizations
export interface CategoryData {
  name: string;
  allocated: number;
  actual: number;
  percentage: string;
  color: string;
}

// Form state for new bucket
export interface NewBucketForm {
  name: string;
  allocated: number;
  categoryId: string;
}

// Form state for new transaction
export interface NewTransactionForm {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  bucketId?: string;
  date: Date;
  notes?: string;
}

// Form state for new category
export interface NewCategoryForm {
  name: string;
  color: string;
  icon?: string;
  type: 'expense' | 'income' | 'both';
}
