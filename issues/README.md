# Performance Fixes - Remaining Issues

## Status: Core Performance Issues Resolved

The PWA performance optimizations have been implemented. The following issues are **pre-existing** in the codebase and were not introduced by the performance work.

---

## ESLint Errors (Pre-existing)

### 1. ThemeContext.tsx - Fast Refresh Export Issue
**Files:** `src/context/ThemeContext.tsx:12` and `src/context/ThemeContext.tsx:111`
```
error  Fast refresh only works when a file only exports components.
```
**Impact:** Dev server hot reload may occasionally reset state
**Fix:** Move `CURRENCIES` constant to a separate file (e.g., `src/utils/currencies.ts`)

---

### 2. Unused Variables in Services
**Files:** 
- `src/db/bucketService.ts:113` - `_` and `__` unused
- `src/db/importExport.ts:28` - `_` unused  
- `src/db/transactionService.ts:98` - `collection` should be `const`

**Fix:** Rename unused params to `_` convention or remove

---

### 3. Integration Tests Missing Dependency
**Files:** `tests/L2-IntegrationTests/hooks/useCategoryActions.test.ts`
**Error:** `Failed to resolve import "../../../src/services/api"`
**Status:** L2 tests were already broken (missing `src/services/api.ts`)

---

## Pre-existing Warnings

- `tests/L1-UnitTests/utils/iconMap.test.ts:30,38` - unused `key` variable
- `coverage/` files have unused eslint-disable directives (harmless)

---

## Recommendations

1. **High Priority:** Fix integration tests by creating the missing `src/services/api.ts` stub or removing the import if not needed
2. **Medium Priority:** Extract `CURRENCIES` constant from ThemeContext for better HMR support
3. **Low Priority:** Clean up unused variables in db services

---

## Verified Working

- ✅ Build completes successfully
- ✅ All 228 L1 unit tests pass
- ✅ Code splitting working (vendor chunks created)
- ✅ Lazy loading implemented for auth screens and charts
- ✅ Mobile tap responsiveness fixed
