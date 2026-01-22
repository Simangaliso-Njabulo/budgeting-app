from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_name: str = "MyBudgeting API"
    app_version: str = "1.0.0"
    debug: bool = True

    # Database - defaults to SQLite for easy local development
    # For PostgreSQL use: postgresql+asyncpg://postgres:yourpassword@localhost:5432/budgeting_app
    database_url: str = "sqlite+aiosqlite:///./budgeting_app.db"

    # JWT
    jwt_secret_key: str = "your-super-secret-key-change-in-production"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 30
    jwt_refresh_token_expire_days: int = 7

    # CORS
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
