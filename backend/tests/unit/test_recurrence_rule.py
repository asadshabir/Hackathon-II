"""
Unit tests for recurrence rule evaluation.
"""

import uuid
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest


def test_calculate_next_due_date_daily():
    """Verify RecurringRuleEvaluationSkill calculates correct next dates for daily."""
    from src.services.recurrence_service import calculate_next_due_date

    current = datetime(2026, 2, 10, 10, 0, 0)
    next_date = calculate_next_due_date(current, "daily", 1)

    expected = datetime(2026, 2, 11, 10, 0, 0)
    assert next_date == expected


def test_calculate_next_due_date_weekly():
    """Verify RecurringRuleEvaluationSkill calculates correct next dates for weekly."""
    from src.services.recurrence_service import calculate_next_due_date

    current = datetime(2026, 2, 10, 10, 0, 0)
    next_date = calculate_next_due_date(current, "weekly", 1)

    expected = datetime(2026, 2, 17, 10, 0, 0)
    assert next_date == expected


def test_calculate_next_due_date_monthly():
    """Verify RecurringRuleEvaluationSkill calculates correct next dates for monthly."""
    from src.services.recurrence_service import calculate_next_due_date

    current = datetime(2026, 2, 10, 10, 0, 0)
    next_date = calculate_next_due_date(current, "monthly", 1)

    expected = datetime(2026, 3, 10, 10, 0, 0)
    assert next_date == expected


def test_calculate_next_due_date_monthly_edge_case():
    """Verify RecurringRuleEvaluationSkill handles month-end edge cases."""
    from src.services.recurrence_service import calculate_next_due_date

    # Jan 31 -> Feb 28 (or 29 in leap years)
    current = datetime(2026, 1, 31, 10, 0, 0)
    next_date = calculate_next_due_date(current, "monthly", 1)

    # Should be Feb 28, 2026
    assert next_date.month == 2
    assert next_date.day == 28
    assert next_date.year == 2026


def test_calculate_next_due_date_custom_interval():
    """Verify RecurringRuleEvaluationSkill calculates correct next dates for custom intervals."""
    from src.services.recurrence_service import calculate_next_due_date

    current = datetime(2026, 2, 10, 10, 0, 0)
    next_date = calculate_next_due_date(current, "daily", 3)  # Every 3 days

    expected = datetime(2026, 2, 13, 10, 0, 0)
    assert next_date == expected


def test_calculate_next_due_date_invalid_type():
    """Verify RecurringRuleEvaluationSkill raises error for invalid recurrence type."""
    from src.services.recurrence_service import calculate_next_due_date

    current = datetime(2026, 2, 10, 10, 0, 0)

    with pytest.raises(ValueError, match="Invalid recurrence type: yearly"):
        calculate_next_due_date(current, "yearly", 1)