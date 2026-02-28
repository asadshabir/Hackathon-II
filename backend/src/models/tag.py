"""
Tag model and task_tags junction table for task categorization.
"""

import uuid
from datetime import datetime
from typing import TYPE_CHECKING, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.task import Task
    from src.models.user import User


class TaskTag(SQLModel, table=True):
    """Junction table linking tasks and tags (many-to-many)."""

    __tablename__ = "task_tags"

    task_id: uuid.UUID = Field(foreign_key="tasks.id", primary_key=True)
    tag_id: uuid.UUID = Field(foreign_key="tags.id", primary_key=True)

    # Relationships
    task: "Task" = Relationship(back_populates="tag_links")
    tag: "Tag" = Relationship(back_populates="task_links")


class Tag(SQLModel, table=True):
    """User-scoped tag for categorizing tasks."""

    __tablename__ = "tags"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=50)
    color: str = Field(default="#6B7280", max_length=7)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: "User" = Relationship(back_populates="tags")
    task_links: list["TaskTag"] = Relationship(back_populates="tag")


class TagCreate(SQLModel):
    """Schema for creating a tag."""

    name: str
    color: str = "#6B7280"


class TagResponse(SQLModel):
    """Schema for tag response."""

    id: uuid.UUID
    name: str
    color: str
    created_at: datetime
