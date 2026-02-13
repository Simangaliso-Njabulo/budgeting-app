import { db, type DbMonthlyIncome } from './database';
import type { MonthlyIncome, MonthlyTrendItem } from '../types';
import { getCurrentPayCycle, getPayCycleStart, getNextPeriod } from '../utils/payCycle';

function toMonthlyIncome(r: DbMonthlyIncome): MonthlyIncome {
  return {
    id: r.id,
    year: r.year,
    month: r.month,
    amount: r.amount,
    savingsTarget: r.savingsTarget,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export const monthlyIncomeService = {
  async getAll(userId: string, year?: number): Promise<MonthlyIncome[]> {
    let records: DbMonthlyIncome[];
    if (year) {
      records = await db.monthlyIncomes
        .where('[userId+year+month]')
        .between([userId, year, 1], [userId, year, 12])
        .toArray();
    } else {
      records = await db.monthlyIncomes
        .where('userId')
        .equals(userId)
        .toArray();
    }
    return records.map(toMonthlyIncome);
  },

  /**
   * Get (or auto-create) monthly income for a specific month.
   */
  async get(
    userId: string,
    year: number,
    month: number,
    defaultIncome?: number,
    defaultSavings?: number
  ): Promise<MonthlyIncome> {
    // Try to find existing record
    const records = await db.monthlyIncomes
      .where('[userId+year+month]')
      .equals([userId, year, month])
      .toArray();

    if (records.length > 0) {
      return toMonthlyIncome(records[0]);
    }

    // Auto-create from user defaults
    const now = new Date();
    const record: DbMonthlyIncome = {
      id: crypto.randomUUID(),
      userId,
      year,
      month,
      amount: defaultIncome ?? 0,
      savingsTarget: defaultSavings ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.monthlyIncomes.add(record);
    return toMonthlyIncome(record);
  },

  /**
   * Update (or create) monthly income for a specific month.
   */
  async update(
    userId: string,
    year: number,
    month: number,
    data: { amount?: number; savingsTarget?: number }
  ): Promise<MonthlyIncome> {
    const records = await db.monthlyIncomes
      .where('[userId+year+month]')
      .equals([userId, year, month])
      .toArray();

    if (records.length > 0) {
      const record = records[0];
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (data.amount !== undefined) updateData.amount = data.amount;
      if (data.savingsTarget !== undefined) updateData.savingsTarget = data.savingsTarget;
      await db.monthlyIncomes.update(record.id, updateData);
      const updated = await db.monthlyIncomes.get(record.id);
      return toMonthlyIncome(updated!);
    }

    // Create new
    const now = new Date();
    const record: DbMonthlyIncome = {
      id: crypto.randomUUID(),
      userId,
      year,
      month,
      amount: data.amount ?? 0,
      savingsTarget: data.savingsTarget ?? 0,
      createdAt: now,
      updatedAt: now,
    };
    await db.monthlyIncomes.add(record);
    return toMonthlyIncome(record);
  },

  /**
   * Get income vs expense trends for the last N pay cycles.
   * Ported from backend/app/routers/monthly_income.py getTrends()
   */
  async getTrends(
    userId: string,
    months: number = 6,
    payDate: number = 1,
    defaultIncome: number = 0,
    defaultSavings: number = 0
  ): Promise<MonthlyTrendItem[]> {
    const today = new Date();
    const currentCycle = getCurrentPayCycle(today, payDate);

    // Build list of pay cycle periods (going back N months)
    const monthPeriods: { year: number; month: number }[] = [];
    let cy = currentCycle.year;
    let cm = currentCycle.month;
    for (let i = 0; i < months; i++) {
      monthPeriods.push({ year: cy, month: cm });
      cm -= 1;
      if (cm === 0) {
        cm = 12;
        cy -= 1;
      }
    }
    monthPeriods.reverse(); // oldest first

    // Get all monthly income records for this user
    const allIncomeRecords = await db.monthlyIncomes
      .where('userId')
      .equals(userId)
      .toArray();
    const incomeMap = new Map<string, DbMonthlyIncome>();
    for (const r of allIncomeRecords) {
      incomeMap.set(`${r.year}-${r.month}`, r);
    }

    // Calculate date range for transaction query
    const first = monthPeriods[0];
    const last = monthPeriods[monthPeriods.length - 1];
    const earliestDate = getPayCycleStart(first, payDate);
    const afterLast = getNextPeriod(last);
    const latestDate = getPayCycleStart(afterLast, payDate);

    // Fetch all transactions in the date range
    const txRecords = await db.transactions
      .where('userId')
      .equals(userId)
      .toArray();

    // Filter to date range
    const filteredTx = txRecords.filter(
      (tx) => tx.date >= earliestDate && tx.date < latestDate
    );

    // Assign each transaction to its pay cycle and aggregate
    const txTotals = new Map<string, number>();
    for (const tx of filteredTx) {
      const cycle = getCurrentPayCycle(tx.date, payDate);
      const key = `${cycle.year}-${cycle.month}-${tx.type}`;
      txTotals.set(key, (txTotals.get(key) || 0) + tx.amount);
    }

    // Build trend data
    const trendData: MonthlyTrendItem[] = [];
    for (const { year, month } of monthPeriods) {
      const incomeRecord = incomeMap.get(`${year}-${month}`);
      const monthIncome = incomeRecord ? incomeRecord.amount : defaultIncome;
      const monthSavings = incomeRecord ? incomeRecord.savingsTarget : defaultSavings;
      const monthExpenses = txTotals.get(`${year}-${month}-expense`) || 0;
      const monthTxIncome = txTotals.get(`${year}-${month}-income`) || 0;

      trendData.push({
        year,
        month,
        income: monthIncome + monthTxIncome,
        expenses: monthExpenses,
        savingsTarget: monthSavings,
        net: monthIncome + monthTxIncome - monthExpenses,
      });
    }

    return trendData;
  },
};
