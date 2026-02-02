import calendar
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

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


def _clamp_day(year: int, month: int, day: int) -> int:
    """Clamp a day to the last day of a given month."""
    last_day = calendar.monthrange(year, month)[1]
    return min(day, last_day)


def _pay_cycle_start(year: int, month: int, pay_date: int) -> date:
    """Get the start date of a pay cycle period."""
    return date(year, month, _clamp_day(year, month, pay_date))


def _current_pay_cycle(d: date, pay_date: int) -> tuple[int, int]:
    """Determine which pay cycle a date falls into. Returns (year, month)."""
    clamped = _clamp_day(d.year, d.month, pay_date)
    if d.day >= clamped:
        return (d.year, d.month)
    if d.month == 1:
        return (d.year - 1, 12)
    return (d.year, d.month - 1)


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
    """Get income vs expense trends for the last N pay cycles."""
    today = date.today()
    pay_date = current_user.pay_date or 1
    trend_data: list[MonthlyTrendItem] = []

    # Determine current pay cycle and go back N months
    cy, cm = _current_pay_cycle(today, pay_date)

    month_periods: list[tuple[int, int]] = []
    for _ in range(months):
        month_periods.append((cy, cm))
        cm -= 1
        if cm == 0:
            cm = 12
            cy -= 1

    # Reverse so oldest is first
    month_periods.reverse()

    # Get all monthly income records
    income_records_result = await db.execute(
        select(MonthlyIncome).where(
            MonthlyIncome.user_id == current_user.id,
        )
    )
    income_records = {
        (r.year, r.month): r
        for r in income_records_result.scalars().all()
    }

    # Calculate the full date range covering all pay cycles
    first_year, first_month = month_periods[0]
    last_year, last_month = month_periods[-1]
    earliest_date = _pay_cycle_start(first_year, first_month, pay_date)

    # End: start of the cycle AFTER the last period
    next_month = last_month + 1
    next_year = last_year
    if next_month > 12:
        next_month = 1
        next_year += 1
    latest_date = _pay_cycle_start(next_year, next_month, pay_date)

    # Fetch all transactions in the date range
    tx_result = await db.execute(
        select(
            Transaction.date,
            Transaction.type,
            Transaction.amount,
        )
        .where(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.date >= earliest_date,
                Transaction.date < latest_date,
            )
        )
    )
    tx_rows = tx_result.all()

    # Assign each transaction to its pay cycle and aggregate
    tx_totals: dict[tuple[int, int, str], float] = {}
    for row in tx_rows:
        tx_date = row.date if isinstance(row.date, date) else row.date
        cycle_year, cycle_month = _current_pay_cycle(tx_date, pay_date)
        key = (cycle_year, cycle_month, row.type)
        tx_totals[key] = tx_totals.get(key, 0.0) + float(row.amount)

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
