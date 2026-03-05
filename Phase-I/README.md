<div align="center">

# 🐍 Phase-I — Python Console Todo App
### *Where every great product begins — with clean, simple logic*

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Rich](https://img.shields.io/badge/Rich-UI-FF6B6B?style=for-the-badge)](https://rich.readthedocs.io)
[![Architecture](https://img.shields.io/badge/Architecture-Clean-4CAF50?style=for-the-badge)]()

<br/>

> *"Before the APIs, databases, and Kubernetes — there was a terminal and an idea."*

</div>

---

## 🎯 What Is This?

A **production-structured** Python console application for managing todos. Built not just to work — but to be **readable, maintainable, and scalable**.

This is Phase-I of Hackathon-II. The foundation. Every architectural decision made here echoes through Phases II → V.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| ➕ Add Tasks | Create todos from the terminal instantly |
| 📋 View Tasks | Beautiful color-coded table powered by Rich |
| ✅ Complete Tasks | Mark tasks done with a single command |
| ✏️ Update Tasks | Edit task descriptions on the fly |
| 🗑️ Delete Tasks | Remove tasks safely with confirmation |
| ⚡ In-Memory | Zero setup — runs immediately, no DB needed |

---

## 🧠 Architecture

```
Phase-I/
├── 📄 main.py                    ← Entry point
└── src/
    ├── 🗃️ models/
    │   └── todo.py               ← Task data model
    ├── ⚙️ services/
    │   └── todo_manager.py       ← Business logic layer
    └── 🖥️ cli/
        └── console_ui.py         ← Rich UI layer
```

**Why this structure matters:**
- `models/` → Pure data. No logic.
- `services/` → Pure logic. No UI.
- `cli/` → Pure display. No business rules.

This separation is exactly what Phase-II's backend follows — just over HTTP instead of function calls.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| 🐍 Language | Python 3.11+ | Fast, readable, hackathon-proven |
| 🎨 UI | [Rich](https://rich.readthedocs.io) | Beautiful terminal tables & colors |
| 🧠 Logic | Service Layer Pattern | Testable, separable, reusable |
| 💾 Storage | In-Memory (dict) | Zero setup, instant start |

---

## ▶️ Quick Start

```bash
# 1. Clone
git clone https://github.com/asadshabir/Hackathon-II.git
cd Hackathon-II/Phase-I

# 2. Install dependency
pip install rich

# 3. Run
python main.py
```

---

## ⌨️ Commands

```bash
add "buy groceries"          → ➕ Add a new task
view                         → 📋 View all tasks in a table
complete 1                   → ✅ Mark task #1 as done
update 1 "buy organic milk"  → ✏️ Update task #1's text
delete 1                     → 🗑️ Delete task #1
help                         → ❓ Show all commands
quit                         → 👋 Exit
```

---

## 🎯 MVP Scope

- ✔️ **User Story 1** — Add tasks and view them in a table
- ✔️ **User Story 2** — Update and complete tasks
- ✔️ **User Story 3** — Delete tasks

---

## 🚀 What Comes Next?

This in-memory store evolves in the next phases:

```
Phase-I (memory)  →  Phase-II (PostgreSQL)  →  Phase-III (+ AI)  →  Phase-IV (+ Chatbot)  →  Phase-V (+ Kafka/K8s)
```

---

## 👤 Author

**Asad Shabir** — Python Developer · AI Engineer

> *"A clean foundation is worth more than a messy skyscraper."*

---

<div align="center">

🔙 [Back to Main Repo](../README.md) &nbsp;|&nbsp; ➡️ [Phase-II →](../Phase-II/README.md)

</div>
