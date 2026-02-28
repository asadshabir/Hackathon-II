"""
MCP tool for assigning tags to tasks.
"""

import asyncio
import json
from typing import Dict, Any, List

from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.services.task_service import update_task
from src.services.tag_service import assign_tags_to_task


async def assign_tags(task_id: str, tag_names: List[str]) -> Dict[str, Any]:
    """
    Assign tags to a task.

    Args:
        task_id: ID of the task to update
        tag_names: List of tag names to assign

    Returns:
        Dictionary with result of the operation
    """
    try:
        async with async_session_maker() as session:
            # Validate tag names are provided
            if not tag_names:
                return {
                    "success": False,
                    "error": "No tags provided to assign"
                }

            # Assign tags to task
            result = await assign_tags_to_task(
                session=session,
                task_id=task_id,
                tag_names=tag_names
            )

            if result:
                return {
                    "success": True,
                    "message": f"Tags {', '.join(tag_names)} assigned to task {task_id}",
                    "assigned_tags": result
                }
            else:
                return {
                    "success": False,
                    "error": f"Failed to assign tags to task {task_id}"
                }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to assign tags: {str(e)}"
        }