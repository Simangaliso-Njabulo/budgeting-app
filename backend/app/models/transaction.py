import uuid
from datetime import datetime, date
from sqlalchemy import String, DateTime, Date, Numeric, Boolean, Text, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..database import Base
from .base import GUID


class Transaction(Base):
    """Transaction model for income and expenses."""

    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    bucket_id: Mapped[uuid.UUID | None] = mapped_column(
        GUID(),
        ForeignKey("buckets.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    description: Mapped[str] = mapped_column(String(255), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    type: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )  # 'income' or 'expense'
    date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Recurring transaction support
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    recurring_interval: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )  # 'daily', 'weekly', 'monthly', 'yearly'

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions")
    category: Mapped["Category | None"] = relationship(
        "Category",
        back_populates="transactions",
    )
    bucket: Mapped["Bucket | None"] = relationship(
        "Bucket",
        back_populates="transactions",
    )

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, description={self.description}, amount={self.amount})>"
