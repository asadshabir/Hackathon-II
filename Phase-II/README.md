<div align="center">

# 🌐 Phase-II — Full-Stack Todo App
### *The console app grows up — REST API, database, and a real web UI*

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)

<br/>

> *"The same logic from Phase-I — now behind a REST API, in front of a React UI, persisted in PostgreSQL."*

</div>

---

## 🎯 What Is This?

Phase-II transforms the Phase-I console app into a **production-ready full-stack web application**. Real authentication. Real database. Real deployment.

Multi-user. Secure. Deployable to the cloud in minutes.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 Authentication | JWT-based login/signup with HTTP-only cookies |
| 📝 Todo CRUD | Create, read, update, delete, and toggle todos |
| 👥 Multi-User | Complete data isolation — every user sees only their todos |
| 🌙 Dark Mode | Full dark/light theme with persistent preference |
| 📱 Responsive | Pixel-perfect on mobile, tablet, and desktop |
| ⚡ Fast | Next.js 15 App Router + FastAPI async endpoints |
| 🔒 Secure | bcrypt passwords, CORS, SQL injection protection |

---

## 🏗️ Architecture

```
Phase-II/
├── 🔵 frontend/                  ← Next.js 15 App Router
│   └── src/
│       ├── app/
│       │   ├── (auth)/           ← signin / signup pages
│       │   └── dashboard/        ← protected todo dashboard
│       ├── components/           ← Reusable UI components
│       └── middleware.ts         ← Route protection
│
└── 🟢 backend/                   ← FastAPI REST API
    ├── main.py                   ← App entry + CORS config
    ├── models/                   ← SQLModel database models
    ├── routes/
    │   ├── auth.py               ← /api/auth/* endpoints
    │   └── todos.py              ← /api/todos/* endpoints
    ├── schemas/                  ← Pydantic request/response schemas
    ├── utils/
    │   ├── auth.py               ← JWT token handling
    │   └── database.py           ← DB session management
    └── requirements.txt
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| 🖥️ Frontend | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui |
| ⚙️ Backend | FastAPI, Python 3.11+, Uvicorn |
| 🗄️ Database | PostgreSQL (Neon serverless) |
| 🔐 Auth | JWT tokens, HTTP-only cookies, bcrypt |
| 📦 ORM | SQLModel + SQLAlchemy |
| ✅ Validation | Pydantic v2 |
| ☁️ Deploy | Vercel (frontend) + Railway (backend) |

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/signin` | Login + set JWT cookie |
| `GET` | `/api/auth/me` | Get current user info |
| `POST` | `/api/auth/signout` | Clear auth cookie |

### 📝 Todos
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/todos` | List all todos |
| `POST` | `/api/todos` | Create new todo |
| `PUT` | `/api/todos/{id}` | Update todo |
| `PATCH` | `/api/todos/{id}/toggle` | Toggle complete |
| `DELETE` | `/api/todos/{id}` | Delete todo |

---

## ▶️ Quick Start

### Backend
```bash
cd Phase-II/backend
python -m venv venv
source venv/bin/activate    # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # Fill in DATABASE_URL and JWT_SECRET
uvicorn main:app --reload --port 8000
```
> API docs at: http://localhost:8000/docs

### Frontend
```bash
cd Phase-II/frontend
npm install
cp .env.example .env.local  # Set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```
> App at: http://localhost:3000

---

## 🌐 Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | Root dir: `frontend/` |
| Backend | Railway | Root dir: `backend/` |
| Database | Neon | PostgreSQL serverless |

---

## 🔐 Environment Variables

**Backend `.env`:**
```env
DATABASE_URL=postgresql+psycopg://user:pass@host/db
JWT_SECRET=your-super-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
CORS_ORIGINS=http://localhost:3000
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 👤 Author

**Asad Shabir** — Full-Stack Engineer · AI Developer

> *"Same logic. New scale."*

---

<div align="center">

⬅️ [Phase-I](../Phase-I/README.md) &nbsp;|&nbsp; 🏠 [Main Repo](../README.md) &nbsp;|&nbsp; [Phase-III ➡️](../Phase-III/README.md)

</div>
