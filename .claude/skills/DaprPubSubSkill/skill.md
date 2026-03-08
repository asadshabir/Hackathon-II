# skills/DaprPubSubSkill
## Purpose
Dedicated, reusable skill for publishing and subscribing to topics via Dapr pub/sub (backed by Kafka in Phase V).
Enables at-least-once delivery, topic routing, CloudEvents format.

## Key Features
- publish(topic: str, payload: dict | str, metadata: dict = None) → bool
- subscribe(topic: str, handler_callback) → Subscription handle
- Supports Dapr component metadata (consumerGroup, rawPayload, etc.)
- Automatic retry + dead-letter via Dapr config
- Reusable across all event-driven agents

## Reusability Bonus
Documented examples for task-created, task-updated, reminder-triggered events.
Can be swapped to other brokers (Redis, NATS) via config — zero code change.

## Implementation Notes
Uses official Dapr Python SDK / HTTP API.
Requires Dapr sidecar running with pubsub.kafka component.