# Issue Tracking

This document tracks all issues, bugs, and enhancements for the budgeting app.

## Issue 1: Dashboard layout - Total Spent and Over Budget Alerts wasting space

- **Status:** [x] Fixed
- **Location:**
  - [src/App.tsx:984-1033](../src/App.tsx#L984-L1033) (dashboard component structure)
  - [src/index.css:3562-3654](../src/index.css#L3562-L3654) (dashboard styling)
- **Root Cause:** The "Total Spent" stat-card and "Over Budget Alerts" glass-card were rendered one below the other (stacked vertically) on all screen sizes. This wasted horizontal space on desktop screens where both cards could comfortably fit side by side, making the dashboard feel longer than necessary and reducing information density.
- **Fix:**
  1. Wrapped both cards in a container div with class `dashboard-top-cards`
  2. Added CSS Grid layout to display cards side-by-side on desktop:
     - Desktop (>1024px): `grid-template-columns: 1fr 1fr` with 20px gap
     - Mobile (≤1024px): `grid-template-columns: 1fr` (stacked)
  3. Removed `margin-top: 20px` from `.over-budget-alerts` since the parent container now handles spacing
  4. Added the container's `margin-top: 20px` to maintain proper spacing from the MonthSelector above
- **Build Verification:**
  - TypeScript check: Passed (`npx tsc --noEmit`)
  - Production build: Succeeded (`npx vite build`)

## Issue 2: Unwanted cursors on View All and FAB buttons

- **Status:** [x] Fixed
- **Location:**
  - [src/index.css:3691-3704](../src/index.css#L3691-L3704) (Recent Transactions "View All" button)
  - [src/index.css:2533-2551](../src/index.css#L2533-L2551) (FAB "Add Transaction" button)
- **Root Cause:** The buttons had two cursor-related issues:
  1. **Pointer cursor**: Both buttons had `cursor: pointer` which showed a hand cursor when hovering
  2. **Text selection cursor**: The button text was selectable, causing an I-beam (text selection) cursor to appear when hovering over the text content at different positions (e.g., "Vi|ew All", "View A|ll"). This was especially noticeable on the "View All" button where the cursor appeared anywhere within the text, and on the FAB where it appeared at the start/end of "Add Transaction".
- **Fix:**
  1. Changed `cursor: pointer` to `cursor: default` for both `.recent-transactions-view-all` and `.fab` buttons
  2. Added `user-select: none` to both buttons to prevent text selection and eliminate the I-beam cursor
  3. Both buttons remain fully functional and clickable, but now display only the default cursor with no text selection capability
- **Build Verification:**
  - TypeScript check: Passed (`npx tsc --noEmit`)
  - Production build: Succeeded (`npx vite build`)

## Issue 3: Recent Transactions widget not utilizing available desktop space

- **Status:** [x] Fixed
- **Location:**
  - [src/App.tsx:134-137](../src/App.tsx#L134-L137) (responsive limit state)
  - [src/App.tsx:428-435](../src/App.tsx#L428-L435) (window resize handler)
  - [src/App.tsx:1047](../src/App.tsx#L1047) (RecentTransactions component usage)
- **Root Cause:** The Recent Transactions widget on the dashboard was hardcoded to show only 5 transactions regardless of screen size. This left a lot of empty vertical space below the transactions list on desktop screens, where there was room to display more transactions and provide better visibility into recent activity.
- **Fix:**
  1. Added responsive state `recentTxLimit` that initializes based on screen width (7 for desktop >1024px, 5 for mobile ≤1024px)
  2. Added `useEffect` hook with window resize event listener to dynamically update the limit when users resize their browser
  3. Updated RecentTransactions component to use `recentTxLimit` state instead of hardcoded value 5
  4. Desktop users now see 7 recent transactions, better utilizing the available space
  5. Mobile users still see 5 transactions to avoid excessive scrolling
- **Build Verification:**
  - TypeScript check: Passed (`npx tsc --noEmit`)
  - Production build: Succeeded (`npx vite build`)

## Issue 4: Recent Transactions not scrollable and missing running balance

- **Status:** [x] Fixed
- **Location:**
  - [src/components/dashboard/RecentTransactions.tsx](../src/components/dashboard/RecentTransactions.tsx) (component implementation)
  - [src/index.css:3722-3748](../src/index.css#L3722-L3748) (scrollable container styling)
  - [src/index.css:3810-3843](../src/index.css#L3810-L3843) (balance display styling)
  - [src/App.tsx:1055](../src/App.tsx#L1055) (monthlyIncome prop)
- **Root Cause:** The Recent Transactions widget had two UX limitations:
  1. **No scrolling**: When displaying 9 transactions on desktop, the list was not scrollable, making it impossible to see older transactions without navigating to the full Transactions page
  2. **Missing running balance**: Unlike the Transactions page, the dashboard Recent Transactions didn't show the running balance after each transaction, making it harder to track account status at a glance
- **Fix:**
  1. Added scrollable container to `.recent-transactions-list` with `max-height: 500px` and `overflow-y: auto`
  2. Styled custom scrollbar with purple accent color to match the app theme
  3. Added `monthlyIncome` prop to RecentTransactions component
  4. Implemented running balance calculation (identical logic to TransactionList) that starts from monthly income and adjusts for each transaction chronologically
  5. Added balance display below each transaction amount showing "Bal: {amount}" with red color for negative balances
  6. Created `.recent-transaction-amounts` container and `.recent-transaction-balance` style for proper layout
  7. Updated App.tsx to pass `income.amount` as `monthlyIncome` prop
- **Build Verification:**
  - TypeScript check: Passed (`npx tsc --noEmit`)
  - Production build: Succeeded (`npx vite build`)

## Issue 5: Recent Transactions limited display and poor scroll UX

- **Status:** [x] Fixed
- **Location:**
  - [src/components/dashboard/RecentTransactions.tsx:33-34](../src/components/dashboard/RecentTransactions.tsx#L33-L34) (removed slice limit)
  - [src/components/dashboard/RecentTransactions.tsx:80-83](../src/components/dashboard/RecentTransactions.tsx#L80-L83) (dynamic height via CSS variable)
  - [src/index.css:3722-3730](../src/index.css#L3722-L3730) (dynamic container height and scroll-snap)
  - [src/index.css:3749-3751](../src/index.css#L3749-L3751) (snap points on items)
- **Root Cause:** The Recent Transactions widget had two scrolling limitations:
  1. **Limited display**: Only showed 5 (mobile) or 9 (desktop) transactions total, requiring users to navigate to the full Transactions page to see more
  2. **Poor scroll UX**: When scrolling, transactions could be cut in half, making it hard to read partially visible items
- **Fix:**
  1. Removed `.slice(0, limit)` to display ALL transactions in the scrollable list
  2. Changed `limit` purpose from "number of transactions to show" to "number of visible transactions at once"
  3. Added CSS custom property `--visible-items` to dynamically calculate container height: `calc(var(--visible-items, 5) * 88px)`
  4. Implemented CSS scroll-snap with `scroll-snap-type: y mandatory` on container
  5. Added `scroll-snap-align: start` and `scroll-snap-stop: always` to each transaction item
  6. Mobile shows 5 transactions at a time, desktop shows 7, but users can scroll to see all
  7. Scrolling automatically snaps to show complete transactions, never cutting items in half
- **Build Verification:**
  - TypeScript check: Passed (`npx tsc --noEmit`)
  - Production build: Succeeded (`npx vite build`)
