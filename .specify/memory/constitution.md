<!--
Version: 4.0.0 → 5.0.0 (MAJOR)
Changes Summary:
  - MAJOR: Deployment target pivoted from DOKS to local production-ready stack
  - MAJOR: Added Docker containerization mandate
  - MAJOR: Added Minikube Kubernetes compliance
  - MAJOR: Added Vercel frontend deployment requirement
  - MAJOR: Added Docker Compose local stack requirement
  - MAJOR: Updated DeploymentBlueprintSkill to support 3 targets (Docker Compose, Minikube, Vercel)
  - MAJOR: Removed DigitalOcean Kubernetes requirement (was DOKS Deployment Mandate)
  - MAJOR: Added Hugging Face Inference API allowance for AI processing
  - MAJOR: Added No Paid Cloud Services invariant
  - MAJOR: Updated Tech Stack to include Docker, Minikube, Vercel

Modified Principles:
  - "DOKS Deployment Mandate" → REPLACED by "Local Production-Ready Containerization"
  - "Tech Stack Standards" → UPDATED to include Docker, Minikube, Vercel
  - "Success Criteria" → UPDATED to reflect new deployment targets
  - "Non-Negotiable Invariants" → UPDATED with Docker, Minikube, Vercel requirements

Templates Status:
  ✅ plan-template.md - Deployment section updated
  ✅ spec-template.md - Deployment requirements updated
  ✅ tasks-template.md - Deployment tasks updated
  ✅ skills updated - DeploymentBlueprintSkill targets expanded

Follow-up TODOs: None - all placeholders filled
-->

# AI Todo Chatbot - Phase V Constitution (Local Production-Ready Stack)

---
## Vision & Success Criteria

**Vision**: Transform the AI Todo Chatbot into a production-grade, containerized,
event-driven system deployable locally via Docker Compose and Minikube, with
frontend hosted on Vercel, featuring full observability, resilience, and premium UX.

**Success looks like**:
1. Complete application runs locally via Docker Compose (backend + frontend + Kafka + Dapr + Postgres)
2. Kubernetes compliance demonstrated via Minikube with Dapr + Kafka operators
3. Frontend deployed to Vercel with live public URL
4. Every state change emits a Kafka event via Dapr Pub/Sub in all environments
5. 13 specialized agents collaborate through events in Docker Compose and Minikube
6. Distributed tracing covers every request end-to-end in all environments
7. Premium frontend with Lighthouse 90+ and sub-1.5s FCP
8. Every skill is documented, tested, and swappable with zero code changes

---

## Quality Philosophy

**MANDATORY**: All development MUST adhere to these design principles:

| Prefer | Over |
|--------|------|
| Premium | Flashy |
| Calm | Noisy |
| Fast | Fancy |
| Subtle | Dramatic |
| Consistency | Variety |
| Event-driven | Request-driven |
| Resilient | Fragile |
| Observable | Opaque |
| Containerized | Host-dependent |

**Rationale**: Premium cloud-native systems convey quality through resilience,
observability, containerization, and restraint — not through excess complexity
or visual noise.

---

## Core Principles

### I. Agentic Dev Stack Supremacy

**MANDATORY**: All development MUST follow the strict workflow:
Constitution -> Spec -> Plan -> Tasks -> Implementation.
Implementation MUST NOT proceed until specifications are validated and approved.

**Enforcement**:
- All PRs MUST reference a validated spec document in `specs/<feature>/spec.md`
- Spec validation gate MUST pass before `tasks.md` generation
- Code reviews MUST verify implementation matches spec exactly
- User MUST NOT write code manually; agent generates all artifacts

---

### II. Architectural Separation

**MANDATORY**: Frontend (Next.js) and Backend (FastAPI + OpenAI Agents) MUST
operate as independently deployable services with clearly defined boundaries.
The AI agent layer MUST be encapsulated within the backend service.

