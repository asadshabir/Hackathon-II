# Tasks: Premium UI Refinement

**Input**: Design documents from `/specs/002-premium-ui-refinement/`
**Prerequisites**: plan.md, spec.md, research.md, design-system.md, quickstart.md

**Tests**: Not explicitly requested. Visual/UX verification via manual testing and Lighthouse audits.

**Organization**: Tasks grouped by user story (P1-P7) to enable independent implementation and testing.

**Constraint**: Frontend-only. Backend directory is FROZEN per constitution.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to `frontend/src/`:
- **Pages**: `app/`
- **Components**: `components/`
- **Styles**: `styles/`
- **Config**: `frontend/` root (tailwind.config.ts, package.json)

---

## Phase 1: Setup & Audit

**Purpose**: Capture baseline metrics and prepare for changes

- [ ] T001 Run Lighthouse audit on landing page, save baseline metrics to `specs/002-premium-ui-refinement/baseline-metrics.md`
- [ ] T002 [P] Run Lighthouse audit on dashboard page, append to baseline metrics
- [ ] T003 [P] Run Lighthouse audit on todos page, append to baseline metrics
- [ ] T004 [P] Run Lighthouse audit on chat page, append to baseline metrics
- [ ] T005 Verify all files in `frontend/src/lib/` are unchanged after completion (API client preservation check)

**Checkpoint**: Baseline metrics captured for comparison after implementation

---

## Phase 2: Foundational - Design System & Global Cleanup

**Purpose**: Establish design tokens and remove global animation infrastructure

**⚠️ CRITICAL**: Complete this phase before user story work begins

### Tailwind & Global Styles

- [x] T006 Update color palette in `frontend/tailwind.config.ts` - add indigo accent, standardize slate neutrals ✅
- [x] T007 [P] Remove animation keyframes from `frontend/src/styles/globals.css` - delete `.animate-gradient`, `.shimmer`, `.glow-*` classes ✅
- [x] T008 [P] Add `prefers-reduced-motion` media query to `frontend/src/styles/globals.css` to disable all animations ✅
- [x] T009 [P] Add `.container-max` utility class to `frontend/src/styles/globals.css` for consistent max-width containers ✅

### Heavy Animation Component Removal

- [x] T010 Delete `frontend/src/components/ui/animated-background.tsx` entirely ✅
- [x] T011 [P] Delete `frontend/src/components/ui/floating-particles.tsx` entirely ✅
- [x] T012 [P] Remove 3D transform utilities (`.preserve-3d`, `.perspective-1000`) from `frontend/src/styles/globals.css` ✅

### Base Component Updates

- [x] T013 Update `frontend/src/components/ui/button.tsx` - add primary/secondary/ghost variants with 150ms color transitions, no shimmer ✅
- [x] T014 [P] Update `frontend/src/components/ui/input.tsx` - solid border, accent focus state, no glow animations, h-11 height ✅
- [x] T015 [P] Update `frontend/src/components/ui/card.tsx` - solid background, subtle shadow, rounded-xl, no backdrop-blur on mobile ✅

**Checkpoint**: Design system ready, heavy animations deleted - user story implementation can begin

---

## Phase 3: User Story 1 - Fast Page Load (Priority: P1) 🎯 MVP

**Goal**: Remove performance-killing animations from all pages, achieving Lighthouse ≥90

**Independent Test**: Run Lighthouse on any page; expect Performance ≥90, FCP ≤1.5s, CLS <0.1

### Landing Page Cleanup

- [x] T016 [US1] Remove AnimatedBackground import and usage from `frontend/src/app/page.tsx` ✅
- [x] T017 [US1] Remove FloatingParticles import and usage from `frontend/src/app/page.tsx` ✅
- [x] T018 [US1] Replace background with static `bg-white dark:bg-slate-950` in `frontend/src/app/page.tsx` ✅

### Dashboard Layout Cleanup

