"""
Reminder service for managing task reminders.
Handles creation, cancellation, and querying of reminders.
"""

import uuid
from datetime import datetime
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.models import Reminder, UserPreference


async def create_reminder(
    session: AsyncSession,
    task_id: uuid.UUID,
    user_id: uuid.UUID,
    reminder_time: datetime
) -> Reminder:
    """
    Create a new reminder for a task.

    Args:
        session: Database session
        task_id: Task ID to remind about
        user_id: User ID who owns the task
        reminder_time: When to trigger the reminder

    Returns:
        Created Reminder object
    """
    reminder = Reminder(
        task_id=task_id,
        user_id=user_id,
        reminder_time=reminder_time,
        status="pending"
    )

    session.add(reminder)
    await session.commit()
    await session.refresh(reminder)

    return reminder


async def cancel_reminder(
    session: AsyncSession,
    reminder_id: uuid.UUID
) -> Reminder | None:
    """
    Cancel a pending reminder.

    Args:
        session: Database session
        reminder_id: ID of reminder to cancel

    Returns:
        Updated Reminder object or None if not found
    """
    # Get the reminder
    reminder = await session.get(Reminder, reminder_id)
    if not reminder:
        return None

    if reminder.status != "pending":
        # Cannot cancel a reminder that isn't pending
        return reminder

    # Update status to cancelled
    reminder.status = "cancelled"
    session.add(reminder)
    await session.commit()
    await session.refresh(reminder)

    return reminder


async def cancel_by_task(
    session: AsyncSession,
    task_id: uuid.UUID
) -> int:
    """
    Cancel all pending reminders for a task.

    Args:
        session: Database session
        task_id: Task ID to cancel reminders for

    Returns:
        Number of reminders cancelled
    """
    # Query for all pending reminders for this task
    statement = select(Reminder).where(
        Reminder.task_id == task_id,
        Reminder.status == "pending"
    )

    result = await session.execute(statement)
    reminders = result.scalars().all()

    cancelled_count = 0
    for reminder in reminders:
        reminder.status = "cancelled"
        session.add(reminder)
        cancelled_count += 1

    if cancelled_count > 0:
        await session.commit()

    return cancelled_count


async def get_pending_by_user(
    session: AsyncSession,
    user_id: uuid.UUID
) -> List[Reminder]:
    """
    Get all pending reminders for a user.

    Args:
        session: Database session
        user_id: User ID to query for

    Returns:
        List of pending Reminder objects
    """
    statement = select(Reminder).where(
        Reminder.user_id == user_id,
        Reminder.status == "pending"
    ).order_by(Reminder.reminder_time.asc())

    result = await session.execute(statement)
    return result.scalars().all()


async def get_upcoming_reminders(
    session: AsyncSession,
    check_time: datetime
) -> List[Reminder]:
    """
    Get all reminders that should fire before or at the check_time.

    Args:
        session: Database session
        check_time: Time to check for upcoming reminders

    Returns:
        List of Reminder objects that should fire
    """
    statement = select(Reminder).where(
        Reminder.reminder_time <= check_time,
        Reminder.status == "pending"
    ).order_by(Reminder.reminder_time.asc())

    result = await session.execute(statement)
    return result.scalars().all()


async def get_user_preferences(
    session: AsyncSession,
    user_id: uuid.UUID
) -> UserPreference | None:
    """
    Get user preferences for reminders and notifications.

    Args:
        session: Database session
        user_id: User ID to get preferences for

    Returns:
        UserPreference object or None if not set
    """
    statement = select(UserPreference).where(
        UserPreference.user_id == user_id
    )

    result = await session.execute(statement)
    return result.scalar_one_or_none()