**Enforcement**:
- Frontend MUST communicate with backend exclusively via RESTful API or
  WebSocket
- Backend MUST NOT serve frontend assets or HTML
- OpenAI Agents SDK logic MUST reside entirely in backend service
- Each service MUST have independent environment configuration
- Shared schemas MUST be documented in `specs/<feature>/contracts/`
- Both services MUST have Dapr sidecar annotations in K8s manifests

---

### III. Event-Driven Architecture Mandate

**MANDATORY**: All state changes MUST emit domain events through Kafka via
Dapr Pub/Sub. No service may directly call another service's database. Services
communicate through events and Dapr service invocation ONLY.

**Required Event Topics**:
- `task-created` — emitted when a new task is persisted
- `task-updated` — emitted when task fields change (priority, tags, due date)
- `task-completed` — emitted when a task is marked complete
- `task-deleted` — emitted when a task is removed
- `reminder-due` — emitted when a scheduled reminder fires
- `notification-sent` — emitted after notification delivery
- `user-preference-changed` — emitted when user settings change

**Enforcement**:
- NO direct Kafka SDK imports (kafka-python, confluent-kafka are PROHIBITED)
- ALL event publishing MUST use DaprPubSubSkill
- ALL event consumption MUST use Dapr subscription handlers
- Events MUST follow CloudEvents specification
- Dead-letter topics MUST be configured for every subscription
- At-least-once delivery MUST be assumed; handlers MUST be idempotent

---

### IV. Dapr Sidecar Mandate

**MANDATORY**: Every service MUST use a Dapr sidecar for ALL cross-cutting
concerns. No service may bypass Dapr for pub/sub, state, service invocation,
or secrets management.

**Required Dapr Building Blocks**:
| Building Block | Dapr Component | Backing Service |
|----------------|----------------|-----------------|
| Pub/Sub | pubsub.kafka | Kafka (Strimzi/Confluent) |
| State Store | statestore.postgresql | Neon PostgreSQL |
| Service Invocation | N/A (built-in) | Dapr mesh |
| Secrets | secretstore.kubernetes | K8s Secrets |
| Jobs | jobs.scheduler | Dapr Jobs API |

**Enforcement**:
- Every K8s Deployment MUST include Dapr annotations:
  `dapr.io/enabled: "true"`, `dapr.io/app-id`, `dapr.io/app-port`
- All inter-service calls MUST go through `DaprServiceInvocationSkill`
- All secrets MUST be fetched via `DaprSecretsSkill`
- All event publishing MUST use `DaprPubSubSkill`
- All state reads/writes MUST use `DaprStateSkill`

---

### V. Local Production-Ready Containerization Mandate

**MANDATORY**: The application MUST be fully containerized using Docker and
deployable via three target platforms: Docker Compose (local full stack),
Minikube (local K8s), and Vercel (frontend only).

**Requirements**:
- Backend service MUST have `backend/Dockerfile` with multi-stage build
- Frontend service MUST have `frontend/Dockerfile` with multi-stage build
- Docker Compose file MUST orchestrate: backend, frontend, Kafka, Zookeeper, PostgreSQL, Jaeger
- Minikube deployment MUST include Dapr operator and Kafka operator
- Vercel deployment MUST support Next.js static export or SSR
- All Dapr sidecar annotations MUST work in Docker Compose and Minikube
- Health checks and readiness probes MUST be defined for all containers

**Enforcement**:
- `docker-compose up` MUST successfully start full stack locally
- `minikube start` + Dapr + Kafka operator installation MUST work
- Vercel deployment via `vercel` CLI MUST succeed with live URL
- `DeploymentBlueprintSkill` MUST generate artifacts for all 3 targets
- All observability, tracing, and resilience features MUST work in all environments

---

### VI. Security by Isolation

**MANDATORY**: User data and conversation history MUST be isolated such that
one user CANNOT access another user's data under any circumstances.

