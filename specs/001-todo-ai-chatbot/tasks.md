# Tasks: Todo AI Chatbot

**Input**: Design documents from `/specs/001-todo-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/
**Branch**: `001-todo-ai-chatbot`
**Date**: 2026-01-26

---

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US7, SETUP)

## Path Conventions

- **Backend**: `backend/src/`, `backend/main.py`
- **Frontend**: `frontend/src/`
- **Specs**: `specs/001-todo-ai-chatbot/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 [SETUP] Create backend directory structure per plan.md at `backend/`
- [ ] T002 [P] [SETUP] Create `backend/requirements.txt` with pinned dependencies (FastAPI, SQLModel, openai-agents, mcp, python-jose, bcrypt, asyncpg, python-dotenv)
- [ ] T003 [P] [SETUP] Create `backend/.env.example` with all required environment variables per quickstart.md
- [ ] T004 [P] [SETUP] Create frontend directory structure at `frontend/` using `npx create-next-app@latest`
- [ ] T005 [SETUP] Create `frontend/.env.example` with NEXT_PUBLIC_API_URL variable

**Checkpoint**: Project skeleton ready - proceed to foundational phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

### Database & Configuration

- [ ] T006 [FOUND] Create `backend/src/config.py` with environment configuration using Pydantic Settings
- [ ] T007 [FOUND] Create `backend/src/database.py` with async SQLModel engine and session management for Neon PostgreSQL
- [ ] T008 [P] [FOUND] Create `backend/src/models/__init__.py` with model exports

### SQLModel Models (from data-model.md)

- [ ] T009 [P] [FOUND] Create `backend/src/models/user.py` with User SQLModel (id, email, hashed_password, created_at, updated_at)
- [ ] T010 [P] [FOUND] Create `backend/src/models/task.py` with Task SQLModel (id, user_id FK, title, completed, created_at, completed_at)
- [ ] T011 [P] [FOUND] Create `backend/src/models/conversation.py` with Conversation SQLModel (id, user_id FK, created_at, last_activity_at)
- [ ] T012 [P] [FOUND] Create `backend/src/models/message.py` with Message SQLModel (id, conversation_id FK, role enum, content, created_at)

### Database Initialization

- [ ] T013 [FOUND] Create `backend/src/init_db.py` to create tables on startup using SQLModel.metadata.create_all

### Middleware Stack

- [ ] T014 [P] [FOUND] Create `backend/src/middleware/error_handler.py` with global exception handler returning user-friendly messages
- [ ] T015 [P] [FOUND] Create `backend/src/middleware/rate_limiter.py` with in-memory rate limiting (60 req/min chat, 100 req/min tasks)
- [ ] T016 [FOUND] Create `backend/src/middleware/__init__.py` with middleware exports

### FastAPI Application Entry

- [ ] T017 [FOUND] Create `backend/main.py` with FastAPI app, CORS middleware, route registration, and startup event for database init

### Health Check Route

- [ ] T018 [FOUND] Create `backend/src/api/health.py` with GET /api/health returning {status: "healthy", timestamp: ISO}

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 7 - User Authentication (Priority: P1)

**Goal**: Enable users to sign up, sign in, and maintain authenticated sessions

**Independent Test**: Sign up → log out → log back in → verify session persists

### Implementation

- [ ] T019 [US7] Create `backend/src/services/auth_service.py` with password hashing (bcrypt) and verification functions
- [ ] T020 [US7] Add JWT token creation and validation functions to `backend/src/services/auth_service.py`
- [ ] T021 [US7] Create `backend/src/middleware/auth_middleware.py` with get_current_user dependency extracting user from JWT cookie
- [ ] T022 [US7] Create `backend/src/api/auth.py` with POST /api/auth/signup endpoint (creates user, returns JWT in HTTP-only cookie)
- [ ] T023 [US7] Add POST /api/auth/signin endpoint to `backend/src/api/auth.py` (validates credentials, returns JWT cookie)
- [ ] T024 [US7] Add POST /api/auth/signout endpoint to `backend/src/api/auth.py` (clears JWT cookie)
- [ ] T025 [US7] Add GET /api/auth/me endpoint to `backend/src/api/auth.py` (returns current user info)
- [ ] T026 [US7] Register auth router in `backend/main.py` at prefix /api/auth

