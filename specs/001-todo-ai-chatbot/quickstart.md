# Quickstart: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-25

This guide walks you through setting up the development environment for the Todo AI Chatbot.

---

## Prerequisites

- **Python**: 3.13+ (`python --version`)
- **Node.js**: 20+ (`node --version`)
- **npm**: 10+ (`npm --version`)
- **Git**: Latest (`git --version`)
- **PostgreSQL**: Access to Neon or local PostgreSQL 15+

---

## Quick Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd Phase-3
git checkout 001-todo-ai-chatbot
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (Unix/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname

# OpenAI API Key (required)
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-4o-mini

# JWT Configuration
JWT_SECRET=your-random-32-byte-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (frontend URL)
CORS_ORIGINS=http://localhost:3000

# Rate Limiting
RATE_LIMIT_REQUESTS=60
RATE_LIMIT_WINDOW=60
```

Generate a secure JWT secret:

```bash
# Python
python -c "import secrets; print(secrets.token_hex(32))"

# OpenSSL
openssl rand -hex 32
```

Run database migrations:

```bash
# Initialize Alembic (first time only)
alembic init migrations

# Run migrations
alembic upgrade head
```

Start the backend:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Verify at: http://localhost:8000/api/health

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:

```bash
npm run dev
```

Verify at: http://localhost:3000

---

## Development Workflow

### Running Both Services

**Terminal 1 (Backend)**:
```bash
cd backend
.\venv\Scripts\activate  # Windows
uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```

### Using Docker Compose (Alternative)

```bash
# Start all services
docker-compose up --build

# Stop services
docker-compose down
```

---

## Verification Steps

### 1. Backend Health Check

```bash
curl http://localhost:8000/api/health
```

Expected:
```json
{"status": "healthy", "timestamp": "2026-01-25T..."}
```

### 2. API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. Test Authentication Flow

```bash
# Sign up
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123"}'

# Sign in
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "securepass123"}' \
  -c cookies.txt

# Get current user
curl http://localhost:8000/api/auth/me -b cookies.txt
```

### 4. Test Chat Endpoint

```bash
# Send a chat message (requires auth)
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"message": "Add buy groceries to my list"}'
```

Expected:
```json
{
  "response": "I've added 'buy groceries' to your tasks.",
  "conversation_id": "uuid..."
}
```

### 5. Frontend Verification

1. Open http://localhost:3000
2. Sign up with test credentials
3. Navigate to chat interface
4. Send: "Add buy milk to my list"
5. Verify response appears
6. Send: "What's on my list?"
7. Verify task is listed

---

## Environment Variables Reference

### Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| OPENAI_API_KEY | Yes | - | OpenAI API key |
| OPENAI_MODEL | No | gpt-4o-mini | Model to use for agent |
| JWT_SECRET | Yes | - | Secret for JWT signing |
| JWT_ALGORITHM | No | HS256 | JWT algorithm |
| ACCESS_TOKEN_EXPIRE_MINUTES | No | 1440 | Token expiry (24h) |
| CORS_ORIGINS | Yes | - | Allowed origins (comma-separated) |
| RATE_LIMIT_REQUESTS | No | 60 | Requests per window |
| RATE_LIMIT_WINDOW | No | 60 | Window in seconds |
| CONTEXT_WINDOW_SIZE | No | 20 | Messages to load for AI context |

### Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | - | Backend API URL |

---

## Common Issues

### Issue: Database connection failed

**Cause**: Invalid DATABASE_URL or network issue

**Solution**:
1. Verify connection string format: `postgresql+asyncpg://user:pass@host:5432/db`
2. Check Neon dashboard for correct credentials
3. Ensure SSL mode if required: `?sslmode=require`

### Issue: OpenAI API error

**Cause**: Invalid API key or rate limit

**Solution**:
1. Verify OPENAI_API_KEY is set correctly
2. Check OpenAI dashboard for API key status
3. Ensure sufficient credits/quota

### Issue: CORS error in browser

**Cause**: Frontend URL not in CORS_ORIGINS

**Solution**:
1. Add `http://localhost:3000` to CORS_ORIGINS
2. Restart backend after changing env

### Issue: JWT token invalid

**Cause**: Secret mismatch or expired token

**Solution**:
1. Clear browser cookies
2. Sign in again
3. Ensure JWT_SECRET is consistent

---

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Integration Tests

```bash
cd backend
pytest tests/integration/ -v
```

---

## Next Steps

1. Review [spec.md](./spec.md) for feature requirements
2. Review [plan.md](./plan.md) for architecture details
3. Run `/sp.tasks` to generate implementation tasks
4. Start implementation following task order

---

## Useful Commands

```bash
# Backend
uvicorn main:app --reload          # Development server
alembic upgrade head               # Run migrations
alembic downgrade -1               # Rollback one migration
pytest tests/ -v                   # Run tests

# Frontend
npm run dev                        # Development server
npm run build                      # Production build
npm run lint                       # Lint code
npm test                           # Run tests

# Docker
docker-compose up --build          # Start all services
docker-compose down -v             # Stop and remove volumes
docker-compose logs -f backend     # Tail backend logs
```
