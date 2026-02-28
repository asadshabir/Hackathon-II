 make # Tasks: Phase V Advanced Features

**Input**: Design documents from `/specs/003-advanced-features/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md
**Branch**: `003-advanced-features` | **Date**: 2026-02-09

**Tests**: Included per user instruction — pytest unit tests covering happy path + edge cases required for each backend task.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing.

**Mandatory Agents**: task-orchestrator-agent, reminder-scheduler-agent, recurring-task-agent, notification-agent, realtime-sync-agent, audit-log-agent, failure-handler-agent, retry-scheduler-agent, observability-agent, event-sourcing-projection-agent, scalability-observer-agent, user-preference-agent, deployment-orchestrator-agent

**Mandatory Skills**: DaprPubSubSkill, DaprStateSkill, DaprServiceInvocationSkill, DaprSecretsSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill, DOKSDeploymentBlueprintSkill, TaskCRUDSkill, TaskEventEmitSkill, NotificationDispatchSkill, RealtimeBroadcastSkill, ReminderSchedulingSkill, RecurringRuleEvaluationSkill, RetrySchedulerSkill, FailurePersistenceSkill, AuditPersistenceSkill, DaprMonitoringSkill, PerformanceMetricsSkill, ProjectionBuildSkill

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US11)
- Exact file paths included in every task description

## Task Rules (from user)

1. Every inter-service call -> DaprServiceInvocationSkill + CircuitBreakerSkill + OpenTelemetryTracingSkill
2. Every state read/write -> DaprStateSkill (with ETag where concurrency matters)
3. Every event publish -> DaprPubSubSkill + TaskEventEmitSkill + valid CloudEvents 1.0 format
4. Every secret usage -> DaprSecretsSkill
5. Real-time frontend updates -> RealtimeBroadcastSkill
6. All code MUST have complete mypy type hints
7. Write pytest unit tests covering happy path + edge cases

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Dapr components, event backbone, and foundational packages required by ALL user stories.

- [X] T001 [P] Configure Dapr component YAMLs (pubsub.kafka, statestore.postgresql, secretstore.kubernetes, tracing config) in `deploy/dapr/components/pubsub.yaml`, `deploy/dapr/components/statestore.yaml`, `deploy/dapr/components/secretstore.yaml`, `deploy/dapr/config/tracing.yaml`
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DaprPubSubSkill, DaprStateSkill, DaprSecretsSkill
  - **Acceptance**: All 4 YAML files valid, `dapr components list` loads them without errors

- [X] T002 [P] Add Dapr, OpenTelemetry, and Prometheus dependencies to `backend/requirements.txt` (dapr-client, opentelemetry-api, opentelemetry-sdk, opentelemetry-instrumentation-fastapi, opentelemetry-exporter-otlp, prometheus-client)
  - **Agent**: task-orchestrator-agent
  - **Skills**: DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Acceptance**: `pip install -r requirements.txt` succeeds with all new packages

- [X] T003 [P] Create Dapr subscription YAML definitions for all 15 Kafka topics with dead-letter topics in `deploy/dapr/subscriptions/subscriptions.yaml`
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DaprPubSubSkill
  - **Acceptance**: All 15 topics defined with routes and dead-letter topics

- [X] T004 Create event publisher module at `backend/src/events/publisher.py` with `publish_event(topic: str, data: dict, trace_context: dict | None = None) -> None` function using Dapr HTTP API, CloudEvents 1.0 format, traceparent propagation
  - **Agent**: task-orchestrator-agent
  - **Skills**: DaprPubSubSkill, TaskEventEmitSkill, OpenTelemetryTracingSkill
  - **Acceptance**: Function constructs valid CloudEvents payload, includes traceparent, unit test mocks Dapr HTTP and verifies correct topic + payload
  - **Test**: `backend/tests/unit/test_publisher.py`

- [X] T005 Create event subscription handler framework at `backend/src/events/handlers.py` with FastAPI routes for `/dapr/subscribe`, `/events/task-created`, `/events/task-updated`, `/events/task-completed`, `/events/task-deleted`, `/events/reminder-due`, `/events/notification-sent`, `/events/preference-changed`. Register routes in `backend/src/main.py`
  - **Agent**: task-orchestrator-agent, audit-log-agent
  - **Skills**: DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
  - **Depends on**: T004
  - **Acceptance**: `/dapr/subscribe` returns topic list, each handler returns 200 OK (stub), pytest verifies handler registration
  - **Test**: `backend/tests/unit/test_handlers.py`

- [X] T006 Wire event emission into existing task CRUD — modify `backend/src/services/task_service.py` to call `publish_event()` after create, update, complete, and delete operations. Events: task.created, task.updated, task.completed, task.deleted
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T004, T005
  - **Acceptance**: Each CRUD op emits correct CloudEvent with user_id, task_id, timestamp; unit tests verify publish_event called with correct args
  - **Test**: `backend/tests/unit/test_task_service_events.py`

- [X] T007 Implement WebSocket server endpoint at `backend/src/api/websocket.py` — `/ws/{user_id}` with in-memory connection registry, broadcast function per user_id, graceful disconnect handling. Register in `backend/src/main.py`
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T005
  - **Acceptance**: WebSocket accepts connections, registry tracks per user, broadcast only to correct user (isolation), graceful disconnect
  - **Test**: `backend/tests/unit/test_websocket.py`

- [X] T008 Create circuit breaker wrapper at `backend/src/resilience/circuit_breaker.py` — `AsyncCircuitBreaker` class with closed/open/half-open states, max_failures=5, reset_timeout=30s, metrics observable
  - **Agent**: failure-handler-agent
  - **Skills**: CircuitBreakerSkill, OpenTelemetryTracingSkill
  - **Acceptance**: After 5 failures circuit opens, after 30s enters half-open, successful probe closes, failed probe re-opens
  - **Test**: `backend/tests/unit/test_circuit_breaker.py`

- [X] T009 Create frontend WebSocket client hook at `frontend/src/hooks/useWebSocket.ts` — connects to `/ws/{user_id}`, auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, max 30s), dispatches received events to React state, connection status indicator
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T007
  - **Acceptance**: Connects on mount, disconnects on unmount, reconnects with backoff, received events update local state

**Checkpoint**: Foundation ready — event backbone, WebSocket, circuit breaker operational. User story implementation can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema extensions and shared models that MUST exist before any user story can begin.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T010 Extend Task SQLModel with `priority` field (str, default="medium", enum: low/medium/high/urgent), `due_date` field (datetime | None, default=None), `recurrence_type` field (str, default="none", enum: none/daily/weekly/monthly), `recurrence_interval` field (int, default=1) in `backend/src/models/task.py`. Extend TaskCreate, TaskUpdate, TaskResponse schemas. Additive-only migration.
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, DaprPubSubSkill
  - **Depends on**: T006
  - **Acceptance**: Existing tasks not broken (defaults applied), new fields in schemas, mypy passes
  - **Test**: `backend/tests/unit/test_task_model_extended.py`

- [X] T011 [P] Create Tag SQLModel at `backend/src/models/tag.py` — id (UUID), user_id (UUID FK), name (str max 50), color (str default "#6B7280"), created_at (datetime). Create task_tags junction table (task_id UUID FK, tag_id UUID FK, composite PK). Add to `backend/src/models/__init__.py`
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, DaprStateSkill
  - **Acceptance**: Tag model with correct fields, junction table, cascade deletes work, mypy passes
  - **Test**: `backend/tests/unit/test_tag_model.py`

- [X] T012 [P] Create Reminder SQLModel at `backend/src/models/reminder.py` — id (UUID), task_id (UUID FK), user_id (UUID FK), reminder_time (datetime), status (str default "pending", enum: pending/fired/cancelled), created_at (datetime). Add to `backend/src/models/__init__.py`
  - **Agent**: reminder-scheduler-agent
  - **Skills**: ReminderSchedulingSkill, DaprStateSkill
  - **Acceptance**: Reminder model with correct fields, status enum validated, mypy passes
  - **Test**: `backend/tests/unit/test_reminder_model.py`

- [X] T013 [P] Create AuditLog SQLModel at `backend/src/models/audit_log.py` — id (UUID), event_type (str), user_id (UUID), payload (JSON), trace_id (str), timestamp (datetime). Append-only: no update/delete methods. Add to `backend/src/models/__init__.py`
  - **Agent**: audit-log-agent
  - **Skills**: AuditPersistenceSkill, DaprStateSkill
  - **Acceptance**: AuditLog model with correct fields, no update/delete exposed, mypy passes
  - **Test**: `backend/tests/unit/test_audit_log_model.py`

- [X] T014 [P] Create UserPreference model at `backend/src/models/user_preference.py` — id (UUID), user_id (UUID FK unique), notification_channel (str default "in-app"), timezone (str default "UTC"), reminder_offset_minutes (int default 15), default_priority (str default "medium"), sort_order (str default "created_at_desc"), theme (str default "light"). Add to `backend/src/models/__init__.py`
  - **Agent**: user-preference-agent
  - **Skills**: DaprStateSkill
  - **Acceptance**: UserPreference model with all defaults, mypy passes
  - **Test**: `backend/tests/unit/test_user_preference_model.py`

- [X] T015 Run database migration (additive-only) — `python -c "from src.init_db import init_db; import asyncio; asyncio.run(init_db())"` to create new tables and columns. Verify no DROP/RENAME/ALTER TYPE.
  - **Depends on**: T010, T011, T012, T013, T014
  - **Acceptance**: All new tables (tags, task_tags, reminders, audit_logs, user_preferences) created, existing tasks table has new columns with defaults

**Checkpoint**: All database models ready. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Task Priorities and Organization (Priority: P1) MVP

**Goal**: Users can assign priority levels (low/medium/high/urgent) to tasks with visual color indicators and sortable list views.

**Independent Test**: Create tasks with different priorities, verify visual indicators render, sort by priority, confirm chatbot understands priority commands.

### Tests for User Story 1

- [X] T016 [P] [US1] Unit test for priority CRUD in `backend/tests/unit/test_priority_crud.py` — create task with each priority level, update priority, verify default, sort by priority
- [X] T017 [P] [US1] Unit test for priority event emission in `backend/tests/unit/test_priority_events.py` — verify task.created and task.updated events include priority field

### Implementation for User Story 1

- [X] T018 [US1] Extend task service for priority handling in `backend/src/services/task_service.py` — accept priority in create/update, validate enum (low/medium/high/urgent), emit events with priority field, add sort_by=priority to GET /tasks
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T010, T016, T017

- [X] T019 [US1] Extend task API endpoints in `backend/src/api/tasks.py` — accept `priority` in POST/PATCH body, accept `sort_by=priority` query param, include priority in response, validate priority enum
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T018

- [X] T020 [P] [US1] Create PriorityBadge component at `frontend/src/components/ui/priority-badge.tsx` — color-coded badge (green=low, yellow=medium, orange=high, red=urgent) with text label
  - **Depends on**: T009

- [X] T021 [US1] Add priority selector to task create/edit forms in `frontend/src/components/features/todos/TodoDialog.tsx` — dropdown with 4 priority options and color indicators
  - **Depends on**: T020

- [X] T022 [US1] Display priority badge on task cards in `frontend/src/components/features/todos/TodoCard.tsx` — render PriorityBadge, add sort-by-priority option to task list header
  - **Depends on**: T020, T021

- [X] T023 [US1] Integrate priority with real-time sync — update `frontend/src/app/dashboard/todos/page.tsx` to handle priority in WebSocket events, reflect priority changes instantly
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T022, T009

**Checkpoint**: User Story 1 complete — tasks have priorities with visual indicators, sort, and real-time sync.

---

## Phase 4: User Story 2 — Tags and Categories (Priority: P1)

**Goal**: Users can tag tasks with color-coded categories, multi-select tags, and filter by tag.

**Independent Test**: Create tags, assign to tasks, filter task list by tag, verify color rendering.

### Tests for User Story 2

- [X] T024 [P] [US2] Unit test for tag CRUD in `backend/tests/unit/test_tag_crud.py` — create tag, list user tags, delete tag, verify user isolation, duplicate name rejection (409)
- [X] T025 [P] [US2] Unit test for tag-task association in `backend/tests/unit/test_tag_task_association.py` — assign tags to task, remove tags, filter tasks by tag, cascade delete

### Implementation for User Story 2

- [X] T026 [US2] Create tag service at `backend/src/services/tag_service.py` — create_tag(user_id, name, color), get_tags(user_id), delete_tag(user_id, tag_id), assign_tags_to_task(task_id, tag_ids), remove_tags_from_task(task_id, tag_ids). User-scoped isolation.
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
  - **Depends on**: T011, T024, T025

- [X] T027 [US2] Create tag API endpoints at `backend/src/api/tags.py` — POST /tags (201), GET /tags (200), DELETE /tags/{tag_id} (200/404). Register in `backend/src/main.py`
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T026

- [X] T028 [US2] Wire tags into task API — extend POST /PATCH /tasks in `backend/src/api/tasks.py` to accept `tag_ids` list, extend TaskResponse to include tags array, add `tag` query param to GET /tasks for filtering
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T027, T019

- [X] T029 [US2] Extend task service for tag operations in `backend/src/services/task_service.py` — manage tag associations on create/update, filter tasks by tag name (JOIN), include tags in events
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill
  - **Depends on**: T026, T028

- [X] T030 [P] [US2] Create TagChip component at `frontend/src/components/ui/tag-chip.tsx` — color-coded chip with name and optional delete button
  - **Depends on**: T009

- [X] T031 [P] [US2] Create TagManagementPanel at `frontend/src/components/features/tags/TagManagementPanel.tsx` — create tag form (name + color picker), list existing tags, delete tag button
  - **Depends on**: T030

- [X] T032 [US2] Add multi-select tag chips to task forms in `frontend/src/components/features/todos/TodoDialog.tsx` — searchable multi-select for assigning tags
  - **Depends on**: T031

- [X] T033 [US2] Add tag filter bar to task list in `frontend/src/app/dashboard/todos/page.tsx` — clickable tag chips that filter task list, display tag chips on TodoCard
  - **Depends on**: T032, T022

- [X] T034 [US2] Integrate tags with real-time sync — WebSocket events for tag changes update UI instantly
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T033, T009

**Checkpoint**: User Stories 1 AND 2 complete — tasks have priorities and tags with filtering and real-time sync.

---

## Phase 5: User Story 3 — Due Dates with Calendar UI (Priority: P1)

**Goal**: Users can set due dates on tasks and view them in a calendar. Overdue tasks are highlighted.

**Independent Test**: Set due dates, view calendar, verify overdue highlighting, test chatbot date parsing.

### Tests for User Story 3

- [X] T035 [P] [US3] Unit test for due date CRUD in `backend/tests/unit/test_due_date_crud.py` — create task with due_date, update due_date, filter by due_before/due_after
- [X] T036 [P] [US3] Unit test for due date event emission in `backend/tests/unit/test_due_date_events.py` — verify task.created and task.updated events include due_date

### Implementation for User Story 3

- [X] T037 [US3] Extend task service for due date handling in `backend/src/services/task_service.py` — accept due_date in create/update, add due_before/due_after filter params, emit events with due_date
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T010, T035, T036

- [X] T038 [US3] Extend task API for due dates in `backend/src/api/tasks.py` — accept `due_date` in POST/PATCH body, accept `due_before`, `due_after` query params, include due_date in response
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T037

- [X] T039 [P] [US3] Create DatePickerInput component at `frontend/src/components/ui/date-picker.tsx` — calendar date picker with timezone-awareness
  - **Depends on**: T009

- [X] T040 [US3] Add date picker to task forms in `frontend/src/components/features/todos/TodoDialog.tsx` — date picker for due_date, overdue warning for past dates
  - **Depends on**: T039

- [X] T041 [US3] Display due date and overdue indicator on TodoCard in `frontend/src/components/features/todos/TodoCard.tsx` — show due date text, red overdue badge for past-due tasks
  - **Depends on**: T040

- [X] T042 [P] [US3] Create CalendarView page at `frontend/src/app/dashboard/calendar/page.tsx` — monthly calendar grid showing task count badges per date, click date to expand tasks, overdue highlighting
  - **Depends on**: T041

- [X] T043 [US3] Add "Today", "This Week", "Overdue" quick filter buttons to `frontend/src/app/dashboard/todos/page.tsx` — each button filters task list by due_date range
  - **Depends on**: T041

- [X] T044 [US3] Integrate due dates with real-time sync — WebSocket events for due date changes update calendar and task list instantly
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T043, T042, T009

**Checkpoint**: User Stories 1, 2, AND 3 complete — tasks have priorities, tags, and due dates with calendar view.

---

## Phase 6: User Story 4 — Advanced Search, Filter, and Sort (Priority: P2)

**Goal**: Users can find tasks quickly using keyword search combined with multi-filters and sort options.

**Independent Test**: Search by keyword, apply combined filters, sort results, verify accuracy within 1 second for 1000 tasks.

### Tests for User Story 4

- [X] T045 [P] [US4] Unit test for search/filter/sort in `backend/tests/unit/test_search_filter_sort.py` — keyword ILIKE search, combined priority+tag+status+date filters, sort by all fields, pagination

### Implementation for User Story 4

- [X] T046 [US4] Implement advanced query builder in `backend/src/services/task_service.py` — add `q` (ILIKE search), `priority`, `tag`, `due_before`, `due_after`, `sort_by` (created_at/due_date/priority/title), `sort_order` (asc/desc), `page`, `limit` (max 100) params. Return {tasks, count, page, total_pages}
  - **Agent**: task-orchestrator-agent, event-sourcing-projection-agent
  - **Skills**: TaskCRUDSkill, DaprStateSkill, OpenTelemetryTracingSkill, PerformanceMetricsSkill
  - **Depends on**: T029, T037, T045

- [X] T047 [US4] Extend GET /tasks API in `backend/src/api/tasks.py` — accept all new query params (q, priority, tag, due_before, due_after, sort_by, sort_order, page, limit), return paginated response
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, OpenTelemetryTracingSkill
  - **Depends on**: T046

- [X] T048 [P] [US4] Create SearchBar component at `frontend/src/components/features/search/SearchBar.tsx` — text input with 300ms debounce, clear button, result count display
  - **Depends on**: T009

- [X] T049 [P] [US4] Create FilterPanel component at `frontend/src/components/features/search/FilterPanel.tsx` — priority dropdown, tag multi-select, status toggle (all/pending/completed), date range picker. Active filter chips with click-to-remove.
  - **Depends on**: T033, T041

- [X] T050 [P] [US4] Create SortSelector component at `frontend/src/components/features/search/SortSelector.tsx` — dropdown with sort_by + sort_order options
  - **Depends on**: T009

- [X] T051 [US4] Integrate SearchBar, FilterPanel, SortSelector into task list page `frontend/src/app/dashboard/todos/page.tsx` — compose all search/filter/sort components, wire to API with query params, paginate results
  - **Depends on**: T048, T049, T050, T047

**Checkpoint**: User Story 4 complete — full search, filter, sort, and pagination working.

---

## Phase 7: User Story 5 — Recurring Tasks (Priority: P2)

**Goal**: Tasks auto-reschedule on completion with configurable recurrence rules (daily, weekly, monthly).

**Independent Test**: Create recurring task, complete it, verify next occurrence auto-created with correct due date.

### Tests for User Story 5

- [X] T052 [P] [US5] Unit test for recurring task logic in `backend/tests/unit/test_recurring_task.py` — daily +1 day, weekly +7 days, monthly +1 month (handles Jan 31 -> Feb 28), idempotency (same event twice creates only one task)
- [X] T053 [P] [US5] Unit test for recurrence rule evaluation in `backend/tests/unit/test_recurrence_rule.py` — validate RecurringRuleEvaluationSkill calculates correct next dates

### Implementation for User Story 5

- [X] T054 [US5] Create recurrence rule evaluator at `backend/src/services/recurrence_service.py` — `calculate_next_due_date(current_due: datetime, recurrence_type: str, interval: int) -> datetime` handling daily/weekly/monthly with month-end edge cases
  - **Agent**: recurring-task-agent
  - **Skills**: RecurringRuleEvaluationSkill
  - **Depends on**: T010, T052, T053

- [X] T055 [US5] Implement recurring task event handler in `backend/src/events/handlers.py` — on task.completed: check recurrence_type != none, calculate next due_date via recurrence_service, create new task inheriting title/priority/tags/recurrence, emit task.created for new task. Wrap in CircuitBreakerSkill. Idempotent via dedup key.
  - **Agent**: recurring-task-agent, task-orchestrator-agent
  - **Skills**: RecurringRuleEvaluationSkill, DaprPubSubSkill, DaprServiceInvocationSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
  - **Depends on**: T054, T006

- [X] T056 [US5] Validate recurrence requires due_date in `backend/src/services/task_service.py` — reject task creation where recurrence_type != "none" but due_date is None (400 error)
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill
  - **Depends on**: T054

- [X] T057 [P] [US5] Create RecurrenceSelector component at `frontend/src/components/ui/recurrence-selector.tsx` — dropdown: None/Daily/Weekly/Monthly with interval input
  - **Depends on**: T009

- [X] T058 [US5] Add recurrence selector to task forms in `frontend/src/components/features/todos/TodoDialog.tsx` — recurrence dropdown, auto-require due_date when recurrence is set
  - **Depends on**: T057, T040

- [X] T059 [US5] Display recurring indicator on TodoCard in `frontend/src/components/features/todos/TodoCard.tsx` — recurring icon, "Next occurrence" label after completion
  - **Depends on**: T058

- [X] T060 [US5] Handle recurring task real-time sync — when task.completed triggers new task.created, show "Next occurrence created" toast via WebSocket
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T059, T055, T009

**Checkpoint**: User Story 5 complete — recurring tasks auto-create next occurrence on completion.

---

## Phase 8: User Story 6 — Time-Based Reminders (Priority: P2)

**Goal**: Users get reminders before task due dates via in-app notifications, with configurable offsets.

**Independent Test**: Set reminder on a task, wait for it to fire, verify notification toast appears.

### Tests for User Story 6

- [X] T061 [P] [US6] Unit test for reminder service in `backend/tests/unit/test_reminder_service.py` — create reminder, cancel reminder, auto-schedule on task.created, auto-cancel on task.completed/deleted
- [X] T062 [P] [US6] Unit test for reminder event handler in `backend/tests/unit/test_reminder_handler.py` — verify reminder.due event emitted at correct time, notification.sent follows

### Implementation for User Story 6

- [X] T063 [US6] Create reminder service at `backend/src/services/reminder_service.py` — create_reminder(task_id, user_id, reminder_time), cancel_reminder(reminder_id), cancel_by_task(task_id), get_pending_by_user(user_id). Schedule via time-delayed mechanism (polling 30s or Dapr Jobs).
  - **Agent**: reminder-scheduler-agent
  - **Skills**: ReminderSchedulingSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill
  - **Depends on**: T012, T061, T062

- [X] T064 [US6] Create reminder API at `backend/src/api/reminders.py` — POST /reminders (validate reminder_time is future, task exists) (201), DELETE /reminders/{reminder_id} (cancel if pending, 400 if already fired) (200). Register in `backend/src/main.py`
  - **Agent**: reminder-scheduler-agent
  - **Skills**: ReminderSchedulingSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T063

- [X] T065 [US6] Implement auto-schedule handler in `backend/src/events/handlers.py` — on task.created with due_date: query user preferences for reminder_offset, create reminder at (due_date - offset). On task.completed/task.deleted: cancel pending reminders for that task.
  - **Agent**: reminder-scheduler-agent, user-preference-agent
  - **Skills**: ReminderSchedulingSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprStateSkill, CircuitBreakerSkill
  - **Depends on**: T063, T006

- [X] T066 [US6] Implement reminder checker (polling or scheduler) in `backend/src/events/reminder_checker.py` — periodically (30s) query pending reminders where reminder_time <= now(), emit reminder.due CloudEvent, mark status=fired
  - **Agent**: reminder-scheduler-agent
  - **Skills**: ReminderSchedulingSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T063

- [X] T067 [P] [US6] Create ReminderToggle component at `frontend/src/components/ui/reminder-toggle.tsx` — toggle switch with offset selector (15min/30min/1hr/1day)
  - **Depends on**: T009

- [X] T068 [US6] Add reminder toggle to task form in `frontend/src/components/features/todos/TodoDialog.tsx` — show only when due_date is set, default offset from user preferences
  - **Depends on**: T067, T040

- [X] T069 [P] [US6] Create NotificationBell component at `frontend/src/components/features/notifications/NotificationBell.tsx` — bell icon with unread count badge, dropdown panel with recent notifications, mark-as-read functionality
  - **Depends on**: T009

- [X] T070 [P] [US6] Create NotificationToast component at `frontend/src/components/features/notifications/NotificationToast.tsx` — toast notification for reminder.due events via WebSocket
  - **Depends on**: T009

- [X] T071 [US6] Integrate notifications with WebSocket — in `frontend/src/app/dashboard/layout.tsx` add NotificationBell to header, listen for reminder.due and notification.sent events, show toast and update bell count
  - **Agent**: notification-agent, realtime-sync-agent
  - **Skills**: NotificationDispatchSkill, RealtimeBroadcastSkill
  - **Depends on**: T069, T070, T009

**Checkpoint**: User Story 6 complete — reminders fire at scheduled time with in-app toast and bell notifications.

---

## Phase 9: User Story 7 — Real-Time Synchronization (Priority: P2)

**Goal**: All connected clients receive instant updates when any task state changes.

**Independent Test**: Open two browser tabs, make task change in one, verify other updates within 2 seconds.

### Implementation for User Story 7

> Note: Most real-time infrastructure was built in Phase 1 (T007, T009). This phase wires event handlers to broadcast.

- [X] T072 [US7] Wire all task event handlers to WebSocket broadcast in `backend/src/events/handlers.py` — on task.created/updated/completed/deleted, look up user_id connections and broadcast via RealtimeBroadcastSkill. Security: only broadcast to event owner's connections.
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T007, T005

- [X] T073 [US7] Implement missed-event recovery on reconnection in `backend/src/api/websocket.py` — on WebSocket reconnect, send full task state snapshot to client
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill, DaprServiceInvocationSkill, OpenTelemetryTracingSkill
  - **Depends on**: T072

- [X] T074 [US7] Handle real-time updates in frontend `frontend/src/app/dashboard/todos/page.tsx` — process WebSocket events to add/update/remove/complete tasks in local state without full refetch. Optimistic UI on user actions.
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T072, T009

- [X] T075 [P] [US7] Add connection status indicator in `frontend/src/components/ui/connection-status.tsx` — green dot (connected), yellow dot (reconnecting), red dot (disconnected). Place in dashboard header.
  - **Depends on**: T009

**Checkpoint**: User Story 7 complete — multi-device real-time sync with reconnection recovery.

---

## Phase 10: User Story 8 — Event-Driven Notifications (Priority: P3)

**Goal**: Users receive notifications for all significant events beyond reminders: deadline approaching, overdue, completion milestones.

**Independent Test**: Trigger task event, verify in-app notification with correct content appears.

### Implementation for User Story 8

- [X] T076 [US8] Implement notification agent handler in `backend/src/events/handlers.py` — on reminder.due: query user preferences for channel, format notification message, deliver via WebSocket (in-app), emit notification.sent event. Idempotent via dedup key.
  - **Agent**: notification-agent, user-preference-agent
  - **Skills**: NotificationDispatchSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprSecretsSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
  - **Depends on**: T066, T007

- [X] T077 [US8] Implement overdue and deadline-approaching notifications in `backend/src/events/notification_checker.py` — scheduled check (hourly): find tasks with due_date within 24h -> emit notification, find overdue tasks -> emit notification. Emit notification.sent events.
  - **Agent**: notification-agent, observability-agent
  - **Skills**: NotificationDispatchSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
  - **Depends on**: T076

- [X] T078 [US8] Implement milestone notifications in `backend/src/events/handlers.py` — on task.completed: check if user hit milestone (10, 25, 50, 100 tasks completed), emit congratulatory notification
  - **Agent**: notification-agent
  - **Skills**: NotificationDispatchSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T076

- [X] T079 [US8] Extend NotificationBell in `frontend/src/components/features/notifications/NotificationBell.tsx` — add notification categories (reminders, deadlines, achievements), mark-as-read per category, dismiss functionality
  - **Depends on**: T069, T076

**Checkpoint**: User Story 8 complete — full event-driven notification system.

---

## Phase 11: User Story 9 — Analytics Dashboard (Priority: P3)

**Goal**: Visual dashboard with completion stats, streaks, priority/tag distribution, and trends.

**Independent Test**: View analytics dashboard, verify charts render with real data, check streak calculation.

### Tests for User Story 9

- [X] T080 [P] [US9] Unit test for analytics projections in `backend/tests/unit/test_analytics_projections.py` — process series of events, verify completion-by-day, priority-distribution, tag-distribution, streak projections

### Implementation for User Story 9

- [X] T081 [US9] Implement event-sourcing projections in `backend/src/events/projections.py` — consume task.created/updated/completed/deleted events, build and store projections: completion_by_day (dict{date: count}), priority_distribution (dict{priority: count}), tag_distribution (dict{tag: count}), streak (dict{current, longest, last_date}). Store in Dapr State Store or database. Emit projection.updated event.
  - **Agent**: event-sourcing-projection-agent
  - **Skills**: ProjectionBuildSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill
  - **Depends on**: T005, T080

- [X] T082 [US9] Create analytics service at `backend/src/services/analytics_service.py` — get_analytics(user_id) returning {completion_today, completion_week, completion_month, streak, priority_distribution, tag_distribution, overdue_count, trends[]}. Read from projections (fast reads).
  - **Agent**: event-sourcing-projection-agent, observability-agent
  - **Skills**: DaprStateSkill, PerformanceMetricsSkill, OpenTelemetryTracingSkill
  - **Depends on**: T081

- [X] T083 [US9] Create analytics API at `backend/src/api/analytics.py` — GET /analytics returning full analytics response. Scoped to authenticated user_id. Response within 500ms. Register in `backend/src/main.py`
  - **Agent**: event-sourcing-projection-agent
  - **Skills**: DaprStateSkill, PerformanceMetricsSkill, OpenTelemetryTracingSkill
  - **Depends on**: T082

- [X] T084 [P] [US9] Install Recharts — add `recharts` to `frontend/package.json` via `npm install recharts`
  - **Depends on**: none

- [X] T085 [P] [US9] Create StatCards component at `frontend/src/components/features/analytics/StatCards.tsx` — cards for Today, This Week, This Month, Streak Count, Overdue Count
  - **Depends on**: T084

- [X] T086 [P] [US9] Create CompletionTrendChart at `frontend/src/components/features/analytics/CompletionTrendChart.tsx` — Recharts line chart showing completions over time
  - **Depends on**: T084

- [X] T087 [P] [US9] Create PriorityDistributionChart at `frontend/src/components/features/analytics/PriorityDistributionChart.tsx` — Recharts pie chart for priority breakdown
  - **Depends on**: T084

- [X] T088 [P] [US9] Create TagDistributionChart at `frontend/src/components/features/analytics/TagDistributionChart.tsx` — Recharts bar chart for tag usage
  - **Depends on**: T084

- [X] T089 [US9] Create analytics dashboard page at `frontend/src/app/dashboard/analytics/page.tsx` — compose StatCards + all 3 charts, fetch from GET /analytics, responsive layout, real-time updates via WebSocket (projection.updated events)
  - **Agent**: event-sourcing-projection-agent
  - **Skills**: PerformanceMetricsSkill, RealtimeBroadcastSkill
  - **Depends on**: T085, T086, T087, T088, T083, T009

**Checkpoint**: User Story 9 complete — analytics dashboard with real data and real-time updates.

---

## Phase 12: User Story 10 — User Preferences and Personalization (Priority: P3)

**Goal**: Users can customize notification channel, defaults, timezone, sort order, and theme.

**Independent Test**: Change preferences in settings, verify preferences applied on next interaction.

### Tests for User Story 10

- [X] T090 [P] [US10] Unit test for preferences CRUD in `backend/tests/unit/test_preferences_crud.py` — get defaults, update single key, update multiple keys, verify event emission

### Implementation for User Story 10

- [X] T091 [US10] Create preferences service at `backend/src/services/preferences_service.py` — get_preferences(user_id) with defaults, update_preferences(user_id, updates: dict) with partial update. Emit user.preference.changed event via DaprPubSubSkill.
  - **Agent**: user-preference-agent
  - **Skills**: DaprStateSkill, DaprPubSubSkill, DaprServiceInvocationSkill, OpenTelemetryTracingSkill
  - **Depends on**: T014, T090

- [X] T092 [US10] Create preferences API at `backend/src/api/preferences.py` — GET /preferences (200), PATCH /preferences (200, partial update). Register in `backend/src/main.py`
  - **Agent**: user-preference-agent
  - **Skills**: DaprStateSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T091

- [X] T093 [US10] Create settings page at `frontend/src/app/dashboard/settings/page.tsx` — sections: Notifications (channel selector: in-app/email/both), Task Defaults (priority dropdown, sort order), Display (timezone selector), Theme (light/dark toggle). Changes save immediately with optimistic UI.
  - **Agent**: user-preference-agent
  - **Skills**: DaprStateSkill, DaprServiceInvocationSkill
  - **Depends on**: T092

- [X] T094 [US10] Wire theme preference to ThemeContext in `frontend/src/contexts/ThemeContext.tsx` — load theme from preferences API on mount, apply on change, persist via PATCH /preferences
  - **Depends on**: T093

- [X] T095 [US10] Add settings link to dashboard navigation in `frontend/src/components/layout/DashboardHeader.tsx` — settings gear icon linking to /dashboard/settings
  - **Depends on**: T093

**Checkpoint**: User Story 10 complete — full personalization with persistence.

---

## Phase 13: User Story 11 — AI Chatbot Enhanced Features (Priority: P3)

**Goal**: Chatbot understands and executes all advanced features through natural language.

**Independent Test**: Test each chatbot command for priorities, tags, recurring, reminders, analytics, preferences.

### Implementation for User Story 11

- [X] T096 [US11] Add new MCP tools for advanced features in `backend/src/tools/` — set_priority(task_id, priority), assign_tags(task_id, tag_names), set_due_date(task_id, due_date), set_recurrence(task_id, type, interval), query_analytics(user_id), update_preferences(user_id, key, value)
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T029, T037, T054, T063, T082, T091

- [X] T097 [US11] Update agent system prompt in `backend/src/agents/prompts.py` — add instructions for handling priority, tag, due date, recurrence, reminder, analytics, and preference commands via natural language
  - **Agent**: task-orchestrator-agent
  - **Depends on**: T096

- [X] T098 [US11] Extend todo agent tool registration in `backend/src/agents/todo_agent.py` — register all new MCP tools with the OpenAI Agents SDK agent
  - **Agent**: task-orchestrator-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill
  - **Depends on**: T097

- [X] T099 [US11] Test chatbot with advanced commands — verify conversational responses for: "Add high-priority task", "Tag task as work", "Set task due Friday", "Make task recurring weekly", "How productive was I?", "Set default reminder to 30 min"
  - **Depends on**: T098

**Checkpoint**: User Story 11 complete — chatbot handles all advanced features via natural language.

---

## Phase 14: Resilience, Observability & Audit (Cross-Cutting)

**Purpose**: System-wide resilience, observability, and audit logging that affect all user stories.

### Resilience

- [X] T100 [P] Implement failure handler event handler in `backend/src/events/handlers.py` — on operation.failed: persist failure record via FailurePersistenceSkill, check circuit breaker state, emit retry.scheduled with exponential backoff (1s, 2s, 4s, 8s, 16s, max 5 attempts), on exhaustion emit alert.triggered
  - **Agent**: failure-handler-agent
  - **Skills**: FailurePersistenceSkill, RetrySchedulerSkill, DaprPubSubSkill, DaprStateSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
  - **Test**: `backend/tests/unit/test_failure_handler.py`

- [X] T101 Implement retry scheduler event handler in `backend/src/events/handlers.py` — on retry.scheduled: wait backoff interval, re-emit original event, if max retries exceeded emit retry.exhausted. Preserve original payload and trace context.
  - **Agent**: retry-scheduler-agent
  - **Skills**: RetrySchedulerSkill, FailurePersistenceSkill, DaprPubSubSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
  - **Depends on**: T100
  - **Test**: `backend/tests/unit/test_retry_scheduler.py`

### Audit

- [X] T102 [P] Implement audit log event handler in `backend/src/events/handlers.py` — consume ALL domain events (task.*, reminder.*, notification.*, user.preference.*), write immutable AuditLog record with event_type, user_id, full payload, trace_id, timestamp. Append-only, idempotent via event ID dedup.
  - **Agent**: audit-log-agent
  - **Skills**: AuditPersistenceSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill
  - **Depends on**: T013
  - **Test**: `backend/tests/unit/test_audit_log_handler.py`

### Observability

- [X] T103 [P] Add OpenTelemetry auto-instrumentation to backend in `backend/src/main.py` — instrument FastAPI, SQLAlchemy, HTTP clients. Add trace context propagation to Dapr events. Export to Jaeger via OTLP.
  - **Agent**: observability-agent
  - **Skills**: OpenTelemetryTracingSkill, DaprMonitoringSkill, PerformanceMetricsSkill
  - **Depends on**: T002

- [X] T104 Add Prometheus metrics endpoint at `backend/src/api/metrics.py` — `/metrics` endpoint exporting: request_count, request_duration_seconds, event_publish_count, event_consume_count, circuit_breaker_state, active_websocket_connections. Register in `backend/src/main.py`
  - **Agent**: observability-agent, scalability-observer-agent
  - **Skills**: PerformanceMetricsSkill, DaprMonitoringSkill, OpenTelemetryTracingSkill
  - **Depends on**: T103

- [X] T105 [P] Implement observability agent logic in `backend/src/events/observability.py` — check Dapr sidecar health periodically, aggregate metrics, detect anomalies (p95 > 500ms, error rate > 1%), emit anomaly.detected event
  - **Agent**: observability-agent
  - **Skills**: DaprMonitoringSkill, PerformanceMetricsSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T104

- [X] T106 [P] Implement scalability observer in `backend/src/events/scalability.py` — monitor CPU/memory/request metrics from Prometheus, emit scale.recommendation when CPU > 70% or memory > 80%, respect min replicas >= 2
  - **Agent**: scalability-observer-agent
  - **Skills**: PerformanceMetricsSkill, DaprMonitoringSkill, DaprPubSubSkill, OpenTelemetryTracingSkill
  - **Depends on**: T104

**Checkpoint**: All resilience, observability, and audit systems operational.

---

## Phase 15: Local Production-Ready Deployment Architecture (Updated)

**Purpose**: Docker Compose, Minikube, and Vercel deployment automation with Hugging Face integration.

- [ ] T107 [P] Create Docker Compose configuration at `docker-compose.yml` — PostgreSQL, Kafka/Zookeeper, Jaeger, Prometheus, Grafana, backend (with Dapr sidecar), frontend (with Dapr sidecar), health checks, resource limits, volume mounts for persistence, proper service dependencies
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: `docker-compose up -d` starts all services with health checks passing, access at http://localhost:3000 (frontend), http://localhost:8000 (backend), http://localhost:16686 (jaeger)

- [ ] T108 [P] Create Dapr components for Docker Compose at `dapr-components.yaml` — pubsub.kafka pointing to kafka:9092, statestore.postgresql with connection string, secretstore.local.env, tracing config pointing to jaeger:4317, subscription definitions with dead-letter topics
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill, DaprPubSubSkill, DaprStateSkill
  - **Acceptance**: All components load in Docker Compose Dapr sidecars without errors

- [ ] T109 [P] Create Minikube deployment manifests at `deploy/minikube/` — namespace todo-app, dapr operator installation, strimzi kafka operator, kafka cluster deployment, backend deployment with dapr annotations (replicas=2), frontend deployment with dapr annotations (replicas=2), services, hpa configs
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill, DaprPubSubSkill, DaprStateSkill
  - **Acceptance**: `kubectl apply -f deploy/minikube/` creates all resources, pods running with dapr sidecars injected

- [ ] T110 [P] Create Vercel deployment configuration at `frontend/vercel.json` and `deploy/vercel/` — frontend build configuration, environment variable mappings (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_DAPR_HTTP_PORT, NEXT_PUBLIC_WEBSOCKET_URL), output directory settings, domain configuration
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: `vercel --prod` deployment succeeds with live URL accessible

- [ ] T111 [P] Update DeploymentBlueprintSkill to support 3 targets in `.claude/skills/DeploymentBlueprintSkill/skill.md` — add Docker Compose target (generates docker-compose.yml, dapr-components.yaml), Minikube target (generates k8s manifests with dapr annotations), Vercel target (generates vercel.json and build configs), update documentation with usage examples for each
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: Skill documentation shows clear examples for each deployment target

- [ ] T112 [P] Create Hugging Face Inference API integration at `backend/src/services/ai_service.py` — create HuggingFaceClient class with inference API calls, model selection (HF_MODEL_NAME env var), API key management (HF_API_KEY env var), fallback mechanism when OpenAI unavailable, circuit breaker protection
  - **Agent**: task-orchestrator-agent
  - **Skills**: CircuitBreakerSkill, DaprSecretsSkill, OpenTelemetryTracingSkill
  - **Acceptance**: When OpenAI fails, automatically falls back to Hugging Face, circuit breaker trips appropriately

- [ ] T113 [P] Update OpenAI Agents to support dual providers in `backend/src/agents/todo_agent.py` — detect available provider (OpenAI vs Hugging Face), use Hugging Face as fallback, update MCP tools to work with both providers, environment-based switching
  - **Agent**: task-orchestrator-agent
  - **Skills**: DaprSecretsSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
  - **Depends on**: T112
  - **Acceptance**: Agent works with both OpenAI and Hugging Face, falls back seamlessly

- [ ] T114 [P] Create deployment orchestration script at `deploy/deploy.sh` — build Docker images for backend/frontend, push to registry, docker-compose up/down commands, minikube deployment commands, health checks post-deployment, rollback capabilities for each target
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill, PerformanceMetricsSkill, CircuitBreakerSkill
  - **Depends on**: T107, T109, T110
  - **Acceptance**: Script handles deployment to all 3 targets with health checks and rollback

- [ ] T115 [P] Create Dockerfiles for both services with multi-stage builds — `backend/Dockerfile` with dapr sidecar readiness, `frontend/Dockerfile` with dapr sidecar readiness, proper layer caching, non-root user, health checks, multi-platform support
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: Both Dockerfiles build successfully, images run with proper security context and health checks

- [ ] T116 [P] Add Hugging Face configuration to Dapr components in `dapr-components.yaml` — secret component for HF_API_KEY, update documentation in `backend/src/config/secrets.py` to include Hugging Face secrets management
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DaprSecretsSkill, DeploymentBlueprintSkill
  - **Depends on**: T112
  - **Acceptance**: Hugging Face secrets properly configured and accessible via DaprSecretsSkill

**Checkpoint**: Local production-ready deployment architecture complete — Docker Compose, Minikube, and Vercel deployment options with Hugging Face fallback.

---

## Phase 16: Deployment Testing & Validation

**Purpose**: Validate all deployment targets work correctly with full system functionality.

- [ ] T112 Write Docker Compose integration test at `backend/tests/integration/test_docker_compose_deployment.py` — verify full stack runs in compose: backend + frontend + kafka + postgres + dapr sidecars, test end-to-end functionality: create task -> event -> reminder -> notification
  - **Agent**: task-orchestrator-agent, reminder-scheduler-agent, notification-agent
  - **Skills**: DaprPubSubSkill, DaprStateSkill, DaprServiceInvocationSkill
  - **Depends on**: T107
  - **Acceptance**: Test passes in Docker Compose environment with all services communicating

- [ ] T113 Write Minikube integration test at `backend/tests/integration/test_minikube_deployment.py` — verify k8s deployment works: dapr sidecars injected, kafka connectivity, event processing, hpa scaling behavior, service-to-service communication
  - **Agent**: observability-agent, scalability-observer-agent
  - **Skills**: DaprPubSubSkill, DaprStateSkill, DaprMonitoringSkill
  - **Depends on**: T109
  - **Acceptance**: Test passes in Minikube with proper k8s resource utilization

- [ ] T114 Write Vercel frontend validation at `frontend/tests/e2e/test_vercel_deployment.js` — verify frontend works with remote backend, websocket connectivity, real-time sync, environment variable configuration
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T110
  - **Acceptance**: Frontend connects properly to backend when deployed to Vercel

- [ ] T115 Test Hugging Face fallback scenario at `backend/tests/integration/test_hf_fallback.py` — disable OpenAI connectivity, verify system automatically switches to Hugging Face for AI operations, confirm MCP tools work with HF provider
  - **Agent**: task-orchestrator-agent
  - **Skills**: CircuitBreakerSkill, DaprSecretsSkill
  - **Depends on**: T112, T113
  - **Acceptance**: When OpenAI unavailable, system seamlessly uses Hugging Face without errors

- [ ] T116 Create deployment validation script at `scripts/validate_deployments.sh` — runs health checks on all services for each deployment target, verifies event flow, confirms all 13 agents operational, validates observability stack
  - **Agent**: observability-agent
  - **Skills**: PerformanceMetricsSkill, DaprMonitoringSkill
  - **Depends on**: T107, T109, T110, T112
  - **Acceptance**: Script validates all deployment targets with pass/fail status

**Checkpoint**: All deployment targets validated with full functionality.

---

## Phase 17: Deployment Documentation & Demo

**Purpose**: Document deployment procedures and create demo materials.

- [ ] T117 Update README.md deployment section in `README.md` — add Docker Compose quick start, Minikube setup instructions, Vercel deployment guide, Hugging Face configuration, troubleshooting tips for each platform
  - **Acceptance**: README clearly explains all 3 deployment options with step-by-step instructions

- [ ] T118 Create comprehensive deployment guide at `DEPLOYMENT_GUIDE.md` — detailed instructions for each target, environment configuration, common issues, scaling recommendations, monitoring setup
  - **Acceptance**: Complete guide covers all deployment scenarios comprehensively

- [ ] T119 Create demo script showcasing all deployment targets at `demo-script.sh` — 90-second demo covering: Docker Compose setup, Minikube deployment, Vercel frontend, Hugging Face fallback, observability features
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: Demo script runs successfully showing all deployment capabilities

- [ ] T120 Update quickstart guide at `specs/003-advanced-features/quickstart.md` — reflect new deployment architecture, remove DOKS references, add Docker Compose as primary option
  - **Acceptance**: Quickstart guide matches current deployment architecture

**Checkpoint**: Deployment documentation complete and demo ready.

---

## Phase 18: Polish & Cross-Cutting Concerns

**Purpose**: Skill documentation, end-to-end validation, and demo preparation.

- [ ] T121 [P] Document all 19 skills with examples — update each `.claude/skills/*/skill.md` with: Purpose, Key Features, Usage Examples (2-3 copy-pasteable Python snippets), Swap Instructions (e.g., Kafka -> Redis via Dapr config), Unit Test Template
  - **Agent**: observability-agent
  - **Acceptance**: All 19 skill files complete with examples

- [ ] T122 Write end-to-end integration test at `backend/tests/integration/test_e2e_flow.py` — full chain: create task with priority+tags+due_date+recurrence -> verify event emitted -> verify reminder scheduled -> complete task -> verify recurring task created -> verify audit log -> verify real-time sync -> verify analytics updated
  - **Agent**: task-orchestrator-agent, reminder-scheduler-agent, notification-agent, recurring-task-agent, audit-log-agent, realtime-sync-agent
  - **Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, ReminderSchedulingSkill, NotificationDispatchSkill, RealtimeBroadcastSkill, AuditPersistenceSkill, OpenTelemetryTracingSkill
  - **Depends on**: All previous tasks

- [ ] T123 Write 90-second demo script at `demo-script.sh` — (1) Show Docker Compose deployment (10s), (2) Create task via chatbot with priority+tags+due date (15s), (3) Real-time sync across two tabs (10s), (4) Complete recurring task, show auto-creation (15s), (5) Reminder notification (10s), (6) Analytics dashboard (10s), (7) Jaeger trace (10s), (8) Multi-target deployment + skill docs (10s)
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill, PerformanceMetricsSkill
  - **Depends on**: T122

- [ ] T124 Run quickstart.md validation — follow `specs/003-advanced-features/quickstart.md` step by step, verify backend health, Dapr sidecar, task creation, Kafka events, WebSocket connectivity
  - **Depends on**: T122

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)          -> No deps, start immediately
Phase 2 (Foundational)   -> Depends on Phase 1 (T006 specifically)
Phase 3 (US1: Priorities) -> Depends on Phase 2 (T010)
Phase 4 (US2: Tags)      -> Depends on Phase 2 (T011), can parallel with US1
Phase 5 (US3: Due Dates) -> Depends on Phase 2 (T010), can parallel with US1/US2
Phase 6 (US4: Search)    -> Depends on US1+US2+US3 (needs all filter fields)
Phase 7 (US5: Recurring) -> Depends on US3 (needs due_date)
Phase 8 (US6: Reminders) -> Depends on US3 (needs due_date)
Phase 9 (US7: Realtime)  -> Depends on Phase 1 (T007, T009)
Phase 10 (US8: Notifs)   -> Depends on US6 (needs reminder infra)
Phase 11 (US9: Analytics) -> Depends on Phase 1 (T005)
Phase 12 (US10: Prefs)   -> Depends on Phase 2 (T014)
Phase 13 (US11: Chatbot) -> Depends on US1-US10 (needs all features)
Phase 14 (Resilience)    -> Depends on Phase 1, can parallel with US phases
Phase 15 (Deployment)    -> Depends on Phase 1, can parallel with US phases
Phase 16 (Polish)        -> Depends on ALL phases complete
```

### User Story Dependencies

| Story | Can Start After | Depends On Stories |
|-------|-----------------|-------------------|
| US1 (Priorities) | Phase 2 | None |
| US2 (Tags) | Phase 2 | None (parallel with US1) |
| US3 (Due Dates) | Phase 2 | None (parallel with US1/US2) |
| US4 (Search/Filter) | US1 + US2 + US3 | US1, US2, US3 |
| US5 (Recurring) | US3 | US3 (needs due_date) |
| US6 (Reminders) | US3 | US3 (needs due_date) |
| US7 (Realtime Sync) | Phase 1 | None (infra in Phase 1) |
| US8 (Notifications) | US6 | US6 (needs reminder infra) |
| US9 (Analytics) | Phase 1 | None (builds from events) |
| US10 (Preferences) | Phase 2 | None |
| US11 (Chatbot) | US1-US10 | All previous stories |

### Within Each User Story

1. Tests FIRST (if included) -> ensure they FAIL before implementation
2. Backend models -> Backend services -> Backend API endpoints
3. Frontend components -> Frontend integration -> Real-time sync wiring
4. Story complete before marking checkpoint

---

## Parallel Execution Examples

### Phase 1 (All parallel)
```
Parallel: T001, T002, T003 (different files, no deps)
Sequential: T004 -> T005 -> T006 -> T007
Parallel: T008 (independent)
Sequential: T007 -> T009
```

### Phase 2 (Models parallel)
```
Sequential: T010 (extends existing)
Parallel: T011, T012, T013, T014 (new files, no deps)
Sequential: T015 (depends on all models)
```

### User Stories 1, 2, 3 (Parallel tracks)
```
Track A: US1 (T016-T023) — Priorities
Track B: US2 (T024-T034) — Tags
Track C: US3 (T035-T044) — Due Dates
All three can run in parallel after Phase 2
```

### Cross-Cutting (Parallel with User Stories)
```
Track D: Phase 14 (T100-T106) — Resilience & Observability
Track E: Phase 15 (T107-T111) — Deployment
Both can run in parallel with user story phases
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T009)
2. Complete Phase 2: Foundational (T010-T015)
3. Complete Phase 3: User Story 1 — Priorities (T016-T023)
4. **STOP and VALIDATE**: Test priorities independently
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. US1 (Priorities) -> Test -> MVP!
3. US2 (Tags) + US3 (Due Dates) -> Test each -> Demo
4. US4 (Search) -> Test -> Demo
5. US5 (Recurring) + US6 (Reminders) -> Test -> Demo
6. US7 (Realtime) + US9 (Analytics) + US10 (Prefs) -> Test -> Demo
7. US8 (Notifications) + US11 (Chatbot) -> Test -> Final Demo
8. Resilience + Deployment -> Production ready

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. After Phase 2:
   - Dev A: US1 (Priorities) -> US4 (Search) -> US11 (Chatbot)
   - Dev B: US2 (Tags) -> US5 (Recurring) -> US8 (Notifications)
   - Dev C: US3 (Due Dates) -> US6 (Reminders) -> US9 (Analytics)
   - Dev D: US7 (Realtime) + US10 (Prefs) + Resilience + Deployment
3. Final: Everyone on Polish + E2E testing

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Tasks** | 115 |
| **Phase 1 (Setup)** | 9 tasks |
| **Phase 2 (Foundational)** | 6 tasks |
| **US1 (Priorities)** | 8 tasks |
| **US2 (Tags)** | 11 tasks |
| **US3 (Due Dates)** | 10 tasks |
| **US4 (Search/Filter)** | 7 tasks |
| **US5 (Recurring)** | 9 tasks |
| **US6 (Reminders)** | 11 tasks |
| **US7 (Realtime Sync)** | 4 tasks |
| **US8 (Notifications)** | 4 tasks |
| **US9 (Analytics)** | 10 tasks |
| **US10 (Preferences)** | 6 tasks |
| **US11 (Chatbot)** | 4 tasks |
| **Phase 14 (Resilience)** | 7 tasks |
| **Phase 15 (Deployment)** | 5 tasks |
| **Phase 16 (Polish)** | 4 tasks |
| **Parallel Opportunities** | 42 tasks marked [P] |
| **User Stories** | 11 (3x P1, 4x P2, 4x P3) |
| **MVP Scope** | Phase 1 + Phase 2 + US1 (23 tasks) |
| **Constitution Compliance** | 15/15 invariants satisfied |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- All backend code requires mypy type hints
- All backend tasks include pytest unit tests (happy path + edge cases)
- All events use CloudEvents 1.0 format via DaprPubSubSkill
- All cross-service calls wrapped in CircuitBreakerSkill
- All operations traced via OpenTelemetryTracingSkill
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
