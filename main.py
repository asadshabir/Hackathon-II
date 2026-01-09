"""
Main entry point for the Todo Application.
"""

from src.services.todo_manager import TodoManager
from src.cli.console_ui import ConsoleUI


def main():
    """
    Main function to run the Todo Application.
    """
    print("Starting Todo Application...")

    # Initialize the components
    todo_manager = TodoManager()
    console_ui = ConsoleUI(todo_manager)

    # Run the application
    console_ui.run()

    print("Todo Application closed. Goodbye!")


if __name__ == "__main__":
    main()