**Enforcement**:
- Every database query MUST include user ownership filtering
- Conversation context MUST be scoped to authenticated user session
- Integration tests MUST verify multi-user isolation
- OpenAI Agents MUST receive only the requesting user's context
- Dapr secrets MUST be scoped per namespace, never cluster-wide
- RBAC policies MUST restrict cross-namespace access

---

### VII. OpenAI Agents SDK Mandate

**MANDATORY**: All AI logic MUST be implemented using the OpenAI Agents SDK.
No alternative AI frameworks or direct OpenAI API calls are permitted for
agent behavior.

**Enforcement**:
- Agent definitions MUST use `openai-agents` SDK patterns
- Tool functions MUST be registered via SDK's tool decorator system
- Conversation state MUST be managed through SDK's built-in mechanisms
- Direct `openai` client calls are PROHIBITED for agent logic

---

### VIII. MCP Tool Exposure Mandate

**MANDATORY**: All task operations (CRUD + advanced features) MUST be exposed
as MCP tools. The AI agent interacts with the system exclusively through these.

**Enforcement**:
- Each operation MUST be implemented as a separate MCP tool
- Tools MUST return structured responses (success/error with data)
- Backend MUST expose MCP tool registry for agent discovery
- No direct database access from agent code; all operations via MCP tools

---

### IX. Environment & Secrets Management

**MANDATORY**: All secrets MUST be managed through Dapr Secrets Store backed
by Kubernetes Secrets. Local development MAY use `.env` files. Production
MUST use K8s secrets via Dapr.

**Enforcement**:
- Hardcoded credentials are STRICTLY PROHIBITED
- `.env` files MUST be in `.gitignore`
- `.env.example` files MUST be provided with placeholder values
- Production secrets MUST be fetched via `DaprSecretsSkill`
- Code reviews MUST reject any PR containing hardcoded secrets

---

### X. Distributed Observability Mandate

**MANDATORY**: Full distributed tracing, metrics, and structured logging MUST
be implemented across all services using OpenTelemetry.

**Requirements**:
- Every inbound request MUST create or propagate a trace context
- Every Dapr service invocation MUST carry trace headers
- Every Kafka event MUST include trace context in CloudEvents metadata
- Metrics MUST be exported in Prometheus format
- Logs MUST be structured JSON with trace_id, span_id, service_name

**Enforcement**:
- `OpenTelemetryTracingSkill` MUST be used in every agent
- All cross-service calls MUST propagate W3C Trace Context headers
- Jaeger or Zipkin collector MUST be deployed for trace aggregation
- Prometheus MUST scrape all service metrics endpoints
- Alert rules MUST be defined for p95 latency > 500ms and error rate > 1%

---

### XI. Circuit Breaker Mandate

**MANDATORY**: Every cross-service call MUST be wrapped in a circuit breaker
to prevent cascading failures.

**Requirements**:
- Max failures before open: 5 (configurable)
- Reset timeout: 30 seconds (configurable)
- Half-open state: allow 1 probe request
- Fallback behavior MUST be defined for every protected call

**Enforcement**:
- `CircuitBreakerSkill` MUST wrap all `DaprServiceInvocationSkill` calls
- `CircuitBreakerSkill` MUST wrap all external API calls
- Circuit breaker state MUST be observable via metrics
- Tests MUST verify circuit breaker trips correctly

---

### XII. Backend Evolution Discipline

**MANDATORY**: Backend code MAY be modified for Phase V features, but ALL
changes MUST follow strict backward-compatibility rules.

**Allowed Modifications**:
- Add new fields to existing SQLModel models (with defaults)
- Add new API endpoints (new paths only)
- Add new service methods
- Add Dapr integration code
- Add event publishing logic

**Prohibited Modifications**:
- Removing or renaming existing fields
- Changing existing endpoint signatures or response shapes
- Modifying authentication/authorization logic (except adding Dapr secrets)
- Dropping or renaming database tables/columns

