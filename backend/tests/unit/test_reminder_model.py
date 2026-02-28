"""
Unit tests for Reminder model.
"""

import uuid
from datetime import datetime

import pytest

from src.models.reminder import (
    REMINDER_STATUS_VALUES,
    Reminder,
    ReminderCreate,
    ReminderResponse,
)


def test_reminder_default_status():
    """New reminders should have 'pending' status."""
    r = Reminder(
        task_id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        reminder_time=datetime(2026, 3, 1, 9, 0, 0),
    )
    assert r.status == "pending"


def test_reminder_has_required_fields():
    """Reminder should have id, task_id, user_id, reminder_time, status, created_at."""
    tid = uuid.uuid4()
    uid = uuid.uuid4()
    dt = datetime(2026, 3, 1, 9, 0, 0)

    r = Reminder(task_id=tid, user_id=uid, reminder_time=dt)
    assert r.id is not None
    assert r.task_id == tid
    assert r.user_id == uid
    assert r.reminder_time == dt
    assert r.created_at is not None


def test_reminder_status_values():
    """REMINDER_STATUS_VALUES should contain pending, fired, cancelled."""
    assert set(REMINDER_STATUS_VALUES) == {"pending", "fired", "cancelled"}


def test_reminder_create_schema():
    """ReminderCreate should accept task_id and reminder_time."""
    tid = uuid.uuid4()
    dt = datetime(2026, 3, 1, 9, 0, 0)
    rc = ReminderCreate(task_id=tid, reminder_time=dt)
    assert rc.task_id == tid
    assert rc.reminder_time == dt


def test_reminder_response_schema():
    """ReminderResponse should include all display fields."""
    rr = ReminderResponse(
        id=uuid.uuid4(),
        task_id=uuid.uuid4(),
        reminder_time=datetime(2026, 3, 1, 9, 0, 0),
        status="pending",
        created_at=datetime.utcnow(),
    )
    assert rr.status == "pending"


def test_reminder_tablename():
    """Reminder table should be named 'reminders'."""
    assert Reminder.__tablename__ == "reminders"
