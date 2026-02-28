"""
Unit tests for Tag model and TaskTag junction table.
"""

import uuid
from datetime import datetime

import pytest

from src.models.tag import Tag, TagCreate, TagResponse, TaskTag


def test_tag_default_color():
    """Tags should have default color #6B7280."""
    tag = Tag(user_id=uuid.uuid4(), name="Work")
    assert tag.color == "#6B7280"


def test_tag_custom_color():
    """Tags should accept custom color."""
    tag = Tag(user_id=uuid.uuid4(), name="Personal", color="#FF5733")
    assert tag.color == "#FF5733"


def test_tag_has_required_fields():
    """Tag should have id, user_id, name, color, created_at."""
    uid = uuid.uuid4()
    tag = Tag(user_id=uid, name="Urgent")
    assert tag.id is not None
    assert tag.user_id == uid
    assert tag.name == "Urgent"
    assert tag.created_at is not None


def test_tag_create_schema():
    """TagCreate should accept name and optional color."""
    tc = TagCreate(name="Test")
    assert tc.name == "Test"
    assert tc.color == "#6B7280"

    tc2 = TagCreate(name="Custom", color="#123456")
    assert tc2.color == "#123456"


def test_tag_response_schema():
    """TagResponse should include all display fields."""
    tr = TagResponse(
        id=uuid.uuid4(),
        name="Work",
        color="#FF0000",
        created_at=datetime.utcnow(),
    )
    assert tr.name == "Work"
    assert tr.color == "#FF0000"


def test_task_tag_junction():
    """TaskTag should hold task_id and tag_id as composite PK."""
    task_id = uuid.uuid4()
    tag_id = uuid.uuid4()
    tt = TaskTag(task_id=task_id, tag_id=tag_id)
    assert tt.task_id == task_id
    assert tt.tag_id == tag_id


def test_tag_tablename():
    """Tag table should be named 'tags'."""
    assert Tag.__tablename__ == "tags"


def test_task_tag_tablename():
    """TaskTag table should be named 'task_tags'."""
    assert TaskTag.__tablename__ == "task_tags"
