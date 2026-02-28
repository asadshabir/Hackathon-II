"""
Unit test for event subscription handlers.
Tests the FastAPI event handler routes.
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import json
from backend.src.main import app
from backend.src.events.handlers import router


def test_dapr_subscribe():
    """Test the Dapr subscription endpoint."""
    client = TestClient(app)

    response = client.get("/dapr/subscribe")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0  # Should have at least one subscription

    # Check for expected topic
    topic_names = [sub.get("topic") for sub in data]
    assert "task.created" in topic_names
    assert "task.updated" in topic_names
    assert "task.completed" in topic_names
    assert "task.deleted" in topic_names


@pytest.mark.asyncio
async def test_handle_task_created():
    """Test the task created event handler."""
    from backend.src.events.handlers import handle_task_created
    from starlette.requests import Request
    from io import StringIO

    # Create a mock request
    event_data = {
        "data": {
            "task_id": "test-uuid",
            "user_id": "user-uuid",
            "title": "Test task",
            "priority": "medium"
        },
        "type": "task.created",
        "id": "evt-test-uuid"
    }

    # Create a mock request object
    request = Request(scope={
        "type": "http",
        "method": "POST",
        "path": "/events/task-created"
    })
    # Temporarily replace the request.json method
    request._json = event_data
    request.json = lambda: event_data

    with patch('backend.src.events.handlers.logger'):
        response = await handle_task_created(request)

    assert response["status"] == "success"
    assert response["event_id"] == "evt-test-uuid"


@pytest.mark.asyncio
async def test_handle_task_updated():
    """Test the task updated event handler."""
    from backend.src.events.handlers import handle_task_updated
    from starlette.requests import Request

    event_data = {
        "data": {
            "task_id": "test-uuid",
            "user_id": "user-uuid",
            "changes": ["title", "priority"]
        },
        "type": "task.updated",
        "id": "evt-test-uuid"
    }

    request = Request(scope={
        "type": "http",
        "method": "POST",
        "path": "/events/task-updated"
    })
    request.json = lambda: event_data

    with patch('backend.src.events.handlers.logger'):
        response = await handle_task_updated(request)

    assert response["status"] == "success"


@pytest.mark.asyncio
async def test_handle_task_completed():
    """Test the task completed event handler."""
    from backend.src.events.handlers import handle_task_completed
    from starlette.requests import Request

    event_data = {
        "data": {
            "task_id": "test-uuid",
            "user_id": "user-uuid",
            "completed_at": "2026-02-09T12:00:00Z"
        },
        "type": "task.completed",
        "id": "evt-test-uuid"
    }

    request = Request(scope={
        "type": "http",
        "method": "POST",
        "path": "/events/task-completed"
    })
    request.json = lambda: event_data

    with patch('backend.src.events.handlers.logger'):
        response = await handle_task_completed(request)

    assert response["status"] == "success"


@pytest.mark.asyncio
async def test_handle_reminder_due():
    """Test the reminder due event handler."""
    from backend.src.events.handlers import handle_reminder_due
    from starlette.requests import Request

    event_data = {
        "data": {
            "reminder_id": "rem-uuid",
            "task_id": "task-uuid",
            "user_id": "user-uuid",
            "reminder_time": "2026-02-09T08:45:00Z"
        },
        "type": "reminder.due",
        "id": "evt-test-uuid"
    }

    request = Request(scope={
        "type": "http",
        "method": "POST",
        "path": "/events/reminder-due"
    })
    request.json = lambda: event_data

    with patch('backend.src.events.handlers.logger'):
        response = await handle_reminder_due(request)

    assert response["status"] == "success"


@pytest.mark.asyncio
async def test_error_handling():
    """Test error handling in event handlers."""
    from backend.src.events.handlers import handle_task_created
    from starlette.requests import Request

    # Simulate an error in the request
    async def failing_json():
        raise Exception("Invalid JSON")

    request = Request(scope={
        "type": "http",
        "method": "POST",
        "path": "/events/task-created"
    })
    request.json = failing_json

    with patch('backend.src.events.handlers.logger'):
        response, status_code = await handle_task_created(request)
        assert status_code == 500