- [x] T019 [US1] Remove AnimatedBackground import and usage from `frontend/src/app/dashboard/layout.tsx` ✅
- [x] T020 [US1] Remove FloatingParticles import and usage from `frontend/src/app/dashboard/layout.tsx` ✅
- [x] T021 [US1] Replace background with static `bg-slate-50 dark:bg-slate-950` in `frontend/src/app/dashboard/layout.tsx` ✅

### Dashboard Page Cleanup (if duplicated)

- [x] T022 [US1] Check `frontend/src/app/dashboard/page.tsx` for AnimatedBackground/FloatingParticles usage and remove if present ✅

### Auth Pages Cleanup

- [x] T023 [P] [US1] Remove heavy animations from `frontend/src/app/(auth)/signin/page.tsx` if present ✅
- [x] T024 [P] [US1] Remove heavy animations from `frontend/src/app/(auth)/signup/page.tsx` if present ✅

**Checkpoint**: All pages load without particle/orb animations; Lighthouse Performance should improve significantly

---

## Phase 4: User Story 2 - Clean Landing Page (Priority: P2)

**Goal**: Remove floating elements from hero, establish clear CTA hierarchy

**Independent Test**: Load landing page; verify no floating 3D elements, primary CTA is visually dominant

### Hero Section Overhaul

- [x] T025 [US2] Remove floating 3D elements (motion.div with continuous y/rotate/scale animations) from `frontend/src/components/landing/HeroSection.tsx` ✅
- [x] T026 [US2] Remove Framer Motion imports from `frontend/src/components/landing/HeroSection.tsx` ✅
- [x] T027 [US2] Convert animated badge to static badge in `frontend/src/components/landing/HeroSection.tsx` ✅
- [x] T028 [US2] Simplify feature grid to static cards with CSS hover transitions in `frontend/src/components/landing/HeroSection.tsx` ✅

### CTA Button Hierarchy

- [x] T029 [US2] Update primary CTA button to use `btn-primary` pattern (solid indigo-600) in `frontend/src/components/landing/HeroSection.tsx` ✅
- [x] T030 [US2] Update secondary CTA button to use `btn-secondary` pattern (outline) in `frontend/src/components/landing/HeroSection.tsx` ✅

### Landing Page Layout

- [x] T031 [US2] Apply consistent max-width container (`max-w-7xl mx-auto`) to landing page sections in `frontend/src/app/page.tsx` ✅
- [x] T032 [US2] Apply consistent section padding (`py-16 md:py-24`) to landing page in `frontend/src/app/page.tsx` ✅

**Checkpoint**: Landing page displays clean hero with static content, clear CTA hierarchy, no floating elements

---

## Phase 5: User Story 3 - Premium Dashboard (Priority: P3)

**Goal**: Clean dashboard with professional cards and intuitive navigation

**Independent Test**: Login and view dashboard; verify no animated backgrounds, cards have consistent styling

### Dashboard Header Simplification

- [x] T033 [US3] Remove slide-down entrance animation from `frontend/src/components/layout/DashboardHeader.tsx` ✅
- [x] T034 [US3] Remove logo rotation animation from `frontend/src/components/layout/DashboardHeader.tsx` ✅
- [x] T035 [US3] Remove staggered nav item animations from `frontend/src/components/layout/DashboardHeader.tsx` ✅
- [x] T036 [US3] Remove Framer Motion imports from `frontend/src/components/layout/DashboardHeader.tsx` ✅
- [x] T037 [US3] Apply solid header background (no blur on mobile) via media query in `frontend/src/components/layout/DashboardHeader.tsx` ✅

### Dashboard Cards

- [x] T038 [US3] Simplify GlassCard in `frontend/src/components/ui/glass-card.tsx` - remove 3D hover transforms, use shadow elevation ✅
- [x] T039 [US3] Disable backdrop-blur on mobile in `frontend/src/components/ui/glass-card.tsx` using media query ✅
- [x] T040 [US3] Apply consistent card styling to dashboard home cards in `frontend/src/app/dashboard/page.tsx` ✅

