"""
Reminder API endpoints for creating and managing reminders.
"""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.middleware.auth_middleware import CurrentUser
from src.middleware.error_handler import NotFoundError, ValidationError
from src.models import ReminderResponse
from src.services.reminder_service import (
    cancel_reminder,
    create_reminder,
    get_pending_by_user,
)

router = APIRouter(prefix="/reminders", tags=["reminders"])


class ReminderCreateRequest(BaseModel):
    """Request body for creating a reminder."""

    task_id: uuid.UUID
    reminder_time: str  # ISO 8601


class ReminderListResponse(BaseModel):
    """Response for reminder list."""

    reminders: list[ReminderResponse]
    count: int


@router.get("", response_model=ReminderListResponse)
async def list_reminders(
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ReminderListResponse:
    """List all pending reminders for the current user."""
    reminders = await get_pending_by_user(session, current_user.id)
    return ReminderListResponse(
        reminders=[
            ReminderResponse(
                id=r.id,
                task_id=r.task_id,
                reminder_time=r.reminder_time,
                status=r.status,
                created_at=r.created_at,
            )
            for r in reminders
        ],
        count=len(reminders),
    )


@router.post("", response_model=ReminderResponse, status_code=201)
async def create_reminder_endpoint(
    request: ReminderCreateRequest,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> ReminderResponse:
    """Create a new reminder for a task."""
    # Parse reminder time
    try:
        reminder_time = datetime.fromisoformat(request.reminder_time)
    except ValueError:
        raise ValidationError("Invalid reminder_time format. Use ISO 8601.")

    # Validate reminder time is in the future
    if reminder_time <= datetime.utcnow():
        raise ValidationError("Reminder time must be in the future")

    reminder = await create_reminder(
        session=session,
        task_id=request.task_id,
        user_id=current_user.id,
        reminder_time=reminder_time,
    )

    return ReminderResponse(
        id=reminder.id,
        task_id=reminder.task_id,
        reminder_time=reminder.reminder_time,
        status=reminder.status,
        created_at=reminder.created_at,
    )


@router.delete("/{reminder_id}")
async def cancel_reminder_endpoint(
    reminder_id: uuid.UUID,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    """Cancel a pending reminder."""
    result = await cancel_reminder(session, reminder_id)

    if not result:
        raise NotFoundError("Reminder not found")

    if result.status != "cancelled":
        raise ValidationError("Cannot cancel reminder that is not pending")

    return {"message": "Reminder cancelled successfully", "id": str(reminder_id)}
