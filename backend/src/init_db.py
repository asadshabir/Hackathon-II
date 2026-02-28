"""
Database initialization module.
Creates all tables on application startup.
"""

from sqlmodel import SQLModel

from src.database import engine

# Import all models to register them with SQLModel metadata
from src.models import (  # noqa: F401
    AuditLog,
    Conversation,
    Message,
    Reminder,
    Tag,
    Task,
    TaskTag,
    User,
    UserPreference,
)


async def init_database() -> None:
    """
    Initialize database tables.
    Creates all tables that don't exist yet.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Database tables created successfully")
