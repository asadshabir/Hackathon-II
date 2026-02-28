"""
MCP tool for querying user analytics.
"""

import asyncio
import json
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.services.analytics_service import get_analytics


async def query_analytics(user_id: str) -> Dict[str, Any]:
    """
    Query analytics data for a user.

    Args:
        user_id: ID of the user to query analytics for

    Returns:
        Dictionary with analytics data
    """
    try:
        import uuid
        user_uuid = uuid.UUID(user_id)

        async with async_session_maker() as session:
            # Get analytics for the user
            analytics_data = await get_analytics(session, user_uuid)

            return {
                "success": True,
                "analytics": analytics_data
            }

    except ValueError:
        return {
            "success": False,
            "error": "Invalid user ID format"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to query analytics: {str(e)}"
        }