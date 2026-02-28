# Feature Specification: Phase V Advanced Features

**Feature Branch**: `003-advanced-features`
**Created**: 2026-02-09
**Status**: Draft
**Input**: Master spec for all intermediate and advanced features in Phase V

## 1. High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│              Local Production-Ready Containerization Stack         │
├─────────────────────────────────────────────────────────────────────┤
│  Docker Compose Environment (Local Dev/Prod)                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Reverse Proxy (Traefik/Nginx)             │    │
│  └────────────┬──────────────────────────┬─────────────────────┘    │
│               │                          │                          │
│  ┌────────────▼────────────┐  ┌─────────▼────────────────┐         │
│  │  Frontend (Next.js)     │  │  Backend (FastAPI)        │         │
│  │  + Dapr Sidecar         │  │  + Dapr Sidecar           │         │
│  │  Port 3000              │  │  Port 8000                │         │
│  │                         │  │  + OpenAI Agents SDK      │         │
│  │  - Chat UI              │  │                           │         │
│  │  - Task Dashboard       │  │  - REST API               │         │
│  │  - Analytics Dashboard  │  │  - WebSocket Server        │         │
│  │  - Calendar View        │  │  - MCP Tools               │         │
│  │  - Preference Panel     │  │  - Dapr Event Handlers     │         │
│  └────────────┬────────────┘  └──────┬──────────────────────┘       │
│               │  WebSocket/API       │  Dapr Sidecar                │
│               └──────────┬───────────┘                              │
│                          │                                          │
│  ┌───────────────────────▼──────────────────────────────────────┐   │
│  │                   Dapr Control Plane                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │   │
│  │  │ Pub/Sub  │ │  State   │ │ Secrets  │ │ Service Invoke │  │   │
│  │  │ (Kafka)  │ │ (Postgres)│ │ (Env)   │ │  (built-in)    │  │   │
│  │  └────┬─────┘ └──────────┘ └──────────┘ └────────────────┘  │   │
│  └───────┼──────────────────────────────────────────────────────┘   │
│          │                                                          │
│  ┌───────▼──────────────────────────────────────────────────────┐   │
│  │              Kafka (Docker/Kubernetes)                        │   │
│  │  Topics: task.created, task.updated, task.completed,          │   │
│  │          task.deleted, reminder.due, notification.sent,       │   │
│  │          user.preference.changed, projection.updated,         │   │
│  │          operation.failed, retry.scheduled, retry.exhausted,  │   │
│  │          alert.triggered, scale.recommendation,               │   │
│  │          frontend.metrics, anomaly.detected                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │               Agent Constellation (13 Mandatory)              │   │
│  │                                                               │   │
│  │  task-orchestrator ←→ reminder-scheduler ←→ notification      │   │
│  │        ↓                     ↓                   ↓            │   │
│  │  recurring-task    failure-handler ←→ retry-scheduler         │   │
│  │        ↓                     ↓                                │   │
│  │  realtime-sync     observability ←→ scalability-observer      │   │
│  │        ↓                     ↓                                │   │
│  │  audit-log    event-sourcing-projection ←→ user-preference    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │            Observability Stack                                │   │
│  │  Jaeger (traces) │ Prometheus (metrics) │ JSON Logs           │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │            Neon Serverless PostgreSQL                          │   │
│  │  Tables: users, tasks, tags, task_tags, conversations,        │   │
│  │          messages, reminders, audit_logs, user_preferences     │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   Minikube Kubernetes Environment                  │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    Ingress Controller (NGINX)                │    │
│  └────────────┬──────────────────────────┬─────────────────────┘    │
│               │                          │                          │
│  ┌────────────▼────────────┐  ┌─────────▼────────────────┐         │
│  │  Frontend (Next.js)     │  │  Backend (FastAPI)        │         │
│  │  + Dapr Sidecar         │  │  + Dapr Sidecar           │         │
│  │  Replicas >= 2          │  │  + OpenAI Agents SDK      │         │
│  │                         │  │  Replicas >= 2            │         │
│  │  - Chat UI              │  │                           │         │
│  │  - Task Dashboard       │  │  - REST API               │         │
│  │  - Analytics Dashboard  │  │  - WebSocket Server        │         │
│  │  - Calendar View        │  │  - MCP Tools               │         │
│  │  - Preference Panel     │  │  - Dapr Event Handlers     │         │
│  └────────────┬────────────┘  └──────┬──────────────────────┘       │
│               │  WebSocket/API       │  Dapr Sidecar                │
│               └──────────┬───────────┘                              │
│                          │                                          │
│  ┌───────────────────────▼──────────────────────────────────────┐   │
│  │                   Dapr Control Plane                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │   │
│  │  │ Pub/Sub  │ │  State   │ │ Secrets  │ │ Service Invoke │  │   │
│  │  │ (Kafka)  │ │ (Postgres)│ │ (K8s)   │ │  (built-in)    │  │   │
│  │  └────┬─────┘ └──────────┘ └──────────┘ └────────────────┘  │   │
│  └───────┼──────────────────────────────────────────────────────┘   │
│          │                                                          │
│  ┌───────▼──────────────────────────────────────────────────────┐   │
│  │                 Kafka (Strimzi Operator)                      │   │
│  │  Topics: task.created, task.updated, task.completed,          │   │
│  │          task.deleted, reminder.due, notification.sent,       │   │
│  │          user.preference.changed, projection.updated,         │   │
│  │          operation.failed, retry.scheduled, retry.exhausted,  │   │
│  │          alert.triggered, scale.recommendation,               │   │
│  │          frontend.metrics, anomaly.detected                   │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    Vercel Frontend Deployment                       │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │                    CDN & Global Edge Network                  │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  │                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              Next.js Static Site Generation                   │    │
│  │  - Chat UI                                                     │    │
│  │  - Task Dashboard                                              │    │
│  │  - Analytics Dashboard                                         │    │
│  │  - Calendar View                                               │    │
│  │  - Preference Panel                                            │    │
│  └─────────────────────────────────────────────────────────────┘    │
│  │                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │           Runtime Configuration (Environment Variables)        │    │
│  │  NEXT_PUBLIC_API_URL (points to backend)                      │    │
│  │  NEXT_PUBLIC_DAPR_HTTP_PORT (for real-time features)          │    │
│  └─────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Kafka Topics & Event Schemas

