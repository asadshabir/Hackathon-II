"""
Unit tests for extended Task model with priority, due_date, recurrence fields.
"""

import uuid
from datetime import datetime

import pytest

from src.models.task import (
    PRIORITY_VALUES,
    RECURRENCE_VALUES,
    Task,
    TaskCreate,
    TaskResponse,
    TaskUpdate,
)


def test_task_default_priority():
    """New tasks should have 'medium' priority by default."""
    task = Task(user_id=uuid.uuid4(), title="Test task")
    assert task.priority == "medium"


def test_task_default_due_date():
    """New tasks should have None due_date by default."""
    task = Task(user_id=uuid.uuid4(), title="Test task")
    assert task.due_date is None


def test_task_default_recurrence():
    """New tasks should have 'none' recurrence by default."""
    task = Task(user_id=uuid.uuid4(), title="Test task")
    assert task.recurrence_type == "none"
    assert task.recurrence_interval == 1


def test_task_with_priority():
    """Tasks should accept valid priority values."""
    for prio in PRIORITY_VALUES:
        task = Task(user_id=uuid.uuid4(), title=f"{prio} task", priority=prio)
        assert task.priority == prio


def test_task_with_due_date():
    """Tasks should accept due_date."""
    dt = datetime(2026, 3, 15, 9, 0, 0)
    task = Task(user_id=uuid.uuid4(), title="Due task", due_date=dt)
    assert task.due_date == dt


def test_task_with_recurrence():
    """Tasks should accept recurrence fields."""
    for rtype in RECURRENCE_VALUES:
        task = Task(
            user_id=uuid.uuid4(),
            title=f"{rtype} task",
            recurrence_type=rtype,
            recurrence_interval=2,
        )
        assert task.recurrence_type == rtype
        assert task.recurrence_interval == 2


def test_task_create_schema_defaults():
    """TaskCreate schema should have proper defaults."""
    tc = TaskCreate(title="New task")
    assert tc.priority == "medium"
    assert tc.due_date is None
    assert tc.recurrence_type == "none"
    assert tc.recurrence_interval == 1


def test_task_create_schema_with_fields():
    """TaskCreate should accept all new fields."""
    dt = datetime(2026, 4, 1, 10, 0, 0)
    tc = TaskCreate(
        title="Urgent task",
        priority="urgent",
        due_date=dt,
        recurrence_type="weekly",
        recurrence_interval=2,
    )
    assert tc.priority == "urgent"
    assert tc.due_date == dt
    assert tc.recurrence_type == "weekly"
    assert tc.recurrence_interval == 2


def test_task_update_schema_optional_fields():
    """TaskUpdate should have all new fields as optional."""
    tu = TaskUpdate()
    assert tu.priority is None
    assert tu.due_date is None
    assert tu.recurrence_type is None
    assert tu.recurrence_interval is None


def test_task_update_schema_with_priority():
    """TaskUpdate should accept priority."""
    tu = TaskUpdate(priority="high")
    assert tu.priority == "high"


def test_task_response_schema_defaults():
    """TaskResponse should have proper defaults for new fields."""
    tr = TaskResponse(
        id=uuid.uuid4(),
        title="Test",
        completed=False,
        created_at=datetime.utcnow(),
    )
    assert tr.priority == "medium"
    assert tr.due_date is None
    assert tr.recurrence_type == "none"
    assert tr.recurrence_interval == 1


def test_existing_task_fields_unchanged():
    """Existing task fields should still work as before."""
    uid = uuid.uuid4()
    task = Task(user_id=uid, title="Legacy task", completed=True)
    assert task.user_id == uid
    assert task.title == "Legacy task"
    assert task.completed is True
    assert task.completed_at is None


def test_priority_enum_values():
    """PRIORITY_VALUES should contain exactly 4 values."""
    assert len(PRIORITY_VALUES) == 4
    assert set(PRIORITY_VALUES) == {"low", "medium", "high", "urgent"}


def test_recurrence_enum_values():
    """RECURRENCE_VALUES should contain exactly 4 values."""
    assert len(RECURRENCE_VALUES) == 4
    assert set(RECURRENCE_VALUES) == {"none", "daily", "weekly", "monthly"}
