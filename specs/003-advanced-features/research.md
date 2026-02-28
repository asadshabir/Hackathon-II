# Research: Phase V Advanced Features

**Branch**: `003-advanced-features` | **Date**: 2026-02-09

## R1: Dapr Python SDK for FastAPI Integration

**Decision**: Use `dapr-client` Python SDK (HTTP mode) for pub/sub, state, and service invocation.

**Rationale**: The Dapr Python SDK provides a clean abstraction over Dapr's HTTP/gRPC API. HTTP mode is simpler and sufficient for our throughput requirements. The SDK handles CloudEvents serialization automatically.

**Alternatives considered**:
- Direct HTTP calls to Dapr sidecar: Too low-level, error-prone CloudEvents formatting
- gRPC mode: Higher performance but more complex setup, not needed for our scale
- dapr-ext-fastapi: Provides FastAPI-specific helpers but less maintained than core SDK

**Implementation**: `pip install dapr-client`. Use `DaprClient()` for publishing, HTTP endpoints for subscription callbacks.

---

## R2: Kafka Topic Management via Dapr

**Decision**: Define Kafka topics via Dapr Subscription CRDs. Let Dapr manage topic creation and consumer groups.

**Rationale**: Dapr abstracts Kafka topic management. Topics are auto-created when first published to. Consumer groups are managed per app-id. This eliminates the need for Kafka CLI tools or admin scripts.

**Alternatives considered**:
- Strimzi KafkaTopic CRDs: More explicit control but adds Strimzi dependency to topic management
- Kafka AdminClient: Requires direct Kafka SDK (violates constitution INV-001)
- Manual topic creation: Not reproducible, not GitOps-friendly

---

## R3: WebSocket Implementation for Real-Time Sync

**Decision**: Use FastAPI's native WebSocket support with an in-memory connection registry per user_id.

**Rationale**: FastAPI has built-in WebSocket support. An in-memory dict of `{user_id: set[WebSocket]}` is sufficient for our scale. When Dapr event handlers receive events, they look up the user's connections and broadcast. With replicas >= 2, each instance handles its own connections — this is acceptable because the user's browser connects to one instance via sticky sessions or the load balancer.

**Alternatives considered**:
- Socket.IO: Adds heavy dependency, not needed for simple broadcast
- Server-Sent Events (SSE): Simpler but one-directional, WebSocket preferred for bidirectional
- Redis pub/sub for cross-instance broadcast: Better for horizontal scaling but adds complexity; defer to Phase VI if needed

**Risk**: With replicas >= 2, a user might connect to instance A but the event handler runs on instance B. **Mitigation**: Use Dapr service invocation to broadcast to all instances, or accept that real-time sync works within a single instance for MVP.

---

## R4: Database Migration Strategy (Additive-Only)

**Decision**: Use SQLModel's `create_all()` for development. For production, use Alembic with additive-only migrations.

**Rationale**: SQLModel's `create_all()` creates missing tables and columns automatically. For production, Alembic provides versioned migration scripts. Constitution INV-007 requires additive-only migrations (no DROP, no RENAME).

**Alternatives considered**:
- Manual SQL scripts: Not version-controlled, error-prone
- Django-style auto-migrations: Not available for SQLModel/SQLAlchemy
- Liquibase: Over-engineered for our schema size

**Implementation**: New fields on Task use `Field(default=...)` so existing rows get the default. New tables (tags, task_tags, reminders) are created fresh.

---

## R5: Chart Library for Analytics Dashboard

**Decision**: Use Recharts (lightweight React charting library built on D3).

**Rationale**: Recharts is the most popular React charting library. It's built on D3 but provides React components. Bundle size is ~45KB gzipped which fits within our performance budget.

**Alternatives considered**:
- Chart.js + react-chartjs-2: Slightly smaller but less React-native API
- Nivo: Beautiful but heavier (~80KB)
- Tremor: Nice dashboards but adds Tailwind conflicts
- Visx: Low-level, requires more code

---

## R6: Reminder Scheduling Mechanism

**Decision**: Use Dapr's built-in actor reminders or a polling-based approach with Dapr State Store for scheduling.

**Rationale**: Dapr Actors provide built-in reminder functionality. However, if Dapr Actors are too complex for MVP, a simpler approach is to store reminders in the database with a `reminder_time` and run a periodic check (every 30 seconds) that queries for due reminders and emits events. This is a pragmatic compromise between the constitution's "no polling" ideal and implementation reality.

**Alternatives considered**:
- Celery Beat: Adds Redis/RabbitMQ dependency
- APScheduler: In-process, doesn't survive restarts
- Dapr Jobs API: Ideal but requires Dapr Jobs component setup
- PostgreSQL LISTEN/NOTIFY: Database-specific, not portable

**Implementation**: Start with database polling (30s interval) for MVP. Migrate to Dapr Jobs API when infrastructure is ready.

---

## R7: OpenTelemetry Setup for FastAPI

**Decision**: Use `opentelemetry-instrumentation-fastapi` for auto-instrumentation. Export to Jaeger via OTLP.

**Rationale**: OpenTelemetry provides automatic instrumentation for FastAPI that creates spans for every request. Combined with SQLAlchemy and HTTP client instrumentation, we get full trace coverage without manual span creation.

**Alternatives considered**:
- Manual span creation: Too much boilerplate
- Datadog APM: Vendor lock-in
- New Relic: Cost

**Implementation**:
```
pip install opentelemetry-api opentelemetry-sdk
pip install opentelemetry-instrumentation-fastapi
pip install opentelemetry-exporter-otlp
```

---

## R8: Circuit Breaker Implementation

**Decision**: Implement a simple in-process circuit breaker using Python asyncio (no external library).

**Rationale**: A circuit breaker is ~50 lines of Python code. Adding a library like `pybreaker` or `tenacity` adds dependencies for minimal gain. Our implementation needs: closed/open/half-open states, failure counter, timeout-based reset.

**Alternatives considered**:
- pybreaker: Well-tested but synchronous (we need async)
- tenacity: Retry library, not a circuit breaker
- Polly (via Dapr resiliency): Dapr has built-in resiliency policies, could be configured at the infrastructure level

**Implementation**: Create `backend/src/resilience/circuit_breaker.py` with an `AsyncCircuitBreaker` class.
