"""
Task model for the todo application.
Represents a single todo item with id, title, and completion status.
"""


class Task:
    """
    Represents a single todo item.

    Attributes:
        id (int): Unique task identifier
        title (str): Task description
        completed (bool): Completion status
    """

    PENDING_ICON = "⏳"
    COMPLETED_ICON = "✅"

    def __init__(self, task_id: int, title: str, completed: bool = False):
        if not isinstance(task_id, int) or task_id <= 0:
            raise ValueError("Task ID must be a positive integer")

        if not isinstance(title, str) or not title.strip():
            raise ValueError("Task title must be a non-empty string")

        if not isinstance(completed, bool):
            raise ValueError("Task completion status must be boolean")

        self.id = task_id
        self.title = title.strip()
        self.completed = completed

    def __str__(self) -> str:
        """
        User-friendly string representation.
        Used by console UI when printing tasks.
        """
        icon = self.COMPLETED_ICON if self.completed else self.PENDING_ICON
        status = "Done" if self.completed else "Pending"
        return f"{icon} [{self.id}] {self.title} — {status}"

    def __repr__(self) -> str:
        """Developer-friendly representation."""
        return (
            f"Task(id={self.id}, title='{self.title}', completed={self.completed})"
        )

    def to_dict(self) -> dict:
        """Convert task to dictionary."""
        return {
            "id": self.id,
            "title": self.title,
            "completed": self.completed,
        }

    def mark_completed(self):
        """Mark task as completed."""
        self.completed = True

    def update_title(self, new_title: str):
        """Update task title with validation."""
        if not isinstance(new_title, str) or not new_title.strip():
            raise ValueError("Task title must be a non-empty string")

        self.title = new_title.strip()
