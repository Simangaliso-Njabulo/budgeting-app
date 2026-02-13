# Migration Plan: Fully Client-Side PWA on GitHub Pages

## Context

The budgeting app currently runs as a full-stack app (React + FastAPI + SQLite). The goal is to make it **fully client-side** so it can be hosted on GitHub Pages as a PWA with offline support. This requires:
- Replacing the Python backend + SQLite with **IndexedDB** (via Dexie.js) in the browser
- Adding **PWA support** (manifest, service worker, offline caching)
- Keeping the **login/signup UI** working with local IndexedDB storage
- **Migrating existing data** from the backend SQLite database
- Configuring **Vite + GitHub Actions** for GitHub Pages deployment

## Repo & Branch Strategy

**Development:** All work happens on a new branch `feature/client-side-pwa` in this (private) repo so `main` stays untouched.

**Deployment:** A separate **public** repo will be created for GitHub Pages hosting (free plan requires public repos for Pages). When ready:
1. Create new public repo on GitHub (e.g. `Simangaliso-Njabulo/budgeting-app-live`)
2. Push the client-side branch (without `backend/`) to that repo's `main`
3. GitHub Actions in the public repo handles the Pages deployment

**First step:** `git checkout -b feature/client-side-pwa`

---

## Phase 1: Install Dependencies & Create Dexie Database Layer

**Install:**
```
npm install dexie bcryptjs
npm install -D @types/bcryptjs vite-plugin-pwa
```

**Create `src/db/database.ts`** — Dexie database definition with 6 tables:
- `users` — replaces the backend `users` table (id, email, passwordHash, name, currency, theme, accentColor, monthlyIncome, savingsTarget, payDate)
- `categories` — same schema as backend (id, userId, name, color, icon, type, isDeleted, deletedAt)
- `buckets` — (id, userId, categoryId, name, allocated, icon, color)
- `transactions` — (id, userId, categoryId, bucketId, description, amount, type, date, notes, isRecurring, recurringInterval)
- `monthlyIncomes` — (id, userId, year, month, amount, savingsTarget) with compound index `[year+month]`

Key differences from backend: camelCase field names, no server-side timestamps needed, UUIDs via `crypto.randomUUID()`.

**Create service modules** (each replaces the corresponding API object in `src/services/api.ts`):

| New File | Replaces | Notes |
|----------|----------|-------|
| `src/db/userService.ts` | `authApi` + `usersApi` | Uses `bcryptjs` for password hashing client-side. `register()` creates user + runs seed data. `login()` verifies hash. `getMe()` reads from IndexedDB. |
| `src/db/categoryService.ts` | `categoriesApi` | Direct Dexie CRUD. Filters `isDeleted` on reads. |
| `src/db/bucketService.ts` | `bucketsApi` | Direct Dexie CRUD. |
| `src/db/transactionService.ts` | `transactionsApi` | CRUD + `getSummary()` aggregation (ported from backend). Supports filtering by type, category, bucket, date range, search. |
| `src/db/monthlyIncomeService.ts` | `monthlyIncomeApi` | CRUD + `getTrends()` — ports the ~90-line pay-cycle-aware aggregation algorithm from the backend. Uses existing `src/utils/payCycle.ts` helpers. |
| `src/db/seedData.ts` | `backend/app/services/seed_data.py` | Ports the 7 categories + 20 buckets + default ZAR/R20k income setup to TypeScript. Called during registration. |
| `src/db/index.ts` | — | Barrel export for all services. |

---

## Phase 2: Replace API Service Layer with IndexedDB Calls

**Delete:** `src/services/api.ts`

**Rewrite `src/hooks/useBudgetData.ts`:**
- Replace all `xxxApi.yyy()` calls with `xxxService.yyy()` from `src/db/`
- Remove `transformCategory`, `transformBucket`, `transformTransaction` helper functions (no more snake_case to camelCase conversion needed since IndexedDB stores camelCase natively)
- `fetchData()` calls Dexie services directly instead of HTTP endpoints
- `handleUpdateIncome()` calls `userService.update()` + `monthlyIncomeService.upsert()`

**Modify `src/hooks/useBucketActions.ts`:**
- Replace `bucketsApi.*` with `bucketService.*`
- Remove `transformBucket` import

**Modify `src/hooks/useCategoryActions.ts`:**
- Replace `categoriesApi.*` with `categoryService.*`
- Remove `transformCategory` import

**Modify `src/hooks/useTransactionActions.ts`:**
- Replace `transactionsApi.*` with `transactionService.*`
- Remove `transformTransaction` import
- No longer need to convert `categoryId` to `category_id` (was for snake_case API)

---

## Phase 3: Adapt Auth to Work Locally

