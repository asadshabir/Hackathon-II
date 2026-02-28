"""
Todo Agent using Google Gemini for natural language task management.
"""

import uuid
from datetime import datetime
from typing import Any

from google import genai
from google.genai import types
from sqlalchemy.ext.asyncio import AsyncSession

from src.agents.prompts import SYSTEM_PROMPT
from src.config import get_settings
from src.services import task_service

settings = get_settings()

# Configure Gemini client
client = genai.Client(api_key=settings.google_api_key)

# Define tools for function calling
TASK_TOOLS = [
    types.Tool(
        function_declarations=[
            types.FunctionDeclaration(
                name="create_task",
                description="Creates a new task for the user's todo list. Can set title, priority, due date, and recurrence in one call.",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "title": types.Schema(
                            type=types.Type.STRING,
                            description="The title/description of the task to create",
                        ),
                        "priority": types.Schema(
                            type=types.Type.STRING,
                            description="Priority level: low, medium, high, or urgent. Defaults to medium.",
                        ),
                        "due_date": types.Schema(
                            type=types.Type.STRING,
                            description="Due date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS). Example: 2025-01-15 or 2025-01-15T14:00:00",
                        ),
                        "recurrence_type": types.Schema(
                            type=types.Type.STRING,
                            description="Recurrence pattern: none, daily, weekly, or monthly. Requires due_date if not 'none'.",
                        ),
                        "recurrence_interval": types.Schema(
                            type=types.Type.INTEGER,
                            description="Recurrence interval (e.g., 2 for every 2 days/weeks/months). Defaults to 1.",
                        ),
                    },
                    required=["title"],
                ),
            ),
            types.FunctionDeclaration(
                name="list_tasks",
                description="Lists the user's tasks with optional filtering",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "filter": types.Schema(
                            type=types.Type.STRING,
                            description="Filter: 'all', 'pending', or 'completed'",
                        ),
                    },
                ),
            ),
            types.FunctionDeclaration(
                name="complete_task",
                description="Marks a task as completed by its ID",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the task to complete",
                        ),
                    },
                    required=["task_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="delete_task",
                description="Deletes a task from the user's list by its ID",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the task to delete",
                        ),
                    },
                    required=["task_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="update_task",
                description="Updates a task's title",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the task to update",
                        ),
                        "new_title": types.Schema(
                            type=types.Type.STRING,
                            description="The new title for the task",
                        ),
                    },
                    required=["task_id", "new_title"],
                ),
            ),
            types.FunctionDeclaration(
                name="set_priority",
                description="Sets the priority of a task (low, medium, high, urgent)",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the task to update",
                        ),
                        "priority": types.Schema(
                            type=types.Type.STRING,
                            description="The priority level: low, medium, high, or urgent",
                        ),
                    },
                    required=["task_id", "priority"],
                ),
            ),
            types.FunctionDeclaration(
                name="assign_tags",
                description="Assigns tags to a task",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the task to update",
                        ),
                        "tag_names": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(type=types.Type.STRING),
                            description="List of tag names to assign to the task",
                        ),
                    },
                    required=["task_id", "tag_names"],
                ),
            ),
            types.FunctionDeclaration(
                name="set_due_date",
                description="Sets the due date of a task in ISO format",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the task to update",
                        ),
                        "due_date": types.Schema(
                            type=types.Type.STRING,
                            description="The due date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)",
                        ),
                    },
                    required=["task_id", "due_date"],
                ),
            ),
            types.FunctionDeclaration(
                name="set_recurrence",
                description="Sets the recurrence pattern of a task",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "task_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the task to update",
                        ),
                        "recurrence_type": types.Schema(
                            type=types.Type.STRING,
                            description="The recurrence type: none, daily, weekly, or monthly",
                        ),
                        "interval": types.Schema(
                            type=types.Type.INTEGER,
                            description="The interval for recurrence (default 1)",
                        ),
                    },
                    required=["task_id", "recurrence_type"],
                ),
            ),
            types.FunctionDeclaration(
                name="query_analytics",
                description="Queries user analytics and productivity metrics",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "user_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the user to query analytics for",
                        ),
                    },
                    required=["user_id"],
                ),
            ),
            types.FunctionDeclaration(
                name="update_preferences",
                description="Updates user preferences",
                parameters=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "user_id": types.Schema(
                            type=types.Type.STRING,
                            description="The ID of the user whose preferences to update",
                        ),
                        "updates": types.Schema(
                            type=types.Type.OBJECT,
                            description="Dictionary of preference updates",
                        ),
                    },
                    required=["user_id", "updates"],
                ),
            ),
        ]
    )
]