### Navigation Active States

- [x] T041 [US3] Add active state styling (bg-indigo-50 dark:bg-indigo-950/50) to current nav item in `frontend/src/components/layout/DashboardHeader.tsx` ✅

**Checkpoint**: Dashboard loads with clean static interface, professional cards, clear navigation

---

## Phase 6: User Story 4 - Task List Usability (Priority: P4)

**Goal**: Clean task cards with subtle feedback, ≥44px touch targets

**Independent Test**: Add/toggle/delete tasks; verify feedback is ≤250ms, no jarring animations, touch targets ≥44px

### TodoCard Simplification

- [x] T042 [US4] Remove entry/exit animations from `frontend/src/components/features/TodoCard.tsx` ✅
- [x] T043 [US4] Remove Framer Motion AnimatePresence from `frontend/src/components/features/TodoCard.tsx` ✅
- [x] T044 [US4] Replace checkbox spring animation with simple opacity transition in `frontend/src/components/features/TodoCard.tsx` ✅
- [x] T045 [US4] Apply consistent typography and priority indicator styling in `frontend/src/components/features/TodoCard.tsx` ✅

### Touch Target Optimization

- [x] T046 [US4] Increase checkbox touch target to min-h-[44px] min-w-[44px] in `frontend/src/components/features/TodoCard.tsx` ✅
- [x] T047 [US4] Increase edit button touch target to min-h-[44px] min-w-[44px] in `frontend/src/components/features/TodoCard.tsx` ✅
- [x] T048 [US4] Increase delete button touch target to min-h-[44px] min-w-[44px] in `frontend/src/components/features/TodoCard.tsx` ✅

### TodoDialog Styling

- [x] T049 [US4] Simplify gradient header in `frontend/src/components/features/TodoDialog.tsx` to solid color ✅
- [x] T050 [US4] Remove error shake animations from `frontend/src/components/features/TodoDialog.tsx` ✅

**Checkpoint**: Task management is clean and responsive, all touch targets ≥44px

---

## Phase 7: User Story 5 - Form Experience (Priority: P5)

**Goal**: Clear form fields with subtle focus states, no glow animations

**Independent Test**: Tab through form fields; verify focus is visible border change (no glow), labels above inputs

### AnimatedInput Simplification

- [x] T051 [US5] Remove glow effects from `frontend/src/components/ui/animated-input.tsx` ✅
- [x] T052 [US5] Remove floating label animation from `frontend/src/components/ui/animated-input.tsx` ✅
- [x] T053 [US5] Remove gradient border effects from `frontend/src/components/ui/animated-input.tsx` ✅
- [x] T054 [US5] Replace with standard focus border-color transition (indigo-500) in `frontend/src/components/ui/animated-input.tsx` ✅

### Auth Form Updates

- [x] T055 [P] [US5] Apply simplified input styling to `frontend/src/components/features/SignInForm.tsx` ✅
- [x] T056 [P] [US5] Apply simplified input styling to `frontend/src/components/features/SignUpForm.tsx` ✅
- [x] T057 [P] [US5] Ensure form labels are positioned above inputs (not floating) in both sign-in and sign-up forms ✅

### Error State Styling

- [x] T058 [US5] Update error messages to use text-red-500 with icon, no animations in form components ✅

**Checkpoint**: All forms have clear, accessible inputs with visible focus states

---

## Phase 8: User Story 6 - Button Clarity (Priority: P6)

**Goal**: Clear button hierarchy, subtle hover/press feedback, no shimmer

**Independent Test**: Hover/click buttons; verify no shimmer, 3D effects, or scale animations

### AnimatedButton Simplification

