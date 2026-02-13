import { db } from './database';
import type { DbUser, DbCategory, DbBucket, DbTransaction, DbMonthlyIncome } from './database';

interface ExportData {
  version: 1;
  exportedAt: string;
  settings: Omit<DbUser, 'passwordHash'>;
  categories: DbCategory[];
  buckets: DbBucket[];
  transactions: DbTransaction[];
  monthlyIncomes: DbMonthlyIncome[];
}

/**
 * Export all data for a user as a JSON object.
 */
export async function exportAllData(userId: string): Promise<string> {
  const user = await db.users.get(userId);
  if (!user) throw new Error('User not found');

  const [categories, buckets, transactions, monthlyIncomes] = await Promise.all([
    db.categories.where('userId').equals(userId).toArray(),
    db.buckets.where('userId').equals(userId).toArray(),
    db.transactions.where('userId').equals(userId).toArray(),
    db.monthlyIncomes.where('userId').equals(userId).toArray(),
  ]);

  // Strip password hash from exported data
  const { passwordHash: _, ...settings } = user;

  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    categories,
    buckets,
    transactions,
    monthlyIncomes,
  };

  return JSON.stringify(data, null, 2);
}

/**
 * Trigger a file download of the exported JSON.
 */
export async function downloadExport(userId: string): Promise<void> {
  const json = await exportAllData(userId);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `budgeting-app-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import data from a JSON string. Merges into the current user's data.
 * Existing records with the same ID will be overwritten.
 */
export async function importData(jsonString: string, userId: string): Promise<{ categories: number; buckets: number; transactions: number; monthlyIncomes: number }> {
  const data = JSON.parse(jsonString) as ExportData;

  if (data.version !== 1) {
    throw new Error(`Unsupported export version: ${data.version}`);
  }

  // Re-assign userId to the current user for all records
  const categories = data.categories.map((c) => ({
    ...c,
    userId,
    createdAt: new Date(c.createdAt),
    updatedAt: new Date(c.updatedAt),
    deletedAt: c.deletedAt ? new Date(c.deletedAt) : undefined,
  }));

  const buckets = data.buckets.map((b) => ({
    ...b,
    userId,
    createdAt: new Date(b.createdAt),
    updatedAt: new Date(b.updatedAt),
  }));

  const transactions = data.transactions.map((t) => ({
    ...t,
    userId,
    date: new Date(t.date),
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
  }));

  const monthlyIncomes = data.monthlyIncomes.map((m) => ({
    ...m,
    userId,
    createdAt: new Date(m.createdAt),
    updatedAt: new Date(m.updatedAt),
  }));

  // Update user settings if present (don't overwrite password or id)
  if (data.settings) {
    await db.users.update(userId, {
      name: data.settings.name,
      currency: data.settings.currency,
      theme: data.settings.theme,
      accentColor: data.settings.accentColor,
      monthlyIncome: data.settings.monthlyIncome,
      savingsTarget: data.settings.savingsTarget,
      payDate: data.settings.payDate,
      updatedAt: new Date(),
    });
  }

  // Bulk upsert all records
  await db.transaction('rw', [db.categories, db.buckets, db.transactions, db.monthlyIncomes], async () => {
    await db.categories.bulkPut(categories);
    await db.buckets.bulkPut(buckets);
    await db.transactions.bulkPut(transactions);
    await db.monthlyIncomes.bulkPut(monthlyIncomes);
  });

  return {
    categories: categories.length,
    buckets: buckets.length,
    transactions: transactions.length,
    monthlyIncomes: monthlyIncomes.length,
  };
}
