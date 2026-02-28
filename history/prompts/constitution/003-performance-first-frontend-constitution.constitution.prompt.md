---
id: 003
title: Performance-First Frontend Constitution Amendment
stage: constitution
date: 2026-02-02
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 001-todo-ai-chatbot
user: Asad Shabir
command: /sp.constitution
labels: ["constitution", "performance", "frontend", "animation", "backend-freeze"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A
---

## Prompt

Define the constitution for this project.

Non-negotiable rules:
- Backend code MUST NOT be modified
- API contracts MUST remain identical
- Authentication, chatbot, database untouched
- Remove heavy animations, particle backgrounds, stars, canvas effects
- No new heavy UI libraries
- Mobile performance is priority over visual flair

Quality principles:
- Premium over flashy
- Calm over noisy
- Fast over fancy
- Subtle over dramatic
- Consistency over variety

Animation rules:
- Only micro-interactions
- Only opacity & transform
- Duration 150–250ms
- Disable or minimize animations on mobile

Performance rule:
If a visual effect hurts performance, it must be removed.

## Response snapshot

Updated constitution from v2.0.0 to v3.0.0 (MAJOR version bump) with the following changes:

**New Principles Added:**
- Principle XI: Backend Immutability Mandate - freezes all backend code
- Principle XII: API Contract Freeze - locks all API contracts
- Principle XIII: Performance-First Frontend - prioritizes mobile performance
- Principle XIV: Animation Minimalism - constrains animations to micro-interactions

**New Sections Added:**
- Quality Philosophy table (Premium > Flashy, Calm > Noisy, etc.)
- Performance Budget with specific metrics (Lighthouse 90+, FCP < 1.5s, etc.)
- Prohibited Frontend Libraries list
- Animation Constraints with allowed/prohibited patterns

**Key Enforcement Rules:**
- No changes to `backend/` directory
- Animation duration: 150-250ms max
- Only opacity and transform properties
- Must respect `prefers-reduced-motion`
- Lighthouse Performance score minimum: 90

## Outcome

- ✅ Impact: MAJOR - Added 4 new principles, quality philosophy, and performance budgets
- 🧪 Tests: N/A - Constitution document update
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: /sp.plan for frontend performance optimization feature
- 🧠 Reflection: User prioritizes production stability and mobile performance over visual effects

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A - Document amendment
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Implement frontend-performance-architect agent with these constraints
