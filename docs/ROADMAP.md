# MyBudgeting App - Development Roadmap

## Overview
This document tracks planned improvements, features, and technical decisions for the MyBudgeting App.

---

## Tech Stack

### Frontend (Current)
- **Framework:** React 19.1.1 with TypeScript
- **Build Tool:** Vite 7.1.2
- **Styling:** CSS with CSS Variables (Glassmorphism design)
- **Charts:** Recharts 3.1.2
- **Icons:** Lucide React

### Backend (Implemented)
- **Language:** Python 3.11+
- **Framework:** FastAPI (async)
- **ORM:** SQLAlchemy 2.0 (async)
- **Database:** SQLite (dev) / PostgreSQL (production)
- **Auth:** JWT (access + refresh tokens), bcrypt password hashing

### Database Options

| Database | Type | Pros | Cons | Best For |
|----------|------|------|------|----------|
| **SQLite** | Relational | Zero config, file-based, great for dev | Single-user, limited concurrency | Prototyping, small apps, local-first |
| **PostgreSQL** | Relational | Robust, scalable, great for financial data, ACID compliant | Requires server setup | Production apps, complex queries |
| **MySQL/MariaDB** | Relational | Widely supported, good performance | Less features than PostgreSQL | General web apps |
| **MongoDB** | NoSQL/Document | Flexible schema, easy to start | Not ideal for financial/relational data | Rapid prototyping, unstructured data |
| **Supabase** | PostgreSQL + BaaS | Built-in auth, real-time, REST API auto-generated | Vendor lock-in | Quick MVP with auth needs |
| **Firebase Firestore** | NoSQL/Document | Real-time sync, Google auth integration | Costs at scale, NoSQL limitations | Mobile-first apps |
| **PlanetScale** | MySQL (Serverless) | Branching, scalable, generous free tier | MySQL syntax | Serverless deployments |

### Recommended Database Choice
**PostgreSQL** - Best for a budgeting/financial app because:
- ACID compliance ensures data integrity for financial transactions
- Strong support for decimal/money types
- Excellent query capabilities for reporting
- Scales well from development to production
- Great Python support with SQLAlchemy or asyncpg

### Python Backend Framework Options

| Framework | Type | Pros | Cons | Best For |
|-----------|------|------|------|----------|
| **FastAPI** | Async API | Modern, fast, auto-docs, type hints | Newer ecosystem | REST APIs, modern Python |
| **Flask** | Micro | Simple, flexible, large ecosystem | Manual setup for features | Small to medium apps |
| **Django** | Full-stack | Batteries included, ORM, admin panel | Opinionated, heavier | Large apps, rapid development |
| **Django REST Framework** | API | Built on Django, powerful serializers | Learning curve | Full-featured REST APIs |

### Recommended Backend Stack
```
FastAPI + PostgreSQL + SQLAlchemy (async)
```
- FastAPI for modern async REST API with automatic OpenAPI docs
- PostgreSQL for reliable financial data storage
- SQLAlchemy 2.0 with async support for ORM
- Alembic for database migrations
- Pydantic for data validation (built into FastAPI)

---

## Current State

### Completed Features

#### Frontend
- [x] Dashboard with stat cards, charts, recent transactions
- [x] Bucket management (CRUD)
- [x] Transaction management (CRUD)
- [x] Category management (CRUD)
- [x] Dark/Light theme toggle
- [x] Accent color selection (Purple, Blue, Green, Orange)
- [x] Currency selection (USD, ZAR, EUR, GBP, JPY, INR)
- [x] Authentication UI (Login, SignUp, Forgot Password)
- [x] Toast notifications
- [x] Confirmation dialogs
- [x] Empty states
- [x] Transaction filtering (search, category, type, date range)
- [x] Bucket filtering (search, category)
- [x] Spending trend chart (7-day)
- [x] Income distribution pie chart
- [x] Password strength indicator
- [x] Month selector with prev/next navigation
- [x] Monthly income edit modal (from month selector)
- [x] Monthly trend chart (income vs expenses over 6 months)
- [x] Period-filtered dashboard (transactions scoped to selected month)

#### Backend
- [x] FastAPI project with async SQLAlchemy
- [x] User registration and login with JWT authentication
- [x] Categories, Buckets, Transactions CRUD with user isolation
- [x] Monthly income tracking per user per month (get-or-create pattern)
- [x] Monthly trends endpoint (income vs expenses over N months)
- [x] Seed data service for new user onboarding
- [x] Soft delete for categories
- [x] Transaction summary endpoint with date range filtering
- [x] SQLite database with auto-table creation

### Known Issues Fixed
- [x] Cursor issues on auth pages
- [x] Input icon/text overlap
- [x] Checkbox checkmark styling
- [x] Hover glow effects on inputs
- [x] Sidebar header cursor issues
- [x] Auth success message cursor

