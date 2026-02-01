# Issue 017: Month selector not aligned with pay cycle

**Status:** Fixed

## Location
- [src/hooks/useBudgetData.ts](../../src/hooks/useBudgetData.ts) (period initialization, transaction filtering)
- [src/components/MonthSelector.tsx](../../src/components/MonthSelector.tsx) (Today button, display)
- [src/components/Settings.tsx](../../src/components/Settings.tsx) (pay date setting)
- [src/utils/payCycle.ts](../../src/utils/payCycle.ts) (pay cycle computation utilities)
- [backend/app/models/user.py](../../backend/app/models/user.py) (pay_date column)
- [backend/app/schemas/user.py](../../backend/app/schemas/user.py) (pay_date in UserUpdate/UserResponse)
- [src/services/api.ts](../../src/services/api.ts) (pay_date in usersApi.updateMe)
- [src/App.tsx](../../src/App.tsx) (wiring payDate to MonthSelector + Settings)

## Root Cause
The app defaults to the current calendar month and filters transactions by calendar month boundaries. For users paid mid-month (e.g., 28th), their budget cycle spans two calendar months (Jan 28 - Feb 27). On Feb 1, the app shows February instead of the active pay cycle (January).

## Fix

Added a `pay_date` user setting (day of month, 1-31) that defines budget periods as pay cycles instead of calendar months.

### Backend
- Added `pay_date` Integer column (default=1) to User model
- Added `pay_date` to `UserUpdate` (optional, validated 1-31) and `UserResponse` schemas

### Frontend
- **`src/utils/payCycle.ts`** (new): Utility functions for pay cycle computation:
  - `clampDay()` - handles months with fewer days (e.g., pay_date=31 in Feb -> 28)
  - `getPayCycleStart/End()` - date boundaries for a pay cycle period
  - `getCurrentPayCycle()` - determines which pay cycle a given date falls into
  - `formatPayCycleRange()` - display string like "Jan 28 - Feb 27"
  - `getNextPeriod/getPrevPeriod()` - month arithmetic
- **`useBudgetData.ts`**: Reads `pay_date` from user data, initializes to correct pay cycle via `getCurrentPayCycle()`, filters transactions by pay cycle date range instead of calendar month
- **`MonthSelector.tsx`**: Accepts `payDate` prop, "Today" button navigates to current pay cycle, shows date range subtitle when payDate > 1
- **`Settings.tsx`**: Added "Budget Cycle" section with pay day dropdown (1-31) and save button
- **`App.tsx`**: Passes `payDate` to MonthSelector, passes `payDate` and `onUpdatePayDate` to Settings

### Behavior
- `pay_date=1` (default): identical to previous calendar-month behavior
- `pay_date=28`: "January 2026" means Jan 28 - Feb 27; on Feb 1, app defaults to "January"
- Day clamping handles edge cases (pay_date=31 in February -> Feb 28)
