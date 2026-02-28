# Implementation Plan: Phase V Advanced Features

**Branch**: `003-advanced-features` | **Date**: 2026-02-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-advanced-features/spec.md`

## Summary

Implement all intermediate features (priorities, tags, search/filter/sort, due dates, recurring tasks, reminders) and advanced features (real-time sync, event-driven notifications, analytics dashboard, user preferences, enhanced AI chatbot) on a fully event-driven Dapr + Kafka architecture deployed on DOKS with Helm, replicas >= 2, full OpenTelemetry observability, and circuit breaker resilience.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript strict (frontend)
**Primary Dependencies**: FastAPI, SQLModel, OpenAI Agents SDK, Dapr SDK, Next.js 15+, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL (primary), Dapr State Store (projections), Kafka (events)
**Testing**: pytest (backend), manual verification (frontend)
**Target Platform**: DigitalOcean Kubernetes Service (DOKS)
**Project Type**: Web application (frontend + backend)
**Performance Goals**: p95 < 500ms, Lighthouse >= 90, FCP <= 1.5s, 500 concurrent users
**Constraints**: Dapr sidecar mandatory, no direct Kafka SDK, replicas >= 2, additive-only DB migrations
**Scale/Scope**: 500 concurrent users, 15 Kafka topics, 13 agents, 19 skills

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Agentic Dev Stack Supremacy | PASS | Spec -> Plan -> Tasks -> Implementation workflow followed |
| II | Architectural Separation | PASS | Frontend (Next.js) and Backend (FastAPI) independently deployable |
| III | Event-Driven Architecture | PASS | All state changes emit Kafka events via Dapr Pub/Sub |
| IV | Dapr Sidecar Mandate | PASS | Every service uses Dapr for pub/sub, state, invocation, secrets |
| V | DOKS Deployment | PASS | Helm charts, replicas >= 2, HPA, rolling updates |
| VI | Security by Isolation | PASS | All queries scoped to user_id, RBAC policies |
| VII | OpenAI Agents SDK | PASS | AI logic uses openai-agents SDK exclusively |
| VIII | MCP Tool Exposure | PASS | All task operations exposed as MCP tools |
| IX | Environment & Secrets | PASS | Dapr Secrets Store in prod, .env in dev |
| X | Distributed Observability | PASS | OpenTelemetry traces + Prometheus metrics + JSON logs |
| XI | Circuit Breaker | PASS | All cross-service calls wrapped in CircuitBreakerSkill |
| XII | Backend Evolution | PASS | Additive-only changes, new fields have defaults |
| XIII | Conversation Memory | PASS | Chat history persisted in PostgreSQL |
| XIV | Performance-First Frontend | PASS | Lighthouse >= 90, FCP <= 1.5s targets |
| XV | Animation Minimalism | PASS | Micro-interactions only, 150-250ms, opacity+transform |

**Gate Result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/003-advanced-features/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.md           # REST API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # SQLModel definitions (Task extended, Tag, Reminder)
│   │   ├── task.py      # Extended with priority, due_date, recurrence
│   │   ├── tag.py       # New: Tag model + task_tags junction
│   │   └── reminder.py  # New: Reminder model
│   ├── services/        # Business logic
│   │   ├── task_service.py   # Extended: filters, sort, search
│   │   ├── tag_service.py    # New: Tag CRUD
│   │   ├── reminder_service.py # New: Reminder scheduling
│   │   └── analytics_service.py # New: Analytics queries
│   ├── api/             # FastAPI route handlers
│   │   ├── tasks.py     # Extended: priority, tags, due_date, recurrence params
│   │   ├── tags.py      # New: Tag CRUD endpoints
│   │   ├── reminders.py # New: Reminder endpoints
│   │   ├── analytics.py # New: Analytics endpoint
│   │   └── preferences.py # New: User preferences endpoints
│   ├── events/          # New: Dapr event handlers
│   │   ├── publisher.py # Event publishing via Dapr Pub/Sub
│   │   └── handlers.py  # Event subscription handlers
│   ├── agents/          # OpenAI Agents SDK
│   └── tools/           # MCP tools (extended for new features)
├── tests/
│   ├── unit/
│   └── integration/
├── deploy/              # New: Deployment artifacts
│   ├── helm/
│   ├── manifests/
│   └── dapr/
└── requirements.txt     # Updated with dapr-client, opentelemetry

frontend/
├── src/
│   ├── components/
│   │   ├── tasks/       # Task list, task card, priority badge, tag chips
│   │   ├── calendar/    # Calendar view
│   │   ├── analytics/   # Dashboard charts
│   │   ├── settings/    # Preferences panel
│   │   └── notifications/ # Notification bell, toast
│   ├── app/             # Next.js App Router pages
│   ├── lib/             # API client, WebSocket client
│   └── hooks/           # useWebSocket, useNotifications, usePreferences
└── package.json
```

