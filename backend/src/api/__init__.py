"""
FastAPI route handlers.
"""

from src.api.auth import router as auth_router
from src.api.chat import router as chat_router
from src.api.conversations import router as conversations_router
from src.api.health import router as health_router
from src.api.tasks import router as tasks_router
from src.api.tags import router as tags_router
from src.api.reminders import router as reminders_router
from src.api.analytics import router as analytics_router
from src.api.preferences import router as preferences_router
from src.api.websocket import router as websocket_router

# Metrics router depends on prometheus_client (optional)
try:
    from src.api.metrics import router as metrics_router
except ImportError:
    from fastapi import APIRouter
    metrics_router = APIRouter(prefix="/metrics", tags=["metrics"])

    @metrics_router.get("/")
    async def get_metrics():
        return {"message": "Prometheus client not installed. Metrics disabled."}

__all__ = [
    "analytics_router",
    "auth_router",
    "chat_router",
    "conversations_router",
    "health_router",
    "metrics_router",
    "preferences_router",
    "reminders_router",
    "tags_router",
    "tasks_router",
    "websocket_router",
]
