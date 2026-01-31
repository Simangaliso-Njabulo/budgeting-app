# CSS Modules Migration Quick Reference Guide

## 🎯 Quick Migration Steps

### 1. Identify Component Styles
```bash
# Search for component styles in backup
grep "^\.component-name" src/styles/globals.css.backup -A 20
```

### 2. Create Module File
Create `ComponentName.module.css` next to the component file.

### 3. Convert Class Names
- Global: `.my-component` → Module: `.myComponent`
- Hyphens → camelCase: `.nav-item-active` → `.navItemActive`

### 4. Update Component

**Before:**
```tsx
// Component.tsx
export const Component = () => {
  return (
    <div className="my-component">
      <span className="my-component-title">Title</span>
    </div>
  );
};
```

**After:**
```tsx
// Component.tsx
import styles from './Component.module.css';

export const Component = () => {
  return (
    <div className={styles.myComponent}>
      <span className={styles.myComponentTitle}>Title</span>
    </div>
  );
};
```

### 5. Handling Multiple Classes

**Conditional classes:**
```tsx
className={`${styles.item} ${isActive ? styles.itemActive : ''}`}
```

**With global utility classes:**
```tsx
className={`${styles.card} glass-card`}
```

## 📦 Component-Specific Patterns

### Settings Component
Classes to migrate:
- `.settings-section`
- `.settings-section-title`
- `.settings-card`
- `.settings-row`
- `.settings-row-info`
- `.settings-row-label`
- `.settings-row-description`
- `.theme-toggle-group`
- `.theme-toggle-btn`
- `.theme-toggle-icon`
- `.theme-toggle-label`
- `.settings-currency-select`
- `.settings-notification-item`
- `.settings-action-btn`
- `.settings-action-btn-danger`

### BucketTable Component
Classes to migrate:
- `.bucket-table`
- `.bucket-table-header`
- `.bucket-table-row`
- `.bucket-table-cell`
- `.bucket-progress-bar`
- `.bucket-progress-fill`
- `.bucket-action-btn`

### TransactionTable Component
Classes to migrate:
- `.transaction-table`
- `.transaction-table-header`
- `.transaction-table-row`
- `.transaction-item`
- `.transaction-amount`
- `.transaction-category`
- `.transaction-date`
- `.transaction-action-btn`

## 🔍 Finding Styles

### Method 1: Direct Grep
```bash
grep "^\.component-class" src/styles/globals.css.backup -A 30
```

### Method 2: Search by Component Name
```bash
grep -i "component" src/styles/globals.css.backup | grep "^\."
```

### Method 3: Search for Related Patterns
```bash
# Find all classes starting with "settings-"
grep "^\.settings-" src/styles/globals.css.backup
```

## ✅ Verification Checklist

After migrating each component:

1. ✅ Build passes: `npm run build`
2. ✅ No TypeScript errors
3. ✅ All styles imported and used
4. ✅ No unused imports (check IDE warnings)
5. ✅ Component renders correctly in app
6. ✅ Hover/active states work
7. ✅ Responsive behavior preserved

## 🚨 Common Pitfalls

### 1. Forgetting to Import
```tsx
// ❌ Wrong - forgot import
<div className={styles.container}>

// ✅ Correct
import styles from './Component.module.css';
<div className={styles.container}>
```

### 2. Using String Literals
```tsx
// ❌ Wrong - not scoped
<div className="container">

// ✅ Correct - scoped to module
<div className={styles.container}>
```

### 3. Losing Global Classes
```tsx
// ❌ Wrong - lost glass-card utility
<div className={styles.card}>

// ✅ Correct - kept global utility
<div className={`${styles.card} glass-card`}>
```

### 4. Incorrect Nesting
CSS Modules work with selectors:
```css
/* ComponentName.module.css */
.parent .child {
  /* This works */
}

.parent :global(.global-class) {
  /* Use :global() for global selectors */
}
```

## 🎨 Global Classes to Keep

These should NOT be migrated (keep as-is):
- `glass-card`
- `glass-sidebar`
- `glass-bg`
- `btn`
- `btn-primary`
- `btn-secondary`
- `btn-danger`
- `form-input`
- `form-select`
- `form-textarea`
- `form-label`
- `form-group`
- `page-content`
- `page-header`
- `page-title`
- `page-subtitle`

## 📋 Remaining Work Estimate

- **High Priority (5 components):** ~2-3 hours
  - Settings, Header, Navigation, BucketTable, TransactionTable

- **Forms (4 components):** ~1-2 hours
  - TransactionForm, CategoryForm, BucketForm

- **Dashboard/Transactions (6 components):** ~1.5-2 hours
  - SpendingTrend, MonthlyTrendChart, TransactionList, TransactionFilters, TransactionSummary

- **Other (4 components):** ~1 hour
  - ActionButton, etc.

**Total Estimated Time:** 5.5-8 hours

## 🏁 Final Steps

Once all components are migrated:

1. Compare `globals.css` with `globals.css.backup`
2. Verify all migrated styles are gone from globals.css
3. Keep only theme variables and layout utilities in globals.css
4. Delete or archive `globals.css.backup`
5. Run full app test
6. Commit changes with detailed message

## 💡 Pro Tips

1. **Work in batches** - Migrate 3-5 similar components at once
2. **Test frequently** - Run build after each batch
3. **Use IDE search** - Find all occurrences of class names
4. **Keep pattern consistent** - Follow the same naming convention
5. **Document as you go** - Note any tricky migrations
