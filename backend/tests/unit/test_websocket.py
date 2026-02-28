"""
Unit tests for WebSocket server endpoint and ConnectionRegistry.
Tests connection lifecycle, broadcast isolation, and graceful disconnect.
"""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from src.api.websocket import ConnectionRegistry


@pytest.fixture
def registry() -> ConnectionRegistry:
    """Fresh ConnectionRegistry for each test."""
    return ConnectionRegistry()


def _mock_websocket() -> AsyncMock:
    """Create a mock WebSocket object."""
    ws = AsyncMock()
    ws.accept = AsyncMock()
    ws.send_text = AsyncMock()
    ws.receive_text = AsyncMock()
    return ws


@pytest.mark.asyncio
async def test_connect_registers_user(registry: ConnectionRegistry) -> None:
    """Connecting should register the user and accept the WebSocket."""
    ws = _mock_websocket()
    await registry.connect("user-1", ws)

    ws.accept.assert_called_once()
    assert registry.get_connection_count("user-1") == 1
    assert "user-1" in registry.get_connected_users()


@pytest.mark.asyncio
async def test_disconnect_removes_user(registry: ConnectionRegistry) -> None:
    """Disconnecting should remove the user from the registry."""
    ws = _mock_websocket()
    await registry.connect("user-1", ws)

    registry.disconnect("user-1", ws)

    assert registry.get_connection_count("user-1") == 0
    assert "user-1" not in registry.get_connected_users()


@pytest.mark.asyncio
async def test_multiple_connections_per_user(registry: ConnectionRegistry) -> None:
    """A user can have multiple active connections (e.g., multiple tabs)."""
    ws1 = _mock_websocket()
    ws2 = _mock_websocket()

    await registry.connect("user-1", ws1)
    await registry.connect("user-1", ws2)

    assert registry.get_connection_count("user-1") == 2


@pytest.mark.asyncio
async def test_broadcast_to_user_sends_to_correct_user(
    registry: ConnectionRegistry,
) -> None:
    """Broadcast should only send to the targeted user, not others."""
    ws_user1 = _mock_websocket()
    ws_user2 = _mock_websocket()

    await registry.connect("user-1", ws_user1)
    await registry.connect("user-2", ws_user2)

    message = {"type": "task.created", "data": {"task_id": "abc"}}
    await registry.broadcast_to_user("user-1", message)

    ws_user1.send_text.assert_called_once_with(json.dumps(message))
    ws_user2.send_text.assert_not_called()


@pytest.mark.asyncio
async def test_broadcast_to_all_user_connections(
    registry: ConnectionRegistry,
) -> None:
    """Broadcast should send to ALL connections of a user."""
    ws1 = _mock_websocket()
    ws2 = _mock_websocket()

    await registry.connect("user-1", ws1)
    await registry.connect("user-1", ws2)

    message = {"type": "task.updated", "data": {"task_id": "xyz"}}
    await registry.broadcast_to_user("user-1", message)

    expected_payload = json.dumps(message)
    ws1.send_text.assert_called_once_with(expected_payload)
    ws2.send_text.assert_called_once_with(expected_payload)


@pytest.mark.asyncio
async def test_broadcast_cleans_stale_connections(
    registry: ConnectionRegistry,
) -> None:
    """Stale connections that raise on send should be removed."""
    ws_good = _mock_websocket()
    ws_stale = _mock_websocket()
    ws_stale.send_text.side_effect = Exception("Connection closed")

    await registry.connect("user-1", ws_good)
    await registry.connect("user-1", ws_stale)
    assert registry.get_connection_count("user-1") == 2

    await registry.broadcast_to_user("user-1", {"type": "test"})

    # Stale connection should be removed
    assert registry.get_connection_count("user-1") == 1


@pytest.mark.asyncio
async def test_broadcast_to_nonexistent_user(
    registry: ConnectionRegistry,
) -> None:
    """Broadcasting to a user with no connections should be a no-op."""
    # Should not raise
    await registry.broadcast_to_user("no-such-user", {"type": "test"})


@pytest.mark.asyncio
async def test_disconnect_idempotent(registry: ConnectionRegistry) -> None:
    """Disconnecting an already-disconnected socket should not raise."""
    ws = _mock_websocket()
    await registry.connect("user-1", ws)

    registry.disconnect("user-1", ws)
    # Second disconnect should be safe
    registry.disconnect("user-1", ws)

    assert registry.get_connection_count("user-1") == 0


@pytest.mark.asyncio
async def test_get_connected_users_empty(registry: ConnectionRegistry) -> None:
    """Empty registry should return empty list."""
    assert registry.get_connected_users() == []