---

## Planned Improvements

### Phase 1: UI/UX Polish (Frontend)
| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Mobile responsive layout | High | Pending | Sidebar collapse, touch-friendly |
| Loading skeletons | Medium | Pending | Better perceived performance |
| Form validation improvements | Medium | Pending | Real-time validation feedback |
| Keyboard navigation | Medium | Pending | Tab order, focus management |
| Accessibility (ARIA labels) | Medium | Pending | Screen reader support |
| Error boundaries | Low | Pending | Graceful error handling |
| Animated page transitions | Low | Pending | Smooth tab switching |

### Phase 2: Data Persistence (Frontend)
| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| localStorage for settings | High | Pending | Theme, currency already done |
| localStorage for data | High | Pending | Buckets, transactions, categories |
| Import/Export JSON | Medium | Pending | Backup and restore |
| CSV export | Medium | Pending | TODO in Settings.tsx |
| PDF export | Low | Pending | TODO in Settings.tsx |
| Clear all data | Low | Pending | TODO in Settings.tsx |

### Phase 3: Backend Development (Python) -- COMPLETED
| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| Setup FastAPI project | High | Done | Project structure, config |
| Database schema design | High | Done | Users, buckets, transactions, categories, monthly_incomes |
| User authentication API | High | Done | JWT tokens (access + refresh), bcrypt hashing |
| CRUD API endpoints | High | Done | All entities including monthly income |
| API documentation | Medium | Done | Auto-generated Swagger at /docs |
| Input validation | Medium | Done | Pydantic v2 models |
| Monthly income tracking | High | Done | Per-month income records with get-or-create |
| Trend analytics endpoint | Medium | Done | Income vs expenses over N months |
| Database migrations | Medium | Pending | Alembic setup (currently using auto-create) |
| Rate limiting | Low | Pending | API protection |
| Logging | Low | Pending | Request/error logging |

### Phase 4: Frontend-Backend Integration -- COMPLETED
| Task | Priority | Status | Notes |
|------|----------|--------|-------|
| API service layer | High | Done | fetch wrapper with auth headers |
| Authentication flow | High | Done | Login, register, logout, token refresh |
| Protected routes | High | Done | JWT-based auth guards |
| Data sync | High | Done | All data fetched from API |
| Error handling | Medium | Done | Toast notifications for API errors |
| Offline support | Low | Pending | Cache + sync when online |

### Phase 5: New Features
| Feature | Priority | Status | Notes |
|---------|----------|--------|-------|
| Monthly income tracking | High | Done | Per-month income with get-or-create |
| Monthly trends chart | High | Done | Income vs expenses bar chart over 6 months |
| Month selector | High | Done | Navigate months on dashboard |
| Inline income edit | High | Done | Edit income from month selector modal |
| Recurring transactions | High | Pending | Monthly bills, subscriptions (model fields exist) |
| Budget alerts/notifications | High | Pending | When approaching limits |
| Savings goals | Medium | Pending | Target amount, progress tracking |
| Date range reports | Medium | Done | Transaction summary with date filters |
| Transaction search | Medium | Done | Full-text search on description |
| Bill reminders | Medium | Pending | Due date notifications |
| Subscription tracker | Low | Pending | Track recurring subscriptions |
| Bank sync (Plaid/Yodlee) | Low | Pending | Auto-import transactions |
| AI insights | Low | Pending | Spending pattern analysis |
| Multi-currency support | Low | Pending | Multiple accounts in different currencies |

---

## Database Schema (Draft)

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    theme VARCHAR(10) DEFAULT 'dark',
    accent_color VARCHAR(20) DEFAULT 'purple',
    monthly_income DECIMAL(12, 2) DEFAULT 0,
    savings_target DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL, -- hex color
    icon VARCHAR(50),
    type VARCHAR(10) NOT NULL CHECK (type IN ('expense', 'income', 'both')),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Buckets table
CREATE TABLE buckets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    allocated DECIMAL(12, 2) NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    color VARCHAR(7),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    bucket_id UUID REFERENCES buckets(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_interval VARCHAR(20), -- 'daily', 'weekly', 'monthly', 'yearly'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly Income table (tracks income per month per user)
CREATE TABLE monthly_incomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    savings_target DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, year, month)
);

