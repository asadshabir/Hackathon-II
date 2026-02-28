# Implementation Plan: Todo AI Chatbot

**Branch**: `001-todo-ai-chatbot` | **Date**: 2026-01-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-todo-ai-chatbot/spec.md`

---

## Summary

Build an AI-powered Todo Chatbot that enables users to manage tasks through natural language conversation. The system uses OpenAI Agents SDK for AI reasoning, MCP (Model Context Protocol) for tool exposure, FastAPI for the backend API, and a ChatKit-based Next.js frontend. All state is persisted in PostgreSQL (Neon) to maintain stateless server architecture.

---

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK, MCP SDK, Next.js 15+, ChatKit
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM
**Testing**: pytest (backend), Jest/Vitest (frontend)
**Target Platform**: Linux containers (Docker), deployed to Railway/Hugging Face Spaces
**Project Type**: Web application (monorepo with frontend + backend)
**Performance Goals**: <3s response initiation, 100 concurrent users
**Constraints**: Stateless backend, <30s AI response timeout, 20-message context window
**Scale/Scope**: 100 concurrent users, 1000 tasks per user, 500 messages per conversation

---

## Constitution Check

*GATE: All 10 principles verified - PASS*

| Principle | Status | Implementation Evidence |
|-----------|--------|------------------------|
| I. Agentic Dev Stack | ✅ PASS | Spec validated before plan; tasks.md will follow |
| II. Architectural Separation | ✅ PASS | Independent frontend/backend services with REST API |
| III. Security by Isolation | ✅ PASS | All queries include user_id filter; MCP tools scoped |
| IV. OpenAI Agents SDK | ✅ PASS | Agent defined with SDK; tools registered via decorators |
| V. MCP Tool Exposure | ✅ PASS | 5 MCP tools (create, list, complete, delete, update) |
| VI. Stateless Server | ✅ PASS | No in-memory state; all data in PostgreSQL |
| VII. Environment Management | ✅ PASS | All secrets via .env; OPENAI_API_KEY configured |
| VIII. Conversation Persistence | ✅ PASS | conversations + messages tables in schema |
| IX. Conversational UX | ✅ PASS | ChatKit interface; NL intent recognition |
| X. Graceful Error Handling | ✅ PASS | Circuit breaker; user-friendly error messages |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-todo-ai-chatbot/
├── spec.md              # Feature specification (complete)
├── plan.md              # This file
├── research.md          # Technology research and decisions
├── data-model.md        # Database schema design
├── quickstart.md        # Development setup guide
├── contracts/           # API contracts (OpenAPI)
│   ├── openapi.yaml     # Full OpenAPI 3.1 specification
│   └── mcp-tools.md     # MCP tool definitions
└── tasks.md             # Implementation tasks (next step)
```

### Source Code (repository root)

