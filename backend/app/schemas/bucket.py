from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class BucketBase(BaseModel):
    """Base bucket schema."""
    name: str = Field(..., min_length=1, max_length=100)
    allocated: float = Field(..., ge=0)
    category_id: UUID | None = None
    icon: str | None = Field(None, max_length=50)
    color: str | None = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')


class BucketCreate(BucketBase):
    """Schema for creating a bucket."""
    pass


class BucketUpdate(BaseModel):
    """Schema for updating a bucket."""
    name: str | None = Field(None, min_length=1, max_length=100)
    allocated: float | None = Field(None, ge=0)
    category_id: UUID | None = None
    icon: str | None = None
    color: str | None = None


class BucketResponse(BucketBase):
    """Schema for bucket response."""
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BucketStats(BaseModel):
    """Bucket statistics."""
    bucket_id: UUID
    bucket_name: str
    allocated: float
    spent: float
    remaining: float
    percentage_used: float
