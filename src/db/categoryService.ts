import { db, type DbCategory } from './database';
import type { Category } from '../types';

function toCategory(c: DbCategory): Category {
  return {
    id: c.id,
    name: c.name,
    color: c.color,
    icon: c.icon,
    type: c.type,
    isDeleted: c.isDeleted,
    deletedAt: c.deletedAt,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

export const categoryService = {
  async getAll(userId: string): Promise<Category[]> {
    const records = await db.categories
      .where('userId')
      .equals(userId)
      .toArray();
    return records.map(toCategory);
  },

  async create(
    userId: string,
    data: { name: string; color: string; icon?: string; type: string }
  ): Promise<Category> {
    const now = new Date();
    const record: DbCategory = {
      id: crypto.randomUUID(),
      userId,
      name: data.name,
      color: data.color,
      icon: data.icon,
      type: data.type as DbCategory['type'],
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.categories.add(record);
    return toCategory(record);
  },

  async update(
    id: string,
    data: Partial<{ name: string; color: string; icon: string; type: 'expense' | 'income' | 'both' }>
  ): Promise<Category> {
    await db.categories.update(id, {
      ...data,
      updatedAt: new Date(),
    });
    const record = await db.categories.get(id);
    if (!record) throw new Error('Category not found');
    return toCategory(record);
  },

  async delete(id: string): Promise<void> {
    // Hard delete (matching current frontend behavior with hard_delete=true)
    await db.categories.delete(id);
  },
};