```text
Phase-3/
├── backend/
│   ├── main.py                    # FastAPI application entry
│   ├── requirements.txt           # Python dependencies (pinned)
│   ├── Dockerfile                 # Container definition
│   ├── .env.example               # Environment template
│   └── src/
│       ├── __init__.py
│       ├── config.py              # Environment configuration
│       ├── database.py            # Database connection & session
│       ├── models/                # SQLModel database models
│       │   ├── __init__.py
│       │   ├── user.py            # User model
│       │   ├── task.py            # Task model
│       │   ├── conversation.py    # Conversation model
│       │   └── message.py         # Message model
│       ├── agents/                # OpenAI Agents SDK
│       │   ├── __init__.py
│       │   ├── todo_agent.py      # Main agent definition
│       │   └── prompts.py         # System prompts
│       ├── tools/                 # MCP tool implementations
│       │   ├── __init__.py
│       │   ├── mcp_server.py      # MCP server setup
│       │   ├── task_tools.py      # Task CRUD tools
│       │   └── tool_context.py    # User context injection
│       ├── api/                   # FastAPI routes
│       │   ├── __init__.py
│       │   ├── auth.py            # Authentication endpoints
│       │   ├── chat.py            # Chat endpoint
│       │   ├── conversations.py   # Conversation endpoints
│       │   ├── tasks.py           # Task endpoints (optional direct)
│       │   └── health.py          # Health check
│       ├── services/              # Business logic
│       │   ├── __init__.py
│       │   ├── auth_service.py    # Auth logic (JWT, passwords)
│       │   ├── task_service.py    # Task CRUD operations
│       │   ├── conversation_service.py  # Conversation management
│       │   └── agent_service.py   # Agent invocation wrapper
│       └── middleware/            # FastAPI middleware
│           ├── __init__.py
│           ├── auth_middleware.py # JWT verification
│           ├── error_handler.py   # Global error handling
│           └── rate_limiter.py    # Rate limiting
│
├── frontend/
│   ├── package.json               # Node dependencies
│   ├── next.config.ts             # Next.js configuration
│   ├── tailwind.config.ts         # Tailwind configuration
│   ├── Dockerfile                 # Container definition
│   ├── .env.example               # Environment template
│   └── src/
│       ├── app/                   # Next.js App Router
│       │   ├── layout.tsx         # Root layout
│       │   ├── page.tsx           # Landing page
│       │   ├── (auth)/            # Auth route group
│       │   │   ├── signin/page.tsx
│       │   │   └── signup/page.tsx
│       │   └── chat/              # Chat route
│       │       ├── page.tsx       # Chat interface
│       │       └── layout.tsx     # Chat layout (auth guard)
│       ├── components/            # React components
│       │   ├── chat/              # Chat-specific components
│       │   │   ├── ChatContainer.tsx
│       │   │   ├── MessageList.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── ChatInput.tsx
│       │   │   └── TypingIndicator.tsx
│       │   ├── auth/              # Auth components
│       │   │   ├── SignInForm.tsx
│       │   │   ├── SignUpForm.tsx
│       │   │   └── AuthGuard.tsx
│       │   └── ui/                # Shared UI components
│       │       ├── Button.tsx
│       │       ├── Input.tsx
│       │       └── ThemeToggle.tsx
│       ├── lib/                   # Utilities
│       │   ├── api.ts             # API client
│       │   ├── auth.ts            # Auth utilities
│       │   └── hooks/             # Custom hooks
│       │       ├── useAuth.ts
│       │       └── useChat.ts
│       └── styles/
│           └── globals.css        # Global styles
│
├── specs/                         # Specifications (existing)
├── history/                       # PHRs and ADRs (existing)
├── .specify/                      # SpecKit templates (existing)
├── docker-compose.yml             # Local development
└── README.md                      # Project documentation
```

**Structure Decision**: Web application structure selected per constitution mandate for architectural separation. Frontend and backend are independently deployable services communicating via REST API.

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Auth Pages │  │  Chat Page  │  │     ChatKit Components   │ │
│  └─────────────┘  └──────┬──────┘  └─────────────────────────┘ │
│                          │                                       │
│                    REST API / SSE                                │
└──────────────────────────┼───────────────────────────────────────┘
                           │
┌──────────────────────────┼───────────────────────────────────────┐
│                         Backend (FastAPI)                         │
│  ┌─────────────┐  ┌──────┴──────┐  ┌─────────────────────────┐  │
│  │ Auth Routes │  │ Chat Route  │  │   Conversation Routes    │  │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │
│         │                │                       │               │
│  ┌──────┴──────┐  ┌──────┴──────────────────────┴────────────┐  │
│  │ Auth Service│  │              Agent Service                │  │
│  └──────┬──────┘  └──────┬───────────────────────────────────┘  │
│         │                │                                       │
│         │         ┌──────┴──────┐                               │
│         │         │ OpenAI Agent│ ◄─── OpenAI Agents SDK        │
│         │         └──────┬──────┘                               │
│         │                │                                       │
│         │         ┌──────┴──────┐                               │
│         │         │  MCP Tools  │ ◄─── MCP SDK                  │
│         │         └──────┬──────┘                               │
│         │                │                                       │
│  ┌──────┴────────────────┴──────────────────────────────────┐   │
│  │                      Services Layer                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐  │   │
│  │  │Task Service│  │Conv Service│  │   Message Service   │  │   │
│  │  └─────┬──────┘  └─────┬──────┘  └─────────┬──────────┘  │   │
│  └────────┼───────────────┼───────────────────┼─────────────┘   │
│           │               │                   │                  │
│  ┌────────┴───────────────┴───────────────────┴─────────────┐   │
│  │                    SQLModel ORM                           │   │
│  └────────────────────────┬─────────────────────────────────┘   │
└───────────────────────────┼──────────────────────────────────────┘
                            │
                   ┌────────┴────────┐
                   │  PostgreSQL     │
                   │  (Neon)         │
                   └─────────────────┘
```

### Request Flow: Chat Message

```
1. User types message in ChatKit input
2. Frontend sends POST /api/chat with { message, conversation_id? }
3. Backend validates JWT token (middleware)
4. Backend loads conversation context (last 20 messages)
5. Agent Service invokes OpenAI Agent with:
   - System prompt (task assistant persona)
   - Conversation context
   - Available MCP tools
