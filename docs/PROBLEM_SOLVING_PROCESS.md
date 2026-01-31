# Problem-Solving Process Reference Guide

This document outlines the systematic approach used to solve bugs and implement features in this project.

## Documentation Location

**IMPORTANT:** All project documentation must be stored in the `docs/` folder:
- Issue tracking: `docs/issues/` folder (individual issue files)
  - Index: `docs/issues/README.md` (searchable table of all issues)
  - Individual issues: `docs/issues/NNN-description.md`
- Problem-solving process: `docs/PROBLEM_SOLVING_PROCESS.md`
- Other documentation: `docs/`

Do not create documentation files in the root directory.

### Issue File Naming Convention

**Format:** `NNN-short-description.md`
- 3-digit number prefix (001, 002, 003...)
- Kebab-case description (lowercase with hyphens)
- Keep description concise but searchable (1-3 words focused on main concept)
- When you hit 1000 issues, simply add a 4th digit (1000, 1001...)

**Examples:**
- `001-dashboard-layout.md`
- `013-form-validation-ux.md`
- `014-dashboard-refresh.md`

**How users find issues:**
1. Open `docs/issues/README.md`
2. Use Ctrl+F to search for keywords in the table
3. Click the link to view the full issue file

## The Process (Step-by-Step)

### 1. **Document the Issue First**
- Create a new issue file in `docs/issues/NNN-description.md`:
  - Determine the next issue number (check `docs/issues/README.md` for the latest)
  - Create file with format: `NNN-short-description.md`
  - Include in the file:
    - Clear issue title and number
    - Status: `⏳ Open` initially
    - Location: File paths and line numbers
    - Root Cause: Leave as "TBD" initially, fill after investigation
    - Fix: Leave as "TBD" initially, fill after implementation
- Add entry to `docs/issues/README.md` table

**Example:**

Create file `docs/issues/015-form-validation-ux.md`:
```markdown
# Issue 015: Form validation UX - buttons grayed out instead of showing helpful errors

**Status:** ⏳ Open

## Location
TBD

## Root Cause
TBD

## Fix
TBD
```

Then add to README.md table:
```markdown
| 015 | Form validation UX - buttons grayed out instead of showing helpful errors | ⏳ Open | [015-form-validation-ux.md](015-form-validation-ux.md) |
```

### 2. **Reproduce & Understand the Problem**
- Read the user's description carefully
- Identify all symptoms mentioned
- Look for related code using search tools:
  - `Grep` to find relevant code patterns
  - `Read` to examine specific files
  - `Task` with `Explore` agent for complex codebases

**Example from Issue 8:**
- User said: "Save & Add Another is not grayed out but nothing happens when I click it if there are missing fields"
- Used `Read` to examine TransactionForm.tsx validation logic
- Found: Both buttons used `disabled={!isValid}` but "Save & Add Another" is `type="button"` (bypasses HTML5 validation)

### 3. **Investigate Root Cause**
- Trace the code path from user action to result
- Check state management flow
- Look for:
  - Stale closures
  - Missing state updates
  - Improper React patterns (side effects in updaters)
  - Event handling issues
  - CSS/styling conflicts

**Investigation Tools:**
- `Grep` for finding where functions/variables are used
- `Read` with line offsets for context around specific code
- Check React DevTools patterns (hooks, state, props flow)

**Example from Issue 9:**
```
User: Dashboard requires browser refresh to see new transactions

Investigation:
1. Check how RecentTransactions component receives data
   → Found: receives `periodTransactions` prop
2. Check how `periodTransactions` is computed
   → Found: `const periodTransactions = transactions.filter(...)`
3. Check how `transactions` state is updated
   → Found: `setTransactions` called with new data
4. Check if there are side effects disrupting React
   → Found: `setBuckets()` called INSIDE `setTransactions` updater
   → ROOT CAUSE: Calling setState during another setState updater violates purity
```

### 4. **Design the Fix**
- Consider multiple approaches
- Choose the one that:
  - Fixes the root cause (not just symptoms)
  - Follows React/framework best practices
  - Minimizes code changes
  - Doesn't introduce new bugs