### Topic Registry

| Topic | Producer | Consumers | Retention |
|-------|----------|-----------|-----------|
| `task.created` | task-orchestrator-agent | reminder-scheduler, realtime-sync, audit-log, event-sourcing-projection | 7 days |
| `task.updated` | task-orchestrator-agent | realtime-sync, audit-log, event-sourcing-projection | 7 days |
| `task.completed` | task-orchestrator-agent | recurring-task, realtime-sync, audit-log, event-sourcing-projection | 7 days |
| `task.deleted` | task-orchestrator-agent | realtime-sync, audit-log, event-sourcing-projection | 7 days |
| `reminder.due` | reminder-scheduler-agent | notification-agent, audit-log | 3 days |
| `notification.sent` | notification-agent | realtime-sync, audit-log | 3 days |
| `user.preference.changed` | user-preference-agent | notification-agent, reminder-scheduler | 3 days |
| `projection.updated` | event-sourcing-projection-agent | realtime-sync | 1 day |
| `operation.failed` | any agent | failure-handler-agent | 7 days |
| `retry.scheduled` | failure-handler-agent | retry-scheduler-agent | 3 days |
| `retry.exhausted` | retry-scheduler-agent | failure-handler-agent | 7 days |
| `alert.triggered` | failure-handler-agent | observability-agent | 7 days |
| `scale.recommendation` | scalability-observer-agent | deployment-orchestrator-agent | 1 day |
| `frontend.metrics` | frontend-performance-agent | observability-agent | 1 day |
| `anomaly.detected` | observability-agent | (dashboard consumers) | 3 days |

### Event Schemas (CloudEvents Format)

**task.created**:
```json
{
  "specversion": "1.0",
  "type": "task.created",
  "source": "/api/tasks",
  "id": "evt-uuid-001",
  "time": "2026-02-09T10:00:00Z",
  "datacontenttype": "application/json",
  "traceparent": "00-trace-id-span-id-01",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "title": "Buy groceries",
    "priority": "high",
    "tags": ["shopping", "personal"],
    "due_date": "2026-02-15T09:00:00Z",
    "recurrence_type": "weekly",
    "recurrence_interval": 1,
    "created_at": "2026-02-09T10:00:00Z"
  }
}
```

**task.updated**:
```json
{
  "specversion": "1.0",
  "type": "task.updated",
  "source": "/api/tasks",
  "id": "evt-uuid-002",
  "time": "2026-02-09T11:00:00Z",
  "datacontenttype": "application/json",
  "traceparent": "00-trace-id-span-id-01",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "changed_fields": ["priority", "tags"],
    "before": { "priority": "medium", "tags": ["personal"] },
    "after": { "priority": "high", "tags": ["personal", "urgent"] }
  }
}
```

**task.completed**:
```json
{
  "specversion": "1.0",
  "type": "task.completed",
  "source": "/api/tasks",
  "id": "evt-uuid-003",
  "time": "2026-02-09T12:00:00Z",
  "datacontenttype": "application/json",
  "traceparent": "00-trace-id-span-id-01",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "title": "Buy groceries",
    "completed_at": "2026-02-09T12:00:00Z",
    "recurrence_type": "weekly",
    "recurrence_interval": 1
  }
}
```

**task.deleted**:
```json
{
  "specversion": "1.0",
  "type": "task.deleted",
  "source": "/api/tasks",
  "id": "evt-uuid-004",
  "time": "2026-02-09T13:00:00Z",
  "datacontenttype": "application/json",
  "traceparent": "00-trace-id-span-id-01",
  "data": {
    "task_id": "uuid",
    "user_id": "uuid",
    "deleted_at": "2026-02-09T13:00:00Z"
  }
}
```

**reminder.due**:
```json
{
  "specversion": "1.0",
  "type": "reminder.due",
  "source": "/agents/reminder-scheduler",
  "id": "evt-uuid-005",
  "time": "2026-02-15T08:45:00Z",
  "datacontenttype": "application/json",
  "traceparent": "00-trace-id-span-id-01",
  "data": {
    "reminder_id": "uuid",
    "task_id": "uuid",
    "user_id": "uuid",
    "task_title": "Buy groceries",
    "reminder_time": "2026-02-15T08:45:00Z",
    "channel": "in-app"
  }
}
```

**notification.sent**:
```json
{
  "specversion": "1.0",
  "type": "notification.sent",
  "source": "/agents/notification",
  "id": "evt-uuid-006",
  "time": "2026-02-15T08:45:02Z",
  "datacontenttype": "application/json",
  "traceparent": "00-trace-id-span-id-01",
  "data": {
    "user_id": "uuid",
    "task_id": "uuid",
    "channel": "in-app",
    "delivered_at": "2026-02-15T08:45:02Z",
    "notification_type": "reminder"
  }
}
```

**user.preference.changed**:
```json
{
  "specversion": "1.0",
  "type": "user.preference.changed",
  "source": "/api/preferences",
  "id": "evt-uuid-007",
  "time": "2026-02-09T14:00:00Z",
  "datacontenttype": "application/json",
  "data": {
    "user_id": "uuid",
    "preference_key": "notification_channel",
    "old_value": "in-app",
    "new_value": "email"
  }
}
```

---

## 3. Dapr Components YAML

### pubsub.kafka
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: pubsub
  namespace: todo-app
spec:
  type: pubsub.kafka
  version: v1
  metadata:
    - name: brokers
      value: "kafka-bootstrap.todo-app.svc.cluster.local:9092"
    - name: consumerGroup
      value: "todo-app-group"
    - name: authType
      value: "none"
    - name: maxMessageBytes
      value: "1048576"
    - name: consumeRetryInterval
      value: "200ms"
    - name: version
      value: "3.0.0"
