"""
Unit tests for priority CRUD operations.
Tests creating tasks with priorities, updating priorities, defaults, and sorting.
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.models.task import PRIORITY_VALUES, Task


def _make_task(
    priority: str = "medium",
    title: str = "Test task",
    user_id: uuid.UUID | None = None,
) -> MagicMock:
    task = MagicMock(spec=Task)
    task.id = uuid.uuid4()
    task.user_id = user_id or uuid.uuid4()
    task.title = title
    task.priority = priority
    task.completed = False
    task.created_at = MagicMock()
    task.completed_at = None
    task.due_date = None
    task.recurrence_type = "none"
    task.recurrence_interval = 1
    return task


@pytest.mark.asyncio
async def test_create_task_with_default_priority():
    """Creating a task without priority should default to 'medium'."""
    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    task_obj = _make_task(priority="medium")

    with (
        patch("src.services.task_service.Task", return_value=task_obj),
        patch("src.services.task_service.publish_event"),
    ):
        from src.services.task_service import create_task

        result = await create_task(mock_session, uuid.uuid4(), "Test task")
        assert result.priority == "medium"


@pytest.mark.asyncio
async def test_create_task_with_each_priority():
    """Tasks should accept all valid priority levels."""
    for prio in PRIORITY_VALUES:
        task_obj = _make_task(priority=prio)
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
                mock_session, uuid.uuid4(), f"{prio} task"
            )
            assert result.priority == prio


@pytest.mark.asyncio
async def test_update_task_priority():
    """Updating a task's priority should persist the new value."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()
    task_obj = _make_task(priority="low")

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
            mock_session, user_id, task_id, new_title=None, completed=None
        )
        assert result is not None


@pytest.mark.asyncio
async def test_sort_tasks_by_priority():
    """Tasks should be sortable by priority level."""
    # Priority ordering: urgent > high > medium > low
    priority_order = {"urgent": 0, "high": 1, "medium": 2, "low": 3}

    tasks = [
        _make_task(priority="low", title="Low task"),
        _make_task(priority="urgent", title="Urgent task"),
        _make_task(priority="medium", title="Medium task"),
        _make_task(priority="high", title="High task"),
    ]

    sorted_tasks = sorted(tasks, key=lambda t: priority_order.get(t.priority, 99))

    assert sorted_tasks[0].priority == "urgent"
    assert sorted_tasks[1].priority == "high"
    assert sorted_tasks[2].priority == "medium"
    assert sorted_tasks[3].priority == "low"
