"""
Prometheus metrics endpoint for monitoring application performance.
"""

from fastapi import APIRouter
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

router = APIRouter(prefix="/metrics", tags=["metrics"])

# Define metrics
REQUEST_COUNT = Counter(
    "http_requests_total",
    "Total number of HTTP requests",
    ["method", "endpoint", "status_code"]
)

REQUEST_DURATION = Histogram(
    "http_request_duration_seconds",
    "Duration of HTTP requests in seconds",
    ["method", "endpoint"]
)

EVENT_PUBLISH_COUNT = Counter(
    "dapr_event_publish_total",
    "Total number of events published",
    ["event_type"]
)

EVENT_CONSUME_COUNT = Counter(
    "dapr_event_consume_total",
    "Total number of events consumed",
    ["event_type"]
)

CIRCUIT_BREAKER_STATE = Gauge(
    "circuit_breaker_state",
    "Current state of circuit breakers (0=closed, 1=open, 0.5=half-open)",
    ["breaker_name"]
)

ACTIVE_WEBSOCKET_CONNECTIONS = Gauge(
    "websocket_connections_active",
    "Number of active WebSocket connections",
    ["user_id"]
)

# Add more application-specific metrics as needed
DB_CONNECTION_POOL_SIZE = Gauge(
    "db_connection_pool_size",
    "Size of database connection pool"
)

DB_CONNECTION_POOL_USED = Gauge(
    "db_connection_pool_used",
    "Number of used database connections"
)


@router.get("/")
async def get_metrics():
    """
    Prometheus metrics endpoint.
    Returns metrics in Prometheus format.
    """
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Helper functions to update metrics
def increment_request_count(method: str, endpoint: str, status_code: int):
    """Increment the request counter."""
    REQUEST_COUNT.labels(method=method, endpoint=endpoint, status_code=status_code).inc()


def observe_request_duration(method: str, endpoint: str, duration: float):
    """Observe request duration."""
    REQUEST_DURATION.labels(method=method, endpoint=endpoint).observe(duration)


def increment_event_published(event_type: str):
    """Increment the event published counter."""
    EVENT_PUBLISH_COUNT.labels(event_type=event_type).inc()


def increment_event_consumed(event_type: str):
    """Increment the event consumed counter."""
    EVENT_CONSUME_COUNT.labels(event_type=event_type).inc()


def set_circuit_breaker_state(breaker_name: str, state: float):
    """Set the circuit breaker state (0=closed, 1=open, 0.5=half-open)."""
    CIRCUIT_BREAKER_STATE.labels(breaker_name=breaker_name).set(state)


def set_active_websocket_connections(user_id: str, count: int):
    """Set the number of active WebSocket connections for a user."""
    ACTIVE_WEBSOCKET_CONNECTIONS.labels(user_id=user_id).set(count)


def set_db_pool_metrics(pool_size: int, pool_used: int):
    """Set database pool metrics."""
    DB_CONNECTION_POOL_SIZE.set(pool_size)
    DB_CONNECTION_POOL_USED.set(pool_used)