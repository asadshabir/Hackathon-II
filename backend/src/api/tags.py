"""
Tags API endpoints for tag management.
"""

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.middleware.auth_middleware import CurrentUser
from src.middleware.error_handler import NotFoundError, ValidationError
from src.models.tag import TagResponse
from src.services import tag_service

router = APIRouter(prefix="/tags", tags=["Tags"])


class TagCreateRequest(BaseModel):
    """Request body for creating a tag."""

    name: str
    color: str = "#6B7280"


class TagListResponse(BaseModel):
    """Response for tag list."""

    tags: list[TagResponse]
    count: int


@router.get("", response_model=TagListResponse)
async def list_tags(
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TagListResponse:
    """List all tags for the current user."""
    tags = await tag_service.get_tags(session, current_user.id)
    return TagListResponse(
        tags=[
            TagResponse(
                id=t.id,
                name=t.name,
                color=t.color,
                created_at=t.created_at,
            )
            for t in tags
        ],
        count=len(tags),
    )


@router.post("", response_model=TagResponse, status_code=201)
async def create_tag(
    request: TagCreateRequest,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TagResponse:
    """Create a new tag."""
    if not request.name or not request.name.strip():
        raise ValidationError("Tag name cannot be empty")

    if len(request.name) > 50:
        raise ValidationError("Tag name must be 50 characters or less")

    # Check for duplicate name
    existing = await tag_service.get_tag_by_name(
        session, current_user.id, request.name.strip()
    )
    if existing:
        raise ValidationError(f"Tag '{request.name}' already exists")

    tag = await tag_service.create_tag(
        session, current_user.id, request.name, request.color
    )
    return TagResponse(
        id=tag.id,
        name=tag.name,
        color=tag.color,
        created_at=tag.created_at,
    )


@router.delete("/{tag_id}")
async def delete_tag(
    tag_id: uuid.UUID,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    """Delete a tag and its task associations."""
    name = await tag_service.delete_tag(session, current_user.id, tag_id)
    if name is None:
        raise NotFoundError("Tag not found")

    return {"message": f"Tag '{name}' deleted successfully"}
