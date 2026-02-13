import { useState, useEffect, useCallback } from 'react';
import {
  userService,
  getCurrentUserId,
  categoryService,
  bucketService,
  transactionService,
  monthlyIncomeService,
} from '../db';
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
      const userId = getCurrentUserId();
      if (!userId) return;

      const user = await userService.getMe();
      const trends = await monthlyIncomeService.getTrends(
        userId,
        6,
        user.payDate,
        user.monthlyIncome,
        user.savingsTarget
      );
      setTrendData(trends);
    } catch {
      // Trends are non-critical
    }
  }, []);

  const fetchMonthlyIncome = useCallback(async (year: number, month: number) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const user = await userService.getMe();
      const monthlyData = await monthlyIncomeService.get(
        userId,
        year,
        month,
        user.monthlyIncome,
        user.savingsTarget
      );
      setIncome({
        amount: monthlyData.amount,
        savings: monthlyData.savingsTarget,
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
      const userId = getCurrentUserId();
      if (!userId) return;

      await Promise.all([
        userService.update(userId, {
          monthlyIncome: newIncome.amount,
          savingsTarget: 0,
        }),
        monthlyIncomeService.update(userId, selectedPeriod.year, selectedPeriod.month, {
          amount: newIncome.amount,
          savingsTarget: 0,
        }),
      ]);
      setIncome(newIncome);
      fetchTrends();
      showToast('Income updated!', 'success');
    } catch {
      showToast('Failed to update income', 'error');
    }
  };

  // Fetch all data from IndexedDB
  const fetchData = useCallback(async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) throw new Error('Not authenticated');

      const userData = await userService.getMe();
      const userPayDate = userData.payDate || 1;
      setPayDate(userPayDate);

      setIncome({
        amount: userData.monthlyIncome || 0,
        savings: userData.savingsTarget || 0,
        currency: userData.currency,
      });

      const now = new Date();
      const currentCycle = getCurrentPayCycle(now, userPayDate);
      setSelectedPeriod(currentCycle);

      const [categoriesData, bucketsData, transactionsData, monthlyData, trendsData] =
        await Promise.all([
          categoryService.getAll(userId),
          bucketService.getAll(userId),
          transactionService.getAll(userId),
          monthlyIncomeService
            .get(userId, currentCycle.year, currentCycle.month, userData.monthlyIncome, userData.savingsTarget)
            .catch(() => null),
          monthlyIncomeService
            .getTrends(userId, 6, userPayDate, userData.monthlyIncome, userData.savingsTarget)
            .catch(() => []),
        ]);

      if (monthlyData) {
        setIncome({
          amount: monthlyData.amount || 0,
          savings: monthlyData.savingsTarget || 0,
        });
      }

      setTrendData(trendsData);
      setCategories(categoriesData);

      const bucketSpending: Record<string, number> = {};
      transactionsData.forEach((tx: Transaction) => {
        if (tx.bucketId) {
          if (tx.type === 'expense') {
            bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) + tx.amount;
          } else if (tx.type === 'income') {
            bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) - tx.amount;
          }
        }
      });

      setBuckets(
        bucketsData.map((b: Bucket) => ({
          ...b,
          actual: Math.max(0, bucketSpending[b.id] || 0),
        }))
      );

      setTransactions(transactionsData);

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
    // Normalize to local midnight to avoid UTC vs local timezone mismatches
    const d = new Date(tx.date);
    const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
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
  };
}
