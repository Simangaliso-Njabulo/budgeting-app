from datetime import datetime
from datetime import date as DateType
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Literal


class TransactionBase(BaseModel):
    """Base transaction schema."""
    description: str = Field(..., min_length=1, max_length=255)
    amount: float = Field(..., gt=0)
    type: Literal["income", "expense"]
    date: DateType
    category_id: UUID | None = None
    bucket_id: UUID | None = None
    notes: str | None = None
    is_recurring: bool = False
    recurring_interval: Literal["daily", "weekly", "monthly", "yearly"] | None = None


class TransactionCreate(TransactionBase):
    """Schema for creating a transaction."""
    pass


class TransactionUpdate(BaseModel):
    """Schema for updating a transaction."""
    description: str | None = Field(None, min_length=1, max_length=255)
    amount: float | None = Field(None, gt=0)
    type: Literal["income", "expense"] | None = None
    date: DateType | None = None
    category_id: UUID | None = None
    bucket_id: UUID | None = None
    notes: str | None = None
    is_recurring: bool | None = None
    recurring_interval: Literal["daily", "weekly", "monthly", "yearly"] | None = None


class TransactionResponse(TransactionBase):
    """Schema for transaction response."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TransactionSummary(BaseModel):
    """Transaction summary statistics."""
    total_income: float
    total_expenses: float
    net_amount: float
    transaction_count: int


class TransactionFilter(BaseModel):
    """Query parameters for filtering transactions."""
    search: str | None = None
    category_id: UUID | None = None
    bucket_id: UUID | None = None
    type: Literal["income", "expense"] | None = None
    start_date: DateType | None = None
    end_date: DateType | None = None
    is_recurring: bool | None = None
