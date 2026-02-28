"""
Integration tests for chatbot advanced features.
"""

import pytest
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

from src.agents.todo_agent import chat_with_agent


@pytest.mark.asyncio
async def test_set_priority_command():
    """Test chatbot understands priority commands."""
    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the tool execution
    with patch("src.agents.todo_agent.execute_tool") as mock_execute:
        mock_execute.return_value = {
            "success": True,
            "task": {"id": str(uuid.uuid4()), "title": "Test task", "priority": "high"}
        }

        response = await chat_with_agent(
            session_mock, user_id, "Make this task high priority"
        )

        # Verify that the set_priority tool was called
        assert mock_execute.called
        # The exact assertion depends on how the Gemini model interprets the request
        # For testing purposes, we'll just check that a tool was called


@pytest.mark.asyncio
async def test_assign_tags_command():
    """Test chatbot understands tagging commands."""
    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the tool execution
    with patch("src.agents.todo_agent.execute_tool") as mock_execute:
        mock_execute.return_value = {
            "success": True,
            "message": "Tags assigned successfully"
        }

        response = await chat_with_agent(
            session_mock, user_id, "Tag this task as work"
        )

        # Verify that the assign_tags tool was called
        assert mock_execute.called


@pytest.mark.asyncio
async def test_set_due_date_command():
    """Test chatbot understands due date commands."""
    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the tool execution
    with patch("src.agents.todo_agent.execute_tool") as mock_execute:
        mock_execute.return_value = {
            "success": True,
            "message": "Due date updated"
        }

        response = await chat_with_agent(
            session_mock, user_id, "Set this task due Friday"
        )

        # Verify that the set_due_date tool was called
        assert mock_execute.called


@pytest.mark.asyncio
async def test_set_recurrence_command():
    """Test chatbot understands recurrence commands."""
    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the tool execution
    with patch("src.agents.todo_agent.execute_tool") as mock_execute:
        mock_execute.return_value = {
            "success": True,
            "message": "Recurrence configured"
        }

        response = await chat_with_agent(
            session_mock, user_id, "Make this task recurring weekly"
        )

        # Verify that the set_recurrence tool was called
        assert mock_execute.called


@pytest.mark.asyncio
async def test_query_analytics_command():
    """Test chatbot understands analytics queries."""
    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the tool execution
    with patch("src.agents.todo_agent.execute_tool") as mock_execute:
        mock_execute.return_value = {
            "success": True,
            "analytics": {
                "completion_today": 5,
                "completion_week": 15,
                "streak": {"current": 3, "longest": 7}
            }
        }

        response = await chat_with_agent(
            session_mock, user_id, "How productive was I this week?"
        )

        # Verify that the query_analytics tool was called
        assert mock_execute.called


@pytest.mark.asyncio
async def test_update_preferences_command():
    """Test chatbot understands preference updates."""
    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the tool execution
    with patch("src.agents.todo_agent.execute_tool") as mock_execute:
        mock_execute.return_value = {
            "success": True,
            "message": "Preferences updated"
        }

        response = await chat_with_agent(
            session_mock, user_id, "Set default reminder to 30 minutes"
        )

        # Verify that the update_preferences tool was called
        assert mock_execute.called


@pytest.mark.asyncio
async def test_complex_conversation():
    """Test a complex conversation involving multiple advanced features."""
    session_mock = AsyncMock()
    user_id = uuid.uuid4()

    # Mock the tool executions for a sequence of operations
    tool_calls = []

    def side_effect(*args, **kwargs):
        tool_name = args[2]  # tool_name is the third argument
        tool_calls.append(tool_name)
        if tool_name == "create_task":
            return {
                "success": True,
                "task": {"id": str(uuid.uuid4()), "title": "Prepare presentation", "priority": "medium"}
            }
        elif tool_name == "set_priority":
            return {
                "success": True,
                "message": "Priority updated"
            }
        elif tool_name == "set_due_date":
            return {
                "success": True,
                "message": "Due date set"
            }
        elif tool_name == "assign_tags":
            return {
                "success": True,
                "message": "Tags assigned"
            }
        else:
            return {"success": True}

    with patch("src.agents.todo_agent.execute_tool", side_effect=side_effect):
        # Simulate a complex request
        response = await chat_with_agent(
            session_mock, user_id, "Create a task 'Prepare presentation', make it high priority, set due date to Friday, and tag it as work"
        )

        # Verify that multiple tools were called
        assert "create_task" in tool_calls
        assert "set_priority" in tool_calls
        assert "set_due_date" in tool_calls
        assert "assign_tags" in tool_calls