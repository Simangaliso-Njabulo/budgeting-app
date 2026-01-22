# MyBudgeting App - Backend API

FastAPI backend for the MyBudgeting personal finance application.

## Current Status

✅ **Fully Functional** - The backend is working and tested with:
- User registration and login
- JWT authentication (access + refresh tokens)
- Categories, Buckets, and Transactions CRUD
- SQLite database (no extra setup required)

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Programming language (tested with 3.13) |
| **FastAPI** | Web framework for building APIs |
| **SQLAlchemy 2.0** | Database ORM (Object-Relational Mapping) |
| **SQLite** | Default database (zero configuration) |
| **PostgreSQL** | Optional production database |
| **Pydantic v2** | Data validation |
| **bcrypt** | Password hashing |
| **python-jose** | JWT token generation |
| **Alembic** | Database migrations |

## Quick Start (5 minutes)

### Step 1: Open a Terminal

Navigate to the backend folder:

```bash
cd backend
```

### Step 2: Create a Virtual Environment

A virtual environment keeps project dependencies isolated.

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

You should see `(venv)` at the start of your terminal prompt.

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This installs all required Python packages.

### Step 4: Create Configuration File

```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

The default configuration uses SQLite - no database setup needed!

### Step 5: Start the Server

```bash
uvicorn app.main:app --reload --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

### Step 6: Test the API

Open your browser to: http://localhost:8000/docs

This opens **Swagger UI** - an interactive API documentation where you can test all endpoints.

## Project Structure Explained

```
backend/
├── app/                      # Main application code
│   ├── main.py              # App entry point - starts the server
│   ├── config.py            # Settings (reads from .env file)
│   ├── database.py          # Database connection setup
│   │
│   ├── models/              # Database table definitions
│   │   ├── base.py          # Shared utilities (GUID type)
│   │   ├── user.py          # User table
│   │   ├── category.py      # Category table
│   │   ├── bucket.py        # Bucket table
│   │   └── transaction.py   # Transaction table
│   │
│   ├── schemas/             # Data validation (what API accepts/returns)
│   │   ├── auth.py          # Token schemas
│   │   ├── user.py          # User input/output schemas
│   │   ├── category.py      # Category schemas
│   │   ├── bucket.py        # Bucket schemas
│   │   └── transaction.py   # Transaction schemas
│   │
│   ├── routers/             # API endpoint definitions
│   │   ├── auth.py          # /api/auth/* endpoints
│   │   ├── users.py         # /api/users/* endpoints
│   │   ├── categories.py    # /api/categories/* endpoints
│   │   ├── buckets.py       # /api/buckets/* endpoints
│   │   └── transactions.py  # /api/transactions/* endpoints
│   │
│   └── utils/               # Helper functions
│       ├── security.py      # Password hashing, JWT creation
│       └── dependencies.py  # Auth middleware
│
├── alembic/                 # Database migrations
├── venv/                    # Virtual environment (created by you)
├── budgeting_app.db         # SQLite database file (created on first run)
├── requirements.txt         # Python package list
├── .env                     # Your local configuration
└── .env.example             # Configuration template
```

## Key Concepts for Python Beginners

### What is FastAPI?

FastAPI is a modern Python web framework for building APIs. It automatically:
- Validates incoming data
- Generates API documentation
- Handles async operations efficiently

### What is SQLAlchemy?

SQLAlchemy lets you work with databases using Python classes instead of raw SQL:

```python
# Instead of: SELECT * FROM users WHERE email = 'test@example.com'
user = await db.execute(select(User).where(User.email == 'test@example.com'))
```

### What is Pydantic?

Pydantic validates data. When someone sends data to your API, Pydantic ensures it's the right format:

```python
class UserCreate(BaseModel):
    email: str          # Must be a string
    name: str           # Must be a string
    password: str       # Must be a string
```

### What are JWT Tokens?

JWT (JSON Web Tokens) are used for authentication:
1. User logs in with email/password
2. Server returns an **access token** (expires in 30 min)
3. User includes token in requests: `Authorization: Bearer <token>`
4. Server validates token and knows who the user is

## API Endpoints Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Create new account | No |
| POST | `/login` | Login (form data) | No |
| POST | `/login/json` | Login (JSON body) | No |
| POST | `/refresh` | Get new access token | No (needs refresh token) |
| POST | `/logout` | Logout | No |

### Users (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/me` | Get your profile | Yes |
| PUT | `/me` | Update profile | Yes |
| PUT | `/me/password` | Change password | Yes |
| DELETE | `/me` | Delete account | Yes |

