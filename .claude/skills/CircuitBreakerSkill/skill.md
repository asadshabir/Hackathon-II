# skills/CircuitBreakerSkill
## Purpose
Prevent cascading failures in distributed calls (Dapr invocation, Kafka produce/consume).

## Key Features
- wrap_call(callable, max_failures: int = 5, reset_timeout_sec: int = 30)
- Half-open state recovery

## Reusability Bonus
Wrap any external call — reusable in all agents.

## Implementation Notes
Simple in-memory or integrate with resilience4j-style lib if available.