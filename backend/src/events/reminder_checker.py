"""
Reminder checker for polling and triggering reminders.
Runs periodically to check for reminders that should fire.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.models import Reminder
from src.events.publisher import publish_event
from src.services.reminder_service import get_upcoming_reminders

logger = logging.getLogger(__name__)


async def check_for_due_reminders():
    """
    Poll the database for reminders that should fire now.
    For each due reminder, publish a reminder.due event.
    """
    logger.info("Checking for due reminders...")

    async with async_session_maker() as session:
        # Check for reminders that should fire within the last minute
        # (to handle any timing delays)
        check_time = datetime.utcnow()

        due_reminders: List[Reminder] = await get_upcoming_reminders(session, check_time)

        logger.info(f"Found {len(due_reminders)} due reminders")

        for reminder in due_reminders:
            try:
                # Publish reminder.due event
                event_data = {
                    "reminder_id": str(reminder.id),
                    "task_id": str(reminder.task_id),
                    "user_id": str(reminder.user_id),
                    "reminder_time": reminder.reminder_time.isoformat(),
                }

                publish_event("reminder.due", event_data)

                # Update reminder status to 'fired'
                reminder.status = "fired"
                session.add(reminder)

                logger.info(f"Published reminder.due event for reminder {reminder.id}")

            except Exception as e:
                logger.error(f"Failed to process reminder {reminder.id}: {e}")
                # Don't update status if publishing failed, so it will be retried

        # Commit all changes at once
        await session.commit()

    logger.info("Finished checking for due reminders")


async def start_reminder_checker(interval_seconds: int = 30):
    """
    Start the reminder checker loop.

    Args:
        interval_seconds: How often to check for due reminders (default 30 seconds)
    """
    logger.info(f"Starting reminder checker with {interval_seconds}s interval")

    while True:
        try:
            await check_for_due_reminders()
        except Exception as e:
            logger.error(f"Error in reminder checker: {e}")

        # Wait for the specified interval before next check
        await asyncio.sleep(interval_seconds)