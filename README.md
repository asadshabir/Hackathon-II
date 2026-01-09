# Phase I – In-Memory Python Console Todo App

A simple console-based todo application implemented in Python that stores all tasks in memory.

## Features

- Add tasks to your todo list
- View all tasks
- Mark tasks as completed
- Update task descriptions
- Delete tasks
- All data stored in memory only (no persistence)

## Prerequisites

- Python 3.13 or higher

## Setup

1. Clone or download the repository
2. Navigate to the project directory
3. Run the application using Python

## Usage

Run the application:
```bash
python -m src.main
```

### Available Commands

- `add "<task description>"` - Add a new task to the list
- `view` - Display all tasks with their completion status
- `complete <task_id>` - Mark a task as completed
- `update <task_id> "<new description>"` - Update a task description
- `delete <task_id>` - Remove a task from the list
- `help` - Show available commands
- `quit` - Exit the application

### Example Usage

```
> add "Buy groceries"
Task added with ID: 1

> add "Walk the dog"
Task added with ID: 2

> view
Your tasks:
  1. [ ] Buy groceries
  2. [ ] Walk the dog

> complete 1
Task 1 marked as completed.

> view
Your tasks:
  1. [x] Buy groceries
  2. [ ] Walk the dog

> quit
```

## Architecture

The application follows a clean architecture with separation of concerns:

- `src/models/todo.py` - Task model definition
- `src/services/todo_manager.py` - Business logic and in-memory storage
- `src/cli/console_ui.py` - Console user interface and input handling
- `src/main.py` - Application entry point and main loop

## Notes

- All data is stored in memory only and will be lost when the application exits
- Task IDs are assigned sequentially starting from 1
- The application validates user input and provides helpful error messages"# Hackathon-II" 
