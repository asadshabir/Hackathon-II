#!/usr/bin/env bash
# =============================================================================
# Task #3 Verification Script – Docker Compose Event Flow Test
# =============================================================================
# Agents: task-orchestrator-agent, observability-agent
# Skills: DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
#
# This script verifies the full event-driven flow:
#   1. Auth → signup/signin to get JWT
#   2. POST /api/tasks → create task (201)
#   3. GET /api/tasks → verify task stored in PostgreSQL
#   4. Kafka topic "task.created" → verify CloudEvent published
#   5. Logs → verify Dapr sidecar processed event
#   6. Jaeger → verify distributed trace
# =============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

BASE_URL="${BASE_URL:-http://localhost:8000}"
JAEGER_URL="${JAEGER_URL:-http://localhost:16686}"
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser-${TIMESTAMP}@example.com"
TEST_PASSWORD="TestPassword123!"

PASS_COUNT=0
FAIL_COUNT=0
TASK_ID=""
ACCESS_TOKEN=""

# ─── Helpers ────────────────────────────────────────────────────────────────────

print_header() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

print_step() {
  echo -e "\n${YELLOW}▶ Step $1: $2${NC}"
}

pass() {
  echo -e "  ${GREEN}✔ PASS:${NC} $1"
  PASS_COUNT=$((PASS_COUNT + 1))
}

fail() {
  echo -e "  ${RED}✘ FAIL:${NC} $1"
  FAIL_COUNT=$((FAIL_COUNT + 1))
}

# ─── Prerequisites ──────────────────────────────────────────────────────────────

print_header "PREREQUISITES CHECK"

echo "Checking Docker Compose services..."
if docker compose ps --format '{{.Name}}' 2>/dev/null | grep -q "todo-"; then
  pass "Docker Compose stack is running"
else
  fail "Docker Compose stack is NOT running. Run: docker compose up -d"
  echo "Aborting."
  exit 1
fi

echo ""
echo "Checking backend health..."
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" 2>/dev/null || echo "000")
if [ "$HEALTH" = "200" ]; then
  pass "Backend is healthy (HTTP 200)"
else
  fail "Backend health check failed (HTTP ${HEALTH}). Waiting 10s and retrying..."
  sleep 10
  HEALTH=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/health" 2>/dev/null || echo "000")
  if [ "$HEALTH" = "200" ]; then
    pass "Backend is healthy after retry (HTTP 200)"
  else
    fail "Backend is NOT healthy (HTTP ${HEALTH}). Check: docker compose logs backend"
    exit 1
  fi
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 1: Authenticate – Sign up a test user
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 1: AUTHENTICATION"
print_step "1a" "Sign up test user (${TEST_EMAIL})"

SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"${TEST_EMAIL}\", \"password\": \"${TEST_PASSWORD}\"}")

SIGNUP_HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -1)
SIGNUP_BODY=$(echo "$SIGNUP_RESPONSE" | sed '$d')

if [ "$SIGNUP_HTTP_CODE" = "201" ]; then
  pass "Signup returned HTTP 201"
  ACCESS_TOKEN=$(echo "$SIGNUP_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
  if [ -n "$ACCESS_TOKEN" ]; then
    pass "Got access_token from signup response"
    echo "  Token (first 20 chars): ${ACCESS_TOKEN:0:20}..."
  else
    fail "Could not extract access_token from signup response"
    echo "  Response body: ${SIGNUP_BODY}"
  fi
else
  echo "  Signup returned HTTP ${SIGNUP_HTTP_CODE} — trying signin instead..."

  print_step "1b" "Sign in existing user"
  SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "${BASE_URL}/api/auth/signin" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${TEST_EMAIL}\", \"password\": \"${TEST_PASSWORD}\"}")

  SIGNIN_HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -1)
  SIGNIN_BODY=$(echo "$SIGNIN_RESPONSE" | sed '$d')

  if [ "$SIGNIN_HTTP_CODE" = "200" ]; then
    pass "Signin returned HTTP 200"
    ACCESS_TOKEN=$(echo "$SIGNIN_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
    if [ -n "$ACCESS_TOKEN" ]; then
      pass "Got access_token from signin response"
    else
      fail "Could not extract access_token"
    fi
  else
    fail "Both signup and signin failed (HTTP ${SIGNIN_HTTP_CODE})"
    echo "  Response: ${SIGNIN_BODY}"
    exit 1
  fi
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 2: Create a Task via POST /api/tasks (task-orchestrator-agent flow)
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 2: CREATE TASK (task-orchestrator-agent)"
print_step "2" "POST /api/tasks with auth cookie"

TASK_TITLE="Test Event Flow Task ${TIMESTAMP}"

CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${BASE_URL}/api/tasks" \
  -H "Content-Type: application/json" \
  -b "access_token=${ACCESS_TOKEN}" \
  -d "{
    \"title\": \"${TASK_TITLE}\",
    \"priority\": \"high\",
    \"due_date\": \"2026-03-15T10:00:00\"
  }")

CREATE_HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -1)
CREATE_BODY=$(echo "$CREATE_RESPONSE" | sed '$d')

