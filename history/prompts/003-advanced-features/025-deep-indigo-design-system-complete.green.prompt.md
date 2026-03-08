---
id: "025"
title: "Deep Indigo Design System — Complete Migration"
stage: green
date: "2026-03-03"
surface: agent
model: claude-sonnet-4-6
feature: "003-advanced-features"
branch: 003-advanced-features
user: Asad Shabir
command: "continue from previous session — complete Deep Indigo migration"
labels: ["ui", "design-system", "indigo", "professional", "color-tokens"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - frontend/src/components/ui/recurrence-selector.tsx
  - frontend/src/components/features/todos/TodoDialog.tsx
  - frontend/src/components/features/todos/StatsCard.tsx
  - frontend/src/components/features/analytics/StatCards.tsx
  - frontend/src/app/dashboard/analytics/page.tsx
  - frontend/src/app/dashboard/settings/page.tsx
  - frontend/src/app/dashboard/calendar/page.tsx
  - frontend/src/app/dashboard/todos/page.tsx
  - frontend/src/components/layout/Header.tsx
  - frontend/src/components/layout/Footer.tsx
  - frontend/src/components/ui/glass-card.tsx
tests: []
---

## Prompt

Continue Deep Indigo migration. Complete all remaining files not yet updated from previous session batch.

## Response

Completed the full Deep Indigo design system migration across all remaining files.

**Files updated this session (11 files, + 27 total in commit):**

### Components
- `RecurrenceSelector`: `#1A1A1A` → `#181B23`, `ring-violet` → `ring-indigo`
- `TodoDialog`: inputs `#1A1A1A` → `#181B23`, dialog bg `#0D0D0D` → `#0D0E13`, checkbox gradient + save button violet → indigo
- `StatsCard`: card bg `#0F0F0F` → `#111318`, removed `textShadow` glow on numbers
- `StatCards`: card bg `#0F0F0F` → `#111318`, removed glowColor usage, "Today" accent `#8B5CF6` → `#6366F1`, made `glowColor` optional (TS fix)

### Pages
- `analytics/page.tsx`: all card surfaces `#111318`, spinner indigo, retry button indigo, insights card `rgba(99,102,241,0.10)`
- `settings/page.tsx`: section surfaces `#111318`, spinner indigo, `text-violet-*` → `text-indigo-*`, saving indicator indigo
- `calendar/page.tsx`: calendar card `#111318`, selected day gradient `#4F46E5→#6366F1`, today highlight `rgba(99,102,241,0.15)`, all violet calendar colors → indigo
- `todos/page.tsx`: spinner indigo (no glow), surface cards `#111318`, "Total" StatsCard accent `#6366F1`

### Landing
- `Header.tsx`: bg `rgba(10,11,15,0.92)` (not pure black), logo gradient inline `#4F46E5→#6366F1`, CTA glow `rgba(99,102,241,0.30)`, mobile menu `#111318`
- `Footer.tsx`: bg `#0A0B0F` (not pure `bg-black`)
- `glass-card.tsx`: dark bg `#111318`, glow strengths reduced (24px radius, 0.10 alpha)

**Type check:** `npx tsc --noEmit` → 0 errors
**Commit:** `0da8722` — "Deep Indigo design system: replace AMOLED violet with professional indigo" (27 files, 653 ins / 772 del)

## Design System Summary

| Token | Old (AMOLED) | New (Deep Indigo) |
|---|---|---|
| Background | `#000000` | `#0A0B0F` |
| Surface 1 | `#0F0F0F` | `#111318` |
| Surface 2 | `#1A1A1A` | `#181B23` |
| Dialog bg | `#0D0D0D` | `#0D0E13` |
| Primary | `#8B5CF6` violet | `#6366F1` indigo |
| Primary dark | `#7C3AED` | `#4F46E5` |
| Glow | everywhere | CTA buttons only |
| Active accent | 6 different colors | 1 indigo |
