# Research: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-25

---

## Technology Decisions

### 1. AI Agent Framework

**Decision**: OpenAI Agents SDK

**Rationale**:
- Constitutional mandate (Principle IV) requires OpenAI Agents SDK
- Provides structured agent development with built-in tool registration
- Native support for conversation context management
- Consistent API patterns for tool invocation

**Alternatives Considered**:
- LangChain: More flexible but adds complexity; not constitution-compliant
- Raw OpenAI API: Lacks structured agent patterns; manual tool handling
- Anthropic Claude: Different API; not specified in constitution

**Implementation Notes**:
- Use `openai-agents` package (latest stable)
- Define agent with `Agent()` class
- Register tools via `@tool` decorator
- Model configurable via `OPENAI_MODEL` env var (default: gpt-4o-mini)

---

### 2. Tool Protocol

**Decision**: MCP (Model Context Protocol) SDK

**Rationale**:
- Constitutional mandate (Principle V) requires MCP tool exposure
- Standardized interface for AI-tool interaction
- Enables tool isolation and testing
- Supports future multi-agent orchestration

**Alternatives Considered**:
- Direct function calls: No standardization; tight coupling
- Custom tool protocol: Reinventing the wheel; maintenance burden
- OpenAI function calling only: Less abstraction; harder to test

**Implementation Notes**:
- Use `mcp` Python package for server implementation
- Each CRUD operation is a separate MCP tool
- Tool context injection for user_id (never trust AI-provided IDs)
- Structured responses: `{ success: bool, data?: T, error?: string }`

---

### 3. Backend Framework

**Decision**: FastAPI

**Rationale**:
- Constitutional mandate in Tech Stack Standards
- Async-native for efficient AI API calls
- Built-in OpenAPI documentation
- Pydantic integration for validation
- Strong Python ecosystem support

**Alternatives Considered**:
- Flask: Synchronous by default; less performant for AI workloads
- Django: Too heavy for API-only service; ORM conflicts with SQLModel
- Starlette: Lower-level; FastAPI adds valuable abstractions

**Implementation Notes**:
- Use `fastapi[all]` for full feature set
- Async database operations with `asyncpg`
- Dependency injection for services
- Lifespan events for startup/shutdown

---

### 4. Database ORM

**Decision**: SQLModel with async support

**Rationale**:
- Constitutional mandate in Tech Stack Standards
- Combines SQLAlchemy core with Pydantic models
- Type-safe database operations
- Easy model definition with Python dataclasses syntax

**Alternatives Considered**:
- SQLAlchemy only: More verbose; separate Pydantic models needed
- Tortoise ORM: Less mature; smaller ecosystem
- Prisma Python: Beta quality; Node.js heritage

**Implementation Notes**:
- Use `sqlmodel` with `asyncpg` driver
- Async session management with context manager
- Explicit relationship loading (avoid N+1 queries)
- UUID primary keys for distributed safety

---

### 5. Frontend Framework

**Decision**: Next.js 15+ with App Router

**Rationale**:
- Constitutional mandate in Tech Stack Standards
- Server components for optimal performance
- Built-in routing and layouts
- TypeScript support
- Vercel deployment optimization

**Alternatives Considered**:
- Vite + React: No SSR by default; more setup required
- Remix: Good alternative but less ecosystem support
- SvelteKit: Different paradigm; team familiarity concern

**Implementation Notes**:
- Use App Router (not Pages Router)
- Server components where possible
- Client components for interactive chat
- Streaming responses via SSE

---

### 6. Chat UI Library

**Decision**: ChatKit (or custom components based on ChatKit patterns)

**Rationale**:
- Constitutional mandate specifies ChatKit
- Purpose-built for chat interfaces
- Handles message bubbles, input, typing indicators
- Responsive design patterns

**Alternatives Considered**:
- Stream Chat: Hosted service; not self-contained
- Custom from scratch: Time-consuming; reinventing patterns
- react-chat-elements: Less maintained; fewer features

**Implementation Notes**:
- If ChatKit package unavailable, build components following ChatKit patterns
- Message list with virtualization for performance
- Input with Enter-to-send
- Typing indicator during AI response
- Support for streaming text

---

