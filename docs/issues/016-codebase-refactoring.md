# Issue 016: Codebase refactoring - reduce complexity and remove dead code

**Status:** ✅ Fixed

## Location
- [src/App.tsx](../../src/App.tsx) - 1,778 lines, 33 useState hooks, all CRUD logic in one file
- [src/components/categories/CategoryGrid.tsx](../../src/components/categories/CategoryGrid.tsx) - duplicate ICON_MAP
- [src/components/dashboard/RecentTransactions.tsx](../../src/components/dashboard/RecentTransactions.tsx) - duplicate ICON_MAP
- [src/components/transactions/TransactionList.tsx](../../src/components/transactions/TransactionList.tsx) - duplicate ICON_MAP
- [src/components/auth/Login.tsx](../../src/components/auth/Login.tsx) - duplicate logo SVG
- [src/components/auth/SignUp.tsx](../../src/components/auth/SignUp.tsx) - duplicate logo SVG
- [src/components/auth/ForgotPassword.tsx](../../src/components/auth/ForgotPassword.tsx) - duplicate logo SVG
- [src/components/Sidebar.tsx](../../src/components/Sidebar.tsx) - duplicate logo SVG
- [src/components/CategoryCard.tsx](../../src/components/CategoryCard.tsx) - dead component
- 6 unused CSS module files (BucketTable, SpendingTrend, CategoryForm, Login, TransactionList, Settings)
- [backend/app/routers/auth.py](../../backend/app/routers/auth.py) - duplicate login endpoints
- 7 temp Python scripts and 3 temp markdown files in project root

## Root Cause
Organic growth over time without periodic cleanup. Features were added incrementally to App.tsx rather than being extracted into custom hooks. CSS Module migration was partial, leaving orphaned files. Migration helper scripts were never cleaned up.

## Findings

### A. App.tsx Monolith (CRITICAL)
- **1,778 lines** with 33 `useState` hooks in a single component
- All CRUD handlers for transactions, buckets, categories, and income inline
- Modal open/close state patterns repeated 4 times
- No custom hooks extracted
- **Recommended:** Extract into `useAuth`, `useTransactions`, `useBuckets`, `useCategories`, `useIncome`, `useBudgetFilters` hooks

### B. Duplicate ICON_MAP (HIGH)
- Identical `ICON_MAP` object defined in 3 files:
  - `src/components/categories/CategoryGrid.tsx`
  - `src/components/dashboard/RecentTransactions.tsx`
  - `src/components/transactions/TransactionList.tsx`
- **Recommended:** Extract to `src/utils/iconMap.ts`

### C. Duplicate Logo SVG (HIGH)
- Same ~15-line SVG logo block duplicated in 4 files:
  - `src/components/auth/Login.tsx`
  - `src/components/auth/SignUp.tsx`
  - `src/components/auth/ForgotPassword.tsx`
  - `src/components/Sidebar.tsx`
- **Recommended:** Extract to `src/components/common/AppLogo.tsx`

### D. Dead Code (MEDIUM)
- `src/components/CategoryCard.tsx` - exported in index.ts but never imported (CategoryGrid.tsx defines its own local CategoryCard)
- 6 unused `.module.css` files not imported by any component:
  - `BucketTable.module.css`
  - `SpendingTrend.module.css`
  - `CategoryForm.module.css`
  - `Login.module.css`
  - `TransactionList.module.css`
  - `Settings.module.css`
- `src/styles/globals.css.backup`

### E. Backend Duplicate Endpoints (MEDIUM)
- Two login endpoints doing the same thing:
  - `POST /login` (OAuth2 form data)
  - `POST /login/json` (JSON body)
- Frontend only uses `/login/json`

### F. Temporary Files in Root (LOW)
- 7 Python migration scripts: `extract_complete_blocks.py`, `extract_settings_css.py`, `migrate_all_remaining.py`, `migrate_remaining.py`, `migrate_remaining_simple.py`, `update_components_css_modules.py`, `update_settings.py`
- 3 migration docs: `MIGRATION_GUIDE.md`, `MIGRATION_STATUS.md`, `docs/CSS_MODULE_MIGRATION_GUIDE.md`

## Fix

All 6 items implemented:

### A. App.tsx Monolith → Custom Hooks
- Extracted 6 custom hooks into `src/hooks/`:
  - `useToast` (26 lines) - toast notification state
  - `useAuth` (99 lines) - authentication state & handlers
  - `useBudgetData` (295 lines) - core data state, API fetching, computed values, transforms
  - `useBucketActions` (211 lines) - bucket CRUD + transfer logic
  - `useCategoryActions` (81 lines) - category CRUD
  - `useTransactionActions` (154 lines) - transaction CRUD + filters
- **App.tsx reduced from 1,778 lines to 751 lines (58% reduction)**

### B. Duplicate ICON_MAP → Shared Utility
- Created `src/utils/iconMap.ts` with single ICON_MAP definition
- Updated 3 consumer files to import from shared utility
- Removed ~42 lines of duplicated code

### C. Duplicate Logo SVG → Shared Component
- Created `src/components/common/AppLogo.tsx` with `size` prop (`sm` for sidebar, `lg` for auth)
- Uses React `useId()` for unique SVG gradient IDs
- Updated 4 consumer files (Login, SignUp, ForgotPassword, Sidebar)
- Removed ~60 lines of duplicated SVG code

### D. Dead Code Removed
- Deleted `src/components/CategoryCard.tsx` and its export from `index.ts`
- Deleted 6 unused `.module.css` files
- Deleted `src/styles/globals.css.backup`

### E. Backend Duplicate Login Consolidated
- Merged `/login` (form-data) and `/login/json` (JSON) into single `/login` endpoint accepting JSON
- Updated frontend API call from `/auth/login/json` to `/auth/login`
- Removed unused `OAuth2PasswordRequestForm` import

### F. Temporary Files Cleaned Up
- Deleted 7 Python migration scripts from project root
- Deleted 3 migration markdown docs (MIGRATION_GUIDE.md, MIGRATION_STATUS.md, docs/CSS_MODULE_MIGRATION_GUIDE.md)

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit` - 0 errors)
- Production build: Succeeded (`npx vite build` - built in 4.91s)
