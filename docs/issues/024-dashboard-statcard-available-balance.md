# Issue 024: Dashboard StatCard Available Balance Incorrect

**Status:** ✅ Fixed

## Location
- [src/hooks/useBudgetData.ts](../../src/hooks/useBudgetData.ts) (periodIncome calculation)
- [src/App.tsx](../../src/App.tsx) (StatCard total prop)

## Root Cause
The "Available" balance in the Total Spent stat card was not including income transactions. The calculation used only the configured `monthlyIncome` but the running balance in TransactionList also adds income transactions to the total.

For example, with:
- Configured monthly income: 35781.39
- Income transactions: 295.98 + 1630 = 1925.98
- Expenses: 35725.07

**Old calculation:**
- Total Spent: 35725.07
- Total (statTotal): 35781.39
- Available: 35781.39 - 35725.07 = 56.32 ❌

**Running balance (correct):**
- 35781.39 + 1925.98 - 35725.07 = 1982.30 ✓

## Fix
Added `periodIncome` calculation to include income transactions in the stat card's total:

1. In `useBudgetData.ts`:
   - Added `periodIncome` computed value that sums all income-type transactions in the current period

2. In `App.tsx`:
   - Changed StatCard `total` prop from `income.amount` to `income.amount + periodIncome`
   - This makes the "Available" value = (configured income + income transactions) - expenses

Now the stat card's Available matches the running balance shown on individual transactions.

## Verification
- Total Spent card shows correct available balance
- Balance updates correctly after:
  - Adding expense transactions
  - Adding income transactions
  - Bucket allocations
  - Transfers
