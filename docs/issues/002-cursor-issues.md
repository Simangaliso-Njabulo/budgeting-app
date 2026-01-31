# Issue 002: Unwanted cursors on View All and FAB buttons

**Status:** ✅ Fixed

## Location
- [src/index.css:3691-3704](../../src/index.css#L3691-L3704) (Recent Transactions "View All" button)
- [src/index.css:2533-2551](../../src/index.css#L2533-L2551) (FAB "Add Transaction" button)

## Root Cause
The buttons had two cursor-related issues:
1. **Pointer cursor**: Both buttons had `cursor: pointer` which showed a hand cursor when hovering
2. **Text selection cursor**: The button text was selectable, causing an I-beam (text selection) cursor to appear when hovering over the text content at different positions (e.g., "Vi|ew All", "View A|ll"). This was especially noticeable on the "View All" button where the cursor appeared anywhere within the text, and on the FAB where it appeared at the start/end of "Add Transaction".

## Fix
1. Changed `cursor: pointer` to `cursor: default` for both `.recent-transactions-view-all` and `.fab` buttons
2. Added `user-select: none` to both buttons to prevent text selection and eliminate the I-beam cursor
3. Both buttons remain fully functional and clickable, but now display only the default cursor with no text selection capability

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
