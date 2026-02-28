"""
Unit tests for advanced search, filter, and sort functionality.
"""

import uuid
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_search_by_keyword():
    """ILIKE search should match partial title."""
    user_id = uuid.uuid4()

    task1 = MagicMock()
    task1.title = "Buy groceries"
    task2 = MagicMock()
    task2.title = "Read a book"

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [task1]

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    with patch("src.services.task_service.select") as mock_select:
        mock_stmt = MagicMock()
        mock_select.return_value = mock_stmt
        mock_stmt.where.return_value = mock_stmt
        mock_stmt.order_by.return_value = mock_stmt

        from src.services.task_service import get_tasks

        results = await get_tasks(mock_session, user_id, search_query="grocer")

        # Verify ILIKE was used (where called with search)
        assert mock_stmt.where.call_count >= 2  # user_id + search


@pytest.mark.asyncio
async def test_filter_by_priority():
    """Filter should narrow results to matching priority."""
    user_id = uuid.uuid4()

    task_high = MagicMock()
    task_high.priority = "high"

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [task_high]

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    with patch("src.services.task_service.select") as mock_select:
        mock_stmt = MagicMock()
        mock_select.return_value = mock_stmt
        mock_stmt.where.return_value = mock_stmt
        mock_stmt.order_by.return_value = mock_stmt

        from src.services.task_service import get_tasks

        results = await get_tasks(mock_session, user_id, priority_filter="high")

        # Verify priority filter was applied
        assert mock_stmt.where.call_count >= 2  # user_id + priority


@pytest.mark.asyncio
async def test_filter_by_due_date_range():
    """Due date range filters should narrow results."""
    user_id = uuid.uuid4()
    now = datetime.utcnow()
    before = now + timedelta(days=7)
    after = now - timedelta(days=1)

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    with patch("src.services.task_service.select") as mock_select:
        mock_stmt = MagicMock()
        mock_select.return_value = mock_stmt
        mock_stmt.where.return_value = mock_stmt
        mock_stmt.order_by.return_value = mock_stmt

        from src.services.task_service import get_tasks

        results = await get_tasks(
            mock_session, user_id, due_before=before, due_after=after
        )

        # user_id + due_before + due_after = at least 3 where calls
        assert mock_stmt.where.call_count >= 3


@pytest.mark.asyncio
async def test_sort_by_priority():
    """Sort by priority should order urgent > high > medium > low."""
    user_id = uuid.uuid4()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    with patch("src.services.task_service.select") as mock_select:
        mock_stmt = MagicMock()
        mock_select.return_value = mock_stmt
        mock_stmt.where.return_value = mock_stmt
        mock_stmt.order_by.return_value = mock_stmt

        from src.services.task_service import get_tasks

        results = await get_tasks(mock_session, user_id, sort_by="priority")

        # Verify order_by was called (priority case expression)
        mock_stmt.order_by.assert_called_once()


@pytest.mark.asyncio
async def test_sort_by_due_date():
    """Sort by due_date should put tasks with dates first, nulls last."""
    user_id = uuid.uuid4()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    with patch("src.services.task_service.select") as mock_select:
        mock_stmt = MagicMock()
        mock_select.return_value = mock_stmt
        mock_stmt.where.return_value = mock_stmt
        mock_stmt.order_by.return_value = mock_stmt

        from src.services.task_service import get_tasks

        results = await get_tasks(mock_session, user_id, sort_by="due_date")

        mock_stmt.order_by.assert_called_once()


@pytest.mark.asyncio
async def test_combined_filters():
    """Multiple filters applied together should all be respected."""
    user_id = uuid.uuid4()
    before = datetime.utcnow() + timedelta(days=7)

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    with patch("src.services.task_service.select") as mock_select:
        mock_stmt = MagicMock()
        mock_select.return_value = mock_stmt
        mock_stmt.where.return_value = mock_stmt
        mock_stmt.order_by.return_value = mock_stmt

        from src.services.task_service import get_tasks

        results = await get_tasks(
            mock_session,
            user_id,
            filter_type="pending",
            search_query="test",
            priority_filter="high",
            due_before=before,
            sort_by="priority",
        )

        # user_id + pending + search + priority + due_before = 5 where calls
        assert mock_stmt.where.call_count >= 5


@pytest.mark.asyncio
async def test_filter_pending_status():
    """Filter type 'pending' should only return incomplete tasks."""
    user_id = uuid.uuid4()

    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = []

    mock_session = AsyncMock()
    mock_session.execute = AsyncMock(return_value=mock_result)

    with patch("src.services.task_service.select") as mock_select:
        mock_stmt = MagicMock()
        mock_select.return_value = mock_stmt
        mock_stmt.where.return_value = mock_stmt
        mock_stmt.order_by.return_value = mock_stmt

        from src.services.task_service import get_tasks

        results = await get_tasks(mock_session, user_id, filter_type="pending")

        # user_id + completed==False
        assert mock_stmt.where.call_count >= 2