```

### statestore.postgresql
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: statestore
  namespace: todo-app
spec:
  type: state.postgresql
  version: v1
  metadata:
    - name: connectionString
      secretKeyRef:
        name: db-credentials
        key: connection-string
    - name: tableName
      value: "dapr_state"
    - name: keyPrefix
      value: "name"
auth:
  secretStore: kubernetes
```

### secretstore.kubernetes
```yaml
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: kubernetes
  namespace: todo-app
spec:
  type: secretstores.kubernetes
  version: v1
  metadata: []
```

### OpenTelemetry Tracing Configuration
```yaml
apiVersion: dapr.io/v1alpha1
kind: Configuration
metadata:
  name: tracing-config
  namespace: todo-app
spec:
  tracing:
    samplingRate: "1"
    otel:
      endpointAddress: "jaeger-collector.todo-app.svc.cluster.local:4317"
      isSecure: false
      protocol: grpc
  metric:
    enabled: true
```

### Dead-Letter Subscription Example
```yaml
apiVersion: dapr.io/v2alpha1
kind: Subscription
metadata:
  name: task-created-sub
  namespace: todo-app
spec:
  pubsubname: pubsub
  topic: task.created
  routes:
    default: /events/task-created
  deadLetterTopic: task.created.deadletter
```

---

### Hugging Face Inference API Integration

**Description**: Fallback AI processing via Hugging Face Inference API when OpenAI is unavailable or for cost optimization.

**Configuration**:
- New AI Provider abstraction supporting both OpenAI and Hugging Face
- Environment variables for Hugging Face configuration:
  - `HF_API_KEY`: Hugging Face API token
  - `HF_MODEL_NAME`: Specific model to use (e.g., "microsoft/DialoGPT-medium")
  - `HF_API_URL`: Custom inference endpoint URL
- MCP tools compatible with both providers
- Automatic fallback mechanism when primary provider fails

**Components**:
```yaml
# Hugging Face API Secret Store (can be env vars or K8s secrets)
apiVersion: dapr.io/v1alpha1
kind: Component
metadata:
  name: hf-secrets
  namespace: todo-app
spec:
  type: secretstores.local.env
  version: v1
  metadata: []
```

**Agent Integration**:
- Agents check for HF_API_KEY availability
- Use Hugging Face when OpenAI unavailable or when explicitly configured
- Maintain same MCP tool interface regardless of provider

---

## User Scenarios & Testing

### User Story 1 - Task Priorities and Organization (Priority: P1)

A user wants to assign priority levels to tasks so they can focus on what matters most. They open the task creation form (or tell the chatbot "Add a high-priority task: prepare presentation") and the system creates the task with the correct priority. The task list visually distinguishes priorities with color-coded indicators and can be sorted by priority.

**Why this priority**: Priorities are the most fundamental organizational feature. Every subsequent feature (search, filter, analytics) builds on priority data.

**Independent Test**: Create tasks with different priorities, verify visual indicators render, sort by priority, and confirm the chatbot understands priority commands.

**Acceptance Scenarios**:

1. **Given** a user on the task creation form, **When** they select "High" priority, **Then** the task is saved with priority=high and displays a red indicator
2. **Given** a task list with mixed priorities, **When** the user sorts by priority, **Then** tasks appear in order: urgent -> high -> medium -> low
3. **Given** a user in the chat, **When** they say "Add urgent task: fix bug", **Then** the agent creates the task with priority=urgent and confirms conversationally
4. **Given** an existing task, **When** the user changes priority from low to high, **Then** a `task.updated` event is emitted and all connected clients see the change instantly

---

### User Story 2 - Tags and Categories (Priority: P1)

A user wants to tag tasks with categories (e.g., "work", "personal", "shopping") to organize and filter their task list. Tags are color-coded, multi-selectable, and filterable.

**Why this priority**: Tags enable cross-cutting organization that complements priorities. Users need both vertical (priority) and horizontal (category) organization.

**Independent Test**: Create tags, assign them to tasks, filter the task list by tag, and verify color rendering.

**Acceptance Scenarios**:

1. **Given** a user on the task form, **When** they select multiple tags, **Then** the task is saved with all selected tags and displays colored chips
2. **Given** a task list, **When** the user clicks a tag filter, **Then** only tasks with that tag are shown
3. **Given** the chatbot, **When** a user says "Show me all work tasks", **Then** the agent returns tasks filtered by the "work" tag
4. **Given** a user, **When** they create a new tag "health" with color green, **Then** the tag is persisted and immediately available for assignment

---

### User Story 3 - Due Dates with Calendar UI (Priority: P1)

A user wants to set due dates on tasks and see them in a calendar view. The calendar shows task density per day, overdue tasks are highlighted, and due dates can be set via the chatbot.

**Why this priority**: Due dates are essential for time-based organization and are a prerequisite for reminders and recurring tasks.

**Independent Test**: Set due dates on tasks, view the calendar, verify overdue highlighting, and test chatbot date parsing.

**Acceptance Scenarios**:

1. **Given** a task creation form, **When** the user picks a date from the calendar widget, **Then** the task is saved with that due_date
2. **Given** a task with a past due date, **When** the user views their task list, **Then** the overdue task shows a warning indicator
3. **Given** the chatbot, **When** a user says "Add task: dentist appointment on March 5th", **Then** the agent creates the task with due_date=2026-03-05
4. **Given** the calendar view, **When** multiple tasks fall on the same date, **Then** the date cell shows a count badge and clicking reveals all tasks

---

### User Story 4 - Advanced Search, Filter, and Sort (Priority: P2)

A user wants to find specific tasks quickly using keyword search combined with filters (priority, tag, status, due date range) and multiple sort options.

