import { useState, useEffect, useCallback } from 'react';
import {
  authApi,
  categoriesApi,
  bucketsApi,
  transactionsApi,
  monthlyIncomeApi,
  usersApi,
} from '../services/api';
import type {
  Income,
  Bucket,
  Category,
  Transaction,
  BudgetPeriod,
  MonthlyTrendItem,
} from '../types';
import type { ToastType } from '../components';
import { getCurrentPayCycle, getPayCycleStart, getPayCycleEnd } from '../utils/payCycle';

// Transform API response to frontend types
const transformCategory = (cat: Record<string, unknown>): Category => ({
  id: cat.id as string,
  name: cat.name as string,
  color: cat.color as string,
  icon: cat.icon as string | undefined,
  type: cat.type as 'expense' | 'income' | 'both',
  isDeleted: cat.is_deleted as boolean,
  deletedAt: cat.deleted_at ? new Date(cat.deleted_at as string) : undefined,
  createdAt: cat.created_at ? new Date(cat.created_at as string) : undefined,
  updatedAt: cat.updated_at ? new Date(cat.updated_at as string) : undefined,
});

const transformBucket = (bucket: Record<string, unknown>): Bucket => ({
  id: bucket.id as string,
  name: bucket.name as string,
  allocated: Number(bucket.allocated) || 0,
  actual: 0,
  categoryId: (bucket.category_id as string) || '',
  icon: bucket.icon as string | undefined,
  color: bucket.color as string | undefined,
  createdAt: bucket.created_at ? new Date(bucket.created_at as string) : undefined,
  updatedAt: bucket.updated_at ? new Date(bucket.updated_at as string) : undefined,
});

const transformTransaction = (tx: Record<string, unknown>): Transaction => ({
  id: tx.id as string,
  description: tx.description as string,
  amount: Number(tx.amount) || 0,
  type: tx.type as 'income' | 'expense',
  categoryId: (tx.category_id as string) || '',
  bucketId: tx.bucket_id as string | undefined,
  date: new Date(tx.date as string),
  notes: tx.notes as string | undefined,
  createdAt: new Date(tx.created_at as string),
  updatedAt: new Date(tx.updated_at as string),
});

export { transformCategory, transformBucket, transformTransaction };

interface UseBudgetDataOptions {
  showToast: (message: string, type?: ToastType) => void;
}