**Enforcement**:
- New model fields MUST have sensible defaults (no migration breakage)
- Existing API responses MUST retain all current fields
- New fields in responses MUST be optional (nullable)
- Database migrations MUST be additive only (ADD COLUMN, never DROP)

---

### XIII. Conversation Memory Persistence

**MANDATORY**: All conversation history MUST be persisted in the database.
Users MUST be able to continue conversations across sessions.

**Enforcement**:
- Messages MUST be stored with user_id, timestamp, role, and content
- Agent MUST load recent conversation history when processing new messages
- Conversation context window MUST be configurable
- Old conversations MUST be retrievable for user reference

---

### XIV. Performance-First Frontend

**MANDATORY**: Mobile performance is the PRIMARY constraint for all frontend
work. Visual enhancements that degrade performance MUST be removed.

**Performance Budget**:

| Metric | Target | Maximum |
|--------|--------|---------|
| Lighthouse Performance | 95+ | 90 minimum |
| First Contentful Paint | 1.0s | 1.5s |
| Largest Contentful Paint | 2.0s | 2.5s |
| Time to Interactive | 2.5s | 3.0s |
| Cumulative Layout Shift | 0.05 | 0.1 |
| Total Blocking Time | 150ms | 300ms |
| JavaScript Bundle Size | 150KB | 200KB |

**Enforcement**:
- Lighthouse audits MUST run before each deployment
- PRs MUST include performance impact assessment
- Performance regressions MUST block merge

---

### XV. Animation Minimalism

**MANDATORY**: Animations MUST be limited to micro-interactions only.

**Allowed**: Button hover/press, form focus, loading spinners (CSS), fade
transitions, toast entry/exit.

**Prohibited**: Particle effects, canvas animations, star fields, parallax,
complex SVG animations, physics-based animations.

**Constraints**:
- Duration: 150-250ms maximum
- Properties: opacity and transform ONLY
- Easing: ease-out or ease-in-out
- Mobile: Disable via `prefers-reduced-motion`
- No animation may cause layout shifts (CLS < 0.1)

---

## Mandatory Agent Registry

**MANDATORY**: ALL 13 agents below MUST be used in the final architecture.
Each agent has a single responsibility and communicates via Dapr Pub/Sub.

| # | Agent | Responsibility | Listens To | Emits |
|---|-------|---------------|------------|-------|
| 1 | `task-orchestrator-agent` | Task CRUD, priorities, tags, lifecycle | API requests | task-created, task-updated, task-completed, task-deleted |
| 2 | `advanced-features-engineer` | Recurring tasks, due dates, search/filter/sort | Implementation tasks | task-updated (schema extensions) |
| 3 | `reminder-scheduler-agent` | Schedule reminders via Dapr Jobs | task-created (with due_date) | reminder-due |
| 4 | `notification-agent` | Deliver notifications to users | reminder-due | notification-sent |
| 5 | `recurring-task-agent` | Create next occurrence on completion | task-completed | task-created |
| 6 | `realtime-sync-agent` | Broadcast state changes to clients | task-*, notification-sent | WebSocket pushes |
| 7 | `audit-log-agent` | Immutable audit trail | ALL task-* events | (none — write-only) |
| 8 | `failure-handler-agent` | Retry + escalate failed operations | failure events | retry-scheduled, alert-triggered |
| 9 | `retry-scheduler-agent` | Execute retry with backoff | retry-scheduled | (re-emits original event) |
| 10 | `observability-agent` | Metrics, traces, health aggregation | ALL events | dashboard-update |
| 11 | `event-sourcing-projection-agent` | Build read models from events | ALL task-* events | projection-updated |
| 12 | `scalability-observer-agent` | Monitor load, recommend HPA scaling | metrics | scale-recommendation |
| 13 | `user-preference-agent` | Store/resolve user settings | user-preference-changed | (state only) |

