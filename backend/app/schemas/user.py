from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=6, max_length=100)


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: str | None = Field(None, min_length=1, max_length=100)
    currency: str | None = Field(None, max_length=3)
    theme: str | None = Field(None, max_length=10)
    accent_color: str | None = Field(None, max_length=20)
    monthly_income: float | None = Field(None, ge=0)
    savings_target: float | None = Field(None, ge=0)
    pay_date: int | None = Field(None, ge=1, le=31)


class UserPasswordUpdate(BaseModel):
    """Schema for updating password."""
    current_password: str
    new_password: str = Field(..., min_length=6, max_length=100)


class PasswordResetDirect(BaseModel):
    """Schema for direct password reset (no email verification)."""
    email: EmailStr
    new_password: str = Field(..., min_length=6, max_length=100)


class UserResponse(UserBase):
    """Schema for user response."""
    id: UUID
    currency: str
    theme: str
    accent_color: str
    monthly_income: float
    savings_target: float
    pay_date: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
