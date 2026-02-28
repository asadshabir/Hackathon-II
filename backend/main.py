"""
Todo AI Chatbot - FastAPI Application Entry Point.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError

# OpenTelemetry imports for observability (optional dependency)
try:
    from opentelemetry import trace
    from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
    from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
    from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
    from opentelemetry.sdk.resources import SERVICE_NAME, Resource
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import BatchSpanProcessor

    OTEL_AVAILABLE = True
except ImportError:
    OTEL_AVAILABLE = False

from src.api import (
    analytics_router,
    auth_router,
    chat_router,
    conversations_router,
    health_router,
    metrics_router,
    preferences_router,
    reminders_router,
    tags_router,
    tasks_router,
    websocket_router,
)

# Events router (optional - requires dapr)
try:
    from src.events.handlers import router as events_router

    EVENTS_AVAILABLE = True
except ImportError:
    events_router = None
    EVENTS_AVAILABLE = False

from src.config import get_settings
from src.database import close_db
from src.init_db import init_database
from src.middleware import (
    AppException,
    RateLimitMiddleware,
    app_exception_handler,
    generic_exception_handler,
    sqlalchemy_exception_handler,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager for startup and shutdown events.
    """
    # Startup
    logger.info("Starting Todo AI Chatbot API...")

    # Initialize OpenTelemetry (if available)
    if OTEL_AVAILABLE:
        try:
            resource = Resource(attributes={
                SERVICE_NAME: "todo-ai-chatbot-api"
            })
            tracer_provider = TracerProvider(resource=resource)
            otlp_exporter = OTLPSpanExporter(endpoint="http://jaeger:4318/v1/traces")
            span_processor = BatchSpanProcessor(otlp_exporter)
            tracer_provider.add_span_processor(span_processor)
            trace.set_tracer_provider(tracer_provider)
            FastAPIInstrumentor.instrument_app(app)
            SQLAlchemyInstrumentor().instrument()
            logger.info("OpenTelemetry instrumentation initialized")
        except Exception as e:
            logger.warning(f"OpenTelemetry initialization skipped: {e}")
    else:
        logger.info("OpenTelemetry not installed - tracing disabled")

    try:
        await init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        # Continue anyway - the app can still serve health checks
        # and provide meaningful error messages

    logger.info(f"Server listening on http://0.0.0.0:{settings.port}")
    logger.info(f"API Docs: http://localhost:{settings.port}/docs")

    yield

    # Shutdown
    logger.info("Shutting down Todo AI Chatbot API...")

    # Shutdown OpenTelemetry
    if OTEL_AVAILABLE:
        try:
            trace.get_tracer_provider().shutdown()
            logger.info("OpenTelemetry tracer provider shut down")
        except Exception as e:
            logger.error(f"Error shutting down OpenTelemetry: {e}")

    await close_db()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title="Todo AI Chatbot API",
    description="AI-powered todo management through natural language conversation",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add rate limiting middleware
app.add_middleware(
    RateLimitMiddleware,
    requests_limit=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window,
)

# Register exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Include routers
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(tasks_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")
app.include_router(metrics_router)  # Metrics endpoint at /metrics
app.include_router(preferences_router, prefix="/api")
app.include_router(reminders_router, prefix="/api")
app.include_router(tags_router, prefix="/api")
app.include_router(conversations_router, prefix="/api")
if EVENTS_AVAILABLE and events_router is not None:
    app.include_router(events_router)
app.include_router(websocket_router)


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Welcome to Todo AI Chatbot API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=True,
        log_level="info",
    )
