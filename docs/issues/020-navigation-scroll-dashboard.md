# Issue 020: Pages should scroll to top on navigation and app should start at dashboard after login

**Status:** Fixed

## Location
- [src/App.tsx](../../src/App.tsx) (tab navigation effects)

## Root Cause
Two related navigation issues:

1. **Pages not scrolling to top on tab switch**: The app uses tab-based navigation via `activeTab` state with conditional rendering. When switching tabs, the browser's scroll position stays wherever the user left it on the previous page, so a new page can appear mid-scroll.

2. **App not starting at dashboard after login**: The `BudgetingApp` component stays mounted across the logout/login cycle. The `activeTab` state (initialized to `"dashboard"`) persists its current value through logout and back, so if the user was on "settings" when they logged out, they'd land on "settings" after logging back in.

## Fix
Added two `useEffect` hooks after the tab navigation hook:

### 1. Scroll to top on tab change
```tsx
useEffect(() => {
  window.scrollTo({ top: 0 });
}, [nav.activeTab]);
```

### 2. Reset to dashboard on login
```tsx
useEffect(() => {
  if (auth.isAuthenticated) {
    nav.setActiveTab("dashboard");
  }
}, [auth.isAuthenticated]);
```

This triggers when `isAuthenticated` transitions to `true` (login). On initial page load with a stored token, `activeTab` is already `"dashboard"` (the default), so the reset is harmless.

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
- Tests: 251 passed (`npx vitest run`)
