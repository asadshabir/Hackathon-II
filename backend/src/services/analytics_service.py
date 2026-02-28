"""
Analytics service for providing analytical data.
Reads from projections (fast reads) and returns aggregated analytics.
"""

import uuid
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.events.projections import get_analytics_projections


async def get_analytics(session: AsyncSession, user_id: uuid.UUID) -> Dict[str, Any]:
    """
    Get analytics for a user.

    Args:
        session: Database session
        user_id: User ID to get analytics for

    Returns:
        Dictionary with analytics data
    """
    projections = get_analytics_projections(session)
    analytics = await projections.get_user_analytics(str(user_id))

    return analytics


async def get_completion_today(session: AsyncSession, user_id: uuid.UUID) -> int:
    """
    Get number of tasks completed today by user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("completion_today", 0)


async def get_completion_week(session: AsyncSession, user_id: uuid.UUID) -> int:
    """
    Get number of tasks completed this week by user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("completion_week", 0)


async def get_completion_month(session: AsyncSession, user_id: uuid.UUID) -> int:
    """
    Get number of tasks completed this month by user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("completion_month", 0)


async def get_streak_info(session: AsyncSession, user_id: uuid.UUID) -> Dict[str, int]:
    """
    Get streak information for a user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("streak", {"current": 0, "longest": 0})


async def get_priority_distribution(session: AsyncSession, user_id: uuid.UUID) -> Dict[str, int]:
    """
    Get priority distribution for a user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("priority_distribution", {"low": 0, "medium": 0, "high": 0, "urgent": 0})


async def get_tag_distribution(session: AsyncSession, user_id: uuid.UUID) -> Dict[str, int]:
    """
    Get tag distribution for a user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("tag_distribution", {})


async def get_overdue_count(session: AsyncSession, user_id: uuid.UUID) -> int:
    """
    Get count of overdue tasks for a user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("overdue_count", 0)


async def get_trends(session: AsyncSession, user_id: uuid.UUID) -> list:
    """
    Get trend data for a user.
    """
    analytics = await get_analytics(session, user_id)
    return analytics.get("trends", [])