**Supporting Agents** (not in mandatory 13 but available):
- `deployment-orchestrator-agent` — Helm deploy pipeline
- `frontend-performance-architect` — UI optimization
- `frontend-performance-agent` — Frontend telemetry monitoring
- `task-query-agent` — Read-optimized task queries

---

## Mandatory Skill Registry

**MANDATORY**: ALL skills below MUST be available and used by their assigned
agents. Every skill MUST be documented with examples and be swappable.

### Dapr Infrastructure Skills

| Skill | Purpose | Used By |
|-------|---------|---------|
| `DaprPubSubSkill` | Publish/subscribe via Kafka | ALL agents |
| `DaprStateSkill` | Read/write state store | task-orchestrator, audit-log, user-preference |
| `DaprServiceInvocationSkill` | Cross-service calls | ALL agents needing sync calls |
| `DaprSecretsSkill` | Fetch secrets from K8s | ALL agents at startup |
| `DaprMonitoringSkill` | Sidecar health + metrics | observability-agent |

### Resilience Skills

| Skill | Purpose | Used By |
|-------|---------|---------|
| `CircuitBreakerSkill` | Prevent cascading failures | ALL agents making external calls |
| `RetrySchedulerSkill` | Exponential backoff retries | retry-scheduler-agent, failure-handler |
| `FailurePersistenceSkill` | Store failure records | failure-handler-agent |

### Domain Skills

| Skill | Purpose | Used By |
|-------|---------|---------|
| `TaskCRUDSkill` | Create, read, update, delete tasks | task-orchestrator-agent |
| `TaskEventEmitSkill` | Emit task domain events | task-orchestrator, advanced-features |
| `ReminderSchedulingSkill` | Schedule via Dapr Jobs API | reminder-scheduler-agent |
| `RecurringRuleEvaluationSkill` | Evaluate recurrence rules | recurring-task-agent |
| `NotificationDispatchSkill` | Send notifications | notification-agent |
| `RealtimeBroadcastSkill` | WebSocket broadcast | realtime-sync-agent |
| `AuditPersistenceSkill` | Write immutable audit logs | audit-log-agent |

### Platform Skills

| Skill | Purpose | Used By |
|-------|---------|---------|
| `OpenTelemetryTracingSkill` | Distributed tracing | ALL agents |
| `PerformanceMetricsSkill` | Collect/report metrics | observability, frontend-perf |
| `DeploymentBlueprintSkill` | Generate Docker Compose, Minikube, and Vercel manifests | deployment-orchestrator |
| `ProjectionBuildSkill` | Build CQRS read models | event-sourcing-projection |

---

## Non-Negotiable Invariants

These are the absolute guarantees that MUST hold at all times. Violation of
any invariant is a blocking defect.

### INV-001: No Direct Kafka SDK

No Python file may import `kafka`, `kafka-python`, `confluent_kafka`, or any
Kafka client library. ALL Kafka interaction goes through Dapr Pub/Sub.

**Test**: `grep -r "import kafka\|from kafka\|confluent_kafka" backend/` MUST
return zero results.

### INV-002: Dapr Sidecar on Every Pod

Every Kubernetes Deployment MUST include Dapr annotations. No pod runs without
its sidecar in production.

**Test**: `helm template` output MUST contain `dapr.io/enabled: "true"` for
every Deployment.

### INV-003: Docker Containerization Required

The application MUST be fully containerized using Docker. No host-dependent
binaries or dependencies.

**Test**: `docker build -t todo-ai-backend .` in `backend/` directory MUST succeed.
`docker build -t todo-ai-frontend .` in `frontend/` directory MUST succeed.

### INV-004: Idempotent Event Handlers

Every Dapr subscription handler MUST be idempotent. Processing the same event
twice MUST produce the same result as processing it once.

**Test**: Integration tests MUST verify duplicate event handling.

### INV-005: Trace Context Propagation

