# Known Issues

## Mobile Swipe-to-Reveal Transaction Actions

**Status:** In Progress
**Priority:** Medium
**Component:** `src/components/transactions/TransactionList.tsx`

### Description
The swipe-to-reveal functionality for edit/delete actions on transaction items is not working correctly on mobile. The implementation uses iOS-style swipe gestures but the touch events are not being captured properly.

### Current Implementation
- `SwipeableTransactionItem` component with native touch event listeners
- Touch direction detection (horizontal vs vertical)
- Solid background on swipeable cards to hide actions behind
- `overscroll-behavior-x: none` on body to prevent browser navigation gestures

### Symptoms
- Swiping on transaction items does not reveal the action buttons
- Page may scroll horizontally instead of individual cards

### Files Involved
- `src/components/transactions/TransactionList.tsx` - SwipeableTransactionItem component
- `src/index.css` - Swipe container and action button styles

### CSS Classes
```css
.transaction-item-swipe-container
.transaction-item-swipe-actions
.transaction-item-swipeable
.swipe-action-btn
.swipe-action-edit
.swipe-action-delete
```

### Attempted Solutions
1. React synthetic touch events - Failed (passive listener issues with preventDefault)
2. Native addEventListener with `{ passive: false }` for touchmove
3. Direction detection to distinguish horizontal swipes from vertical scrolling
4. Mouse event support added for desktop browser testing
5. `touch-action: pan-y` CSS property
6. Solid backgrounds instead of glass-card transparency

### Possible Next Steps
- Test on actual mobile device (not just browser emulation)
- Consider using a library like `react-swipeable` or `@use-gesture/react`
- Investigate if React 18 concurrent features affect touch event handling
- Check for CSS conflicts with parent containers

### Related Resources
- iOS Human Interface Guidelines for swipe actions
- MDN Touch Events documentation
- React Touch Event handling
