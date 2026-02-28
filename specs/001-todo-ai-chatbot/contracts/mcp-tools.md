# MCP Tool Definitions: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-25

---

## Overview

The AI agent interacts with the task management system exclusively through MCP (Model Context Protocol) tools. These tools are registered with the MCP server and invoked by the OpenAI Agent when processing user messages.

**Key Principle**: Tools receive `user_id` from authenticated session context, never from AI input. This ensures data isolation between users.

---

## Tool Specifications

### 1. create_task

Creates a new task for the authenticated user.

**Schema**:
```json
{
  "name": "create_task",
  "description": "Creates a new task for the current user. Use this when the user wants to add something to their todo list.",
  "parameters": {
    "type": "object",
    "properties": {
      "title": {
        "type": "string",
        "description": "The task title/description to add",
        "maxLength": 500
      }
    },
    "required": ["title"]
  }
}
```

**Returns**:
```json
{
  "success": true,
  "task": {
    "id": "uuid",
    "title": "string",
    "completed": false,
    "created_at": "ISO 8601 timestamp"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Task title is required"
}
```

**Example Usage**:
```
User: "Add buy groceries to my list"
Agent calls: create_task(title="buy groceries")
Agent responds: "I've added 'buy groceries' to your tasks."
```

---

### 2. list_tasks

Retrieves all tasks for the authenticated user, optionally filtered.

**Schema**:
```json
{
  "name": "list_tasks",
  "description": "Retrieves all tasks for the current user. Can filter by completion status.",
  "parameters": {
    "type": "object",
    "properties": {
      "filter": {
        "type": "string",
        "enum": ["all", "pending", "completed"],
        "default": "all",
        "description": "Filter tasks by status"
      }
    }
  }
}
```

**Returns**:
```json
{
  "success": true,
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "completed": false,
      "created_at": "ISO 8601 timestamp"
    }
  ],
  "count": 3
}
```

**Example Usage**:
```
User: "What's on my todo list?"
Agent calls: list_tasks(filter="all")
Agent responds: "Here are your tasks:\n1. Buy groceries\n2. Call mom\n3. Pay rent"

User: "What do I still need to do?"
Agent calls: list_tasks(filter="pending")
Agent responds: "You have 2 pending tasks:\n1. Buy groceries\n2. Call mom"
```

---

### 3. complete_task

Marks a task as completed.

**Schema**:
```json
{
  "name": "complete_task",
  "description": "Marks a task as completed. Can identify task by ID or search term.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "format": "uuid",
        "description": "Exact task ID if known"
      },
      "search_term": {
        "type": "string",
        "description": "Text to match against task titles (case-insensitive)"
      }
    }
  }
}
```

**Returns** (success):
```json
{
  "success": true,
  "task": {
    "id": "uuid",
    "title": "string",
    "completed": true,
    "completed_at": "ISO 8601 timestamp"
  }
}
```

**Returns** (not found):
```json
{
  "success": false,
  "error": "No task found matching 'walking the dog'",
  "suggestions": []
}
```

**Returns** (ambiguous):
```json
{
  "success": false,
  "error": "Multiple tasks found matching 'groceries'",
  "suggestions": [
    {"id": "uuid1", "title": "Buy groceries"},
    {"id": "uuid2", "title": "Organic groceries"}
  ]
}
```

**Example Usage**:
```
User: "I finished buying groceries"
Agent calls: complete_task(search_term="groceries")
Agent responds: "Great job! I've marked 'Buy groceries' as complete."

User: "Mark the first one as done"
Agent calls: complete_task(task_id="uuid1")  # From previous context
Agent responds: "Done! I've marked 'Buy groceries' as complete."
```

---

### 4. delete_task

Permanently removes a task.

**Schema**:
```json
{
  "name": "delete_task",
  "description": "Permanently removes a task from the user's list. Can identify by ID or search term.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "format": "uuid",
        "description": "Exact task ID if known"
      },
      "search_term": {
        "type": "string",
        "description": "Text to match against task titles"
      }
    }
  }
}
```

**Returns** (success):
```json
{
  "success": true,
  "deleted_title": "Buy groceries"
}
```

**Returns** (not found):
```json
{
  "success": false,
  "error": "No task found matching 'exercise'",
  "current_tasks": [
    {"id": "uuid", "title": "Buy groceries"},
    {"id": "uuid", "title": "Call mom"}
  ]
}
```

**Example Usage**:
```
User: "Remove buy groceries from my list"
Agent calls: delete_task(search_term="groceries")
Agent responds: "Done! I've removed 'Buy groceries' from your list."
```

---

### 5. update_task

Updates a task's title.

**Schema**:
```json
{
  "name": "update_task",
  "description": "Updates the title of an existing task.",
  "parameters": {
    "type": "object",
    "properties": {
      "task_id": {
        "type": "string",
        "format": "uuid",
        "description": "Exact task ID if known"
      },
      "search_term": {
        "type": "string",
        "description": "Text to match current task title"
      },
      "new_title": {
        "type": "string",
        "description": "The new title for the task",
        "maxLength": 500
      }
    },
    "required": ["new_title"]
  }
}
```

**Returns** (success):
```json
{
  "success": true,
  "task": {
    "id": "uuid",
    "title": "Buy organic groceries",
    "completed": false
  }
}
```

**Example Usage**:
```
User: "Change buy groceries to buy organic groceries"
Agent calls: update_task(search_term="groceries", new_title="Buy organic groceries")
Agent responds: "I've updated the task to 'Buy organic groceries'."
```

---

## Tool Context Injection

Every tool receives a `ToolContext` object that contains the authenticated user's ID:

```python
@dataclass
class ToolContext:
    user_id: UUID
    conversation_id: UUID
    session: AsyncSession

# Tool implementation
@mcp_server.tool()
async def create_task(title: str, ctx: ToolContext) -> dict:
    # user_id comes from authenticated session, not from AI
    task = Task(
        user_id=ctx.user_id,  # Secure context injection
        title=title
    )
    ctx.session.add(task)
    await ctx.session.commit()
    return {"success": True, "task": task.dict()}
```

**Security Guarantee**: The AI cannot specify a different user_id. User isolation is enforced at the tool layer.

---

## Error Handling

All tools follow consistent error response patterns:

| Scenario | Response |
|----------|----------|
| Success | `{"success": true, "data": {...}}` |
| Not found | `{"success": false, "error": "...", "suggestions": [...]}` |
| Ambiguous | `{"success": false, "error": "Multiple matches", "suggestions": [...]}` |
| Validation | `{"success": false, "error": "Title is required"}` |
| System error | `{"success": false, "error": "Unable to complete operation"}` |

The agent should interpret these responses and provide appropriate conversational feedback to the user.

---

## Agent Prompt Integration

The tools are referenced in the agent's system prompt:

```text
You have access to the following tools for managing the user's tasks:

1. create_task(title) - Add a new task
2. list_tasks(filter) - View tasks (all, pending, completed)
3. complete_task(task_id or search_term) - Mark task as done
4. delete_task(task_id or search_term) - Remove a task
5. update_task(task_id or search_term, new_title) - Change task title

When a tool returns an error, explain the issue conversationally and suggest alternatives.
When a search is ambiguous, present the options to the user and ask which one they meant.
Always confirm successful operations with a friendly message.
```