**Structure Decision**: Web application with frontend/ and backend/ at root. New `deploy/` directory for Helm charts and Dapr component YAMLs. New `backend/src/events/` for Dapr event publishing/handling.

---

# Phase V Execution Plan

## Overview

- Total estimated tasks: 42
- Major milestones: 1. Foundation, 2. Intermediate Features, 3. Advanced Features, 4. Resilience & Observability, 5. Deployment & Production-Readiness
- Parallel tracks: Track A (Backend/Agents), Track B (Frontend UI), Track C (Infrastructure/Deploy)
- Estimated effort: 42-84 hours (1-2 hours per task)

---

## Milestone 1: Foundation (Dapr + Kafka + Event Basics)

### 1. Configure Dapr Components and Kafka Topics
- **Agents**: deployment-orchestrator-agent
- **Skills**: DaprPubSubSkill, DaprStateSkill, DaprSecretsSkill
- **Description**: Create all Dapr component YAML files (pubsub.kafka, statestore.postgresql, secretstore.kubernetes, tracing config) and define all 15 Kafka topics. Place in `deploy/dapr/`.
- **Dependencies**: none
- **Acceptance criteria**:
  - All 15 Kafka topics defined in Dapr subscription YAMLs
  - pubsub.kafka, statestore, secretstore component files present
  - `dapr run` locally validates component loading (no errors)
- **Testing notes**: Run `dapr components list` to verify. Manual check: YAML syntax valid.

### 2. Add Dapr Python SDK and Event Publisher Module
- **Agents**: task-orchestrator-agent
- **Skills**: DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
- **Description**: Add `dapr-client` to requirements.txt. Create `backend/src/events/publisher.py` with a `publish_event(topic, data, trace_context)` function that uses Dapr HTTP API to publish CloudEvents.
- **Dependencies**: Task 1
- **Acceptance criteria**:
  - `dapr-client` in requirements.txt
  - `publisher.py` exports `publish_event()` function
  - Function constructs valid CloudEvents payload with traceparent header
  - Unit test: mock Dapr HTTP and verify correct topic + payload
- **Testing notes**: pytest unit test with mocked Dapr client. Manual: start backend with Dapr sidecar, call publish_event, verify Kafka receives message.

### 3. Add Event Subscription Handler Framework
- **Agents**: task-orchestrator-agent, audit-log-agent
- **Skills**: DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
- **Description**: Create `backend/src/events/handlers.py` with FastAPI routes for Dapr subscription callbacks (`/events/task-created`, `/events/task-updated`, etc.). Register routes in main app.
- **Dependencies**: Task 2
- **Acceptance criteria**:
  - FastAPI routes for all 7 core event topics registered
  - Each handler logs the event and returns 200 OK (stub implementation)
  - Dapr subscription endpoint `/dapr/subscribe` returns topic list
- **Testing notes**: pytest: call handler endpoints with mock CloudEvent payload. Manual: Dapr sidecar discovers subscriptions.

### 4. Wire Event Emission into Existing Task CRUD
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
- **Description**: Modify `task_service.py` to call `publish_event()` after create, update, complete, and delete operations. Events: `task.created`, `task.updated`, `task.completed`, `task.deleted`.
- **Dependencies**: Task 2, Task 3
- **Acceptance criteria**:
  - Creating a task emits `task.created` with full payload
  - Updating a task emits `task.updated` with changed_fields
  - Completing a task emits `task.completed`
  - Deleting a task emits `task.deleted`
  - All events include user_id, task_id, timestamp
- **Testing notes**: pytest: verify publish_event called with correct args after each CRUD op. Manual: create task via API, check Kafka topic.

### 5. Implement WebSocket Server for Real-Time Push
- **Agents**: realtime-sync-agent
- **Skills**: RealtimeBroadcastSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
- **Description**: Add WebSocket endpoint `/ws/{user_id}` to backend. Maintain connection registry (in-memory dict). When events arrive via Dapr handlers, broadcast to the correct user's WebSocket connections.
- **Dependencies**: Task 3
- **Acceptance criteria**:
  - WebSocket endpoint accepts connections at `/ws/{user_id}`
  - Connection registry tracks active connections per user
  - Event handler broadcasts task events to correct user only (isolation)
  - Graceful handling of disconnections (no errors)
- **Testing notes**: Manual: connect two browser tabs, create task in one, verify other receives WS message. pytest: mock WebSocket, verify broadcast logic.

### 6. Frontend WebSocket Client and Real-Time Hook
- **Agents**: realtime-sync-agent
- **Skills**: RealtimeBroadcastSkill, DaprServiceInvocationSkill
- **Description**: Create `frontend/src/hooks/useWebSocket.ts` hook that connects to `/ws/{user_id}`, handles reconnection with exponential backoff, and dispatches received events to update React state.
- **Dependencies**: Task 5
- **Acceptance criteria**:
  - Hook connects on mount, disconnects on unmount
  - Auto-reconnect with backoff (1s, 2s, 4s, 8s, max 30s)
  - Received task events update local state (task list refreshes)
  - Connection status indicator (connected/disconnected)
