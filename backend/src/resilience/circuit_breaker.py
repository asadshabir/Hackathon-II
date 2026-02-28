"""
Async circuit breaker implementation.
States: CLOSED -> OPEN -> HALF_OPEN -> CLOSED (or back to OPEN).
Constitution: max 5 failures, 30s reset timeout, half-open single probe.
"""

import asyncio
import enum
import logging
import time
from typing import Any, Callable, Coroutine, TypeVar

logger = logging.getLogger(__name__)

T = TypeVar("T")


class CircuitState(enum.Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreakerOpen(Exception):
    """Raised when the circuit breaker is open and rejecting calls."""

    def __init__(self, name: str, remaining_seconds: float) -> None:
        self.name = name
        self.remaining_seconds = remaining_seconds
        super().__init__(
            f"Circuit breaker '{name}' is OPEN. "
            f"Retry in {remaining_seconds:.1f}s."
        )


class AsyncCircuitBreaker:
    """
    Async circuit breaker with closed/open/half-open states.

    Args:
        name: Identifier for logging and metrics.
        max_failures: Number of consecutive failures before opening. Default 5.
        reset_timeout: Seconds to wait before transitioning to half-open. Default 30.
        excluded_exceptions: Exception types that should NOT count as failures.
    """

    def __init__(
        self,
        name: str = "default",
        max_failures: int = 5,
        reset_timeout: float = 30.0,
        excluded_exceptions: tuple[type[Exception], ...] | None = None,
    ) -> None:
        self.name = name
        self.max_failures = max_failures
        self.reset_timeout = reset_timeout
        self.excluded_exceptions = excluded_exceptions or ()

        self._state = CircuitState.CLOSED
        self._failure_count: int = 0
        self._success_count: int = 0
        self._last_failure_time: float = 0.0
        self._lock = asyncio.Lock()

        # Metrics counters
        self.total_calls: int = 0
        self.total_failures: int = 0
        self.total_successes: int = 0
        self.total_rejected: int = 0

    @property
    def state(self) -> CircuitState:
        """Current circuit state (may auto-transition from OPEN to HALF_OPEN)."""
        if self._state == CircuitState.OPEN:
            elapsed = time.monotonic() - self._last_failure_time
            if elapsed >= self.reset_timeout:
                self._state = CircuitState.HALF_OPEN
                logger.info(
                    f"Circuit breaker '{self.name}' transitioned to HALF_OPEN "
                    f"after {elapsed:.1f}s"
                )
        return self._state

    @property
    def failure_count(self) -> int:
        return self._failure_count

    def _remaining_timeout(self) -> float:
        """Seconds remaining until the circuit transitions to half-open."""
        elapsed = time.monotonic() - self._last_failure_time
        return max(0.0, self.reset_timeout - elapsed)

    async def call(
        self,
        func: Callable[..., Coroutine[Any, Any, T]],
        *args: Any,
        **kwargs: Any,
    ) -> T:
        """
        Execute an async function through the circuit breaker.

        Raises:
            CircuitBreakerOpen: If the circuit is open and timeout has not elapsed.
        """
        async with self._lock:
            current_state = self.state

            if current_state == CircuitState.OPEN:
                self.total_rejected += 1
                raise CircuitBreakerOpen(
                    self.name, self._remaining_timeout()
                )

        self.total_calls += 1

        try:
            result = await func(*args, **kwargs)
        except Exception as exc:
            if isinstance(exc, self.excluded_exceptions):
                # Excluded exceptions don't count as failures
                raise

            await self._record_failure()
            raise
        else:
            await self._record_success()
            return result

    async def _record_failure(self) -> None:
        """Record a failure and potentially open the circuit."""
        async with self._lock:
            self._failure_count += 1
            self._success_count = 0
            self.total_failures += 1
            self._last_failure_time = time.monotonic()

            if self._failure_count >= self.max_failures:
                old_state = self._state
                self._state = CircuitState.OPEN
                if old_state != CircuitState.OPEN:
                    logger.warning(
                        f"Circuit breaker '{self.name}' OPENED after "
                        f"{self._failure_count} failures"
                    )

    async def _record_success(self) -> None:
        """Record a success and potentially close the circuit."""
        async with self._lock:
            self.total_successes += 1

            if self._state == CircuitState.HALF_OPEN:
                # Successful probe closes the circuit
                self._state = CircuitState.CLOSED
                self._failure_count = 0
                self._success_count = 0
                logger.info(
                    f"Circuit breaker '{self.name}' CLOSED after successful probe"
                )
            else:
                self._success_count += 1
                # In CLOSED state, successes don't reset failure count
                # (consecutive failures only)
                self._failure_count = 0

    def reset(self) -> None:
        """Manually reset the circuit breaker to CLOSED state."""
        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._success_count = 0
        self._last_failure_time = 0.0
        logger.info(f"Circuit breaker '{self.name}' manually reset to CLOSED")

    def get_metrics(self) -> dict[str, Any]:
        """Return observable metrics for the circuit breaker."""
        return {
            "name": self.name,
            "state": self.state.value,
            "failure_count": self._failure_count,
            "total_calls": self.total_calls,
            "total_failures": self.total_failures,
            "total_successes": self.total_successes,
            "total_rejected": self.total_rejected,
            "remaining_timeout": (
                self._remaining_timeout()
                if self._state == CircuitState.OPEN
                else 0.0
            ),
        }