-- Savings Goals table (future)
CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    target_amount DECIMAL(12, 2) NOT NULL,
    current_amount DECIMAL(12, 2) DEFAULT 0,
    target_date DATE,
    color VARCHAR(7),
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_buckets_user ON buckets(user_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_monthly_incomes_user ON monthly_incomes(user_id);
```

---

## API Endpoints (Draft)

### Authentication
```
POST   /api/auth/register     - Create new account
POST   /api/auth/login        - Login and get JWT token
POST   /api/auth/logout       - Invalidate token
POST   /api/auth/refresh      - Refresh JWT token
POST   /api/auth/forgot       - Send password reset email
POST   /api/auth/reset        - Reset password with token
```

### Users
```
GET    /api/users/me          - Get current user profile
PUT    /api/users/me          - Update user profile
PUT    /api/users/me/password - Change password
DELETE /api/users/me          - Delete account
```

### Categories
```
GET    /api/categories        - List all categories
POST   /api/categories        - Create category
GET    /api/categories/:id    - Get category by ID
PUT    /api/categories/:id    - Update category
DELETE /api/categories/:id    - Soft delete category
```

### Buckets
```
GET    /api/buckets           - List all buckets
POST   /api/buckets           - Create bucket
GET    /api/buckets/:id       - Get bucket by ID
PUT    /api/buckets/:id       - Update bucket
DELETE /api/buckets/:id       - Delete bucket
GET    /api/buckets/:id/stats - Get bucket spending stats
```

### Transactions
```
GET    /api/transactions      - List transactions (with filters)
POST   /api/transactions      - Create transaction
GET    /api/transactions/:id  - Get transaction by ID
PUT    /api/transactions/:id  - Update transaction
DELETE /api/transactions/:id  - Delete transaction
GET    /api/transactions/summary - Get income/expense summary
```

### Monthly Income
```
GET    /api/monthly-income              - List all monthly income records (?year=)
GET    /api/monthly-income/trends       - Income vs expenses for last N months (?months=6)
GET    /api/monthly-income/{year}/{month} - Get or auto-create income for a month
PUT    /api/monthly-income/{year}/{month} - Update income for a month
```

### Reports (Planned)
```
GET    /api/reports/spending-trend   - Daily spending for date range
GET    /api/reports/category-breakdown - Spending by category
GET    /api/reports/monthly-summary  - Monthly income/expense summary
```

---

## Project Structure (Backend)

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Configuration settings
│   ├── database.py          # Database connection
│   ├── models/              # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── bucket.py
│   │   ├── transaction.py
│   │   └── monthly_income.py
│   ├── schemas/             # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── category.py
│   │   ├── bucket.py
│   │   ├── transaction.py
│   │   └── monthly_income.py
│   ├── routers/             # API routes
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── users.py
│   │   ├── categories.py
│   │   ├── buckets.py
│   │   ├── transactions.py
│   │   └── monthly_income.py
│   ├── services/            # Business logic
│   │   ├── __init__.py
│   │   └── seed_data.py
│   └── utils/               # Utilities
│       ├── __init__.py
│       ├── security.py      # Password hashing, JWT
│       └── dependencies.py  # FastAPI dependencies
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── tests/                   # Test files
│   ├── __init__.py
│   ├── test_auth.py
│   └── test_transactions.py
├── requirements.txt
├── alembic.ini
├── .env.example
└── README.md
```

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/budgeting_app

# JWT
JWT_SECRET_KEY=your-super-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7

# App
APP_ENV=development
DEBUG=true
CORS_ORIGINS=http://localhost:5173

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

---

## Dependencies (requirements.txt)

```txt
# Core
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
python-dotenv>=1.0.0

# Database
sqlalchemy>=2.0.0
asyncpg>=0.29.0
alembic>=1.13.0

# Authentication
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6

# Validation
pydantic>=2.5.0
pydantic-settings>=2.1.0
email-validator>=2.1.0

# Development
pytest>=7.4.0
pytest-asyncio>=0.23.0
httpx>=0.26.0

# Optional
aiosmtplib>=3.0.0  # For sending emails
```

---

## Getting Started (Backend)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000

# API docs available at:
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

---

## Progress Tracking

### Sprint 1 -- COMPLETED
- [x] Finalize database choice (SQLite dev / PostgreSQL prod)
- [x] Setup backend project structure (FastAPI + SQLAlchemy async)
- [x] Implement user authentication (JWT access + refresh tokens)
- [x] Create basic CRUD endpoints (users, categories, buckets, transactions)

### Sprint 2 -- COMPLETED
- [x] Frontend API integration (fetch wrapper with auth)
- [x] Protected routes (JWT-based)
- [x] Data sync (all CRUD operations via API)

### Sprint 3 -- IN PROGRESS
- [x] Monthly income tracking and trends
- [x] Month selector and inline income editing
- [ ] Recurring transactions (model fields exist, auto-generation pending)
- [ ] Budget alerts
- [ ] Reports

---

## Notes

- Backend is live and fully integrated with the frontend
- All data is persisted via API (no more mock data)
- Monthly income is tracked per month per user with auto-creation from defaults
- User data isolation is enforced via user_id on all models + JWT auth
- Tables auto-create on startup via `create_tables()` (no Alembic migrations yet)

---

*Last Updated: January 28, 2026*
