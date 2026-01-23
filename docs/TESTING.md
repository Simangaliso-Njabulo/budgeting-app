# Testing Strategy & Guide

This document covers the complete testing strategy for the MyBudgeting App.

## Testing Pyramid Overview

```
                    ┌─────────────┐
                    │    E2E      │  L3 - End-to-End Tests
                    │   Tests     │  (Full user flows)
                    └──────┬──────┘
                   ┌───────┴───────┐
                   │  Integration  │  L2 - Integration Tests
                   │    Tests      │  (Component interactions)
                   └───────┬───────┘
              ┌────────────┴────────────┐
              │       Unit Tests        │  L1 - Unit Tests
              │   (Functions, Components)│  (Isolated logic)
              └─────────────────────────┘
```

## Current Test Coverage

| Layer | Frontend | Backend | Status |
|-------|----------|---------|--------|
| **L1 - Unit Tests** | ✅ 6 test files | ✅ 82 tests, 79% coverage | Implemented |
| **L2 - Integration** | ⚠️ Structure only | ✅ API endpoint tests | Partial |
| **L3 - E2E Tests** | ❌ Not implemented | N/A | Future |
| **L4 - Contract Tests** | ❌ Not implemented | ❌ Not implemented | Future |

---

## Quick Start: Running Tests

### Run All Tests (Recommended)

```bash
# From project root - runs both frontend and backend tests
npm run test:all
```

Or run them separately:

```bash
# Frontend tests
npm test

# Backend tests
cd backend
venv/Scripts/activate    # Windows
pytest tests/ -v
```

### Frontend Tests Only

```bash
# Run all frontend tests
npm test

# Run with UI
npm run test:ui

# Run once (no watch)
npm run test:run

# Run with coverage
npm run test:coverage

# Run only L1 unit tests
npm run test:l1
```

### Backend Tests Only

```bash
cd backend
venv/Scripts/activate    # Windows (or: source venv/bin/activate on Mac/Linux)

# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=app --cov-report=term-missing

# Run specific test file
pytest tests/test_auth.py -v

# Run specific test class
pytest tests/test_auth.py::TestLogin -v

# Run specific test
pytest tests/test_auth.py::TestLogin::test_login_json_success -v

# Generate HTML coverage report
pytest tests/ --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

---

## L1 - Unit Tests (Isolated Logic)

### What L1 Tests Cover
- Pure functions (no side effects)
- Utility functions
- Validators
- Formatters
- Individual component rendering

### Frontend L1 Tests

Location: `tests/L1-UnitTests/`

| File | Tests | Description |
|------|-------|-------------|
| `utils/helpers.test.ts` | ~20 | Income/expense calculations, grouping |
| `utils/formatters.test.ts` | ~15 | Currency, date, number formatting |
| `utils/validators.test.ts` | ~15 | Input validation functions |
| `components/EmptyState.test.tsx` | ~5 | Empty state component rendering |
| `components/Toast.test.tsx` | ~5 | Toast notification rendering |
| `components/TransactionSummary.test.tsx` | ~10 | Summary component rendering |

```bash
# Run L1 tests only
npm run test:l1
```

### Backend L1 Tests

The backend tests are primarily integration tests that test the API endpoints, but they include unit test aspects for:
- Password hashing/verification
- JWT token creation/validation
- Input validation via Pydantic schemas

---

## L2 - Integration Tests (Component Interactions)

### What L2 Tests Cover
- Multiple components working together
- API endpoint testing
- Database interactions
- Authentication flows

### Frontend L2 Tests

Location: `tests/L2-IntegrationTests/` (structure exists, tests to be added)

**Planned tests:**
- Form submission flows
- State management (Zustand store)
- API client integration
- Multi-component interactions

### Backend L2 Tests (Implemented)

Location: `backend/tests/`

| File | Tests | Coverage |
|------|-------|----------|
| `test_auth.py` | 15 | Registration, login, token refresh |
| `test_users.py` | 11 | Profile CRUD, password change |
| `test_categories.py` | 15 | Category CRUD, soft delete |
| `test_buckets.py` | 18 | Bucket CRUD, stats |
| `test_transactions.py` | 23 | Transaction CRUD, filtering, summary |

**Total: 82 tests, 79% code coverage**

---

## L3 - End-to-End Tests (Full User Flows)

### What E2E Tests Cover
- Complete user journeys
- Real browser interactions
- Full stack testing (frontend + backend)

### Status: Not Yet Implemented

**Recommended tool:** Playwright (modern, fast, reliable)

**Planned test scenarios:**
1. User registration and login flow
2. Create budget category and bucket
3. Add income and expense transactions
4. View transaction summary and reports
5. Edit and delete transactions
6. User settings and preferences

**Future setup:**
```bash
# Install Playwright
npm install -D @playwright/test

