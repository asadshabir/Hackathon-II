"""
WebSocket server endpoint for real-time task updates.
Provides per-user connection registry with broadcast capability.
"""

import json
import logging
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionRegistry:
    """
    In-memory WebSocket connection registry.
    Tracks active connections per user_id for targeted broadcasts.
    """

    def __init__(self) -> None:
        # user_id -> list of active WebSocket connections
        self._connections: Dict[str, list[WebSocket]] = {}

    async def connect(self, user_id: str, websocket: WebSocket) -> None:
        """Accept and register a WebSocket connection for a user."""
        await websocket.accept()
        if user_id not in self._connections:
            self._connections[user_id] = []
        self._connections[user_id].append(websocket)
        logger.info(
            f"WebSocket connected: user={user_id}, "
            f"total_connections={len(self._connections[user_id])}"
        )

    def disconnect(self, user_id: str, websocket: WebSocket) -> None:
        """Remove a WebSocket connection from the registry."""
        if user_id in self._connections:
            try:
                self._connections[user_id].remove(websocket)
            except ValueError:
                pass
            if not self._connections[user_id]:
                del self._connections[user_id]
        logger.info(f"WebSocket disconnected: user={user_id}")

    async def broadcast_to_user(
        self, user_id: str, message: Dict[str, Any]
    ) -> None:
        """
        Send a JSON message to all active connections for a specific user.
        Stale connections are cleaned up automatically.
        """
        if user_id not in self._connections:
            return

        stale: list[WebSocket] = []
        payload = json.dumps(message)

        for ws in self._connections[user_id]:
            try:
                await ws.send_text(payload)
            except Exception:
                stale.append(ws)

        # Clean up stale connections
        for ws in stale:
            try:
                self._connections[user_id].remove(ws)
            except ValueError:
                pass

        if user_id in self._connections and not self._connections[user_id]:
            del self._connections[user_id]

    def get_connected_users(self) -> list[str]:
        """Return list of user_ids with active connections."""
        return list(self._connections.keys())

    def get_connection_count(self, user_id: str) -> int:
        """Return number of active connections for a user."""
        return len(self._connections.get(user_id, []))


# Singleton registry shared across the application
registry = ConnectionRegistry()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str) -> None:
    """
    WebSocket endpoint for real-time task updates.

    Clients connect with their user_id and receive JSON messages
    when their tasks are created, updated, completed, or deleted.
    """
    await registry.connect(user_id, websocket)

    # Send full task state snapshot to client on successful connection
    try:
        from uuid import UUID
        from sqlmodel import select
        from sqlalchemy.ext.asyncio import AsyncSession
        from ..database import async_session_maker
        from ..models import Task

        async with async_session_maker() as session:
            # Get all tasks for the user
            statement = select(Task).where(Task.user_id == UUID(user_id)).order_by(Task.created_at.desc())
            result = await session.execute(statement)
            tasks = result.scalars().all()

            # Send snapshot of all tasks
            task_snapshot = []
            for task in tasks:
                task_dict = {
                    "id": str(task.id),
                    "title": task.title,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "completed": task.completed,
                    "completed_at": task.completed_at.isoformat() if task.completed_at else None,
                    "created_at": task.created_at.isoformat() if task.created_at else None,
                    "user_id": str(task.user_id),
                    "recurrence_type": task.recurrence_type,
                    "recurrence_interval": task.recurrence_interval,
                }
                task_snapshot.append(task_dict)

            await websocket.send_text(json.dumps({
                "type": "full_state_snapshot",
                "data": {
                    "tasks": task_snapshot,
                    "timestamp": datetime.utcnow().isoformat()
                }
            }))
    except Exception as e:
        logger.error(f"Failed to send task snapshot to user {user_id}: {e}")

    try:
        while True:
            # Keep connection alive; handle incoming messages (ping/pong)
            data = await websocket.receive_text()
            # Echo back acknowledgment for client-sent messages
            try:
                msg = json.loads(data)
                if msg.get("type") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        registry.disconnect(user_id, websocket)
    except Exception as e:
        logger.error(f"WebSocket error for user={user_id}: {e}")
        registry.disconnect(user_id, websocket)