6. Agent processes message, calls MCP tools as needed
7. MCP tools execute task operations with user_id scope
8. Agent returns conversational response
9. Backend saves user message + assistant response to database
10. Backend returns response (or streams via SSE)
11. Frontend displays message in ChatKit
```

### MCP Tool Integration

```
┌─────────────────────────────────────────────────────┐
│                 OpenAI Agent                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ System Prompt: "You are a helpful task..."  │   │
│  └─────────────────────────────────────────────┘   │
│                        │                            │
│                Tool Invocation                      │
│                        ▼                            │
│  ┌─────────────────────────────────────────────┐   │
│  │              MCP Tool Router                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │   │
│  │  │create_   │ │list_     │ │complete_ │    │   │
│  │  │task      │ │tasks     │ │task      │    │   │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘    │   │
│  │  ┌──────────┐ ┌──────────┐                  │   │
│  │  │delete_   │ │update_   │                  │   │
│  │  │task      │ │task      │                  │   │
│  │  └────┬─────┘ └────┬─────┘                  │   │
│  └───────┼───────────┼────────────────────────┘   │
│          │           │                             │
│          ▼           ▼                             │
│  ┌─────────────────────────────────────────────┐   │
│  │         Tool Context (user_id injected)     │   │
│  └─────────────────────┬───────────────────────┘   │
└────────────────────────┼────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │   Task Service   │
              │  (SQLModel ORM)  │
              └────────┬─────────┘
                       │
                       ▼
              ┌──────────────────┐
              │   PostgreSQL     │
              └──────────────────┘
```

---

## Backend Architecture

### 1. FastAPI Application Structure

**Entry Point** (`main.py`):
```python
# Pseudocode structure
app = FastAPI()

# Middleware stack
app.add_middleware(RateLimitMiddleware)
app.add_middleware(CORSMiddleware)

# Exception handlers
app.add_exception_handler(Exception, global_error_handler)

# Routes
app.include_router(auth_router, prefix="/api/auth")
app.include_router(chat_router, prefix="/api/chat")
app.include_router(conversations_router, prefix="/api/conversations")
app.include_router(tasks_router, prefix="/api/tasks")
app.include_router(health_router, prefix="/api")

# Startup: initialize database, MCP server
@app.on_event("startup")
async def startup():
    await init_database()
    await init_mcp_server()
```

### 2. OpenAI Agents SDK Integration

**Agent Definition** (`agents/todo_agent.py`):
```python
# Pseudocode structure
from openai_agents import Agent, tool

SYSTEM_PROMPT = """You are a helpful task management assistant..."""

@tool
def create_task(title: str) -> dict:
    """Creates a new task for the current user."""
    # Implementation delegates to task_service
    pass

@tool
def list_tasks(filter: str = "all") -> dict:
    """Retrieves tasks for the current user."""
    pass

# ... other tools

todo_agent = Agent(
    name="TodoAssistant",
    instructions=SYSTEM_PROMPT,
    tools=[create_task, list_tasks, complete_task, delete_task, update_task],
    model="gpt-4o-mini"  # configurable via env
)
```

### 3. MCP Server Integration

**MCP Tool Registration** (`tools/mcp_server.py`):
```python
# Pseudocode structure
from mcp import Server, Tool

mcp_server = Server("todo-mcp")

@mcp_server.tool()
async def create_task(title: str, context: ToolContext) -> ToolResult:
    """MCP tool wrapper that enforces user context."""
    user_id = context.user_id  # Injected from auth
    result = await task_service.create_task(user_id, title)
    return ToolResult(success=True, data=result)

# Tool context injection ensures user_id comes from auth, not AI
```

### 4. Stateless Request Handling

Each request is independently processable:

1. **JWT Extraction**: Token from Authorization header or cookie
2. **Token Validation**: Verify signature, expiry, extract user_id
3. **Context Loading**: Fetch conversation history from database
4. **Agent Invocation**: Pass context to agent, receive response
5. **State Persistence**: Save messages to database
6. **Response**: Return to client

No in-memory state between requests.

---

## Frontend Architecture

### 1. Next.js App Router Structure

**Route Groups**:
- `(auth)/` - Public authentication pages (signin, signup)
- `chat/` - Protected chat interface (requires auth)

**Auth Guard**:
```typescript
// Pseudocode structure
export function AuthGuard({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;
  if (!user) redirect('/signin');

  return children;
}
```

### 2. ChatKit Integration

**Chat Container**:
```typescript
// Pseudocode structure
export function ChatContainer() {
  const { messages, sendMessage, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <MessageList messages={messages} />
      {isLoading && <TypingIndicator />}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
```

### 3. Real-time Updates

**SSE Streaming** (for long responses):
```typescript
// Pseudocode structure
async function streamChat(message: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
    headers: { 'Accept': 'text/event-stream' }
  });

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    // Append streamed text to UI
  }
}
```

---

## Database Schema

See [data-model.md](./data-model.md) for complete schema design.

**Summary**:
- `users` - Authentication accounts
- `tasks` - Todo items with user ownership
- `conversations` - Chat sessions per user
- `messages` - Individual messages in conversations

---

## API Contracts

See [contracts/openapi.yaml](./contracts/openapi.yaml) for complete OpenAPI specification.

**Endpoints Summary**:
- `POST /api/auth/signup` - Create account
- `POST /api/auth/signin` - Authenticate
- `POST /api/auth/signout` - Clear session
- `GET /api/auth/me` - Get current user
- `POST /api/chat` - Send message to agent
- `GET /api/conversations` - List conversations
- `GET /api/conversations/{id}/messages` - Get messages
- `GET /api/tasks` - List tasks (optional direct access)
- `POST /api/tasks` - Create task (optional direct access)
- `PATCH /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

