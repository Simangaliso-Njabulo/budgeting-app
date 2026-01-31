# Issue 010: Running balance increases instead of decreasing

**Status:** ✅ Fixed

## Location
- [src/components/transactions/TransactionList.tsx](../../src/components/transactions/TransactionList.tsx) (balance computation + display order)
- [src/App.tsx](../../src/App.tsx)

## Root Cause
`filteredTransactions` includes ALL months' transactions (no period filter by default), but `monthlyIncome` is only the current month's income. So the balance = `currentMonthIncome - ALL_historical_expenses`, producing wrong values.

## Fix
Two changes:
1. Balance computation now filters to only the `selectedPeriod`'s transactions before computing.
2. Transactions within each day group are sorted by creation time (oldest first) so same-day transactions display in the order they were logged and balance decreases within the group.