**Why this priority**: Builds on P1 features (priorities, tags, dates) to provide powerful discovery. Less critical than creating the data it searches.

**Independent Test**: Search for tasks by keyword, apply combined filters, sort results, and verify result accuracy.

**Acceptance Scenarios**:

1. **Given** a user with 50+ tasks, **When** they search "groceries" with filter priority=high, **Then** only high-priority tasks containing "groceries" appear
2. **Given** filters for tag="work" AND status=incomplete AND due_date before March 2026, **When** applied together, **Then** only matching tasks are returned
3. **Given** the chatbot, **When** a user says "Show my overdue high-priority tasks", **Then** the agent applies the correct filters and returns results
4. **Given** search results, **When** the user sorts by due_date ascending, **Then** tasks are ordered by nearest due date first

---

### User Story 5 - Recurring Tasks (Priority: P2)

A user wants tasks that automatically reschedule after completion. They can set daily, weekly, or monthly recurrence rules. When a recurring task is completed, the next occurrence is created automatically.

**Why this priority**: Recurring tasks add significant value for routine task management but depend on due dates (P1) being implemented first.

**Independent Test**: Create a recurring task, complete it, verify the next occurrence is auto-created with the correct due date.

**Acceptance Scenarios**:

1. **Given** a task with recurrence_type=weekly, **When** the user completes it, **Then** a new task is created with due_date +7 days from the original
2. **Given** a monthly recurring task due Jan 31, **When** completed, **Then** the next occurrence is due Feb 28 (handles month-end correctly)
3. **Given** the chatbot, **When** a user says "Create a daily task: take vitamins", **Then** the agent creates a task with recurrence_type=daily
4. **Given** a recurring task, **When** the user edits the recurrence to "none", **Then** the task stops recurring after next completion
5. **Given** a recurring task completed, **When** the `task.completed` event is consumed, **Then** recurring-task-agent creates the next occurrence and a `task.created` event is emitted

---

### User Story 6 - Time-Based Reminders (Priority: P2)

A user wants reminders before task due dates. Reminders trigger in-app notifications (toast + badge) and optionally email. Users can configure reminder offset (e.g., 15 minutes before, 1 hour before, 1 day before).

**Why this priority**: Reminders complete the due date feature and keep users engaged. Depends on due dates (P1) and notification infrastructure.

**Independent Test**: Set a reminder on a task, wait for it to fire, verify in-app notification appears.

**Acceptance Scenarios**:

1. **Given** a task with due_date and reminder enabled, **When** the reminder time arrives, **Then** the user receives an in-app notification within 5 seconds
2. **Given** a user with email notifications enabled, **When** a reminder fires, **Then** an email is sent in addition to the in-app alert
3. **Given** the chatbot, **When** a user says "Remind me about dentist 1 hour before", **Then** a reminder is scheduled for due_date - 1 hour
4. **Given** a reminder that fires, **When** the system processes it, **Then** events flow: reminder.due -> notification-agent -> notification.sent -> realtime-sync -> client toast
5. **Given** a task is completed before the reminder fires, **When** the task.completed event is consumed, **Then** the reminder is cancelled

---

### User Story 7 - Real-Time Synchronization (Priority: P2)

A user has the app open on multiple devices (phone and laptop). When they complete a task on one device, all other devices update instantly without refresh.

**Why this priority**: Real-time sync is critical for multi-device UX. It depends on the event infrastructure being in place.

**Independent Test**: Open two browser tabs, make a task change in one, verify the other updates within 2 seconds.

**Acceptance Scenarios**:

1. **Given** two clients connected, **When** Client A creates a task, **Then** Client B sees the new task within 2 seconds
2. **Given** two clients, **When** Client A completes a task, **Then** Client B's task list updates with the completion status
3. **Given** a client that disconnects and reconnects, **When** reconnection occurs, **Then** the client receives all missed updates
4. **Given** realtime-sync-agent, **When** it receives a task.updated event, **Then** it broadcasts only to the task owner's connected clients (security isolation)

---

### User Story 8 - Event-Driven Notifications (Priority: P3)

A user receives instant notifications when significant events occur: task created by a collaborator, task approaching deadline, task overdue, daily summary digest.

**Why this priority**: Extends reminders to cover all event types. Lower priority because reminders (P2) cover the most critical notification use case.

**Independent Test**: Trigger a task event, verify in-app notification appears with correct content and action link.

**Acceptance Scenarios**:

1. **Given** a task approaching due date (within 24 hours), **When** the system checks, **Then** the user receives a "task approaching deadline" notification
2. **Given** a completed task that was overdue, **When** marked complete, **Then** no overdue notification is sent for that task
3. **Given** notification preferences set to "email only", **When** a notification is triggered, **Then** only email is sent (no in-app toast)

---

### User Story 9 - Analytics Dashboard (Priority: P3)

A user wants to see their productivity metrics: tasks completed this week/month, completion streaks, tasks by priority distribution, tasks by tag distribution, overdue task count, and completion trends over time.

**Why this priority**: Analytics provide valuable insights but are not essential for core task management. They read from projections built by event-sourcing-projection-agent.

**Independent Test**: View the analytics dashboard, verify charts render with real data, check streak calculation accuracy.

**Acceptance Scenarios**:

1. **Given** a user who completed 5 tasks today, **When** they view the analytics dashboard, **Then** today's count shows 5 with a chart update
2. **Given** a user with a 7-day completion streak, **When** they view their profile, **Then** the streak count shows 7
3. **Given** tasks distributed across priorities, **When** the user views the priority chart, **Then** a pie/bar chart shows accurate distribution
4. **Given** the chatbot, **When** a user asks "How productive was I this week?", **Then** the agent returns a summary with task counts and streak info

---

### User Story 10 - User Preferences and Personalization (Priority: P3)

A user wants to customize their experience: notification channel (in-app, email, both), default reminder offset, default priority, timezone, sort order preference, and theme (light/dark).

**Why this priority**: Personalization enhances UX but the system works with sensible defaults. Lower priority than core features.

