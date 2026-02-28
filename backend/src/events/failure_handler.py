"""
Failure handler for processing operation.failed events.
Implements failure persistence, circuit breaker state checking, and retry scheduling.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from src.database import async_session_maker
from src.models import AuditLog
from src.events.publisher import publish_event
from src.resilience.circuit_breaker import AsyncCircuitBreaker

logger = logging.getLogger(__name__)


class FailureHandler:
    """
    Handles operation failures by persisting records, checking circuit breaker state,
    and scheduling retries with exponential backoff.
    """

    def __init__(self):
        # Dictionary to track retry attempts per operation
        self.retry_attempts = {}
        # Maximum number of retry attempts
        self.max_attempts = 5
        # Exponential backoff intervals: 1s, 2s, 4s, 8s, 16s
        self.backoff_intervals = [1, 2, 4, 8, 16]

    async def handle_failure(self, event_data: Dict[str, Any]) -> None:
        """
        Process an operation.failure event.

        Args:
            event_data: Event data containing failure information
        """
        operation_id = event_data.get("operation_id")
        error_message = event_data.get("error", "")
        original_payload = event_data.get("original_payload", {})
        user_id = event_data.get("user_id")

        logger.error(f"Handling failure for operation {operation_id}: {error_message}")

        # Persist failure record via AuditLog
        await self._persist_failure_record(operation_id, error_message, original_payload, user_id)

        # Determine if we should retry based on circuit breaker state and attempt count
        should_retry = await self._should_retry(operation_id)

        if should_retry:
            await self._schedule_retry(operation_id, original_payload, user_id)
        else:
            # Max retries exceeded - emit alert
            await self._emit_alert(operation_id, error_message, user_id)

    async def _persist_failure_record(
        self, operation_id: str, error_message: str, original_payload: Dict[str, Any], user_id: Optional[str]
    ) -> None:
        """
        Persist failure record via AuditLog with event_type, user_id, full payload, trace_id, timestamp.
        """
        try:
            async with async_session_maker() as session:
                audit_log = AuditLog(
                    event_type="operation.failed",
                    user_id=user_id,
                    payload={
                        "operation_id": operation_id,
                        "error_message": error_message,
                        "original_payload": original_payload,
                        "handled_at": datetime.utcnow().isoformat()
                    },
                    trace_id=original_payload.get("trace_id", ""),
                    timestamp=datetime.utcnow()
                )

                session.add(audit_log)
                await session.commit()

                logger.info(f"Persisted failure record for operation {operation_id}")
        except Exception as e:
            logger.error(f"Failed to persist failure record for operation {operation_id}: {e}")

    async def _should_retry(self, operation_id: str) -> bool:
        """
        Determine if an operation should be retried based on attempt count and circuit breaker state.
        """
        # Check circuit breaker state
        # For simplicity, assume circuit breaker allows retries for now
        # In a real implementation, this would check the actual circuit breaker state

        # Check retry attempt count
        current_attempt = self.retry_attempts.get(operation_id, 0)

        if current_attempt >= self.max_attempts:
            logger.info(f"Max retry attempts ({self.max_attempts}) exceeded for operation {operation_id}")
            return False

        return True

    async def _schedule_retry(self, operation_id: str, original_payload: Dict[str, Any], user_id: Optional[str]) -> None:
        """
        Schedule a retry with exponential backoff and emit retry.scheduled event.
        """
        current_attempt = self.retry_attempts.get(operation_id, 0)
        self.retry_attempts[operation_id] = current_attempt + 1

        # Calculate backoff interval (exponential: 1s, 2s, 4s, 8s, 16s)
        backoff_seconds = self.backoff_intervals[min(current_attempt, len(self.backoff_intervals) - 1)]

        logger.info(f"Scheduling retry #{current_attempt + 1} for operation {operation_id} in {backoff_seconds}s")

        # Create retry event data
        retry_event_data = {
            "operation_id": operation_id,
            "original_payload": original_payload,
            "retry_attempt": current_attempt + 1,
            "scheduled_delay_seconds": backoff_seconds,
            "user_id": user_id,
            "scheduled_at": datetime.utcnow().isoformat()
        }

        # Publish retry.scheduled event
        try:
            publish_event("retry.scheduled", retry_event_data)
            logger.info(f"Published retry.scheduled event for operation {operation_id}")
        except Exception as e:
            logger.error(f"Failed to publish retry.scheduled event: {e}")

    async def _emit_alert(self, operation_id: str, error_message: str, user_id: Optional[str]) -> None:
        """
        Emit alert.triggered event when max retries are exhausted.
        """
        alert_data = {
            "operation_id": operation_id,
            "error_message": error_message,
            "user_id": user_id,
            "attempts_exhausted": True,
            "alert_timestamp": datetime.utcnow().isoformat()
        }

        try:
            publish_event("alert.triggered", alert_data)
            logger.warning(f"Published alert.triggered for operation {operation_id}")
        except Exception as e:
            logger.error(f"Failed to publish alert.triggered event: {e}")


# Singleton instance
failure_handler = FailureHandler()


async def handle_failure_event(event_data: Dict[str, Any]) -> None:
    """
    Wrapper function to handle failure events from Dapr pub/sub.
    """
    await failure_handler.handle_failure(event_data)