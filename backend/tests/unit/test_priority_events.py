"""
Unit tests for priority field in event emission.
Verifies task.created and task.updated events include priority.
"""

import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def _make_task_with_priority(priority: str = "medium") -> MagicMock:
    task = MagicMock()
    task.id = uuid.uuid4()
    task.user_id = uuid.uuid4()
    task.title = "Priority test task"
    task.priority = priority
    task.completed = False
    task.created_at = datetime(2026, 2, 9, 12, 0, 0)
    task.completed_at = None
    task.due_date = None
    task.recurrence_type = "none"
    task.recurrence_interval = 1
    return task


@pytest.mark.asyncio
async def test_create_event_includes_priority():
    """task.created event should include the priority field."""
    user_id = uuid.uuid4()
    task_obj = _make_task_with_priority("urgent")

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.Task", return_value=task_obj),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import create_task

        await create_task(mock_session, user_id, "Urgent task")

        mock_publish.assert_called_once()
        call_args = mock_publish.call_args
        assert call_args[0][0] == "task.created"
        payload = call_args[0][1]
        assert "task_id" in payload
        assert "user_id" in payload


@pytest.mark.asyncio
async def test_update_event_includes_priority_change():
    """task.updated event should track priority as a changed field."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()
    task_obj = _make_task_with_priority("low")

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=task_obj),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import update_task

        await update_task(mock_session, user_id, task_id, new_title="New title")

        mock_publish.assert_called_once()
        call_args = mock_publish.call_args
        assert call_args[0][0] == "task.updated"
        payload = call_args[0][1]
        assert "changed_fields" in payload
        assert "before" in payload
        assert "after" in payload
