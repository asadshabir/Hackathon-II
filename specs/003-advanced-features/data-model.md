# Data Model: Phase V Advanced Features

**Branch**: `003-advanced-features` | **Date**: 2026-02-09

## Existing Entities (Extended)

### Task (extended)

| Field | Type | Default | Constraints | Notes |
|-------|------|---------|-------------|-------|
| id | UUID | uuid4() | PK | Existing |
| user_id | UUID | - | FK -> users.id, indexed | Existing |
| title | str | - | max_length=500 | Existing |
| completed | bool | False | - | Existing |
| created_at | datetime | utcnow() | - | Existing |
| completed_at | datetime? | None | - | Existing |
| **priority** | str | "medium" | enum: low/medium/high/urgent | **NEW** |
| **due_date** | datetime? | None | nullable | **NEW** |
| **recurrence_type** | str | "none" | enum: none/daily/weekly/monthly | **NEW** |
| **recurrence_interval** | int | 1 | min=1 | **NEW** |

**Relationships**: User (many-to-one), Tags (many-to-many via task_tags)

**State transitions**:
- Created (completed=False) -> Completed (completed=True, completed_at set)
- Completed -> Uncompleted (completed=False, completed_at=None)
- Any state -> Deleted (removed from DB)

**Validation rules**:
- title: non-empty, max 500 chars
- priority: must be one of low/medium/high/urgent
- due_date: if set, must be valid datetime (past dates allowed for editing)
- recurrence_type: if not "none", due_date MUST be set
- recurrence_interval: minimum 1

---

## New Entities

### Tag

| Field | Type | Default | Constraints | Notes |
|-------|------|---------|-------------|-------|
| id | UUID | uuid4() | PK | |
| user_id | UUID | - | FK -> users.id, indexed | Scoped to user |
| name | str | - | max_length=50, unique per user | |
| color | str | "#6B7280" | 7-char hex color | |
| created_at | datetime | utcnow() | - | |

**Relationships**: Tasks (many-to-many via task_tags)

**Validation rules**:
- name: non-empty, max 50 chars, unique within user's tags
- color: valid hex color string (#RRGGBB format)

### task_tags (Junction Table)

| Field | Type | Constraints |
|-------|------|-------------|
| task_id | UUID | FK -> tasks.id, PK |
| tag_id | UUID | FK -> tags.id, PK |

**Cascade**: Deleting a task removes its tag associations. Deleting a tag removes its task associations.

### Reminder

| Field | Type | Default | Constraints | Notes |
|-------|------|---------|-------------|-------|
| id | UUID | uuid4() | PK | |
| task_id | UUID | - | FK -> tasks.id, indexed | |
| user_id | UUID | - | FK -> users.id, indexed | |
| reminder_time | datetime | - | must be future | When to fire |
| status | str | "pending" | enum: pending/fired/cancelled | |
| created_at | datetime | utcnow() | - | |

**Relationships**: Task (many-to-one), User (many-to-one)

**State transitions**:
- pending -> fired (when reminder_time passes and event emitted)
- pending -> cancelled (when task completed or deleted)

**Validation rules**:
- reminder_time: must be before due_date and after now (for new reminders)
- status: system-managed, not user-settable

### UserPreference (Dapr State Store)

Stored as key-value pairs in Dapr State Store, keyed by `pref:{user_id}:{key}`.

| Key | Type | Default | Notes |
|-----|------|---------|-------|
| notification_channel | str | "in-app" | Options: in-app, email, both |
| timezone | str | "UTC" | IANA timezone string |
| reminder_offset_minutes | int | 15 | Minutes before due_date |
| default_priority | str | "medium" | Default for new tasks |
| sort_order | str | "created_at_desc" | Default task list sort |
| theme | str | "light" | light or dark |

### AuditLog

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK | |
| event_type | str | not null | e.g., task.created, task.completed |
| user_id | UUID | indexed | Who triggered the event |
| payload | JSON | not null | Full event data |
| trace_id | str | indexed | W3C trace ID for correlation |
| timestamp | datetime | not null, indexed | When event occurred |

**Rules**: Append-only. No updates. No deletes. Ever.

---

## Projections (Dapr State Store)

Read-optimized views built by event-sourcing-projection-agent.

| Projection Key | Type | Updated By | Read By |
|----------------|------|-----------|---------|
| `proj:{user_id}:completion-by-day` | JSON map {date: count} | task.completed | analytics API |
| `proj:{user_id}:priority-distribution` | JSON map {priority: count} | task.created/updated/deleted | analytics API |
| `proj:{user_id}:tag-distribution` | JSON map {tag: count} | task.created/updated/deleted | analytics API |
| `proj:{user_id}:streak` | JSON {current: int, longest: int, last_date: str} | task.completed | analytics API |
| `proj:{user_id}:tasks-by-due-date` | JSON sorted list | task.created/updated/deleted | calendar view |

---

## Migration Plan

All migrations are **additive-only** per constitution INV-007.

1. **ALTER TABLE tasks**: ADD COLUMN priority (default 'medium'), ADD COLUMN due_date (nullable), ADD COLUMN recurrence_type (default 'none'), ADD COLUMN recurrence_interval (default 1)
2. **CREATE TABLE tags**: id, user_id, name, color, created_at
3. **CREATE TABLE task_tags**: task_id, tag_id (composite PK)
4. **CREATE TABLE reminders**: id, task_id, user_id, reminder_time, status, created_at
5. **CREATE TABLE audit_logs**: id, event_type, user_id, payload, trace_id, timestamp

No DROP, no RENAME, no ALTER TYPE.