- **Testing notes**: Manual: kill WebSocket, verify reconnection. Open two tabs, verify sync.

---

## Milestone 2: Intermediate Features

### 7. Extend Task Model with Priority Field
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill
- **Description**: Add `priority` field (str enum: low/medium/high/urgent, default=medium) to Task SQLModel. Extend TaskCreate, TaskUpdate, TaskResponse schemas. Add DB migration (additive only).
- **Dependencies**: Task 4
- **Acceptance criteria**:
  - Task model has `priority` field with default "medium"
  - TaskCreate accepts optional `priority`
  - TaskResponse includes `priority`
  - Existing tasks not broken (default applied)
  - `task.created` and `task.updated` events include priority
- **Testing notes**: pytest: create task with/without priority, verify default. Manual: API call with priority=high.

### 8. Frontend Priority Selector and Visual Indicators
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, RealtimeBroadcastSkill
- **Description**: Add priority dropdown to task create/edit form. Add color-coded priority badge to task cards (green=low, yellow=medium, orange=high, red=urgent). Add sort-by-priority option.
- **Dependencies**: Task 7, Task 6
- **Acceptance criteria**:
  - Priority selector visible on task form with 4 options
  - Task cards display colored priority badge
  - Sort by priority option works (urgent -> high -> medium -> low)
  - Real-time updates reflect priority changes
- **Testing notes**: Manual: create tasks with different priorities, sort, verify colors and order.

### 9. Create Tag Model and CRUD API
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
- **Description**: Create `backend/src/models/tag.py` (Tag SQLModel: id, user_id, name, color). Create task_tags junction table. Create `backend/src/services/tag_service.py` and `backend/src/api/tags.py` with POST/GET/DELETE endpoints.
- **Dependencies**: Task 4
- **Acceptance criteria**:
  - Tag model with id, user_id, name, color fields
  - task_tags junction table links tasks to tags (many-to-many)
  - POST /tags creates a tag, GET /tags lists user's tags, DELETE /tags/{id} removes
  - Tags scoped to user_id (isolation)
- **Testing notes**: pytest: CRUD operations on tags. Manual: create tag via API, list, delete.

### 10. Wire Tags into Task Model and API
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill
- **Description**: Extend TaskCreate/TaskUpdate to accept optional `tag_ids` list. Extend TaskResponse to include tags array. Extend task CRUD to manage tag associations. Add `tag` query param to GET /tasks for filtering.
- **Dependencies**: Task 9, Task 7
- **Acceptance criteria**:
  - Creating a task with tag_ids assigns tags
  - Updating a task can add/remove tags
  - TaskResponse includes full tag objects
  - GET /tasks?tag=work filters by tag name
  - `task.created` and `task.updated` events include tags
- **Testing notes**: pytest: create task with tags, filter by tag. Manual: verify tag filter returns correct tasks.

### 11. Frontend Tag Management and Filter UI
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, RealtimeBroadcastSkill
- **Description**: Create tag management panel (create tag with name + color picker). Add multi-select tag chips to task form. Add tag filter bar on task list. Display colored chips on task cards.
- **Dependencies**: Task 10, Task 8
- **Acceptance criteria**:
  - Tag creation form with name + color picker
  - Multi-select tag chips on task form
  - Tag filter bar: click tag to filter task list
  - Colored chips displayed on task cards
- **Testing notes**: Manual: create tags, assign to tasks, filter, verify rendering.

### 12. Extend Task Model with Due Date and Recurrence Fields
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill
- **Description**: Add `due_date` (datetime | None), `recurrence_type` (str: none/daily/weekly/monthly, default=none), `recurrence_interval` (int, default=1) to Task model. Extend schemas and events.
- **Dependencies**: Task 7
- **Acceptance criteria**:
  - Task model has due_date, recurrence_type, recurrence_interval fields
  - All fields have defaults (backward compatible)
  - TaskCreate/TaskUpdate accept optional due_date and recurrence fields
  - TaskResponse includes all new fields
  - Events include due_date and recurrence data
- **Testing notes**: pytest: create task with due_date and recurrence, verify stored correctly.

### 13. Frontend Due Date Picker and Calendar View
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, RealtimeBroadcastSkill
- **Description**: Add date picker component to task form. Create calendar view page showing tasks plotted on dates. Add overdue indicator (red) for past-due tasks. Add quick filters: Today, This Week, Overdue.
- **Dependencies**: Task 12, Task 8
- **Acceptance criteria**:
  - Date picker on task create/edit form
  - Calendar page shows task dots on dates
  - Overdue tasks have red indicator
  - Quick filter buttons work correctly
- **Testing notes**: Manual: set due dates, view calendar, check overdue highlighting.

