"""
MCP tool for setting task priority.
"""

import asyncio
import json
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.services.task_service import update_task
from src.models import Task


async def set_priority(task_id: str, priority: str) -> Dict[str, Any]:
    """
    Set the priority of a task.

    Args:
        task_id: ID of the task to update
        priority: New priority level (low, medium, high, urgent)

    Returns:
        Dictionary with result of the operation
    """
    try:
        async with async_session_maker() as session:
            # Validate priority
            valid_priorities = ["low", "medium", "high", "urgent"]
            if priority not in valid_priorities:
                return {
                    "success": False,
                    "error": f"Invalid priority. Must be one of: {', '.join(valid_priorities)}"
                }

            # Update the task
            updated_task = await update_task(
                session=session,
                user_id=None,  # Will be determined from task ownership
                task_id=task_id,
                priority=priority
            )

            if updated_task:
                return {
                    "success": True,
                    "message": f"Priority of task {task_id} updated to {priority}",
                    "task": {
                        "id": str(updated_task.id),
                        "title": updated_task.title,
                        "priority": updated_task.priority
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
            "error": f"Failed to update task priority: {str(e)}"
        }