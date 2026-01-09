# Quickstart Guide: Phase I – In-Memory Python Console Todo App

## Prerequisites
- Python 3.13 or higher installed on your system
- Basic familiarity with command-line interfaces

## Setup Instructions

1. **Clone or create the project structure**:
   ```
   src/
   ├── models/
   │   └── todo.py
   ├── services/
   │   └── todo_manager.py
   ├── cli/
   │   └── console_ui.py
   └── main.py
   ```

2. **Install dependencies** (none required beyond Python standard library):
   No external dependencies needed - the application uses only Python's built-in libraries.

## Running the Application

1. Navigate to the project root directory in your terminal
2. Execute the main application file:
   ```bash
   python -m src.main
   ```
3. The application will start and display a menu of available commands

## Using the Todo App

Once running, the application accepts the following commands:

- `add "task description"` - Adds a new task to the list
- `view` - Displays all tasks with their completion status
- `complete <task_id>` - Marks a task as completed
- `update <task_id> "new description"` - Updates the task description
- `delete <task_id>` - Removes a task from the list
- `help` - Shows available commands
- `quit` - Exits the application

## Example Usage

```
> add "Buy groceries"
Task added with ID: 1

> add "Walk the dog"
Task added with ID: 2

> view
1. [ ] Buy groceries
2. [ ] Walk the dog

> complete 1
Task 1 marked as completed

> view
1. [x] Buy groceries
2. [ ] Walk the dog

> quit
```

## Development Notes

- All data is stored in memory only - tasks will be lost when the application exits
- Task IDs are assigned sequentially starting from 1
- The application validates user input and provides helpful error messages