async def execute_tool(
    session: AsyncSession,
    user_id: uuid.UUID,
    tool_name: str,
    tool_args: dict[str, Any],
) -> dict[str, Any]:
    """Execute a tool function and return the result."""
    try:
        if tool_name == "create_task":
            # Parse due_date string to datetime if provided
            due_date_val = None
            due_date_str = tool_args.get("due_date")
            if due_date_str:
                try:
                    if "T" in due_date_str:
                        due_date_val = datetime.fromisoformat(due_date_str)
                    else:
                        due_date_val = datetime.fromisoformat(due_date_str + "T00:00:00")
                except ValueError:
                    pass

            task = await task_service.create_task(
                session,
                user_id,
                title=tool_args.get("title", ""),
                priority=tool_args.get("priority", "medium"),
                due_date=due_date_val,
                recurrence_type=tool_args.get("recurrence_type", "none"),
                recurrence_interval=tool_args.get("recurrence_interval", 1),
            )
            return {
                "success": True,
                "task": {
                    "id": str(task.id),
                    "title": task.title,
                    "priority": task.priority,
                    "due_date": task.due_date.isoformat() if task.due_date else None,
                    "recurrence_type": task.recurrence_type,
                },
            }

        elif tool_name == "list_tasks":
            filter_type = tool_args.get("filter", "all")
            tasks = await task_service.get_tasks(session, user_id, filter_type)
            return {
                "success": True,
                "tasks": [
                    {
                        "id": str(t.id),
                        "title": t.title,
                        "completed": t.completed,
                        "priority": t.priority,
                        "due_date": t.due_date.isoformat() if t.due_date else None,
                        "recurrence_type": t.recurrence_type,
                        "created_at": t.created_at.isoformat() if t.created_at else None,
                    }
                    for t in tasks
                ],
                "count": len(tasks),
            }

        elif tool_name == "complete_task":
            task_id = uuid.UUID(tool_args.get("task_id", ""))
            task = await task_service.complete_task(session, user_id, task_id)
            if task:
                return {
                    "success": True,
                    "task": {"id": str(task.id), "title": task.title},
                }
            return {"success": False, "error": "Task not found"}

        elif tool_name == "delete_task":
            task_id = uuid.UUID(tool_args.get("task_id", ""))
            title = await task_service.delete_task(session, user_id, task_id)
            if title:
                return {"success": True, "deleted_title": title}
            return {"success": False, "error": "Task not found"}

        elif tool_name == "update_task":
            task_id = uuid.UUID(tool_args.get("task_id", ""))
            new_title = tool_args.get("new_title", "")
            task = await task_service.update_task(
                session, user_id, task_id, new_title=new_title
            )
            if task:
                return {
                    "success": True,
                    "task": {"id": str(task.id), "title": task.title},
                }
            return {"success": False, "error": "Task not found"}

        elif tool_name == "set_priority":
            task_id = uuid.UUID(tool_args.get("task_id", ""))
            priority = tool_args.get("priority", "medium")

            # Import the advanced tool function
            from src.tools.set_priority_tool import set_priority
            result = await set_priority(str(task_id), priority)
            return result

        elif tool_name == "assign_tags":
            task_id = uuid.UUID(tool_args.get("task_id", ""))
            tag_names = tool_args.get("tag_names", [])

            # Import the advanced tool function
            from src.tools.assign_tags_tool import assign_tags
            result = await assign_tags(str(task_id), tag_names)
            return result

        elif tool_name == "set_due_date":
            task_id = uuid.UUID(tool_args.get("task_id", ""))
            due_date = tool_args.get("due_date", "")

            # Import the advanced tool function
            from src.tools.set_due_date_tool import set_due_date
            result = await set_due_date(str(task_id), due_date)
            return result

        elif tool_name == "set_recurrence":
            task_id = uuid.UUID(tool_args.get("task_id", ""))
            recurrence_type = tool_args.get("recurrence_type", "none")
            interval = tool_args.get("interval", 1)

            # Import the advanced tool function
            from src.tools.set_recurrence_tool import set_recurrence
            result = await set_recurrence(str(task_id), recurrence_type, interval)
            return result

        elif tool_name == "query_analytics":
            user_id_arg = tool_args.get("user_id", "")

            # Import the advanced tool function
            from src.tools.query_analytics_tool import query_analytics
            result = await query_analytics(user_id_arg)
            return result

        elif tool_name == "update_preferences":
            user_id_arg = tool_args.get("user_id", "")
            updates = tool_args.get("updates", {})

            # Import the advanced tool function
            from src.tools.update_preferences_tool import update_preferences
            result = await update_preferences(user_id_arg, updates)
            return result

        return {"success": False, "error": f"Unknown tool: {tool_name}"}

    except Exception as e:
        return {"success": False, "error": str(e)}


async def chat_with_agent(
    session: AsyncSession,
    user_id: uuid.UUID,
    user_message: str,
    conversation_history: list[dict] | None = None,
) -> str:
    """
    Process a user message and generate a response using Gemini.
    """
    # Build conversation history
    contents = []
    if conversation_history:
        for msg in conversation_history:
            role = "user" if msg["role"] == "user" else "model"
            contents.append(types.Content(role=role, parts=[types.Part(text=msg["content"])]))

    # Add current user message
    contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    # Generate response with tools
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=TASK_TOOLS,
        ),
    )

    # Handle function calls
    max_iterations = 5
    iteration = 0

    while iteration < max_iterations:
        # Check for function calls in response
        function_calls = []
        if response.candidates and response.candidates[0].content:
            for part in response.candidates[0].content.parts:
                if part.function_call:
                    function_calls.append(part.function_call)

        if not function_calls:
            break

        # Execute each function call
        function_responses = []
        for fc in function_calls:
            tool_name = fc.name
            tool_args = dict(fc.args) if fc.args else {}

            result = await execute_tool(session, user_id, tool_name, tool_args)

            function_responses.append(
                types.Part(
                    function_response=types.FunctionResponse(
                        name=tool_name,
                        response=result,
                    )
                )
            )

        # Add function results and continue conversation
        contents.append(response.candidates[0].content)
        contents.append(types.Content(role="user", parts=function_responses))

        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                tools=TASK_TOOLS,
            ),
        )
        iteration += 1

    # Extract final text response
    if response.candidates and response.candidates[0].content:
        for part in response.candidates[0].content.parts:
            if part.text:
                return part.text

    return "I'm sorry, I couldn't process that request. Please try again."