**Example from Issue 9:**
```
Considered approaches:
A) Extract setBuckets outside updater → but variable scope issues
B) Use useEffect to sync buckets → adds unnecessary complexity
C) Use queueMicrotask() to defer setBuckets → clean, respects React purity
✓ Chose C
```

### 5. **Implement the Fix**
- Make targeted changes to specific files
- Update one concern at a time
- Use `Edit` tool with exact `old_string` matching

**Best Practices:**
- Keep changes minimal and focused
- Preserve existing code style
- Don't refactor unrelated code
- Add comments if logic is complex

**Example from Issue 8:**
```typescript
// Before
const isValid = form.description.trim() && form.amount > 0 && form.bucketId;
<button disabled={!isValid}>Save Transaction</button>

// After
const [errors, setErrors] = useState<{
  description?: string;
  amount?: string;
  bucketId?: string;
}>({});

const validateForm = (): boolean => {
  const newErrors: typeof errors = {};
  if (!form.description.trim()) {
    newErrors.description = 'Please enter a description';
  }
  // ... more validation
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

<button onClick={...}>Save Transaction</button> // No disabled attribute
{errors.description && <span className="form-error">{errors.description}</span>}
```

### 6. **Verify the Fix**
Run checks in this order:

1. **TypeScript Type Check**
   ```bash
   npx tsc --noEmit
   ```
   - Must pass with 0 errors
   - Catches type issues early

2. **Production Build**
   ```bash
   npx vite build
   ```
   - Ensures code compiles
   - Catches runtime issues
   - Verifies no import/export errors

3. **Manual Testing** (if possible)
   - Test the specific scenario user reported
   - Test edge cases
   - Verify no regressions

### 7. **Update Documentation**
Update the issue file in `docs/issues/NNN-description.md` with complete information:

**Example:** Update `docs/issues/013-form-validation-ux.md`:
```markdown
# Issue 013: Form validation UX - buttons grayed out instead of showing helpful errors

**Status:** ✅ Fixed

## Location
- [src/components/transactions/TransactionForm.tsx](../../src/components/transactions/TransactionForm.tsx) (validation logic, error display)
- [src/index.css](../../src/index.css) (error styles)

## Root Cause
Both "Save Transaction" and "Save & Add Another" buttons were using `disabled={!isValid}` which grays them out when required fields are empty. This is bad UX because:
1. Users can't click to see what's wrong
2. No feedback on which fields are missing
3. "Save & Add Another" appeared clickable but did nothing (no validation messages)

## Fix
1. Removed `disabled` attribute from both buttons - both are now always clickable
2. Removed `required` attribute from inputs (no native HTML5 validation)
3. Added `errors` state object to track validation errors per field
4. Created `validateForm()` function that checks all fields and sets specific error messages
5. Added error styling: red borders on invalid fields, error text below each field
6. Errors clear when user starts typing in the field
7. Validation runs when either button is clicked, showing user-friendly messages

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
```

Then update the status in `docs/issues/README.md`:
```markdown
| 013 | Form validation UX - buttons grayed out instead of showing helpful errors | ✅ Fixed | [013-form-validation-ux.md](013-form-validation-ux.md) |
```

### 8. **Mark Todo Items as Complete**
Track progress using `TodoWrite` tool:
- Mark current task as completed
- Move to next task
- Update status in real-time

---

## Common Problem Patterns & Solutions

### Pattern 1: State Not Updating (Stale Closure)
**Symptom:** UI doesn't reflect new data, especially after rapid clicks

**Root Cause:** Reading state from closure instead of using functional updates

**Solution:**
```typescript
// ❌ Bad: Stale closure
setTransactions([...transactions, newItem]);

// ✅ Good: Functional update
setTransactions(prev => [...prev, newItem]);
```

### Pattern 2: Component Not Re-rendering
**Symptom:** Data updates in state but UI stays the same

**Root Causes:**
1. Computed values not recalculating
2. Impure state updaters disrupting React
3. Component memoized without proper deps