**Independent Test**: Change preferences in the settings panel, verify preferences are applied on next interaction.

**Acceptance Scenarios**:

1. **Given** a user in settings, **When** they change default priority to "high", **Then** new tasks default to high priority
2. **Given** a user who sets timezone to "Asia/Karachi", **When** they view due dates, **Then** dates display in PKT timezone
3. **Given** a user who changes notification channel to "email", **When** a reminder fires, **Then** email is sent (not just in-app)
4. **Given** preference changes, **When** saved, **Then** a `user.preference.changed` event is emitted

---

### User Story 11 - AI Chatbot Enhanced Features (Priority: P3)

The existing AI chatbot is enhanced to understand and execute all new features: set priorities, assign tags, create recurring tasks, set reminders, query analytics, and update preferences — all through natural language.

**Why this priority**: The chatbot already handles basic CRUD. Extending it for advanced features is incremental but depends on all other features being implemented first.

**Independent Test**: Interact with chatbot for each advanced feature, verify correct tool invocation and conversational response.

**Acceptance Scenarios**:

1. **Given** the chatbot, **When** a user says "Add a high-priority weekly task: team standup, due Monday", **Then** a task is created with priority=high, recurrence_type=weekly, due_date=next Monday
2. **Given** the chatbot, **When** a user says "Tag all my work tasks as urgent", **Then** the agent bulk-updates tags
3. **Given** the chatbot, **When** a user says "What's my completion rate this week?", **Then** the agent queries analytics and responds conversationally
4. **Given** the chatbot, **When** a user says "Set my default reminder to 30 minutes before", **Then** user preferences are updated

---

### Edge Cases

- What happens when a user creates a recurring task without a due date? System MUST reject and prompt for a due date.
- What happens when a monthly recurring task falls on the 31st and the next month has 30 days? System MUST use the last day of the month.
- What happens when a reminder is scheduled but the task is deleted before it fires? The reminder MUST be cancelled.
- What happens when Kafka is temporarily unavailable? Events MUST be retried via failure-handler-agent with exponential backoff. The user MUST NOT see an error for eventual-consistency operations.
- What happens when two clients update the same task simultaneously? Last-write-wins with conflict event emitted. Client receives latest state via real-time sync.
- What happens when a user has 1000+ tasks? Search/filter MUST return results within 1 second via event-sourcing-projection read models.
- What happens when the circuit breaker is open for a downstream service? System MUST return cached/stale data or a graceful degradation message.

---

## 4. Feature-by-Feature Implementation

### 4.1 Task Priorities

**Description**: Add priority levels (low, medium, high, urgent) to tasks with visual color indicators and sortable list views.

**Frontend Flow**:
- Priority selector component (dropdown with color dots) on task create/edit forms
- Task list items display color-coded priority badge (green=low, yellow=medium, orange=high, red=urgent)
- Sort-by-priority option in task list header
- Chatbot parses priority from natural language

**Backend Flow**:
- Extend Task SQLModel: add `priority` field (enum: low, medium, high, urgent, default=medium)
- Extend TaskCreate/TaskUpdate schemas with optional `priority` field
- Extend GET /tasks endpoint with `sort_by=priority` query param
- task-orchestrator-agent validates priority enum values
- TaskCRUDSkill persists priority
- TaskEventEmitSkill includes priority in task.created and task.updated events
- DaprPubSubSkill publishes events to Kafka
- OpenTelemetryTracingSkill traces the full operation
- audit-log-agent records priority changes
- event-sourcing-projection-agent builds tasks-by-priority projection

**Agents**: task-orchestrator-agent, audit-log-agent, event-sourcing-projection-agent, realtime-sync-agent
**Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.2 Tags / Categories

**Description**: Multi-select tagging system with user-defined tags, color coding, and tag-based filtering.

**Frontend Flow**:
- Tag management panel (create tag with name + color)
- Multi-select tag chips on task create/edit forms
- Tag filter bar on task list (click tag to filter)
- Tag color-coded chips displayed on task cards

**Backend Flow**:
- New Tag SQLModel: id, user_id, name, color (hex), created_at
- New task_tags junction table: task_id, tag_id
- New API endpoints: POST /tags, GET /tags, DELETE /tags/{id}
- Extend Task response to include tags array
- Extend GET /tasks with `tag` query param for filtering
- task-orchestrator-agent manages tag assignment to tasks
- TaskEventEmitSkill includes tags in task.created/task.updated events
- event-sourcing-projection-agent builds tasks-by-tag projection

**Agents**: task-orchestrator-agent, audit-log-agent, event-sourcing-projection-agent, realtime-sync-agent
**Skills**: TaskCRUDSkill, TaskEventEmitSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.3 Due Dates with Calendar UI

**Description**: Timezone-aware due dates on tasks with a calendar view showing task distribution and overdue indicators.

**Frontend Flow**:
- Date picker component on task create/edit forms
- Calendar view page showing tasks plotted on dates
- Overdue indicator (red highlight) for past-due tasks
- "Today", "This Week", "Overdue" quick filter buttons

**Backend Flow**:
- Extend Task SQLModel: add `due_date` field (datetime | None, default=None)
- Extend TaskCreate/TaskUpdate schemas with optional `due_date`
- Extend GET /tasks with `due_before`, `due_after` query params
- New GET /tasks/calendar endpoint returning tasks grouped by date
- task-orchestrator-agent validates due_date is not in the past (for new tasks)
- TaskEventEmitSkill includes due_date in events
- When task.created has due_date, reminder-scheduler-agent schedules a reminder

**Agents**: task-orchestrator-agent, reminder-scheduler-agent, audit-log-agent, event-sourcing-projection-agent, realtime-sync-agent
**Skills**: TaskCRUDSkill, TaskEventEmitSkill, ReminderSchedulingSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.4 Advanced Search, Filter, and Sort

**Description**: Combined keyword search + multi-filter + multi-sort capabilities for efficient task discovery.

