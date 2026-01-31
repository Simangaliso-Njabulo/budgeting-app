# CSS Modules Migration Guide

## Overview

We're migrating from a massive 4885-line `globals.css` file to **Component-Scoped CSS Modules** for better maintainability.

**Results so far:**
- ✅ Reduced globals.css from 4885 → 269 lines (94.5% reduction)
- ✅ Reduced CSS bundle from 80.67 kB → 15.11 kB (81.3% reduction)
- ✅ Converted RecentTransactions component as example

## What Changed

### Before (Old Approach)
```
src/
├── styles/
│   └── globals.css (4885 lines - everything mixed together)
└── components/
    └── dashboard/
        └── RecentTransactions.tsx (uses global class names)
```

### After (New Approach)
```
src/
├── styles/
│   ├── globals.css (269 lines - only theme variables & layout)
│   └── globals.css.backup (original for reference)
└── components/
    └── dashboard/
        ├── RecentTransactions.tsx (imports CSS Module)
        └── RecentTransactions.module.css (component-specific styles)
```

## What's in globals.css Now (Keep These)

✅ **Theme variables** (dark/light mode CSS custom properties)
✅ **Global resets** (*, box-sizing, cursor styles)
✅ **Accent colors** (shared color palette)
✅ **Body styles** (font, background)
✅ **App layout** (.app-layout, .main-content, .content-wrapper)
✅ **Glassmorphism base** (.glass-card - reused across many components)
✅ **Scrollbar styles** (global ::-webkit-scrollbar)
✅ **Responsive layout** (media queries for layout classes)

## Components That Need Migration

The backup file `src/styles/globals.css.backup` contains styles for these components that need to be migrated to CSS Modules:

### High Priority (Complex Components)
1. **Sidebar** - Lines ~506-715 in backup
2. **Modal** - Lines ~2240-2324 in backup
3. **Toast** - Lines ~2325-2425 in backup
4. **FAB (Floating Action Button)** - Lines ~2529-2583 in backup
5. **Mobile Navigation** - Lines ~2143-2239 in backup

### Medium Priority (Dashboard Components)
6. **Budget Summary** - Lines ~248-310 in backup
7. **Stat Cards** - Lines ~716-866 in backup
8. **Monthly Trend Chart** - Lines ~3851-3951 in backup
9. **Over Budget Alerts** - Lines ~3576-3615 in backup

### Lower Priority (Simple Components)
10. **Filter Bar** - Lines ~867-1276 in backup
11. **Data Table** - Lines ~1277-1424 in backup
12. **Form Styles** - Lines ~1425-1512 in backup
13. **Donut Chart** - Lines ~1513-1555 in backup
14. **Empty State** - Lines ~1556-1842 in backup
15. **Settings Page** - Lines ~4071-4602 in backup
16. **Authentication Pages** - Lines ~4603-4849 in backup
17. **Category Components** - Lines ~2621-2990 in backup
18. **Transaction Components** - Lines ~2991-3575 in backup

## How to Migrate a Component

### Step 1: Extract Styles from Backup

Find your component's styles in `src/styles/globals.css.backup`:

```bash
# Example: Find Modal styles
grep -n "MODAL STYLES" src/styles/globals.css.backup
# Returns: 2240:   MODAL STYLES

# Extract the styles
sed -n '2240,2324p' src/styles/globals.css.backup > temp_modal_styles.css
```

### Step 2: Create CSS Module File

Create `ComponentName.module.css` next to your component:

```bash
# Example for Modal component
touch src/components/common/Modal.module.css
```

### Step 3: Convert Global Classes to Module Classes

**Before (global classes):**
```css
.modal-overlay {
  position: fixed;
  /* ... */
}

.modal-content {
  background: var(--glass-bg);
  /* ... */
}
```

**After (CSS Module classes):**
```css
/* Modal.module.css */
.overlay {
  position: fixed;
  /* ... */
}

.content {
  background: var(--glass-bg);
  /* ... */
}
```

**Key changes:**
- Remove component prefix (`.modal-overlay` → `.overlay`)
- Use camelCase for multi-word names (`.modal-content` → `.content`)
- Keep CSS custom properties (they're global, that's fine!)

### Step 4: Update Component File

**Before:**
```tsx
// Modal.tsx
const Modal = () => {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* ... */}
      </div>
    </div>
  );
};
```

**After:**
```tsx
// Modal.tsx
import styles from './Modal.module.css';

const Modal = () => {
  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        {/* ... */}
      </div>
    </div>
  );
};
```

### Step 5: Handle Dynamic Classes

**Before:**
```tsx
<div className={`modal-overlay ${isOpen ? 'modal-overlay-open' : ''}`}>
```

**After:**
```tsx
<div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}>
```

### Step 6: Keep Global Utilities

Some classes should stay global (like `.glass-card`):

```tsx
// Combine global class with module class
<div className={`${styles.container} glass-card`}>
```

### Step 7: Test

```bash
npm run build
# Check bundle size reduction
# Test in browser at http://localhost:5174
```

## Example: RecentTransactions Component

See the completed example:
- Component: `src/components/dashboard/RecentTransactions.tsx`
- CSS Module: `src/components/dashboard/RecentTransactions.module.css`

## Quick Reference Commands

```bash
# Check current CSS bundle size
npm run build | grep "assets/index"

# Find styles for a component in backup
grep -n "COMPONENT-NAME" src/styles/globals.css.backup

# Extract specific line range from backup
sed -n 'START,ENDp' src/styles/globals.css.backup

# Count remaining lines in globals.css
wc -l src/styles/globals.css

# Start dev server to test
npm run dev
```

## Benefits You'll See

For each component you migrate:
- ✅ **Self-contained** - Component and styles in same folder
- ✅ **No naming conflicts** - `.header` in Modal ≠ `.header` in Dashboard
- ✅ **Easy to delete** - Delete component folder, all styles go with it
- ✅ **Smaller bundle** - Unused styles get automatically removed
- ✅ **Better IntelliSense** - IDE autocomplete for class names

## Tips & Tricks

### 1. Group Related Styles
```css
/* Good: Group related classes */
.container { /* ... */ }
.header { /* ... */ }
.title { /* ... */ }
.body { /* ... */ }
```

### 2. Keep CSS Variables Global
```css
/* Good: Use global CSS variables from globals.css */
.container {
  background: var(--glass-bg);
  color: var(--text-primary);
}
```

### 3. Avoid Deep Nesting
```css
/* Bad */
.container .header .title .icon { }

/* Good */
.headerIcon { }
```

### 4. Use Semantic Names
```css
/* Bad */
.div1 { }
.box { }

/* Good */
.transactionItem { }
.categoryIcon { }
```

## Need Help?

- Check the example: `src/components/dashboard/RecentTransactions.tsx`
- Review globals.css to see what's considered "global": `src/styles/globals.css`
- Reference the backup for original styles: `src/styles/globals.css.backup`

## Progress Tracker

- [x] globals.css reduced to theme variables only
- [x] RecentTransactions converted ✅
- [ ] Sidebar
- [ ] Modal
- [ ] Toast
- [ ] FAB
- [ ] Mobile Navigation
- [ ] Budget Summary
- [ ] Stat Cards
- [ ] Monthly Trend Chart
- [ ] Over Budget Alerts
- [ ] Filter Bar
- [ ] Data Table
- [ ] Form Styles
- [ ] Donut Chart
- [ ] Empty State
- [ ] Settings Page
- [ ] Authentication Pages
- [ ] Category Components
- [ ] Transaction Components

Check off components as you migrate them!