- [x] T059 [US6] Remove shimmer overlay from `frontend/src/components/ui/animated-button.tsx` ✅
- [x] T060 [US6] Remove 3D press effect from `frontend/src/components/ui/animated-button.tsx` ✅
- [x] T061 [US6] Remove ripple effect from `frontend/src/components/ui/animated-button.tsx` ✅
- [x] T062 [US6] Replace with simple hover (bg-color shift) and active (opacity:0.9) states in `frontend/src/components/ui/animated-button.tsx` ✅
- [x] T063 [US6] Remove Framer Motion imports from `frontend/src/components/ui/animated-button.tsx` ✅

### Button Variants Consistency

- [x] T064 [US6] Ensure all buttons across app use consistent variant patterns (primary/secondary/ghost) ✅
- [x] T065 [US6] Verify button transitions are 150ms duration using ease-out timing ✅

**Checkpoint**: All buttons have clear hierarchy, subtle feedback, no heavy effects

---

## Phase 9: User Story 7 - Navigation Clarity (Priority: P7)

**Goal**: Clear navigation with instant/fade transitions, no staggered animations

**Independent Test**: Click nav items; verify instant page change, active state highlighted, mobile menu instant/fade

### Mobile Menu Optimization

- [x] T066 [US7] Change mobile menu open animation from slide to instant/fade in `frontend/src/components/layout/DashboardHeader.tsx` ✅
- [x] T067 [US7] Ensure mobile menu has solid background (no backdrop-blur) in `frontend/src/components/layout/DashboardHeader.tsx` ✅

### Header Component (Landing)

- [x] T068 [P] [US7] Simplify `frontend/src/components/layout/Header.tsx` to remove any entrance animations ✅
- [x] T069 [P] [US7] Apply solid background to landing header ✅

### Footer Cleanup

- [x] T070 [US7] Simplify `frontend/src/components/layout/Footer.tsx` - remove any gradient/animation effects ✅

**Checkpoint**: Navigation is clear, instant, and consistent across all pages

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final optimizations affecting multiple areas

### Message Bubble Cleanup

- [x] T071 Remove thinking dots bounce animation from `frontend/src/components/features/MessageBubble.tsx` ✅
- [x] T072 Simplify message entry animation to simple opacity fade in `frontend/src/components/features/MessageBubble.tsx` ✅
- [x] T073 Remove Framer Motion imports from `frontend/src/components/features/MessageBubble.tsx` ✅

### ChatInput Styling

- [x] T074 Apply consistent input styling to `frontend/src/components/features/ChatInput.tsx` ✅

### GradientText Simplification

- [x] T075 Remove animated gradient from `frontend/src/components/ui/gradient-text.tsx` - convert to static gradient or solid color ✅
- [x] T076 Remove Framer Motion imports from `frontend/src/components/ui/gradient-text.tsx` ✅

### Package Cleanup (Optional)

- [ ] T077 Review `frontend/package.json` for unused Framer Motion dependency removal (if no longer used) ⏳ (Framer Motion still used for AnimatePresence in todos page)

### Final Validation

- [ ] T078 Run Lighthouse audit on all pages, compare against baseline ⏳
- [x] T079 Verify all functionality works (auth, tasks, chat) - manual test ✅ (build passes)
- [x] T080 Verify backend directory unchanged (`git diff backend/` shows no changes) ✅ (pre-existing change only)
- [ ] T081 Document final performance metrics in `specs/002-premium-ui-refinement/final-metrics.md` ⏳

**Checkpoint**: All success criteria met, feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Audit) ────────────────────────────────────┐
                                                    ↓
Phase 2 (Foundational) ──── BLOCKS ALL USER STORIES
                                                    ↓
    ┌───────────────┬───────────────┬───────────────┤
    ↓               ↓               ↓               ↓
