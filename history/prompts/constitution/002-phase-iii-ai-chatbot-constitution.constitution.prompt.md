---
id: 002
title: Phase III AI Chatbot Constitution
stage: constitution
date: 2026-01-25
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: main
user: Asad Shabir
command: /sp.constitution
labels: ["constitution", "phase-3", "ai-chatbot", "openai-agents", "mcp"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

You are an expert AI architect and autonomous software engineer.

You specialize in:
- Agentic systems
- OpenAI Agents SDK
- MCP (Model Context Protocol)
- FastAPI
- ChatKit frontend
- SQLModel + PostgreSQL
- Production-grade conversational AI

NON-NEGOTIABLE RULES:
1. Follow Agentic Dev Stack strictly:
   Constitution → Spec → Plan → Tasks → Implementation
2. No manual coding by the user.
3. You must generate, modify, delete, and refactor files yourself.
4. All AI logic must use OpenAI Agents SDK.
5. All task operations must be exposed via MCP tools using Official MCP SDK.
6. Server must be stateless.
7. Conversation memory must persist in the database.
8. Confirm actions conversationally.
9. Handle errors gracefully.
10. Produce clean, secure, production-ready code.

GOAL:
Build a fully functional AI-powered Todo Chatbot (frontend + backend) that manages tasks via natural language.

You are allowed to:
- Add new folders
- Delete unused code
- Refactor existing architecture
- Create migrations
- Upda

## Response snapshot

Updated the project constitution from v1.0.0 to v2.0.0 (MAJOR version bump) to reflect the shift from Phase II (CRUD Todo App with Better Auth) to Phase III (AI-powered Todo Chatbot).

Key changes:
- 10 core principles established (up from 7)
- New principles: OpenAI Agents SDK Mandate, MCP Tool Exposure, Conversation Memory Persistence, Conversational UX Mandate, Graceful Error Handling
- Tech stack updated: OpenAI Agents SDK, MCP SDK, ChatKit frontend
- Database schema requirements now include conversations and messages tables
- Success criteria updated for conversational task management
- Compliance checklist expanded to 10 items matching the 10 principles

## Outcome

- Impact: MAJOR - Complete architectural paradigm shift from form-based CRUD to conversational AI
- Tests: N/A - Constitution document, no code tests
- Files: .specify/memory/constitution.md (updated)
- Next prompts: /sp.specify to create feature spec for AI Todo Chatbot
- Reflection: Successfully captured all 10 non-negotiable rules as enforceable principles with clear rationale and enforcement mechanisms

## Evaluation notes (flywheel)

- Failure modes observed: None - user input was clear and comprehensive
- Graders run and results (PASS/FAIL): N/A - constitution update
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor if 10 principles are too many for compliance checklist overhead