**Frontend Flow**:
- Search bar with debounced input (300ms)
- Filter panel with checkboxes/dropdowns for: priority, tags, status, date range
- Sort selector: created_at, due_date, priority, title (asc/desc)
- Active filter chips showing applied filters (click to remove)
- Results count indicator

**Backend Flow**:
- Extend GET /tasks with query params: `q` (keyword), `priority`, `tag`, `status`, `due_before`, `due_after`, `sort_by`, `sort_order`, `page`, `limit`
- task-query-agent reads from pre-built projections for fast queries
- event-sourcing-projection-agent maintains searchable projections
- DaprStateSkill for projection reads
- Full-text search on task title field

**Agents**: task-query-agent, event-sourcing-projection-agent, task-orchestrator-agent
**Skills**: DaprStateSkill, DaprServiceInvocationSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill, PerformanceMetricsSkill

---

### 4.5 Recurring Tasks

**Description**: Tasks that auto-reschedule on completion with configurable recurrence rules (daily, weekly, monthly).

**Frontend Flow**:
- Recurrence selector on task create/edit: None, Daily, Weekly, Monthly
- Recurring task indicator icon on task cards
- "Next occurrence" label on recurring tasks
- Chatbot parses "daily", "weekly", "monthly" from natural language

**Backend Flow**:
- Extend Task SQLModel: add `recurrence_type` (enum: none, daily, weekly, monthly, default=none) and `recurrence_interval` (int, default=1)
- Extend TaskCreate/TaskUpdate schemas with optional recurrence fields
- task-orchestrator-agent emits task.completed with recurrence data
- recurring-task-agent consumes task.completed:
  1. Checks if recurrence_type != none
  2. Uses RecurringRuleEvaluationSkill to calculate next due_date
  3. Invokes task-orchestrator-agent via DaprServiceInvocationSkill to create new task
  4. New task inherits title, priority, tags, recurrence rule
- CircuitBreakerSkill wraps the service invocation
- New task.created event triggers reminder-scheduler-agent if due_date exists

**Agents**: task-orchestrator-agent, recurring-task-agent, reminder-scheduler-agent, audit-log-agent, realtime-sync-agent
**Skills**: TaskCRUDSkill, TaskEventEmitSkill, RecurringRuleEvaluationSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprStateSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.6 Time-Based Reminders

**Description**: Schedule reminders before task due dates using Dapr Jobs API. Reminders trigger in-app notifications and optional email.

**Frontend Flow**:
- Reminder toggle on task create/edit with offset selector (15min, 30min, 1hr, 1day, custom)
- In-app notification toast when reminder fires
- Notification bell icon with unread count badge
- Notification panel showing recent notifications

**Backend Flow**:
- New Reminder SQLModel: id, task_id, user_id, reminder_time, status (pending/fired/cancelled)
- New API endpoint: POST /reminders, DELETE /reminders/{id}
- reminder-scheduler-agent:
  1. Consumes task.created with due_date
  2. Queries user-preference-agent for reminder offset (default 15min)
  3. Uses ReminderSchedulingSkill to schedule via Dapr Jobs API
  4. When job fires, emits reminder.due event
- notification-agent:
  1. Consumes reminder.due
  2. Queries user-preference-agent for notification channel
  3. Uses NotificationDispatchSkill to deliver (in-app push via WebSocket, email via SMTP)
  4. Emits notification.sent event
- realtime-sync-agent broadcasts notification to client via RealtimeBroadcastSkill
- On task.completed or task.deleted, reminder-scheduler-agent cancels pending reminders

**Agents**: reminder-scheduler-agent, notification-agent, user-preference-agent, realtime-sync-agent, audit-log-agent, failure-handler-agent
**Skills**: ReminderSchedulingSkill, NotificationDispatchSkill, RealtimeBroadcastSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprStateSkill, DaprSecretsSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.7 Real-Time Synchronization

**Description**: All connected clients receive instant updates when any task state changes, using WebSocket connections backed by Dapr Pub/Sub events.

**Frontend Flow**:
- WebSocket connection established on app load
- Automatic reconnection with exponential backoff on disconnect
- Optimistic UI updates on user actions, confirmed by server events
- Missed-event recovery on reconnection (request latest state)

**Backend Flow**:
- WebSocket endpoint: /ws/{user_id}
- realtime-sync-agent:
  1. Consumes ALL task.* events via DaprPubSubSkill
  2. Filters by user_id (security isolation)
  3. Uses RealtimeBroadcastSkill to push to correct WebSocket connections
  4. Batches rapid events (debounce 100ms)
- Backend maintains WebSocket connection registry per user
- On client reconnection, sends full task state snapshot

**Agents**: realtime-sync-agent, task-orchestrator-agent
**Skills**: RealtimeBroadcastSkill, DaprPubSubSkill, DaprServiceInvocationSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.8 Event-Driven Notifications

**Description**: Instant push/in-app notifications for all significant events beyond just reminders: task approaching deadline, task overdue, completion milestones.

**Frontend Flow**:
- Notification center (bell icon + dropdown panel)
- Toast notifications for real-time events
- Notification categories: reminders, deadlines, achievements
- Mark as read / dismiss functionality

**Backend Flow**:
- Extend notification-agent to handle multiple event types:
  - reminder.due -> "Task X is due in 15 minutes"
  - task.completed (milestone) -> "You completed 10 tasks this week!"
  - Overdue check (scheduled daily) -> "Task X is overdue"
- NotificationDispatchSkill formats messages per channel and type
- DaprPubSubSkill delivers events
- audit-log-agent records all notifications

**Agents**: notification-agent, observability-agent, user-preference-agent, realtime-sync-agent, audit-log-agent
**Skills**: NotificationDispatchSkill, RealtimeBroadcastSkill, DaprPubSubSkill, DaprStateSkill, DaprSecretsSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.9 Analytics Dashboard

**Description**: Visual dashboard showing task completion statistics, productivity streaks, priority/tag distribution charts, and completion trends.

