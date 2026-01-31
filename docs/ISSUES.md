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
