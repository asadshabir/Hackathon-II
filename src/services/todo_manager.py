"""
TodoManager service for the todo application.
Handles all business logic for task management with in-memory storage.
"""

from typing import List, Optional
from src.models.todo import Task


class TodoManager:
    """
    Manages the collection of tasks in memory.
    Responsible only for business logic (no UI or console output).
    """

    def __init__(self):
        """Initialize the TodoManager with empty in-memory storage."""
        self._tasks: List[Task] = []
        self._next_id: int = 1

    def add_task(self, title: str) -> Task:
        """
        Add a new task.

        Args:
            title (str): Task title

        Returns:
            Task: Newly created task

        Raises:
            ValueError: If title is empty or invalid
        """
        if not isinstance(title, str) or not title.strip():
            raise ValueError("Task title must be a non-empty string")

        task = Task(self._next_id, title.strip())
        self._tasks.append(task)
        self._next_id += 1
        return task

    def get_all_tasks(self) -> List[Task]:
        """
        Retrieve all tasks.

        Returns:
            List[Task]: Copy of task list
        """
        return list(self._tasks)

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        """
        Retrieve a task by ID.

        Args:
            task_id (int): Task ID

        Returns:
            Optional[Task]: Task if found, otherwise None
        """
        return next((task for task in self._tasks if task.id == task_id), None)

    def update_task(self, task_id: int, new_title: str) -> bool:
        """
        Update task title.

        Args:
            task_id (int): Task ID
            new_title (str): New task title

        Returns:
            bool: True if updated, False if not found

        Raises:
            ValueError: If new title is empty
        """
        if not isinstance(new_title, str) or not new_title.strip():
            raise ValueError("New task title must be a non-empty string")

        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        task.update_title(new_title.strip())
        return True

    def mark_complete(self, task_id: int) -> bool:
        """
        Mark a task as completed.

        Args:
            task_id (int): Task ID

        Returns:
            bool: True if successful, False if not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        task.mark_completed()
        return True

    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task.

        Args:
            task_id (int): Task ID

        Returns:
            bool: True if deleted, False if not found
        """
        task = self.get_task_by_id(task_id)
        if task is None:
            return False

        self._tasks.remove(task)
        return True

    def get_next_id(self) -> int:
        """
        Get next auto-increment task ID.

        Returns:
            int: Next ID
        """
        return self._next_id
