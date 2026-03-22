import { db, type DbBucket } from './database';
import type { Bucket } from '../types';

// Default bucket templates (name, allocated, categoryName)
const DEFAULT_BUCKETS: [string, number, string][] = [
  // Living Costs
  ['Rent', 5000, 'Living Costs'],
  ['Phones', 500, 'Living Costs'],
  ['Streaming', 200, 'Living Costs'],
  ['Cloud Storage', 50, 'Living Costs'],
  ['Internet', 600, 'Living Costs'],
  ['Utilities', 800, 'Living Costs'],
  // Car
  ['Car Payment', 3000, 'Car'],
  // Expenses
  ['Commute', 500, 'Expenses'],
  ['Transport', 500, 'Expenses'],
  ['Groceries', 2000, 'Expenses'],
  ['Personal Care', 200, 'Expenses'],
  ['Household', 300, 'Expenses'],
  ['Bank Fees', 100, 'Expenses'],
  // Enjoyment
  ['Entertainment', 1000, 'Enjoyment'],
  ['Spending Money', 500, 'Enjoyment'],
  ['Dining Out', 500, 'Enjoyment'],
  // Black Tax
  ['Family Support 1', 1000, 'Black Tax'],
  ['Family Support 2', 500, 'Black Tax'],
  ['Family Support 3', 500, 'Black Tax'],
  // Savings
  ['Savings', 2000, 'Savings'],
  // Unplanned
  ['Unplanned', 750, 'Unplanned'],
];

function toBucket(b: DbBucket): Bucket {
  return {
    id: b.id,
    year: b.year,
    month: b.month,
    name: b.name,
    allocated: b.allocated,
    actual: 0,
    categoryId: b.categoryId || '',
    icon: b.icon,
    color: b.color,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export const bucketService = {
  /**
   * Get buckets for a specific month.
   */
  async getForMonth(userId: string, year: number, month: number): Promise<Bucket[]> {
    const records = await db.buckets.where('userId').equals(userId).toArray();
    const filtered = records.filter(r => r.year === year && r.month === month);
    return filtered.map(toBucket);
  },

  /**
   * Get buckets for a month, creating from previous month or defaults if none exist.
   */
  async getOrCreateForMonth(userId: string, year: number, month: number): Promise<Bucket[]> {
    // Check if buckets exist for this month
    let records = await db.buckets.where('userId').equals(userId).toArray();
    records = records.filter(r => r.year === year && r.month === month);
    
    if (records.length > 0) {
      return records.map(toBucket);
    }

    // No buckets for this month - check previous month only
    const allBuckets = await db.buckets.where('userId').equals(userId).toArray();
    const now = new Date();

    // Calculate previous month
    let prevYear = year;
    let prevMonth = month - 1;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear--;
    }

    const prevMonthBuckets = allBuckets.filter(r => r.year === prevYear && r.month === prevMonth);

    if (prevMonthBuckets.length > 0) {
      // Copy from previous month
      const newRecords: DbBucket[] = prevMonthBuckets.map(b => ({
        id: crypto.randomUUID(),
        userId: b.userId,
        year,
        month,
        categoryId: b.categoryId,
        name: b.name,
        allocated: b.allocated,
        icon: b.icon,
        color: b.color,
        createdAt: now,
        updatedAt: now,
      }));
      await db.buckets.bulkAdd(newRecords);
      return newRecords.map(toBucket);
    }

    // No previous month buckets - create from defaults
    const categories = await db.categories.where('userId').equals(userId).toArray();
    const categoryMap = new Map<string, string>();
    categories.forEach(c => categoryMap.set(c.name, c.id));

    const defaultRecords: DbBucket[] = DEFAULT_BUCKETS
      .filter(([_, __, catName]) => categoryMap.has(catName))
      .map(([name, allocated, catName]) => ({
        id: crypto.randomUUID(),
        userId,
        year,
        month,
        categoryId: categoryMap.get(catName),
        name,
        allocated,
        createdAt: now,
        updatedAt: now,
      }));

    if (defaultRecords.length > 0) {
      await db.buckets.bulkAdd(defaultRecords);
      return defaultRecords.map(toBucket);
    }

    return [];
  },

  /**
   * Get all buckets for a user.
   */
  async getAll(userId: string): Promise<Bucket[]> {
    const records = await db.buckets.where('userId').equals(userId).toArray();
    return records.map(toBucket);
  },

  async create(
    userId: string,
    data: { name: string; allocated: number; categoryId?: string; year: number; month: number }
  ): Promise<Bucket> {
    const now = new Date();
    const record: DbBucket = {
      id: crypto.randomUUID(),
      userId,
      year: data.year,
      month: data.month,
      categoryId: data.categoryId || undefined,
      name: data.name,
      allocated: data.allocated,
      createdAt: now,
      updatedAt: now,
    };
    await db.buckets.add(record);
    return toBucket(record);
  },

  async update(
    id: string,
    data: Partial<{ name: string; allocated: number; categoryId: string }>
  ): Promise<Bucket> {
    await db.buckets.update(id, {
      ...data,
      updatedAt: new Date(),
    });
    const record = await db.buckets.get(id);
    if (!record) throw new Error('Bucket not found');
    return toBucket(record);
  },

  async delete(id: string): Promise<void> {
    await db.buckets.delete(id);
  },
};
