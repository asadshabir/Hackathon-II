"""
Audit log model. Append-only — no update/delete operations exposed.
"""

import uuid
from datetime import datetime
from typing import Any, Dict

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, SQLModel


class AuditLog(SQLModel, table=True):
    """
    Immutable audit log entry.
    Records every domain event for compliance and debugging.
    RULE: Append-only. No updates. No deletes. Ever.
    """

    __tablename__ = "audit_logs"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    event_type: str = Field(max_length=100, index=True)
    user_id: uuid.UUID = Field(index=True)
    payload: Dict[str, Any] = Field(sa_column=Column(JSONB, nullable=False))
    trace_id: str = Field(default="", max_length=128, index=True)
    timestamp: datetime = Field(default_factory=datetime.utcnow, index=True)


class AuditLogResponse(SQLModel):
    """Schema for audit log response."""

    id: uuid.UUID
    event_type: str
    user_id: uuid.UUID
    payload: Dict[str, Any]
    trace_id: str
    timestamp: datetime
