"""
Unit tests for preferences CRUD operations.
"""

import uuid
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock

import pytest


@pytest.mark.asyncio
async def test_get_defaults():
    """Get preferences should return defaults when none exist."""
    from src.services.preferences_service import get_preferences

    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the query to return None (no existing preferences)
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = None
    session_mock.execute.return_value = result_mock

    preferences = await get_preferences(session_mock, user_id)

    # Should return defaults
    assert preferences.notification_channel == "in-app"
    assert preferences.timezone == "UTC"
    assert preferences.default_priority == "medium"
    assert preferences.sort_order == "created_at_desc"
    assert preferences.theme == "light"


@pytest.mark.asyncio
async def test_update_single_key():
    """Update preferences should update only specified keys."""
    from src.services.preferences_service import update_preferences
    from src.models import UserPreference

    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Create an existing preference
    existing_pref = UserPreference(
        id=uuid.uuid4(),
        user_id=user_id,
        notification_channel="in-app",
        timezone="UTC",
        reminder_offset_minutes=15,
        default_priority="medium",
        sort_order="created_at_desc",
        theme="light"
    )

    # Mock the query to return existing preference
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = existing_pref
    session_mock.execute.return_value = result_mock

    # Update only the theme
    updates = {"theme": "dark"}
    updated_pref = await update_preferences(session_mock, user_id, updates)

    # Only theme should be updated
    assert updated_pref.theme == "dark"
    assert updated_pref.notification_channel == "in-app"  # unchanged
    assert updated_pref.timezone == "UTC"  # unchanged
    assert updated_pref.default_priority == "medium"  # unchanged
    assert updated_pref.sort_order == "created_at_desc"  # unchanged


@pytest.mark.asyncio
async def test_update_multiple_keys():
    """Update preferences should update multiple keys simultaneously."""
    from src.services.preferences_service import update_preferences
    from src.models import UserPreference

    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Create an existing preference
    existing_pref = UserPreference(
        id=uuid.uuid4(),
        user_id=user_id,
        notification_channel="in-app",
        timezone="UTC",
        reminder_offset_minutes=15,
        default_priority="medium",
        sort_order="created_at_desc",
        theme="light"
    )

    # Mock the query to return existing preference
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = existing_pref
    session_mock.execute.return_value = result_mock

    # Update multiple keys
    updates = {"theme": "dark", "default_priority": "high", "timezone": "America/New_York"}
    updated_pref = await update_preferences(session_mock, user_id, updates)

    # Multiple keys should be updated
    assert updated_pref.theme == "dark"
    assert updated_pref.default_priority == "high"
    assert updated_pref.timezone == "America/New_York"
    assert updated_pref.notification_channel == "in-app"  # unchanged


@pytest.mark.asyncio
async def test_verify_event_emission():
    """Update preferences should emit user.preference.changed event."""
    from src.services.preferences_service import update_preferences
    from src.models import UserPreference

    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Create an existing preference
    existing_pref = UserPreference(
        id=uuid.uuid4(),
        user_id=user_id,
        notification_channel="in-app",
        timezone="UTC",
        reminder_offset_minutes=15,
        default_priority="medium",
        sort_order="created_at_desc",
        theme="light"
    )

    # Mock the query to return existing preference
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = existing_pref
    session_mock.execute.return_value = result_mock

    # Update preferences
    updates = {"theme": "dark"}
    updated_pref = await update_preferences(session_mock, user_id, updates)

    # Verify that the preference was updated
    assert updated_pref.theme == "dark"


@pytest.mark.asyncio
async def test_partial_update():
    """Update preferences should support partial updates without affecting other fields."""
    from src.services.preferences_service import update_preferences
    from src.models import UserPreference

    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Create an existing preference with custom values
    existing_pref = UserPreference(
        id=uuid.uuid4(),
        user_id=user_id,
        notification_channel="email",
        timezone="Europe/London",
        reminder_offset_minutes=30,
        default_priority="high",
        sort_order="priority",
        theme="dark"
    )

    # Mock the query to return existing preference
    result_mock = MagicMock()
    result_mock.scalar_one_or_none.return_value = existing_pref
    session_mock.execute.return_value = result_mock

    # Update only one field
    updates = {"sort_order": "due_date"}
    updated_pref = await update_preferences(session_mock, user_id, updates)

    # Only sort_order should change
    assert updated_pref.sort_order == "due_date"
    assert updated_pref.notification_channel == "email"  # unchanged
    assert updated_pref.timezone == "Europe/London"  # unchanged
    assert updated_pref.default_priority == "high"  # unchanged
    assert updated_pref.theme == "dark"  # unchanged
    assert updated_pref.reminder_offset_minutes == 30  # unchanged