"""
Unit tests for due date CRUD and filtering.
"""

import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.models.task import Task


def _make_task(
    due_date: datetime | None = None,
    user_id: uuid.UUID | None = None,
) -> MagicMock:
    task = MagicMock(spec=Task)
    task.id = uuid.uuid4()
    task.user_id = user_id or uuid.uuid4()
    task.title = "Test task"
    task.priority = "medium"
    task.completed = False
    task.created_at = datetime(2026, 2, 9, 12, 0, 0)
    task.completed_at = None
    task.due_date = due_date
    task.recurrence_type = "none"
    task.recurrence_interval = 1
    return task


@pytest.mark.asyncio
async def test_create_task_with_due_date():
    """Creating a task with due_date should persist it."""
    user_id = uuid.uuid4()
    due = datetime(2026, 3, 15, 9, 0, 0)
    task_obj = _make_task(due_date=due, user_id=user_id)

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.Task", return_value=task_obj),
        patch("src.services.task_service.publish_event"),
    ):
        from src.services.task_service import create_task

        result = await create_task(
            mock_session, user_id, "Due task", due_date=due
        )
        assert result.due_date == due


@pytest.mark.asyncio
async def test_create_task_without_due_date():
    """Creating a task without due_date should default to None."""
    task_obj = _make_task()

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.Task", return_value=task_obj),
        patch("src.services.task_service.publish_event"),
    ):
        from src.services.task_service import create_task

        result = await create_task(mock_session, uuid.uuid4(), "No due date")
        assert result.due_date is None


@pytest.mark.asyncio
async def test_update_task_due_date():
    """Updating a task's due_date should persist the change."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()
    new_due = datetime(2026, 4, 1, 10, 0, 0)
    task_obj = _make_task(user_id=user_id)

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=task_obj),
        patch("src.services.task_service.publish_event"),
    ):
        from src.services.task_service import update_task

        result = await update_task(
            mock_session, user_id, task_id, due_date=new_due
        )
        assert result is not None
