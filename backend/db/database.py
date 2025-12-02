# backend/db/database.py

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    create_async_engine,
    async_sessionmaker
)
from sqlalchemy.orm import DeclarativeBase
import os


# ------------------------------
# Base class for all ORM models
# ------------------------------
class Base(DeclarativeBase):
    pass


# ------------------------------
# Database URL (PostgreSQL + asyncpg)
# Example: postgresql+asyncpg://user:password@localhost:5432/movies
# ------------------------------
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://postgres:password@localhost:5432/movies"
)


# ------------------------------
# Async Engine
# ------------------------------
engine = create_async_engine(
    DATABASE_URL,
    echo=True,           # Turn off in production
    future=True
)


# ------------------------------
# Session Factory
# ------------------------------
AsyncSessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False,
    class_=AsyncSession
)


# ------------------------------
# Dependency for FastAPI Routes
# ------------------------------
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
