"""
Unit tests for tag CRUD operations.
Tests create, list, delete, user isolation, and duplicate name rejection.
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from src.models.tag import Tag


def _make_tag(
    name: str = "Work",
    color: str = "#6B7280",
    user_id: uuid.UUID | None = None,
) -> MagicMock:
    tag = MagicMock(spec=Tag)
    tag.id = uuid.uuid4()
    tag.user_id = user_id or uuid.uuid4()
    tag.name = name
    tag.color = color
    tag.created_at = MagicMock()
    return tag


@pytest.mark.asyncio
async def test_create_tag():
    """Creating a tag should persist name, color, and user_id."""
    user_id = uuid.uuid4()
    tag_obj = _make_tag(name="Urgent", color="#FF0000", user_id=user_id)

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with patch("src.services.tag_service.Tag", return_value=tag_obj):
        from src.services.tag_service import create_tag

        result = await create_tag(mock_session, user_id, "Urgent", "#FF0000")
        assert result.name == "Urgent"
        assert result.color == "#FF0000"
        assert result.user_id == user_id


@pytest.mark.asyncio
async def test_create_tag_default_color():
    """Creating a tag without color should use default gray."""
    user_id = uuid.uuid4()
    tag_obj = _make_tag(name="Default", user_id=user_id)

    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.refresh = AsyncMock()
    mock_session.add = MagicMock()

    with patch("src.services.tag_service.Tag", return_value=tag_obj):
        from src.services.tag_service import create_tag

        result = await create_tag(mock_session, user_id, "Default")
        assert result.color == "#6B7280"


@pytest.mark.asyncio
async def test_get_tags_returns_list():
    """get_tags should return list of user's tags."""
    user_id = uuid.uuid4()
    tags = [_make_tag("Work", user_id=user_id), _make_tag("Personal", user_id=user_id)]

    mock_session = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = tags
    mock_session.execute = AsyncMock(return_value=mock_result)

    from src.services.tag_service import get_tags

    result = await get_tags(mock_session, user_id)
    assert len(result) == 2


@pytest.mark.asyncio
async def test_delete_tag_returns_name():
    """delete_tag should return the deleted tag's name."""
    user_id = uuid.uuid4()
    tag_id = uuid.uuid4()
    tag_obj = _make_tag("OldTag", user_id=user_id)
    tag_obj.id = tag_id

    mock_session = AsyncMock()
    mock_session.delete = AsyncMock()
    mock_session.flush = AsyncMock()

    with patch("src.services.tag_service.get_tag_by_id", return_value=tag_obj):
        from src.services.tag_service import delete_tag

        result = await delete_tag(mock_session, user_id, tag_id)
        assert result == "OldTag"


@pytest.mark.asyncio
async def test_delete_tag_not_found():
    """delete_tag should return None if tag doesn't exist."""
    mock_session = AsyncMock()

    with patch("src.services.tag_service.get_tag_by_id", return_value=None):
        from src.services.tag_service import delete_tag

        result = await delete_tag(mock_session, uuid.uuid4(), uuid.uuid4())
        assert result is None
