import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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

  const [recentTxLimit, setRecentTxLimit] = useState(() =>
    window.innerWidth > 1024 ? 7 : 5
  );

  const transactionsRef = useRef(transactions);
  transactionsRef.current = transactions;

  useEffect(() => {
    const handleResize = () => {
      setRecentTxLimit(window.innerWidth > 1024 ? 7 : 5);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      const userId = getCurrentUserId();
      setSelectedPeriod({ year, month });

      if (!userId) return;

      await fetchMonthlyIncome(year, month);

      const newBuckets = await bucketService.getOrCreateForMonth(userId, year, month);
      
      const periodStart = getPayCycleStart({ year, month }, payDate);
      const periodEnd = getPayCycleEnd({ year, month }, payDate);
      const periodTxs = transactionsRef.current.filter((tx) => {
        const d = new Date(tx.date);
        const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return txDate >= periodStart && txDate <= periodEnd;
      });

      const bucketSpending: Record<string, number> = {};
      periodTxs.forEach((tx: Transaction) => {
        if (tx.bucketId) {
          if (Object.hasOwn(bucketSpending, tx.bucketId)) {
            if (tx.type === 'expense') {
              bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) + tx.amount;
            } else if (tx.type === 'income') {
              bucketSpending[tx.bucketId] = (bucketSpending[tx.bucketId] || 0) - tx.amount;
            }
          } else {
            if (tx.type === 'expense') {
              bucketSpending[tx.bucketId] = tx.amount;
            } else if (tx.type === 'income') {
              bucketSpending[tx.bucketId] = -tx.amount;
            }
          }
        }
      });

      setBuckets(
        newBuckets.map((b: Bucket) => ({
          ...b,
          actual: Math.max(0, bucketSpending[b.id] || 0),
        }))
      );
    },
    [fetchMonthlyIncome, payDate]
  );

  const handleUpdateIncome = useCallback(async (newIncome: Income) => {
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
  }, [selectedPeriod, fetchTrends, showToast]);

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
          bucketService.getOrCreateForMonth(userId, currentCycle.year, currentCycle.month),
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

      const periodStart = getPayCycleStart(currentCycle, userPayDate);
      const periodEnd = getPayCycleEnd(currentCycle, userPayDate);
      const periodTransactions = transactionsData.filter((tx: Transaction) => {
        const d = new Date(tx.date);
        const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        return txDate >= periodStart && txDate <= periodEnd;
      });

      const bucketSpending: Record<string, number> = {};
      periodTransactions.forEach((tx: Transaction) => {
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

  const totalAllocated = useMemo(() => buckets.reduce((sum, b) => sum + b.allocated, 0), [buckets]);

  const periodStart = useMemo(() => getPayCycleStart(selectedPeriod, payDate), [selectedPeriod, payDate]);
  const periodEnd = useMemo(() => getPayCycleEnd(selectedPeriod, payDate), [selectedPeriod, payDate]);

  const periodTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const d = new Date(tx.date);
      const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return txDate >= periodStart && txDate <= periodEnd;
    });
  }, [transactions, periodStart, periodEnd]);

  const periodIncome = useMemo(() => {
    return periodTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [periodTransactions]);

  const periodSpent = useMemo(() => {
    return periodTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [periodTransactions]);

  const remaining = useMemo(() => income.amount - totalAllocated, [income.amount, totalAllocated]);
  const activeCategories = useMemo(() => categories.filter((c) => !c.isDeleted), [categories]);

  return {
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

    fetchData,
    fetchTrends,
    handlePeriodChange,
    handleUpdateIncome,
    recalculateBucketSpending,

    totalAllocated,
    periodTransactions,
    periodSpent,
    periodIncome,
    remaining,
    activeCategories,
  };
}