### 14. Implement Advanced Search, Filter, and Sort API
- **Agents**: task-orchestrator-agent, event-sourcing-projection-agent
- **Skills**: TaskCRUDSkill, DaprStateSkill, OpenTelemetryTracingSkill, PerformanceMetricsSkill
- **Description**: Extend GET /tasks with: `q` (keyword search), `priority`, `tag`, `status`, `due_before`, `due_after`, `sort_by`, `sort_order`, `page`, `limit` query params. Implement in task_service.py.
- **Dependencies**: Task 10, Task 12
- **Acceptance criteria**:
  - Keyword search on task title (case-insensitive ILIKE)
  - Filter by priority, tag, status, due_date range (all combinable)
  - Sort by created_at, due_date, priority, title (asc/desc)
  - Pagination with page + limit (default 50)
  - Returns within 1 second for 1000 tasks
- **Testing notes**: pytest: query with various filter combos, verify correct results. Performance: time query with 1000 tasks.

### 15. Frontend Search Bar and Filter Panel
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, RealtimeBroadcastSkill, PerformanceMetricsSkill
- **Description**: Add search bar with 300ms debounce. Add filter panel (priority dropdown, tag multiselect, status toggle, date range). Add sort selector. Add active filter chips. Add result count.
- **Dependencies**: Task 14, Task 11, Task 13
- **Acceptance criteria**:
  - Search bar with debounced input
  - Filter panel with all filter types
  - Active filter chips (click to remove)
  - Sort selector with all options
  - Result count displayed
- **Testing notes**: Manual: search, apply filters, sort, verify results match.

### 16. Implement Recurring Task Agent Logic
- **Agents**: recurring-task-agent, task-orchestrator-agent
- **Skills**: RecurringRuleEvaluationSkill, DaprPubSubSkill, DaprServiceInvocationSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
- **Description**: Implement event handler for `task.completed`: check recurrence_type, calculate next due_date using RecurringRuleEvaluationSkill, invoke task-orchestrator to create next occurrence via DaprServiceInvocationSkill.
- **Dependencies**: Task 12, Task 4
- **Acceptance criteria**:
  - Daily: next due_date = original + 1 day
  - Weekly: next due_date = original + 7 days
  - Monthly: next due_date = original + 1 month (handles month-end)
  - New task inherits title, priority, tags, recurrence rule
  - Idempotent: processing same event twice creates only one task
  - CircuitBreaker wraps service invocation
- **Testing notes**: pytest: mock completed event with recurrence, verify new task created with correct date. Edge case: Jan 31 monthly -> Feb 28.

### 17. Frontend Recurring Task Selector and Indicators
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, RealtimeBroadcastSkill
- **Description**: Add recurrence selector (None/Daily/Weekly/Monthly) to task form. Add recurring icon indicator on task cards. Show "Next occurrence" info.
- **Dependencies**: Task 12, Task 8
- **Acceptance criteria**:
  - Recurrence dropdown on task form
  - Recurring tasks show icon on task card
  - Completing a recurring task shows "Next occurrence created" message
- **Testing notes**: Manual: create recurring task, complete it, verify new task appears.

### 18. Create Reminder Model and Scheduling API
- **Agents**: reminder-scheduler-agent
- **Skills**: ReminderSchedulingSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill
- **Description**: Create `backend/src/models/reminder.py` (id, task_id, user_id, reminder_time, status). Create `backend/src/api/reminders.py` (POST, DELETE). Implement reminder scheduling via Dapr Jobs API or time-delayed events.
- **Dependencies**: Task 12, Task 3
- **Acceptance criteria**:
  - Reminder model with correct fields
  - POST /reminders creates a scheduled reminder
  - DELETE /reminders/{id} cancels a pending reminder
  - Reminder fires at scheduled time and emits `reminder.due` event
  - Task deletion/completion cancels associated reminders
- **Testing notes**: pytest: create reminder, verify stored. Integration: schedule reminder 10 seconds out, verify event fires.

### 19. Implement Reminder Event Handler and Auto-Schedule
- **Agents**: reminder-scheduler-agent, user-preference-agent
- **Skills**: ReminderSchedulingSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprStateSkill, CircuitBreakerSkill
- **Description**: When `task.created` event arrives with due_date, auto-schedule a reminder using user's preferred offset (query user-preference-agent). When `task.completed` or `task.deleted`, cancel pending reminders.
- **Dependencies**: Task 18, Task 4
- **Acceptance criteria**:
  - task.created with due_date triggers reminder auto-creation
  - Reminder offset fetched from user preferences (default 15 min)
  - task.completed cancels pending reminders for that task
  - task.deleted cancels pending reminders for that task
- **Testing notes**: pytest: mock task.created event with due_date, verify reminder created. Mock task.completed, verify reminder cancelled.

