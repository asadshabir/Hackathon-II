"""
Unit tests for recurring task logic.
"""

import uuid
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


@pytest.mark.asyncio
async def test_daily_recurrence_adds_one_day():
    """Daily recurrence should add 1 day to due date."""
    from src.services.recurrence_service import calculate_next_due_date

    current_due = datetime(2026, 2, 10, 10, 0, 0)
    next_due = calculate_next_due_date(current_due, "daily", 1)

    expected = datetime(2026, 2, 11, 10, 0, 0)
    assert next_due == expected


@pytest.mark.asyncio
async def test_weekly_recurrence_adds_seven_days():
    """Weekly recurrence should add 7 days to due date."""
    from src.services.recurrence_service import calculate_next_due_date

    current_due = datetime(2026, 2, 10, 10, 0, 0)
    next_due = calculate_next_due_date(current_due, "weekly", 1)

    expected = datetime(2026, 2, 17, 10, 0, 0)
    assert next_due == expected


@pytest.mark.asyncio
async def test_monthly_recurrence_handles_end_of_month():
    """Monthly recurrence should handle month-end edge cases (Jan 31 -> Feb 28)."""
    from src.services.recurrence_service import calculate_next_due_date

    # Jan 31 -> Feb 28 (or 29 in leap years)
    current_due = datetime(2026, 1, 31, 10, 0, 0)
    next_due = calculate_next_due_date(current_due, "monthly", 1)

    # Should be Feb 28, 2026 (not Mar 3)
    assert next_due.month == 2
    assert next_due.day == 28
    assert next_due.year == 2026


@pytest.mark.asyncio
async def test_monthly_recurrence_leap_year():
    """Monthly recurrence should handle leap year (Feb 29 -> Mar 29)."""
    from src.services.recurrence_service import calculate_next_due_date

    # Feb 29, 2024 (leap year) -> Mar 29, 2024
    current_due = datetime(2024, 2, 29, 10, 0, 0)
    next_due = calculate_next_due_date(current_due, "monthly", 1)

    assert next_due.month == 3
    assert next_due.day == 29
    assert next_due.year == 2024


@pytest.mark.asyncio
async def test_custom_interval_daily():
    """Custom interval should multiply the base recurrence."""
    from src.services.recurrence_service import calculate_next_due_date

    current_due = datetime(2026, 2, 10, 10, 0, 0)
    next_due = calculate_next_due_date(current_due, "daily", 3)  # Every 3 days

    expected = datetime(2026, 2, 13, 10, 0, 0)
    assert next_due == expected


@pytest.mark.asyncio
async def test_custom_interval_weekly():
    """Custom interval should multiply the base recurrence."""
    from src.services.recurrence_service import calculate_next_due_date

    current_due = datetime(2026, 2, 10, 10, 0, 0)
    next_due = calculate_next_due_date(current_due, "weekly", 2)  # Every 2 weeks

    expected = datetime(2026, 2, 24, 10, 0, 0)
    assert next_due == expected


@pytest.mark.asyncio
async def test_custom_interval_monthly():
    """Custom interval should multiply the base recurrence."""
    from src.services.recurrence_service import calculate_next_due_date

    current_due = datetime(2026, 1, 15, 10, 0, 0)
    next_due = calculate_next_due_date(current_due, "monthly", 2)  # Every 2 months

    # Should be Mar 15, 2026 (not including Feb since it's every 2 months)
    assert next_due.month == 3
    assert next_due.day == 15
    assert next_due.year == 2026


@pytest.mark.asyncio
async def test_same_event_twice_creates_only_one_task():
    """Idempotency test: same event processed twice should create only one task."""
    # This would be tested at the event handler level with deduplication
    # Implementation would involve checking for existing tasks with same recurrence pattern
    # before creating a new one
    pass