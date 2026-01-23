"""
Tests for authentication endpoints.
"""
import pytest
from httpx import AsyncClient


class TestRegister:
    """Tests for user registration."""

    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration."""
        response = await client.post("/api/auth/register", json={
            "email": "newuser@example.com",
            "name": "New User",
            "password": "password123"
        })

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["name"] == "New User"
        assert "id" in data
        assert "password" not in data
        assert "password_hash" not in data

    async def test_register_duplicate_email(self, client: AsyncClient, test_user: dict):
        """Test registration with existing email fails."""
        response = await client.post("/api/auth/register", json={
            "email": test_user["email"],
            "name": "Another User",
            "password": "password123"
        })

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    async def test_register_invalid_email(self, client: AsyncClient):
        """Test registration with invalid email fails."""
        response = await client.post("/api/auth/register", json={
            "email": "not-an-email",
            "name": "Test User",
            "password": "password123"
        })

        assert response.status_code == 422

    async def test_register_missing_fields(self, client: AsyncClient):
        """Test registration with missing fields fails."""
        response = await client.post("/api/auth/register", json={
            "email": "test@example.com"
        })

        assert response.status_code == 422


class TestLogin:
    """Tests for user login."""

    async def test_login_json_success(self, client: AsyncClient, test_user: dict):
        """Test successful login with JSON body."""
        response = await client.post("/api/auth/login/json", json={
            "email": test_user["email"],
            "password": "testpassword123"
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    async def test_login_wrong_password(self, client: AsyncClient, test_user: dict):
        """Test login with wrong password fails."""
        response = await client.post("/api/auth/login/json", json={
            "email": test_user["email"],
            "password": "wrongpassword"
        })

        assert response.status_code == 401
        assert "invalid" in response.json()["detail"].lower()

    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with non-existent user fails."""
        response = await client.post("/api/auth/login/json", json={
            "email": "nonexistent@example.com",
            "password": "password123"
        })

        assert response.status_code == 401

    async def test_login_form_success(self, client: AsyncClient, test_user: dict):
        """Test successful login with form data."""
        response = await client.post("/api/auth/login", data={
            "username": test_user["email"],
            "password": "testpassword123"
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data


class TestRefresh:
    """Tests for token refresh."""

    async def test_refresh_token_success(self, client: AsyncClient, test_user: dict):
        """Test successful token refresh."""
        response = await client.post(
            "/api/auth/refresh",
            params={"refresh_token": test_user["refresh_token"]}
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    async def test_refresh_invalid_token(self, client: AsyncClient):
        """Test refresh with invalid token fails."""
        response = await client.post(
            "/api/auth/refresh",
            params={"refresh_token": "invalid-token"}
        )

        assert response.status_code == 401

    async def test_refresh_with_access_token(self, client: AsyncClient, test_user: dict):
        """Test refresh with access token (wrong token type) fails."""
        response = await client.post(
            "/api/auth/refresh",
            params={"refresh_token": test_user["access_token"]}
        )

        assert response.status_code == 401


class TestLogout:
    """Tests for logout."""

    async def test_logout_success(self, client: AsyncClient):
        """Test successful logout."""
        response = await client.post("/api/auth/logout")

        assert response.status_code == 200
        assert "success" in response.json()["message"].lower()
