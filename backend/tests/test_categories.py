"""
Tests for category endpoints.
"""
import pytest
from httpx import AsyncClient


class TestCreateCategory:
    """Tests for creating categories."""

    async def test_create_category_success(self, client: AsyncClient, test_user: dict):
        """Test creating a category successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/categories", json={
            "name": "Groceries",
            "type": "expense",
            "color": "#4CAF50",
            "icon": "shopping-cart"
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Groceries"
        assert data["type"] == "expense"
        assert data["color"] == "#4CAF50"
        assert data["icon"] == "shopping-cart"
        assert "id" in data

    async def test_create_category_income(self, client: AsyncClient, test_user: dict):
        """Test creating an income category."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/categories", json={
            "name": "Salary",
            "type": "income",
            "color": "#2196F3"
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "income"

    async def test_create_category_unauthorized(self, client: AsyncClient):
        """Test creating category without auth fails."""
        response = await client.post("/api/categories", json={
            "name": "Test",
            "type": "expense",
            "color": "#000000"
        })

        assert response.status_code == 401

    async def test_create_category_invalid_type(self, client: AsyncClient, test_user: dict):
        """Test creating category with invalid type fails."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/categories", json={
            "name": "Test",
            "type": "invalid",
            "color": "#000000"
        }, headers=headers)

        assert response.status_code == 422


class TestGetCategories:
    """Tests for getting categories."""

    async def test_get_categories_empty(self, client: AsyncClient, test_user: dict):
        """Test getting categories when none exist."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/categories", headers=headers)

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_categories_with_data(self, client: AsyncClient, test_user: dict, test_category: dict):
        """Test getting categories with existing data."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/categories", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(c["id"] == test_category["id"] for c in data)

    async def test_get_category_by_id(self, client: AsyncClient, test_user: dict, test_category: dict):
        """Test getting a specific category by ID."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get(f"/api/categories/{test_category['id']}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_category["id"]
        assert data["name"] == test_category["name"]

    async def test_get_category_not_found(self, client: AsyncClient, test_user: dict):
        """Test getting non-existent category returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.get(f"/api/categories/{fake_id}", headers=headers)

        assert response.status_code == 404


class TestUpdateCategory:
    """Tests for updating categories."""

    async def test_update_category_success(self, client: AsyncClient, test_user: dict, test_category: dict):
        """Test updating a category successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put(f"/api/categories/{test_category['id']}", json={
            "name": "Updated Category",
            "color": "#FF0000"
        }, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Category"
        assert data["color"] == "#FF0000"

    async def test_update_category_partial(self, client: AsyncClient, test_user: dict, test_category: dict):
        """Test partial update of category."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put(f"/api/categories/{test_category['id']}", json={
            "icon": "new-icon"
        }, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["icon"] == "new-icon"
        assert data["name"] == test_category["name"]

    async def test_update_category_not_found(self, client: AsyncClient, test_user: dict):
        """Test updating non-existent category returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(f"/api/categories/{fake_id}", json={
            "name": "Test"
        }, headers=headers)

        assert response.status_code == 404


class TestDeleteCategory:
    """Tests for deleting categories."""

    async def test_delete_category_success(self, client: AsyncClient, test_user: dict):
        """Test soft deleting a category successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create a category to delete
        create_response = await client.post("/api/categories", json={
            "name": "To Delete",
            "type": "expense",
            "color": "#000000"
        }, headers=headers)
        category_id = create_response.json()["id"]

        # Soft delete it
        delete_response = await client.delete(f"/api/categories/{category_id}", headers=headers)
        assert delete_response.status_code == 204

        # Verify it's marked as deleted (soft delete keeps record)
        get_response = await client.get(f"/api/categories/{category_id}", headers=headers)
        assert get_response.status_code == 200
        assert get_response.json()["is_deleted"] is True

        # Verify it's not in the default list
        list_response = await client.get("/api/categories", headers=headers)
        assert not any(c["id"] == category_id for c in list_response.json())

    async def test_hard_delete_category_success(self, client: AsyncClient, test_user: dict):
        """Test hard deleting a category."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create a category to delete
        create_response = await client.post("/api/categories", json={
            "name": "To Hard Delete",
            "type": "expense",
            "color": "#000000"
        }, headers=headers)
        category_id = create_response.json()["id"]

        # Hard delete it
        delete_response = await client.delete(
            f"/api/categories/{category_id}?hard_delete=true",
            headers=headers
        )
        assert delete_response.status_code == 204

        # Verify it's completely gone
        get_response = await client.get(f"/api/categories/{category_id}", headers=headers)
        assert get_response.status_code == 404

    async def test_delete_category_not_found(self, client: AsyncClient, test_user: dict):
        """Test deleting non-existent category returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.delete(f"/api/categories/{fake_id}", headers=headers)

        assert response.status_code == 404
