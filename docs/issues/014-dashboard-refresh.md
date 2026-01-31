# Issue 014: Dashboard recent transactions not updating after save (requires browser refresh)

**Status:** ✅ Fixed

## Location
- [src/App.tsx](../../src/App.tsx) (saveTransaction, line ~698-731)

## Root Cause
Calling `setBuckets()` directly inside the `setTransactions()` updater function causes the state update to execute synchronously during the render phase. React's state updater functions should be pure, and calling another setState during an updater can cause batching issues where the component doesn't properly re-render with the new data. The dashboard's `periodTransactions` (which filters `transactions` by month) wasn't recomputing because React was interrupting the render cycle.

## Fix
Wrapped the `setBuckets()` call inside `queueMicrotask()` to defer it until after the `setTransactions` updater completes. This ensures React can properly batch the updates while keeping the bucket recalculation logic connected to the transaction list it depends on. The microtask runs after the current render cycle completes but before the next paint, ensuring both states update in the same batch while respecting React's render purity requirements.
