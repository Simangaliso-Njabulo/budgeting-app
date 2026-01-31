# Issue Tracking Index

> **Build verification (latest):** TypeScript type-check passed (0 errors). Vite production build succeeded.

## Summary
- **Total Issues:** 15
- **Fixed:** 15
- **Open:** 0

## How to Use This Index
1. Use **Ctrl+F** (or Cmd+F) to search for keywords in the table below
2. Click the issue link to view the full details
3. All individual issue files are in this folder

## Naming Convention
- **Format:** `NNN-short-description.md` (3-digit number prefix with descriptive name)
- **When we hit 1000 issues:** Simply use 4 digits (e.g., `1000-issue-name.md`)
- Files auto-sort by number, and you can search by keywords in this index

---

## All Issues

| # | Title | Status | File |
|---|-------|--------|------|
| 001 | Dashboard layout - Total Spent and Over Budget Alerts wasting space | ✅ Fixed | [001-dashboard-layout.md](001-dashboard-layout.md) |
| 002 | Unwanted cursors on View All and FAB buttons | ✅ Fixed | [002-cursor-issues.md](002-cursor-issues.md) |
| 003 | Recent Transactions widget not utilizing available desktop space | ✅ Fixed | [003-desktop-space.md](003-desktop-space.md) |
| 004 | Recent Transactions not scrollable and missing running balance | ✅ Fixed | [004-scrolling-balance.md](004-scrolling-balance.md) |
| 005 | Recent Transactions limited display and poor scroll UX | ✅ Fixed | [005-scroll-ux.md](005-scroll-ux.md) |
| 006 | Transactions not reflecting without page refresh after save | ✅ Fixed | [006-transactions-not-reflecting.md](006-transactions-not-reflecting.md) |
| 007 | Transaction summary income shows 0 on transactions page | ✅ Fixed | [007-transaction-summary-income.md](007-transaction-summary-income.md) |
| 008 | Available value on Total Spent stat card not updating cents correctly | ✅ Fixed | [008-stat-card-cents.md](008-stat-card-cents.md) |
| 009 | Show running balance for each transaction | ✅ Fixed | [009-running-balance.md](009-running-balance.md) |
| 010 | Running balance increases instead of decreasing | ✅ Fixed | [010-balance-calculation.md](010-balance-calculation.md) |
| 011 | Transaction list showing oldest dates first instead of newest | ✅ Fixed | [011-date-order.md](011-date-order.md) |
| 012 | Balance inconsistent across date groups after date sort fix | ✅ Fixed | [012-balance-inconsistent.md](012-balance-inconsistent.md) |
| 013 | Form validation UX - buttons grayed out instead of showing helpful errors | ✅ Fixed | [013-form-validation-ux.md](013-form-validation-ux.md) |
| 014 | Dashboard recent transactions not updating after save (requires browser refresh) | ✅ Fixed | [014-dashboard-refresh.md](014-dashboard-refresh.md) |
| 015 | Properly set up Tailwind CSS to reduce CSS file size and improve maintainability | ✅ Fixed | [015-tailwind-setup.md](015-tailwind-setup.md) |

---

## Search Tips

**Search by keyword:**
- "cursor" → finds issue 002
- "balance" → finds issues 004, 009, 010, 012
- "dashboard" → finds issues 001, 014
- "transaction" → finds issues 003, 004, 005, 006, 007, 009, 011, 013, 014
- "validation" → finds issue 013

**Search by status:**
- "Fixed" → all resolved issues
- "Open" → pending issues (none currently)

**Search by component:**
- "Recent Transactions" → issues 003, 004, 005
- "TransactionList" → issues 009, 010, 011, 012
- "StatCard" → issue 008
