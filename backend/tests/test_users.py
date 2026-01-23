"""
Tests for user endpoints.
"""
import pytest
from httpx import AsyncClient


class TestGetCurrentUser:
    """Tests for getting current user profile."""

    async def test_get_me_success(self, client: AsyncClient, test_user: dict):
        """Test getting current user profile."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/users/me", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == test_user["email"]
        assert data["name"] == test_user["name"]
        assert data["id"] == test_user["id"]

    async def test_get_me_unauthorized(self, client: AsyncClient):
        """Test getting profile without auth fails."""
        response = await client.get("/api/users/me")

        assert response.status_code == 401

    async def test_get_me_invalid_token(self, client: AsyncClient):
        """Test getting profile with invalid token fails."""
        headers = {"Authorization": "Bearer invalid-token"}
        response = await client.get("/api/users/me", headers=headers)

        assert response.status_code == 401

    async def test_get_me_with_refresh_token(self, client: AsyncClient, test_user: dict):
        """Test that refresh token cannot be used as access token."""
        # Refresh tokens have type="refresh", should be rejected for API access
        headers = {"Authorization": f"Bearer {test_user['refresh_token']}"}
        response = await client.get("/api/users/me", headers=headers)

        assert response.status_code == 401

    async def test_get_me_malformed_token(self, client: AsyncClient):
        """Test getting profile with malformed token fails."""
        headers = {"Authorization": "Bearer not.a.valid.jwt.token"}
        response = await client.get("/api/users/me", headers=headers)

        assert response.status_code == 401


class TestUpdateUser:
    """Tests for updating user profile."""

    async def test_update_me_success(self, client: AsyncClient, test_user: dict):
        """Test updating user profile."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put("/api/users/me", json={
            "name": "Updated Name",
            "currency": "EUR"
        }, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["currency"] == "EUR"

    async def test_update_me_partial(self, client: AsyncClient, test_user: dict):
        """Test partial update of user profile."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put("/api/users/me", json={
            "theme": "light"
        }, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["theme"] == "light"
        assert data["name"] == test_user["name"]

    async def test_update_me_unauthorized(self, client: AsyncClient):
        """Test updating profile without auth fails."""
        response = await client.put("/api/users/me", json={
            "name": "New Name"
        })

        assert response.status_code == 401


class TestChangePassword:
    """Tests for changing password."""

    async def test_change_password_success(self, client: AsyncClient, test_user: dict):
        """Test changing password successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put("/api/users/me/password", json={
            "current_password": "testpassword123",
            "new_password": "newpassword456"
        }, headers=headers)

        assert response.status_code == 200

        # Verify new password works
        login_response = await client.post("/api/auth/login/json", json={
            "email": test_user["email"],
            "password": "newpassword456"
        })
        assert login_response.status_code == 200

    async def test_change_password_wrong_current(self, client: AsyncClient, test_user: dict):
        """Test changing password with wrong current password fails."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put("/api/users/me/password", json={
            "current_password": "wrongpassword",
            "new_password": "newpassword456"
        }, headers=headers)

        assert response.status_code == 400
        assert "incorrect" in response.json()["detail"].lower()


class TestDeleteUser:
    """Tests for deleting user account."""

    async def test_delete_me_success(self, client: AsyncClient):
        """Test deleting user account."""
        # Create a new user to delete
        register_response = await client.post("/api/auth/register", json={
            "email": "todelete@example.com",
            "name": "To Delete",
            "password": "password123"
        })
        assert register_response.status_code == 201

        # Login
        login_response = await client.post("/api/auth/login/json", json={
            "email": "todelete@example.com",
            "password": "password123"
        })
        token = login_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Delete
        delete_response = await client.delete("/api/users/me", headers=headers)
        assert delete_response.status_code == 204

        # Verify can't login anymore
        login_again = await client.post("/api/auth/login/json", json={
            "email": "todelete@example.com",
            "password": "password123"
        })
        assert login_again.status_code == 401
