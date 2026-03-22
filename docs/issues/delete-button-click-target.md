# Issue: Delete Button Click Target Unreliable on Mobile

## Issue ID
`bug-delete-button-click-target`

## Date Reported
2026-03-22

## Status
Resolved

---

## Summary
Delete transaction button was difficult to click on mobile devices. Users had to click in very specific locations (left side) for the delete action to trigger, while clicking the center/right of the button did not work.

## Root Cause

### Primary Issue: Z-Index Layering Conflict
The Toast component had a `z-index: 2000` which placed it above the Modal's `z-index: 1000`. When a toast was displayed and the user opened a modal to edit/delete a transaction, the toast visually sat on top of the modal content, blocking clicks on the right side of the delete button.

**Z-Index hierarchy (before fix):**
- Toast: `z-index: 2000`
- Modal backdrop: `z-index: 1000`
- Modal content: inherited from backdrop

This meant even though the toast was fading out (opacity: 0), its hitbox still covered interactive elements in the modal.

### Secondary Issue: Toast Exit Animation Still Blocked Clicks
The toast used a CSS exit animation with `opacity: 0`, but `pointer-events: auto` remained active during the animation. This allowed the invisible toast to intercept clicks meant for underlying elements.

### Tertiary Issue: Missing onDelete Handler
The `TransactionList` component accepted an `onDelete` prop but never utilized it. The component interface declared the prop, but it was never passed to the component or connected to any UI element.

### Tertiary Issue: Mobile Inaccessible Delete Buttons
In `TransactionTable`, the action buttons (edit/delete) used `opacity-0 group-hover:opacity-100` which only showed buttons on hover. On mobile devices where there's no hover state, users had no way to access delete functionality through this view.

---

## Files Affected

### 1. `src/components/common/Toast.module.css`
- Line 3-16: `.toast` - Changed `z-index: 2000` to `z-index: 900`
- Line 22-25: `.toastExit` - Added `pointer-events: none`

### 2. `src/components/common/Toast.tsx` (no changes needed)
- Uses module CSS, z-index managed in module file

### 3. `src/components/common/Modal.module.css`
- Line 21-30: `.modalContent` - Added `position: relative` and `z-index: 1001`

### 4. `src/styles/globals.css`
- Line 2444-2457: `.toast` - Changed `z-index: 2000` to `z-index: 900`
- Line 2463-2466: `.toast-exit` - Added `pointer-events: none`
- Line 3463-3495: Added `.transaction-item-delete` styles for delete button

### 5. `src/components/transactions/TransactionList.tsx`
- Line 2: Added `Trash2` import
- Line 14: `onDelete` prop was declared but unused
- Line 17: Added `onDelete` to destructured props
- Line 151-160: Added delete button with `stopPropagation()` and `aria-label`

### 6. `src/components/TransactionTable.tsx`
- Line 201: Changed `opacity-0 group-hover:opacity-100` to `opacity-100 md:opacity-0 md:group-hover:opacity-100` to make buttons always visible on mobile

---

## Solution

### 1. Fixed Z-Index Hierarchy
Adjusted z-index values to ensure modal content is always above toast:
```
Toast: z-index: 900
Modal backdrop: z-index: 1000
Modal content: z-index: 1001 (relative to backdrop)
```

### 2. Disabled Pointer Events During Exit Animation
Added `pointer-events: none` to `.toastExit` to prevent invisible toast from capturing clicks during fade-out.

### 3. Implemented Delete Button in TransactionList
- Added `Trash2` icon import
- Connected `onDelete` prop to UI
- Added proper button element with `aria-label` for accessibility
- Used `stopPropagation()` to prevent click bubbling to parent edit handler

### 4. Mobile-Accessible Action Buttons
Made delete/edit buttons always visible on mobile while maintaining desktop hover behavior.

---

## Testing Performed

### Manual Testing
- Verified delete button works on mobile in TransactionList
- Verified delete button works in TransactionForm modal
- Verified toast no longer blocks modal interactions
- Verified desktop hover behavior still works for TransactionTable

### Automated Testing
- `npm run lint` - Passed (pre-existing warnings/errors unrelated to this fix)
- `npm run test:run` - 228 tests passed

---

## Prevention Recommendations

1. **Establish z-index conventions**: Document a standard z-index scale in the codebase to prevent future conflicts
   - Modals/portals: 1000+
   - Toasts/notifications: 900-999
   - Dropdowns: 800-899
   - Content: 0

2. **Always use `pointer-events: none` during exit animations**: When an element fades out, it should not capture pointer events

3. **Review prop usage**: Add linting rules to flag declared but unused props

4. **Mobile-first testing**: Ensure all interactive elements are tested on touch devices

---

## Related Files
- `src/components/transactions/TransactionList.tsx`
- `src/components/TransactionTable.tsx`
- `src/components/transactions/TransactionForm.tsx`
- `src/components/common/Toast.tsx`
- `src/components/common/Toast.module.css`
- `src/components/common/Modal.tsx`
- `src/components/common/Modal.module.css`
- `src/styles/globals.css`
