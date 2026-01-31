# Issue 008: Available value on Total Spent stat card not updating cents correctly

**Status:** ✅ Fixed

## Location
- [src/components/StatCard.tsx](../../src/components/StatCard.tsx) (useCountAnimation hook, line 57)
- [src/context/ThemeContext.tsx](../../src/context/ThemeContext.tsx) (formatCurrency)

## Root Cause
Two problems:
1. The counting animation uses `Math.floor()` which truncates all decimal places (cents). Value 35781.93 becomes 35781, and "Available" = `total - 35781` loses 93 cents.
2. `formatCurrency` uses `toLocaleString()` with no options, so decimal display is inconsistent (sometimes 0, 1, or 2 decimal places).

## Fix
Changed `Math.floor()` to `Math.round(... * 100) / 100` to preserve 2 decimal places during animation. Also updated `formatCurrency` to always show exactly 2 decimal places via `toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`.
