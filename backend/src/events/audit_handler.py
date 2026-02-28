"""
Audit log event handler for consuming all domain events and writing immutable audit records.
"""

import logging
from datetime import datetime
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.database import async_session_maker
from src.models import AuditLog
from src.events.publisher import publish_event

logger = logging.getLogger(__name__)


class AuditLogHandler:
    """
    Consumes ALL domain events (task.*, reminder.*, notification.*, user.preference.*),
    writes immutable AuditLog records with event_type, user_id, full payload, trace_id, timestamp.
    Append-only, idempotent via event ID deduplication.
    """

    def __init__(self):
        # Keep track of processed events to ensure idempotency
        self.processed_events = set()

    async def handle_any_event(self, event_data: Dict[str, Any], event_type: str) -> None:
        """
        Handle any domain event and create an audit log entry.

        Args:
            event_data: Event data to audit
            event_type: Type of event (e.g., task.created, reminder.due, etc.)
        """
        # Extract key information from the event
        user_id = event_data.get("user_id")
        trace_id = event_data.get("trace_id", "")
        event_id = event_data.get("event_id", f"{event_type}_{datetime.utcnow().isoformat()}")

        # Create a unique key for deduplication
        dedup_key = f"{event_id}_{event_type}"

        # Check if this event has already been processed (idempotency)
        if dedup_key in self.processed_events:
            logger.info(f"Audit event already processed: {dedup_key}")
            return

        try:
            # Create audit log record
            audit_log = AuditLog(
                event_type=event_type,
                user_id=user_id,
                payload={
                    "event_data": event_data,
                    "processed_at": datetime.utcnow().isoformat()
                },
                trace_id=trace_id,
                timestamp=datetime.utcnow()
            )

            # Save to database
            async with async_session_maker() as session:
                session.add(audit_log)
                await session.commit()

                logger.info(f"Audit log created for event {event_type}, user {user_id}")

            # Mark as processed for idempotency
            self.processed_events.add(dedup_key)

            # Optional: Emit audit.log.created event for downstream consumers
            audit_created_event = {
                "audit_log_id": str(audit_log.id),
                "event_type": event_type,
                "user_id": user_id,
                "timestamp": audit_log.timestamp.isoformat(),
                "processed_at": datetime.utcnow().isoformat()
            }

            try:
                publish_event("audit.log.created", audit_created_event)
                logger.debug(f"Audit log created event published for {audit_log.id}")
            except Exception as e:
                logger.error(f"Failed to publish audit.log.created event: {e}")

        except Exception as e:
            logger.error(f"Failed to create audit log for event {event_type}: {e}")
            # Don't add to processed set if it failed - allows for retry
            raise

    async def cleanup_old_dedup_keys(self):
        """
        Periodically cleanup old deduplication keys to prevent memory growth.
        In a real system, this would run on a schedule and remove keys older than retention period.
        """
        # Implementation would depend on retention policy
        # For now, just keep the in-memory set for demonstration
        pass


# Singleton instance
audit_log_handler = AuditLogHandler()


async def handle_task_created(event_data: Dict[str, Any]) -> None:
    """Handle task.created event."""
    await audit_log_handler.handle_any_event(event_data, "task.created")


async def handle_task_updated(event_data: Dict[str, Any]) -> None:
    """Handle task.updated event."""
    await audit_log_handler.handle_any_event(event_data, "task.updated")


async def handle_task_completed(event_data: Dict[str, Any]) -> None:
    """Handle task.completed event."""
    await audit_log_handler.handle_any_event(event_data, "task.completed")


async def handle_task_deleted(event_data: Dict[str, Any]) -> None:
    """Handle task.deleted event."""
    await audit_log_handler.handle_any_event(event_data, "task.deleted")


async def handle_reminder_due(event_data: Dict[str, Any]) -> None:
    """Handle reminder.due event."""
    await audit_log_handler.handle_any_event(event_data, "reminder.due")


async def handle_notification_sent(event_data: Dict[str, Any]) -> None:
    """Handle notification.sent event."""
    await audit_log_handler.handle_any_event(event_data, "notification.sent")


async def handle_user_preference_changed(event_data: Dict[str, Any]) -> None:
    """Handle user.preference.changed event."""
    await audit_log_handler.handle_any_event(event_data, "user.preference.changed")


async def handle_operation_failed(event_data: Dict[str, Any]) -> None:
    """Handle operation.failed event."""
    await audit_log_handler.handle_any_event(event_data, "operation.failed")


async def handle_retry_scheduled(event_data: Dict[str, Any]) -> None:
    """Handle retry.scheduled event."""
    await audit_log_handler.handle_any_event(event_data, "retry.scheduled")


async def handle_retry_executed(event_data: Dict[str, Any]) -> None:
    """Handle retry.executed event."""
    await audit_log_handler.handle_any_event(event_data, "retry.executed")


async def handle_retry_exhausted(event_data: Dict[str, Any]) -> None:
    """Handle retry.exhausted event."""
    await audit_log_handler.handle_any_event(event_data, "retry.exhausted")


async def handle_alert_triggered(event_data: Dict[str, Any]) -> None:
    """Handle alert.triggered event."""
    await audit_log_handler.handle_any_event(event_data, "alert.triggered")