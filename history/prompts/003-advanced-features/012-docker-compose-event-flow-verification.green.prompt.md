---
id: 012
title: Docker Compose Event Flow Verification
stage: green
date: 2026-02-12
surface: agent
model: claude-opus-4-6
feature: 003-advanced-features
branch: 003-advanced-features
user: Asad Shabir
command: sp.tasks
labels: ["docker-compose", "testing", "verification", "dapr", "kafka", "jaeger", "event-driven"]
links:
  spec: specs/003-advanced-features/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - test-event-flow.sh
  - VERIFICATION_GUIDE.md
  - deploy/prometheus/prometheus.yml
tests:
  - POST /api/tasks returns HTTP 201 Created with task ID
  - Task retrievable via GET /api/tasks/{id} and directly in PostgreSQL
  - Kafka topic task.created receives CloudEvent with specversion 1.0
  - Jaeger UI shows distributed trace with POST /api/tasks root span
  - No critical errors in app logs, Dapr sidecar logs, or Kafka logs
  - Prometheus targets configured for backend and Dapr sidecars
---

## Prompt

You are now STRICTLY in IMPLEMENTATION MODE for Hackathon II Phase V - Part B (Local Docker Compose Stack Verification).

Execute **ONLY** this one task:

**Task #3: Test Docker Compose stack with sample events**

Goal: Create a complete, standalone VERIFICATION GUIDE (with bash commands, curl examples, docker exec commands, log greps, and browser steps) that proves the full event-driven flow works in the local stack:
1. Create a new todo task via API -> task stored in PostgreSQL state via Dapr
2. Task creation emits a valid CloudEvent to Kafka topic "task.created"
3. Downstream agents consume/process the event (audit log entry, projection update, etc.)
4. Full distributed trace is visible in Jaeger with proper span names and propagation
5. No errors in app logs, Dapr sidecar logs, or Kafka logs

Agents: task-orchestrator-agent, observability-agent
Skills: DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill

## Response snapshot

Created three deliverables for Task #3:

1. **test-event-flow.sh** - Automated bash verification script that performs all 8 verification steps:
   - Prerequisites check (docker compose ps, backend health)
   - Auth: Sign up test user and extract JWT token
   - Create task via POST /api/tasks with auth cookie
   - Verify task in PostgreSQL via API and direct DB query
   - Verify CloudEvent on Kafka task.created topic via kafka-console-consumer
   - Verify event processing in backend/Dapr logs
   - Query Jaeger API for distributed traces
   - Check Dapr state table and Prometheus metrics
   - Reports PASS/FAIL for each check with color-coded output

2. **VERIFICATION_GUIDE.md** - Comprehensive step-by-step manual verification guide with:
   - Prerequisites section with exact commands
   - 8 numbered steps with exact curl commands, docker exec commands, and expected output
   - Troubleshooting quick reference table
   - Complete verification checklist

3. **deploy/prometheus/prometheus.yml** - Prometheus scrape config for backend metrics, Dapr sidecar metrics, and self-monitoring (required by docker-compose.yml volume mount)

## Outcome

- Impact: Complete verification toolkit for validating the Docker Compose event-driven stack end-to-end
- Tests: All 6 acceptance criteria are verifiable with provided commands and expected outputs
- Files: 3 files created (test script, guide, prometheus config)
- Next prompts: Task #4 - Configure Vercel frontend deployment
- Reflection: Adapted curl commands to use actual API structure (/api/auth/signup, /api/tasks) and JWT cookie-based auth (access_token cookie) based on codebase analysis

## Evaluation notes (flywheel)

- Failure modes observed: None - all verification steps aligned with actual codebase API structure
- Graders run and results (PASS/FAIL): All acceptance criteria have corresponding verification commands
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Execute test-event-flow.sh against running stack to validate all checks pass
