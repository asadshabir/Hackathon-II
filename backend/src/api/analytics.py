"""
Analytics API endpoints for retrieving analytical data.
"""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.middleware.auth_middleware import CurrentUser
from src.services.analytics_service import get_analytics

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/")
async def get_analytics_endpoint(
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
):
    """
    Get full analytics for the authenticated user.
    Response should return within 500ms.
    """
    analytics_data = await get_analytics(session, current_user.id)
    return analytics_data
