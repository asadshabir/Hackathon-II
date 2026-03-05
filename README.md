# Hackathon-II — AI-Powered Todo App: From Console to Cloud

> A complete 5-phase journey building a production-grade, AI-powered Todo application — starting from a Python console app and evolving into a full-stack, event-driven, Kubernetes-deployed AI chatbot platform.

---

## Project Overview

This repository documents the complete development journey of **Hackathon-II**, a structured build challenge where each phase adds a new layer of complexity, architecture, and real-world engineering practice.

| Phase | Title | Stack | Complexity |
|-------|-------|-------|------------|
| [Phase-I](#phase-i--python-console-todo-app) | Python Console Todo App | Python, Rich | Beginner |
| [Phase-II](#phase-ii--full-stack-todo-app) | Full-Stack Todo App | Next.js 15, FastAPI, PostgreSQL | Intermediate |
| [Phase-III](#phase-iii--full-stack--hugging-face-integration) | Full-Stack + HF Space | Next.js 15, FastAPI, HuggingFace | Intermediate+ |
| [Phase-IV](#phase-iv--ai-todo-chatbot) | AI Todo Chatbot | Next.js 15, FastAPI, LLM, Helm | Advanced |
| [Phase-V](#phase-v--advanced-ai--microservices--kubernetes) | Advanced AI + Microservices + K8s | Dapr, Kafka, Kubernetes, Minikube | Expert |

---

## Phase-I — Python Console Todo App

A clean, production-structured console application built with Python and the Rich library. This phase establishes the core data model and business logic before any UI layer.

### Features
- Add, view, update, complete, and delete tasks
- Beautiful Rich-powered console UI with colored tables
- Clean architecture: Models → Services → UI layers
- In-memory storage (fast, zero-dependency)

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Language | Python 3.11+ |
| UI | Rich (Console) |
| Architecture | Service Layer Pattern |
| Storage | In-Memory |

### Project Structure
```
Phase-I/
├── src/
│   ├── models/todo.py          # Task data model
│   ├── services/todo_manager.py # Business logic
│   └── ui/console_ui.py        # Rich console UI
├── main.py                     # Entry point
└── pyproject.toml
```

### Quick Start
```bash
cd Phase-I
pip install rich
python main.py
```

### Commands
```
add "task description"      → Add a new task
view                        → View all tasks
complete <id>               → Mark task complete
update <id> "new text"      → Update task
delete <id>                 → Delete task
quit                        → Exit
```

---

## Phase-II — Full-Stack Todo App

The console app evolves into a production full-stack web application with JWT authentication, a REST API, and a PostgreSQL database.

### Features
- Secure JWT authentication with HTTP-only cookies
- Full CRUD operations for todos
- Multi-user support with data isolation
- Modern UI with Tailwind CSS + shadcn/ui
- Dark mode support
- Fully responsive design

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI, Python 3.11+ |
| Database | PostgreSQL (Neon) |
| Auth | JWT with HTTP-only cookies |
| ORM | SQLModel + Pydantic |

### Project Structure
```
Phase-II/
├── backend/
│   ├── main.py              # FastAPI app
│   ├── models.py            # SQLModel schemas
│   ├── auth.py              # JWT authentication
│   └── requirements.txt
├── frontend/
│   ├── src/app/             # Next.js App Router pages
│   ├── src/components/      # React components
│   └── package.json
└── README.md
```

### Quick Start
```bash
# Backend
cd Phase-II/backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Set DATABASE_URL and JWT_SECRET
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd Phase-II/frontend
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL
npm run dev
```

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/signin` | Login |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/signout` | Logout |
| GET | `/api/todos` | List todos |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/{id}` | Update todo |
| PATCH | `/api/todos/{id}/toggle` | Toggle complete |
| DELETE | `/api/todos/{id}` | Delete todo |

### Deployment
- **Backend**: Railway (auto-deploy from GitHub)
- **Frontend**: Vercel (Next.js optimized)

---

## Phase-III — Full-Stack + Hugging Face Integration

Extends Phase-II with Hugging Face Spaces integration, enabling AI inference directly in the todo workflow. Includes full deployment pipeline to HF Spaces.

### New in Phase-III
- Hugging Face Spaces deployment support
- AI inference integration
- Enhanced mobile responsiveness
- Production-ready deployment configuration

### Project Structure
```
Phase-III/
├── backend/           # FastAPI (enhanced)
├── frontend/          # Next.js 15 (enhanced)
├── hf-space/          # Hugging Face Space deployment
└── README.md
```

### Quick Start
Same as Phase-II. For HF Space deployment, see `hf-space/` directory.

---

## Phase-IV — AI Todo Chatbot

Introduces a natural language AI chatbot interface for managing todos. Users can now talk to their todo list.

### New in Phase-IV
- AI-powered chatbot for natural language todo management
- LLM integration for intent understanding
- Helm chart for Kubernetes deployment
- Enhanced todo features: priorities, categories
- Improved UX with chat interface

### Tech Stack (additions)
| Component | Technology |
|-----------|-----------|
| AI Chatbot | LLM + Custom Prompt Engineering |
| Deployment | Helm Charts (Kubernetes) |
| Infra | Docker Compose |

### Project Structure
```
Phase-IV/
├── backend/           # FastAPI + AI integration
├── frontend/          # Next.js 15 + Chat UI
├── todo-chatbot/      # Helm chart
│   ├── Chart.yaml
│   ├── charts/
│   └── templates/
└── README.md
```

### Quick Start
```bash
# Standard local run (same as Phase-II)
# For Kubernetes via Helm:
cd Phase-IV/todo-chatbot
helm install todo-app .
```

---

## Phase-V — Advanced AI + Microservices + Kubernetes

The most advanced phase. A full event-driven, microservice architecture with Dapr, Kafka, Kubernetes, real-time sync, analytics, and advanced AI features.

### New in Phase-V
- **Task Priorities**: Low, Medium, High, Urgent with visual indicators
- **Tags & Categories**: Multi-select with color coding
- **Due Dates**: Timezone-aware with calendar UI
- **Recurring Tasks**: Daily, weekly, monthly recurrence rules
- **Real-time Sync**: WebSocket-based cross-device sync
- **Analytics Dashboard**: Productivity metrics, streaks, visualizations
- **AI Chatbot**: Advanced NLP for all todo features
- **Event-Driven Architecture**: Kafka pub/sub with 15+ event types
- **Resilience**: Circuit breakers, retries, failure handling
- **Observability**: Distributed tracing, metrics, Prometheus

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.11+ |
| AI/LLM | Hugging Face Inference API |
| Event Bus | Apache Kafka |
| Service Mesh | Dapr (Distributed Application Runtime) |
| Orchestration | Kubernetes (Minikube for local) |
| Deployment | Docker Compose, Helm, Vercel |
| Monitoring | Prometheus, Grafana |

### Project Structure
```
Phase-V/
├── backend/                    # FastAPI (event-driven)
├── frontend/                   # Next.js 15 (full-featured)
├── todo-chatbot/               # Helm chart
├── kubernetes/                 # K8s manifests
├── dapr-components/            # Dapr component configs
│   ├── pubsub.kafka.yaml
│   ├── statestore.postgresql.yaml
│   └── secretstore.local.env.yaml
├── dapr-components.yaml        # Dapr component manifest
├── docker-compose.yml          # Full local stack
└── README.md
```

### Quick Start — Docker Compose (Recommended)
```bash
cd Phase-V

# Copy and configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets

# Start full stack
docker-compose up --build
```

Services start at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Kafka UI: http://localhost:8080 (if configured)

### Quick Start — Kubernetes (Minikube)
```bash
# Start Minikube
minikube start

# Install Dapr
dapr init --kubernetes

# Deploy
kubectl apply -f Phase-V/kubernetes/

# Access
minikube service frontend-service
```

---

## Architecture Evolution

```
Phase-I          Phase-II         Phase-III        Phase-IV         Phase-V
  │                 │                 │                 │                │
Python           Next.js +        + HuggingFace    + AI Chatbot    + Kafka +
Console     →    FastAPI +    →   Spaces +      →  + Helm     →    Dapr +
App              PostgreSQL       Deployment        K8s             K8s +
                 + JWT                              Ready           Prometheus
```

---

## Security Practices

All phases follow these security practices:
- JWT tokens stored in HTTP-only cookies (XSS prevention)
- Passwords hashed with bcrypt
- SQL injection protection via SQLModel/SQLAlchemy
- CORS configured per-environment
- Secrets managed via `.env` (never committed)
- User data fully isolated per account

---

## Repository Structure

```
Hackathon-II/
├── Phase-I/       # Python Console Todo App
├── Phase-II/      # Full-Stack (Next.js + FastAPI + PostgreSQL)
├── Phase-III/     # Full-Stack + Hugging Face Integration
├── Phase-IV/      # AI Todo Chatbot + Helm
├── Phase-V/       # Advanced AI + Microservices + Kubernetes
├── .gitignore
└── README.md
```

---

## Author

**Asad Shabir**
- GitHub: [@asadshabir](https://github.com/asadshabir)
- Software Engineer | Python Developer | AI Engineer

> *"Build it clean. Build it scalable. Build it right."*

---

## License

This project is open source and available under the [MIT License](LICENSE).