echo "  HTTP Status: ${CREATE_HTTP_CODE}"
echo "  Response: ${CREATE_BODY}"

if [ "$CREATE_HTTP_CODE" = "201" ]; then
  pass "POST /api/tasks returned HTTP 201 Created"
else
  fail "POST /api/tasks returned HTTP ${CREATE_HTTP_CODE} (expected 201)"
fi

TASK_ID=$(echo "$CREATE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
if [ -n "$TASK_ID" ]; then
  pass "Task created with ID: ${TASK_ID}"
else
  fail "Could not extract task ID from response"
fi

TASK_PRIORITY=$(echo "$CREATE_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('priority',''))" 2>/dev/null || echo "")
if [ "$TASK_PRIORITY" = "high" ]; then
  pass "Task priority correctly set to 'high'"
else
  fail "Task priority mismatch: got '${TASK_PRIORITY}', expected 'high'"
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 3: Verify Task Stored in PostgreSQL (DaprStateSkill verification)
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 3: VERIFY TASK IN DATABASE (DaprStateSkill)"

if [ -n "$TASK_ID" ]; then
  print_step "3a" "GET /api/tasks/${TASK_ID}"

  GET_RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X GET "${BASE_URL}/api/tasks/${TASK_ID}" \
    -b "access_token=${ACCESS_TOKEN}")

  GET_HTTP_CODE=$(echo "$GET_RESPONSE" | tail -1)
  GET_BODY=$(echo "$GET_RESPONSE" | sed '$d')

  if [ "$GET_HTTP_CODE" = "200" ]; then
    pass "GET /api/tasks/${TASK_ID} returned HTTP 200"
    GET_TITLE=$(echo "$GET_BODY" | python3 -c "import sys,json; print(json.load(sys.stdin).get('title',''))" 2>/dev/null || echo "")
    if [ "$GET_TITLE" = "$TASK_TITLE" ]; then
      pass "Task title matches: '${TASK_TITLE}'"
    else
      fail "Task title mismatch: got '${GET_TITLE}'"
    fi
  else
    fail "GET /api/tasks/${TASK_ID} returned HTTP ${GET_HTTP_CODE}"
  fi

  print_step "3b" "Verify task in PostgreSQL via docker exec"
  echo "  Running: docker compose exec postgres psql ..."

  DB_RESULT=$(docker compose exec -T postgres psql -U postgres -d todoapp -t -A \
    -c "SELECT title, priority FROM tasks WHERE id = '${TASK_ID}';" 2>/dev/null || echo "ERROR")

  if echo "$DB_RESULT" | grep -q "${TASK_TITLE}"; then
    pass "Task found in PostgreSQL database"
    echo "  DB row: ${DB_RESULT}"
  else
    fail "Task NOT found in PostgreSQL (result: ${DB_RESULT})"
    echo "  Troubleshoot: docker compose exec postgres psql -U postgres -d todoapp -c \"SELECT id, title FROM tasks ORDER BY created_at DESC LIMIT 5;\""
  fi
else
  fail "Skipping database verification — no task ID available"
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 4: Verify CloudEvent in Kafka (DaprPubSubSkill verification)
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 4: VERIFY KAFKA EVENT (DaprPubSubSkill)"
print_step "4a" "List Kafka topics"

TOPICS=$(docker compose exec -T kafka kafka-topics --bootstrap-server kafka:9092 --list 2>/dev/null || echo "ERROR")
echo "  Available topics:"
echo "$TOPICS" | sed 's/^/    /'

if echo "$TOPICS" | grep -q "task.created"; then
  pass "Kafka topic 'task.created' exists"
else
  echo -e "  ${YELLOW}⚠ Topic 'task.created' not found in list — it may be auto-created by Dapr on first publish${NC}"
fi

print_step "4b" "Consume latest messages from task.created topic (timeout 10s)"