export function useBudgetData({ showToast }: UseBudgetDataOptions) {
  const [income, setIncome] = useState<Income>({ amount: 0, savings: 0 });
  const [buckets, setBuckets] = useState<Bucket[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [payDate, setPayDate] = useState(1);
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  });
  const [trendData, setTrendData] = useState<MonthlyTrendItem[]>([]);

  // Recent transactions limit - responsive
  const [recentTxLimit, setRecentTxLimit] = useState(() =>
    window.innerWidth > 1024 ? 7 : 5
  );

  useEffect(() => {
    const handleResize = () => {
      setRecentTxLimit(window.innerWidth > 1024 ? 7 : 5);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Recalculate bucket spending from transactions
  const recalculateBucketSpending = useCallback(
    (txList: Transaction[], bucketList: Bucket[]): Bucket[] => {
      const bucketSpending: Record<string, number> = {};
      txList.forEach((tx) => {
        if (tx.bucketId) {
          if (tx.type === 'expense') {
            bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) + tx.amount;
          } else if (tx.type === 'income') {
            bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) - tx.amount;
          }
        }
      });
      return bucketList.map((b) => ({
        ...b,
        actual: Math.max(0, bucketSpending[b.id] || 0),
      }));
    },
    []
  );

  const fetchTrends = useCallback(async () => {
    try {
      const trendsResponse = await monthlyIncomeApi.getTrends(6);
      setTrendData(
        trendsResponse.data.map((item: Record<string, unknown>) => ({
          year: item.year as number,
          month: item.month as number,
          income: Number(item.income) || 0,
          expenses: Number(item.expenses) || 0,
          savingsTarget: Number(item.savings_target) || 0,
          net: Number(item.net) || 0,
        }))
      );
    } catch {
      // Trends are non-critical
    }
  }, []);

  const fetchMonthlyIncome = useCallback(async (year: number, month: number) => {
    try {
      const monthlyData = await monthlyIncomeApi.get(year, month);
      setIncome({
        amount: Number(monthlyData.amount) || 0,
        savings: Number(monthlyData.savings_target) || 0,
      });
    } catch {
      // Fall back to user defaults
    }
  }, []);

  const handlePeriodChange = useCallback(
    async (year: number, month: number) => {
      setSelectedPeriod({ year, month });
      await fetchMonthlyIncome(year, month);
    },
    [fetchMonthlyIncome]
  );

  const handleUpdateIncome = async (newIncome: Income) => {
    try {
      await Promise.all([
        usersApi.updateMe({
          monthly_income: newIncome.amount,
          savings_target: 0,
        }),
        monthlyIncomeApi.update(selectedPeriod.year, selectedPeriod.month, {
          amount: newIncome.amount,
          savings_target: 0,
        }),
      ]);
      setIncome(newIncome);
      fetchTrends();
      showToast('Income updated!', 'success');
    } catch {
      showToast('Failed to update income', 'error');
    }
  };

  // Fetch all data from API
  const fetchData = useCallback(async () => {
    try {
      const userData = await authApi.getMe();

      const userPayDate = Number(userData.pay_date) || 1;
      setPayDate(userPayDate);

      setIncome({
        amount: Number(userData.monthly_income) || 0,
        savings: Number(userData.savings_target) || 0,
        currency: userData.currency,
      });

      const now = new Date();
      const currentCycle = getCurrentPayCycle(now, userPayDate);
      setSelectedPeriod(currentCycle);

      const [categoriesData, bucketsData, transactionsData, monthlyData, trendsResponse] =
        await Promise.all([
          categoriesApi.getAll(),
          bucketsApi.getAll(),
          transactionsApi.getAll(),
          monthlyIncomeApi.get(currentCycle.year, currentCycle.month).catch(() => null),
          monthlyIncomeApi.getTrends(6).catch(() => ({ data: [] })),
        ]);

      if (monthlyData) {
        setIncome({
          amount: Number(monthlyData.amount) || 0,
          savings: Number(monthlyData.savings_target) || 0,
        });
      }

      setTrendData(
        (trendsResponse.data || []).map((item: Record<string, unknown>) => ({
          year: item.year as number,
          month: item.month as number,
          income: Number(item.income) || 0,
          expenses: Number(item.expenses) || 0,
          savingsTarget: Number(item.savings_target) || 0,
          net: Number(item.net) || 0,
        }))
      );

      setCategories(categoriesData.map(transformCategory));

      const transformedBuckets = bucketsData.map(transformBucket);
      const transformedTransactions = transactionsData.map(transformTransaction);

      const bucketSpending: Record<string, number> = {};
      transformedTransactions.forEach((tx: Transaction) => {
        if (tx.bucketId) {
          if (tx.type === 'expense') {
            bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) + tx.amount;
          } else if (tx.type === 'income') {
            bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) - tx.amount;
          }
        }
      });

      setBuckets(
        transformedBuckets.map((b: Bucket) => ({
          ...b,
          actual: Math.max(0, bucketSpending[b.id] || 0),
        }))
      );

      setTransactions(transformedTransactions);

      return userData;
    } catch (error) {
      console.error('Failed to fetch data:', error);
      showToast('Failed to load data', 'error');
      throw error;
    }
  }, [showToast]);

  // Computed values
  const totalAllocated = buckets.reduce((sum, b) => sum + b.allocated, 0);

  const periodStart = getPayCycleStart(selectedPeriod, payDate);
  const periodEnd = getPayCycleEnd(selectedPeriod, payDate);

  const periodTransactions = transactions.filter((tx) => {
    const txDate = new Date(tx.date);
    return txDate >= periodStart && txDate <= periodEnd;
  });

  const periodSpent = periodTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalSpent = periodSpent;
  const remaining = income.amount - totalAllocated;
  const activeCategories = categories.filter((c) => !c.isDeleted);

  return {
    // State
    income,
    setIncome,
    buckets,
    setBuckets,
    categories,
    setCategories,
    transactions,
    setTransactions,
    payDate,
    setPayDate,
    selectedPeriod,
    trendData,
    recentTxLimit,

    // Functions
    fetchData,
    fetchTrends,
    handlePeriodChange,
    handleUpdateIncome,
    recalculateBucketSpending,

    // Computed
    totalAllocated,
    periodTransactions,
    totalSpent,
    remaining,
    activeCategories,

    // Transform helpers
    transformCategory,
    transformBucket,
    transformTransaction,
  };
}
