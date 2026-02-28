"""
MCP tool for setting task recurrence.
"""

import asyncio
import json
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.services.task_service import update_task


async def set_recurrence(task_id: str, recurrence_type: str, interval: int = 1) -> Dict[str, Any]:
    """
    Set the recurrence pattern of a task.

    Args:
        task_id: ID of the task to update
        recurrence_type: Type of recurrence (none, daily, weekly, monthly)
        interval: Interval for recurrence (every N days/weeks/months)

    Returns:
        Dictionary with result of the operation
    """
    try:
        async with async_session_maker() as session:
            # Validate recurrence type
            valid_types = ["none", "daily", "weekly", "monthly"]
            if recurrence_type not in valid_types:
                return {
                    "success": False,
                    "error": f"Invalid recurrence type. Must be one of: {', '.join(valid_types)}"
                }

            # Validate interval
            if interval < 1:
                return {
                    "success": False,
                    "error": "Interval must be a positive integer"
                }

            # Update the task with recurrence settings
            updated_task = await update_task(
                session=session,
                user_id=None,  # Will be determined from task ownership
                task_id=task_id,
                recurrence_type=recurrence_type,
                recurrence_interval=interval
            )

            if updated_task:
                return {
                    "success": True,
                    "message": f"Recurrence of task {task_id} set to {recurrence_type} with interval {interval}",
                    "task": {
                        "id": str(updated_task.id),
                        "title": updated_task.title,
                        "recurrence_type": updated_task.recurrence_type,
                        "recurrence_interval": updated_task.recurrence_interval
                    }
                }
            else:
                return {
                    "success": False,
                    "error": f"Task {task_id} not found or not owned by user"
                }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to update task recurrence: {str(e)}"
        }