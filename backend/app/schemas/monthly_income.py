from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class MonthlyIncomeBase(BaseModel):
    """Base monthly income schema."""
    year: int = Field(..., ge=2000, le=2100)
    month: int = Field(..., ge=1, le=12)
    amount: float = Field(..., ge=0)
    savings_target: float = Field(0, ge=0)


class MonthlyIncomeCreate(MonthlyIncomeBase):
    """Schema for creating a monthly income record."""
    pass


class MonthlyIncomeUpdate(BaseModel):
    """Schema for updating a monthly income record."""
    amount: float | None = Field(None, ge=0)
    savings_target: float | None = Field(None, ge=0)


class MonthlyIncomeResponse(MonthlyIncomeBase):
    """Schema for monthly income response."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MonthlyTrendItem(BaseModel):
    """Single month's data point for trend visualization."""
    year: int
    month: int
    income: float
    expenses: float
    savings_target: float
    net: float


class MonthlyTrendResponse(BaseModel):
    """Response with multiple months of trend data."""
    data: list[MonthlyTrendItem]
