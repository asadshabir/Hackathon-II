"""
Phase 5 database migration script.
Adds new columns to existing 'tasks' table and creates new tables.
Safe to run multiple times (idempotent).
"""

import asyncio
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config import get_settings
from src.database import engine
from sqlmodel import SQLModel

# Import all models so metadata is populated
from src.models import (
    AuditLog, Conversation, Message, Reminder,
    Tag, TaskTag, Task, User, UserPreference,
)

ALTER_STATEMENTS = [
    # Add priority column with default
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'priority'
        ) THEN
            ALTER TABLE tasks ADD COLUMN priority VARCHAR(10) DEFAULT 'medium';
        END IF;
    END $$;
    """,
    # Add due_date column
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'due_date'
        ) THEN
            ALTER TABLE tasks ADD COLUMN due_date TIMESTAMP DEFAULT NULL;
        END IF;
    END $$;
    """,
    # Add recurrence_type column with default
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'recurrence_type'
        ) THEN
            ALTER TABLE tasks ADD COLUMN recurrence_type VARCHAR(10) DEFAULT 'none';
        END IF;
    END $$;
    """,
    # Add recurrence_interval column with default
    """
    DO $$
    BEGIN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'recurrence_interval'
        ) THEN
            ALTER TABLE tasks ADD COLUMN recurrence_interval INTEGER DEFAULT 1;
        END IF;
    END $$;
    """,
]


async def run_migration():
    """Run Phase 5 migration."""
    print("Phase 5 Database Migration")
    print("=" * 50)

    # Step 1: ALTER TABLE for tasks (add new columns)
    print("\n[1/2] Adding new columns to 'tasks' table...")
    async with engine.begin() as conn:
        for i, stmt in enumerate(ALTER_STATEMENTS, 1):
            column_name = ["priority", "due_date", "recurrence_type", "recurrence_interval"][i - 1]
            try:
                await conn.execute(SQLModel.metadata.bind if False else __import__('sqlalchemy').text(stmt))
                print(f"  + Column '{column_name}': OK")
            except Exception as e:
                print(f"  ! Column '{column_name}': {e}")

    # Step 2: Create new tables (tags, task_tags, reminders, audit_logs, user_preferences)
    print("\n[2/2] Creating new tables (if they don't exist)...")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    print("  + All tables ensured.")

    print("\n" + "=" * 50)
    print("Migration complete!")


if __name__ == "__main__":
    asyncio.run(run_migration())