### 20. Frontend Reminder Toggle and Notification UI
- **Agents**: notification-agent, realtime-sync-agent
- **Skills**: NotificationDispatchSkill, RealtimeBroadcastSkill, DaprPubSubSkill
- **Description**: Add reminder toggle + offset selector on task form. Create notification bell icon with unread count badge. Create notification toast component. Create notification panel dropdown.
- **Dependencies**: Task 18, Task 6
- **Acceptance criteria**:
  - Reminder toggle with offset selector (15min, 30min, 1hr, 1day)
  - Bell icon shows unread count
  - Toast appears when reminder fires (via WebSocket)
  - Notification panel lists recent notifications
- **Testing notes**: Manual: set reminder, wait for it to fire, verify toast and bell update.

---

## Milestone 3: Advanced Features

### 21. Implement Notification Agent Event Handler
- **Agents**: notification-agent, user-preference-agent
- **Skills**: NotificationDispatchSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprSecretsSkill, CircuitBreakerSkill
- **Description**: Implement handler for `reminder.due` events: query user preferences for channel, format notification, deliver via WebSocket (in-app) and optionally email (SMTP via Dapr secrets). Emit `notification.sent`.
- **Dependencies**: Task 19, Task 5
- **Acceptance criteria**:
  - reminder.due event triggers notification delivery
  - In-app notification pushed via WebSocket
  - notification.sent event emitted after delivery
  - Idempotent: same event processed twice sends only once
  - Delivery within 5 seconds of event receipt
- **Testing notes**: pytest: mock reminder.due, verify notification dispatched and event emitted. Manual: trigger reminder, verify toast.

### 22. Implement User Preferences API and Agent
- **Agents**: user-preference-agent
- **Skills**: DaprStateSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprSecretsSkill, OpenTelemetryTracingSkill
- **Description**: Create `backend/src/api/preferences.py` with GET /preferences and PATCH /preferences. Store in Dapr State Store or database. Emit `user.preference.changed` event. Serve preference queries from other agents.
- **Dependencies**: Task 2
- **Acceptance criteria**:
  - GET /preferences returns current user preferences
  - PATCH /preferences updates specific keys
  - Default values for all preferences (notification_channel, timezone, reminder_offset, default_priority, sort_order, theme)
  - user.preference.changed event emitted on update
  - Other agents can query preferences via Dapr service invocation
- **Testing notes**: pytest: get/update preferences. Manual: change preference, verify event emitted.

### 23. Frontend Settings Page
- **Agents**: user-preference-agent
- **Skills**: DaprStateSkill, DaprServiceInvocationSkill
- **Description**: Create settings page with sections: Notifications (channel selector), Task Defaults (priority, sort), Display (timezone), Theme (light/dark toggle). Save on change with optimistic UI.
- **Dependencies**: Task 22, Task 6
- **Acceptance criteria**:
  - Settings page with all sections rendered
  - Changes save immediately (optimistic UI)
  - Theme toggle switches light/dark mode
  - Preferences persist across sessions
- **Testing notes**: Manual: change each preference, refresh page, verify persistence.

### 24. Implement Analytics Projections
- **Agents**: event-sourcing-projection-agent
- **Skills**: ProjectionBuildSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill
- **Description**: Implement event handlers that consume task.* events and build projections: completion-by-day, tasks-by-priority-count, tasks-by-tag-count, streak-tracker. Store in Dapr State Store.
- **Dependencies**: Task 4
- **Acceptance criteria**:
  - task.completed updates daily completion count and streak
  - task.created/updated updates priority and tag distribution counts
  - Projections queryable from Dapr State Store
  - Projection rebuilds correctly from event replay
  - projection.updated event emitted after each build
- **Testing notes**: pytest: process series of events, verify projection state. Manual: complete tasks, query projections.

### 25. Create Analytics API Endpoint
- **Agents**: event-sourcing-projection-agent, observability-agent
- **Skills**: DaprStateSkill, PerformanceMetricsSkill, OpenTelemetryTracingSkill
- **Description**: Create `backend/src/api/analytics.py` with GET /analytics endpoint returning: completion_today, completion_week, completion_month, streak, priority_distribution, tag_distribution, trends.
- **Dependencies**: Task 24
- **Acceptance criteria**:
  - GET /analytics returns all metrics
  - Data sourced from projections (fast reads)
  - Response within 500ms
  - Scoped to authenticated user_id
- **Testing notes**: pytest: mock Dapr state reads, verify response shape. Manual: call endpoint after completing tasks.

### 26. Frontend Analytics Dashboard
- **Agents**: event-sourcing-projection-agent
- **Skills**: PerformanceMetricsSkill, RealtimeBroadcastSkill
- **Description**: Create analytics dashboard page with: stat cards (Today, Week, Month, Streak, Overdue), line chart (completion trend), pie chart (priority distribution), bar chart (tag distribution). Use lightweight chart library.
- **Dependencies**: Task 25, Task 6
- **Acceptance criteria**:
  - Dashboard page loads with all chart types
  - Stat cards show accurate counts
  - Charts render with real data
  - Real-time updates via WebSocket when new events arrive
  - Responsive layout for mobile
