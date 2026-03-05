---
description: "Task list for Phase I In-Memory Python Console Todo App"
---

# Tasks: Phase I – In-Memory Python Console Todo App

**Input**: Design documents from `/specs/001-phase1-todo-app/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan
- [X] T002 [P] Initialize Python project with proper directory structure
- [X] T003 [P] Create src/ directory with models/, services/, cli/ subdirectories

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [X] T004 Define Task model in src/models/todo.py with id, title, and completed attributes
- [X] T005 [P] Create TodoManager service in src/services/todo_manager.py with in-memory storage
- [X] T006 [P] Create ConsoleUI in src/cli/console_ui.py for user interaction
- [X] T007 Create main.py entry point with application loop
- [X] T008 Implement error handling for invalid inputs and edge cases
- [X] T009 Setup configuration management for Python 3.13+ compatibility

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Implement the core functionality to add tasks to the todo list and view them in the console application.

**Independent Test**: The application can accept new tasks from the user via console input and display them back to the user.

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Manual test for add command in src/cli/console_ui.py
- [ ] T011 [P] [US1] Manual test for view command in src/cli/console_ui.py

### Implementation for User Story 1

- [X] T012 [P] [US1] Implement Task model in src/models/todo.py with validation rules
- [X] T013 [P] [US1] Create add_task method in src/services/todo_manager.py
- [X] T014 [US1] Create get_all_tasks method in src/services/todo_manager.py
- [X] T015 [US1] Implement add task command in src/cli/console_ui.py
- [X] T016 [US1] Implement view tasks command in src/cli/console_ui.py
- [X] T017 [US1] Add validation for task title (non-empty string) in src/models/todo.py
- [X] T018 [US1] Connect add/view commands to main application loop in src/main.py

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Complete and Update Tasks (Priority: P2)

**Goal**: Implement functionality to mark tasks as completed and update existing tasks to reflect changes in plans.

**Independent Test**: The application can mark tasks as completed and modify task descriptions without breaking the core functionality.

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T019 [P] [US2] Manual test for complete task command in src/cli/console_ui.py
- [ ] T020 [P] [US2] Manual test for update task command in src/cli/console_ui.py

### Implementation for User Story 2

- [X] T021 [P] [US2] Create mark_complete method in src/services/todo_manager.py
- [X] T022 [P] [US2] Create update_task method in src/services/todo_manager.py
- [X] T023 [US2] Implement complete task command in src/cli/console_ui.py
- [X] T024 [US2] Implement update task command in src/cli/console_ui.py
- [X] T025 [US2] Add validation for task ID existence in src/services/todo_manager.py
- [X] T026 [US2] Connect complete/update commands to main application loop in src/main.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Delete Tasks (Priority: P3)

**Goal**: Implement functionality to remove tasks that are no longer needed from the todo list.

**Independent Test**: The application can remove tasks from the list without affecting other tasks.

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T027 [P] [US3] Manual test for delete task command in src/cli/console_ui.py

### Implementation for User Story 3

- [X] T028 [P] [US3] Create delete_task method in src/services/todo_manager.py
- [X] T029 [US3] Implement delete task command in src/cli/console_ui.py
- [X] T030 [US3] Add validation for task existence before deletion in src/services/todo_manager.py
- [X] T031 [US3] Connect delete command to main application loop in src/main.py

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T032 [P] Add README.md with setup instructions
- [X] T033 [P] Add CLAUDE.md with Claude Code instructions
- [X] T034 Code cleanup and refactoring
- [X] T035 [P] Error handling improvements across all components
- [X] T036 Run quickstart.md validation
- [X] T037 Final integration testing of all features

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Implement Task model in src/models/todo.py with validation rules"
Task: "Create add_task method in src/services/todo_manager.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence