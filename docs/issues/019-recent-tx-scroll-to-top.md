# Issue 019: Recent Transactions should scroll to top after saving a transaction

**Status:** Fixed

## Location
- [src/components/dashboard/RecentTransactions.tsx](../../src/components/dashboard/RecentTransactions.tsx) (scroll container)

## Root Cause
The Recent Transactions widget has a scrollable list (`overflow-y: auto` with `max-height`). After saving a new transaction, the list updates with the new entry at the top (sorted by date descending), but the scroll position remains wherever the user last scrolled. The user has to manually scroll back up to see the newly added transaction.

## Fix
Added a `useRef` on the scroll container and a `useEffect` that watches `transactions.length`. When a transaction is added (or removed), the list smoothly scrolls back to the top so the latest transaction is visible:

```tsx
const listRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
}, [transactions.length]);
```

The ref is attached to the `<div className={styles.list}>` scroll container.

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
- Tests: 251 passed (`npx vitest run`)