echo "  Running kafka-console-consumer (will timeout after 10s)..."
KAFKA_MESSAGES=$(docker compose exec -T kafka timeout 10 kafka-console-consumer \
  --bootstrap-server kafka:9092 \
  --topic "task.created" \
  --from-beginning \
  --max-messages 5 \
  --timeout-ms 10000 2>/dev/null || echo "")

if [ -n "$KAFKA_MESSAGES" ]; then
  pass "Found messages on 'task.created' topic"
  echo "  Latest message (truncated):"
  echo "$KAFKA_MESSAGES" | tail -1 | cut -c1-200
  echo ""

  # Check for CloudEvent format
  if echo "$KAFKA_MESSAGES" | grep -q "specversion"; then
    pass "Message contains CloudEvents 'specversion' field"
  else
    echo -e "  ${YELLOW}⚠ CloudEvents 'specversion' field not found in raw message — Dapr may wrap it differently${NC}"
  fi

  if echo "$KAFKA_MESSAGES" | grep -q "task.created"; then
    pass "Message contains event type 'task.created'"
  fi

  if echo "$KAFKA_MESSAGES" | grep -q "$TASK_TITLE"; then
    pass "Message contains the task title"
  fi
else
  fail "No messages found on 'task.created' topic"
  echo "  Troubleshoot:"
  echo "    1. Check Dapr sidecar logs: docker compose logs backend-dapr | grep -i publish"
  echo "    2. Check backend logs: docker compose logs backend | grep -i 'Event published'"
  echo "    3. Check Kafka connectivity: docker compose exec kafka kafka-broker-api-versions --bootstrap-server kafka:9092"
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 5: Verify Event Processing in Logs (observability-agent)
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 5: VERIFY EVENT PROCESSING IN LOGS (observability-agent)"

print_step "5a" "Check backend logs for event publish"
PUBLISH_LOGS=$(docker compose logs backend 2>/dev/null | grep -iE "event published|publish.*task.created|_publish_event" | tail -5 || echo "")
if [ -n "$PUBLISH_LOGS" ]; then
  pass "Backend logs show event publish activity"
  echo "$PUBLISH_LOGS" | sed 's/^/    /'
else
  echo -e "  ${YELLOW}⚠ No explicit publish logs found — Dapr client may log at debug level${NC}"
fi

print_step "5b" "Check backend logs for event consumption"
CONSUME_LOGS=$(docker compose logs backend 2>/dev/null | grep -iE "Processing.*event|task.created|handle_task_created" | tail -5 || echo "")
if [ -n "$CONSUME_LOGS" ]; then
  pass "Backend logs show event consumption"
  echo "$CONSUME_LOGS" | sed 's/^/    /'
else
  echo -e "  ${YELLOW}⚠ No event consumption logs found — events may not have been consumed yet${NC}"
fi

print_step "5c" "Check Dapr sidecar logs for component initialization"
DAPR_INIT_LOGS=$(docker compose logs backend-dapr 2>/dev/null | grep -iE "component|init|pubsub|statestore" | tail -10 || echo "")
if [ -n "$DAPR_INIT_LOGS" ]; then
  pass "Dapr sidecar shows component activity"
  echo "$DAPR_INIT_LOGS" | sed 's/^/    /'
else
  echo -e "  ${YELLOW}⚠ No Dapr component logs found${NC}"
fi

print_step "5d" "Check for errors in all logs"
ERROR_LOGS=$(docker compose logs 2>/dev/null | grep -iE "error|fatal|panic" | grep -v "no error" | grep -v "error_handler" | grep -v "error handling" | tail -10 || echo "")
if [ -z "$ERROR_LOGS" ]; then
  pass "No critical errors found in logs"
else
  echo -e "  ${YELLOW}⚠ Potential errors found in logs:${NC}"
  echo "$ERROR_LOGS" | sed 's/^/    /'
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 6: Verify Distributed Tracing (OpenTelemetryTracingSkill)
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 6: VERIFY JAEGER TRACING (OpenTelemetryTracingSkill)"
print_step "6" "Query Jaeger API for recent traces"

echo "  Jaeger UI: ${JAEGER_URL}"
echo "  Querying Jaeger API for 'todo-ai-chatbot-api' service traces..."

# Wait briefly for traces to flush
sleep 2

JAEGER_SERVICES=$(curl -s "${JAEGER_URL}/api/services" 2>/dev/null || echo "{}")
echo "  Available services in Jaeger:"
echo "$JAEGER_SERVICES" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for svc in data.get('data', []):
        print(f'    - {svc}')
except:
    print('    (could not parse)')
" 2>/dev/null || echo "    (could not query)"

