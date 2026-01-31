# Bug Fixes - Transaction & Dashboard Issues

> **Build verification (latest):** TypeScript type-check passed (0 errors). Vite production build succeeded.

## Issue 1: Transactions not reflecting without page refresh after save
- **Status:** [x] Fixed
- **Location:** `src/App.tsx` (saveTransaction), `src/components/transactions/TransactionForm.tsx` (handleSaveAndAnother)
- **Root Cause:** Two problems:
  1. `saveTransaction` reads `transactions` from the closure which can be stale when multiple saves happen quickly (e.g. "Save & Add Another" clicked rapidly). The second save overwrites the first because it captures the pre-update array.
  2. `handleSaveAndAnother` in TransactionForm does not `await` the async save, so the form resets before the save completes and state updates are not guaranteed before the next interaction.
  3. Trend data (`trendData`) is fetched from the API on mount but never refreshed after new transactions are saved, so the SpendingTrend chart is stale.
- **Fix:** Used functional state update (`setTransactions(prev => ...)`) to always build on the latest state, made `handleSaveAndAnother` async and await the save, and added `fetchTrends()` call after saving.

## Issue 2: Transaction summary income shows 0 on transactions page
- **Status:** [x] Fixed
- **Location:** `src/components/transactions/TransactionSummary.tsx`, `src/App.tsx` (line ~1318)
- **Root Cause:** `TransactionSummary` calculates "Income" by summing transactions where `type === 'income'`. But the user's monthly income (salary) is stored in the `income` state from the monthly_income API -- it is NOT a transaction of type 'income'. So the Income row shows 0 unless the user has manually logged income transactions.
- **Fix:** Added `monthlyIncome` prop to `TransactionSummary`. Income now = monthlyIncome + any income-type transactions. Net = totalIncome - totalExpenses.

## Issue 3: Available value on Total Spent stat card not updating cents correctly
- **Status:** [x] Fixed
- **Location:** `src/components/StatCard.tsx` (useCountAnimation hook, line 57), `src/context/ThemeContext.tsx` (formatCurrency)
- **Root Cause:** Two problems:
  1. The counting animation uses `Math.floor()` which truncates all decimal places (cents). Value 35781.93 becomes 35781, and "Available" = `total - 35781` loses 93 cents.
  2. `formatCurrency` uses `toLocaleString()` with no options, so decimal display is inconsistent (sometimes 0, 1, or 2 decimal places).
- **Fix:** Changed `Math.floor()` to `Math.round(... * 100) / 100` to preserve 2 decimal places during animation. Also updated `formatCurrency` to always show exactly 2 decimal places via `toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })`.

## Issue 4: Show running balance for each transaction
- **Status:** [x] Fixed (initial implementation)
- **Location:** `src/components/transactions/TransactionList.tsx`, `src/App.tsx`
- **Root Cause:** No running balance is currently shown. Each transaction only displays its own amount. The user wants to see how much was left at each point in time.
- **Fix:** Added `monthlyIncome` prop to `TransactionList`. Running balance is computed by sorting transactions chronologically, starting from monthly income, subtracting expenses and adding income transactions. Each transaction item shows "Bal: R X,XXX.XX" in muted text below the amount. Negative balances are highlighted in red.

## Issue 5: Running balance increases instead of decreasing
- **Status:** [x] Fixed
- **Location:** `src/components/transactions/TransactionList.tsx` (balance computation + display order), `src/App.tsx`
- **Root Cause:** `filteredTransactions` includes ALL months' transactions (no period filter by default), but `monthlyIncome` is only the current month's income. So the balance = `currentMonthIncome - ALL_historical_expenses`, producing wrong values.
- **Fix:** Two changes:
  1. Balance computation now filters to only the `selectedPeriod`'s transactions before computing.
  2. Transactions within each day group are sorted by creation time (oldest first) so same-day transactions display in the order they were logged and balance decreases within the group.

## Issue 6: Transaction list showing oldest dates first instead of newest
- **Status:** [x] Fixed
- **Location:** `src/components/transactions/TransactionList.tsx` (sortedDates)
- **Root Cause:** Issue 5 fix changed date group sort from descending to ascending. User expects most recent dates (Today) at the top.
- **Fix:** Reverted date group sort back to descending (newest first).

## Issue 7: Balance inconsistent across date groups after date sort fix
- **Status:** [x] Fixed
- **Location:** `src/components/transactions/TransactionList.tsx` (within-group sort)
- **Root Cause:** Date groups sorted newest-first but transactions within each group sorted oldest-first. This caused balance to decrease within a group but jump up between groups, creating an inconsistent pattern.
- **Fix:** Changed within-group sort to newest-first (descending by createdAt). Now the entire list is consistently newest-first: the very first transaction on the page is the most recent one showing the current remaining balance, and balance increases as you scroll down (going back in time). Matches standard banking app display.

## Issue 8: Form validation UX - buttons grayed out instead of showing helpful errors
- **Status:** [x] Fixed
- **Location:** `src/components/transactions/TransactionForm.tsx` (validation logic, error display), `src/index.css` (error styles)
- **Root Cause:** Both "Save Transaction" and "Save & Add Another" buttons were using `disabled={!isValid}` which grays them out when required fields are empty. This is bad UX because:
  1. Users can't click to see what's wrong
  2. No feedback on which fields are missing
  3. "Save & Add Another" appeared clickable but did nothing (no validation messages)
- **Fix:**
  1. Removed `disabled` attribute from both buttons - both are now always clickable
  2. Removed `required` attribute from inputs (no native HTML5 validation)
  3. Added `errors` state object to track validation errors per field
  4. Created `validateForm()` function that checks all fields and sets specific error messages
  5. Added error styling: red borders on invalid fields, error text below each field
  6. Errors clear when user starts typing in the field
  7. Validation runs when either button is clicked, showing user-friendly messages like "Please enter a description", "Please enter an amount greater than 0", "Please select a bucket"

## Issue 9: Dashboard recent transactions not updating after save (requires browser refresh)
- **Status:** [x] Fixed
- **Location:** `src/App.tsx` (saveTransaction, line ~698-731)
- **Root Cause:** Calling `setBuckets()` directly inside the `setTransactions()` updater function causes the state update to execute synchronously during the render phase. React's state updater functions should be pure, and calling another setState during an updater can cause batching issues where the component doesn't properly re-render with the new data. The dashboard's `periodTransactions` (which filters `transactions` by month) wasn't recomputing because React was interrupting the render cycle.
- **Fix:** Wrapped the `setBuckets()` call inside `queueMicrotask()` to defer it until after the `setTransactions` updater completes. This ensures React can properly batch the updates while keeping the bucket recalculation logic connected to the transaction list it depends on. The microtask runs after the current render cycle completes but before the next paint, ensuring both states update in the same batch while respecting React's render purity requirements.
