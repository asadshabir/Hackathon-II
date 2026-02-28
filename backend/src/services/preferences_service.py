"""
Preferences service for managing user preferences.
Handles CRUD operations for user preferences with defaults.
"""

import uuid
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

import logging

from src.models import UserPreference

logger = logging.getLogger(__name__)


def _publish_event(topic: str, data: dict) -> None:
    """Publish event to Dapr, gracefully handling missing dapr dependency."""
    try:
        from src.events.publisher import publish_event
        publish_event(topic, data)
    except ImportError:
        logger.debug("Dapr client not available - skipping event publish")
    except Exception as e:
        logger.error(f"Failed to publish {topic} event: {e}")


async def get_preferences(session: AsyncSession, user_id: uuid.UUID) -> UserPreference:
    """
    Get user preferences with defaults.

    Args:
        session: Database session
        user_id: User ID to get preferences for

    Returns:
        UserPreference object with defaults if none exist
    """
    statement = select(UserPreference).where(UserPreference.user_id == user_id)
    result = await session.execute(statement)
    preferences = result.scalar_one_or_none()

    if preferences is None:
        # Return default preferences
        preferences = UserPreference(
            user_id=user_id,
            notification_channel="in-app",
            timezone="UTC",
            reminder_offset_minutes=15,
            default_priority="medium",
            sort_order="created_at_desc",
            theme="light"
        )
        # We don't save the default preferences to the database here
        # They will be saved when user updates them

    return preferences


async def update_preferences(
    session: AsyncSession,
    user_id: uuid.UUID,
    updates: Dict[str, Any]
) -> UserPreference:
    """
    Update user preferences with partial updates.

    Args:
        session: Database session
        user_id: User ID whose preferences to update
        updates: Dictionary of field-value pairs to update

    Returns:
        Updated UserPreference object
    """
    # Get existing preferences or create with defaults
    statement = select(UserPreference).where(UserPreference.user_id == user_id)
    result = await session.execute(statement)
    existing_pref = result.scalar_one_or_none()

    if existing_pref is None:
        # Create new preferences with defaults
        existing_pref = UserPreference(
            user_id=user_id,
            notification_channel="in-app",
            timezone="UTC",
            reminder_offset_minutes=15,
            default_priority="medium",
            sort_order="created_at_desc",
            theme="light"
        )
        session.add(existing_pref)

    # Apply updates
    for field, value in updates.items():
        if hasattr(existing_pref, field):
            setattr(existing_pref, field, value)

    # Save to database
    session.add(existing_pref)
    await session.commit()
    await session.refresh(existing_pref)

    # Emit user.preference.changed event
    _publish_event("user.preference.changed", {
        "user_id": str(user_id),
        "updated_fields": list(updates.keys()),
        "preferences": {
            "notification_channel": existing_pref.notification_channel,
            "timezone": existing_pref.timezone,
            "reminder_offset_minutes": existing_pref.reminder_offset_minutes,
            "default_priority": existing_pref.default_priority,
            "sort_order": existing_pref.sort_order,
            "theme": existing_pref.theme,
        },
    })

    return existing_pref


async def get_notification_channel(session: AsyncSession, user_id: uuid.UUID) -> str:
    """
    Get the notification channel preference for a user.
    """
    preferences = await get_preferences(session, user_id)
    return preferences.notification_channel


async def get_timezone(session: AsyncSession, user_id: uuid.UUID) -> str:
    """
    Get the timezone preference for a user.
    """
    preferences = await get_preferences(session, user_id)
    return preferences.timezone


async def get_theme(session: AsyncSession, user_id: uuid.UUID) -> str:
    """
    Get the theme preference for a user.
    """
    preferences = await get_preferences(session, user_id)
    return preferences.theme


async def get_default_priority(session: AsyncSession, user_id: uuid.UUID) -> str:
    """
    Get the default priority preference for a user.
    """
    preferences = await get_preferences(session, user_id)
    return preferences.default_priority


async def get_sort_order(session: AsyncSession, user_id: uuid.UUID) -> str:
    """
    Get the sort order preference for a user.
    """
    preferences = await get_preferences(session, user_id)
    return preferences.sort_order


async def get_reminder_offset(session: AsyncSession, user_id: uuid.UUID) -> int:
    """
    Get the reminder offset preference for a user.
    """
    preferences = await get_preferences(session, user_id)
    return preferences.reminder_offset_minutes