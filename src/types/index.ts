// src/types/index.ts

export interface Income {
  amount: number;
  savings: number;
}

export interface Bucket {
  id: string;
  name: string;
  allocated: number;
  actual: number;
  categoryId: string;
}

export interface Transaction {
  id: number;
  item: string;
  bucketId: string;
  date: string;
  amount: number;
  balanceAfter: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface CategoryData {
  name: string;
  allocated: number;
  actual: number;
  percentage: string;
  color: string;
}