- **Testing notes**: Manual: complete tasks, verify dashboard updates. Check mobile responsiveness.

### 27. Extend AI Chatbot for Advanced Features
- **Agents**: task-orchestrator-agent
- **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
- **Description**: Add new MCP tools to the OpenAI Agents SDK for: set_priority, assign_tags, set_due_date, set_recurrence, query_analytics, update_preferences. Update agent prompt to handle new commands.
- **Dependencies**: Task 10, Task 12, Task 22, Task 25
- **Acceptance criteria**:
  - "Add high-priority task: fix bug" creates task with priority=high
  - "Tag task X as work" assigns tag
  - "Set task X due Friday" sets due date
  - "Make task X recurring weekly" sets recurrence
  - "How productive was I this week?" returns analytics summary
  - Agent responds conversationally for all new features
- **Testing notes**: Manual: test each natural language command through chat interface. Verify correct tool invocation.

### 28. Implement Audit Log Agent
- **Agents**: audit-log-agent
- **Skills**: AuditPersistenceSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
- **Description**: Implement event handlers that consume ALL domain events and write immutable audit records (event_type, user_id, payload, trace_id, timestamp) to Dapr State Store or audit_logs table.
- **Dependencies**: Task 3
- **Acceptance criteria**:
  - Every domain event creates an audit record
  - Records are append-only (no updates, no deletes)
  - Each record includes trace_id for correlation
  - Idempotent: duplicate event creates only one record
- **Testing notes**: pytest: process events, verify audit records. Manual: perform task operations, query audit log.

---

## Milestone 4: Resilience, Observability & AIOps

### 29. Implement Failure Handler Agent
- **Agents**: failure-handler-agent
- **Skills**: FailurePersistenceSkill, RetrySchedulerSkill, DaprPubSubSkill, DaprStateSkill, CircuitBreakerSkill
- **Description**: Implement handler for `operation.failed` events: persist failure record, check circuit breaker state, emit `retry.scheduled` with exponential backoff (1s, 2s, 4s, 8s, 16s, max 5 attempts). On exhaustion, emit `alert.triggered`.
- **Dependencies**: Task 3
- **Acceptance criteria**:
  - operation.failed event triggers failure record creation
  - Backoff schedule: 1s, 2s, 4s, 8s, 16s
  - retry.scheduled emitted with correct backoff_ms
  - After 5 failures: retry.exhausted -> alert.triggered
  - Circuit breaker state checked before scheduling retry
- **Testing notes**: pytest: process failure event, verify retry scheduled with correct backoff. Process 6 failures, verify alert triggered.

### 30. Implement Retry Scheduler Agent
- **Agents**: retry-scheduler-agent
- **Skills**: RetrySchedulerSkill, FailurePersistenceSkill, DaprPubSubSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
- **Description**: Implement handler for `retry.scheduled`: wait for backoff interval, re-emit the original event. If max retries exceeded, emit `retry.exhausted`.
- **Dependencies**: Task 29
- **Acceptance criteria**:
  - retry.scheduled triggers delayed re-emission of original event
  - Backoff interval respected (within 500ms tolerance)
  - retry.exhausted emitted when attempt > max_attempts
  - Original event payload preserved exactly
  - Trace context propagated across retries
- **Testing notes**: pytest: mock retry.scheduled, verify re-emission after delay. Test exhaustion path.

### 31. Implement Circuit Breaker Wrapper
- **Agents**: failure-handler-agent, task-orchestrator-agent
- **Skills**: CircuitBreakerSkill, DaprServiceInvocationSkill, OpenTelemetryTracingSkill
- **Description**: Create a reusable circuit breaker wrapper (`backend/src/resilience/circuit_breaker.py`) that wraps any async callable. States: closed (normal), open (failing, reject calls), half-open (probe). Config: max_failures=5, reset_timeout=30s.
- **Dependencies**: Task 2
- **Acceptance criteria**:
  - After 5 consecutive failures: circuit opens (rejects calls immediately)
  - After 30s: circuit enters half-open (allows 1 probe)
  - Successful probe: circuit closes
  - Failed probe: circuit re-opens
  - Metrics: circuit state observable
- **Testing notes**: pytest: simulate 5 failures, verify circuit opens. Wait 30s (mocked), verify half-open. Test recovery.

### 32. Add OpenTelemetry Tracing to All Services
- **Agents**: observability-agent
- **Skills**: OpenTelemetryTracingSkill, DaprMonitoringSkill, PerformanceMetricsSkill
- **Description**: Add OpenTelemetry SDK to backend. Instrument FastAPI (auto-instrument), SQLAlchemy, HTTP clients. Add trace context propagation to Dapr events. Export to Jaeger collector.
- **Dependencies**: Task 2
- **Acceptance criteria**:
  - Every API request creates/propagates a trace
  - Dapr events carry traceparent header
  - Traces visible in Jaeger (or stdout in dev)
  - Spans: HTTP request -> service call -> DB query -> event publish
  - W3C Trace Context headers propagated
