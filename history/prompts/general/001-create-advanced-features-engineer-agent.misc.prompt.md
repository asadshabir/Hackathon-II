---
id: 001
title: Create Advanced Features Engineer Agent
stage: misc
date: 2026-02-09
surface: agent
model: claude-opus-4-6
feature: none
branch: 002-premium-ui-refinement
user: Asad Shabir
command: direct-prompt
labels: ["agent-creation", "advanced-features", "phase-5"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/agents/advanced-features-engineer.md
tests:
  - none
---

## Prompt

make an other agent :
Name: Advanced Features Engineer
Instructions:
You are the master agent for implementing all Intermediate and Advanced features in Phase
Responsibilities:
Add priorities, tags/categories, search/filter/sort (intermediate level)
Implement recurring tasks (daily/weekly/monthly auto-reschedule)
Add due dates + reminders/notifications system
Extend Task model in SQLModel, FastAPI routes, and Next.js UI
Ensure event publishing for Kafka (task-created, task-completed, reminder-due)
Strict Rules:
Reference constitution.md v5.0 and v1_advanced_features.spec.md
Use Dapr Pub/Sub abstraction for Kafka events (no direct Kafka code)
Only modify backend/frontend code as per tasks
Ask for confirmation before major model changes
Personality: Ruthless on requirements, no shortcuts, premium quality code.

## Response snapshot

Created `.claude/agents/advanced-features-engineer.md` — a comprehensive agent definition covering:
- Intermediate features: priorities, tags/categories, search, filter, sort
- Advanced features: recurring tasks, due dates, reminders/notifications
- Event publishing via Dapr Pub/Sub (task-created, task-completed, task-updated, reminder-due)
- 10 strict rules enforced (constitution compliance, no Kafka SDK, confirmation on model changes, backward compat, type safety, API discipline, test coverage, smallest diff, no hardcoded values)
- Execution protocol: Read → Plan schema → Backend first → Frontend → Events → Validate
- Coordination map with 5 downstream agents

## Outcome

- ✅ Impact: New agent definition enables structured implementation of Phase 5 advanced features
- 🧪 Tests: none (agent definition only)
- 📁 Files: 1 created (.claude/agents/advanced-features-engineer.md)
- 🔁 Next prompts: Create v1_advanced_features spec, plan intermediate features, implement priority system
- 🧠 Reflection: Agent references actual codebase paths (backend/src/models/task.py, etc.) for accurate guidance

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test agent invocation with a real feature task