**Checkpoint**: Authentication complete - users can register and log in

---

## Phase 4: User Story 1 - Add Task via Natural Language (Priority: P1)

**Goal**: Users can add tasks by typing natural language messages

**Independent Test**: Send "Add buy groceries" → verify task created and confirmation received

### MCP Tools Infrastructure

- [ ] T027 [US1] Create `backend/src/tools/tool_context.py` with ToolContext dataclass (user_id, conversation_id, session)
- [ ] T028 [US1] Create `backend/src/tools/mcp_server.py` with MCP server initialization using Official MCP SDK
- [ ] T029 [US1] Create `backend/src/services/task_service.py` with create_task function (enforces user_id ownership)

### MCP Tool: create_task

- [ ] T030 [US1] Create `backend/src/tools/task_tools.py` with create_task MCP tool (title param, returns success/task)
- [ ] T031 [US1] Add tool registration to `backend/src/tools/mcp_server.py` for create_task

### OpenAI Agent Setup

- [ ] T032 [US1] Create `backend/src/agents/prompts.py` with SYSTEM_PROMPT for todo assistant persona
- [ ] T033 [US1] Create `backend/src/agents/todo_agent.py` with Agent definition using OpenAI Agents SDK, registering MCP tools
- [ ] T034 [US1] Create `backend/src/services/agent_service.py` with invoke_agent function (loads context, calls agent, returns response)

### Chat Endpoint

- [ ] T035 [US1] Create `backend/src/services/conversation_service.py` with create_conversation and add_message functions
- [ ] T036 [US1] Create `backend/src/api/chat.py` with POST /api/chat endpoint (validates auth, invokes agent, saves messages, returns response)
- [ ] T037 [US1] Register chat router in `backend/main.py` at prefix /api

**Checkpoint**: Users can add tasks via chat - core chatbot functionality working

---

## Phase 5: User Story 2 - View Tasks via Conversation (Priority: P1)

**Goal**: Users can ask to see their tasks and receive formatted list

**Independent Test**: Ask "What's on my list?" → receive formatted task list

### MCP Tool: list_tasks

- [ ] T038 [US2] Add get_tasks function to `backend/src/services/task_service.py` with filter support (all/pending/completed)
- [ ] T039 [US2] Add list_tasks MCP tool to `backend/src/tools/task_tools.py` with filter parameter
- [ ] T040 [US2] Register list_tasks tool in `backend/src/tools/mcp_server.py`

### Direct Task API (Optional)