- **Testing notes**: Manual: make API call, verify trace in Jaeger output. Check traceparent in Kafka events.

### 33. Add Prometheus Metrics Export
- **Agents**: observability-agent, scalability-observer-agent
- **Skills**: PerformanceMetricsSkill, DaprMonitoringSkill, OpenTelemetryTracingSkill
- **Description**: Add Prometheus metrics endpoint `/metrics` to backend. Export: request_count, request_duration_seconds, event_publish_count, event_consume_count, circuit_breaker_state, active_websocket_connections.
- **Dependencies**: Task 32
- **Acceptance criteria**:
  - /metrics endpoint returns Prometheus-format metrics
  - Key metrics: request count, latency histogram, event counts
  - Circuit breaker state metric
  - WebSocket connection count metric
- **Testing notes**: Manual: call /metrics, verify output format. Load test and check metric values change.

### 34. Implement Observability Agent Dashboard Data
- **Agents**: observability-agent
- **Skills**: DaprMonitoringSkill, PerformanceMetricsSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
- **Description**: Implement observability agent that: checks Dapr sidecar health, aggregates metrics, detects anomalies (p95 > 500ms, error > 1%), emits `anomaly.detected`.
- **Dependencies**: Task 33, Task 3
- **Acceptance criteria**:
  - Dapr sidecar health checked periodically
  - anomaly.detected emitted when thresholds breached
  - Aggregated metrics available for dashboard consumption
- **Testing notes**: pytest: mock metrics above threshold, verify anomaly event. Manual: overload service, check anomaly detection.

### 35. Implement Scalability Observer Agent
- **Agents**: scalability-observer-agent
- **Skills**: PerformanceMetricsSkill, DaprMonitoringSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
- **Description**: Implement agent that monitors CPU/memory/request metrics and emits `scale.recommendation` when scaling thresholds are met (CPU > 70%, memory > 80%).
- **Dependencies**: Task 33
- **Acceptance criteria**:
  - Monitors Prometheus metrics for CPU and memory
  - Emits scale.recommendation with current_replicas and recommended_replicas
  - Respects minimum replicas >= 2
  - Recommends scale-down when CPU < 20% for 10+ minutes
- **Testing notes**: pytest: mock metrics at threshold, verify recommendation. Manual: load test and check scaling events.

---

## Milestone 5: Deployment Blueprint & DOKS Readiness

### 36. Generate Helm Charts for Backend Service
- **Agents**: deployment-orchestrator-agent
- **Skills**: DOKSDeploymentBlueprintSkill, DaprSecretsSkill, OpenTelemetryTracingSkill
- **Description**: Create Helm chart for backend: Deployment (replicas=2, Dapr annotations, resource limits, liveness/readiness probes), Service, HPA (minReplicas=2, maxReplicas=10, targetCPU=70%), ConfigMap.
- **Dependencies**: Task 1
- **Acceptance criteria**:
  - `helm lint` passes
  - `helm template` produces valid K8s manifests
  - Deployment includes Dapr annotations (dapr.io/enabled, app-id, app-port)
  - HPA configured with min=2, max=10
  - Resource requests and limits defined
  - Liveness probe on /api/health, readiness probe on /api/health
- **Testing notes**: Run `helm lint deploy/helm/backend`. Run `helm template` and validate YAML.

### 37. Generate Helm Charts for Frontend Service
- **Agents**: deployment-orchestrator-agent
- **Skills**: DOKSDeploymentBlueprintSkill, DaprSecretsSkill
- **Description**: Create Helm chart for frontend: Deployment (replicas=2), Service, HPA, Ingress with TLS. Dapr sidecar for service invocation to backend.
- **Dependencies**: Task 36
- **Acceptance criteria**:
  - Helm lint passes
  - Frontend Deployment with replicas=2 and Dapr annotations
  - Ingress with TLS termination configured
  - HPA with appropriate thresholds
- **Testing notes**: Run `helm lint deploy/helm/frontend`. Validate template output.

### 38. Generate Kafka and Infrastructure Helm Charts
- **Agents**: deployment-orchestrator-agent
- **Skills**: DOKSDeploymentBlueprintSkill, DaprPubSubSkill, DaprStateSkill
- **Description**: Create Helm chart for Kafka (Strimzi operator), Jaeger, Prometheus. Include Dapr component installation. Create namespace and RBAC manifests.
- **Dependencies**: Task 36
- **Acceptance criteria**:
  - Strimzi Kafka cluster definition with topic auto-creation
  - Jaeger all-in-one deployment
  - Prometheus deployment with scrape configs
  - Dapr component installation manifests
  - Namespace: todo-app
  - RBAC: service accounts per service
