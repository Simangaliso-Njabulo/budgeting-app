# Issue: Buckets and Categories Not Month-Aware

**Status:** DONE

## Problem Description

Buckets and their related category progress displays are not aware of the selected month/time period. This causes data from previous months to "spill over" into the current month.

## Symptoms

1. **Buckets Page**: When navigating to a new month, bucket "actual" (spent) shows spending from all previous months combined, not just the selected month. Users see $0 available even in a fresh month.

2. **Categories Page**: Category progress bars and stats show cumulative spending from all months, not just the current period.

3. **Donut Chart**: Overall category breakdown shows wrong allocated/actual values.

## Root Cause

### 1. Bucket Data Model
- `DbBucket` schema (`src/db/database.ts:33-43`) had no `year` or `month` fields
- Buckets were global - one set per user, shared across all months

### 2. Bucket Spending Calculation
- In `useBudgetData.ts:187-202`, bucket `actual` was computed from **ALL transactions**, not filtered by the selected period
- The code had `periodTransactions` (filtered by month) but wasn't using it for bucket calculations

### 3. Category Stats Derive from Buckets
- Category progress (`CategoryGrid.tsx:115-120`) sums bucket allocations and actuals
- Since buckets were global, category stats accumulated across all months

## Expected Behavior

When user selects a specific month (e.g., March 2026):
- Buckets should show allocations and spending **for that month only**
- Category progress bars should reflect **that month's** activity
- Switching months should show fresh, period-specific data

## Solution Implemented

### 1. Database Schema (`src/db/database.ts`)
- Added `year` and `month` fields to `DbBucket` interface
- Updated bucket index to `[userId+year+month]`
- Incremented version to 2

### 2. Type Definition (`src/types/index.ts`)
- Added `year` and `month` to `Bucket` interface

### 3. Bucket Service (`src/db/bucketService.ts`)
- Updated `getAll()` to accept year/month parameters
- Added `getOrCreateForMonth()` - gets existing buckets or creates from previous month
- Added `migrateToMonthAware()` - one-time migration for old global buckets
- Updated `create()` to accept year/month

### 4. useBudgetData (`src/hooks/useBudgetData.ts`)
- Initial fetch: calls `bucketService.getOrCreateForMonth()` with current period
- Period change: fetches new buckets and recalculates actuals from period transactions
- Bucket actuals now calculated from `periodTransactions` (not all transactions)

### 5. useBucketActions (`src/hooks/useBucketActions.ts`)
- Added `selectedPeriod` parameter
- Creates buckets with year/month when creating new ones

### 6. App.tsx
- Passes `selectedPeriod` to `useBucketActions`

### 7. seedData.ts
- Added year/month to initial bucket creation

## Files Modified

| File | Changes |
|------|---------|
| `src/db/database.ts` | Added year/month to DbBucket, updated index, version 2 |
| `src/types/index.ts` | Added year/month to Bucket type |
| `src/db/bucketService.ts` | Full rewrite - CRUD with year/month, auto-create, migration |
| `src/hooks/useBudgetData.ts` | Use getOrCreateForMonth, period-filtered transactions |
| `src/hooks/useBucketActions.ts` | Pass selectedPeriod to create |
| `src/App.tsx` | Pass selectedPeriod to useBucketActions |
| `src/db/seedData.ts` | Added year/month to seed buckets |

## Verification

- Build passes: `npm run build` ✓
- Tests pass: `npm test` ✓ (228 tests)
- TypeScript: No errors

## Additional Fixes

### Import Data Migration
When importing backup data, buckets are now migrated to month-aware format immediately during import, not just on page refresh.

### MonthSelector on Buckets Page
Added MonthSelector component to the buckets page (same as dashboard) so users can navigate between months and see buckets for each period.

### Files Modified (Additional)

| File | Change |
|------|--------|
| `src/App.tsx` | Added MonthSelector to buckets page |
| `src/db/importExport.ts` | Added migration during import |
