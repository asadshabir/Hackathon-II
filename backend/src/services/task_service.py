"""
Task service for CRUD operations on tasks.
All operations are scoped to the authenticated user.
"""

import uuid
from datetime import datetime
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import case
from sqlmodel import select

from sqlalchemy import delete as sql_delete

from src.models import Task, TaskCreate
from src.models.reminder import Reminder
from src.models.tag import TaskTag
from src.models.task import PRIORITY_VALUES

logger = logging.getLogger(__name__)


def _publish_event(topic: str, data: dict) -> None:
    """Publish event to Dapr, gracefully handling missing dapr dependency."""
    try:
        from src.events.publisher import publish_event
        publish_event(topic, data)
    except ImportError:
        logger.debug("Dapr client not available - skipping event publish")
    except Exception as e:
        logger.error(f"Failed to publish {topic} event: {e}")

# Priority sort mapping (urgent first)
PRIORITY_ORDER = {"urgent": 0, "high": 1, "medium": 2, "low": 3}

# Sentinel value to distinguish "not provided" from None (for clearing due_date)
_UNSET = object()


async def create_task(
    session: AsyncSession,
    user_id: uuid.UUID,
    title: str,
    priority: str = "medium",
    due_date: datetime | None = None,
    recurrence_type: str = "none",
    recurrence_interval: int = 1,
) -> Task:
    """
    Create a new task for a user.

    Args:
        session: Database session
        user_id: Owner's user ID
        title: Task title (max 500 chars)
        priority: Priority level (low/medium/high/urgent)
        due_date: Optional due date
        recurrence_type: Recurrence pattern (none/daily/weekly/monthly)
        recurrence_interval: Recurrence interval (default 1)

    Returns:
        Created Task object
    """
    # Truncate title if too long
    title = title.strip()[:500]

    # Validate priority
    if priority not in PRIORITY_VALUES:
        priority = "medium"

    # Validate that recurrence requires due_date
    if recurrence_type != "none" and due_date is None:
        raise ValueError("Recurrence requires a due date to be set")

    task = Task(
        user_id=user_id,
        title=title,
        completed=False,
        priority=priority,
        due_date=due_date,
        recurrence_type=recurrence_type,
        recurrence_interval=max(1, recurrence_interval),
    )
    session.add(task)
    await session.flush()
    await session.refresh(task)

    # Emit task.created event
    _publish_event("task.created", {
        "task_id": str(task.id),
        "user_id": str(user_id),
        "title": task.title,
        "completed": task.completed,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat() if task.created_at else None,
    })

    return task


async def get_tasks(
    session: AsyncSession,
    user_id: uuid.UUID,
    filter_type: str = "all",
    sort_by: str = "created_at",
    due_before: datetime | None = None,
    due_after: datetime | None = None,
    search_query: str | None = None,
    priority_filter: str | None = None,
) -> list[Task]:
    """
    Get tasks for a user with optional filtering and sorting.

    Args:
        session: Database session
        user_id: Owner's user ID
        filter_type: "all", "pending", or "completed"
        sort_by: Sort field — "created_at" (default), "priority", "due_date"
        due_before: Filter tasks due before this date
        due_after: Filter tasks due after this date
        search_query: ILIKE search on title
        priority_filter: Filter by specific priority level

    Returns:
        List of Task objects
    """
    statement = select(Task).where(Task.user_id == user_id)

    if filter_type == "pending":
        statement = statement.where(Task.completed == False)
    elif filter_type == "completed":
        statement = statement.where(Task.completed == True)

    if due_before is not None:
        statement = statement.where(Task.due_date <= due_before)

    if due_after is not None:
        statement = statement.where(Task.due_date >= due_after)

    if search_query:
        statement = statement.where(Task.title.ilike(f"%{search_query}%"))

    if priority_filter and priority_filter in PRIORITY_VALUES:
        statement = statement.where(Task.priority == priority_filter)

    if sort_by == "priority":
        # Sort by priority order: urgent(0) > high(1) > medium(2) > low(3)
        priority_case = case(
            (Task.priority == "urgent", 0),
            (Task.priority == "high", 1),
            (Task.priority == "medium", 2),
            (Task.priority == "low", 3),
            else_=4,
        )
        statement = statement.order_by(priority_case, Task.created_at.desc())
    elif sort_by == "due_date":
        # Tasks with due dates first (nulls last), then by date
        statement = statement.order_by(
            Task.due_date.is_(None),
            Task.due_date.asc(),
            Task.created_at.desc(),
        )
    else:
        statement = statement.order_by(Task.created_at.desc())

    result = await session.execute(statement)
    return list(result.scalars().all())


