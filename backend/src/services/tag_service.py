"""
Tag service for CRUD operations on tags and tag-task associations.
All operations are scoped to the authenticated user.
"""

import uuid
import logging

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import delete as sa_delete
from sqlmodel import select

from src.models.tag import Tag, TaskTag

logger = logging.getLogger(__name__)


async def create_tag(
    session: AsyncSession,
    user_id: uuid.UUID,
    name: str,
    color: str = "#6B7280",
) -> Tag:
    """
    Create a new tag for a user.

    Args:
        session: Database session
        user_id: Owner's user ID
        name: Tag name (max 50 chars)
        color: Hex color string (default gray)

    Returns:
        Created Tag object
    """
    name = name.strip()[:50]

    tag = Tag(
        user_id=user_id,
        name=name,
        color=color,
    )
    session.add(tag)
    await session.flush()
    await session.refresh(tag)
    return tag


async def get_tags(
    session: AsyncSession,
    user_id: uuid.UUID,
) -> list[Tag]:
    """Get all tags for a user."""
    statement = (
        select(Tag)
        .where(Tag.user_id == user_id)
        .order_by(Tag.name.asc())
    )
    result = await session.execute(statement)
    return list(result.scalars().all())


async def get_tag_by_id(
    session: AsyncSession,
    user_id: uuid.UUID,
    tag_id: uuid.UUID,
) -> Tag | None:
    """Get a specific tag by ID (user-scoped)."""
    statement = select(Tag).where(Tag.id == tag_id, Tag.user_id == user_id)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def get_tag_by_name(
    session: AsyncSession,
    user_id: uuid.UUID,
    name: str,
) -> Tag | None:
    """Get a tag by name (user-scoped). Used for duplicate checking."""
    statement = select(Tag).where(Tag.user_id == user_id, Tag.name == name)
    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def delete_tag(
    session: AsyncSession,
    user_id: uuid.UUID,
    tag_id: uuid.UUID,
) -> str | None:
    """
    Delete a tag and its task associations.

    Returns:
        Deleted tag name or None if not found
    """
    tag = await get_tag_by_id(session, user_id, tag_id)
    if tag is None:
        return None

    name = tag.name

    # Delete tag-task associations first
    await session.execute(
        sa_delete(TaskTag).where(TaskTag.tag_id == tag_id)
    )

    await session.delete(tag)
    await session.flush()
    return name


async def assign_tags_to_task(
    session: AsyncSession,
    task_id: uuid.UUID,
    tag_ids: list[uuid.UUID],
) -> None:
    """Assign multiple tags to a task."""
    for tag_id in tag_ids:
        task_tag = TaskTag(task_id=task_id, tag_id=tag_id)
        session.add(task_tag)
    await session.flush()


async def remove_tags_from_task(
    session: AsyncSession,
    task_id: uuid.UUID,
    tag_ids: list[uuid.UUID],
) -> None:
    """Remove specific tags from a task."""
    await session.execute(
        sa_delete(TaskTag).where(
            TaskTag.task_id == task_id,
            TaskTag.tag_id.in_(tag_ids),
        )
    )
    await session.flush()


async def get_task_tag_ids(
    session: AsyncSession,
    task_id: uuid.UUID,
) -> list[uuid.UUID]:
    """Get all tag IDs assigned to a task."""
    statement = select(TaskTag.tag_id).where(TaskTag.task_id == task_id)
    result = await session.execute(statement)
    return list(result.scalars().all())
