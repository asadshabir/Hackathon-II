---
id: 004
title: Phase V Event-Driven Constitution
stage: constitution
date: 2026-02-09
surface: agent
model: claude-opus-4-6
feature: none
branch: 002-premium-ui-refinement
user: Asad Shabir
command: /sp.constitution
labels: ["constitution", "phase-v", "event-driven", "dapr", "kafka", "doks", "agents", "skills"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .claude/agents/task-orchestrator-agent.md
  - .claude/agents/reminder-scheduler-agent.md
  - .claude/agents/recurring-task-agent.md
  - .claude/agents/notification-agent.md
  - .claude/agents/realtime-sync-agent.md
  - .claude/agents/audit-log-agent.md
  - .claude/agents/failure-handler-agent.md
  - .claude/agents/retry-scheduler-agent.md
  - .claude/agents/observability-agent.md
  - .claude/agents/event-sourcing-projection-agent.md
  - .claude/agents/scalability-observer-agent.md
  - .claude/agents/user-preference-agent.md
  - .claude/agents/deployment-orchestrator-agent.md
  - .claude/agents/task-query-agent.md
  - .claude/agents/frontend-performance-agent.md
  - .claude/agents/frontend-performance-architect.md
  - .claude/agents/advanced-features-engineer.md
tests:
  - none
---

## Prompt

You are now acting as the **Constitution Writer** for Hackathon II Phase V (Advanced Cloud Deployment).

**Phase V Constitution – Strict Invariants**
Write a complete, bullet-proof Constitution.md for Phase V that MUST be followed in every subsequent step.

Core Requirements (non-negotiable):
- Full event-driven architecture using Kafka via Dapr pub/sub
- Every service uses Dapr sidecar (pub/sub, state, service invocation, secrets)
- Deployment target: DigitalOcean Kubernetes Service (DOKS) with Helm + replicas >= 2
- All agents MUST use the following skills (no exceptions):
  - DaprPubSubSkill, DaprStateSkill, DaprServiceInvocationSkill, DaprSecretsSkill
  - OpenTelemetryTracingSkill, CircuitBreakerSkill
  - DOKSDeploymentBlueprintSkill
  - KafkaPubSubSkill (if needed), TaskEventEmitSkill, TaskCRUDSkill, NotificationDispatchSkill, RealtimeBroadcastSkill
  - RetrySchedulerSkill, FailurePersistenceSkill, AuditPersistenceSkill, DaprMonitoringSkill, PerformanceMetricsSkill
- All agents listed below MUST be used in the final architecture:
  - task-orchestrator-agent, deployment-orchestrator-agent, realtime-sync-agent, notification-agent, reminder-scheduler-agent, retry-scheduler-agent, failure-handler-agent, observability-agent, event-sourcing-projection-agent, scalability-observer-agent, audit-log-agent, user-preference-agent
- Every cross-service call must go through DaprServiceInvocationSkill + CircuitBreakerSkill + tracing
- Observability: full distributed tracing + metrics + logs via OpenTelemetry
- Blueprints bonus: DOKSDeploymentBlueprintSkill must generate complete Helm values + manifests
- Reusable Intelligence bonus: every skill must be documented with examples and be swappable

Also: First make strong constitution then customise agents based on the project requirements. Add, customise context in agents and skills.

## Response snapshot

### Constitution v4.0.0 (MAJOR bump from 3.0.0)

Wrote complete constitution at `.specify/memory/constitution.md` with:

**15 Core Principles:**
1. Agentic Dev Stack Supremacy
2. Architectural Separation
3. Event-Driven Architecture Mandate (NEW)
4. Dapr Sidecar Mandate (NEW)
5. DOKS Deployment Mandate (NEW)
6. Security by Isolation
7. OpenAI Agents SDK Mandate
8. MCP Tool Exposure Mandate
9. Environment & Secrets Management (updated for Dapr)
10. Distributed Observability Mandate (NEW)
11. Circuit Breaker Mandate (NEW)
12. Backend Evolution Discipline (replaced Backend Immutability)
13. Conversation Memory Persistence
14. Performance-First Frontend
15. Animation Minimalism

**10 Non-Negotiable Invariants** (INV-001 through INV-010) with testable checks.

**13 Mandatory Agents** + 4 supporting agents — all rewritten with consistent format:
- Identity, Inputs, Outputs, Skills, Rules, Coordination, Design Principle

**19 Mandatory Skills** organized into: Dapr Infrastructure (5), Resilience (3), Domain (7), Platform (4).

**7 Event Topics** defined with full topology diagram.

**Bonus Alignment**: Reusable Intelligence + Blueprints sections with evidence artifacts.

## Outcome

- ✅ Impact: Complete Phase V constitution replacing v3.0.0; all 17 agents rewritten with optimized, consistent system prompts
- 🧪 Tests: none (governance document)
- 📁 Files: 18 files written (1 constitution + 17 agents)
- 🔁 Next prompts: Create advanced features spec, implement event-driven backend, set up Dapr components
- 🧠 Reflection: MAJOR version bump justified — lifting backend immutability, adding event-driven architecture, Dapr/Kafka, DOKS deployment, and mandatory agent/skill registries are all backward-incompatible governance changes

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A — governance document, no code tests
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run /sp.spec for first advanced feature to validate constitution compliance workflow