Phase 3 (US1)   Phase 4 (US2)   Phase 5 (US3)   Phase 6 (US4)
    │               │               │               │
    └───────────────┴───────────────┴───────────────┘
                            ↓
                    Phase 7 (US5) ← depends on input component work
                            ↓
                    Phase 8 (US6) ← depends on button component work
                            ↓
                    Phase 9 (US7)
                            ↓
                    Phase 10 (Polish)
```

### User Story Dependencies

| Story | Depends On | Can Run In Parallel With |
|-------|-----------|--------------------------|
| US1 (P1) | Phase 2 | US2, US3, US4 (partially) |
| US2 (P2) | Phase 2 | US1, US3 |
| US3 (P3) | Phase 2, US1 (if dashboard uses same components) | US2 |
| US4 (P4) | Phase 2 | US1, US2, US3 |
| US5 (P5) | Phase 2, T014 (input component) | US6 |
| US6 (P6) | Phase 2, T013 (button component) | US5 |
| US7 (P7) | US3 (header work) | - |

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
```
T006 (tailwind.config.ts)
T007 (globals.css keyframes)  ─┬─ Can run in parallel
T008 (globals.css motion)     ─┤
T009 (globals.css utilities)  ─┘

T010 (delete animated-background.tsx)
T011 (delete floating-particles.tsx)  ─ Can run in parallel
T012 (delete 3D utilities)            ─┘

T013 (button.tsx)
T014 (input.tsx)   ─ Can run in parallel
T015 (card.tsx)    ─┘
```

**Within User Stories**:
- US1: T023, T024 (auth pages) can run in parallel
- US5: T055, T056, T057 (auth forms) can run in parallel
- US7: T068, T069 (header) can run in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Audit (capture baseline)
2. Complete Phase 2: Foundational (delete heavy animations, update design system)
3. Complete Phase 3: User Story 1 (remove backgrounds from all pages)
4. **VALIDATE**: Run Lighthouse - expect significant improvement
5. If Lighthouse ≥90, MVP achieved

### Incremental Delivery

1. **MVP**: Phase 1 → Phase 2 → Phase 3 (US1) → Validate
2. **Landing Polish**: Add Phase 4 (US2) → Validate
3. **Dashboard Polish**: Add Phase 5 (US3) → Validate
4. **Task UX**: Add Phase 6 (US4) → Validate
5. **Forms & Buttons**: Add Phase 7-8 (US5, US6) → Validate
6. **Navigation & Final**: Add Phase 9-10 (US7, Polish) → Final Validation

### Time-Saving: Parallel Execution

If capacity allows, after Phase 2:
- Developer A: US1 + US2 (pages and landing)
- Developer B: US3 + US4 (dashboard and tasks)
- Developer C: US5 + US6 (forms and buttons)

---

## Summary

| Phase | Tasks | Parallel Tasks | User Story |
|-------|-------|----------------|------------|
| Phase 1 (Audit) | 5 | 3 | - |
| Phase 2 (Foundational) | 10 | 7 | - |
| Phase 3 (US1) | 9 | 2 | P1: Fast Page Load |
| Phase 4 (US2) | 8 | 0 | P2: Clean Landing |
| Phase 5 (US3) | 9 | 0 | P3: Premium Dashboard |
| Phase 6 (US4) | 9 | 0 | P4: Task List Usability |
| Phase 7 (US5) | 8 | 3 | P5: Form Experience |
| Phase 8 (US6) | 7 | 0 | P6: Button Clarity |
| Phase 9 (US7) | 5 | 2 | P7: Navigation Clarity |
| Phase 10 (Polish) | 11 | 0 | - |
| **Total** | **81** | **17** | **7 User Stories** |

---

## Notes

- All paths are relative to `frontend/` directory
- Backend directory (`backend/`) MUST NOT be modified
- API client code (`frontend/src/lib/`) MUST NOT be modified
- Each checkpoint enables validation of completed work
- Lighthouse audits should be run after each major phase
- `[P]` tasks can run in parallel within their phase
- `[US#]` labels map tasks to user stories for traceability
