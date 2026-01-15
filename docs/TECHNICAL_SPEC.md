# BudgetPro Technical Specification

## Selected Approach: Option A - Transaction-Centric

**Goal:** Create an exceptional, premium budgeting experience focused on transaction tracking with full CRUD capabilities for Transactions, Buckets, and Categories.

---

## Core Entities

### 1. Transaction
```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  categoryId: string;
  bucketId?: string;        // Optional: link to specific bucket
  date: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Bucket (Enhanced)
```typescript
interface Bucket {
  id: string;
  name: string;
  allocated: number;        // Budget amount
  actual: number;           // Calculated from transactions
  categoryId: string;
  icon?: string;            // Optional custom icon
  color?: string;           // Optional custom color
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Category
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;            // Optional icon
  type: 'expense' | 'income' | 'both';
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Income (Enhanced)
```typescript
interface Income {
  amount: number;           // Total monthly income
  savings: number;          // Target savings
  currency: string;         // Default: 'USD'
}
```

---

## CRUD Operations Matrix

| Entity | Create | Read | Update | Delete |
|--------|--------|------|--------|--------|
| **Transaction** | Quick-add modal, Full form | List, Detail view, Filters | Edit modal | Confirm delete |
| **Bucket** | Form in Buckets tab | Table, Cards | Inline edit, Modal | Confirm delete |
| **Category** | Modal in Categories tab | Grid/List | Edit modal | Confirm (check dependencies) |

---

## Page Structure

### Navigation
```
├── Dashboard        (Overview, Stats, Charts)
├── Transactions     (CRUD Transactions)
├── Buckets          (CRUD Buckets)
├── Categories       (CRUD Categories)
├── Settings         (Theme, Account, Export)
└── Logout
```

---

## UX Flow Design

### Dashboard Flow
```
┌─────────────────────────────────────────────────────────┐
│  DASHBOARD                                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │ SPENT   │ │ SAVINGS │ │ALLOCATED│ │REMAINING│       │
│  │ $3,050  │ │ $1,000  │ │ $3,300  │ │ $1,700  │       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                          │
│  ┌──────────────────────┐  ┌─────────────────────────┐  │
│  │   INCOME DISTRIBUTION │  │   RECENT TRANSACTIONS   │  │
│  │      [PIE CHART]      │  │   ───────────────────   │  │
│  │                       │  │   Coffee Shop   -$4.50  │  │
│  │   ● Living  50%       │  │   Salary      +$5,000   │  │
│  │   ● Entertainment 15% │  │   Groceries    -$89.00  │  │
│  │   ● Investments 35%   │  │   [View All →]          │  │
│  └──────────────────────┘  └─────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │   SPENDING TREND (Last 7 Days)                    │   │
│  │   [BAR/LINE CHART]                                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Transactions Flow
```
┌─────────────────────────────────────────────────────────┐
│  TRANSACTIONS                          [+ Add Transaction]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 🔍 Search    │ Category ▼ │ Type ▼ │ Date Range ▼│   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  TODAY ─────────────────────────────────────────────    │
│  ┌──────────────────────────────────────────────────┐   │
│  │ ☕ Coffee Shop          Living Expenses   -$4.50 │←──│── Swipe: Edit/Delete
│  │ 🛒 Grocery Store        Living Expenses  -$89.00 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  YESTERDAY ─────────────────────────────────────────    │
│  ┌──────────────────────────────────────────────────┐   │
│  │ 💰 Salary               Income          +$5,000  │   │
│  │ 🎬 Netflix              Entertainment    -$15.99 │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │           SUMMARY: This Month                     │   │
│  │     Income: $5,000  │  Expenses: $2,109.49       │   │
│  │     Net: +$2,890.51                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Add Transaction Modal (Exceptional UX)
```
┌─────────────────────────────────────────────────────────┐
│                    ADD TRANSACTION                    ✕ │
├─────────────────────────────────────────────────────────┤
│                                                          │
│     ┌─────────────┐  ┌─────────────┐                    │
│     │   EXPENSE   │  │   INCOME    │  ← Toggle buttons  │
│     └─────────────┘  └─────────────┘                    │
│                                                          │
│     ┌───────────────────────────────────────────────┐   │
│     │                  $ 0.00                        │   │ ← Large amount input
│     └───────────────────────────────────────────────┘   │
│                                                          │
│     Description                                          │
│     ┌───────────────────────────────────────────────┐   │
│     │ e.g., Coffee at Starbucks                      │   │
│     └───────────────────────────────────────────────┘   │
│                                                          │
│     Category                                             │
│     ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │
│     │🏠 Living│ │🎬 Enter │ │📈 Invest│ │  + New  │    │ ← Visual category picker
│     └─────────┘ └─────────┘ └─────────┘ └─────────┘    │
│                                                          │
│     Bucket (Optional)                                    │
│     ┌───────────────────────────────────────────────┐   │
│     │ Select bucket...                            ▼  │   │
│     └───────────────────────────────────────────────┘   │
│                                                          │
│     Date                                                 │
│     ┌───────────────────────────────────────────────┐   │
│     │ 📅 Today, Jan 14, 2026                         │   │
│     └───────────────────────────────────────────────┘   │
│                                                          │
│     ┌───────────────────────────────────────────────┐   │
│     │              💾 SAVE TRANSACTION               │   │
│     └───────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Categories Management
```
┌─────────────────────────────────────────────────────────┐
│  CATEGORIES                              [+ Add Category]│
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  🏠               │  │  🎬               │             │
│  │  Living Expenses  │  │  Entertainment    │             │
│  │  ████████ $2,500 │  │  ████░░░░ $500    │             │
│  │  5 buckets        │  │  2 buckets        │             │
│  │  [Edit] [Delete]  │  │  [Edit] [Delete]  │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐             │
│  │  📈               │  │  💰               │             │
│  │  Investments      │  │  Income           │             │
│  │  ██████░░ $1,000 │  │  ██████████ $5,000│             │
│  │  1 bucket         │  │  0 buckets        │             │
│  │  [Edit] [Delete]  │  │  [Edit] [Delete]  │             │
│  └──────────────────┘  └──────────────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Settings Page
```
┌─────────────────────────────────────────────────────────┐
│  SETTINGS                                                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  APPEARANCE ─────────────────────────────────────────   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Theme                                            │   │
│  │  ┌────────────┐  ┌────────────┐                  │   │
│  │  │  🌙 Dark   │  │  ☀️ Light  │   ← Toggle       │   │
│  │  └────────────┘  └────────────┘                  │   │
│  │                                                   │   │
│  │  Accent Color                                     │   │
│  │  ● Purple  ○ Blue  ○ Green  ○ Orange             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ACCOUNT ────────────────────────────────────────────   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Monthly Income          $5,000                   │   │
│  │  Target Savings          $1,000                   │   │
│  │  Currency                USD ($)                  │   │
│  │                                                   │   │
│  │  [Update Income Settings]                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  DATA ───────────────────────────────────────────────   │
│  ┌──────────────────────────────────────────────────┐   │
│  │  [Export to CSV]  [Export to PDF]  [Clear Data]   │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Exceptional UX Features

### 1. Micro-Interactions
- **Save Success:** Subtle confetti burst or checkmark animation
- **Delete:** Smooth slide-out with undo toast
- **Hover States:** Lift + glow on all interactive elements
- **Loading:** Skeleton screens, not spinners

### 2. Quick Actions
- **Floating Action Button (FAB):** Quick-add transaction from any page
- **Keyboard Shortcuts:**
  - `N` - New transaction
  - `B` - Go to Buckets
  - `D` - Go to Dashboard
  - `/` - Focus search

### 3. Smart Defaults
- Date defaults to today
- Last used category remembered
- Amount field auto-focused on modal open

### 4. Visual Feedback
- Real-time stat updates on transaction add
- Progress bars animate on changes
- Color-coded transactions (green income, contextual expense)

### 5. Empty States
- Friendly illustrations
- Clear CTAs
- Sample data option for new users

### 6. Responsive Behavior
- Cards stack on mobile
- Bottom sheet modals on mobile
- Touch-friendly hit targets (min 44px)

---

## Implementation Phases

### Phase 1: Core Infrastructure (Current Sprint)
- [ ] Settings page with theme toggle
- [ ] Light mode CSS variables
- [ ] Purple logo variant
- [ ] Account settings (income configuration)

### Phase 2: Categories CRUD
- [ ] Categories page UI
- [ ] Add category modal
- [ ] Edit category modal
- [ ] Delete with dependency check
- [ ] Category icons/colors

### Phase 3: Enhanced Buckets
- [ ] Edit bucket functionality
- [ ] Bucket detail view
- [ ] Link buckets to categories properly
- [ ] Bucket progress visualization

### Phase 4: Transactions
- [ ] Transaction data model
- [ ] Transaction list page
- [ ] Add transaction modal
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Filters (date, category, type)
- [ ] Search functionality

### Phase 5: Dashboard Enhancement
- [ ] Recent transactions widget
- [ ] Spending trend chart
- [ ] Quick-add FAB
- [ ] Real-time updates

### Phase 6: Polish
- [ ] Micro-interactions
- [ ] Keyboard shortcuts
- [ ] Empty states
- [ ] Loading skeletons
- [ ] Error handling
- [ ] Toast notifications

---

## File Structure (Proposed)

```
src/
├── components/
│   ├── common/
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── FAB.tsx
│   │   ├── EmptyState.tsx
│   │   └── ConfirmDialog.tsx
│   ├── dashboard/
│   │   ├── RecentTransactions.tsx
│   │   └── SpendingTrend.tsx
│   ├── transactions/
│   │   ├── TransactionList.tsx
│   │   ├── TransactionItem.tsx
│   │   ├── TransactionForm.tsx
│   │   └── TransactionFilters.tsx
│   ├── categories/
│   │   ├── CategoryGrid.tsx
│   │   ├── CategoryCard.tsx
│   │   └── CategoryForm.tsx
│   ├── settings/
│   │   ├── ThemeToggle.tsx
│   │   ├── AccountSettings.tsx
│   │   └── DataExport.tsx
│   └── ... (existing components)
├── hooks/
│   ├── useTheme.ts
│   ├── useTransactions.ts
│   ├── useCategories.ts
│   └── useKeyboardShortcuts.ts
├── context/
│   ├── ThemeContext.tsx
│   └── AppContext.tsx
├── types/
│   └── index.ts (enhanced)
└── utils/
    ├── formatters.ts
    └── calculations.ts
```

---

## Next Steps

1. **Approve this spec** or request changes
2. Begin Phase 1: Settings + Theme Toggle
3. Implement incrementally with commits per feature

---

## Design Decisions

| Question | Decision |
|----------|----------|
| Should transactions update bucket `actual` values? | **Yes** - Auto-update on transaction add/edit/delete |
| Recurring transactions in MVP? | **No** - Deferred to later phase |
| Can categories with transactions be deleted? | **Yes** - Soft delete: old records retain category name, but category won't appear in future options |

### Soft Delete Strategy for Categories
```typescript
interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  type: 'expense' | 'income' | 'both';
  isDeleted: boolean;      // Soft delete flag
  deletedAt?: Date;        // When deleted
  createdAt: Date;
  updatedAt: Date;
}

// When fetching categories for dropdowns:
const activeCategories = categories.filter(c => !c.isDeleted);

// When displaying transaction history:
// Show category name even if isDeleted === true
```
