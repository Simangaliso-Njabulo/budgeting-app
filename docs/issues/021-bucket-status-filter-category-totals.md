# Issue 021: Bucket page — status filter and category totals when filtering

**Status:** Fixed

## Location
- [src/App.tsx](../../src/App.tsx) (useBucketFilters hook, Buckets tab rendering)

## Root Cause
1. **No status filter**: The Buckets page only has a category filter and search. There's no way to filter buckets by budget status (over budget vs within budget).

2. **No category totals**: When filtering by a specific category, the budget summary still shows global totals (total income, total allocated, unallocated). The user can't see how much is allocated vs spent for the selected category.

## Fix

### 1. Status filter
Added `statusFilter` state to `useBucketFilters` hook with options:
- `""` (All Status)
- `"over"` (Over Budget — `actual > allocated`)
- `"within"` (Within Budget — `actual <= allocated`)

Added as a second filter dropdown in the FilterBar on the Buckets page.

### 2. Category totals
When a category filter is active:
- The global budget summary (Total Income / Allocated / Unallocated) is hidden
- A category-specific summary is shown instead:
  - **Category Allocated**: Total allocated across all buckets in that category
  - **Spent**: Total actual spending in that category
  - **Remaining**: Allocated minus spent (shows positive/negative styling)
- The summary card has a left border in the category's color
- A badge shows either "X left in Category" or "Category over budget by X"

The IIFE pattern `{nav.activeTab === "buckets" && (() => { ... })()}` was used to compute category totals inline before rendering, avoiding extra state or hooks.

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
- Tests: 251 passed (`npx vitest run`)
