"""
Tests for bucket endpoints.
"""
import pytest
from httpx import AsyncClient


class TestCreateBucket:
    """Tests for creating buckets."""

    async def test_create_bucket_success(self, client: AsyncClient, test_user: dict, test_category: dict):
        """Test creating a bucket successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/buckets", json={
            "name": "Emergency Fund",
            "allocated": 1000.00,
            "category_id": test_category["id"],
            "color": "#FF5733",
            "icon": "piggy-bank"
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Emergency Fund"
        assert data["allocated"] == 1000.00
        assert data["category_id"] == test_category["id"]
        assert "id" in data

    async def test_create_bucket_without_category(self, client: AsyncClient, test_user: dict):
        """Test creating a bucket without a category."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/buckets", json={
            "name": "Miscellaneous",
            "allocated": 500.00
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Miscellaneous"
        assert data["category_id"] is None

    async def test_create_bucket_unauthorized(self, client: AsyncClient):
        """Test creating bucket without auth fails."""
        response = await client.post("/api/buckets", json={
            "name": "Test",
            "allocated": 100.00
        })

        assert response.status_code == 401

    async def test_create_bucket_invalid_allocated(self, client: AsyncClient, test_user: dict):
        """Test creating bucket with negative allocated amount fails."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/buckets", json={
            "name": "Test",
            "allocated": -100.00
        }, headers=headers)

        assert response.status_code == 422


class TestGetBuckets:
    """Tests for getting buckets."""

    async def test_get_buckets_empty(self, client: AsyncClient, test_user: dict):
        """Test getting buckets when none exist."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/buckets", headers=headers)

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_buckets_with_data(self, client: AsyncClient, test_user: dict, test_bucket: dict):
        """Test getting buckets with existing data."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/buckets", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(b["id"] == test_bucket["id"] for b in data)

    async def test_get_bucket_by_id(self, client: AsyncClient, test_user: dict, test_bucket: dict):
        """Test getting a specific bucket by ID."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get(f"/api/buckets/{test_bucket['id']}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_bucket["id"]
        assert data["name"] == test_bucket["name"]

    async def test_get_bucket_not_found(self, client: AsyncClient, test_user: dict):
        """Test getting non-existent bucket returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.get(f"/api/buckets/{fake_id}", headers=headers)

        assert response.status_code == 404

    async def test_get_buckets_by_category(self, client: AsyncClient, test_user: dict, test_category: dict):
        """Test filtering buckets by category."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create bucket in category
        await client.post("/api/buckets", json={
            "name": "In Category",
            "allocated": 100.00,
            "category_id": test_category["id"]
        }, headers=headers)

        # Create bucket without category
        await client.post("/api/buckets", json={
            "name": "No Category",
            "allocated": 200.00
        }, headers=headers)

        # Filter by category
        response = await client.get(
            f"/api/buckets?category_id={test_category['id']}",
            headers=headers
        )
        assert response.status_code == 200
        data = response.json()
        assert all(b["category_id"] == test_category["id"] for b in data)


class TestUpdateBucket:
    """Tests for updating buckets."""

    async def test_update_bucket_success(self, client: AsyncClient, test_user: dict, test_bucket: dict):
        """Test updating a bucket successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put(f"/api/buckets/{test_bucket['id']}", json={
            "name": "Updated Bucket",
            "allocated": 2000.00
        }, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Bucket"
        assert data["allocated"] == 2000.00

    async def test_update_bucket_partial(self, client: AsyncClient, test_user: dict, test_bucket: dict):
        """Test partial update of bucket."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        original_name = test_bucket["name"]
        response = await client.put(f"/api/buckets/{test_bucket['id']}", json={
            "icon": "new-icon"
        }, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["icon"] == "new-icon"
        assert data["name"] == original_name

    async def test_update_bucket_not_found(self, client: AsyncClient, test_user: dict):
        """Test updating non-existent bucket returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(f"/api/buckets/{fake_id}", json={
            "name": "Test"
        }, headers=headers)

        assert response.status_code == 404


class TestDeleteBucket:
    """Tests for deleting buckets."""

    async def test_delete_bucket_success(self, client: AsyncClient, test_user: dict):
        """Test deleting a bucket successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create a bucket to delete
        create_response = await client.post("/api/buckets", json={
            "name": "To Delete",
            "allocated": 100.00
        }, headers=headers)
        bucket_id = create_response.json()["id"]

        # Delete it
        delete_response = await client.delete(f"/api/buckets/{bucket_id}", headers=headers)
        assert delete_response.status_code == 204

        # Verify it's gone
        get_response = await client.get(f"/api/buckets/{bucket_id}", headers=headers)
        assert get_response.status_code == 404

    async def test_delete_bucket_not_found(self, client: AsyncClient, test_user: dict):
        """Test deleting non-existent bucket returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.delete(f"/api/buckets/{fake_id}", headers=headers)

        assert response.status_code == 404


class TestBucketStats:
    """Tests for bucket statistics."""

    async def test_bucket_stats_no_transactions(self, client: AsyncClient, test_user: dict):
        """Test bucket stats with no transactions."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create a bucket with allocation
        bucket_response = await client.post("/api/buckets", json={
            "name": "Empty Stats Test",
            "allocated": 500.00
        }, headers=headers)
        bucket_id = bucket_response.json()["id"]

        response = await client.get(f"/api/buckets/{bucket_id}/stats", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["bucket_id"] == bucket_id
        assert data["allocated"] == 500.00
        assert data["spent"] == 0.0
        assert data["remaining"] == 500.00
        assert data["percentage_used"] == 0.0

    async def test_bucket_stats_with_transactions(self, client: AsyncClient, test_user: dict):
        """Test bucket stats with transactions."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create a bucket
        bucket_response = await client.post("/api/buckets", json={
            "name": "Stats Test",
            "allocated": 500.00
        }, headers=headers)
        bucket_id = bucket_response.json()["id"]

        # Create expense transactions in bucket
        await client.post("/api/transactions", json={
            "description": "Expense 1",
            "amount": 100.00,
            "type": "expense",
            "date": "2026-01-15",
            "bucket_id": bucket_id
        }, headers=headers)

        await client.post("/api/transactions", json={
            "description": "Expense 2",
            "amount": 50.00,
            "type": "expense",
            "date": "2026-01-16",
            "bucket_id": bucket_id
        }, headers=headers)

        # Get stats
        response = await client.get(f"/api/buckets/{bucket_id}/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["spent"] == 150.00
        assert data["remaining"] == 350.00
        assert data["percentage_used"] == 30.0

    async def test_bucket_stats_not_found(self, client: AsyncClient, test_user: dict):
        """Test bucket stats for non-existent bucket returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.get(f"/api/buckets/{fake_id}/stats", headers=headers)

        assert response.status_code == 404

    async def test_bucket_stats_zero_allocation(self, client: AsyncClient, test_user: dict):
        """Test bucket stats with zero allocation handles division correctly."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create a bucket with zero allocation
        bucket_response = await client.post("/api/buckets", json={
            "name": "Zero Allocation",
            "allocated": 0.00
        }, headers=headers)
        bucket_id = bucket_response.json()["id"]

        # Add an expense
        await client.post("/api/transactions", json={
            "description": "Expense",
            "amount": 50.00,
            "type": "expense",
            "date": "2026-01-15",
            "bucket_id": bucket_id
        }, headers=headers)

        # Get stats - should not divide by zero
        response = await client.get(f"/api/buckets/{bucket_id}/stats", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["percentage_used"] == 0  # Handles division by zero
