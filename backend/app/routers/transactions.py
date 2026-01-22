from datetime import date
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from ..database import get_db
from ..models.user import User
from ..models.transaction import Transaction
from ..schemas.transaction import (
    TransactionCreate,
    TransactionUpdate,
    TransactionResponse,
    TransactionSummary,
)
from ..utils.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=list[TransactionResponse])
async def get_transactions(
    search: str | None = None,
    category_id: UUID | None = None,
    bucket_id: UUID | None = None,
    type: str | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
    is_recurring: bool | None = None,
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get transactions with optional filters."""
    query = select(Transaction).where(Transaction.user_id == current_user.id)

    # Apply filters
    if search:
        query = query.where(Transaction.description.ilike(f"%{search}%"))

    if category_id:
        query = query.where(Transaction.category_id == category_id)

    if bucket_id:
        query = query.where(Transaction.bucket_id == bucket_id)

    if type:
        query = query.where(Transaction.type == type)

    if start_date:
        query = query.where(Transaction.date >= start_date)

    if end_date:
        query = query.where(Transaction.date <= end_date)

    if is_recurring is not None:
        query = query.where(Transaction.is_recurring == is_recurring)

    # Order by date descending, then by created_at
    query = query.order_by(Transaction.date.desc(), Transaction.created_at.desc())

    # Apply pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    transactions = result.scalars().all()

    return transactions


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new transaction."""
    new_transaction = Transaction(
        user_id=current_user.id,
        description=transaction_data.description,
        amount=transaction_data.amount,
        type=transaction_data.type,
        date=transaction_data.date,
        category_id=transaction_data.category_id,
        bucket_id=transaction_data.bucket_id,
        notes=transaction_data.notes,
        is_recurring=transaction_data.is_recurring,
        recurring_interval=transaction_data.recurring_interval,
    )

    db.add(new_transaction)
    await db.commit()
    await db.refresh(new_transaction)

    return new_transaction


@router.get("/summary", response_model=TransactionSummary)
async def get_transaction_summary(
    start_date: date | None = None,
    end_date: date | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get income/expense summary for the current user."""
    # Build base query conditions
    conditions = [Transaction.user_id == current_user.id]

    if start_date:
        conditions.append(Transaction.date >= start_date)
    if end_date:
        conditions.append(Transaction.date <= end_date)

    # Calculate total income
    income_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            and_(*conditions, Transaction.type == "income")
        )
    )
    total_income = float(income_result.scalar())

    # Calculate total expenses
    expense_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            and_(*conditions, Transaction.type == "expense")
        )
    )
    total_expenses = float(expense_result.scalar())

    # Count transactions
    count_result = await db.execute(
        select(func.count(Transaction.id)).where(and_(*conditions))
    )
    transaction_count = count_result.scalar()

    return TransactionSummary(
        total_income=total_income,
        total_expenses=total_expenses,
        net_amount=total_income - total_expenses,
        transaction_count=transaction_count,
    )


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific transaction by ID."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    return transaction


@router.put("/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
    transaction_id: UUID,
    transaction_data: TransactionUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a transaction."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    # Update only provided fields
    update_data = transaction_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(transaction, field, value)

    await db.commit()
    await db.refresh(transaction)

    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_transaction(
    transaction_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a transaction."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == transaction_id,
            Transaction.user_id == current_user.id,
        )
    )
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found",
        )

    await db.delete(transaction)
    await db.commit()