Every cross-service call and every Kafka event MUST carry W3C Trace Context
headers. Broken traces are PROHIBITED.

**Test**: End-to-end test MUST verify trace_id appears in Jaeger for a full
request flow.

### INV-006: Circuit Breaker on External Calls

Every call to an external service (including Dapr invocations to other
services) MUST be wrapped in `CircuitBreakerSkill`.

**Test**: Unit tests MUST verify circuit breaker wrapping.

### INV-007: Backward-Compatible Migrations

Database migrations MUST be additive only. No DROP COLUMN, no RENAME COLUMN,
no DROP TABLE.

**Test**: Migration files MUST NOT contain DROP or RENAME statements.

### INV-008: Secrets Never in Code

No secret, API key, password, or token may appear in source code, environment
files committed to git, or Helm values checked into the repository.

**Test**: `git grep -i "password\|secret\|api_key\|token" -- ':!*.md' ':!*.example'`
MUST return zero results for actual credentials.

### INV-009: User Data Isolation

No API endpoint or event handler may return data belonging to a different user.
Every query MUST filter by authenticated user_id.

**Test**: Multi-user integration tests MUST verify zero cross-user data leakage.

### INV-010: Frontend Performance Floor

Lighthouse Performance score MUST remain >= 90. FCP MUST be <= 1.5s. Any PR
that drops below these thresholds MUST be rejected.

**Test**: CI pipeline MUST run Lighthouse audit on every PR.

### INV-011: Docker Compose Full Stack Requirement

The complete application stack (backend + frontend + Kafka + PostgreSQL + Dapr)
MUST run successfully via Docker Compose locally.

**Test**: `docker-compose up -d` MUST start all services with health checks passing.

### INV-012: Minikube K8s Compliance

The application MUST be deployable to Minikube with Dapr and Kafka operators installed,
demonstrating Kubernetes compliance.

**Test**: `minikube start` + Dapr + Kafka operator + application deployment MUST succeed.

### INV-013: Vercel Frontend Deployment

The frontend MUST be deployable to Vercel with a live public URL.

**Test**: `vercel --prod` deployment MUST succeed with live accessible URL.

### INV-014: No Paid Cloud Services

No deployment or development workflow may require payment (credit card verification)
to DigitalOcean, Railway, Render, or similar services.

**Test**: All deployment methods must use free tiers only with no payment required.

---

## Event Topology

```
                          ┌──────────────────┐
                          │   API Gateway     │
                          │  (Dapr Sidecar)   │
                          └────────┬──────────┘
                                   │
                          ┌────────▼──────────┐
                          │ task-orchestrator  │
                          │    -agent          │
                          └────────┬──────────┘
                                   │ emits
                    ┌──────────────┼──────────────┐
                    ▼              ▼               ▼
             task-created    task-updated    task-completed
                    │              │               │
         ┌──────────┼──────┐      │        ┌──────┼──────────┐
         ▼          ▼      ▼      ▼        ▼      ▼          ▼
    reminder-  realtime  audit  realtime  recurring  audit  realtime
    scheduler   -sync    -log    -sync     -task     -log    -sync
      -agent    -agent   -agent  -agent    -agent   -agent   -agent
         │                                    │
         ▼                                    ▼
    reminder-due                         task-created
         │                              (next occurrence)
    ┌────┼────┐
    ▼         ▼
notification  audit
  -agent      -log
    │
    ▼
notification-sent
    │
    ▼
realtime-sync
  -agent
```

---

## Bonus Alignment

### Reusable Intelligence Bonus

**How we earn it**: Every skill is:
1. **Documented**: Each skill file includes Purpose, Key Features, Examples,
   Implementation Notes
2. **Swappable**: Dapr component config can swap Kafka for Redis/NATS with
   zero code changes. State store can swap PostgreSQL for Redis/Cosmos.
