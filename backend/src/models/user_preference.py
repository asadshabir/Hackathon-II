"""
User preference model for per-user settings.
"""

import uuid
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from src.models.user import User


class UserPreference(SQLModel, table=True):
    """Per-user preference settings."""

    __tablename__ = "user_preferences"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", unique=True, index=True)
    notification_channel: str = Field(default="in-app", max_length=20)
    timezone: str = Field(default="UTC", max_length=50)
    reminder_offset_minutes: int = Field(default=15)
    default_priority: str = Field(default="medium", max_length=10)
    sort_order: str = Field(default="created_at_desc", max_length=30)
    theme: str = Field(default="light", max_length=10)

    # Relationships
    user: "User" = Relationship(back_populates="preferences")


class UserPreferenceCreate(SQLModel):
    """Schema for creating/updating user preferences."""

    notification_channel: str = "in-app"
    timezone: str = "UTC"
    reminder_offset_minutes: int = 15
    default_priority: str = "medium"
    sort_order: str = "created_at_desc"
    theme: str = "light"


class UserPreferenceResponse(SQLModel):
    """Schema for preference response."""

    id: uuid.UUID
    user_id: uuid.UUID
    notification_channel: str
    timezone: str
    reminder_offset_minutes: int
    default_priority: str
    sort_order: str
    theme: str
