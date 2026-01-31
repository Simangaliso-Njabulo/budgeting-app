# Issue 006: Transactions not reflecting without page refresh after save

**Status:** ✅ Fixed

## Location
- [src/App.tsx](../../src/App.tsx) (saveTransaction)
- [src/components/transactions/TransactionForm.tsx](../../src/components/transactions/TransactionForm.tsx) (handleSaveAndAnother)

## Root Cause
Two problems:
1. `saveTransaction` reads `transactions` from the closure which can be stale when multiple saves happen quickly (e.g. "Save & Add Another" clicked rapidly). The second save overwrites the first because it captures the pre-update array.
2. `handleSaveAndAnother` in TransactionForm does not `await` the async save, so the form resets before the save completes and state updates are not guaranteed before the next interaction.
3. Trend data (`trendData`) is fetched from the API on mount but never refreshed after new transactions are saved, so the SpendingTrend chart is stale.

## Fix
Used functional state update (`setTransactions(prev => ...)`) to always build on the latest state, made `handleSaveAndAnother` async and await the save, and added `fetchTrends()` call after saving.
