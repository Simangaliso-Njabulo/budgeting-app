from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field
from typing import Literal


class CategoryBase(BaseModel):
    """Base category schema."""
    name: str = Field(..., min_length=1, max_length=100)
    color: str = Field(..., pattern=r'^#[0-9A-Fa-f]{6}$')  # Hex color
    icon: str | None = Field(None, max_length=50)
    type: Literal["expense", "income", "both"] = "expense"


class CategoryCreate(CategoryBase):
    """Schema for creating a category."""
    pass


class CategoryUpdate(BaseModel):
    """Schema for updating a category."""
    name: str | None = Field(None, min_length=1, max_length=100)
    color: str | None = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')
    icon: str | None = None
    type: Literal["expense", "income", "both"] | None = None


class CategoryResponse(CategoryBase):
    """Schema for category response."""
    id: UUID
    user_id: UUID
    is_deleted: bool
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
