# Issue 012: Balance inconsistent across date groups after date sort fix

**Status:** ✅ Fixed

## Location
- [src/components/transactions/TransactionList.tsx](../../src/components/transactions/TransactionList.tsx) (within-group sort)

## Root Cause
Date groups sorted newest-first but transactions within each group sorted oldest-first. This caused balance to decrease within a group but jump up between groups, creating an inconsistent pattern.

## Fix
Changed within-group sort to newest-first (descending by createdAt). Now the entire list is consistently newest-first: the very first transaction on the page is the most recent one showing the current remaining balance, and balance increases as you scroll down (going back in time). Matches standard banking app display.
