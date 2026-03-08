# skills/DaprStateSkill
## Purpose
Unified state management (get/save/delete) using Dapr state store (e.g. Redis or PostgreSQL in Phase V).
Supports actor-style concurrency, TTL, ETags/optimistic concurrency.

## Key Features
- get_state(key: str, store_name: str = "statestore") → dict | None
- save_state(key: str, value: dict, etag: str | None = None, options: dict = None)
- delete_state(key: str, etag: str | None = None)
- transaction support (multi-key atomic ops)

## Reusability Bonus
Used by user-preference-agent, task-orchestrator (caching), reminder state persistence.

## Implementation Notes
Leverage Dapr state API — pluggable backend via YAML component.