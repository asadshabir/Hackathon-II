# skills/DaprServiceInvocationSkill
## Purpose
Secure, resilient service-to-service calls via Dapr service invocation (mTLS, retry, timeout).

## Key Features
- invoke(service_id: str, method: str, data: dict | bytes, verb: str = "POST") → Response
- Automatic mTLS between services
- Built-in retry & circuit breaking (configurable)

## Reusability Bonus
Core for agent ↔ agent or agent → FastAPI backend calls in distributed mode.

## Implementation Notes
Uses Dapr invoke API — name resolution via K8s DNS.