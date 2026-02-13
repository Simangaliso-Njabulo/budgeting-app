import { db, type DbBucket } from './database';
import type { Bucket } from '../types';

function toBucket(b: DbBucket): Bucket {
  return {
    id: b.id,
    name: b.name,
    allocated: b.allocated,
    actual: 0, // computed from transactions in useBudgetData
    categoryId: b.categoryId || '',
    icon: b.icon,
    color: b.color,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

export const bucketService = {
  async getAll(userId: string): Promise<Bucket[]> {
    const records = await db.buckets
      .where('userId')
      .equals(userId)
      .toArray();
    return records.map(toBucket);
  },

  async create(
    userId: string,
    data: { name: string; allocated: number; categoryId?: string }
  ): Promise<Bucket> {
    const now = new Date();
    const record: DbBucket = {
      id: crypto.randomUUID(),
      userId,
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
