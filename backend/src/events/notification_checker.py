"""
Notification checker for polling and triggering various notifications.
Runs periodically to check for overdue tasks, approaching deadlines, and milestones.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.database import async_session_maker
from src.models import Task
from src.events.publisher import publish_event

logger = logging.getLogger(__name__)


async def check_for_overdue_and_deadline_notifications():
    """
    Check for overdue tasks and tasks approaching deadlines.
    Publish appropriate notification events.
    """
    logger.info("Checking for overdue and deadline approaching notifications...")

    async with async_session_maker() as session:
        current_time = datetime.utcnow()

        # Check for overdue tasks (past due date and not completed)
        overdue_cutoff = current_time.date()
        overdue_statement = select(Task).where(
            Task.due_date < current_time,
            Task.completed == False,
            Task.due_date.is_not(None)
        )

        overdue_result = await session.execute(overdue_statement)
        overdue_tasks: List[Task] = overdue_result.scalars().all()

        for task in overdue_tasks:
            # Publish overdue notification event
            event_data = {
                "task_id": str(task.id),
                "user_id": str(task.user_id),
                "task_title": task.title,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "notification_type": "overdue",
                "message": f"Overdue: Task '{task.title}' was due on {task.due_date.strftime('%Y-%m-%d %H:%M') if task.due_date else 'unknown'}"
            }

            publish_event("notification.sent", event_data)
            logger.info(f"Published overdue notification for task {task.id}")

        # Check for tasks due within 24 hours (deadline approaching)
        tomorrow = current_time + timedelta(hours=24)
        deadline_statement = select(Task).where(
            Task.due_date >= current_time,
            Task.due_date <= tomorrow,
            Task.completed == False,
            Task.due_date.is_not(None)
        )

        deadline_result = await session.execute(deadline_statement)
        deadline_tasks: List[Task] = deadline_result.scalars().all()

        for task in deadline_tasks:
            # Publish deadline approaching notification event
            event_data = {
                "task_id": str(task.id),
                "user_id": str(task.user_id),
                "task_title": task.title,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "notification_type": "deadline_approaching",
                "message": f"Deadline approaching: Task '{task.title}' is due on {task.due_date.strftime('%Y-%m-%d %H:%M') if task.due_date else 'unknown'}"
            }

            publish_event("notification.sent", event_data)
            logger.info(f"Published deadline approaching notification for task {task.id}")

    logger.info("Finished checking for overdue and deadline approaching notifications")


async def start_notification_checker(interval_hours: int = 1):
    """
    Start the notification checker loop.

    Args:
        interval_hours: How often to check for notifications (default 1 hour)
    """
    logger.info(f"Starting notification checker with {interval_hours}h interval")

    while True:
        try:
            await check_for_overdue_and_deadline_notifications()
        except Exception as e:
            logger.error(f"Error in notification checker: {e}")

        # Wait for the specified interval before next check
        await asyncio.sleep(interval_hours * 3600)  # Convert hours to seconds