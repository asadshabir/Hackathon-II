# API Contracts: Phase V Advanced Features

**Branch**: `003-advanced-features` | **Date**: 2026-02-09

## Existing Endpoints (Extended)

### GET /tasks

**Query Parameters** (new additions in bold):

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| filter | string | "all" | all, pending, completed |
| **q** | string? | null | Keyword search on title (ILIKE) |
| **priority** | string? | null | Filter by priority (low/medium/high/urgent) |
| **tag** | string? | null | Filter by tag name |
| **due_before** | datetime? | null | Tasks due before this date |
| **due_after** | datetime? | null | Tasks due after this date |
| **sort_by** | string | "created_at" | created_at, due_date, priority, title |
| **sort_order** | string | "desc" | asc, desc |
| **page** | int | 1 | Page number |
| **limit** | int | 50 | Items per page (max 100) |

**Response** (extended):
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "Buy groceries",
      "completed": false,
      "priority": "high",
      "due_date": "2026-02-15T09:00:00Z",
      "recurrence_type": "weekly",
      "recurrence_interval": 1,
      "tags": [
        {"id": "uuid", "name": "shopping", "color": "#10B981"}
      ],
      "created_at": "2026-02-09T10:00:00Z",
      "completed_at": null
    }
  ],
  "count": 1,
  "page": 1,
  "total_pages": 1
}
```

### POST /tasks

**Request** (extended):
```json
{
  "title": "Buy groceries",
  "priority": "high",
  "due_date": "2026-02-15T09:00:00Z",
  "recurrence_type": "weekly",
  "recurrence_interval": 1,
  "tag_ids": ["uuid-1", "uuid-2"]
}
```

All new fields are optional. Defaults: priority=medium, due_date=null, recurrence_type=none, recurrence_interval=1, tag_ids=[].

### PATCH /tasks/{task_id}

**Request** (extended):
```json
{
  "title": "Updated title",
  "completed": true,
  "priority": "urgent",
  "due_date": "2026-02-20T09:00:00Z",
  "recurrence_type": "daily",
  "recurrence_interval": 1,
  "tag_ids": ["uuid-1"]
}
```

All fields optional. Only provided fields are updated.

---

## New Endpoints

### Tags

#### POST /tags
Create a new tag.

**Request**:
```json
{
  "name": "work",
  "color": "#3B82F6"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "name": "work",
  "color": "#3B82F6",
  "created_at": "2026-02-09T10:00:00Z"
}
```

**Errors**: 400 (empty name), 409 (duplicate name for user)

#### GET /tags
List all tags for the current user.

**Response** (200):
```json
{
  "tags": [
    {"id": "uuid", "name": "work", "color": "#3B82F6", "created_at": "..."},
    {"id": "uuid", "name": "personal", "color": "#10B981", "created_at": "..."}
  ],
  "count": 2
}
```

#### DELETE /tags/{tag_id}
Delete a tag and remove associations.

**Response** (200):
```json
{"message": "Tag 'work' deleted successfully"}
```

**Errors**: 404 (tag not found)

---

### Reminders

#### POST /reminders
Create a reminder for a task.

**Request**:
```json
{
  "task_id": "uuid",
  "reminder_time": "2026-02-15T08:45:00Z"
}
```

**Response** (201):
```json
{
  "id": "uuid",
  "task_id": "uuid",
  "reminder_time": "2026-02-15T08:45:00Z",
  "status": "pending",
  "created_at": "2026-02-09T10:00:00Z"
}
```

**Errors**: 400 (reminder_time in past), 404 (task not found)

#### DELETE /reminders/{reminder_id}
Cancel a pending reminder.

**Response** (200):
```json
{"message": "Reminder cancelled"}
```

**Errors**: 404 (reminder not found), 400 (already fired)

---

### Analytics

#### GET /analytics
Get user's productivity analytics.

**Response** (200):
```json
{
  "completion_today": 5,
  "completion_week": 23,
  "completion_month": 89,
  "streak": {"current": 7, "longest": 14},
  "priority_distribution": {"low": 10, "medium": 30, "high": 15, "urgent": 5},
  "tag_distribution": {"work": 25, "personal": 15, "shopping": 10},
  "overdue_count": 3,
  "trends": [
    {"date": "2026-02-03", "completed": 4},
    {"date": "2026-02-04", "completed": 6}
  ]
}
```

---

### Preferences

#### GET /preferences
Get current user's preferences.

**Response** (200):
```json
{
  "notification_channel": "in-app",
  "timezone": "UTC",
  "reminder_offset_minutes": 15,
  "default_priority": "medium",
  "sort_order": "created_at_desc",
  "theme": "light"
}
```

#### PATCH /preferences
Update user preferences.

**Request**:
```json
{
  "notification_channel": "email",
  "theme": "dark"
}
```

Only provided keys are updated.

**Response** (200):
```json
{
  "notification_channel": "email",
  "timezone": "UTC",
  "reminder_offset_minutes": 15,
  "default_priority": "medium",
  "sort_order": "created_at_desc",
  "theme": "dark"
}
```

---

### WebSocket

#### WS /ws/{user_id}
Real-time event stream for a user.

**Message format** (server -> client):
```json
{
  "type": "task.created",
  "data": {
    "task_id": "uuid",
    "title": "New task",
    "priority": "high"
  },
  "timestamp": "2026-02-09T10:00:00Z"
}
```

**Event types**: task.created, task.updated, task.completed, task.deleted, notification.sent, projection.updated

---

### Dapr Subscription Endpoints (Internal)

#### GET /dapr/subscribe
Returns Dapr subscription configuration.

#### POST /events/task-created
Handler for task.created events.

#### POST /events/task-updated
Handler for task.updated events.

#### POST /events/task-completed
Handler for task.completed events.

#### POST /events/task-deleted
Handler for task.deleted events.

#### POST /events/reminder-due
Handler for reminder.due events.

---

## Error Response Format

All errors follow this format:
```json
{
  "detail": "Human-readable error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error |
| 401 | Not authenticated |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Internal server error |
