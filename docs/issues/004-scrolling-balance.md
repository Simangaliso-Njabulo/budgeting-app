# Issue 004: Recent Transactions not scrollable and missing running balance

**Status:** ✅ Fixed

## Location
- [src/components/dashboard/RecentTransactions.tsx](../../src/components/dashboard/RecentTransactions.tsx) (component implementation)
- [src/index.css:3722-3748](../../src/index.css#L3722-L3748) (scrollable container styling)
- [src/index.css:3810-3843](../../src/index.css#L3810-L3843) (balance display styling)
- [src/App.tsx:1055](../../src/App.tsx#L1055) (monthlyIncome prop)

## Root Cause
The Recent Transactions widget had two UX limitations:
1. **No scrolling**: When displaying 9 transactions on desktop, the list was not scrollable, making it impossible to see older transactions without navigating to the full Transactions page
2. **Missing running balance**: Unlike the Transactions page, the dashboard Recent Transactions didn't show the running balance after each transaction, making it harder to track account status at a glance

## Fix
1. Added scrollable container to `.recent-transactions-list` with `max-height: 500px` and `overflow-y: auto`
2. Styled custom scrollbar with purple accent color to match the app theme
3. Added `monthlyIncome` prop to RecentTransactions component
4. Implemented running balance calculation (identical logic to TransactionList) that starts from monthly income and adjusts for each transaction chronologically
5. Added balance display below each transaction amount showing "Bal: {amount}" with red color for negative balances
6. Created `.recent-transaction-amounts` container and `.recent-transaction-balance` style for proper layout
7. Updated App.tsx to pass `income.amount` as `monthlyIncome` prop

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