### Categories (`/api/categories`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all categories | Yes |
| POST | `/` | Create category | Yes |
| GET | `/{id}` | Get one category | Yes |
| PUT | `/{id}` | Update category | Yes |
| DELETE | `/{id}` | Delete category | Yes |

### Buckets (`/api/buckets`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List all buckets | Yes |
| POST | `/` | Create bucket | Yes |
| GET | `/{id}` | Get one bucket | Yes |
| PUT | `/{id}` | Update bucket | Yes |
| DELETE | `/{id}` | Delete bucket | Yes |

### Transactions (`/api/transactions`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List transactions | Yes |
| POST | `/` | Create transaction | Yes |
| GET | `/summary` | Income/expense totals | Yes |
| GET | `/{id}` | Get one transaction | Yes |
| PUT | `/{id}` | Update transaction | Yes |
| DELETE | `/{id}` | Delete transaction | Yes |

## Testing the API with curl

### Register a New User

```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "password": "password123"}'
```

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login/json \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

This returns tokens:
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### Make Authenticated Requests

Use the access_token from login:

```bash
curl http://localhost:8000/api/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

### Create a Category

```bash
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{"name": "Groceries", "type": "expense", "color": "#4CAF50"}'
```

### Create a Transaction

```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE" \
  -d '{
    "description": "Weekly groceries",
    "amount": 85.50,
    "type": "expense",
    "date": "2026-01-21"
  }'
```

## Configuration Options

Edit the `.env` file to configure the app:

```bash
# Application
APP_NAME=MyBudgeting API
APP_VERSION=1.0.0
DEBUG=true                    # Set to false in production

# Database
# SQLite (default - just works, data stored in budgeting_app.db):
DATABASE_URL=sqlite+aiosqlite:///./budgeting_app.db

# PostgreSQL (for production):
# DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/budgeting_app

# JWT Authentication
JWT_SECRET_KEY=change-this-in-production    # IMPORTANT: Use a long random string
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30          # Access token valid for 30 min
JWT_REFRESH_TOKEN_EXPIRE_DAYS=7             # Refresh token valid for 7 days

# CORS - Which frontend URLs can access this API
CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

## Common Tasks

### Reset the Database

Delete the SQLite file and restart the server:

```bash
# Stop the server (Ctrl+C)
rm budgeting_app.db       # or: del budgeting_app.db on Windows
uvicorn app.main:app --reload --port 8000
```

### View Database Contents

Install a SQLite viewer like [DB Browser for SQLite](https://sqlitebrowser.org/) and open `budgeting_app.db`.

Or use the command line:
```bash
sqlite3 budgeting_app.db
.tables                    # List all tables
SELECT * FROM users;       # View all users
.quit                      # Exit
```

### Add a New Dependency

```bash
pip install package-name
pip freeze > requirements.txt
```

### Switch to PostgreSQL

1. Install PostgreSQL on your system
2. Create a database: `CREATE DATABASE budgeting_app;`
3. Update `.env`:
   ```
   DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/budgeting_app
   ```
4. Restart the server

## Troubleshooting

### "Module not found" Error

Make sure your virtual environment is activated:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### "Port already in use" Error

Another process is using port 8000. Either:
- Stop the other process
- Use a different port: `uvicorn app.main:app --reload --port 8001`

### Database Errors

Try resetting the database (see above).

### CORS Errors (from Frontend)

Make sure your frontend URL is in `CORS_ORIGINS` in `.env`.

## Development Tips

### Auto-reload

The `--reload` flag makes the server restart when you save code changes:
```bash
uvicorn app.main:app --reload --port 8000
```

### Interactive Docs

Use http://localhost:8000/docs to test endpoints without writing code.

### Check Logs

The server prints detailed error messages to the terminal.

## Next Steps

1. **Explore the Swagger docs** at http://localhost:8000/docs
2. **Look at the code** - start with `app/main.py` and follow the imports
3. **Try modifying an endpoint** - the code auto-reloads
4. **Connect the frontend** - the React app can now make API calls

## File Quick Reference

| File | What It Does |
|------|--------------|
| `app/main.py` | Creates the FastAPI app, includes routers |
| `app/config.py` | Loads settings from `.env` |
| `app/database.py` | Connects to database |
| `app/models/*.py` | Define database tables |
| `app/schemas/*.py` | Define API data formats |
| `app/routers/*.py` | Define API endpoints |
| `app/utils/security.py` | Password hashing, JWT tokens |
| `app/utils/dependencies.py` | Authentication middleware |