**Frontend Flow**:
- Dashboard page with charts (using Recharts or lightweight chart library)
- Cards: Tasks Today, This Week, This Month, Streak Count, Overdue Count
- Charts: Completion trend (line), Priority distribution (pie), Tag distribution (bar)
- Date range selector for trend analysis
- Chatbot responds to "How productive was I?" queries

**Backend Flow**:
- event-sourcing-projection-agent builds analytics projections:
  - completion-by-day, completion-by-week, completion-by-month
  - tasks-by-priority-count, tasks-by-tag-count
  - streak-tracker (consecutive days with completions)
- New API endpoint: GET /analytics (reads from projections)
- task-query-agent serves analytics queries from projections
- DaprStateSkill stores projections
- PerformanceMetricsSkill tracks query performance

**Agents**: event-sourcing-projection-agent, task-query-agent, observability-agent
**Skills**: ProjectionBuildSkill, DaprStateSkill, DaprPubSubSkill, PerformanceMetricsSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.10 User Preferences and Personalization

**Description**: User-configurable settings for notification channel, default priority, timezone, reminder offset, sort order, and theme.

**Frontend Flow**:
- Settings page with sections: Notifications, Task Defaults, Display, Theme
- Theme toggle (light/dark) in app header
- Changes save immediately with optimistic UI

**Backend Flow**:
- New user_preferences table or Dapr State Store entries per user
- New API endpoints: GET /preferences, PATCH /preferences
- user-preference-agent:
  1. Stores preferences via DaprStateSkill
  2. Emits user.preference.changed event via DaprPubSubSkill
  3. Responds to DaprServiceInvocationSkill queries from other agents
- Default preferences: notification_channel="in-app", timezone="UTC", reminder_offset=15, default_priority="medium", sort_order="created_at_desc", theme="light"

**Agents**: user-preference-agent, realtime-sync-agent, audit-log-agent
**Skills**: DaprStateSkill, DaprPubSubSkill, DaprServiceInvocationSkill, DaprSecretsSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill

---

### 4.11 Resilience and Failure Handling

**Description**: System-wide resilience through circuit breakers, retry with backoff, failure persistence, and graceful degradation.

**Frontend Flow**:
- Retry indicators on failed operations ("Retrying..." toast)
- Graceful degradation messages when services are down
- Stale data indicators when circuit breaker is open

**Backend Flow**:
- failure-handler-agent:
  1. Consumes operation.failed events from any agent
  2. Uses FailurePersistenceSkill to store failure records
  3. Checks CircuitBreakerSkill state
  4. Emits retry.scheduled event with backoff (1s, 2s, 4s, 8s, 16s, max 5 attempts)
- retry-scheduler-agent:
  1. Consumes retry.scheduled
  2. Uses RetrySchedulerSkill to wait for backoff interval
  3. Re-emits the original event for reprocessing
  4. If max retries exceeded, emits retry.exhausted
- failure-handler-agent handles retry.exhausted by emitting alert.triggered

**Agents**: failure-handler-agent, retry-scheduler-agent, observability-agent, audit-log-agent
**Skills**: FailurePersistenceSkill, RetrySchedulerSkill, CircuitBreakerSkill, DaprPubSubSkill, DaprStateSkill, OpenTelemetryTracingSkill

---

### 4.12 Observability and Monitoring

**Description**: Full distributed tracing, metrics, and health monitoring across all services and agents.

**Frontend Flow**:
- Admin health dashboard (optional) showing service status
- Client-side performance telemetry (Core Web Vitals) sent to backend

**Backend Flow**:
- observability-agent:
  1. Consumes ALL events passively for event rate metrics
  2. Uses DaprMonitoringSkill to check sidecar health
  3. Uses PerformanceMetricsSkill to aggregate metrics
  4. Emits anomaly.detected when thresholds breached (p95 > 500ms, error > 1%)
- scalability-observer-agent:
  1. Monitors Prometheus metrics (CPU, memory, request rate)
  2. Emits scale.recommendation for HPA adjustments
- OpenTelemetryTracingSkill instruments every agent operation
- All services export Prometheus metrics at /metrics
- Jaeger collects distributed traces

**Agents**: observability-agent, scalability-observer-agent, frontend-performance-agent
**Skills**: DaprMonitoringSkill, PerformanceMetricsSkill, OpenTelemetryTracingSkill, DaprPubSubSkill, CircuitBreakerSkill

---

### 4.13 Local Production-Ready Deployment Architecture

**Description**: Production deployment using Docker Compose for local development/prod, Minikube for local K8s testing, and Vercel for frontend deployment. Supports Hugging Face Inference API fallback.

**Docker Compose Configuration**:
- `docker-compose.yml`: Multi-container orchestration with:
  - postgres:15-alpine (PostgreSQL database)
  - zookeeper:3.8 (Kafka dependency)
  - kafka:3.5 (Message broker for Dapr Pub/Sub)
  - jaegertracing/all-in-one:latest (Distributed tracing)
  - prom/prometheus:latest (Metrics collection)
  - grafana/grafana-enterprise (Dashboard visualization)
  - backend service (FastAPI app with Dapr sidecar)
  - frontend service (Next.js app with Dapr sidecar)
- Health checks for all services
- Resource limits and restart policies
- Volume mounts for persistent data
- Network configuration for service discovery

**Minikube Kubernetes Configuration**:
- Minikube cluster with Dapr installed via CLI
- Strimzi Kafka operator for message broker
- Dapr component installations (pubsub, statestore, secrets)
- Helm charts for service deployments with:
  - Deployments with replica count >= 2
  - Horizontal Pod Autoscaler configurations
  - Service accounts and RBAC
  - Ingress configuration with nginx controller
- Namespace isolation (todo-app namespace)

**Vercel Frontend Deployment**:
- Static site generation via Next.js SSG/SSR
- Environment variable configuration for API endpoints
- Global CDN distribution
- Automatic deployments from main branch
- Custom domain support
- SSL certificate management

