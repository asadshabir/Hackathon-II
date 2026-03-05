"""
ConsoleUI for the todo application.
Handles user interaction via console input and output.
"""

from rich.console import Console
from rich.table import Table
from rich.panel import Panel

from src.services.todo_manager import TodoManager


class ConsoleUI:
    """Handles console-based user interaction for the todo application."""

    def __init__(self, todo_manager: TodoManager):
        self.todo_manager = todo_manager
        self.console = Console()

    def display_menu(self):
        menu = """
[bold cyan]Available Commands[/bold cyan]

[green]add "task description"[/green]        ➜ Add a new task
[blue]view[/blue]                            ➜ View all tasks
[blue]view pending | view done[/blue]        ➜ Filter tasks
[yellow]complete <task_id>[/yellow]          ➜ Mark task completed
[cyan]update <task_id> "new text"[/cyan]     ➜ Update task
[red]delete <task_id>[/red]                  ➜ Delete task
[magenta]search <keyword>[/magenta]          ➜ Search tasks
[bold green]stats[/bold green]               ➜ Show task statistics
[red]clear-completed[/red]                   ➜ Remove completed tasks
[magenta]help[/magenta]                      ➜ Show menu
[bold red]quit[/bold red]                    ➜ Exit
"""
        self.console.print(Panel(menu, title="📌 Todo App Menu", border_style="cyan"))

    def process_command(self, command: str) -> bool:
        command = command.strip()

        if command in {"quit", "exit"}:
            return False
        elif command == "help":
            self.display_menu()
        elif command.startswith("view"):
            self._view_tasks(command)
        elif command.startswith("add "):
            self._add_task(command)
        elif command.startswith("complete "):
            self._complete_task(command)
        elif command.startswith("update "):
            self._update_task(command)
        elif command.startswith("delete "):
            self._delete_task(command)
        elif command.startswith("search "):
            self._search_tasks(command)
        elif command == "stats":
            self._show_stats()
        elif command == "clear-completed":
            self._clear_completed()
        else:
            self.console.print("❌ [red]Unknown command.[/red] Type [cyan]help[/cyan].")

        return True

    def _add_task(self, command: str):
        title = command[4:].strip().strip("\"'")
        if not title:
            self.console.print("⚠️ [yellow]Task title cannot be empty[/yellow]")
            return

        task = self.todo_manager.add_task(title)
        self.console.print(f"✅ [green]Task added[/green] (ID: {task.id})")

    def _view_tasks(self, command: str):
        filter_mode = command.replace("view", "").strip()
        tasks = self.todo_manager.get_all_tasks()

        if filter_mode == "pending":
            tasks = [t for t in tasks if not t.completed]
        elif filter_mode == "done":
            tasks = [t for t in tasks if t.completed]

        if not tasks:
            self.console.print("📭 [yellow]No tasks found[/yellow]")
            return

        table = Table(title="📋 Tasks", show_lines=True)
        table.add_column("ID", justify="center", style="cyan")
        table.add_column("Task")
        table.add_column("Status", justify="center")

        for task in tasks:
            status = "✅ Done" if task.completed else "⏳ Pending"
            color = "green" if task.completed else "yellow"
            table.add_row(str(task.id), task.title, f"[{color}]{status}[/{color}]")

        self.console.print(table)

    def _complete_task(self, command: str):
        parts = command.split()
        if len(parts) < 2 or not parts[1].isdigit():
            self.console.print("⚠️ Usage: complete <task_id>")
            return

        if self.todo_manager.mark_complete(int(parts[1])):
            self.console.print("🎉 [green]Task completed[/green]")
        else:
            self.console.print("❌ [red]Task not found[/red]")

    def _update_task(self, command: str):
        parts = command.split(maxsplit=2)
        if len(parts) < 3 or not parts[1].isdigit():
            self.console.print("⚠️ Usage: update <id> \"new text\"")
            return

        if self.todo_manager.update_task(int(parts[1]), parts[2].strip("\"'")):
            self.console.print("✏️ [cyan]Task updated[/cyan]")
        else:
            self.console.print("❌ [red]Task not found[/red]")

    def _delete_task(self, command: str):
        parts = command.split()
        if len(parts) < 2 or not parts[1].isdigit():
            self.console.print("⚠️ Usage: delete <task_id>")
            return

        if self.todo_manager.delete_task(int(parts[1])):
            self.console.print("🗑️ [red]Task deleted[/red]")
        else:
            self.console.print("❌ [red]Task not found[/red]")

    def _search_tasks(self, command: str):
        keyword = command.replace("search", "").strip().lower()
        results = [
            t for t in self.todo_manager.get_all_tasks()
            if keyword in t.title.lower()
        ]

        if not results:
            self.console.print("🔍 [yellow]No matching tasks[/yellow]")
            return

        self.console.print(f"🔍 Found {len(results)} task(s):")
        for t in results:
            self.console.print(f"• {t}")

    def _show_stats(self):
        tasks = self.todo_manager.get_all_tasks()
        total = len(tasks)
        done = sum(t.completed for t in tasks)
        pending = total - done

        self.console.print(
            Panel(
                f"""
[cyan]Total Tasks:[/cyan] {total}
[green]Completed:[/green] {done}
[yellow]Pending:[/yellow] {pending}
""",
                title="📊 Task Statistics",
            )
        )

    def _clear_completed(self):
        removed = self.todo_manager.clear_completed()
        self.console.print(f"♻️ [red]{removed} completed tasks removed[/red]")

    def run(self):
        self.console.print(
            Panel.fit(
                "🚀 [bold cyan]Todo Console App[/bold cyan]\n"
                "[dim]Type 'help' to see commands[/dim]",
                border_style="cyan",
            )
        )

        while True:
            try:
                command = self.console.input("\n👉 [bold cyan]Command[/bold cyan]: ")
                if not command:
                    continue
                if not self.process_command(command):
                    break
            except (KeyboardInterrupt, EOFError):
                self.console.print("\n👋 [bold green]Goodbye![/bold green]")
                break
