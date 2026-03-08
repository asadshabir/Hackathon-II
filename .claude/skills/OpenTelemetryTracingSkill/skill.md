# skills/OpenTelemetryTracingSkill
## Purpose
Export distributed traces via OpenTelemetry (OTLP) — integrates with Dapr sidecar tracing.

## Key Features
- start_span(name: str, attributes: dict = None) → Span context
- Automatic propagation across Dapr pub/sub & service invocation
- Export to collector (e.g. Jaeger, Zipkin, or cloud vendor)

## Reusability Bonus
Enables end-to-end tracing of todo → kafka → notification → reminder flows.
Critical for AIOps / demo wow factor.

## Implementation Notes
Dapr built-in OTLP export + optional app-level instrumentation.
Configure via Dapr config YAML.