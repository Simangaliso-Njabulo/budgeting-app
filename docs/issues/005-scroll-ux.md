# Issue 005: Recent Transactions limited display and poor scroll UX

**Status:** ✅ Fixed

## Location
- [src/components/dashboard/RecentTransactions.tsx:33-34](../../src/components/dashboard/RecentTransactions.tsx#L33-L34) (removed slice limit)
- [src/components/dashboard/RecentTransactions.tsx:80-83](../../src/components/dashboard/RecentTransactions.tsx#L80-L83) (dynamic height via CSS variable)
- [src/index.css:3722-3730](../../src/index.css#L3722-L3730) (dynamic container height and scroll-snap)
- [src/index.css:3749-3751](../../src/index.css#L3749-L3751) (snap points on items)

## Root Cause
The Recent Transactions widget had two scrolling limitations:
1. **Limited display**: Only showed 5 (mobile) or 9 (desktop) transactions total, requiring users to navigate to the full Transactions page to see more
2. **Poor scroll UX**: When scrolling, transactions could be cut in half, making it hard to read partially visible items

## Fix
1. Removed `.slice(0, limit)` to display ALL transactions in the scrollable list
2. Changed `limit` purpose from "number of transactions to show" to "number of visible transactions at once"
3. Added CSS custom property `--visible-items` to dynamically calculate container height: `calc(var(--visible-items, 5) * 88px)`
4. Implemented CSS scroll-snap with `scroll-snap-type: y mandatory` on container
5. Added `scroll-snap-align: start` and `scroll-snap-stop: always` to each transaction item
6. Mobile shows 5 transactions at a time, desktop shows 7, but users can scroll to see all
7. Scrolling automatically snaps to show complete transactions, never cutting items in half

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
