"""
MCP tool for updating user preferences.
"""

import asyncio
import json
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.services.preferences_service import update_preferences


async def update_preferences(user_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
    """
    Update user preferences.

    Args:
        user_id: ID of the user whose preferences to update
        updates: Dictionary of preference updates

    Returns:
        Dictionary with result of the operation
    """
    try:
        import uuid
        user_uuid = uuid.UUID(user_id)

        async with async_session_maker() as session:
            # Update user preferences
            updated_preferences = await update_preferences(
                session=session,
                user_id=user_uuid,
                updates=updates
            )

            return {
                "success": True,
                "message": "User preferences updated successfully",
                "preferences": {
                    "notification_channel": updated_preferences.notification_channel,
                    "timezone": updated_preferences.timezone,
                    "reminder_offset_minutes": updated_preferences.reminder_offset_minutes,
                    "default_priority": updated_preferences.default_priority,
                    "sort_order": updated_preferences.sort_order,
                    "theme": updated_preferences.theme
                }
            }

    except ValueError:
        return {
            "success": False,
            "error": "Invalid user ID format"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to update preferences: {str(e)}"
        }