3. **Tested**: Each skill has unit tests verifying its contract
4. **Composable**: Agents combine skills without tight coupling
5. **Multi-Target**: DeploymentBlueprintSkill generates artifacts for 3 platforms

**Evidence artifacts**:
- `.claude/skills/*/skill.md` — documentation for every skill
- Skill unit tests in `backend/tests/skills/`
- Dapr component YAML showing swappability
- Deployment artifacts for Docker Compose, Minikube, and Vercel

### Blueprints Bonus

**How we earn it**: `DeploymentBlueprintSkill` generates for 3 targets:
1. Complete `docker-compose.yml` for local full stack
2. Minikube Kubernetes manifests (Deployment, Service, etc.)
3. Vercel configuration files for frontend deployment
4. Dapr component definitions (pub/sub, state, secrets) for each platform
5. Monitoring stack (Prometheus, Jaeger) manifests for local environments

**Evidence artifacts**:
- `deploy/docker-compose/local.yml` — Docker Compose configuration
- `deploy/minikube/` — Minikube K8s manifests
- `deploy/vercel/` — Vercel frontend configuration
- 90-second demo showing all 3 deployment targets

---

## Tech Stack Standards

### Frontend
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS (utility-first)
- **State**: React Context API or Zustand
- **Real-time**: WebSocket or SSE
- **Icons**: Lucide React
- **Deployment**: Vercel (free tier)

**Prohibited**: Framer Motion, Three.js, Canvas libraries, Material UI,
Ant Design, animation CSS frameworks.

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.13+
- **AI Logic**: OpenAI Agents SDK or Hugging Face Inference API
- **Tool Protocol**: MCP SDK
- **ORM**: SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Validation**: Pydantic v2

### Infrastructure
- **Container Runtime**: Docker
- **Local Orchestration**: Docker Compose
- **Local K8s**: Minikube
- **Deployment Platforms**: Docker Compose, Minikube, Vercel
- **Service Mesh**: Dapr
- **Message Broker**: Kafka (via Dapr Pub/Sub)
- **Tracing**: OpenTelemetry + Jaeger
- **Metrics**: Prometheus
- **Secrets**: Kubernetes Secrets (via Dapr)
- **Frontend Hosting**: Vercel (free tier)

### Monorepo Structure

```
Phase-5/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── components/          # Chat UI + task management
│   │   ├── app/                 # Next.js App Router
│   │   └── lib/                 # API client, utilities
│   ├── Dockerfile
│   ├── vercel.json
│   └── package.json
├── backend/                     # FastAPI + OpenAI Agents
│   ├── src/
│   │   ├── agents/              # OpenAI Agents SDK definitions
│   │   ├── tools/               # MCP tool implementations
│   │   ├── models/              # SQLModel database models
│   │   ├── api/                 # FastAPI route handlers
│   │   ├── services/            # Business logic
│   │   └── events/              # Dapr Pub/Sub handlers
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
├── deploy/                      # Deployment artifacts
│   ├── docker-compose/
│   │   └── local.yml            # Full stack composition
│   ├── minikube/
│   │   ├── dapr-components/
│   │   ├── kafka-operator/
│   │   └── app-manifests/
│   └── vercel/
│       └── frontend-config/
├── specs/                       # Feature specifications
├── .specify/                    # SpecKit Plus templates
├── .claude/
│   ├── agents/                  # Agent definitions
│   └── skills/                  # Skill definitions
├── history/
│   ├── prompts/                 # PHRs
│   └── adr/                     # ADRs
└── CLAUDE.md                    # Agent instructions
```

---

## Operational Constraints

### Database Schema Requirements

Core tables (existing):
1. **users** — Accounts and authentication
2. **tasks** — Todo items with user ownership (EXTENDABLE for Phase V)
3. **conversations** — Conversation sessions per user
4. **messages** — Individual messages in conversations

Phase V extensions (additive only):
5. **tags** — Tag/category definitions
6. **task_tags** — Many-to-many task-tag association
7. **reminders** — Scheduled reminder records

