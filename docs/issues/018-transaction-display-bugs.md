# Issue 018: Transaction display bugs — decimal separator, refresh, order, trends

**Status:** Fixed

## Location
- [src/components/transactions/TransactionForm.tsx](../../src/components/transactions/TransactionForm.tsx) (amount input blur formatting)
- [src/hooks/useBudgetData.ts](../../src/hooks/useBudgetData.ts) (periodTransactions date filter)
- [src/components/dashboard/RecentTransactions.tsx](../../src/components/dashboard/RecentTransactions.tsx) (sort order)
- [backend/app/routers/monthly_income.py](../../backend/app/routers/monthly_income.py) (trends endpoint)
- [src/App.tsx](../../src/App.tsx) (onUpdatePayDate handler)

## Root Cause
Four related display issues:

1. **Decimal separator inconsistency**: `handleAmountBlur` called `.toLocaleString()` which uses the browser locale (ZA uses comma). The input only accepts dots via regex, so editing shows `20.3` but blurring displays `20,3`.

2. **Recent Transactions not updating after save**: Transaction dates from the API are parsed as UTC midnight (`new Date("2026-02-01")`), but `getPayCycleStart`/`getPayCycleEnd` create LOCAL midnight dates. For users in UTC+ timezones (e.g., South Africa UTC+2), boundary-day transactions could be excluded from the period filter.

3. **Recent Transactions wrong order**: Same-date transactions had no secondary sort key. Locally-added transactions (appended to array) could appear in a different order than after reload (fetched from API in creation order).

4. **Monthly Trends showing calendar months**: The backend `get_monthly_trends()` endpoint used `extract("year"/"month")` SQL to group transactions by calendar month boundaries, completely ignoring the user's `pay_date` setting.

5. **Pay date change not updating period**: When changing `pay_date` in Settings, only `payDate` state updated but `selectedPeriod` stayed on the old period (e.g., changing from payDate=1 to payDate=28 while viewing February left the user on "February" which now means Feb 28 - Mar 27 instead of navigating to the correct January cycle).

## Fix

### 1. Decimal separator
Changed `handleAmountBlur` from `.toLocaleString()` to `.toFixed(2)` for consistent dot formatting in the input field.

### 2. Timezone date comparison
Normalized transaction dates to local midnight before comparing with period boundaries:
```typescript
const d = new Date(tx.date);
const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
```

### 3. Sort order
Added `createdAt` as secondary sort key in RecentTransactions:
```typescript
.sort((a, b) => {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
  if (dateDiff !== 0) return dateDiff;
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
});
```

### 4. Monthly Trends pay cycle
Rewrote the backend `get_monthly_trends()` endpoint to:
- Use `_current_pay_cycle()` to determine which pay cycle each transaction belongs to
- Fetch individual transactions instead of using SQL `extract()` grouping
- Aggregate by pay cycle period instead of calendar month
- Calculate date ranges using `_pay_cycle_start()` with the user's `pay_date`

### 5. Pay date navigation
Added `getCurrentPayCycle()` call in `onUpdatePayDate` handler to navigate to the correct current period after changing pay date.

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
- Tests: 251 passed (`npx vitest run`)
