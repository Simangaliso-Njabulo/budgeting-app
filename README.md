# MyBudgeting

A personal budgeting app with pay-cycle-aware budget periods, category-based expense tracking, and spending trends.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Recharts, CSS Modules

**Backend:** FastAPI, SQLAlchemy (async), SQLite (aiosqlite), JWT auth, Alembic migrations

## Features

- **Pay-cycle-aware periods** -- budget months align to your actual pay date (e.g., 28th), not calendar months
- **Category & bucket budgeting** -- organize spending into categories with allocated budgets per bucket
- **Dashboard** -- stat cards with animated progress rings, recent transactions with running balance, spending breakdown donut chart
- **Monthly income tracking** -- per-month income overrides with inline editing from the month selector
- **Spending trends** -- income vs expenses chart over the last 6 pay cycles
- **Transaction management** -- add, edit, delete transactions with quick-date selectors and "Save & Add Another" flow
- **Multi-currency support** -- configurable currency symbol and formatting
- **Dark theme** -- glass-morphism UI with smooth animations

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload
```

The API runs at `http://localhost:8000` with docs at `/docs`.

### Frontend

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | TypeScript check + production build |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run all tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:backend` | Run backend pytest suite |
| `npm run test:all` | Run frontend + backend tests |

## Project Structure

```
src/
  components/       # React components (dashboard, transactions, categories, common)
  context/          # ThemeContext (currency, formatting)
  hooks/            # useBudgetData, useToast, useCategoryActions, useTransactionActions
  services/         # API client (auth, transactions, categories, buckets, monthly income)
  utils/            # Formatters, validators, pay cycle helpers, icon map
  types/            # TypeScript type definitions
backend/
  app/
    models/         # SQLAlchemy models (User, Transaction, Category, Bucket, MonthlyIncome)
    routers/        # FastAPI route handlers
    schemas/        # Pydantic request/response schemas
    services/       # Business logic
    utils/          # Auth dependencies, helpers
  alembic/          # Database migrations
  tests/            # Backend tests
tests/
  L1-UnitTests/     # Unit tests (utils, hooks, components)
  L2-IntegrationTests/ # Integration tests (hooks with mocked APIs)
docs/
  issues/           # Issue tracking (19 issues tracked, all resolved)
```
