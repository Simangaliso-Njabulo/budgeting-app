from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, extract

from ..database import get_db
from ..models.user import User
from ..models.monthly_income import MonthlyIncome
from ..models.transaction import Transaction
from ..schemas.monthly_income import (
    MonthlyIncomeUpdate,
    MonthlyIncomeResponse,
    MonthlyTrendItem,
    MonthlyTrendResponse,
)
from ..utils.dependencies import get_current_user

router = APIRouter()


async def _get_or_create_monthly_income(
    db: AsyncSession, user: User, year: int, month: int
) -> MonthlyIncome:
    """Get existing monthly income record or create one from user defaults."""
    result = await db.execute(
        select(MonthlyIncome).where(
            MonthlyIncome.user_id == user.id,
            MonthlyIncome.year == year,
            MonthlyIncome.month == month,
        )
    )
    record = result.scalar_one_or_none()

    if record is None:
        record = MonthlyIncome(
            user_id=user.id,
            year=year,
            month=month,
            amount=float(user.monthly_income or 0),
            savings_target=float(user.savings_target or 0),
        )
        db.add(record)
        await db.commit()
        await db.refresh(record)

    return record


@router.get("", response_model=list[MonthlyIncomeResponse])
async def get_monthly_incomes(
    year: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all monthly income records, optionally filtered by year."""
    query = select(MonthlyIncome).where(MonthlyIncome.user_id == current_user.id)

    if year:
        query = query.where(MonthlyIncome.year == year)

    query = query.order_by(MonthlyIncome.year.desc(), MonthlyIncome.month.desc())

    result = await db.execute(query)
    return result.scalars().all()


@router.get("/trends", response_model=MonthlyTrendResponse)
async def get_monthly_trends(
    months: int = Query(default=6, ge=1, le=24),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get income vs expense trends for the last N months."""
    today = date.today()
    trend_data: list[MonthlyTrendItem] = []

    # Calculate start month by going back N months
    current_year = today.year
    current_month = today.month

    month_periods: list[tuple[int, int]] = []
    for _ in range(months):
        month_periods.append((current_year, current_month))
        current_month -= 1
        if current_month == 0:
            current_month = 12
            current_year -= 1

    # Reverse so oldest is first
    month_periods.reverse()

    # Get all monthly income records for the user in one query
    start_year, start_month = month_periods[0]
    end_year, end_month = month_periods[-1]

    income_records_result = await db.execute(
        select(MonthlyIncome).where(
            MonthlyIncome.user_id == current_user.id,
        )
    )
    income_records = {
        (r.year, r.month): r
        for r in income_records_result.scalars().all()
    }

    # Get transaction totals grouped by year, month, and type
    # Calculate the earliest date we need
    earliest_date = date(start_year, start_month, 1)
    # Latest date: last day of end month
    if end_month == 12:
        latest_date = date(end_year + 1, 1, 1)
    else:
        latest_date = date(end_year, end_month + 1, 1)

    tx_result = await db.execute(
        select(
            extract("year", Transaction.date).label("tx_year"),
            extract("month", Transaction.date).label("tx_month"),
            Transaction.type,
            func.coalesce(func.sum(Transaction.amount), 0).label("total"),
        )
        .where(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.date >= earliest_date,
                Transaction.date < latest_date,
            )
        )
        .group_by(
            extract("year", Transaction.date),
            extract("month", Transaction.date),
            Transaction.type,
        )
    )
    tx_rows = tx_result.all()

    # Build lookup: (year, month, type) -> total
    tx_totals: dict[tuple[int, int, str], float] = {}
    for row in tx_rows:
        tx_totals[(int(row.tx_year), int(row.tx_month), row.type)] = float(row.total)

    # Build trend data for each month
    default_income = float(current_user.monthly_income or 0)
    default_savings = float(current_user.savings_target or 0)

    for year, month in month_periods:
        income_record = income_records.get((year, month))
        month_income = float(income_record.amount) if income_record else default_income
        month_savings = float(income_record.savings_target) if income_record else default_savings

        month_expenses = tx_totals.get((year, month, "expense"), 0.0)
        month_tx_income = tx_totals.get((year, month, "income"), 0.0)

        trend_data.append(MonthlyTrendItem(
            year=year,
            month=month,
            income=month_income + month_tx_income,
            expenses=month_expenses,
            savings_target=month_savings,
            net=month_income + month_tx_income - month_expenses,
        ))

    return MonthlyTrendResponse(data=trend_data)


@router.get("/{year}/{month}", response_model=MonthlyIncomeResponse)
async def get_monthly_income(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get (or auto-create) monthly income for a specific month."""
    record = await _get_or_create_monthly_income(db, current_user, year, month)
    return record


@router.put("/{year}/{month}", response_model=MonthlyIncomeResponse)
async def update_monthly_income(
    year: int,
    month: int,
    data: MonthlyIncomeUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update (or create) monthly income for a specific month."""
    record = await _get_or_create_monthly_income(db, current_user, year, month)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(record, field, value)

    await db.commit()
    await db.refresh(record)

    return record
