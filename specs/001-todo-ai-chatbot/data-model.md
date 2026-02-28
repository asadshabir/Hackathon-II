# Data Model: Todo AI Chatbot

**Feature**: 001-todo-ai-chatbot
**Date**: 2026-01-25

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                              users                                   │
├─────────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                       │
│ email: VARCHAR(255) UNIQUE NOT NULL                                 │
│ hashed_password: VARCHAR(255) NOT NULL                              │
│ created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()         │
│ updated_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()         │
└─────────────────────────────────────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                              tasks                                   │
├─────────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                       │
│ user_id: UUID (FK → users.id) NOT NULL                              │
│ title: VARCHAR(500) NOT NULL                                        │
│ completed: BOOLEAN NOT NULL DEFAULT FALSE                           │
│ created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()         │
│ completed_at: TIMESTAMP WITH TIME ZONE NULL                         │
└─────────────────────────────────────────────────────────────────────┘

                │
                │ 1:N
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          conversations                               │
├─────────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                       │
│ user_id: UUID (FK → users.id) NOT NULL                              │
│ created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()         │
│ last_activity_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()   │
└─────────────────────────────────────────────────────────────────────┘
                │
                │ 1:N
                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            messages                                  │
├─────────────────────────────────────────────────────────────────────┤
│ id: UUID (PK)                                                       │
│ conversation_id: UUID (FK → conversations.id) NOT NULL              │
│ role: VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant'))    │
│ content: TEXT NOT NULL                                              │
│ created_at: TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Table Definitions

### users

Primary table for user authentication and identity.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| hashed_password | VARCHAR(255) | NOT NULL | bcrypt-hashed password |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Account creation time |
| updated_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last update time |

**Indexes**:
- `idx_users_email` UNIQUE on `email` (login lookup)

**SQLModel Definition**:
```python
class User(SQLModel, table=True):
    __tablename__ = "users"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(max_length=255, unique=True, index=True)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    tasks: list["Task"] = Relationship(back_populates="user")
    conversations: list["Conversation"] = Relationship(back_populates="user")
```

---

### tasks

Todo items owned by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → users.id, NOT NULL | Owner reference |
| title | VARCHAR(500) | NOT NULL | Task description |
| completed | BOOLEAN | NOT NULL, DEFAULT FALSE | Completion status |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation time |
| completed_at | TIMESTAMPTZ | NULL | Completion time |

**Indexes**:
- `idx_tasks_user_id` on `user_id` (filter by owner)
- `idx_tasks_user_completed` on `(user_id, completed)` (filter by status)

**SQLModel Definition**:
```python
class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = Field(default=None)

    # Relationships
    user: User = Relationship(back_populates="tasks")
```

**State Transitions**:
```
[Created] ──complete()──► [Completed]
     │                         │
     └──────delete()───────────┘
```

---

### conversations

Chat sessions for each user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| user_id | UUID | FK → users.id, NOT NULL | Owner reference |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Session start time |
| last_activity_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Last message time |

**Indexes**:
- `idx_conversations_user_id` on `user_id` (filter by owner)
- `idx_conversations_user_activity` on `(user_id, last_activity_at DESC)` (recent first)

**SQLModel Definition**:
```python
class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="users.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: User = Relationship(back_populates="conversations")
    messages: list["Message"] = Relationship(back_populates="conversation")
```

---

### messages

Individual messages in conversations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, DEFAULT gen_random_uuid() | Unique identifier |
| conversation_id | UUID | FK → conversations.id, NOT NULL | Parent conversation |
| role | VARCHAR(20) | NOT NULL, CHECK ('user', 'assistant') | Message sender role |
| content | TEXT | NOT NULL | Message content |
| created_at | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Send time |

**Indexes**:
- `idx_messages_conversation_id` on `conversation_id` (filter by conversation)
- `idx_messages_conversation_created` on `(conversation_id, created_at)` (chronological order)

**SQLModel Definition**:
```python
class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    conversation_id: uuid.UUID = Field(foreign_key="conversations.id", index=True)
    role: MessageRole = Field(sa_column=Column(Enum(MessageRole)))
    content: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

---

## Data Isolation Rules

### User Ownership Enforcement

Every query for user-specific data MUST include ownership filter:

```python
# CORRECT - Always filter by user_id
async def get_user_tasks(session: AsyncSession, user_id: UUID) -> list[Task]:
    result = await session.execute(
        select(Task).where(Task.user_id == user_id)
    )
    return result.scalars().all()