**Solutions:**
```typescript
// Issue: Side effect in updater
setTransactions(prev => {
  const newTxs = [...prev, newItem];
  setBuckets(recalculate(newTxs)); // ❌ Side effect
  return newTxs;
});

// Fix: Defer side effect
setTransactions(prev => {
  const newTxs = [...prev, newItem];
  queueMicrotask(() => {
    setBuckets(recalculate(newTxs)); // ✅ Deferred
  });
  return newTxs;
});
```

### Pattern 3: Form Validation UX Issues
**Symptom:** Buttons disabled, no helpful error messages

**Solution:**
1. Remove `disabled` attributes
2. Add error state: `const [errors, setErrors] = useState<Record<string, string>>({});`
3. Validate on click, show specific errors
4. Clear errors on input change
5. Style errors with red borders and text

### Pattern 4: CSS Conflicts (Z-index, Positioning)
**Symptom:** Element not clickable or invisible

**Investigation:**
- Check `z-index` values
- Check `position` (absolute/fixed)
- Check overlapping elements
- Use browser DevTools to inspect layers

**Example:**
```css
/* Toast was covering FAB */
.toast {
  bottom: 24px; /* ❌ Same position as FAB */
  z-index: 2000; /* Higher than FAB z-index: 100 */
}

/* Fix: Move toast */
.toast {
  bottom: 80px; /* ✅ Clear of FAB */
  z-index: 2000;
}
```

---

## Tools & Commands Reference

### Investigation Phase
```bash
# Find all usages of a function/variable
Grep pattern="functionName" output_mode="content"

# Find files by pattern
Glob pattern="**/ComponentName.tsx"

# Read specific file sections
Read file_path="..." offset=100 limit=50

# Deep codebase exploration
Task subagent_type="Explore" prompt="Find where errors are handled"
```

### Verification Phase
```bash
# Type check
npx tsc --noEmit

# Production build
npx vite build

# Run tests (if available)
npm test
```

### Common Grep Patterns
```bash
# Find React state hooks
pattern="useState|useEffect"

# Find component props
pattern="interface.*Props"

# Find error handling
pattern="try\s*\{|catch\s*\("

# Find CSS classes
pattern="\.class-name"

# Find imports
pattern="^import.*from"
```

---

## Checklist for Every Bug Fix

- [ ] Create issue file in docs/issues/NNN-description.md (Status: ⏳ Open)
- [ ] Add entry to docs/issues/README.md table
- [ ] Reproduce the problem
- [ ] Investigate root cause (not just symptoms)
- [ ] Design a fix (consider multiple approaches)
- [ ] Implement the fix (minimal, targeted changes)
- [ ] Run TypeScript type check: `npx tsc --noEmit`
- [ ] Run production build: `npx vite build`
- [ ] Update issue file with root cause and fix details
- [ ] Mark issue Status as ✅ Fixed
- [ ] Update status in docs/issues/README.md
- [ ] Add build verification note to issue file
- [ ] Mark todo items as completed

---

## Example: Full Problem-Solving Flow

**User Report:** "Dashboard recent transactions require browser refresh to update"

### Step 1: Document
Create `docs/issues/015-dashboard-refresh.md`:
```markdown
# Issue 015: Dashboard recent transactions not updating after save

**Status:** ⏳ Open

## Location
TBD

## Root Cause
TBD

## Fix
TBD
```

Add to `docs/issues/README.md`:
```markdown
| 015 | Dashboard recent transactions not updating after save | ⏳ Open | [015-dashboard-refresh.md](015-dashboard-refresh.md) |
```

### Step 2: Reproduce & Understand
- User is on dashboard tab
- Clicks FAB → Opens transaction modal
- Enters transaction → Clicks "Save & Add Another"
- Transaction saves but Recent Transactions widget shows old data
- Browser refresh shows the new transaction

