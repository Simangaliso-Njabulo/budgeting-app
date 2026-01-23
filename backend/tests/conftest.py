"""
Test fixtures for the MyBudgeting API.
"""
import asyncio
from typing import AsyncGenerator, Generator
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.database import Base, get_db
from app.utils.security import create_tokens


# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator:
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def test_engine():
    """Create a test database engine."""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        echo=False,
    )

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    yield engine

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

    await engine.dispose()


@pytest.fixture
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create a test database session."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async with async_session() as session:
        yield session


@pytest.fixture
async def client(test_engine) -> AsyncGenerator[AsyncClient, None]:
    """Create a test HTTP client with test database."""
    async_session = async_sessionmaker(
        test_engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with async_session() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest.fixture
async def test_user(client: AsyncClient) -> dict:
    """Create a test user and return user data with tokens."""
    user_data = {
        "email": "test@example.com",
        "name": "Test User",
        "password": "testpassword123"
    }

    response = await client.post("/api/auth/register", json=user_data)
    assert response.status_code == 201

    user = response.json()

    # Login to get tokens
    login_response = await client.post("/api/auth/login/json", json={
        "email": user_data["email"],
        "password": user_data["password"]
    })
    assert login_response.status_code == 200

    tokens = login_response.json()

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
    }


@pytest.fixture
def auth_headers(test_user: dict) -> dict:
    """Return authorization headers for authenticated requests."""
    return {"Authorization": f"Bearer {test_user['access_token']}"}


@pytest.fixture
async def test_category(client: AsyncClient, test_user: dict) -> dict:
    """Create a test category."""
    headers = {"Authorization": f"Bearer {test_user['access_token']}"}
    category_data = {
        "name": "Test Category",
        "type": "expense",
        "color": "#FF5733",
        "icon": "shopping-cart"
    }

    response = await client.post("/api/categories", json=category_data, headers=headers)
    assert response.status_code == 201

    return response.json()


@pytest.fixture
async def test_bucket(client: AsyncClient, test_user: dict, test_category: dict) -> dict:
    """Create a test bucket."""
    headers = {"Authorization": f"Bearer {test_user['access_token']}"}
    bucket_data = {
        "name": "Test Bucket",
        "allocated": 500.00,
        "category_id": test_category["id"],
        "color": "#4CAF50",
        "icon": "wallet"
    }

    response = await client.post("/api/buckets", json=bucket_data, headers=headers)
    assert response.status_code == 201

    return response.json()


@pytest.fixture
async def test_transaction(client: AsyncClient, test_user: dict, test_category: dict) -> dict:
    """Create a test transaction."""
    headers = {"Authorization": f"Bearer {test_user['access_token']}"}
    transaction_data = {
        "description": "Test Transaction",
        "amount": 50.00,
        "type": "expense",
        "date": "2026-01-21",
        "category_id": test_category["id"]
    }

    response = await client.post("/api/transactions", json=transaction_data, headers=headers)
    assert response.status_code == 201

    return response.json()
