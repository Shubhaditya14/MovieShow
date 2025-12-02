from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import AsyncEngine

from alembic import context
import asyncio
import os

# Import your Base class with metadata
from backend.db.database import Base, DATABASE_URL

# Import all models so Alembic can detect them
from backend.db import models


# ------------------------------
# Alembic Config
# ------------------------------
config = context.config

# Set DB URL dynamically
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Configure loggers
if config.config_file_name is not None:
    fileConfig(config.config_file_name)


# ------------------------------
# Target Metadata
# ------------------------------
target_metadata = Base.metadata


# ------------------------------
# Async Run Migration
# ------------------------------
def run_migrations_offline():
    """Run migrations in 'offline' mode."""
    context.configure(
        url=DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online():
    """Run migrations in 'online' mode."""
    connectable = AsyncEngine(
        engine_from_config(
            config.get_section(config.config_ini_section),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
            future=True,
        )
    )

    async with connectable.connect() as connection:
        await connection.run_sync(
            lambda conn: context.configure(
                connection=conn,
                target_metadata=target_metadata,
                compare_type=True,
            )
        )

        with context.begin_transaction():
            await connection.run_sync(context.run_migrations)

    await connectable.dispose()


def run_migrations():
    if context.is_offline_mode():
        run_migrations_offline()
    else:
        asyncio.run(run_migrations_online())


run_migrations()
