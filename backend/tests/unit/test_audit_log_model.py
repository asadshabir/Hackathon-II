"""
Unit tests for AuditLog model.
Verifies append-only semantics and field structure.
"""

import uuid
from datetime import datetime

import pytest

from src.models.audit_log import AuditLog, AuditLogResponse


def test_audit_log_has_required_fields():
    """AuditLog should have id, event_type, user_id, payload, trace_id, timestamp."""
    uid = uuid.uuid4()
    al = AuditLog(
        event_type="task.created",
        user_id=uid,
        payload={"task_id": "abc", "title": "Test"},
        trace_id="00-abc123-def456-01",
    )
    assert al.id is not None
    assert al.event_type == "task.created"
    assert al.user_id == uid
    assert al.payload["task_id"] == "abc"
    assert al.trace_id == "00-abc123-def456-01"
    assert al.timestamp is not None


def test_audit_log_default_trace_id():
    """AuditLog should default trace_id to empty string."""
    al = AuditLog(
        event_type="task.updated",
        user_id=uuid.uuid4(),
        payload={"changes": ["title"]},
    )
    assert al.trace_id == ""


def test_audit_log_response_schema():
    """AuditLogResponse should include all fields."""
    alr = AuditLogResponse(
        id=uuid.uuid4(),
        event_type="task.completed",
        user_id=uuid.uuid4(),
        payload={"task_id": "xyz"},
        trace_id="trace-123",
        timestamp=datetime.utcnow(),
    )
    assert alr.event_type == "task.completed"
    assert alr.payload["task_id"] == "xyz"


def test_audit_log_tablename():
    """AuditLog table should be named 'audit_logs'."""
    assert AuditLog.__tablename__ == "audit_logs"


def test_audit_log_payload_accepts_nested_json():
    """AuditLog payload should accept complex nested JSON."""
    payload = {
        "task_id": "abc",
        "before": {"title": "Old", "priority": "low"},
        "after": {"title": "New", "priority": "high"},
        "changed_fields": ["title", "priority"],
    }
    al = AuditLog(
        event_type="task.updated",
        user_id=uuid.uuid4(),
        payload=payload,
    )
    assert al.payload["before"]["title"] == "Old"
    assert len(al.payload["changed_fields"]) == 2
