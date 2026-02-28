"""
Recurrence rule evaluator for recurring tasks.
Handles daily, weekly, monthly recurrence with edge case handling.
"""

from datetime import datetime, timedelta
import calendar


def calculate_next_due_date(current_due: datetime, recurrence_type: str, interval: int) -> datetime:
    """
    Calculate the next due date for a recurring task.

    Args:
        current_due: Current due date
        recurrence_type: "daily", "weekly", or "monthly"
        interval: Number of units to add (e.g., every 2 days, every 3 weeks)

    Returns:
        New due date based on recurrence rule

    Handles edge cases:
        - Monthly recurrence: Jan 31 -> Feb 28 (or 29 in leap years) -> Mar 28 (or 29)
        - Leap years for February 29
    """
    if recurrence_type == "daily":
        return current_due + timedelta(days=interval)
    elif recurrence_type == "weekly":
        return current_due + timedelta(weeks=interval)
    elif recurrence_type == "monthly":
        # Calculate target month and year
        total_months = current_due.month + interval - 1
        target_year = current_due.year + (total_months // 12)
        target_month = (total_months % 12) + 1

        # Handle day overflow (e.g., Jan 31 -> Feb 28)
        target_day = current_due.day
        max_day_in_target_month = calendar.monthrange(target_year, target_month)[1]

        # If current day doesn't exist in target month, use last day of target month
        if target_day > max_day_in_target_month:
            target_day = max_day_in_target_month

        return current_due.replace(year=target_year, month=target_month, day=target_day)
    else:
        raise ValueError(f"Invalid recurrence type: {recurrence_type}")