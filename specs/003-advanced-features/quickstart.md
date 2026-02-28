# Quickstart: Phase V Advanced Features

**Branch**: `003-advanced-features` | **Date**: 2026-02-09

## Prerequisites

- Python 3.13+
- Node.js 18+
- Docker and Docker Compose
- Dapr CLI installed (`dapr init`)
- Neon PostgreSQL database (or local PostgreSQL)

## Local Development Setup

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies (includes new Dapr and OpenTelemetry packages)
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your Neon database URL and OpenAI API key

# Run database migrations (SQLModel create_all)
python -c "from src.init_db import init_db; import asyncio; asyncio.run(init_db())"

# Start backend with Dapr sidecar
dapr run --app-id backend --app-port 8000 --dapr-http-port 3500 -- uvicorn src.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
cp .env.example .env.local
# Edit .env.local with backend URL

# Start development server
npm run dev
```

### 3. Infrastructure (Docker Compose for local dev)

```bash
# Start Kafka and supporting services
docker-compose -f deploy/docker-compose.local.yml up -d

# Verify Kafka is running
docker exec -it kafka kafka-topics.sh --bootstrap-server localhost:9092 --list

# Verify Dapr components
dapr components list
```

## Verify Setup

1. **Backend health**: `curl http://localhost:8000/api/health`
2. **Dapr sidecar**: `curl http://localhost:3500/v1.0/healthz`
3. **Create a task**: `curl -X POST http://localhost:8000/tasks -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"title": "Test task", "priority": "high"}'`
4. **Check Kafka**: Verify `task.created` event on topic
5. **WebSocket**: Connect to `ws://localhost:8000/ws/<user_id>` and verify events arrive

## Key Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | Neon PostgreSQL connection string | required |
| OPENAI_API_KEY | OpenAI API key for agents | required |
| DAPR_HTTP_PORT | Dapr sidecar HTTP port | 3500 |
| OTEL_EXPORTER_OTLP_ENDPOINT | Jaeger collector endpoint | http://localhost:4317 |
| KAFKA_BROKERS | Kafka bootstrap servers | localhost:9092 |

## Common Commands

```bash
# Run backend tests
cd backend && pytest

# Run with full tracing
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317 dapr run --app-id backend ...

# View Jaeger UI
open http://localhost:16686

# View Prometheus metrics
curl http://localhost:8000/metrics
```
