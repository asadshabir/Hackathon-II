"""
Unit tests for due date field in event emission.
"""

import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_create_event_includes_due_date():
    """task.created event should include the due_date field."""
    user_id = uuid.uuid4()
    due = datetime(2026, 3, 15, 9, 0, 0)

    task_obj = MagicMock()
    task_obj.id = uuid.uuid4()
    task_obj.user_id = user_id
    task_obj.title = "Due date task"
    task_obj.priority = "medium"
    task_obj.completed = False
    task_obj.created_at = datetime(2026, 2, 9, 12, 0, 0)
    task_obj.completed_at = None
    task_obj.due_date = due
    task_obj.recurrence_type = "none"
    task_obj.recurrence_interval = 1

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.Task", return_value=task_obj),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import create_task

        await create_task(mock_session, user_id, "Due date task", due_date=due)

        mock_publish.assert_called_once()
        payload = mock_publish.call_args[0][1]
        assert "due_date" in payload
        assert payload["due_date"] == due.isoformat()


@pytest.mark.asyncio
async def test_update_event_tracks_due_date_change():
    """task.updated event should include due_date in before/after."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()
    new_due = datetime(2026, 4, 1, 10, 0, 0)

    task_obj = MagicMock()
    task_obj.id = task_id
    task_obj.user_id = user_id
    task_obj.title = "Task"
    task_obj.priority = "medium"
    task_obj.completed = False
    task_obj.due_date = None
    task_obj.recurrence_type = "none"
    task_obj.recurrence_interval = 1

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=task_obj),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import update_task

        await update_task(mock_session, user_id, task_id, due_date=new_due)

        mock_publish.assert_called_once()
        payload = mock_publish.call_args[0][1]
        assert "due_date" in payload["changed_fields"]