- [ ] T041 [P] [US2] Create `backend/src/api/tasks.py` with GET /api/tasks endpoint (authenticated, returns user's tasks)
- [ ] T042 [US2] Register tasks router in `backend/main.py` at prefix /api

**Checkpoint**: Users can view tasks via chat and direct API

---

## Phase 6: User Story 3 - Complete Task via Conversation (Priority: P2)

**Goal**: Users can mark tasks complete by telling the chatbot

**Independent Test**: Say "I finished buying groceries" → task marked complete

### MCP Tool: complete_task

- [ ] T043 [US3] Add find_task_by_term function to `backend/src/services/task_service.py` (case-insensitive search)
- [ ] T044 [US3] Add complete_task function to `backend/src/services/task_service.py` (sets completed=True, completed_at)
- [ ] T045 [US3] Add complete_task MCP tool to `backend/src/tools/task_tools.py` with task_id OR search_term params
- [ ] T046 [US3] Register complete_task tool in `backend/src/tools/mcp_server.py`

### Direct Task API Extension

- [ ] T047 [P] [US3] Add PATCH /api/tasks/{task_id} endpoint to `backend/src/api/tasks.py` (update title/completed)

**Checkpoint**: Users can complete tasks via chat

---

## Phase 7: User Story 4 - Delete Task via Conversation (Priority: P2)

**Goal**: Users can remove tasks by telling the chatbot

**Independent Test**: Say "Remove buy groceries" → task deleted from list

### MCP Tool: delete_task

- [ ] T048 [US4] Add delete_task function to `backend/src/services/task_service.py` (verifies ownership, deletes)
- [ ] T049 [US4] Add delete_task MCP tool to `backend/src/tools/task_tools.py` with task_id OR search_term params
- [ ] T050 [US4] Register delete_task tool in `backend/src/tools/mcp_server.py`

### Direct Task API Extension

- [ ] T051 [P] [US4] Add DELETE /api/tasks/{task_id} endpoint to `backend/src/api/tasks.py`

**Checkpoint**: Users can delete tasks via chat

---

## Phase 8: User Story 6 - Conversation Persistence (Priority: P2)

**Goal**: Conversation history preserved and loaded on return

**Independent Test**: Add tasks → refresh page → see previous conversation

### Conversation Management

- [ ] T052 [US6] Add get_user_conversations function to `backend/src/services/conversation_service.py`
- [ ] T053 [US6] Add get_conversation_messages function to `backend/src/services/conversation_service.py` (with pagination)
- [ ] T054 [US6] Add get_conversation_context function to `backend/src/services/conversation_service.py` (last 20 messages for AI)
- [ ] T055 [US6] Update `backend/src/services/agent_service.py` to load conversation context before agent invocation

### Conversation API Endpoints

- [ ] T056 [US6] Create `backend/src/api/conversations.py` with GET /api/conversations (list user's conversations)
- [ ] T057 [US6] Add GET /api/conversations/{id}/messages endpoint to `backend/src/api/conversations.py`
- [ ] T058 [US6] Register conversations router in `backend/main.py` at prefix /api

**Checkpoint**: Conversation history persists across sessions

---

## Phase 9: User Story 5 - Update Task via Conversation (Priority: P3)

**Goal**: Users can modify task titles via conversation

**Independent Test**: Say "Change buy groceries to buy organic groceries" → title updated

### MCP Tool: update_task

- [ ] T059 [US5] Add update_task function to `backend/src/services/task_service.py` (updates title)
- [ ] T060 [US5] Add update_task MCP tool to `backend/src/tools/task_tools.py` with task_id/search_term and new_title params
- [ ] T061 [US5] Register update_task tool in `backend/src/tools/mcp_server.py`

### Direct Task API Extension

- [ ] T062 [P] [US5] Add POST /api/tasks endpoint to `backend/src/api/tasks.py` (direct task creation)

**Checkpoint**: All backend functionality complete

---

## Phase 10: Frontend - Authentication (Priority: P1)

**Goal**: Users can sign up and sign in via web interface

### API Client Setup

- [ ] T063 [FE] Create `frontend/src/lib/api.ts` with fetch wrapper including credentials and error handling
- [ ] T064 [FE] Create `frontend/src/lib/auth.ts` with signup, signin, signout, getCurrentUser functions

### Auth Hooks and Context

- [ ] T065 [FE] Create `frontend/src/lib/hooks/useAuth.ts` with authentication state management
- [ ] T066 [FE] Create `frontend/src/components/auth/AuthGuard.tsx` to protect routes requiring authentication

### Auth Pages

- [ ] T067 [P] [FE] Create `frontend/src/app/(auth)/signup/page.tsx` with signup form
- [ ] T068 [P] [FE] Create `frontend/src/app/(auth)/signin/page.tsx` with signin form
- [ ] T069 [FE] Create `frontend/src/components/auth/SignUpForm.tsx` with email/password inputs and validation
- [ ] T070 [FE] Create `frontend/src/components/auth/SignInForm.tsx` with email/password inputs

### Root Layout

- [ ] T071 [FE] Update `frontend/src/app/layout.tsx` with auth provider wrapper and global styles
- [ ] T072 [FE] Create `frontend/src/app/page.tsx` as landing page redirecting to signin or chat

**Checkpoint**: Users can authenticate via frontend

---

## Phase 11: Frontend - Chat Interface (Priority: P1)

**Goal**: ChatKit-based conversational interface for task management

### Chat API Integration

- [ ] T073 [FE] Create `frontend/src/lib/hooks/useChat.ts` with message state, sendMessage function, loading states

### ChatKit Components

- [ ] T074 [P] [FE] Create `frontend/src/components/chat/MessageBubble.tsx` for user/assistant message display
- [ ] T075 [P] [FE] Create `frontend/src/components/chat/TypingIndicator.tsx` for loading state
- [ ] T076 [FE] Create `frontend/src/components/chat/MessageList.tsx` rendering conversation messages
- [ ] T077 [FE] Create `frontend/src/components/chat/ChatInput.tsx` with text input and send button
- [ ] T078 [FE] Create `frontend/src/components/chat/ChatContainer.tsx` composing MessageList, TypingIndicator, ChatInput

### Chat Page

- [ ] T079 [FE] Create `frontend/src/app/chat/layout.tsx` with AuthGuard wrapper
- [ ] T080 [FE] Create `frontend/src/app/chat/page.tsx` rendering ChatContainer with conversation loading

**Checkpoint**: Users can chat with AI assistant via frontend

---

## Phase 12: Frontend - Polish (Priority: P2)

**Goal**: Theme support, responsive design, conversation history

### Theme Support

- [ ] T081 [P] [FE] Create `frontend/src/components/ui/ThemeToggle.tsx` for dark/light mode switch
- [ ] T082 [FE] Update `frontend/tailwind.config.ts` with dark mode configuration
- [ ] T083 [FE] Update `frontend/src/styles/globals.css` with theme variables and ChatKit styles

### UI Components

- [ ] T084 [P] [FE] Create `frontend/src/components/ui/Button.tsx` with variants (primary, secondary)
- [ ] T085 [P] [FE] Create `frontend/src/components/ui/Input.tsx` with form input styling

### Conversation History

- [ ] T086 [FE] Add conversation list sidebar to chat layout showing past conversations
- [ ] T087 [FE] Implement conversation switching in `frontend/src/lib/hooks/useChat.ts`

**Checkpoint**: Frontend complete with polish

---

## Phase 13: Deployment & Documentation

**Purpose**: Production-ready deployment configuration

### Docker Configuration

- [ ] T088 [P] [DEPLOY] Create `backend/Dockerfile` per plan.md (Python 3.13-slim, uvicorn)
- [ ] T089 [P] [DEPLOY] Create `frontend/Dockerfile` per plan.md (Node 20-alpine, standalone build)
- [ ] T090 [DEPLOY] Create `docker-compose.yml` at project root for local development

### Verification

- [ ] T091 [DEPLOY] Run quickstart.md verification steps (health check, auth flow, chat endpoint)
- [ ] T092 [DEPLOY] Verify user data isolation (User A cannot see User B's tasks)

**Checkpoint**: Deployment complete - system ready for production

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **US7 Authentication (Phase 3)**: Depends on Foundational
- **US1 Add Task (Phase 4)**: Depends on US7 (requires auth)
- **US2 View Tasks (Phase 5)**: Depends on US1 (tasks must exist)
- **US3 Complete Task (Phase 6)**: Depends on US2
- **US4 Delete Task (Phase 7)**: Depends on US2
- **US6 Persistence (Phase 8)**: Depends on US1
- **US5 Update Task (Phase 9)**: Depends on US2
- **Frontend Auth (Phase 10)**: Depends on US7 backend
- **Frontend Chat (Phase 11)**: Depends on US1 backend + Phase 10
- **Frontend Polish (Phase 12)**: Depends on Phase 11
- **Deployment (Phase 13)**: Depends on all previous phases

### Parallel Opportunities

- T002, T003, T004, T005 can run in parallel (Setup)
- T009, T010, T011, T012 can run in parallel (Models)
- T014, T015 can run in parallel (Middleware)
- T041, T047, T051, T062 can run in parallel (Task API endpoints)
- T067, T068 can run in parallel (Auth pages)
- T074, T075 can run in parallel (Chat components)
- T081, T084, T085 can run in parallel (UI components)
- T088, T089 can run in parallel (Dockerfiles)

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US7 Authentication
4. Complete Phase 4: US1 Add Task
5. Complete Phase 5: US2 View Tasks
6. Complete Phase 10: Frontend Auth
7. Complete Phase 11: Frontend Chat
8. **STOP and VALIDATE**: Full add/view cycle works
9. Deploy MVP

### Full Feature Delivery

Continue with P2 and P3 stories after MVP validation:
- Phase 6: US3 Complete Task
- Phase 7: US4 Delete Task
- Phase 8: US6 Conversation Persistence
- Phase 9: US5 Update Task
- Phase 12: Frontend Polish
- Phase 13: Deployment

---

## Notes

- All tasks assume Claude Code execution (no manual user coding required)
- [P] tasks = different files, can execute in parallel
- [Story] label maps task to specific user story for traceability
- Commit after each task or logical group
- Stop at any checkpoint to validate functionality
- Verify tests pass before moving to next phase
