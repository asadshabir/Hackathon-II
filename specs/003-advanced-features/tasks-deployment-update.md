# Tasks: Phase V Advanced Features - Deployment Architecture Update

**Input**: Design documents from `/specs/003-advanced-features/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api.md, quickstart.md
**Branch**: `003-advanced-features` | **Date**: 2026-02-09

**Tests**: Included per user instruction — pytest unit tests covering happy path + edge cases required for each backend task.

**Organization**: Tasks are grouped by user story (from spec.md) to enable independent implementation and testing.

**Mandatory Agents**: task-orchestrator-agent, reminder-scheduler-agent, recurring-task-agent, notification-agent, realtime-sync-agent, audit-log-agent, failure-handler-agent, retry-scheduler-agent, observability-agent, event-sourcing-projection-agent, scalability-observer-agent, user-preference-agent, deployment-orchestrator-agent

**Mandatory Skills**: DaprPubSubSkill, DaprStateSkill, DaprServiceInvocationSkill, DaprSecretsSkill, OpenTelemetryTracingSkill, CircuitBreakerSkill, DeploymentBlueprintSkill, TaskCRUDSkill, TaskEventEmitSkill, NotificationDispatchSkill, RealtimeBroadcastSkill, ReminderSchedulingSkill, RecurringRuleEvaluationSkill, RetrySchedulerSkill, FailurePersistenceSkill, AuditPersistenceSkill, DaprMonitoringSkill, PerformanceMetricsSkill, ProjectionBuildSkill

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1–US11)
- Exact file paths included in every task description

## Task Rules (from user)

1. Every inter-service call -> DaprServiceInvocationSkill + CircuitBreakerSkill + OpenTelemetryTracingSkill
2. Every state read/write -> DaprStateSkill (with ETag where concurrency matters)
3. Every event publish -> DaprPubSubSkill + TaskEventEmitSkill + valid CloudEvents 1.0 format
4. Every secret usage -> DaprSecretsSkill
5. Real-time frontend updates -> RealtimeBroadcastSkill
6. All code MUST have complete mypy type hints
7. Write pytest unit tests covering happy path + edge cases

---

## Phase 15: Local Production-Ready Deployment Architecture (Updated)

**Purpose**: Docker Compose, Minikube, and Vercel deployment automation with Hugging Face integration.

- [ ] T107 [P] Create Docker Compose configuration at `docker-compose.yml` — PostgreSQL, Kafka/Zookeeper, Jaeger, Prometheus, Grafana, backend (with Dapr sidecar), frontend (with Dapr sidecar), health checks, resource limits, volume mounts for persistence, proper service dependencies
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: `docker-compose up -d` starts all services with health checks passing, access at http://localhost:3000 (frontend), http://localhost:8000 (backend), http://localhost:16686 (jaeger)

- [ ] T108 [P] Create Dapr components for Docker Compose at `dapr-components.yaml` — pubsub.kafka pointing to kafka:9092, statestore.postgresql with connection string, secretstore.local.env, tracing config pointing to jaeger:4317, subscription definitions with dead-letter topics
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill, DaprPubSubSkill, DaprStateSkill
  - **Acceptance**: All components load in Docker Compose Dapr sidecars without errors

- [ ] T109 [P] Create Minikube deployment manifests at `deploy/minikube/` — namespace todo-app, dapr operator installation, strimzi kafka operator, kafka cluster deployment, backend deployment with dapr annotations (replicas=2), frontend deployment with dapr annotations (replicas=2), services, hpa configs
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill, DaprPubSubSkill, DaprStateSkill
  - **Acceptance**: `kubectl apply -f deploy/minikube/` creates all resources, pods running with dapr sidecars injected

- [ ] T110 [P] Create Vercel deployment configuration at `frontend/vercel.json` and `deploy/vercel/` — frontend build configuration, environment variable mappings (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_DAPR_HTTP_PORT, NEXT_PUBLIC_WEBSOCKET_URL), output directory settings, domain configuration
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: `vercel --prod` deployment succeeds with live URL accessible

- [ ] T111 [P] Update DeploymentBlueprintSkill to support 3 targets in `.claude/skills/DeploymentBlueprintSkill/skill.md` — add Docker Compose target (generates docker-compose.yml, dapr-components.yaml), Minikube target (generates k8s manifests with dapr annotations), Vercel target (generates vercel.json and build configs), update documentation with usage examples for each
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: Skill documentation shows clear examples for each deployment target

- [ ] T112 [P] Create Hugging Face Inference API integration at `backend/src/services/ai_service.py` — create HuggingFaceClient class with inference API calls, model selection (HF_MODEL_NAME env var), API key management (HF_API_KEY env var), fallback mechanism when OpenAI unavailable, circuit breaker protection
  - **Agent**: task-orchestrator-agent
  - **Skills**: CircuitBreakerSkill, DaprSecretsSkill, OpenTelemetryTracingSkill
  - **Acceptance**: When OpenAI fails, automatically falls back to Hugging Face, circuit breaker trips appropriately

- [ ] T113 [P] Update OpenAI Agents to support dual providers in `backend/src/agents/todo_agent.py` — detect available provider (OpenAI vs Hugging Face), use Hugging Face as fallback, update MCP tools to work with both providers, environment-based switching
  - **Agent**: task-orchestrator-agent
  - **Skills**: DaprSecretsSkill, CircuitBreakerSkill, OpenTelemetryTracingSkill
  - **Depends on**: T112
  - **Acceptance**: Agent works with both OpenAI and Hugging Face, falls back seamlessly

- [ ] T114 [P] Create deployment orchestration script at `deploy/deploy.sh` — build Docker images for backend/frontend, push to registry, docker-compose up/down commands, minikube deployment commands, health checks post-deployment, rollback capabilities for each target
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill, PerformanceMetricsSkill, CircuitBreakerSkill
  - **Depends on**: T107, T109, T110
  - **Acceptance**: Script handles deployment to all 3 targets with health checks and rollback

- [ ] T115 [P] Create Dockerfiles for both services with multi-stage builds — `backend/Dockerfile` with dapr sidecar readiness, `frontend/Dockerfile` with dapr sidecar readiness, proper layer caching, non-root user, health checks, multi-platform support
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: Both Dockerfiles build successfully, images run with proper security context and health checks

- [ ] T116 [P] Add Hugging Face configuration to Dapr components in `dapr-components.yaml` — secret component for HF_API_KEY, update documentation in `backend/src/config/secrets.py` to include Hugging Face secrets management
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DaprSecretsSkill, DeploymentBlueprintSkill
  - **Depends on**: T112
  - **Acceptance**: Hugging Face secrets properly configured and accessible via DaprSecretsSkill

**Checkpoint**: Local production-ready deployment architecture complete — Docker Compose, Minikube, and Vercel deployment options with Hugging Face fallback.

---

## Phase 16: Deployment Testing & Validation

**Purpose**: Validate all deployment targets work correctly with full system functionality.

- [ ] T117 Write Docker Compose integration test at `backend/tests/integration/test_docker_compose_deployment.py` — verify full stack runs in compose: backend + frontend + kafka + postgres + dapr sidecars, test end-to-end functionality: create task -> event -> reminder -> notification
  - **Agent**: task-orchestrator-agent, reminder-scheduler-agent, notification-agent
  - **Skills**: DaprPubSubSkill, DaprStateSkill, DaprServiceInvocationSkill
  - **Depends on**: T107
  - **Acceptance**: Test passes in Docker Compose environment with all services communicating

- [ ] T118 Write Minikube integration test at `backend/tests/integration/test_minikube_deployment.py` — verify k8s deployment works: dapr sidecars injected, kafka connectivity, event processing, hpa scaling behavior, service-to-service communication
  - **Agent**: observability-agent, scalability-observer-agent
  - **Skills**: DaprPubSubSkill, DaprStateSkill, DaprMonitoringSkill
  - **Depends on**: T109
  - **Acceptance**: Test passes in Minikube with proper k8s resource utilization

- [ ] T119 Write Vercel frontend validation at `frontend/tests/e2e/test_vercel_deployment.js` — verify frontend works with remote backend, websocket connectivity, real-time sync, environment variable configuration
  - **Agent**: realtime-sync-agent
  - **Skills**: RealtimeBroadcastSkill
  - **Depends on**: T110
  - **Acceptance**: Frontend connects properly to backend when deployed to Vercel

- [ ] T120 Test Hugging Face fallback scenario at `backend/tests/integration/test_hf_fallback.py` — disable OpenAI connectivity, verify system automatically switches to Hugging Face for AI operations, confirm MCP tools work with HF provider
  - **Agent**: task-orchestrator-agent
  - **Skills**: CircuitBreakerSkill, DaprSecretsSkill
  - **Depends on**: T112, T113
  - **Acceptance**: When OpenAI unavailable, system seamlessly uses Hugging Face without errors

- [ ] T121 Create deployment validation script at `scripts/validate_deployments.sh` — runs health checks on all services for each deployment target, verifies event flow, confirms all 13 agents operational, validates observability stack
  - **Agent**: observability-agent
  - **Skills**: PerformanceMetricsSkill, DaprMonitoringSkill
  - **Depends on**: T107, T109, T110, T112
  - **Acceptance**: Script validates all deployment targets with pass/fail status

**Checkpoint**: All deployment targets validated with full functionality.

---

## Phase 17: Deployment Documentation & Demo

**Purpose**: Document deployment procedures and create demo materials.

- [ ] T122 Update README.md deployment section in `README.md` — add Docker Compose quick start, Minikube setup instructions, Vercel deployment guide, Hugging Face configuration, troubleshooting tips for each platform
  - **Acceptance**: README clearly explains all 3 deployment options with step-by-step instructions

- [ ] T123 Create comprehensive deployment guide at `DEPLOYMENT_GUIDE.md` — detailed instructions for each target, environment configuration, common issues, scaling recommendations, monitoring setup
  - **Acceptance**: Complete guide covers all deployment scenarios comprehensively

- [ ] T124 Create demo script showcasing all deployment targets at `demo-script.sh` — 90-second demo covering: Docker Compose setup, Minikube deployment, Vercel frontend, Hugging Face fallback, observability features
  - **Agent**: deployment-orchestrator-agent
  - **Skills**: DeploymentBlueprintSkill
  - **Acceptance**: Demo script runs successfully showing all deployment capabilities

- [ ] T125 Update quickstart guide at `specs/003-advanced-features/quickstart.md` — reflect new deployment architecture, remove DOKS references, add Docker Compose as primary option
  - **Acceptance**: Quickstart guide matches current deployment architecture

**Checkpoint**: Deployment documentation complete and demo ready.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 15 (Deployment Infrastructure) -> No deps, can start immediately
Phase 16 (Validation) -> Depends on Phase 15 deployment tasks
Phase 17 (Documentation) -> Depends on Phases 15-16
```

### Parallel Execution Examples

```
Parallel: T107 (Compose), T108 (Dapr Components), T109 (Minikube), T110 (Vercel) - Different deployment targets
Parallel: T112 (HF Service), T115 (Dockerfiles) - Different components
Sequential: T112 -> T113 -> T116 - AI provider integration
```

---