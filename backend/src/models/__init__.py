"""
SQLModel database models.
Export all models for easy importing.
"""

from src.models.audit_log import AuditLog, AuditLogResponse
from src.models.conversation import Conversation, ConversationResponse
from src.models.message import Message, MessageCreate, MessageResponse, MessageRole
from src.models.reminder import Reminder, ReminderCreate, ReminderResponse
from src.models.tag import Tag, TagCreate, TagResponse, TaskTag
from src.models.task import Task, TaskCreate, TaskResponse, TaskUpdate
from src.models.user import User, UserCreate, UserResponse
from src.models.user_preference import (
    UserPreference,
    UserPreferenceCreate,
    UserPreferenceResponse,
)

__all__ = [
    # User
    "User",
    "UserCreate",
    "UserResponse",
    # Task
    "Task",
    "TaskCreate",
    "TaskUpdate",
    "TaskResponse",
    # Tag
    "Tag",
    "TagCreate",
    "TagResponse",
    "TaskTag",
    # Reminder
    "Reminder",
    "ReminderCreate",
    "ReminderResponse",
    # AuditLog
    "AuditLog",
    "AuditLogResponse",
    # UserPreference
    "UserPreference",
    "UserPreferenceCreate",
    "UserPreferenceResponse",
    # Conversation
    "Conversation",
    "ConversationResponse",
    # Message
    "Message",
    "MessageCreate",
    "MessageResponse",
    "MessageRole",
]
