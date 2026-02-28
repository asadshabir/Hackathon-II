"""
Event-sourcing projections for analytics.
Consumes task events and builds analytical projections.
"""

import logging
import uuid
from datetime import datetime, date, timedelta
from typing import Dict, Any, List

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.models import Task

logger = logging.getLogger(__name__)


class AnalyticsProjections:
    """
    Builds and maintains analytical projections from task events.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    async def process_task_created(self, event_data: Dict[str, Any]):
        """
        Process a task.created event and update projections.
        """
        user_id = event_data.get("user_id")
        if not user_id:
            logger.warning("task.created event missing user_id")
            return

        # Update priority distribution
        await self._update_priority_distribution(user_id, event_data.get("priority"))

        logger.info(f"Processed task.created event for user {user_id}")

    async def process_task_completed(self, event_data: Dict[str, Any]):
        """
        Process a task.completed event and update projections.
        Updates completion counts, streaks, and distributions.
        """
        user_id = event_data.get("user_id")
        if not user_id:
            logger.warning("task.completed event missing user_id")
            return

        completed_at_str = event_data.get("completed_at")
        if not completed_at_str:
            completed_at = datetime.utcnow()
        else:
            completed_at = datetime.fromisoformat(completed_at_str.replace('Z', '+00:00'))

        # Update completion by day
        await self._update_completion_by_day(user_id, completed_at)

        # Update streak
        await self._update_streak(user_id, completed_at)

        logger.info(f"Processed task.completed event for user {user_id}")

    async def process_task_updated(self, event_data: Dict[str, Any]):
        """
        Process a task.updated event and update projections.
        """
        user_id = event_data.get("user_id")
        if not user_id:
            logger.warning("task.updated event missing user_id")
            return

        # Check if priority changed
        before_data = event_data.get("before", {})
        after_data = event_data.get("after", {})
        if before_data.get("priority") != after_data.get("priority"):
            # Adjust priority distribution
            old_priority = before_data.get("priority")
            new_priority = after_data.get("priority")
            if old_priority:
                await self._adjust_priority_distribution(user_id, old_priority, -1)
            if new_priority:
                await self._adjust_priority_distribution(user_id, new_priority, 1)

        logger.info(f"Processed task.updated event for user {user_id}")

    async def process_task_deleted(self, event_data: Dict[str, Any]):
        """
        Process a task.deleted event and update projections.
        """
        user_id = event_data.get("user_id")
        if not user_id:
            logger.warning("task.deleted event missing user_id")
            return

        # We might need to adjust analytics if the deleted task was completed
        # For now, we'll just log this event
        logger.info(f"Processed task.deleted event for user {user_id}")

    async def _update_completion_by_day(self, user_id: str, completed_at: datetime):
        """
        Update the completion count for a specific day.
        """
        # In a real implementation, this would update a projection table
        # For now, we'll just log the update
        day_key = completed_at.strftime("%Y-%m-%d")
        logger.info(f"Updating completion count for user {user_id}, day {day_key}")

    async def _update_streak(self, user_id: str, completed_at: datetime):
        """
        Update streak calculations based on task completion.
        """
        # In a real implementation, this would update streak data
        # For now, we'll just log the update
        logger.info(f"Updating streak for user {user_id} based on completion at {completed_at}")

    async def _update_priority_distribution(self, user_id: str, priority: str):
        """
        Update the priority distribution for a user.
        """
        if not priority:
            return

        # In a real implementation, this would update a distribution table
        logger.info(f"Updating priority distribution for user {user_id}, priority {priority}")

    async def _adjust_priority_distribution(self, user_id: str, priority: str, adjustment: int):
        """
        Adjust the priority distribution for a user by a certain amount.
        """
        if not priority:
            return

        logger.info(f"Adjusting priority distribution for user {user_id}, priority {priority}, adjustment {adjustment}")

    async def get_user_analytics(self, user_id: str) -> Dict[str, Any]:
        """
        Get the current analytics projections for a user.
        """
        # Query the database for current analytics data
        # This is a simplified version - in reality, you'd query projection tables

        # Get completion stats
        completion_today = await self._get_completions_for_period(user_id, "today")
        completion_week = await self._get_completions_for_period(user_id, "week")
        completion_month = await self._get_completions_for_period(user_id, "month")

        # Get overdue count
        overdue_count = await self._get_overdue_count(user_id)

        # Get priority distribution
        priority_distribution = await self._get_priority_distribution(user_id)

        # Get tag distribution
        tag_distribution = await self._get_tag_distribution(user_id)

        # Get streak info
        streak_info = await self._get_streak_info(user_id)

        # Get trends
        trends = await self._get_trends(user_id)

        analytics = {
            "completion_today": completion_today,
            "completion_week": completion_week,
            "completion_month": completion_month,
            "streak": streak_info,
            "priority_distribution": priority_distribution,
            "tag_distribution": tag_distribution,
            "overdue_count": overdue_count,
            "trends": trends,
            "last_updated": datetime.utcnow().isoformat()
        }

        return analytics

    async def _get_completions_for_period(self, user_id: str, period: str) -> int:
        """
        Get completion count for a specific period by querying completed tasks.
        """
        from src.models import Task
        now = datetime.utcnow()

        if period == "today":
            start = datetime(now.year, now.month, now.day)
        elif period == "week":
            start = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
        elif period == "month":
            start = datetime(now.year, now.month, 1)
        else:
            return 0

        stmt = select(Task).where(
            Task.user_id == uuid.UUID(user_id),
            Task.completed == True,
            Task.completed_at >= start,
        )
        result = await self.session.execute(stmt)
        return len(result.scalars().all())

    async def _get_overdue_count(self, user_id: str) -> int:
        """
        Get count of overdue tasks for a user.
        """
        # Query for overdue tasks (not completed and due date passed)
        from src.models import Task
        stmt = select(Task).where(
            Task.user_id == uuid.UUID(user_id),
            Task.completed == False,
            Task.due_date < datetime.utcnow()
        )
        result = await self.session.execute(stmt)
        tasks = result.scalars().all()
        return len(tasks)

    async def _get_priority_distribution(self, user_id: str) -> Dict[str, int]:
        """
        Get priority distribution for a user by counting pending tasks per priority.
        """
        from src.models import Task
        stmt = select(Task).where(
            Task.user_id == uuid.UUID(user_id),
            Task.completed == False,
        )
        result = await self.session.execute(stmt)
        tasks = result.scalars().all()

        dist: Dict[str, int] = {"low": 0, "medium": 0, "high": 0, "urgent": 0}
        for t in tasks:
            key = t.priority if t.priority in dist else "medium"
            dist[key] += 1
        return dist

    async def _get_tag_distribution(self, user_id: str) -> Dict[str, int]:
        """
        Get tag distribution for a user by counting tasks per tag.
        """
        from src.models.tag import Tag, TaskTag
        stmt = (
            select(Tag.name, TaskTag.task_id)
            .join(TaskTag, Tag.id == TaskTag.tag_id)
            .where(Tag.user_id == uuid.UUID(user_id))
        )
        result = await self.session.execute(stmt)
        rows = result.all()

        dist: Dict[str, int] = {}
        for tag_name, _ in rows:
            dist[tag_name] = dist.get(tag_name, 0) + 1
        return dist

    async def _get_streak_info(self, user_id: str) -> Dict[str, int]:
        """
        Get streak information by counting consecutive days with completions.
        """
        from src.models import Task
        stmt = select(Task).where(
            Task.user_id == uuid.UUID(user_id),
            Task.completed == True,
            Task.completed_at.isnot(None),
        ).order_by(Task.completed_at.desc())
        result = await self.session.execute(stmt)
        tasks = result.scalars().all()

        if not tasks:
            return {"current": 0, "longest": 0}

        # Extract unique completion dates
        completion_dates = sorted(
            {t.completed_at.date() for t in tasks if t.completed_at},
            reverse=True,
        )

        if not completion_dates:
            return {"current": 0, "longest": 0}

        today = date.today()
        current_streak = 0
        longest_streak = 0
        streak = 0
        prev_date = None

        for d in sorted(completion_dates):
            if prev_date is None or (d - prev_date).days == 1:
                streak += 1
            else:
                longest_streak = max(longest_streak, streak)
                streak = 1
            prev_date = d

        longest_streak = max(longest_streak, streak)

        # Current streak: count from today backwards
        if completion_dates[0] == today or completion_dates[0] == today - timedelta(days=1):
            current_streak = 1
            for i in range(1, len(completion_dates)):
                if (completion_dates[i - 1] - completion_dates[i]).days == 1:
                    current_streak += 1
                else:
                    break

        return {"current": current_streak, "longest": longest_streak}

    async def _get_trends(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Get daily completion trend data for the last 14 days.
        """
        from src.models import Task
        today = date.today()
        start = today - timedelta(days=13)

        stmt = select(Task).where(
            Task.user_id == uuid.UUID(user_id),
            Task.completed == True,
            Task.completed_at >= datetime(start.year, start.month, start.day),
        )
        result = await self.session.execute(stmt)
        tasks = result.scalars().all()

        # Count completions per day
        day_counts: Dict[str, int] = {}
        for t in tasks:
            if t.completed_at:
                day_key = t.completed_at.strftime("%Y-%m-%d")
                day_counts[day_key] = day_counts.get(day_key, 0) + 1

        # Build trend list for last 14 days
        trends = []
        for i in range(14):
            d = start + timedelta(days=i)
            key = d.strftime("%Y-%m-%d")
            trends.append({"date": key, "completions": day_counts.get(key, 0)})

        return trends


def get_analytics_projections(session: AsyncSession) -> AnalyticsProjections:
    """
    Create analytics projections instance for a session.
    A new instance per request ensures the session is fresh.
    """
    return AnalyticsProjections(session)