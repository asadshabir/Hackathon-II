"""
Unit tests for UserPreference model.
"""

import uuid

import pytest

from src.models.user_preference import (
    UserPreference,
    UserPreferenceCreate,
    UserPreferenceResponse,
)


def test_user_preference_defaults():
    """UserPreference should have correct defaults."""
    up = UserPreference(user_id=uuid.uuid4())
    assert up.notification_channel == "in-app"
    assert up.timezone == "UTC"
    assert up.reminder_offset_minutes == 15
    assert up.default_priority == "medium"
    assert up.sort_order == "created_at_desc"
    assert up.theme == "light"


def test_user_preference_custom_values():
    """UserPreference should accept custom values."""
    uid = uuid.uuid4()
    up = UserPreference(
        user_id=uid,
        notification_channel="email",
        timezone="America/New_York",
        reminder_offset_minutes=30,
        default_priority="high",
        sort_order="priority_desc",
        theme="dark",
    )
    assert up.user_id == uid
    assert up.notification_channel == "email"
    assert up.timezone == "America/New_York"
    assert up.reminder_offset_minutes == 30
    assert up.default_priority == "high"
    assert up.sort_order == "priority_desc"
    assert up.theme == "dark"


def test_user_preference_create_schema_defaults():
    """UserPreferenceCreate should have proper defaults."""
    upc = UserPreferenceCreate()
    assert upc.notification_channel == "in-app"
    assert upc.timezone == "UTC"
    assert upc.reminder_offset_minutes == 15
    assert upc.default_priority == "medium"
    assert upc.sort_order == "created_at_desc"
    assert upc.theme == "light"


def test_user_preference_response_schema():
    """UserPreferenceResponse should include all fields."""
    uid = uuid.uuid4()
    upr = UserPreferenceResponse(
        id=uuid.uuid4(),
        user_id=uid,
        notification_channel="both",
        timezone="Europe/London",
        reminder_offset_minutes=10,
        default_priority="urgent",
        sort_order="due_date_asc",
        theme="dark",
    )
    assert upr.user_id == uid
    assert upr.notification_channel == "both"


def test_user_preference_tablename():
    """UserPreference table should be named 'user_preferences'."""
    assert UserPreference.__tablename__ == "user_preferences"


def test_user_preference_has_id():
    """UserPreference should auto-generate UUID id."""
    up = UserPreference(user_id=uuid.uuid4())
    assert up.id is not None
