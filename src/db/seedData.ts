import { db } from './database';

interface CategorySeed {
  name: string;
  color: string;
  icon: string;
  type: 'expense' | 'income' | 'both';
}

const CATEGORIES_DATA: CategorySeed[] = [
  { name: 'Living Costs', color: '#4A90D9', icon: 'home', type: 'expense' },
  { name: 'Car', color: '#E74C3C', icon: 'car', type: 'expense' },
  { name: 'Expenses', color: '#F39C12', icon: 'receipt', type: 'expense' },
  { name: 'Enjoyment', color: '#9B59B6', icon: 'entertainment', type: 'expense' },
  { name: 'Black Tax', color: '#27AE60', icon: 'family', type: 'expense' },
  { name: 'Savings', color: '#1ABC9C', icon: 'piggy-bank', type: 'expense' },
  { name: 'Unplanned', color: '#95A5A6', icon: 'question', type: 'expense' },
];

// (bucket_name, allocated_amount, category_name)
const BUCKETS_DATA: [string, number, string][] = [
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

/**
 * Seed default categories, buckets, and monthly income for a new user.
 * Called once during registration.
 */
export async function seedUserData(userId: string): Promise<void> {
  const now = new Date();

  // Create categories and build name → id mapping
  const categoryMap = new Map<string, string>();

  const categoryRecords = CATEGORIES_DATA.map((cat) => {
    const id = crypto.randomUUID();
    categoryMap.set(cat.name, id);
    return {
      id,
      userId,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      type: cat.type,
      isDeleted: false,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Create buckets
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const bucketRecords = BUCKETS_DATA.map(([name, allocated, categoryName]) => ({
    id: crypto.randomUUID(),
    userId,
    year: currentYear,
    month: currentMonth,
    categoryId: categoryMap.get(categoryName) || '',
    name,
    allocated,
    createdAt: now,
    updatedAt: now,
  }));

  // Create monthly income record for current month
  const monthlyIncomeRecord = {
    id: crypto.randomUUID(),
    userId,
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    amount: 20000,
    savingsTarget: 5000,
    createdAt: now,
    updatedAt: now,
  };

  // Bulk insert everything
  await db.transaction('rw', [db.categories, db.buckets, db.monthlyIncomes], async () => {
    await db.categories.bulkAdd(categoryRecords);
    await db.buckets.bulkAdd(bucketRecords);
    await db.monthlyIncomes.add(monthlyIncomeRecord);
  });
}
