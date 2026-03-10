# Issue 023: Transfer Modal Balance Display

**Status:** Fixed

## Location
- [src/App.tsx](../../src/App.tsx) (lines 762-890)

## Problem

The transfer modal for moving money between buckets displayed the allocated amount for each bucket instead of the remaining available balance. This created confusion when deciding how much could be transferred.

## Root Cause

The UI was using `bucket.allocated` for display, but the actual available balance should be `bucket.allocated - bucket.actual` (allocated minus actual spending).

## Solution

### 1. Display Available Balance
Changed all displays to show remaining balance:
- Context bucket info (lines 767-768, 773-774): Shows `(available)` instead of `(allocated)`
- From Bucket dropdown (lines 792-794): Shows available balance
- To Bucket dropdown (lines 812-814): Shows available balance
- Available display (lines 832-833, 861-862): Shows correct calculation with Transfer All / Receive All buttons

### 2. Transfer All and Receive All Buttons
Updated Transfer All button to transfer available balance:
```typescript
bucketActions.setTransfer({ ...bucketActions.transfer, amount: fromBucket.allocated - fromBucket.actual });
```

Added "Receive All" button in Receive mode that shows immediately alongside Available balance (lines 859-888), matching Transfer mode behavior.

Fixed inconsistent button label - now shows "Receive All" in Receive mode and "Transfer All" in Transfer mode consistently, regardless of whether a source bucket is selected (line 845).

### 3. Validation
- Added button disable logic to prevent transfers exceeding available balance
- Added error messages that appear immediately for both Transfer and Receive modes:
  - "Please select a source bucket"
  - "Please select a destination bucket"
  - "Please enter an amount greater than 0"
  - "Amount must be greater than 0"
  - "Amount exceeds available balance"

### 4. Consistent Error Display
Error messages now appear together under the "Available" section for both Transfer and Receive modes:
- Transfer mode: Shows fromBucket's available balance with amount errors
- Receive mode: Shows toBucket's available balance with amount errors (when no source selected)

## Build Verification
- Lint: Passed
- TypeScript: Passed