### Step 3: Investigate
```bash
# Find RecentTransactions component
Glob pattern="**/RecentTransactions.tsx"

# Check how it receives data
Read file_path="src/components/dashboard/RecentTransactions.tsx"
# → Found: receives `transactions` prop

# Find where it's rendered
Grep pattern="<RecentTransactions" path="src/App.tsx"
# → Found: <RecentTransactions transactions={periodTransactions} />

# Check periodTransactions
Grep pattern="const periodTransactions" path="src/App.tsx"
# → Found: const periodTransactions = transactions.filter(...)
# → This should recompute when `transactions` state changes

# Check how transactions state is updated
Read file_path="src/App.tsx" offset=686 limit=60
# → Found: setTransactions() updater with setBuckets() call inside
# → ROOT CAUSE: Calling setState inside another setState updater
```

### Step 4: Design Fix
```
Options:
A) Move setBuckets outside → scope issues with newTxs variable
B) Use useEffect to watch transactions → extra complexity
C) Use queueMicrotask to defer setBuckets → clean & follows React rules

Choose C: queueMicrotask() defers execution after updater completes
```

### Step 5: Implement
```typescript
// Edit App.tsx
setTransactions(prev => {
  const newTxs = [...prev, newTransaction];
  queueMicrotask(() => {
    setBuckets(prevBuckets =>
      recalculateBucketSpending(newTxs, prevBuckets)
    );
  });
  return newTxs;
});
```

### Step 6: Verify
```bash
npx tsc --noEmit  # ✓ Passed
npx vite build    # ✓ Succeeded
```

### Step 7: Update Documentation
Update `docs/issues/015-dashboard-refresh.md`:
```markdown
# Issue 015: Dashboard recent transactions not updating after save

**Status:** ✅ Fixed

## Location
- [src/App.tsx](../../src/App.tsx) (saveTransaction, line ~698-731)

## Root Cause
Calling `setBuckets()` directly inside the `setTransactions()` updater function causes the state update to execute synchronously during the render phase. React's state updater functions should be pure, and calling another setState during an updater can cause batching issues where the component doesn't properly re-render with the new data.

## Fix
Wrapped the `setBuckets()` call inside `queueMicrotask()` to defer it until after the `setTransactions` updater completes. This ensures React can properly batch the updates while keeping the bucket recalculation logic connected to the transaction list it depends on.

## Build Verification
- TypeScript check: Passed (`npx tsc --noEmit`)
- Production build: Succeeded (`npx vite build`)
```

Update `docs/issues/README.md`:
```markdown
| 015 | Dashboard recent transactions not updating after save | ✅ Fixed | [015-dashboard-refresh.md](015-dashboard-refresh.md) |
```

### Step 8: Mark Complete
```
TodoWrite: Mark "Fix dashboard refresh issue" as completed
```

---

## Key Principles

1. **Always document before, during, and after**
   - docs/issues/ folder tracks the full journey of each issue
   - Each issue gets its own file for easy reference
   - Future you (or others) will thank you

2. **Understand root cause, don't patch symptoms**
   - Symptoms: "Dashboard doesn't update"
   - Root cause: "setState called during another setState updater"

3. **Make minimal, focused changes**
   - Don't refactor unrelated code
   - One problem, one solution

4. **Verify every change**
   - TypeScript check catches type errors
   - Build check catches runtime errors
   - Both must pass

5. **Follow framework best practices**
   - React: Pure updater functions
   - TypeScript: Proper types
   - CSS: Proper specificity and z-index management

6. **Test edge cases**
   - Rapid clicks
   - Empty states
   - Error conditions
   - Different user flows

---

## When to Ask for Help

If after investigating you find:
- Multiple potential root causes
- Conflicting requirements
- Architectural decisions needed
- Breaking changes required

→ Use `AskUserQuestion` tool to clarify before implementing

**Example:**
```typescript
AskUserQuestion({
  questions: [{
    question: "Should validation errors appear immediately on blur, or only when user clicks save?",
    header: "Validation UX",
    options: [
      { label: "On blur (immediate)", description: "Show errors as soon as user leaves a field" },
      { label: "On save (delayed)", description: "Only show errors when user tries to save" }
    ]
  }]
})
```
