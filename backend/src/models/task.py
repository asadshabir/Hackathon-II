"""
Task model for todo items.
Extended with priority, due_date, recurrence fields (Phase V).
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.user import User
    from src.models.tag import Tag, TaskTag

# Valid enum values
PRIORITY_VALUES = ("low", "medium", "high", "urgent")
RECURRENCE_VALUES = ("none", "daily", "weekly", "monthly")


class Task(SQLModel, table=True):
    """Todo task owned by a user."""

    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = Field(default=None)

    # Phase V: Priority & scheduling fields (additive-only)
    priority: str = Field(default="medium", max_length=10)
    due_date: datetime | None = Field(default=None)
    recurrence_type: str = Field(default="none", max_length=10)
    recurrence_interval: int = Field(default=1)

    # Relationships
    user: "User" = Relationship(back_populates="tasks")
    tag_links: list["TaskTag"] = Relationship(back_populates="task")


class TaskCreate(SQLModel):
    """Schema for creating a task."""

    title: str
    priority: str = "medium"
    due_date: datetime | None = None
    recurrence_type: str = "none"
    recurrence_interval: int = 1


class TaskUpdate(SQLModel):
    """Schema for updating a task."""

    title: str | None = None
    completed: bool | None = None
    priority: str | None = None
    due_date: datetime | None = None
    recurrence_type: str | None = None
    recurrence_interval: int | None = None


class TaskResponse(SQLModel):
    """Schema for task response."""

    id: uuid.UUID
    title: str
    completed: bool
    created_at: datetime
    completed_at: datetime | None = None
    priority: str = "medium"
    due_date: datetime | None = None
    recurrence_type: str = "none"
    recurrence_interval: int = 1