**Hugging Face Integration**:
- Fallback AI processing via Hugging Face Inference API
- Configurable AI provider (OpenAI/Hugging Face)
- Rate limiting and retry mechanisms
- Model selection capability (various transformer models)

**Backend Flow**:
- deployment-orchestrator-agent:
  1. Uses DeploymentBlueprintSkill to generate:
     - Docker Compose configuration with all services
     - Minikube deployment manifests with Dapr annotations
     - Vercel deployment configuration for frontend
     - Environment variable templates for all environments
  2. Supports three deployment targets:
     - `compose`: Docker Compose local deployment
     - `minikube`: Kubernetes deployment with Dapr and Strimzi
     - `vercel`: Frontend-only deployment to Vercel
  3. Validates configurations before deployment
  4. Performs health checks post-deployment
  5. Supports rollback mechanisms for each target

**Agents**: deployment-orchestrator-agent, scalability-observer-agent, observability-agent
**Skills**: DeploymentBlueprintSkill (enhanced for 3 targets), DaprSecretsSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill, PerformanceMetricsSkill

---

## Requirements

### Functional Requirements

- **FR-001**: System MUST support task priority levels (low, medium, high, urgent) with visual color indicators
- **FR-002**: System MUST support user-defined tags with color coding and multi-select assignment
- **FR-003**: System MUST support due dates with timezone awareness and calendar view
- **FR-004**: System MUST support full-text keyword search across task titles
- **FR-005**: System MUST support combined filtering by priority, tag, status, and due date range
- **FR-006**: System MUST support sorting by created_at, due_date, priority, and title (asc/desc)
- **FR-007**: System MUST support recurring tasks with daily, weekly, and monthly recurrence rules
- **FR-008**: System MUST auto-create the next occurrence when a recurring task is completed
- **FR-009**: System MUST support time-based reminders scheduled via Dapr Jobs API
- **FR-010**: System MUST deliver notifications via in-app toast and optional email
- **FR-011**: System MUST synchronize task state across all connected clients in real-time via WebSocket
- **FR-012**: System MUST emit CloudEvents for every state change via Dapr Pub/Sub (Kafka)
- **FR-013**: System MUST display analytics dashboard with completion stats, streaks, and distribution charts
- **FR-014**: System MUST support user preferences (notification channel, timezone, defaults, theme)
- **FR-015**: System MUST handle all advanced features through the AI chatbot via natural language
- **FR-016**: System MUST implement circuit breakers on all cross-service calls
- **FR-017**: System MUST retry failed operations with exponential backoff (max 5 attempts)
- **FR-018**: System MUST maintain immutable audit log of all domain events
- **FR-019**: System MUST propagate W3C Trace Context across all service calls and events
- **FR-020**: System MUST support containerized deployment via Docker Compose with all services (PostgreSQL, Kafka, Jaeger, Prometheus, backend, frontend)
- **FR-021**: System MUST support Kubernetes deployment via Minikube with Dapr and Strimzi Kafka operator
- **FR-022**: System MUST support frontend-only deployment to Vercel with global CDN distribution
- **FR-023**: System MUST support Hugging Face Inference API as fallback for AI processing when OpenAI unavailable
- **FR-024**: System MUST allow configurable AI provider (OpenAI or Hugging Face) via environment variables

### Key Entities

- **Task**: Core entity — id, user_id, title, completed, priority, due_date, recurrence_type, recurrence_interval, created_at, completed_at. Owned by a User.
- **Tag**: User-defined category — id, user_id, name, color. Many-to-many with Tasks via task_tags.
- **Reminder**: Scheduled notification — id, task_id, user_id, reminder_time, status (pending/fired/cancelled).
- **UserPreference**: User settings — user_id, preference_key, preference_value. Stored in Dapr State or database.
- **AuditLog**: Immutable event record — id, event_type, user_id, payload, trace_id, timestamp.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can create tasks with priority, tags, due date, and recurrence in under 10 seconds via UI or chatbot
- **SC-002**: Search and filter results return within 1 second for users with up to 1000 tasks
- **SC-003**: Real-time sync delivers updates to all connected clients within 2 seconds of the state change
- **SC-004**: Reminders fire within 5 seconds of the scheduled time
- **SC-005**: All 13 mandatory agents are deployed and processing events in production
- **SC-006**: All 15 Kafka topics are active with producers and consumers verified
- **SC-007**: End-to-end distributed traces are visible in Jaeger for every user request
- **SC-008**: System handles 500 concurrent users without degradation (p95 latency < 500ms)
- **SC-009**: Failed operations are retried automatically with zero manual intervention
- **SC-010**: Lighthouse Performance score remains >= 90 after all frontend additions
- **SC-011**: All services deploy successfully via Docker Compose with health checks passing
- **SC-012**: All services deploy successfully to Minikube Kubernetes with Dapr and Kafka operational
- **SC-013**: Frontend deploys successfully to Vercel with global CDN distribution verified
- **SC-014**: Hugging Face Inference API serves as fallback when OpenAI unavailable with seamless switching
- **SC-015**: Analytics dashboard displays accurate completion stats within 30 seconds of events occurring

---

## Assumptions

- Existing authentication system (JWT-based) will be reused without modification
- Neon PostgreSQL supports the additional tables (tags, task_tags, reminders) without migration issues
- OpenAI Agents SDK can be extended with new MCP tools for priority, tags, recurring, and reminder operations
- Kafka via Strimzi operator will be deployed on Minikube Kubernetes cluster
- Kafka via Docker Compose will be used for local development
- Email notifications use an SMTP provider configured via Dapr secrets (not required for MVP — in-app notifications are sufficient)
- Recharts or similar lightweight chart library will be used for analytics (no heavy dependencies)
- Hugging Face Inference API can serve as fallback for AI processing when OpenAI unavailable
- Voice input and Urdu support are stretch goals, not required for spec completion
