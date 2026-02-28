"""
Tasks API endpoints for direct task management.
These endpoints complement the chat-based interface.
"""

import uuid
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_session
from src.middleware.auth_middleware import CurrentUser
from src.middleware.error_handler import NotFoundError, ValidationError
from src.models import TaskCreate, TaskResponse, TaskUpdate
from src.models.task import PRIORITY_VALUES
from src.services import task_service

router = APIRouter(prefix="/tasks", tags=["Tasks"])


class TaskListResponse(BaseModel):
    """Response for task list."""

    tasks: list[TaskResponse]
    count: int


class TaskCreateRequest(BaseModel):
    """Request body for creating a task."""

    title: str
    priority: str = "medium"
    due_date: str | None = None
    recurrence_type: str = "none"
    recurrence_interval: int = 1


class TaskUpdateRequest(BaseModel):
    """Request body for updating a task."""

    title: str | None = None
    completed: bool | None = None
    priority: str | None = None
    due_date: str | None = None
    recurrence_type: str | None = None
    recurrence_interval: int | None = None


@router.get("", response_model=TaskListResponse)
async def list_tasks(
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
    filter: str = Query("all", pattern="^(all|pending|completed)$"),
    sort_by: str = Query("created_at", pattern="^(created_at|priority|due_date)$"),
    due_before: str | None = Query(None, description="ISO date: tasks due before this"),
    due_after: str | None = Query(None, description="ISO date: tasks due after this"),
    q: str | None = Query(None, description="Search query (ILIKE on title)"),
    priority: str | None = Query(None, description="Filter by priority level"),
) -> TaskListResponse:
    """
    List all tasks for the current user.

    - **filter**: Filter tasks by status (all, pending, completed)
    - **sort_by**: Sort field (created_at, priority, due_date)
    - **due_before**: ISO date filter
    - **due_after**: ISO date filter
    - **q**: Search title (ILIKE)
    - **priority**: Filter by priority
    """
    # Parse date filters
    parsed_due_before = None
    parsed_due_after = None
    if due_before:
        try:
            parsed_due_before = datetime.fromisoformat(due_before)
        except ValueError:
            raise ValidationError("Invalid due_before format. Use ISO 8601.")
    if due_after:
        try:
            parsed_due_after = datetime.fromisoformat(due_after)
        except ValueError:
            raise ValidationError("Invalid due_after format. Use ISO 8601.")

    tasks = await task_service.get_tasks(
        session,
        current_user.id,
        filter,
        sort_by=sort_by,
        due_before=parsed_due_before,
        due_after=parsed_due_after,
        search_query=q,
        priority_filter=priority,
    )
    return TaskListResponse(
        tasks=[
            TaskResponse(
                id=t.id,
                title=t.title,
                completed=t.completed,
                created_at=t.created_at,
                completed_at=t.completed_at,
                priority=t.priority,
                due_date=t.due_date,
                recurrence_type=t.recurrence_type,
                recurrence_interval=t.recurrence_interval,
            )
            for t in tasks
        ],
        count=len(tasks),
    )


@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    request: TaskCreateRequest,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TaskResponse:
    """Create a new task."""
    if not request.title or not request.title.strip():
        raise ValidationError("Task title cannot be empty")

    if request.priority not in PRIORITY_VALUES:
        raise ValidationError(
            f"Invalid priority. Must be one of: {', '.join(PRIORITY_VALUES)}"
        )

    # Parse due_date string if provided
    due_date = None
    if request.due_date:
        try:
            due_date = datetime.fromisoformat(request.due_date)
        except ValueError:
            raise ValidationError("Invalid due_date format. Use ISO 8601.")

    task = await task_service.create_task(
        session,
        current_user.id,
        request.title,
        priority=request.priority,
        due_date=due_date,
        recurrence_type=request.recurrence_type,
        recurrence_interval=request.recurrence_interval,
    )
    return TaskResponse(
        id=task.id,
        title=task.title,
        completed=task.completed,
        created_at=task.created_at,
        completed_at=task.completed_at,
        priority=task.priority,
        due_date=task.due_date,
        recurrence_type=task.recurrence_type,
        recurrence_interval=task.recurrence_interval,
    )


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: uuid.UUID,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TaskResponse:
    """Get a specific task by ID."""
    task = await task_service.get_task_by_id(session, current_user.id, task_id)
    if task is None:
        raise NotFoundError("Task not found")

    return TaskResponse(
        id=task.id,
        title=task.title,
        completed=task.completed,
        created_at=task.created_at,
        completed_at=task.completed_at,
        priority=task.priority,
        due_date=task.due_date,
        recurrence_type=task.recurrence_type,
        recurrence_interval=task.recurrence_interval,
    )


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: uuid.UUID,
    request: TaskUpdateRequest,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> TaskResponse:
    """Update a task's fields."""
    if request.priority is not None and request.priority not in PRIORITY_VALUES:
        raise ValidationError(
            f"Invalid priority. Must be one of: {', '.join(PRIORITY_VALUES)}"
        )

    # Parse due_date string if provided
    due_date = task_service._UNSET  # sentinel: don't change
    if request.due_date is not None:
        if request.due_date == "":
            due_date = None  # clear due_date
        else:
            try:
                due_date = datetime.fromisoformat(request.due_date)
            except ValueError:
                raise ValidationError("Invalid due_date format. Use ISO 8601.")

    task = await task_service.update_task(
        session,
        current_user.id,
        task_id,
        new_title=request.title,
        completed=request.completed,
        priority=request.priority,
        due_date=due_date,
        recurrence_type=request.recurrence_type,
        recurrence_interval=request.recurrence_interval,
    )
    if task is None:
        raise NotFoundError("Task not found")

    return TaskResponse(
        id=task.id,
        title=task.title,
        completed=task.completed,
        created_at=task.created_at,
        completed_at=task.completed_at,
        priority=task.priority,
        due_date=task.due_date,
        recurrence_type=task.recurrence_type,
        recurrence_interval=task.recurrence_interval,
    )


@router.delete("/{task_id}")
async def delete_task(
    task_id: uuid.UUID,
    current_user: CurrentUser,
    session: Annotated[AsyncSession, Depends(get_session)],
) -> dict:
    """Delete a task."""
    title = await task_service.delete_task(session, current_user.id, task_id)
    if title is None:
        raise NotFoundError("Task not found")

    return {"message": f"Task '{title}' deleted successfully"}
