"""
Unit tests for tag-task association operations.
Tests assigning tags to tasks, removing tags, and filtering by tag.
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.models.tag import TaskTag


def test_task_tag_junction_creation():
    """TaskTag should hold task_id and tag_id."""
    task_id = uuid.uuid4()
    tag_id = uuid.uuid4()
    tt = TaskTag(task_id=task_id, tag_id=tag_id)
    assert tt.task_id == task_id
    assert tt.tag_id == tag_id


@pytest.mark.asyncio
async def test_assign_tags_to_task():
    """assign_tags_to_task should create TaskTag records."""
    task_id = uuid.uuid4()
    tag_ids = [uuid.uuid4(), uuid.uuid4()]

    mock_session = AsyncMock()
    mock_session.add = MagicMock()
    mock_session.flush = AsyncMock()

    with patch("src.services.tag_service.TaskTag") as MockTaskTag:
        from src.services.tag_service import assign_tags_to_task

        await assign_tags_to_task(mock_session, task_id, tag_ids)
        assert MockTaskTag.call_count == 2


@pytest.mark.asyncio
async def test_remove_tags_from_task():
    """remove_tags_from_task should delete matching TaskTag records."""
    task_id = uuid.uuid4()
    tag_ids = [uuid.uuid4()]

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock()
    mock_session.flush = AsyncMock()

    from src.services.tag_service import remove_tags_from_task

    await remove_tags_from_task(mock_session, task_id, tag_ids)
    mock_session.execute.assert_called_once()
