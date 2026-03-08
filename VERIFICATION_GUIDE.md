# Task #3 Verification Guide -- Docker Compose Event Flow Test

**Agents:** task-orchestrator-agent, observability-agent
**Skills:** DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill

This guide verifies the full event-driven flow in the local Docker Compose stack: task creation, state persistence, Kafka event publishing, downstream consumption, and distributed tracing.

---

## Prerequisites

### 1. Ensure stack is running

```bash
docker compose ps
```

**Expected output:** All containers show `running` or `Up`:
```
NAME                  STATUS
todo-postgres         Up (healthy)
todo-zookeeper        Up
todo-kafka            Up (healthy)
todo-dapr-placement   Up
todo-jaeger           Up
todo-prometheus       Up
todo-grafana          Up
todo-backend          Up (healthy)
todo-backend-dapr     Up
todo-frontend         Up (healthy)
todo-frontend-dapr    Up
```

### 2. Confirm Dapr components loaded

```bash
docker compose logs backend-dapr | grep -iE "component|init"
```

**Expected output (patterns):**
```
component loaded. name: pubsub, type: pubsub.kafka/v1
component loaded. name: statestore, type: state.postgresql/v1
component loaded. name: localsecretstore, type: secretstores.local.env/v1
```

### 3. Confirm backend is healthy

```bash
curl -s http://localhost:8000/api/health | python3 -m json.tool
```

**Expected:** `{"status": "healthy"}` or similar 200 response.

---

## Step 1: Authenticate (Get JWT Token)

The API requires authentication via JWT cookie. Sign up a test user:

```bash
# Sign up a new test user
curl -v -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test-verify@example.com", "password": "TestPassword123!"}'
```

**Expected response (HTTP 201):**
```json
{
  "user": {"id": "uuid-here", "email": "test-verify@example.com"},
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "message": "Account created successfully"
}
```

Save the `access_token` value:
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

If user already exists, sign in instead:
```bash
curl -v -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test-verify@example.com", "password": "TestPassword123!"}'
```

---

## Step 2: Create a Task via POST /api/tasks

This tests the **task-orchestrator-agent** flow: API -> PostgreSQL save -> Dapr event publish.

```bash
curl -v -X POST http://localhost:8000/api/tasks \
  -H "Content-Type: application/json" \
  -b "access_token=${TOKEN}" \
  -d '{
    "title": "Verify Event Flow - Docker Compose Test",
    "priority": "high",
    "due_date": "2026-03-15T10:00:00"
  }'
```

**Expected response (HTTP 201 Created):**
```json
{
  "id": "a1b2c3d4-...",
  "title": "Verify Event Flow - Docker Compose Test",
  "completed": false,
  "created_at": "2026-02-12T...",
  "completed_at": null,
  "priority": "high",
  "due_date": "2026-03-15T10:00:00",
  "recurrence_type": "none",
  "recurrence_interval": 1
}
```

**Acceptance Criterion 1:** HTTP 201 with task ID in response body.

Save the task ID:
```bash
export TASK_ID="a1b2c3d4-..."
```

---

## Step 3: Verify Task Stored in PostgreSQL (DaprStateSkill)

### 3a. Query via API

```bash
curl -s -X GET "http://localhost:8000/api/tasks/${TASK_ID}" \
  -b "access_token=${TOKEN}" | python3 -m json.tool
```

**Expected:** HTTP 200 with matching title and priority.

### 3b. Query directly in PostgreSQL

```bash
docker compose exec postgres psql -U postgres -d todoapp \
  -c "SELECT id, title, priority, completed, created_at FROM tasks ORDER BY created_at DESC LIMIT 5;"
```

**Expected:** Row with your task title appears in results.

### 3c. Check Dapr state table (if populated by Dapr sidecar)

```bash
docker compose exec postgres psql -U postgres -d todoapp \
  -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dapr_state');"
```

If `t` (true): Dapr state store table was created. Check contents:
```bash
docker compose exec postgres psql -U postgres -d todoapp \
  -c "SELECT key, value::text FROM dapr_state LIMIT 5;"
```

