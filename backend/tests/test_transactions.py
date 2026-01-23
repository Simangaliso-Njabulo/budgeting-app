"""
Tests for transaction endpoints.
"""
import pytest
from httpx import AsyncClient


class TestCreateTransaction:
    """Tests for creating transactions."""

    async def test_create_expense_success(self, client: AsyncClient, test_user: dict, test_category: dict):
        """Test creating an expense transaction."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/transactions", json={
            "description": "Grocery shopping",
            "amount": 75.50,
            "type": "expense",
            "date": "2026-01-21",
            "category_id": test_category["id"]
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["description"] == "Grocery shopping"
        assert data["amount"] == 75.50
        assert data["type"] == "expense"
        assert data["category_id"] == test_category["id"]
        assert "id" in data

    async def test_create_income_success(self, client: AsyncClient, test_user: dict):
        """Test creating an income transaction."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/transactions", json={
            "description": "Monthly salary",
            "amount": 5000.00,
            "type": "income",
            "date": "2026-01-15"
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["type"] == "income"
        assert data["amount"] == 5000.00

    async def test_create_recurring_transaction(self, client: AsyncClient, test_user: dict):
        """Test creating a recurring transaction."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/transactions", json={
            "description": "Netflix subscription",
            "amount": 15.99,
            "type": "expense",
            "date": "2026-01-01",
            "is_recurring": True,
            "recurring_interval": "monthly"
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["is_recurring"] is True
        assert data["recurring_interval"] == "monthly"

    async def test_create_transaction_with_notes(self, client: AsyncClient, test_user: dict):
        """Test creating a transaction with notes."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/transactions", json={
            "description": "Restaurant",
            "amount": 45.00,
            "type": "expense",
            "date": "2026-01-20",
            "notes": "Birthday dinner with friends"
        }, headers=headers)

        assert response.status_code == 201
        data = response.json()
        assert data["notes"] == "Birthday dinner with friends"

    async def test_create_transaction_unauthorized(self, client: AsyncClient):
        """Test creating transaction without auth fails."""
        response = await client.post("/api/transactions", json={
            "description": "Test",
            "amount": 10.00,
            "type": "expense",
            "date": "2026-01-21"
        })

        assert response.status_code == 401

    async def test_create_transaction_invalid_amount(self, client: AsyncClient, test_user: dict):
        """Test creating transaction with zero/negative amount fails."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.post("/api/transactions", json={
            "description": "Test",
            "amount": 0,
            "type": "expense",
            "date": "2026-01-21"
        }, headers=headers)

        assert response.status_code == 422


class TestGetTransactions:
    """Tests for getting transactions."""

    async def test_get_transactions_empty(self, client: AsyncClient, test_user: dict):
        """Test getting transactions when none exist."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/transactions", headers=headers)

        assert response.status_code == 200
        assert response.json() == []

    async def test_get_transactions_with_data(self, client: AsyncClient, test_user: dict, test_transaction: dict):
        """Test getting transactions with existing data."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/transactions", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert any(t["id"] == test_transaction["id"] for t in data)

    async def test_get_transaction_by_id(self, client: AsyncClient, test_user: dict, test_transaction: dict):
        """Test getting a specific transaction by ID."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get(f"/api/transactions/{test_transaction['id']}", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_transaction["id"]
        assert data["description"] == test_transaction["description"]

    async def test_get_transaction_not_found(self, client: AsyncClient, test_user: dict):
        """Test getting non-existent transaction returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.get(f"/api/transactions/{fake_id}", headers=headers)

        assert response.status_code == 404


class TestFilterTransactions:
    """Tests for filtering transactions."""

    async def test_filter_by_type(self, client: AsyncClient, test_user: dict):
        """Test filtering transactions by type."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create expense and income
        await client.post("/api/transactions", json={
            "description": "Expense",
            "amount": 50.00,
            "type": "expense",
            "date": "2026-01-21"
        }, headers=headers)

        await client.post("/api/transactions", json={
            "description": "Income",
            "amount": 100.00,
            "type": "income",
            "date": "2026-01-21"
        }, headers=headers)

        # Filter by expense
        response = await client.get("/api/transactions?type=expense", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert all(t["type"] == "expense" for t in data)

    async def test_filter_by_date_range(self, client: AsyncClient, test_user: dict):
        """Test filtering transactions by date range."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create transactions on different dates
        await client.post("/api/transactions", json={
            "description": "January",
            "amount": 50.00,
            "type": "expense",
            "date": "2026-01-15"
        }, headers=headers)

        await client.post("/api/transactions", json={
            "description": "February",
            "amount": 50.00,
            "type": "expense",
            "date": "2026-02-15"
        }, headers=headers)

        # Filter by January only
        response = await client.get(
            "/api/transactions?start_date=2026-01-01&end_date=2026-01-31",
            headers=headers
        )
        assert response.status_code == 200


class TestTransactionSummary:
    """Tests for transaction summary."""

    async def test_summary_empty(self, client: AsyncClient, test_user: dict):
        """Test summary with no transactions."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.get("/api/transactions/summary", headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["total_income"] == 0
        assert data["total_expenses"] == 0
        assert data["net_amount"] == 0
        assert data["transaction_count"] == 0

    async def test_summary_with_transactions(self, client: AsyncClient, test_user: dict):
        """Test summary with transactions."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create income
        await client.post("/api/transactions", json={
            "description": "Salary",
            "amount": 1000.00,
            "type": "income",
            "date": "2026-01-15"
        }, headers=headers)

        # Create expenses
        await client.post("/api/transactions", json={
            "description": "Rent",
            "amount": 500.00,
            "type": "expense",
            "date": "2026-01-01"
        }, headers=headers)

        await client.post("/api/transactions", json={
            "description": "Groceries",
            "amount": 200.00,
            "type": "expense",
            "date": "2026-01-10"
        }, headers=headers)

        response = await client.get("/api/transactions/summary", headers=headers)
        assert response.status_code == 200
        data = response.json()
        assert data["total_income"] == 1000.00
        assert data["total_expenses"] == 700.00
        assert data["net_amount"] == 300.00
        assert data["transaction_count"] == 3


class TestUpdateTransaction:
    """Tests for updating transactions."""

    async def test_update_transaction_success(self, client: AsyncClient, test_user: dict, test_transaction: dict):
        """Test updating a transaction successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        response = await client.put(f"/api/transactions/{test_transaction['id']}", json={
            "description": "Updated Transaction",
            "amount": 100.00
        }, headers=headers)

        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated Transaction"
        assert data["amount"] == 100.00

    async def test_update_transaction_not_found(self, client: AsyncClient, test_user: dict):
        """Test updating non-existent transaction returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.put(f"/api/transactions/{fake_id}", json={
            "description": "Test"
        }, headers=headers)

        assert response.status_code == 404


class TestDeleteTransaction:
    """Tests for deleting transactions."""

    async def test_delete_transaction_success(self, client: AsyncClient, test_user: dict):
        """Test deleting a transaction successfully."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}

        # Create a transaction to delete
        create_response = await client.post("/api/transactions", json={
            "description": "To Delete",
            "amount": 10.00,
            "type": "expense",
            "date": "2026-01-21"
        }, headers=headers)
        transaction_id = create_response.json()["id"]

        # Delete it
        delete_response = await client.delete(f"/api/transactions/{transaction_id}", headers=headers)
        assert delete_response.status_code == 204

        # Verify it's gone
        get_response = await client.get(f"/api/transactions/{transaction_id}", headers=headers)
        assert get_response.status_code == 404

    async def test_delete_transaction_not_found(self, client: AsyncClient, test_user: dict):
        """Test deleting non-existent transaction returns 404."""
        headers = {"Authorization": f"Bearer {test_user['access_token']}"}
        fake_id = "00000000-0000-0000-0000-000000000000"
        response = await client.delete(f"/api/transactions/{fake_id}", headers=headers)

        assert response.status_code == 404
