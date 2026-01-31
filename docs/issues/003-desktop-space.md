# Issue 003: Recent Transactions widget not utilizing available desktop space

**Status:** ✅ Fixed

## Location
- [src/App.tsx:134-137](../../src/App.tsx#L134-L137) (responsive limit state)
- [src/App.tsx:428-435](../../src/App.tsx#L428-L435) (window resize handler)
- [src/App.tsx:1047](../../src/App.tsx#L1047) (RecentTransactions component usage)

## Root Cause
The Recent Transactions widget on the dashboard was hardcoded to show only 5 transactions regardless of screen size. This left a lot of empty vertical space below the transactions list on desktop screens, where there was room to display more transactions and provide better visibility into recent activity.

## Fix
1. Added responsive state `recentTxLimit` that initializes based on screen width (7 for desktop >1024px, 5 for mobile ≤1024px)
2. Added `useEffect` hook with window resize event listener to dynamically update the limit when users resize their browser
3. Updated RecentTransactions component to use `recentTxLimit` state instead of hardcoded value 5
4. Desktop users now see 7 recent transactions, better utilizing the available space
5. Mobile users still see 5 transactions to avoid excessive scrolling

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
