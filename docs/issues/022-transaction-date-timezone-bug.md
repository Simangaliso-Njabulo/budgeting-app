# Issue 022: Transaction date goes back one day when editing

**Status:** Fixed

## Location
- [src/components/transactions/TransactionForm.tsx](../../src/components/transactions/TransactionForm.tsx) (lines 246, 247, 259)
- [src/db/transactionService.ts](../../src/db/transactionService.ts) (lines 4-9, 51, 80, 101, 105)
- [src/components/dashboard/SpendingTrend.tsx](../../src/components/dashboard/SpendingTrend.tsx) (lines 9, 12, 35, 48)
- [src/utils/helpers.ts](../../src/utils/helpers.ts) (lines 5-9, 125, 214)

## Root Cause

JavaScript's `toISOString()` method converts a Date to UTC string format (`YYYY-MM-DDTHH:mm:ss.sssZ`). When used with `<input type="date">` value or for comparison, this causes dates to shift back one day for users in timezones west of UTC (e.g., UTC-5).

The primary issue was in **TransactionForm.tsx** line 246:
```typescript
value={form.date.toISOString().split('T')[0]}
```

This converts the local date to UTC, the date then extracts part. For a user in UTC-5, a date of March 8th at midnight local becomes March 7th at 7pm UTC, which then displays as March 7th.

## Fix

### 1. TransactionForm.tsx - Display and parse dates as local time

Added helper functions and updated date handling:
```typescript
function toLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}
```

Updated:
- **Line 246**: Display date using `toLocalDateString(form.date)`
- **Line 247**: Parse user input using `parseLocalDate(e.target.value)`
- **Line 259**: Compare dates using `toLocalDateString()`

### 2. transactionService.ts - Store dates as local midnight

Added helper functions for consistent local date handling:
```typescript
function parseLocalDate(dateStr: string): Date { ... }
function toLocalMidnightEnd(dateStr: string): Date { ... }
```

Updated all date storage and filtering to use local time:
- **Line 51 (create)**: `date: parseLocalDate(data.date)`
- **Line 80 (update)**: `updateData.date = parseLocalDate(data.date)`
- **Lines 101, 105 (getSummary)**: Use local date parsing

### 3. SpendingTrend.tsx - Fix chart date handling

Added helpers and updated:
- **Line 9**: Added `getTxDateString()` helper
- **Line 12**: Added `toLocalDateString()` helper
- **Line 35**: Generate chart days using local dates
- **Line 48**: Compare transaction dates using local time

### 4. helpers.ts - Fix utility functions

Added `toLocalDateString()` helper and updated:
- **Line 125**: `groupTransactionsByDate()` uses local dates
- **Line 214**: `calculateSpendingTrend()` uses local dates

## Build Verification
- TypeScript check: Passed (`npm run build`)

## Refactoring

To eliminate duplication, consolidated all date helper functions into `src/utils/helpers.ts`:

```typescript
export function toLocalDateString(date: Date): string { ... }
export function parseLocalDate(dateStr: string): Date { ... }
export function toLocalMidnightEnd(dateStr: string): Date { ... }
export function getTxDateString(date: Date | string): string { ... }
```

Updated imports in:
- `TransactionForm.tsx` - imports `toLocalDateString`, `parseLocalDate`
- `SpendingTrend.tsx` - imports `toLocalDateString`, `getTxDateString`
- `transactionService.ts` - imports `parseLocalDate`, `toLocalMidnightEnd`
