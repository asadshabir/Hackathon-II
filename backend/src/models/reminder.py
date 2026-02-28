"""
Reminder model for task due-date notifications.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.task import Task
    from src.models.user import User

# Valid status values
REMINDER_STATUS_VALUES = ("pending", "fired", "cancelled")


class Reminder(SQLModel, table=True):
    """Scheduled reminder for a task."""

    __tablename__ = "reminders"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    task_id: uuid.UUID = Field(foreign_key="tasks.id", index=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    reminder_time: datetime = Field()
    status: str = Field(default="pending", max_length=10)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    task: "Task" = Relationship()
    user: "User" = Relationship()


class ReminderCreate(SQLModel):
    """Schema for creating a reminder."""

    task_id: uuid.UUID
    reminder_time: datetime


class ReminderResponse(SQLModel):
    """Schema for reminder response."""

    id: uuid.UUID
    task_id: uuid.UUID
    reminder_time: datetime
    status: str
    created_at: datetime
