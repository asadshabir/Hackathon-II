"""
Unit tests for event emission in task_service.py.
Verifies that publish_event is called with correct args for
create, update, complete, and delete operations.
"""

import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


# Mock task factory
def _make_task(
    task_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    title: str = "Test task",
    completed: bool = False,
    created_at: datetime | None = None,
    completed_at: datetime | None = None,
) -> MagicMock:
    task = MagicMock()
    task.id = task_id or uuid.uuid4()
    task.user_id = user_id or uuid.uuid4()
    task.title = title
    task.completed = completed
    task.created_at = created_at or datetime(2026, 2, 9, 12, 0, 0)
    task.completed_at = completed_at
    return task


@pytest.mark.asyncio
async def test_create_task_emits_event():
    """create_task should call publish_event('task.created', ...) with task details."""
    user_id = uuid.uuid4()
    task_obj = _make_task(user_id=user_id, title="Buy groceries")

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()

    with (
        patch("src.services.task_service.Task", return_value=task_obj) as MockTask,
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        # Mock session.add to store the task
        mock_session.add = MagicMock()

        from src.services.task_service import create_task

        result = await create_task(mock_session, user_id, "Buy groceries")

        mock_publish.assert_called_once()
        call_args = mock_publish.call_args
        assert call_args[0][0] == "task.created"
        payload = call_args[0][1]
        assert payload["user_id"] == str(user_id)
        assert payload["title"] == task_obj.title
        assert "task_id" in payload


@pytest.mark.asyncio
async def test_update_task_emits_event():
    """update_task should call publish_event('task.updated', ...) with changed fields."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()
    task_obj = _make_task(task_id=task_id, user_id=user_id, title="Old title")

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=task_obj),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import update_task

        result = await update_task(mock_session, user_id, task_id, new_title="New title")

        mock_publish.assert_called_once()
        call_args = mock_publish.call_args
        assert call_args[0][0] == "task.updated"
        payload = call_args[0][1]
        assert payload["task_id"] == str(task_id)
        assert "title" in payload["changed_fields"]
        assert payload["before"]["title"] == "Old title"


@pytest.mark.asyncio
async def test_complete_task_emits_event():
    """complete_task should call publish_event('task.completed', ...) with task details."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()
    task_obj = _make_task(task_id=task_id, user_id=user_id, title="Finish report")

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=task_obj),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import complete_task

        result = await complete_task(mock_session, user_id, task_id)

        mock_publish.assert_called_once()
        call_args = mock_publish.call_args
        assert call_args[0][0] == "task.completed"
        payload = call_args[0][1]
        assert payload["task_id"] == str(task_id)
        assert payload["user_id"] == str(user_id)
        assert payload["title"] == "Finish report"


@pytest.mark.asyncio
async def test_delete_task_emits_event():
    """delete_task should call publish_event('task.deleted', ...) after deletion."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()
    task_obj = _make_task(task_id=task_id, user_id=user_id, title="Remove me")

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.delete = AsyncMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=task_obj),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import delete_task

        result = await delete_task(mock_session, user_id, task_id)

        assert result == "Remove me"
        mock_publish.assert_called_once()
        call_args = mock_publish.call_args
        assert call_args[0][0] == "task.deleted"
        payload = call_args[0][1]
        assert payload["task_id"] == str(task_id)
        assert payload["user_id"] == str(user_id)
        assert payload["title"] == "Remove me"


@pytest.mark.asyncio
async def test_create_task_event_failure_does_not_break_crud():
    """If publish_event raises, create_task should still succeed."""
    user_id = uuid.uuid4()
    task_obj = _make_task(user_id=user_id, title="Resilient task")

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with (
        patch("src.services.task_service.Task", return_value=task_obj),
        patch(
            "src.services.task_service.publish_event",
            side_effect=Exception("Dapr offline"),
        ),
    ):
        from src.services.task_service import create_task

        # Should NOT raise despite publish_event failure
        result = await create_task(mock_session, user_id, "Resilient task")
        assert result is not None


@pytest.mark.asyncio
async def test_complete_task_not_found_returns_none():
    """complete_task should return None if task does not exist."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()

    mock_session = AsyncMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=None),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import complete_task

        result = await complete_task(mock_session, user_id, task_id)

        assert result is None
        mock_publish.assert_not_called()


@pytest.mark.asyncio
async def test_delete_task_not_found_returns_none():
    """delete_task should return None if task does not exist."""
    user_id = uuid.uuid4()
    task_id = uuid.uuid4()

    mock_session = AsyncMock()

    with (
        patch("src.services.task_service.get_task_by_id", return_value=None),
        patch("src.services.task_service.publish_event") as mock_publish,
    ):
        from src.services.task_service import delete_task

        result = await delete_task(mock_session, user_id, task_id)

        assert result is None
        mock_publish.assert_not_called()
