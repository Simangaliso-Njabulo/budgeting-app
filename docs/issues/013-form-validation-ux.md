# Issue 013: Form validation UX - buttons grayed out instead of showing helpful errors

**Status:** ✅ Fixed

## Location
- [src/components/transactions/TransactionForm.tsx](../../src/components/transactions/TransactionForm.tsx) (validation logic, error display)
- [src/index.css](../../src/index.css) (error styles)

## Root Cause
Both "Save Transaction" and "Save & Add Another" buttons were using `disabled={!isValid}` which grays them out when required fields are empty. This is bad UX because:
1. Users can't click to see what's wrong
2. No feedback on which fields are missing
3. "Save & Add Another" appeared clickable but did nothing (no validation messages)

## Fix
1. Removed `disabled` attribute from both buttons - both are now always clickable
2. Removed `required` attribute from inputs (no native HTML5 validation)
3. Added `errors` state object to track validation errors per field
4. Created `validateForm()` function that checks all fields and sets specific error messages
5. Added error styling: red borders on invalid fields, error text below each field
6. Errors clear when user starts typing in the field
7. Validation runs when either button is clicked, showing user-friendly messages like "Please enter a description", "Please enter an amount greater than 0", "Please select a bucket"