**Acceptance Criterion 2:** Task is retrievable via GET /api/tasks/{id} AND visible in PostgreSQL.

---

## Step 4: Verify CloudEvent in Kafka (DaprPubSubSkill)

### 4a. List Kafka topics

```bash
docker compose exec kafka kafka-topics \
  --bootstrap-server kafka:9092 --list
```

**Expected:** `task.created` topic appears in the list (auto-created by Dapr on first publish).

### 4b. Consume messages from task.created topic

```bash
docker compose exec kafka kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic "task.created" \
  --from-beginning \
  --max-messages 5 \
  --timeout-ms 10000
```

**Expected output (CloudEvent 1.0 JSON):**
```json
{
  "specversion": "1.0",
  "type": "task.created",
  "source": "/api/tasks",
  "id": "evt-a1b2c3d4-...",
  "time": "2026-02-12T...",
  "datacontenttype": "application/json",
  "data": {
    "task_id": "a1b2c3d4-...",
    "user_id": "...",
    "title": "Verify Event Flow - Docker Compose Test",
    "completed": false,
    "priority": "high",
    "due_date": "2026-03-15T10:00:00",
    "created_at": "2026-02-12T..."
  }
}
```

**Acceptance Criterion 3:** At least one CloudEvent message with `type: "task.created"` containing the task title.

### 4c. Troubleshooting (if no messages)

```bash
# Check Kafka broker health
docker compose exec kafka kafka-broker-api-versions --bootstrap-server kafka:9092

# Check if Dapr sidecar can reach Kafka
docker compose logs backend-dapr 2>&1 | grep -iE "kafka|pubsub|error"

# Check if backend published the event
docker compose logs backend 2>&1 | grep -iE "event published|publish.*task"

# Restart the Dapr sidecar if needed
docker compose restart backend-dapr
```

---

## Step 5: Verify Event Processing in Logs (observability-agent)

### 5a. Backend event publish logs

```bash
docker compose logs backend 2>&1 | grep -iE "event published|publish.*task.created"
```

**Expected pattern:**
```
Event published to topic 'task.created' with ID evt-...
```

### 5b. Backend event consumption logs (downstream handlers)

```bash
docker compose logs backend 2>&1 | grep -iE "Processing.*event|task.created|handle_task_created|Task created"
```

**Expected patterns:**
```
Processing task.created event: evt-...
Task created: {...}
```

### 5c. Reminder creation (if due_date was set)

```bash
docker compose logs backend 2>&1 | grep -iE "reminder|due date"
```

**Expected:**
```
Task ... has due date ..., checking for reminder creation
Created reminder for task ...
```

### 5d. WebSocket broadcast

```bash
docker compose logs backend 2>&1 | grep -iE "broadcast.*task.created|websocket"
```

**Expected:**
```
Broadcast task.created event to user ...
```

### 5e. Check for errors across all services

```bash
# Check for critical errors (excluding expected patterns)
docker compose logs 2>&1 | grep -iE "error|fatal|panic" | grep -v "no error" | grep -v "error_handler" | grep -v "error handling" | tail -20
```

**Acceptance Criterion 5:** No critical errors in any service logs.

---

## Step 6: Verify Distributed Tracing in Jaeger (OpenTelemetryTracingSkill)

### 6a. Open Jaeger UI

Open in browser: **http://localhost:16686**

### 6b. Search for traces

1. In the **Service** dropdown, select `todo-ai-chatbot-api`
2. In the **Operation** dropdown, look for `POST /api/tasks` or `POST /api/{path}`
3. Set **Lookback** to `Last Hour`
4. Click **Find Traces**

### 6c. Inspect trace spans

Click on a trace to expand it. **Expected span hierarchy:**

```
POST /api/tasks (root span)
├── SELECT ... FROM users  (SQLAlchemy query)
├── INSERT INTO tasks ...  (task creation)
├── publish_event          (Dapr pub/sub publish)
│   └── kafka.produce      (Kafka producer span)
└── COMMIT                 (transaction commit)
```

