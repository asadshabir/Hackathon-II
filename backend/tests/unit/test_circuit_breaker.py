"""
Unit tests for AsyncCircuitBreaker.
Tests state transitions: closed -> open -> half-open -> closed/open.
"""

import asyncio
import pytest
from unittest.mock import AsyncMock

from src.resilience.circuit_breaker import (
    AsyncCircuitBreaker,
    CircuitBreakerOpen,
    CircuitState,
)


@pytest.fixture
def breaker() -> AsyncCircuitBreaker:
    """Circuit breaker with fast reset for testing."""
    return AsyncCircuitBreaker(
        name="test-breaker",
        max_failures=5,
        reset_timeout=0.2,  # 200ms for fast tests
    )


async def _success_fn() -> str:
    return "ok"


async def _failure_fn() -> str:
    raise ConnectionError("service down")


@pytest.mark.asyncio
async def test_starts_closed(breaker: AsyncCircuitBreaker) -> None:
    """Circuit breaker should start in CLOSED state."""
    assert breaker.state == CircuitState.CLOSED
    assert breaker.failure_count == 0


@pytest.mark.asyncio
async def test_successful_call_stays_closed(
    breaker: AsyncCircuitBreaker,
) -> None:
    """Successful calls should keep the circuit closed."""
    result = await breaker.call(_success_fn)
    assert result == "ok"
    assert breaker.state == CircuitState.CLOSED
    assert breaker.total_successes == 1


@pytest.mark.asyncio
async def test_failures_below_threshold_stay_closed(
    breaker: AsyncCircuitBreaker,
) -> None:
    """Fewer than max_failures should keep the circuit closed."""
    for _ in range(4):  # max_failures=5, so 4 should be fine
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)

    assert breaker.state == CircuitState.CLOSED
    assert breaker.failure_count == 4


@pytest.mark.asyncio
async def test_opens_after_max_failures(
    breaker: AsyncCircuitBreaker,
) -> None:
    """After max_failures consecutive failures, circuit should OPEN."""
    for _ in range(5):
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)

    assert breaker.state == CircuitState.OPEN
    assert breaker.total_failures == 5


@pytest.mark.asyncio
async def test_open_circuit_rejects_calls(
    breaker: AsyncCircuitBreaker,
) -> None:
    """When OPEN, calls should be rejected with CircuitBreakerOpen."""
    # Trip the breaker
    for _ in range(5):
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)

    with pytest.raises(CircuitBreakerOpen) as exc_info:
        await breaker.call(_success_fn)

    assert "test-breaker" in str(exc_info.value)
    assert breaker.total_rejected == 1


@pytest.mark.asyncio
async def test_transitions_to_half_open_after_timeout(
    breaker: AsyncCircuitBreaker,
) -> None:
    """After reset_timeout, circuit should transition to HALF_OPEN."""
    for _ in range(5):
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)

    assert breaker.state == CircuitState.OPEN

    # Wait for reset timeout (200ms)
    await asyncio.sleep(0.25)

    assert breaker.state == CircuitState.HALF_OPEN


@pytest.mark.asyncio
async def test_half_open_success_closes_circuit(
    breaker: AsyncCircuitBreaker,
) -> None:
    """A successful probe in HALF_OPEN should close the circuit."""
    for _ in range(5):
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)

    await asyncio.sleep(0.25)
    assert breaker.state == CircuitState.HALF_OPEN

    # Successful probe
    result = await breaker.call(_success_fn)
    assert result == "ok"
    assert breaker.state == CircuitState.CLOSED
    assert breaker.failure_count == 0


@pytest.mark.asyncio
async def test_half_open_failure_reopens_circuit(
    breaker: AsyncCircuitBreaker,
) -> None:
    """A failed probe in HALF_OPEN should re-open the circuit."""
    for _ in range(5):
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)

    await asyncio.sleep(0.25)
    assert breaker.state == CircuitState.HALF_OPEN

    # Failed probe
    with pytest.raises(ConnectionError):
        await breaker.call(_failure_fn)

    assert breaker.state == CircuitState.OPEN


@pytest.mark.asyncio
async def test_success_resets_failure_count(
    breaker: AsyncCircuitBreaker,
) -> None:
    """A success in CLOSED state should reset the failure count."""
    for _ in range(3):
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)
    assert breaker.failure_count == 3

    await breaker.call(_success_fn)
    assert breaker.failure_count == 0


@pytest.mark.asyncio
async def test_excluded_exceptions_dont_count() -> None:
    """Excluded exceptions should not increment the failure count."""
    breaker = AsyncCircuitBreaker(
        name="exclude-test",
        max_failures=2,
        reset_timeout=1.0,
        excluded_exceptions=(ValueError,),
    )

    async def raise_value_error() -> str:
        raise ValueError("not a real failure")

    for _ in range(10):
        with pytest.raises(ValueError):
            await breaker.call(raise_value_error)

    # Should still be closed since ValueError is excluded
    assert breaker.state == CircuitState.CLOSED
    assert breaker.failure_count == 0


@pytest.mark.asyncio
async def test_manual_reset(breaker: AsyncCircuitBreaker) -> None:
    """Manual reset should return circuit to CLOSED regardless of state."""
    for _ in range(5):
        with pytest.raises(ConnectionError):
            await breaker.call(_failure_fn)

    assert breaker.state == CircuitState.OPEN
    breaker.reset()
    assert breaker.state == CircuitState.CLOSED
    assert breaker.failure_count == 0


@pytest.mark.asyncio
async def test_get_metrics(breaker: AsyncCircuitBreaker) -> None:
    """get_metrics should return observable state."""
    await breaker.call(_success_fn)
    with pytest.raises(ConnectionError):
        await breaker.call(_failure_fn)

    metrics = breaker.get_metrics()
    assert metrics["name"] == "test-breaker"
    assert metrics["state"] == "closed"
    assert metrics["total_calls"] == 2
    assert metrics["total_successes"] == 1
    assert metrics["total_failures"] == 1
    assert metrics["total_rejected"] == 0
