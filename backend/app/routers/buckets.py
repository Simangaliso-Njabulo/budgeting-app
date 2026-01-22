from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..database import get_db
from ..models.user import User
from ..models.bucket import Bucket
from ..models.transaction import Transaction
from ..schemas.bucket import BucketCreate, BucketUpdate, BucketResponse, BucketStats
from ..utils.dependencies import get_current_user

router = APIRouter()


@router.get("", response_model=list[BucketResponse])
async def get_buckets(
    category_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all buckets for the current user."""
    query = select(Bucket).where(Bucket.user_id == current_user.id)

    if category_id:
        query = query.where(Bucket.category_id == category_id)

    result = await db.execute(query.order_by(Bucket.name))
    buckets = result.scalars().all()

    return buckets


@router.post("", response_model=BucketResponse, status_code=status.HTTP_201_CREATED)
async def create_bucket(
    bucket_data: BucketCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new bucket."""
    new_bucket = Bucket(
        user_id=current_user.id,
        name=bucket_data.name,
        allocated=bucket_data.allocated,
        category_id=bucket_data.category_id,
        icon=bucket_data.icon,
        color=bucket_data.color,
    )

    db.add(new_bucket)
    await db.commit()
    await db.refresh(new_bucket)

    return new_bucket


@router.get("/{bucket_id}", response_model=BucketResponse)
async def get_bucket(
    bucket_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific bucket by ID."""
    result = await db.execute(
        select(Bucket).where(
            Bucket.id == bucket_id,
            Bucket.user_id == current_user.id,
        )
    )
    bucket = result.scalar_one_or_none()

    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found",
        )

    return bucket


@router.put("/{bucket_id}", response_model=BucketResponse)
async def update_bucket(
    bucket_id: UUID,
    bucket_data: BucketUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update a bucket."""
    result = await db.execute(
        select(Bucket).where(
            Bucket.id == bucket_id,
            Bucket.user_id == current_user.id,
        )
    )
    bucket = result.scalar_one_or_none()

    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found",
        )

    # Update only provided fields
    update_data = bucket_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(bucket, field, value)

    await db.commit()
    await db.refresh(bucket)

    return bucket


@router.delete("/{bucket_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bucket(
    bucket_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a bucket."""
    result = await db.execute(
        select(Bucket).where(
            Bucket.id == bucket_id,
            Bucket.user_id == current_user.id,
        )
    )
    bucket = result.scalar_one_or_none()

    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found",
        )

    await db.delete(bucket)
    await db.commit()


@router.get("/{bucket_id}/stats", response_model=BucketStats)
async def get_bucket_stats(
    bucket_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get spending statistics for a bucket."""
    # Get bucket
    result = await db.execute(
        select(Bucket).where(
            Bucket.id == bucket_id,
            Bucket.user_id == current_user.id,
        )
    )
    bucket = result.scalar_one_or_none()

    if not bucket:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bucket not found",
        )

    # Calculate spent amount (sum of expense transactions for this bucket)
    spent_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0)).where(
            Transaction.bucket_id == bucket_id,
            Transaction.user_id == current_user.id,
            Transaction.type == "expense",
        )
    )
    spent = float(spent_result.scalar())

    remaining = float(bucket.allocated) - spent
    percentage = (spent / float(bucket.allocated) * 100) if bucket.allocated > 0 else 0

    return BucketStats(
        bucket_id=bucket.id,
        bucket_name=bucket.name,
        allocated=float(bucket.allocated),
        spent=spent,
        remaining=remaining,
        percentage_used=round(percentage, 2),
    )
