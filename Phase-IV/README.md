<div align="center">

# 💬 Phase-IV — AI Todo Chatbot
### *Stop clicking buttons. Just talk to your todos.*

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Helm](https://img.shields.io/badge/Helm-0F1689?style=for-the-badge&logo=helm&logoColor=white)](https://helm.sh)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)](https://kubernetes.io)

<br/>

> *"The best UI is no UI — just a conversation."*

</div>

---

## 🎯 What's New in Phase-IV?

The app stops being just a tool and starts being an **assistant**. You describe what you want in plain English — the AI figures out the rest.

```
You:  "Add a high priority task to review the PR by Friday"
App:  ✅ Done — "Review the PR" added with HIGH priority, due Friday
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 💬 AI Chatbot | Natural language processing for all todo operations |
| 🧠 Intent Detection | LLM understands add, update, delete, query commands |
| 🏷️ Smart Parsing | Extracts task name, priority, date from free text |
| 🚀 Animated UI | Polished animated buttons, inputs, and transitions |
| 📊 Stats Dashboard | Visual summary of tasks by status and priority |
| 🎨 Component Library | Custom animated-button, animated-input components |
| 🚢 Helm Chart | One-command Kubernetes deployment |
| 🐳 Docker Ready | Containerized backend for any environment |

---

## 🏗️ Architecture

```
Phase-IV/
├── 🔵 frontend/                  ← Next.js 15 (Chat UI)
│   └── src/
│       ├── app/
│       │   ├── (auth)/           ← signin / signup
│       │   └── (dashboard)/
│       │       ├── page.tsx      ← Main dashboard
│       │       └── chat/         ← AI chat interface
│       ├── components/
│       │   ├── features/
│       │   │   ├── chat/
│       │   │   │   ├── ChatContainer.tsx   ← Chat window
│       │   │   │   └── ChatInput.tsx       ← Message input
│       │   │   └── todos/        ← TodoCard, StatsCard, Dialog
│       │   └── ui/
│       │       ├── animated-button.tsx    ← NEW: custom animated btn
│       │       ├── animated-input.tsx     ← NEW: custom animated input
│       │       └── ...
│       └── contexts/ThemeContext.tsx
│
├── 🟢 backend/                   ← FastAPI + LLM integration
│   ├── main.py                   ← Routes + AI endpoint
│   └── Dockerfile
│
└── ⛵ todo-chatbot/              ← Helm Chart
    ├── Chart.yaml                ← Chart metadata
    ├── charts/                   ← Dependencies
    └── templates/                ← K8s manifest templates
```

---

## 🤖 How the AI Works

```
User Message
     ↓
LLM (Hugging Face / OpenAI)
     ↓
Intent Classification
  ├── ADD_TASK     → extract task text + priority + date
  ├── LIST_TASKS   → apply optional filters
  ├── COMPLETE     → find matching task + toggle
  ├── DELETE       → find matching task + confirm
  └── UPDATE       → find task + apply changes
     ↓
Execute on Database
     ↓
Natural Language Response
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| 💬 Chat UI | Custom ChatContainer + animated components |
| ⚙️ Backend | FastAPI, Python 3.11+, Docker |
| 🧠 AI | LLM with custom prompt engineering |
| 🗄️ Database | PostgreSQL (Neon) |
| 🔐 Auth | JWT, HTTP-only cookies |
| ⛵ Deploy | Helm Chart (Kubernetes) |

---

## ▶️ Quick Start

### Local Development
```bash
# Backend
cd Phase-IV/backend
pip install -r requirements.txt
cp .env.example .env       # Set DATABASE_URL, JWT_SECRET, AI API key
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd Phase-IV/frontend
npm install
cp .env.example .env.local
npm run dev
```

### Kubernetes via Helm
```bash
cd Phase-IV/todo-chatbot
helm install todo-app . --set image.tag=latest
kubectl get pods  # Check deployment status
```

---

## 💬 Example Conversations

```
You:  "What tasks do I have today?"
Bot:  You have 3 tasks: 'Review PR' (HIGH), 'Team standup' (MEDIUM), 'Update docs' (LOW)

You:  "Mark the PR review as done"
Bot:  ✅ 'Review PR' marked as completed!

You:  "Add a reminder to submit the report by end of week"
Bot:  ✅ Added: 'Submit the report' — due Friday, MEDIUM priority

You:  "Delete all completed tasks"
Bot:  🗑️ Deleted 2 completed tasks. Your list is clean!
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway / Docker |
| Full Stack | Kubernetes via Helm |
| Database | Neon PostgreSQL |

---

## 👤 Author

**Asad Shabir** — AI Engineer · Full-Stack Developer

> *"The best productivity tool is one you don't have to think about using."*

---

<div align="center">

⬅️ [Phase-III](../Phase-III/README.md) &nbsp;|&nbsp; 🏠 [Main Repo](../README.md) &nbsp;|&nbsp; [Phase-V ➡️](../Phase-V/README.md)

</div>
