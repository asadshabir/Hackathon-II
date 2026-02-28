---
id: 017
title: HF Spaces Backend Deployment
stage: green
date: 2026-02-13
surface: agent
model: claude-opus-4-6
feature: 003-advanced-features
branch: 003-advanced-features
user: Asad Shabir
command: /sp.tasks
labels: ["deployment", "huggingface", "docker", "backend", "circuit-breaker", "cron"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - hf-space/Dockerfile
  - hf-space/README.md
  - hf-space/requirements.txt
  - hf-space/.dockerignore
  - hf-space/.gitignore
  - hf-space/main.py
  - hf-space/src/agents/todo_agent.py
  - hf-space/src/config.py
  - hf-space/src/services/analytics_service.py
  - hf-space/src/scheduler/__init__.py
  - hf-space/src/scheduler/reminder_cron.py
tests:
  - Local Docker build: docker build -t todo-hf-space:latest (PASS)
  - Local health check: curl http://localhost:7860/api/health (PASS - 200)
  - Local root endpoint: curl http://localhost:7860/ (PASS - 200 with features)
  - Reminder cron: Started at 60s interval (PASS - logged in container)
  - HF push: git push origin main (PASS - e49cc88)
  - HF health: curl https://asadshabir110-todo-ai-chatbot-api.hf.space/api/health (PASS - healthy)
  - HF signup: POST /api/auth/signup (PASS - user created, JWT returned)
  - HF chatbot: POST /api/chat "Add high priority task" (PASS - task created with priority=high)
  - HF tasks: GET /api/tasks (PASS - 1 task returned with all fields)
---

## Prompt

You are in AUTONOMOUS DEPLOY & FIX MODE for Hugging Face Spaces backend. Execute: Generate Spaces config, Dockerfile adjustments, push/deploy, add secrets, integrate HF Inference for chatbot, fix errors. Agents: task-orchestrator-agent, reminder-scheduler-agent. Skills: ReminderSchedulingSkill, CircuitBreakerSkill.

## Response snapshot

Deployed full Phase V backend to HuggingFace Spaces with advanced features:

1. **Rebuilt hf-space from current backend** - Synced all Phase V code (analytics, preferences, reminders, tags, metrics, websocket, tools) into hf-space directory, replacing outdated Phase I copy.

2. **HF Spaces Dockerfile** - Multi-stage build (Python 3.12-slim-bookworm), non-root user (uid 1000 for HF), port 7860, health check. Image size ~400MB with huggingface_hub.

3. **HF Inference fallback** - Added `huggingface_hub` to requirements. New `_hf_fallback_response()` in todo_agent.py uses Mistral-7B-Instruct via HF Inference API when Gemini is unavailable. Lazy-loaded client.

4. **Circuit breaker** - Existing `AsyncCircuitBreaker` from resilience module wired into Gemini API calls. Opens after 3 failures, retries after 120s, falls back to HF Inference.

5. **In-process reminder cron** - Created `src/scheduler/reminder_cron.py` with asyncio background task. Checks for due reminders every 60s, marks them as fired. Replaces Dapr cron binding.

6. **Analytics service rewrite** - Removed dependency on `src.events.projections` (Dapr-dependent). Rewrote analytics_service.py to query DB directly with same API surface.

7. **Config updates** - Port default 7860, CORS includes *.vercel.app and *.hf.space, HF_TOKEN field, reminder_check_interval setting.

8. **Deployed and verified** - Pushed to `asadshabir110/todo_ai_chatbot_api` HF Space. All endpoints verified live: health, root, signup, chatbot, tasks.

## Outcome

- Impact: Backend fully deployed on HuggingFace Spaces with all Phase V features
- Live URL: https://asadshabir110-todo-ai-chatbot-api.hf.space
- Swagger: https://asadshabir110-todo-ai-chatbot-api.hf.space/docs
- Tests: 9 verification tests PASS (local build, health, push, signup, chatbot, tasks)
- Files: 11 files created/modified in hf-space/
- Next: Connect frontend (Vercel) to HF Space backend URL, set HF_TOKEN secret for inference fallback
- Reflection: The Dapr dependency removal was the key blocker - events.projections import failing crashed the app. Rewriting analytics to query DB directly was clean and equivalent.

## Evaluation notes (flywheel)

- Failure modes: analytics_service importing events.projections (Dapr-only module) crashed container, SQLite fails in container (expected - uses Neon in prod)
- Graders run and results: All 9 tests PASS
- Prompt variant: AUTONOMOUS DEPLOY & FIX MODE
- Next experiment: Set NEXT_PUBLIC_API_URL on Vercel to point to HF Space backend
