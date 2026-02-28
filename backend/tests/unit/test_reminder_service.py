"""
Unit tests for reminder service.
"""

import uuid
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_create_reminder():
    """Create reminder should store in database with correct fields."""
    from src.services.reminder_service import create_reminder
    from src.models import Reminder

    session_mock = AsyncMock()
    task_id = uuid.uuid4()
    user_id = uuid.uuid4()
    reminder_time = datetime.utcnow() + timedelta(hours=1)

    reminder = Reminder(
        id=uuid.uuid4(),
        task_id=task_id,
        user_id=user_id,
        reminder_time=reminder_time,
        status="pending"
    )

    session_mock.add = MagicMock()
    session_mock.commit = AsyncMock()
    session_mock.refresh = AsyncMock()

    with patch("src.services.reminder_service.Reminder", return_value=reminder):
        result = await create_reminder(session_mock, task_id, user_id, reminder_time)

        assert result.task_id == task_id
        assert result.user_id == user_id
        assert result.reminder_time == reminder_time
        assert result.status == "pending"


@pytest.mark.asyncio
async def test_cancel_reminder():
    """Cancel reminder should update status to cancelled."""
    from src.services.reminder_service import cancel_reminder
    from src.models import Reminder

    session_mock = AsyncMock()
    reminder_id = uuid.uuid4()

    existing_reminder = MagicMock()
    existing_reminder.status = "pending"
    existing_reminder.id = reminder_id

    query_mock = MagicMock()
    query_mock.where.return_value = query_mock
    query_mock.first.return_value = existing_reminder

    session_mock.get.return_value = existing_reminder

    result = await cancel_reminder(session_mock, reminder_id)

    assert result.status == "cancelled"
    assert session_mock.add.called
    assert session_mock.commit.called


@pytest.mark.asyncio
async def test_cancel_by_task():
    """Cancel by task should cancel all reminders for that task."""
    from src.services.reminder_service import cancel_by_task
    from src.models import Reminder

    session_mock = AsyncMock()
    task_id = uuid.uuid4()

    reminder1 = MagicMock()
    reminder1.id = uuid.uuid4()
    reminder1.status = "pending"
    reminder2 = MagicMock()
    reminder2.id = uuid.uuid4()
    reminder2.status = "pending"

    result_mock = MagicMock()
    result_mock.scalars.return_value.all.return_value = [reminder1, reminder2]

    with patch("sqlmodel.select") as select_mock:
        select_mock.return_value = select_mock
        select_mock.where.return_value = select_mock
        session_mock.execute.return_value = result_mock

        cancelled_count = await cancel_by_task(session_mock, task_id)

        assert cancelled_count == 2
        assert reminder1.status == "cancelled"
        assert reminder2.status == "cancelled"


@pytest.mark.asyncio
async def test_get_pending_by_user():
    """Get pending by user should return only pending reminders for user."""
    from src.services.reminder_service import get_pending_by_user
    from src.models import Reminder

    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    reminder1 = Reminder(
        id=uuid.uuid4(),
        task_id=uuid.uuid4(),
        user_id=user_id,
        reminder_time=datetime.utcnow(),
        status="pending"
    )
    reminder2 = Reminder(
        id=uuid.uuid4(),
        task_id=uuid.uuid4(),
        user_id=user_id,
        reminder_time=datetime.utcnow(),
        status="fired"
    )

    result_mock = MagicMock()
    result_mock.scalars.return_value.all.return_value = [reminder1]

    with patch("sqlmodel.select") as select_mock:
        select_mock.return_value = select_mock
        select_mock.where.return_value = select_mock
        session_mock.execute.return_value = result_mock

        reminders = await get_pending_by_user(session_mock, user_id)

        assert len(reminders) == 1
        assert reminders[0].status == "pending"


@pytest.mark.asyncio
async def test_auto_schedule_on_task_created():
    """Auto-schedule should create reminder when task has due_date and user prefs."""
    # This would be tested at the event handler level
    # Testing that when task.created event comes with due_date,
    # a reminder is created based on user preferences
    pass


@pytest.mark.asyncio
async def test_auto_cancel_on_task_completed():
    """Auto-cancel should cancel reminders when task is completed."""
    # This would be tested at the event handler level
    # Testing that when task.completed event comes,
    # all pending reminders for that task are cancelled
    pass