---

## Error Handling Strategy

### Backend Error Handling

**Global Exception Handler**:
```python
# Pseudocode
@app.exception_handler(Exception)
async def global_error_handler(request, exc):
    # Log full error with context
    logger.error(f"Error: {exc}", exc_info=True, extra={
        "path": request.url.path,
        "user_id": get_user_id(request)
    })

    # Return user-friendly message
    return JSONResponse(
        status_code=500,
        content={"error": "Something went wrong. Please try again."}
    )
```

**Circuit Breaker for OpenAI**:
```python
# Pseudocode
class OpenAICircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=60):
        self.failures = 0
        self.state = "closed"

    async def call(self, func, *args):
        if self.state == "open":
            return {"error": "AI service temporarily unavailable"}

        try:
            result = await func(*args)
            self.failures = 0
            return result
        except Exception:
            self.failures += 1
            if self.failures >= self.failure_threshold:
                self.state = "open"
                # Schedule reset check
            raise
```

### Frontend Error Handling

**API Client with Retry**:
```typescript
// Pseudocode
async function apiCall(endpoint, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(endpoint, options);
      if (!response.ok) throw new ApiError(response);
      return response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(1000 * Math.pow(2, i)); // Exponential backoff
    }
  }
}
```

---

## Deployment Strategy

### Docker Configuration

**Backend Dockerfile**:
```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

**docker-compose.yml** (local development):
```yaml
services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    env_file: ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: ./frontend/.env.local
    depends_on:
      - backend
```

### Deployment Targets

**Option A: Railway (Recommended)**
- Backend: Railway service with PostgreSQL add-on
- Frontend: Vercel (Next.js optimized)
- Pros: Simple deployment, managed database
- Cons: Costs scale with usage

**Option B: Hugging Face Spaces**
- Backend: Docker Space
- Frontend: Static Space or separate Vercel
- Pros: Free tier for demos
- Cons: Cold starts, limited compute

### Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
OPENAI_API_KEY=sk-...
JWT_SECRET=<random-32-bytes>
JWT_ALGORITHM=HS256
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Implementation Phases

### Phase 1: Foundation (Backend Core)
1. Project setup with FastAPI
2. Database models (SQLModel)
3. Database connection and migrations
4. Authentication service (JWT)
5. Basic API routes (auth, health)

### Phase 2: AI Integration
1. OpenAI Agents SDK setup
2. Agent definition with system prompt
3. MCP tool implementations
4. Tool context injection (user_id)
5. Agent service wrapper

### Phase 3: Chat & Persistence
1. Chat endpoint
2. Conversation service
3. Message persistence
4. Context loading (last 20 messages)
5. Streaming support (SSE)

### Phase 4: Frontend
1. Next.js project setup
2. Authentication pages
3. ChatKit integration
4. Message display
5. Chat input with submit
6. Theme support

### Phase 5: Polish & Deploy
1. Error handling refinement
2. Rate limiting
3. Docker configuration
4. Deployment to Railway/Vercel
5. Documentation

---

## Complexity Tracking

*No constitution violations requiring justification.*

All design decisions align with the 10 principles. The architecture is intentionally simple:
- No custom caching layer (database is source of truth)
- No message queue (synchronous request-response)
- No microservices (monolithic backend is sufficient for scale)

---

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Begin Phase 1 implementation
3. Create PHR for each significant implementation milestone

---

## References

- [spec.md](./spec.md) - Feature specification
- [research.md](./research.md) - Technology decisions
- [data-model.md](./data-model.md) - Database schema
- [contracts/openapi.yaml](./contracts/openapi.yaml) - API specification
- [quickstart.md](./quickstart.md) - Development setup
