🚀 CONSOLE IN-MEMORY TODO APP
Hackathon-II · Phase-1 · Python Project








A professional, clean, and scalable console-based Todo application built with Python.
Designed with clean architecture, Rich-powered UI, and hackathon-ready structure.

✨ KEY FEATURES

✅ Add tasks via console commands

📋 View tasks in a rich, colored table

🎯 Mark tasks as completed

✏️ Update task descriptions

🗑️ Delete tasks safely

⚡ In-memory storage (fast & lightweight)

🎨 Beautiful console UI using Rich

🧠 Clean & modular architecture

🧠 PROJECT ARCHITECTURE
src/
├── main.py                  # Application entry point
├── ui/
│   └── console_ui.py         # Console UI layer (Rich)
├── services/
│   └── todo_manager.py      # Business logic
├── models/
│   └── todo.py              # Task model

🔹 Architecture Principles

Separation of Concerns

Single Responsibility

Easy to extend in future phases

Hackathon & production friendly

🛠️ TECH STACK
Layer	Technology
🐍 Language	Python 3.11+
🎨 UI	Rich (Console UI)
🧠 Logic	Service Layer Pattern
💾 Storage	In-Memory
▶️ HOW TO RUN
1️⃣ Clone Repository
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

2️⃣ Install Dependency
pip install rich

3️⃣ Run Application
python -m src.main

⌨️ AVAILABLE COMMANDS
add "task description"      ➜ Add a new task
view                        ➜ View all tasks
complete <task_id>          ➜ Mark task as completed
update <task_id> "new text" ➜ Update task title
delete <task_id>            ➜ Delete task
help                        ➜ Show help menu
quit                        ➜ Exit application

🎯 MVP SCOPE (PHASE-1)

✔️ User Story 1 – Add & View Tasks
✔️ User Story 2 – Update & Complete Tasks
✔️ User Story 3 – Delete Tasks

This phase establishes a strong foundation for future scalability.

🚀 FUTURE ROADMAP

🔜 Persistent storage (SQLite / PostgreSQL)

🔜 REST API with FastAPI

🔜 Web UI (Next.js)

🔜 AI-powered Todo Assistant

🔜 Docker & Kubernetes deployment

⭐ WHY THIS PROJECT MATTERS

Demonstrates clean coding practices

Shows real-world console UX

Structured like production software

Perfect base for full-stack & AI expansion

🤝 CONTRIBUTIONS

This project is part of Hackathon-II and currently closed for external contributions.
Suggestions & feedback are always welcome 🙌

👤 AUTHOR
Asad Shabir

Software Engineer · Python Developer · AI Enthusiast

“Build it clean. Build it scalable. Build it right.” 🚀