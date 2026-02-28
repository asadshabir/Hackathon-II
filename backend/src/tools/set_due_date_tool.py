"""
MCP tool for setting task due date.
"""

import asyncio
import json
from datetime import datetime
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.services.task_service import update_task


async def set_due_date(task_id: str, due_date: str) -> Dict[str, Any]:
    """
    Set the due date of a task.

    Args:
        task_id: ID of the task to update
        due_date: Due date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)

    Returns:
        Dictionary with result of the operation
    """
    try:
        # Parse the due date
        parsed_date = None
        try:
            # Try parsing as full datetime first
            parsed_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
        except ValueError:
            try:
                # Try parsing as date only
                parsed_date = datetime.strptime(due_date, "%Y-%m-%d")
            except ValueError:
                return {
                    "success": False,
                    "error": "Invalid date format. Use YYYY-MM-DD or ISO format."
                }

        async with async_session_maker() as session:
            # Update the task with the new due date
            updated_task = await update_task(
                session=session,
                user_id=None,  # Will be determined from task ownership
                task_id=task_id,
                due_date=parsed_date
            )

            if updated_task:
                return {
                    "success": True,
                    "message": f"Due date of task {task_id} updated to {parsed_date.isoformat()}",
                    "task": {
                        "id": str(updated_task.id),
                        "title": updated_task.title,
                        "due_date": updated_task.due_date.isoformat() if updated_task.due_date else None
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
            "error": f"Failed to update task due date: {str(e)}"
        }