# WRONG - Never query without user_id
async def get_task(session: AsyncSession, task_id: UUID) -> Task | None:
    # This would allow access to any user's task!
    result = await session.execute(
        select(Task).where(Task.id == task_id)
    )
    return result.scalar_one_or_none()

# CORRECT - Always verify ownership
async def get_task(session: AsyncSession, task_id: UUID, user_id: UUID) -> Task | None:
    result = await session.execute(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    )
    return result.scalar_one_or_none()
```

### MCP Tool User Context

MCP tools receive user_id from authenticated session, never from AI:

```python
@mcp_server.tool()
async def list_tasks(context: ToolContext, filter: str = "all") -> ToolResult:
    # user_id comes from authenticated JWT, not from AI input
    user_id = context.user_id

    tasks = await task_service.get_tasks(user_id, filter)
    return ToolResult(success=True, data={"tasks": tasks})
```

---

## Migration Strategy

### Initial Migration (001_initial_schema.py)

```python
"""Initial schema for Todo AI Chatbot

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-01-25
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # Tasks table
    op.create_table(
        'tasks',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('completed', sa.Boolean(), server_default='FALSE', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('idx_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('idx_tasks_user_completed', 'tasks', ['user_id', 'completed'])

    # Conversations table
    op.create_table(
        'conversations',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('last_activity_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
    )
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_user_activity', 'conversations', ['user_id', 'last_activity_at'])

    # Messages table
    op.create_table(
        'messages',
        sa.Column('id', UUID(), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('conversation_id', UUID(), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.CheckConstraint("role IN ('user', 'assistant')", name='check_message_role'),
    )
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('idx_messages_conversation_created', 'messages', ['conversation_id', 'created_at'])


def downgrade() -> None:
    op.drop_table('messages')
    op.drop_table('conversations')
    op.drop_table('tasks')
    op.drop_table('users')
```

---

## Query Patterns

### Get Recent Conversation Context

```python
async def get_conversation_context(
    session: AsyncSession,
    conversation_id: UUID,
    user_id: UUID,
    limit: int = 20
) -> list[Message]:
    """Get last N messages for AI context."""
    result = await session.execute(
        select(Message)
        .join(Conversation)
        .where(
            Message.conversation_id == conversation_id,
            Conversation.user_id == user_id  # Ownership check
        )
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    messages = result.scalars().all()
    return list(reversed(messages))  # Chronological order
```

### Find Task by Search Term

```python
async def find_task_by_term(
    session: AsyncSession,
    user_id: UUID,
    search_term: str
) -> list[Task]:
    """Find tasks matching search term (case-insensitive)."""
    result = await session.execute(
        select(Task)
        .where(
            Task.user_id == user_id,
            Task.title.ilike(f"%{search_term}%")
        )
        .order_by(Task.created_at.desc())
    )
    return result.scalars().all()
```

### Atomic Task Completion

```python
async def complete_task(
    session: AsyncSession,
    task_id: UUID,
    user_id: UUID
) -> Task | None:
    """Mark task as completed with ownership verification."""
    result = await session.execute(
        select(Task)
        .where(Task.id == task_id, Task.user_id == user_id)
        .with_for_update()  # Lock row for update
    )
    task = result.scalar_one_or_none()

    if task is None:
        return None

    task.completed = True
    task.completed_at = datetime.utcnow()
    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task
```

---

## Constraints Summary

| Table | Constraint | Type | Purpose |
|-------|------------|------|---------|
| users | email | UNIQUE | Prevent duplicate accounts |
| tasks | user_id | FK CASCADE | Ownership + cleanup |
| tasks | title | VARCHAR(500) | Limit title length |
| conversations | user_id | FK CASCADE | Ownership + cleanup |
| messages | conversation_id | FK CASCADE | Referential integrity |
| messages | role | CHECK | Only 'user' or 'assistant' |

---

## Performance Considerations

1. **Indexes**: All foreign keys and common filter columns indexed
2. **Cascade Deletes**: User deletion removes all related data
3. **Pagination**: Use cursor-based pagination for messages (not offset)
4. **Context Window**: Only load last 20 messages for AI context
5. **Connection Pooling**: Use Neon's connection pooler for production