### 6d. Query Jaeger API programmatically

```bash
# List available services
curl -s http://localhost:16686/api/services | python3 -m json.tool

# Find traces for the backend service (last 1 hour)
curl -s "http://localhost:16686/api/traces?service=todo-ai-chatbot-api&limit=5&lookback=1h" \
  | python3 -c "
import sys, json
data = json.load(sys.stdin)
traces = data.get('data', [])
print(f'Found {len(traces)} trace(s)')
for trace in traces[:3]:
    tid = trace.get('traceID', '?')
    spans = trace.get('spans', [])
    print(f'  TraceID: {tid}, Spans: {len(spans)}')
    for s in spans[:5]:
        print(f'    - {s.get(\"operationName\", \"?\")} ({s.get(\"duration\", 0)}us)')
"
```

**Acceptance Criterion 4:** At least one trace with root span `POST /api/tasks` and child spans for DB and event operations.

### 6e. Troubleshooting (if no traces)

```bash
# Check if OTEL dependencies are installed
docker compose exec backend pip list | grep -i opentelemetry

# Check if Jaeger is receiving data
curl -s http://localhost:16686/api/services

# Check OTLP endpoint connectivity from backend
docker compose exec backend curl -s http://jaeger:4318/v1/traces || echo "Not reachable"

# Check backend startup logs for OTEL init
docker compose logs backend 2>&1 | grep -iE "opentelemetry|otel|tracing"
```

---

## Step 7: Verify Metrics in Prometheus/Grafana (Bonus)

### 7a. Check Prometheus targets

```bash
curl -s http://localhost:9090/api/v1/targets | python3 -c "
import sys, json
data = json.load(sys.stdin)
targets = data.get('data', {}).get('activeTargets', [])
for t in targets:
    job = t['labels'].get('job', '?')
    health = t.get('health', '?')
    print(f'  {job}: {health}')
"
```

### 7b. Query HTTP request count

Open Prometheus UI at **http://localhost:9090** and run:
```promql
http_requests_total{method="POST", handler="/api/tasks"}
```

### 7c. Grafana Dashboard

1. Open **http://localhost:3001** (login: admin/admin)
2. Add Prometheus data source: `http://prometheus:9090`
3. Create dashboard with panels for:
   - HTTP request rate
   - Dapr pub/sub message count
   - State store operation count

---

## Step 8: Complete Verification Checklist

| # | Criterion | Command/Check | Status |
|---|-----------|---------------|--------|
| 1 | POST /api/tasks returns 201 | `curl -X POST ... -w "%{http_code}"` | |
| 2 | Task retrievable via GET and in PostgreSQL | `curl GET` + `docker exec psql` | |
| 3 | CloudEvent on Kafka `task.created` topic | `kafka-console-consumer` | |
| 4 | Jaeger trace with POST /api/tasks span | Jaeger UI or API query | |
| 5 | No errors in logs | `docker compose logs \| grep error` | |
| 6 | Metrics in Prometheus (bonus) | Prometheus UI query | |

---

## Automated Test Script

Run the full verification automatically:

```bash
chmod +x test-event-flow.sh
./test-event-flow.sh
```

The script performs all steps above and reports PASS/FAIL for each check.

---

## Troubleshooting Quick Reference

| Issue | Diagnostic Command |
|-------|-------------------|
| Backend not starting | `docker compose logs backend` |
| Dapr sidecar errors | `docker compose logs backend-dapr` |
| Kafka not reachable | `docker compose exec kafka kafka-broker-api-versions --bootstrap-server kafka:9092` |
| No events published | `docker compose logs backend \| grep -i publish` |
| No traces in Jaeger | `docker compose logs backend \| grep -i opentelemetry` |
| DB connection failed | `docker compose exec postgres pg_isready -U postgres` |
| Frontend not loading | `docker compose logs frontend` |
| Restart Dapr sidecar | `docker compose restart backend-dapr` |
| Restart entire stack | `docker compose down && docker compose up -d` |
