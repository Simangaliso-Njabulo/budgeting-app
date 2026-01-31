# Issue 011: Transaction list showing oldest dates first instead of newest

**Status:** ✅ Fixed

## Location
- [src/components/transactions/TransactionList.tsx](../../src/components/transactions/TransactionList.tsx) (sortedDates)

## Root Cause
Issue 010 fix changed date group sort from descending to ascending. User expects most recent dates (Today) at the top.

## Fix
Reverted date group sort back to descending (newest first).