# Initialize
npx playwright install
```

---

## L4 - Contract Tests (API Contracts)

### What Contract Tests Cover
- API request/response schemas
- Ensure frontend and backend agree on data formats
- Prevent breaking changes

### Status: Not Yet Implemented

**Recommended approach:**
- Use Pydantic schemas for backend validation
- Generate TypeScript types from OpenAPI spec
- Test frontend against generated types

---

## Test Fixtures & Mock Data

### Frontend Fixtures

Location: `tests/fixtures/index.ts`

```typescript
import { mockTransactions, mockBuckets, mockCategories, mockUser } from '../fixtures';

// Create custom test data
const transaction = createMockTransaction({ amount: 100 });
```

### Backend Fixtures

Location: `backend/tests/conftest.py`

```python
# Available fixtures:
# - client: AsyncClient for API requests
# - test_user: Authenticated user with tokens
# - test_category: Pre-created category
# - test_bucket: Pre-created bucket
# - test_transaction: Pre-created transaction

async def test_example(client, test_user):
    headers = {"Authorization": f"Bearer {test_user['access_token']}"}
    response = await client.get("/api/users/me", headers=headers)
    assert response.status_code == 200
```

---

## Coverage Reports

### Frontend Coverage

```bash
npm run test:coverage
```

Report location: `./coverage/index.html`

### Backend Coverage

```bash
cd backend
pytest tests/ --cov=app --cov-report=html
```

Report location: `backend/htmlcov/index.html`

### Current Backend Coverage

| Module | Coverage |
|--------|----------|
| `config.py` | 100% |
| `schemas/*` | 100% |
| `models/*` | 95-96% |
| `routers/users.py` | 87% |
| `routers/transactions.py` | 65% |
| `utils/security.py` | 95% |
| **Total** | **79%** |

---

## Adding New Tests

### Frontend: Add a Unit Test

```typescript
// tests/L1-UnitTests/utils/myUtil.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from '../../../src/utils/myUtil';

describe('myFunction', () => {
  it('should return expected value', () => {
    expect(myFunction('input')).toBe('expected');
  });
});
```

### Frontend: Add a Component Test

```typescript
// tests/L1-UnitTests/components/MyComponent.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../../../src/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### Backend: Add an API Test

```python
# backend/tests/test_myfeature.py
import pytest
from httpx import AsyncClient

class TestMyFeature:
    async def test_my_endpoint(self, client: AsyncClient, test_user: dict):
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/my-endpoint", headers=headers)

        assert response.status_code == 200
        assert "expected_field" in response.json()
```

---

## CI/CD Integration (Future)

### Recommended GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:coverage

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'
      - run: |
          cd backend
          pip install -r requirements.txt
          pytest tests/ --cov=app
```

---

## What to Add Now vs Later

### Add Now (Quick Wins)
1. ✅ More backend API tests (done - 82 tests)
2. Frontend integration tests for Zustand stores
3. Component tests for main UI components

### Add Later (When Needed)
1. **E2E tests** - When frontend connects to backend
2. **Contract tests** - When API is stable
3. **Performance tests** - Before production
4. **CI/CD pipeline** - Before team collaboration

---

## Troubleshooting

### Frontend Tests Not Running

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm test
```

### Backend Tests Failing

```bash
cd backend

# Ensure virtual environment is active
venv/Scripts/activate  # Windows

# Reinstall dependencies
pip install -r requirements.txt

# Run with verbose output
pytest tests/ -v --tb=long
```

### Database Issues in Tests

Backend tests use in-memory SQLite. If you see database errors:

```bash
# Tests create fresh database each run
# Check if SQLAlchemy models are properly imported in conftest.py
```

---

## Summary

| Command | What It Does |
|---------|--------------|
| `npm run test:all` | Run all tests (frontend + backend) |
| `npm test` | Run frontend tests (watch mode) |
| `npm run test:run` | Run frontend tests once |
| `npm run test:coverage` | Frontend tests with coverage |
| `npm run test:l1` | Frontend unit tests only |
| `npm run test:backend` | Run backend tests from project root |
| `npm run test:backend:coverage` | Backend tests with coverage |
| `cd backend && pytest` | Run backend tests (alternative) |
| `pytest --cov=app` | Backend tests with coverage |
| `pytest -v` | Verbose output |
| `pytest -x` | Stop on first failure |
