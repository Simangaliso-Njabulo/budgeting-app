# Auto-Create Buckets for New Months

**Status:** DONE

## Summary

When navigating to a new month that has no buckets, automatically create buckets from either:
1. The previous month's buckets (if they exist)
2. Default bucket templates (if no previous month buckets)

## Behavior

| Scenario | Action |
|----------|--------|
| Buckets exist for requested month | Return existing buckets |
| No buckets for requested month, previous month has buckets | Copy from previous month |
| No buckets for requested month, no previous month buckets | Create from default templates |

## Month Calculation

- January → checks December of previous year
- Any other month → checks previous month of same year

Example:
- March 2026 → checks Feb 2026
- January 2026 → checks Dec 2025

## Files Modified

| File | Change |
|------|--------|
| `src/db/bucketService.ts` | Added `getOrCreateForMonth()` function with auto-create logic |

## Implementation

```typescript
async getOrCreateForMonth(userId: string, year: number, month: number): Promise<Bucket[]> {
  // 1. Check if buckets exist for this month
  // 2. If not, check previous month only
  // 3. If no previous month buckets, create from defaults
}
```

## Default Buckets

The following default buckets are created when no previous month data exists:

- Living Costs: Rent, Phones, Streaming, Cloud Storage, Internet, Utilities
- Car: Car Payment
- Expenses: Commute, Transport, Groceries, Personal Care, Household, Bank Fees
- Enjoyment: Entertainment, Spending Money, Dining Out
- Black Tax: Family Support 1, Family Support 2, Family Support 3
- Savings: Savings
- Unplanned: Unplanned
