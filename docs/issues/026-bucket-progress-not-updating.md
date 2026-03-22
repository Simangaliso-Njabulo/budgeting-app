# Bucket Progress Not Updating After Transaction

**Status:** DONE

## Summary

After adding a new transaction, bucket progress on the Buckets tab showed incorrect values - all buckets appeared to have their allocated amounts fully used, even for buckets not selected in the transaction. Refreshing the page displayed the correct progress.

## Root Cause

The `recalculateBucketSpending` function in `src/hooks/useBudgetData.ts` was not filtering transactions by the current pay cycle period. It was summing up spending from ALL transactions across all time, instead of only transactions within the current budget period.

## Symptom

| Action | Expected | Actual |
|--------|----------|--------|
| Add transaction to bucket A | Only bucket A progress updates | All buckets show 100% spent |
| Add transaction to bucket A | Other buckets unchanged | All buckets show full allocation used |

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useBudgetData.ts` | Added period filtering to `recalculateBucketSpending` |

## Implementation

The fix filters transactions to the current pay cycle before calculating bucket spending:

```typescript
const recalculateBucketSpending = useCallback(
  (txList: Transaction[], bucketList: Bucket[]): Bucket[] => {
    const periodStart = getPayCycleStart(selectedPeriod, payDate);
    const periodEnd = getPayCycleEnd(selectedPeriod, payDate);
    const periodTxs = txList.filter((tx) => {
      const d = new Date(tx.date);
      const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      return txDate >= periodStart && txDate <= periodEnd;
    });
    // ... calculate bucket spending from periodTxs
  },
  [selectedPeriod, payDate]
);
```

## Additional Fix

Removed `queueMicrotask` from `src/hooks/useTransactionActions.ts` which was causing a race condition in the state update chain. The bucket recalculation now happens synchronously with the transaction update.

## Related Files

- `src/components/BucketTable.tsx` - Displays bucket progress (no changes needed)
- `src/hooks/useTransactionActions.ts` - Handles transaction CRUD (minor fix)
- `src/utils/payCycle.ts` - Pay cycle period calculations (no changes needed)