- **Testing notes**: Validate all manifests with `kubectl --dry-run=client`.

### 39. Create Deployment Automation Script [BONUS: Blueprints]
- **Agents**: deployment-orchestrator-agent
- **Skills**: DOKSDeploymentBlueprintSkill, DaprSecretsSkill, PerformanceMetricsSkill, CircuitBreakerSkill
- **Description**: Create deployment script that: builds Docker images, pushes to registry, runs helm install/upgrade, monitors rollout, supports rollback. Create `deploy/deploy.sh`.
- **Dependencies**: Task 36, Task 37, Task 38
- **Acceptance criteria**:
  - Script builds and pushes Docker images
  - Script runs helm install/upgrade for all charts
  - Script monitors rollout status (kubectl rollout status)
  - Script supports `--rollback` flag
  - Script validates post-deploy health checks
- **Testing notes**: Dry-run the script. Manual: deploy to DOKS cluster.

### 40. Document All Skills with Examples [BONUS: Reusable Intelligence]
- **Agents**: observability-agent
- **Skills**: All skills documented
- **Description**: Update every `.claude/skills/*/skill.md` file to include: Purpose, API signature, Usage examples (2-3), Swap instructions (how to change backing service), Unit test template.
- **Dependencies**: none (can run in parallel)
- **Acceptance criteria**:
  - All 19 skill files have: Purpose, Key Features, Usage Examples, Swap Instructions
  - Each skill demonstrates swappability (e.g., Kafka -> Redis via Dapr config)
  - Examples are copy-pasteable Python code
- **Testing notes**: Manual: review each skill file for completeness.

---

## Final Validation & Demo Preparation

### 41. End-to-End Integration Test
- **Agents**: task-orchestrator-agent, reminder-scheduler-agent, notification-agent, recurring-task-agent, audit-log-agent, realtime-sync-agent
- **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, ReminderSchedulingSkill, NotificationDispatchSkill, RealtimeBroadcastSkill, AuditPersistenceSkill, OpenTelemetryTracingSkill
- **Description**: Write and run end-to-end test covering: create task with priority + tags + due_date + recurrence -> verify event emitted -> verify reminder scheduled -> complete task -> verify recurring task created -> verify audit log -> verify real-time sync -> verify analytics updated.
- **Dependencies**: All previous tasks
- **Acceptance criteria**:
  - Full event chain: create -> schedule reminder -> complete -> recurse -> audit
  - All 13 agents participate in the flow
  - End-to-end trace visible (single trace_id across all services)
  - All WebSocket clients receive updates
  - Analytics projections reflect changes within 30s
- **Testing notes**: Run full scenario manually. Verify in Jaeger. Check all Kafka topics received events.

### 42. 90-Second Demo Script
- **Agents**: deployment-orchestrator-agent
- **Skills**: DOKSDeploymentBlueprintSkill, PerformanceMetricsSkill
- **Description**: Write a demo script document (`specs/003-advanced-features/demo-script.md`) covering: (1) Show DOKS cluster with helm list (10s), (2) Create task via chatbot with priority+tags+due date (15s), (3) Show real-time sync across two tabs (10s), (4) Complete recurring task, show auto-creation (15s), (5) Show reminder notification firing (10s), (6) Show analytics dashboard (10s), (7) Show Jaeger trace (10s), (8) Show Helm chart + skill documentation (10s).
- **Dependencies**: Task 41
- **Acceptance criteria**:
  - Demo script fits in 90 seconds
  - Covers all major features
  - Highlights bonus points (Blueprints + Reusable Intelligence)
  - Includes backup plan if something fails
- **Testing notes**: Practice run-through. Time it.

---

## Parallel Execution Tracks

| Track | Tasks | Description |
|-------|-------|-------------|
| A: Backend Core | 2, 3, 4, 7, 9, 10, 12, 14, 16, 18, 19, 21, 22, 24, 25, 27, 28 | Backend models, services, APIs, event handlers |
| B: Frontend UI | 6, 8, 11, 13, 15, 17, 20, 23, 26 | React components, hooks, pages |
| C: Infrastructure | 1, 31, 32, 33, 36, 37, 38, 39, 40 | Dapr config, tracing, Helm, deployment |
| D: Resilience | 29, 30, 34, 35 | Failure handling, retry, observability |

**Safe parallelism**: Track B can start after Task 6 (WebSocket hook). Track C can start immediately. Track D can start after Task 3.

## Complexity Tracking

> No Constitution Check violations. All 15 gates PASS.

| Potential Concern | Resolution |
|-------------------|------------|
| 15 Kafka topics | Manageable with Dapr abstractions, no direct Kafka SDK |
| 13 agents | Agents are event handlers, not separate services — all run in backend process |
| Database migrations | All additive-only: ADD COLUMN with defaults, new tables |
| WebSocket + Dapr | WebSocket managed by backend, events from Dapr trigger broadcast |
