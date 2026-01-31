# Issue 007: Transaction summary income shows 0 on transactions page

**Status:** ✅ Fixed

## Location
- [src/components/transactions/TransactionSummary.tsx](../../src/components/transactions/TransactionSummary.tsx)
- [src/App.tsx](../../src/App.tsx) (line ~1318)

## Root Cause
`TransactionSummary` calculates "Income" by summing transactions where `type === 'income'`. But the user's monthly income (salary) is stored in the `income` state from the monthly_income API -- it is NOT a transaction of type 'income'. So the Income row shows 0 unless the user has manually logged income transactions.

## Fix
Added `monthlyIncome` prop to `TransactionSummary`. Income now = monthlyIncome + any income-type transactions. Net = totalIncome - totalExpenses.
