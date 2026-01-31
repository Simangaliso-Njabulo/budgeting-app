# Issue 009: Show running balance for each transaction

**Status:** ✅ Fixed (initial implementation)

## Location
- [src/components/transactions/TransactionList.tsx](../../src/components/transactions/TransactionList.tsx)
- [src/App.tsx](../../src/App.tsx)

## Root Cause
No running balance is currently shown. Each transaction only displays its own amount. The user wants to see how much was left at each point in time.

## Fix
Added `monthlyIncome` prop to `TransactionList`. Running balance is computed by sorting transactions chronologically, starting from monthly income, subtracting expenses and adding income transactions. Each transaction item shows "Bal: R X,XXX.XX" in muted text below the amount. Negative balances are highlighted in red.
