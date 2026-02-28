"""
Preferences API endpoints for getting and updating user preferences.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.middleware.auth_middleware import CurrentUser
from src.services.preferences_service import get_preferences, update_preferences

router = APIRouter(prefix="/preferences", tags=["preferences"])


@router.get("/")
async def get_preferences_endpoint(
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """
    Get user preferences.
    Returns 200 with user preferences.
    """
    preferences = await get_preferences(session, current_user.id)
    return {
        "id": str(preferences.id) if preferences.id else None,
        "user_id": str(preferences.user_id),
        "notification_channel": preferences.notification_channel,
        "timezone": preferences.timezone,
        "reminder_offset_minutes": preferences.reminder_offset_minutes,
        "default_priority": preferences.default_priority,
        "sort_order": preferences.sort_order,
        "theme": preferences.theme,
    }


@router.patch("/")
async def update_preferences_endpoint(
    updates: dict,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """
    Update user preferences with partial update.
    Returns 200 with updated preferences.
    """
    # Validate allowed fields
    allowed_fields = {
        "notification_channel", "timezone", "reminder_offset_minutes",
        "default_priority", "sort_order", "theme"
    }

    # Filter updates to only allowed fields
    filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    updated_preferences = await update_preferences(
        session, current_user.id, filtered_updates
    )

    return {
        "id": str(updated_preferences.id),
        "user_id": str(updated_preferences.user_id),
        "notification_channel": updated_preferences.notification_channel,
        "timezone": updated_preferences.timezone,
        "reminder_offset_minutes": updated_preferences.reminder_offset_minutes,
        "default_priority": updated_preferences.default_priority,
        "sort_order": updated_preferences.sort_order,
        "theme": updated_preferences.theme,
    }
