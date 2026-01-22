from .auth import router as auth_router
from .users import router as users_router
from .categories import router as categories_router
from .buckets import router as buckets_router
from .transactions import router as transactions_router

__all__ = [
    "auth_router",
    "users_router",
    "categories_router",
    "buckets_router",
    "transactions_router",
]