### 7. Authentication Strategy

**Decision**: JWT with HTTP-only cookies

**Rationale**:
- Stateless authentication aligns with constitution (Principle VI)
- HTTP-only cookies prevent XSS token theft
- JWT allows backend to remain stateless
- Standard approach for web applications

**Alternatives Considered**:
- Session-based auth: Requires server state; violates stateless mandate
- OAuth/OIDC: Overkill for single-app auth; adds complexity
- API keys: Not suitable for end-user authentication

**Implementation Notes**:
- bcrypt for password hashing (12+ rounds)
- JWT with HS256 algorithm
- 24-hour token expiry
- Refresh token rotation (optional for MVP)
- CSRF protection via SameSite cookie attribute

---

### 8. Database Provider

**Decision**: Neon Serverless PostgreSQL

**Rationale**:
- Constitutional mandate in Tech Stack Standards
- Serverless scaling matches stateless backend
- PostgreSQL feature set (JSON, arrays, full-text search)
- Connection pooling via Neon proxy

**Alternatives Considered**:
- Supabase: More features but more complexity
- PlanetScale (MySQL): Different SQL dialect
- Railway PostgreSQL: Less serverless optimization

**Implementation Notes**:
- Use connection pooling for production
- `DATABASE_URL` with `postgresql+asyncpg://` scheme
- Enable SSL for production connections
- Consider read replicas for heavy read workloads (future)

---

### 9. Streaming Strategy

**Decision**: Server-Sent Events (SSE)

**Rationale**:
- Simpler than WebSocket for unidirectional streaming
- Works with standard HTTP infrastructure
- Native browser support via EventSource
- Sufficient for chat response streaming

**Alternatives Considered**:
- WebSocket: Bidirectional not needed; more complex
- Long polling: Less efficient; higher latency
- HTTP/2 Server Push: Limited browser support

**Implementation Notes**:
- Use `StreamingResponse` in FastAPI
- `text/event-stream` content type
- Heartbeat to prevent timeout
- Graceful handling of client disconnect

---

### 10. Rate Limiting Strategy

**Decision**: In-memory with distributed fallback option

**Rationale**:
- Simple implementation for MVP
- Can upgrade to Redis-backed for multi-instance deployment
- Per-user limits aligned with fair usage

**Alternatives Considered**:
- Redis from start: Adds infrastructure complexity
- Cloud provider rate limiting: Vendor lock-in
- No rate limiting: Security/cost risk

**Implementation Notes**:
- Use `slowapi` library for FastAPI integration
- 60 req/min for chat endpoint
- 100 req/min for task endpoints
- Return 429 with Retry-After header
- Consider Redis for production multi-instance

---

## Open Questions Resolved

### Q1: How to handle AI context window limits?

**Resolution**: Load last 20 messages as context. Configurable via `CONTEXT_WINDOW_SIZE` env var. Older messages still stored but not sent to AI. User can access full history via UI.

### Q2: How to ensure user isolation in MCP tools?

**Resolution**: Tool context injection pattern. User ID is extracted from JWT in middleware and injected into tool context. MCP tools never receive user_id from AI - it's always from authenticated session.

### Q3: What happens when OpenAI is down?

**Resolution**: Circuit breaker pattern. After 5 consecutive failures in 1 minute, open circuit and return cached fallback message. Check health every 30 seconds. Close circuit when API responds successfully.

### Q4: How to handle concurrent messages from same user?

**Resolution**: Process in order via database transaction. Each message gets timestamp on receipt. Conversation lock not needed for MVP scale. Consider optimistic locking for high-traffic production.

---

## Package Versions (Pinned)

### Backend (requirements.txt)
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlmodel==0.0.14
asyncpg==0.29.0
pydantic==2.5.3
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
openai-agents==0.1.0  # or latest stable
mcp==0.1.0  # or latest stable
python-multipart==0.0.6
slowapi==0.1.9
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "tailwindcss": "3.4.0",
    "zustand": "4.5.0"
  }
}
```

---

## References

- [OpenAI Agents SDK Documentation](https://platform.openai.com/docs/agents)
- [MCP Specification](https://modelcontextprotocol.io/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Neon Documentation](https://neon.tech/docs)
