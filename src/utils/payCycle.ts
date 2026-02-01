import type { BudgetPeriod } from '../types';

/** Clamp a day to the last day of a given month (1-indexed month). */
function clampDay(year: number, month: number, day: number): number {
  // new Date(year, month, 0) gives the last day of that month (month is 1-12)
  const lastDay = new Date(year, month, 0).getDate();
  return Math.min(day, lastDay);
}

/** Get the next period (month + 1, wrapping year). */
export function getNextPeriod(period: BudgetPeriod): BudgetPeriod {
  return period.month === 12
    ? { year: period.year + 1, month: 1 }
    : { year: period.year, month: period.month + 1 };
}

/** Get the previous period (month - 1, wrapping year). */
export function getPrevPeriod(period: BudgetPeriod): BudgetPeriod {
  return period.month === 1
    ? { year: period.year - 1, month: 12 }
    : { year: period.year, month: period.month - 1 };
}

/** Get the start date of a pay cycle period. */
export function getPayCycleStart(period: BudgetPeriod, payDate: number): Date {
  const day = clampDay(period.year, period.month, payDate);
  return new Date(period.year, period.month - 1, day);
}

/** Get the end date of a pay cycle (day before next cycle starts). */
export function getPayCycleEnd(period: BudgetPeriod, payDate: number): Date {
  const next = getNextPeriod(period);
  const nextStart = getPayCycleStart(next, payDate);
  return new Date(nextStart.getTime() - 86_400_000);
}

/**
 * Determine which pay cycle a given date falls into.
 *
 * If the day of the date is >= the (clamped) pay date for that month,
 * the date is in that month's pay cycle. Otherwise it's in the previous month's.
 *
 * Examples (payDate = 28):
 *   Feb 1  → January cycle  (1 < 28)
 *   Jan 28 → January cycle  (28 >= 28)
 *   Feb 28 → February cycle (28 >= 28)
 *
 * When payDate = 1, this is equivalent to calendar months.
 */
export function getCurrentPayCycle(date: Date, payDate: number): BudgetPeriod {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const clamped = clampDay(year, month, payDate);

  if (day >= clamped) {
    return { year, month };
  }
  return month === 1
    ? { year: year - 1, month: 12 }
    : { year, month: month - 1 };
}

/**
 * Format the pay cycle date range for display.
 * Returns e.g. "Jan 28 – Feb 27" or null if payDate === 1 (calendar months).
 */
export function formatPayCycleRange(period: BudgetPeriod, payDate: number): string | null {
  if (payDate === 1) return null;

  const start = getPayCycleStart(period, payDate);
  const end = getPayCycleEnd(period, payDate);

  const shortMonth = (d: Date) =>
    d.toLocaleString('default', { month: 'short' });

  return `${shortMonth(start)} ${start.getDate()} – ${shortMonth(end)} ${end.getDate()}`;
}