**Modify `src/hooks/useAuth.ts`:**
- Replace `authApi.login()` with `userService.login(email, password)` which does `bcryptjs.compare()` against IndexedDB
- Replace `authApi.register()` with `userService.register(name, email, password)` which does `bcryptjs.hash()` and seeds default data
- Replace `authApi.resetPassword()` with `userService.resetPassword(email, newPassword)` updates hash in IndexedDB
- Replace `authApi.getMe()` with `userService.getMe(userId)` reads from IndexedDB
- Store logged-in user ID in `localStorage` instead of JWT tokens (no tokens needed)
- Keep `isAuthenticated`, `authPage`, `handleLogin`, `handleSignUp`, `handleLogout` interface identical

**Auth components:** No changes needed to Login.tsx, SignUp.tsx, ForgotPassword.tsx (already just forms calling callbacks)

**Modify `src/App.tsx`:**
- Remove `import { usersApi } from "./services/api"`
- Settings pay date update: replace `usersApi.updateMe({ pay_date: val })` with `userService.update(userId, { payDate: val })`
- `auth.user` data comes from IndexedDB instead of API — same shape, so UI code stays the same

---

## Phase 4: Data Import/Export for Migration

**Create `backend/export_data.py`** — One-time Python script:
- Reads the existing SQLite database using SQLAlchemy models
- Takes user email as argument
- Exports all data (user settings, categories, buckets, transactions, monthly incomes) as a single JSON file
- Converts snake_case to camelCase, UUIDs to strings, Decimals to floats, Dates to ISO strings

**Create `src/db/importExport.ts`:**
- `exportAllData(userId)` — dumps all user's IndexedDB tables to downloadable JSON
- `importData(json)` — validates schema, bulk-inserts into IndexedDB via `db.table.bulkPut()`

**Modify `src/components/Settings.tsx`:**
- Add "Export Data" button that triggers JSON download
- Add "Import Data" button that opens file picker, reads JSON, calls `importData()`

---

## Phase 5: PWA Setup

**Modify `vite.config.ts`:**
- Add `base` path matching the public repo name
- Add `VitePWA` plugin with:
  - `registerType: 'autoUpdate'`
  - Manifest: name "MyBudgeting App", theme `#8b5cf6`, display `standalone`
  - Icons: 192x192 and 512x512 PNG
  - Workbox: precache all static assets

**Modify `index.html`:**
- Update `<title>` from "Vite + React + TS" to "MyBudgeting App"
- Add `<meta name="theme-color" content="#8b5cf6">`
- Add `<meta name="description">`
- Add `<link rel="apple-touch-icon">`

**Create PWA icons:** `public/pwa-192x192.png` and `public/pwa-512x512.png`

---

## Phase 6: GitHub Actions Deployment

**Create `.github/workflows/deploy.yml`** (will be used in the public repo):
```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
      - uses: actions/deploy-pages@v4
```

**When ready to deploy:**
1. Create new **public** repo on GitHub (e.g. `budgeting-app-live`)
2. Update `base` in `vite.config.ts` to match the public repo name
3. Push the client-side code (without `backend/`) to the public repo's `main`
4. In the public repo: Settings > Pages > Source > "GitHub Actions"

---

## Phase 7: Cleanup

- Delete entire `backend/` directory
- Delete `budgeting_app.db` (root-level SQLite file)
- Delete `src/services/api.ts` (already replaced in Phase 2)
- Modify `package.json`: Remove backend-related scripts

---

## Files Changed Summary

| Action | Files |
|--------|-------|
| **CREATE** | `src/db/database.ts`, `src/db/userService.ts`, `src/db/categoryService.ts`, `src/db/bucketService.ts`, `src/db/transactionService.ts`, `src/db/monthlyIncomeService.ts`, `src/db/seedData.ts`, `src/db/importExport.ts`, `src/db/index.ts`, `backend/export_data.py`, `.github/workflows/deploy.yml`, `public/pwa-192x192.png`, `public/pwa-512x512.png` |
| **MODIFY** | `src/hooks/useAuth.ts`, `src/hooks/useBudgetData.ts`, `src/hooks/useBucketActions.ts`, `src/hooks/useCategoryActions.ts`, `src/hooks/useTransactionActions.ts`, `src/App.tsx`, `src/components/Settings.tsx`, `vite.config.ts`, `index.html`, `package.json` |
| **DELETE** | `src/services/api.ts`, `backend/` (entire directory), `budgeting_app.db` |

---

## Verification

1. `npm run build` — must compile with zero TypeScript errors
2. Test locally with `npm run preview` — verify all 5 tabs work, CRUD operations persist in IndexedDB
3. Test auth flow — register new user, seed data appears, logout, login works
4. Test data migration — run `python backend/export_data.py`, import JSON in Settings, verify data
5. Test PWA — Chrome DevTools > Application tab > verify manifest, service worker, installability
6. Test offline — go offline in DevTools, app still loads and works
7. Deploy — push to public repo's main, GitHub Actions builds, verify live URL
