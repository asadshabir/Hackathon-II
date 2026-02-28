"""
Observability agent for monitoring Dapr sidecar health, aggregating metrics,
detecting anomalies, and emitting alerts.
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any

import aiohttp
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.events.publisher import publish_event

logger = logging.getLogger(__name__)


class ObservabilityAgent:
    """
    Monitors Dapr sidecar health, aggregates metrics, detects anomalies,
    and emits alerts when thresholds are exceeded.
    """

    def __init__(self):
        self.dapr_http_port = 3500  # Default Dapr HTTP port
        self.dapr_address = "localhost"
        self.check_interval = 30  # seconds
        self.anomaly_thresholds = {
            "p95_latency_ms": 500,  # milliseconds
            "error_rate_percent": 1,  # percentage
            "cpu_usage_percent": 80,  # percentage
            "memory_usage_percent": 80,  # percentage
        }
        self.metrics_history = []  # Store recent metrics for trend analysis
        self.max_history = 100  # Maximum number of metrics to store

    async def start_monitoring(self):
        """
        Start the monitoring loop that periodically checks Dapr health
        and analyzes metrics for anomalies.
        """
        logger.info("Starting observability monitoring...")

        while True:
            try:
                # Check Dapr sidecar health
                dapr_healthy = await self.check_dapr_health()

                # Aggregate metrics
                metrics = await self.aggregate_metrics()

                # Detect anomalies
                anomalies = await self.detect_anomalies(metrics)

                # Emit anomaly events if detected
                for anomaly in anomalies:
                    await self.emit_anomaly_event(anomaly)

                # Add metrics to history for trend analysis
                self.metrics_history.append({
                    "timestamp": datetime.utcnow(),
                    "metrics": metrics,
                    "anomalies": anomalies
                })

                # Keep history size manageable
                if len(self.metrics_history) > self.max_history:
                    self.metrics_history.pop(0)

                # Wait before next check
                await asyncio.sleep(self.check_interval)

            except Exception as e:
                logger.error(f"Error in observability monitoring: {e}")
                await asyncio.sleep(self.check_interval)

    async def check_dapr_health(self) -> bool:
        """
        Check Dapr sidecar health by making a simple request to Dapr API.
        """
        try:
            url = f"http://{self.dapr_address}:{self.dapr_http_port}/v1.0/healthz"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=10) as response:
                    is_healthy = response.status == 204

                    if not is_healthy:
                        logger.warning(f"Dapr health check failed: {response.status}")

                    return is_healthy
        except Exception as e:
            logger.error(f"Dapr health check error: {e}")
            return False

    async def aggregate_metrics(self) -> Dict[str, Any]:
        """
        Aggregate various metrics from the application and system.
        """
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "dapr_healthy": await self.check_dapr_health(),
            "request_count": 0,  # Would be tracked by middleware
            "avg_response_time_ms": 0,  # Would be tracked by middleware
            "p95_response_time_ms": 0,  # Would be calculated from response times
            "error_count": 0,  # Would be tracked by error handlers
            "error_rate": 0,  # Calculated from error count and request count
            "active_connections": 0,  # Would be tracked by connection registry
            "cpu_usage_percent": 0,  # Would be retrieved from system
            "memory_usage_percent": 0,  # Would be retrieved from system
        }

        # In a real implementation, these values would be gathered from:
        # - Prometheus metrics endpoint
        # - System monitoring libraries (psutil)
        # - Application counters (Redis, etc.)
        # - Connection registries

        # For now, return placeholder values
        return metrics

    async def detect_anomalies(self, metrics: Dict[str, Any]) -> list:
        """
        Detect anomalies based on thresholds and historical data.
        """
        anomalies = []

        # Check p95 latency
        p95_latency = metrics.get("p95_response_time_ms", 0)
        if p95_latency > self.anomaly_thresholds["p95_latency_ms"]:
            anomalies.append({
                "type": "high_latency",
                "severity": "warning",
                "metric": "p95_response_time_ms",
                "value": p95_latency,
                "threshold": self.anomaly_thresholds["p95_latency_ms"],
                "message": f"P95 response time ({p95_latency}ms) exceeds threshold ({self.anomaly_thresholds['p95_latency_ms']}ms)"
            })

        # Check error rate
        error_rate = metrics.get("error_rate", 0) * 100  # Convert to percentage
        if error_rate > self.anomaly_thresholds["error_rate_percent"]:
            anomalies.append({
                "type": "high_error_rate",
                "severity": "critical",
                "metric": "error_rate_percent",
                "value": error_rate,
                "threshold": self.anomaly_thresholds["error_rate_percent"],
                "message": f"Error rate ({error_rate}%) exceeds threshold ({self.anomaly_thresholds['error_rate_percent']}%)"
            })

        # Check CPU usage
        cpu_usage = metrics.get("cpu_usage_percent", 0)
        if cpu_usage > self.anomaly_thresholds["cpu_usage_percent"]:
            anomalies.append({
                "type": "high_cpu_usage",
                "severity": "warning",
                "metric": "cpu_usage_percent",
                "value": cpu_usage,
                "threshold": self.anomaly_thresholds["cpu_usage_percent"],
                "message": f"CPU usage ({cpu_usage}%) exceeds threshold ({self.anomaly_thresholds['cpu_usage_percent']}%)"
            })

        # Check memory usage
        memory_usage = metrics.get("memory_usage_percent", 0)
        if memory_usage > self.anomaly_thresholds["memory_usage_percent"]:
            anomalies.append({
                "type": "high_memory_usage",
                "severity": "warning",
                "metric": "memory_usage_percent",
                "value": memory_usage,
                "threshold": self.anomaly_thresholds["memory_usage_percent"],
                "message": f"Memory usage ({memory_usage}%) exceeds threshold ({self.anomaly_thresholds['memory_usage_percent']}%)"
            })

        # Check for trends (e.g., consistently increasing error rate)
        if len(self.metrics_history) >= 5:
            recent_metrics = self.metrics_history[-5:]
            error_rates = [m["metrics"].get("error_rate", 0) for m in recent_metrics]

            # Check if error rate is consistently increasing
            is_increasing = all(error_rates[i] <= error_rates[i+1] for i in range(len(error_rates)-1))
            if is_increasing and error_rates[-1] > 0.005:  # If > 0.5% and trending up
                anomalies.append({
                    "type": "increasing_error_rate_trend",
                    "severity": "warning",
                    "metric": "error_rate_trend",
                    "value": error_rates[-1],
                    "message": "Error rate showing consistent upward trend over last 5 measurements"
                })

        return anomalies

    async def emit_anomaly_event(self, anomaly: Dict[str, Any]):
        """
        Emit an anomaly.detected event via Dapr pub/sub.
        """
        event_data = {
            "anomaly_id": f"anomaly_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{hash(str(anomaly))}",
            "timestamp": datetime.utcnow().isoformat(),
            "anomaly": anomaly,
            "service": "todo-ai-chatbot-api",
            "version": "1.0.0"
        }

        try:
            publish_event("anomaly.detected", event_data)
            logger.warning(f"Anomaly detected and published: {anomaly['type']} - {anomaly['message']}")
        except Exception as e:
            logger.error(f"Failed to publish anomaly event: {e}")


# Singleton instance
observability_agent = ObservabilityAgent()


async def start_observability_monitoring():
    """
    Start the observability monitoring loop.
    """
    await observability_agent.start_monitoring()