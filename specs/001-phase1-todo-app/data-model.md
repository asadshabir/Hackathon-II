# Data Model: Phase I – In-Memory Python Console Todo App

## Task Entity

**Definition**: Represents a single todo item in the application

**Attributes**:
- `id` (int): Unique identifier for the task, assigned sequentially
- `title` (str): The description or title of the task
- `completed` (bool): Status indicating whether the task is completed (default: False)

**Validation Rules**:
- `id` must be a positive integer
- `title` must be a non-empty string
- `completed` must be a boolean value

**State Transitions**:
- Initial state: `completed = False`
- Transition to completed: `completed = True` (via mark complete operation)
- No transition back to incomplete (as not specified in requirements)

## TodoList Collection

**Definition**: In-memory collection that holds all Task entities

**Structure**: List or dictionary of Task objects with methods for CRUD operations

**Operations**:
- Add Task: Inserts a new Task with auto-generated ID
- Get All Tasks: Returns all tasks in the collection
- Get Task by ID: Returns a specific task by its ID
- Update Task: Modifies an existing task's properties
- Delete Task: Removes a task from the collection
- Mark Complete: Updates a task's completion status

**Constraints**:
- All tasks must have unique IDs
- No persistence outside of application memory
- Collection is reset when application terminates