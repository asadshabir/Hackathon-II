"""
Retry scheduler for processing retry.scheduled events.
Implements delayed retry execution with exponential backoff.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.database import async_session_maker
from src.models import AuditLog
from src.events.publisher import publish_event

logger = logging.getLogger(__name__)


class RetryScheduler:
    """
    Schedules retries with exponential backoff and manages retry state.
    Waits backoff interval, re-emits original event, handles exhaustion.
    Preserves original payload and trace context.
    """

    def __init__(self):
        # Track active retry tasks to prevent duplicates
        self.active_retries = {}

    async def handle_retry_scheduled(self, event_data: Dict[str, Any]) -> None:
        """
        Handle a retry.scheduled event by waiting the backoff interval and re-emitting the original event.

        Args:
            event_data: Event data containing retry information
        """
        operation_id = event_data.get("operation_id")
        original_payload = event_data.get("original_payload", {})
        retry_attempt = event_data.get("retry_attempt", 1)
        scheduled_delay_seconds = event_data.get("scheduled_delay_seconds", 1)
        user_id = event_data.get("user_id")

        logger.info(f"Processing retry scheduled for operation {operation_id}, attempt #{retry_attempt}")

        # Check if this retry is already active to prevent duplicate processing
        retry_key = f"{operation_id}_{retry_attempt}"
        if retry_key in self.active_retries:
            logger.warning(f"Retry already active for {operation_id}, attempt #{retry_attempt}")
            return

        # Mark this retry as active
        self.active_retries[retry_key] = True

        try:
            # Wait for the backoff interval
            logger.info(f"Waiting {scheduled_delay_seconds}s before retrying operation {operation_id}")
            await asyncio.sleep(scheduled_delay_seconds)

            # Re-emit the original event
            await self._re_emit_original_event(original_payload, operation_id, retry_attempt, user_id)

            # Check if max attempts reached
            max_attempts = 5  # Same as in failure handler
            if retry_attempt >= max_attempts:
                logger.info(f"Max retry attempts reached for operation {operation_id}, emitting retry.exhausted")
                await self._emit_retry_exhausted(operation_id, original_payload, user_id)
            else:
                logger.info(f"Retry {retry_attempt} for operation {operation_id} completed")

        except Exception as e:
            logger.error(f"Error in retry scheduler for operation {operation_id}: {e}")
            # Log the error in audit log
            await self._log_retry_error(operation_id, str(e), original_payload, user_id)
        finally:
            # Remove from active retries
            if retry_key in self.active_retries:
                del self.active_retries[retry_key]

    async def _re_emit_original_event(self, original_payload: Dict[str, Any], operation_id: str, retry_attempt: int, user_id: str) -> None:
        """
        Re-emit the original event with retry context.
        """
        # Extract the original event type and data
        original_event_type = original_payload.get("original_event_type", "unknown")

        # Add retry context to the payload
        retry_context = {
            "retry_attempt": retry_attempt,
            "retry_timestamp": datetime.utcnow().isoformat(),
            "operation_id": operation_id,
            "original_event_type": original_event_type
        }

        # Update the original payload with retry context
        enhanced_payload = {**original_payload, "retry_context": retry_context}

        logger.info(f"Re-emitting original event {original_event_type} for operation {operation_id}, attempt #{retry_attempt}")

        try:
            # Publish the enhanced event with the same original event type
            publish_event(original_event_type, enhanced_payload)

            # Also emit a retry.executed event to track the retry execution
            retry_executed_data = {
                "operation_id": operation_id,
                "retry_attempt": retry_attempt,
                "original_event_type": original_event_type,
                "execution_timestamp": datetime.utcnow().isoformat(),
                "user_id": user_id
            }
            publish_event("retry.executed", retry_executed_data)

            logger.info(f"Successfully re-emitted event for operation {operation_id}, attempt #{retry_attempt}")
        except Exception as e:
            logger.error(f"Failed to re-emit original event for operation {operation_id}: {e}")
            raise

    async def _emit_retry_exhausted(self, operation_id: str, original_payload: Dict[str, Any], user_id: str) -> None:
        """
        Emit retry.exhausted event when max attempts are reached.
        """
        exhausted_data = {
            "operation_id": operation_id,
            "original_payload": original_payload,
            "max_attempts_reached": True,
            "exhausted_at": datetime.utcnow().isoformat(),
            "user_id": user_id
        }

        try:
            publish_event("retry.exhausted", exhausted_data)
            logger.warning(f"Published retry.exhausted event for operation {operation_id}")

            # Also log this as an audit event
            await self._log_retry_exhausted(operation_id, original_payload, user_id)
        except Exception as e:
            logger.error(f"Failed to publish retry.exhausted event: {e}")

    async def _log_retry_error(self, operation_id: str, error: str, original_payload: Dict[str, Any], user_id: str) -> None:
        """
        Log retry error in audit log.
        """
        try:
            async with async_session_maker() as session:
                audit_log = AuditLog(
                    event_type="retry.error",
                    user_id=user_id,
                    payload={
                        "operation_id": operation_id,
                        "error": error,
                        "original_payload": original_payload,
                        "logged_at": datetime.utcnow().isoformat()
                    },
                    trace_id=original_payload.get("trace_id", ""),
                    timestamp=datetime.utcnow()
                )

                session.add(audit_log)
                await session.commit()

                logger.info(f"Logged retry error for operation {operation_id}")
        except Exception as e:
            logger.error(f"Failed to log retry error for operation {operation_id}: {e}")

    async def _log_retry_exhausted(self, operation_id: str, original_payload: Dict[str, Any], user_id: str) -> None:
        """
        Log retry exhaustion in audit log.
        """
        try:
            async with async_session_maker() as session:
                audit_log = AuditLog(
                    event_type="retry.exhausted",
                    user_id=user_id,
                    payload={
                        "operation_id": operation_id,
                        "original_payload": original_payload,
                        "exhausted_at": datetime.utcnow().isoformat(),
                        "logged_at": datetime.utcnow().isoformat()
                    },
                    trace_id=original_payload.get("trace_id", ""),
                    timestamp=datetime.utcnow()
                )

                session.add(audit_log)
                await session.commit()

                logger.info(f"Logged retry exhaustion for operation {operation_id}")
        except Exception as e:
            logger.error(f"Failed to log retry exhaustion for operation {operation_id}: {e}")


# Singleton instance
retry_scheduler = RetryScheduler()


async def handle_retry_scheduled_event(event_data: Dict[str, Any]) -> None:
    """
    Wrapper function to handle retry.scheduled events from Dapr pub/sub.
    """
    await retry_scheduler.handle_retry_scheduled(event_data)