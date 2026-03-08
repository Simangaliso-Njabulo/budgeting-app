#!/usr/bin/env python3
"""
One-time export script: Reads the SQLite database and exports all data
for a given user as a JSON file compatible with the client-side IndexedDB import.

Usage:
    cd backend
    python export_data.py <user_email>

The output file will be saved as: export_<email>_<date>.json
"""

import asyncio
import json
import sys
import uuid
from datetime import date, datetime
from decimal import Decimal
from pathlib import Path

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.models.user import User
from app.models.category import Category
from app.models.bucket import Bucket
from app.models.transaction import Transaction
from app.models.monthly_income import MonthlyIncome
from app.database import Base


def json_serializer(obj):
    """Custom JSON serializer for types not handled by default."""
    if isinstance(obj, uuid.UUID):
        return str(obj)
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    raise TypeError(f"Object of type {type(obj)} is not JSON serializable")


def to_camel_case(snake_str: str) -> str:
    """Convert snake_case to camelCase."""
    parts = snake_str.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


def transform_record(record, fields: list[str]) -> dict:
    """Extract fields from a SQLAlchemy model and convert to camelCase."""
    result = {}
    for field in fields:
        value = getattr(record, field)
        camel_key = to_camel_case(field)
        result[camel_key] = value
    return result


async def export_user_data(email: str) -> dict:
    """Export all data for a user."""
    engine = create_async_engine("sqlite+aiosqlite:///./budgeting_app.db")
    session_maker = async_sessionmaker(engine, class_=AsyncSession)

    async with session_maker() as db:
        # Find user
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        if not user:
            print(f"Error: No user found with email '{email}'")
            sys.exit(1)

        user_id = user.id

        # Export user settings
        settings = transform_record(user, [
            "id", "email", "name", "currency", "theme", "accent_color",
            "monthly_income", "savings_target", "pay_date", "created_at", "updated_at",
        ])

        # Export categories
        cat_result = await db.execute(
            select(Category).where(Category.user_id == user_id)
        )
        categories = [
            transform_record(c, [
                "id", "user_id", "name", "color", "icon", "type",
                "is_deleted", "deleted_at", "created_at", "updated_at",
            ])
            for c in cat_result.scalars().all()
        ]

        # Export buckets
        bucket_result = await db.execute(
            select(Bucket).where(Bucket.user_id == user_id)
        )
        buckets = [
            transform_record(b, [
                "id", "user_id", "category_id", "name", "allocated",
                "icon", "color", "created_at", "updated_at",
            ])
            for b in bucket_result.scalars().all()
        ]

        # Export transactions
        tx_result = await db.execute(
            select(Transaction).where(Transaction.user_id == user_id)
        )
        transactions = [
            transform_record(t, [
                "id", "user_id", "category_id", "bucket_id", "description",
                "amount", "type", "date", "notes", "is_recurring",
                "recurring_interval", "created_at", "updated_at",
            ])
            for t in tx_result.scalars().all()
        ]

        # Export monthly incomes
        mi_result = await db.execute(
            select(MonthlyIncome).where(MonthlyIncome.user_id == user_id)
        )
        monthly_incomes = [
            transform_record(m, [
                "id", "user_id", "year", "month", "amount",
                "savings_target", "created_at", "updated_at",
            ])
            for m in mi_result.scalars().all()
        ]

    await engine.dispose()

    return {
        "version": 1,
        "exportedAt": datetime.now().isoformat(),
        "settings": settings,
        "categories": categories,
        "buckets": buckets,
        "transactions": transactions,
        "monthlyIncomes": monthly_incomes,
    }


async def main():
    if len(sys.argv) < 2:
        print("Usage: python export_data.py <user_email>")
        sys.exit(1)

    email = sys.argv[1]
    print(f"Exporting data for user: {email}")

    data = await export_user_data(email)

    # Convert UUIDs to strings
    json_str = json.dumps(data, default=json_serializer, indent=2)

    filename = f"export_{email.replace('@', '_at_')}_{date.today().isoformat()}.json"
    with open(filename, "w") as f:
        f.write(json_str)

    print(f"Exported {len(data['categories'])} categories, "
          f"{len(data['buckets'])} buckets, "
          f"{len(data['transactions'])} transactions, "
          f"{len(data['monthlyIncomes'])} monthly income records")
    print(f"Saved to: {filename}")


if __name__ == "__main__":
    asyncio.run(main())
