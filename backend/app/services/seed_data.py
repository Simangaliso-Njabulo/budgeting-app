"""
Seed data service for pre-populating user data.

This service provides functionality to seed initial budget data for specific users.
The seed data is based on personal budget configurations and should only be applied
to authorized users.
"""

import uuid
from datetime import date
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..models.user import User
from ..models.category import Category
from ..models.bucket import Bucket
from ..models.monthly_income import MonthlyIncome


# Email address that gets pre-populated seed data
SEED_USER_EMAIL = "user@example.com"


# Category definitions with colors and icons
CATEGORIES_DATA = [
    {"name": "Living Costs", "color": "#4A90D9", "icon": "home", "type": "expense"},
    {"name": "Car", "color": "#E74C3C", "icon": "car", "type": "expense"},
    {"name": "Expenses", "color": "#F39C12", "icon": "receipt", "type": "expense"},
    {"name": "Enjoyment", "color": "#9B59B6", "icon": "entertainment", "type": "expense"},
    {"name": "Black Tax", "color": "#27AE60", "icon": "family", "type": "expense"},
    {"name": "Savings", "color": "#1ABC9C", "icon": "piggy-bank", "type": "expense"},
    {"name": "Unplanned", "color": "#95A5A6", "icon": "question", "type": "expense"},
]


# Bucket definitions mapped to categories
# Format: (bucket_name, allocated_amount, category_name)
BUCKETS_DATA = [
    # Living Costs
    ("Rent", Decimal("5000.00"), "Living Costs"),
    ("Phones", Decimal("500.00"), "Living Costs"),
    ("Streaming", Decimal("200.00"), "Living Costs"),
    ("Cloud Storage", Decimal("50.00"), "Living Costs"),
    ("Internet", Decimal("600.00"), "Living Costs"),
    ("Utilities", Decimal("800.00"), "Living Costs"),

    # Car
    ("Car Payment", Decimal("3000.00"), "Car"),

    # Expenses
    ("Commute", Decimal("500.00"), "Expenses"),
    ("Transport", Decimal("500.00"), "Expenses"),
    ("Groceries", Decimal("2000.00"), "Expenses"),
    ("Personal Care", Decimal("200.00"), "Expenses"),
    ("Household", Decimal("300.00"), "Expenses"),
    ("Bank Fees", Decimal("100.00"), "Expenses"),

    # Enjoyment
    ("Entertainment", Decimal("1000.00"), "Enjoyment"),
    ("Spending Money", Decimal("500.00"), "Enjoyment"),
    ("Dining Out", Decimal("500.00"), "Enjoyment"),

    # Black Tax (Family support)
    ("Family Support 1", Decimal("1000.00"), "Black Tax"),
    ("Family Support 2", Decimal("500.00"), "Black Tax"),
    ("Family Support 3", Decimal("500.00"), "Black Tax"),

    # Savings
    ("Savings", Decimal("2000.00"), "Savings"),

    # Unplanned
    ("Unplanned", Decimal("750.00"), "Unplanned"),
]


async def should_seed_user(db: AsyncSession, user: User) -> bool:
    """
    Check if a user should receive seed data.

    Returns True if user has no existing categories or buckets.
    """
    # Check if user already has categories
    category_count = await db.execute(
        select(func.count(Category.id)).where(Category.user_id == user.id)
    )
    if category_count.scalar() > 0:
        return False

    # Check if user already has buckets
    bucket_count = await db.execute(
        select(func.count(Bucket.id)).where(Bucket.user_id == user.id)
    )
    if bucket_count.scalar() > 0:
        return False

    return True


async def seed_user_data(db: AsyncSession, user: User) -> dict:
    """
    Seed categories and buckets for a user.

    Args:
        db: Database session
        user: User to seed data for

    Returns:
        Dictionary with counts of created categories and buckets
    """
    if not await should_seed_user(db, user):
        return {"categories_created": 0, "buckets_created": 0, "seeded": False}

    # Create categories and build a mapping
    category_map: dict[str, Category] = {}
    categories_created = 0

    for cat_data in CATEGORIES_DATA:
        category = Category(
            user_id=user.id,
            name=cat_data["name"],
            color=cat_data["color"],
            icon=cat_data["icon"],
            type=cat_data["type"],
        )
        db.add(category)
        category_map[cat_data["name"]] = category
        categories_created += 1

    # Flush to get category IDs
    await db.flush()

    # Create buckets
    buckets_created = 0
    for bucket_name, allocated, category_name in BUCKETS_DATA:
        category = category_map.get(category_name)
        bucket = Bucket(
            user_id=user.id,
            category_id=category.id if category else None,
            name=bucket_name,
            allocated=allocated,
        )
        db.add(bucket)
        buckets_created += 1

    await db.commit()

    # Update user settings for ZAR currency and monthly income
    user.currency = "ZAR"
    user.monthly_income = Decimal("20000.00")
    user.savings_target = Decimal("5000.00")

    # Create a MonthlyIncome record for the current month
    today = date.today()
    monthly_income = MonthlyIncome(
        user_id=user.id,
        year=today.year,
        month=today.month,
        amount=Decimal("20000.00"),
        savings_target=Decimal("5000.00"),
    )
    db.add(monthly_income)

    await db.commit()

    return {
        "categories_created": categories_created,
        "buckets_created": buckets_created,
        "seeded": True,
    }
