<div align="center">

# 🤖 Phase-III — Full-Stack + Hugging Face AI
### *AI enters the stack — your todos now have a brain*

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![HuggingFace](https://img.shields.io/badge/🤗_HuggingFace-Spaces-FFD21E?style=for-the-badge)](https://huggingface.co/spaces)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)

<br/>

> *"Phase-II was the skeleton. Phase-III adds the intelligence."*

</div>

---

## 🎯 What's New in Phase-III?

Everything from Phase-II, PLUS:

- 🤗 **Hugging Face Spaces** — AI model hosting & inference
- 🐳 **Dockerized backend** — deploy anywhere, any environment
- 💬 **AI Chat interface** — talk to the app with natural language
- 📱 **Mobile-first redesign** — polished responsiveness on all screens
- 🧠 **Smarter suggestions** — AI understands your todo context

---

## ✨ Full Feature Set

| Feature | Status |
|---------|--------|
| 🔐 JWT Authentication | ✅ |
| 📝 Full Todo CRUD | ✅ |
| 👥 Multi-user isolation | ✅ |
| 🌙 Dark mode | ✅ |
| 📱 Responsive design (mobile-first) | ✅ |
| 🤖 AI inference via HuggingFace | ✅ NEW |
| 🐳 Docker deployment | ✅ NEW |
| 💬 Chat interface | ✅ NEW |
| 🤗 HF Spaces backend | ✅ NEW |

---

## 🏗️ Architecture

```
Phase-III/
├── 🔵 frontend/                  ← Next.js 15 (enhanced)
│   └── src/
│       ├── app/
│       │   ├── (auth)/           ← signin / signup
│       │   └── dashboard/
│       │       ├── todos/        ← todo management
│       │       └── chat/         ← NEW: AI chat interface
│       ├── components/
│       │   ├── features/
│       │   │   ├── todos/        ← TodoCard, TodoDialog, StatsCard
│       │   │   └── chat/         ← NEW: ChatInput, MessageBubble
│       │   └── ui/               ← shadcn/ui components
│       └── contexts/ThemeContext.tsx
│
├── 🟢 backend/                   ← FastAPI (enhanced + Dockerized)
│   ├── main.py
│   ├── Dockerfile                ← NEW: containerized
│   ├── models/                   ← SQLModel schemas
│   ├── routes/                   ← auth + todos + chat
│   └── src/                      ← AI integration modules
│       └── models/
│           ├── message.py        ← NEW: Chat message model
│           ├── task.py
│           └── user.py
│
└── 🤗 hf-space/                  ← NEW: HuggingFace Space
    ├── main.py                   ← Gradio/FastAPI HF app
    ├── requirements.txt
    └── README.md                 ← HF Space config
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| ⚙️ Backend | FastAPI, Python 3.11+, Docker |
| 🤖 AI | Hugging Face Inference API |
| 🤗 HF Space | Gradio / FastAPI on HF Spaces |
| 🗄️ Database | PostgreSQL (Neon) |
| 🔐 Auth | JWT, HTTP-only cookies |
| ☁️ Deploy | Vercel + Railway + HuggingFace Spaces |

---

## ▶️ Quick Start

### Backend (Docker)
```bash
cd Phase-III/backend
cp .env.example .env
docker build -t todo-backend .
docker run -p 8000:8000 --env-file .env todo-backend
```

### Backend (Local)
```bash
cd Phase-III/backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd Phase-III/frontend
npm install
cp .env.example .env.local
npm run dev
```

### HuggingFace Space
```bash
cd Phase-III/hf-space
pip install -r requirements.txt
python main.py
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway (Docker) or HuggingFace Spaces |
| AI Inference | HuggingFace Inference API |
| Database | Neon PostgreSQL |

---

## 👤 Author

**Asad Shabir** — Full-Stack + AI Engineer

> *"When your todo app can think for itself — that's when things get interesting."*

---

<div align="center">

⬅️ [Phase-II](../Phase-II/README.md) &nbsp;|&nbsp; 🏠 [Main Repo](../README.md) &nbsp;|&nbsp; [Phase-IV ➡️](../Phase-IV/README.md)

</div>