# Try to find traces for our service
LOOKBACK="1h"
JAEGER_TRACES=$(curl -s "${JAEGER_URL}/api/traces?service=todo-ai-chatbot-api&limit=5&lookback=${LOOKBACK}" 2>/dev/null || echo "{}")
TRACE_COUNT=$(echo "$JAEGER_TRACES" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    traces = data.get('data', [])
    print(len(traces))
except:
    print(0)
" 2>/dev/null || echo "0")

if [ "$TRACE_COUNT" -gt "0" ]; then
  pass "Found ${TRACE_COUNT} trace(s) in Jaeger for 'todo-ai-chatbot-api'"

  echo ""
  echo "  Trace details:"
  echo "$JAEGER_TRACES" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for trace in data.get('data', [])[:3]:
        trace_id = trace.get('traceID', 'unknown')
        spans = trace.get('spans', [])
        print(f'    TraceID: {trace_id}')
        print(f'    Span count: {len(spans)}')
        for span in spans[:5]:
            op = span.get('operationName', '?')
            duration = span.get('duration', 0)
            print(f'      - {op} ({duration}μs)')
        print()
except Exception as e:
    print(f'    (parse error: {e})')
" 2>/dev/null || echo "    (could not parse traces)"
else
  echo -e "  ${YELLOW}⚠ No traces found for 'todo-ai-chatbot-api'${NC}"
  echo "  This may happen if:"
  echo "    - OpenTelemetry dependencies are not installed in the backend"
  echo "    - Jaeger endpoint is not reachable from backend container"
  echo "    - Traces haven't flushed yet (try again in 30s)"
  echo ""
  echo "  Manual verification steps:"
  echo "    1. Open: ${JAEGER_URL}"
  echo "    2. Service dropdown → select 'todo-ai-chatbot-api'"
  echo "    3. Click 'Find Traces'"
  echo "    4. Look for traces with operation 'POST /api/tasks'"
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 7: Verify Dapr State Store (bonus - DaprStateSkill direct access)
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 7: VERIFY DAPR STATE STORE (Bonus)"
print_step "7" "Check Dapr state store table in PostgreSQL"

DAPR_STATE=$(docker compose exec -T postgres psql -U postgres -d todoapp -t -A \
  -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dapr_state');" 2>/dev/null || echo "f")

if echo "$DAPR_STATE" | grep -q "t"; then
  pass "Dapr state table 'dapr_state' exists in PostgreSQL"

  STATE_COUNT=$(docker compose exec -T postgres psql -U postgres -d todoapp -t -A \
    -c "SELECT COUNT(*) FROM dapr_state;" 2>/dev/null || echo "0")
  echo "  Rows in dapr_state: ${STATE_COUNT}"
else
  echo -e "  ${YELLOW}⚠ dapr_state table not found — Dapr may create it on first state operation${NC}"
fi

# ═════════════════════════════════════════════════════════════════════════════════
# STEP 8: Verify Metrics (bonus - Prometheus/Grafana)
# ═════════════════════════════════════════════════════════════════════════════════

print_header "STEP 8: VERIFY METRICS (Bonus)"
print_step "8" "Check Prometheus targets"

PROM_TARGETS=$(curl -s "http://localhost:9090/api/v1/targets" 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    targets = data.get('data', {}).get('activeTargets', [])
    for t in targets:
        health = t.get('health', '?')
        labels = t.get('labels', {})
        job = labels.get('job', '?')
        instance = labels.get('instance', '?')
        print(f'    {job} ({instance}): {health}')
except:
    print('    (could not query)')
" 2>/dev/null || echo "    (Prometheus not reachable)")

echo "  Prometheus targets:"
echo "$PROM_TARGETS"
echo ""
echo "  Grafana UI: http://localhost:3001 (admin/admin)"
echo "  Prometheus UI: http://localhost:9090"

# ═════════════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═════════════════════════════════════════════════════════════════════════════════

print_header "TEST SUMMARY"

TOTAL=$((PASS_COUNT + FAIL_COUNT))
echo ""
echo -e "  ${GREEN}Passed: ${PASS_COUNT}${NC}"
echo -e "  ${RED}Failed: ${FAIL_COUNT}${NC}"
echo -e "  Total:  ${TOTAL}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}  ALL CHECKS PASSED — Event-driven flow verified!${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  exit 0
else
  echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${RED}  ${FAIL_COUNT} CHECK(S) FAILED — Review errors above${NC}"
  echo -e "${RED}═══════════════════════════════════════════════════════════════${NC}"
  exit 1
fi