async def get_task_by_id(
    session: AsyncSession, user_id: uuid.UUID, task_id: uuid.UUID
) -> Task | None:
    """Get a specific task by ID (user-scoped)."""
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def find_task_by_term(
    session: AsyncSession, user_id: uuid.UUID, search_term: str
) -> list[Task]:
    """
    Find tasks matching a search term (case-insensitive).

    Args:
        session: Database session
        user_id: Owner's user ID
        search_term: Text to search in task titles

    Returns:
        List of matching Task objects
    """
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .where(Task.title.ilike(f"%{search_term}%"))
        .order_by(Task.created_at.desc())
    )
    result = await session.execute(statement)
    return list(result.scalars().all())


async def complete_task(
    session: AsyncSession, user_id: uuid.UUID, task_id: uuid.UUID
) -> Task | None:
    """
    Mark a task as completed.

    Args:
        session: Database session
        user_id: Owner's user ID
        task_id: Task to complete

    Returns:
        Updated Task or None if not found
    """
    task = await get_task_by_id(session, user_id, task_id)
    if task is None:
        return None

    task.completed = True
    task.completed_at = datetime.utcnow()
    session.add(task)
    await session.flush()
    await session.refresh(task)

    # Emit task.completed event
    _publish_event("task.completed", {
        "task_id": str(task.id),
        "user_id": str(user_id),
        "title": task.title,
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
    })

    return task


async def delete_task(
    session: AsyncSession, user_id: uuid.UUID, task_id: uuid.UUID
) -> str | None:
    """
    Delete a task.

    Args:
        session: Database session
        user_id: Owner's user ID
        task_id: Task to delete

    Returns:
        Deleted task title or None if not found
    """
    task = await get_task_by_id(session, user_id, task_id)
    if task is None:
        return None

    title = task.title
    task_id_str = str(task.id)

    # Cascade delete related records to avoid FK violations
    await session.execute(sql_delete(Reminder).where(Reminder.task_id == task_id))
    await session.execute(sql_delete(TaskTag).where(TaskTag.task_id == task_id))

    await session.delete(task)
    await session.flush()

    # Emit task.deleted event
    _publish_event("task.deleted", {
        "task_id": task_id_str,
        "user_id": str(user_id),
        "title": title,
    })

    return title


async def update_task(
    session: AsyncSession,
    user_id: uuid.UUID,
    task_id: uuid.UUID,
    new_title: str | None = None,
    completed: bool | None = None,
    priority: str | None = None,
    due_date: datetime | None = _UNSET,
    recurrence_type: str | None = None,
    recurrence_interval: int | None = None,
) -> Task | None:
    """
    Update a task's fields.

    Args:
        session: Database session
        user_id: Owner's user ID
        task_id: Task to update
        new_title: New title (optional)
        completed: New completion status (optional)
        priority: New priority level (optional)
        due_date: New due date (optional, pass None to clear)
        recurrence_type: New recurrence type (optional)
        recurrence_interval: New recurrence interval (optional)

    Returns:
        Updated Task or None if not found
    """
    task = await get_task_by_id(session, user_id, task_id)
    if task is None:
        return None

    # Keep track of changes for the event
    before_changes = {
        "title": task.title,
        "completed": task.completed,
        "priority": task.priority,
        "due_date": task.due_date.isoformat() if task.due_date else None,
    }

    changed_fields: list[str] = []

    if new_title is not None:
        task.title = new_title.strip()[:500]
        changed_fields.append("title")

    if completed is not None:
        task.completed = completed
        if completed:
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None
        changed_fields.append("completed")

    if priority is not None:
        if priority in PRIORITY_VALUES:
            task.priority = priority
            changed_fields.append("priority")

    if due_date is not _UNSET:
        task.due_date = due_date
        changed_fields.append("due_date")

    if recurrence_type is not None:
        # Validate that recurrence requires due_date
        if recurrence_type != "none" and task.due_date is None:
            raise ValueError("Recurrence requires a due date to be set")
        task.recurrence_type = recurrence_type
        changed_fields.append("recurrence_type")

    if recurrence_interval is not None:
        task.recurrence_interval = max(1, recurrence_interval)
        changed_fields.append("recurrence_interval")

    session.add(task)
    await session.flush()
    await session.refresh(task)

    # Emit task.updated event
    _publish_event("task.updated", {
        "task_id": str(task.id),
        "user_id": str(user_id),
        "changed_fields": changed_fields,
        "before": before_changes,
        "after": {
            "title": task.title,
            "completed": task.completed,
            "priority": task.priority,
            "due_date": task.due_date.isoformat() if task.due_date else None,
        },
    })

    return task