### AI Service Constraints

- **Rate Limiting**: Exponential backoff for API calls
- **Token Budgets**: Context window limits to prevent cost overruns
- **Timeout**: 30s default for agent responses
- **Fallback**: Graceful degradation when AI is unavailable
- **Circuit Breaker**: Must wrap all AI calls
- **Hugging Face**: May use free tier inference API as alternative to OpenAI

---

## Success Criteria

### SC-001: Conversational Task Management
- [ ] Users can add/list/complete/delete tasks via natural language
- [ ] Agent confirms all actions conversationally
- [ ] Advanced features (priority, tags, due date) accessible via chat

### SC-002: Event-Driven Architecture
- [ ] Every task state change emits a Kafka event via Dapr
- [ ] All 13 mandatory agents are deployed and consuming events
- [ ] Dead-letter topics configured for every subscription
- [ ] Events follow CloudEvents specification

### SC-003: Local Production-Ready Deployment
- [ ] Docker Compose orchestrates full stack successfully
- [ ] Minikube deployment with Dapr + Kafka operators works
- [ ] Frontend deployed to Vercel with live URL
- [ ] All features work identically across all 3 platforms

### SC-004: Distributed Observability
- [ ] End-to-end traces visible in Jaeger (Docker Compose + Minikube)
- [ ] Prometheus metrics exported by all services in all environments
- [ ] Structured JSON logging with trace correlation
- [ ] Alert rules configured for latency and error rate

### SC-005: Performance Targets Met
- [ ] Lighthouse Performance >= 90
- [ ] FCP <= 1.5s, LCP <= 2.5s, TTI <= 3.0s
- [ ] CLS < 0.1, TBT < 300ms
- [ ] No heavy animations present

### SC-006: Multi-User Isolation
- [ ] User A cannot see User B's tasks or conversations
- [ ] Integration tests verify zero data leakage

### SC-007: Resilience
- [ ] Circuit breakers trip correctly under failure
- [ ] Retry logic handles transient failures
- [ ] System degrades gracefully when a service is down

### SC-008: Skill Reusability
- [ ] Every skill documented with Purpose, API, Examples
- [ ] Dapr component swap demonstrated (Kafka -> Redis config change)
- [ ] Skills have unit tests
- [ ] DeploymentBlueprintSkill generates artifacts for all 3 platforms

---

## Governance

### Amendment Procedure

1. **Proposal**: Submit changes via ADR in `history/adr/`
2. **Review**: ADR MUST be reviewed and approved
3. **Version Bump**: Semantic versioning (MAJOR/MINOR/PATCH)
4. **Propagation**: Update all dependent templates and agents
5. **Migration Plan**: Document migration path for existing code

### Compliance Checklist

Every PR MUST include:

- [ ] Agentic Dev Stack: PR references validated spec
- [ ] Separation: No frontend-backend coupling violations
- [ ] Event-Driven: State changes emit events via Dapr Pub/Sub
- [ ] Dapr Sidecar: No bypass of Dapr for cross-cutting concerns
- [ ] Local Containerization: Docker images build, Compose/Minikube/Vercel deployable
- [ ] Security: User isolation verified
- [ ] OpenAI SDK: AI logic uses Agents SDK or Hugging Face
- [ ] MCP Tools: Task operations exposed via MCP
- [ ] Secrets: No hardcoded credentials; Dapr secrets in prod
- [ ] Observability: Traces propagated, metrics exported
- [ ] Circuit Breaker: External calls wrapped
- [ ] Backend Evolution: Additive-only schema changes
- [ ] Conversation Persistence: History stored in database
- [ ] Performance-First: Lighthouse >= 90
- [ ] Animation Minimalism: Micro-interactions only

---

**Version**: 5.0.0 | **Ratified**: 2026-01-08 | **Last Amended**: 2026-02-09