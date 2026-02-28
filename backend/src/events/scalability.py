"""
Scalability observer for monitoring system metrics and recommending scaling actions.
"""

import asyncio
import logging
from datetime import datetime
from typing import Dict, Any

import psutil
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import async_session_maker
from src.events.publisher import publish_event

logger = logging.getLogger(__name__)


class ScalabilityObserver:
    """
    Monitors CPU/memory/request metrics from Prometheus, emits scale.recommendation
    when CPU > 70% or memory > 80%, respects min replicas >= 2.
    """

    def __init__(self):
        self.check_interval = 60  # seconds
        self.cpu_threshold = 70  # percentage
        self.memory_threshold = 80  # percentage
        self.min_replicas = 2
        self.max_replicas = 10
        self.scale_up_factor = 1.5  # Increase by 50% when scaling up
        self.scale_down_factor = 0.7  # Decrease by 30% when scaling down
        self.metrics_history = []  # Store recent metrics for trend analysis
        self.max_history = 10  # Maximum number of metrics to store
        self.cooldown_period = 300  # 5 minutes cooldown between scaling recommendations

    async def start_observing(self):
        """
        Start the scalability observation loop that periodically monitors
        system metrics and recommends scaling actions.
        """
        logger.info("Starting scalability observation...")

        while True:
            try:
                # Monitor system metrics
                metrics = await self.monitor_system_metrics()

                # Evaluate scaling needs
                scale_recommendation = await self.evaluate_scaling_needs(metrics)

                # Emit scaling recommendation if needed
                if scale_recommendation:
                    await self.emit_scale_recommendation(scale_recommendation, metrics)

                # Add metrics to history for trend analysis
                self.metrics_history.append({
                    "timestamp": datetime.utcnow(),
                    "metrics": metrics,
                    "recommendation": scale_recommendation
                })

                # Keep history size manageable
                if len(self.metrics_history) > self.max_history:
                    self.metrics_history.pop(0)

                # Wait before next check
                await asyncio.sleep(self.check_interval)

            except Exception as e:
                logger.error(f"Error in scalability observation: {e}")
                await asyncio.sleep(self.check_interval)

    async def monitor_system_metrics(self) -> Dict[str, Any]:
        """
        Monitor system metrics: CPU, memory, and request metrics.
        """
        metrics = {
            "timestamp": datetime.utcnow().isoformat(),
            "cpu_usage_percent": psutil.cpu_percent(interval=1),
            "memory_usage_percent": psutil.virtual_memory().percent,
            "disk_usage_percent": psutil.disk_usage('/').percent,
            "process_count": len(psutil.pids()),
            "network_io": psutil.net_io_counters()._asdict() if psutil.net_io_counters() else {},
            "request_rate_per_second": 0,  # Would be retrieved from Prometheus
            "active_connections": 0,  # Would be tracked by connection registry
            "queue_length": 0,  # Would be tracked by queue system
        }

        # In a real implementation, request metrics would be retrieved from:
        # - Prometheus metrics endpoint
        # - Application performance counters
        # - Queue depth metrics
        # - Active connection counts

        return metrics

    async def evaluate_scaling_needs(self, metrics: Dict[str, Any]) -> Dict[str, Any] | None:
        """
        Evaluate if scaling is needed based on current metrics.
        """
        current_cpu = metrics.get("cpu_usage_percent", 0)
        current_memory = metrics.get("memory_usage_percent", 0)

        recommendation = None

        # Check if CPU usage is above threshold
        if current_cpu > self.cpu_threshold:
            logger.info(f"CPU usage {current_cpu}% exceeds threshold {self.cpu_threshold}%")

            # Calculate recommended replica count based on CPU usage
            cpu_factor = current_cpu / 100.0
            recommended_replicas = int(self.min_replicas * cpu_factor * self.scale_up_factor)
            recommended_replicas = min(recommended_replicas, self.max_replicas)
            recommended_replicas = max(recommended_replicas, self.min_replicas)

            recommendation = {
                "reason": "high_cpu_usage",
                "current_cpu": current_cpu,
                "threshold_cpu": self.cpu_threshold,
                "recommended_action": "scale_up",
                "recommended_replicas": recommended_replicas,
                "message": f"CPU usage {current_cpu}% > threshold {self.cpu_threshold}%. Recommended replicas: {recommended_replicas}"
            }

        # Check if memory usage is above threshold
        elif current_memory > self.memory_threshold:
            logger.info(f"Memory usage {current_memory}% exceeds threshold {self.memory_threshold}%")

            # Calculate recommended replica count based on memory usage
            memory_factor = current_memory / 100.0
            recommended_replicas = int(self.min_replicas * memory_factor * self.scale_up_factor)
            recommended_replicas = min(recommended_replicas, self.max_replicas)
            recommended_replicas = max(recommended_replicas, self.min_replicas)

            recommendation = {
                "reason": "high_memory_usage",
                "current_memory": current_memory,
                "threshold_memory": self.memory_threshold,
                "recommended_action": "scale_up",
                "recommended_replicas": recommended_replicas,
                "message": f"Memory usage {current_memory}% > threshold {self.memory_threshold}%. Recommended replicas: {recommended_replicas}"
            }

        # Check if we should scale down (both CPU and memory are low)
        elif current_cpu < self.cpu_threshold * 0.3 and current_memory < self.memory_threshold * 0.3:
            # Only scale down if we have more than the minimum replicas
            # and the load has been consistently low
            if len(self.metrics_history) >= 3:  # Check last 3 measurements
                recent_metrics = self.metrics_history[-3:]
                consistently_low = all(
                    m["metrics"]["cpu_usage_percent"] < self.cpu_threshold * 0.3 and
                    m["metrics"]["memory_usage_percent"] < self.memory_threshold * 0.3
                    for m in recent_metrics
                )

                if consistently_low:
                    # Scale down conservatively
                    recommended_replicas = max(int(self.min_replicas * self.scale_down_factor), self.min_replicas)

                    recommendation = {
                        "reason": "low_resource_usage",
                        "current_cpu": current_cpu,
                        "current_memory": current_memory,
                        "recommended_action": "scale_down",
                        "recommended_replicas": recommended_replicas,
                        "message": f"Consistently low resource usage (CPU: {current_cpu}%, Memory: {current_memory}%). Recommended replicas: {recommended_replicas}"
                    }

        # Check for other scaling factors like request rate or queue length
        request_rate = metrics.get("request_rate_per_second", 0)
        queue_length = metrics.get("queue_length", 0)

        if request_rate > 1000:  # High request rate threshold
            factor = request_rate / 1000.0
            recommended_replicas = min(int(self.min_replicas * factor), self.max_replicas)

            if not recommendation or recommended_replicas > recommendation.get("recommended_replicas", self.min_replicas):
                recommendation = {
                    "reason": "high_request_rate",
                    "current_request_rate": request_rate,
                    "recommended_action": "scale_up",
                    "recommended_replicas": recommended_replicas,
                    "message": f"High request rate ({request_rate}/sec). Recommended replicas: {recommended_replicas}"
                }

        if queue_length > 50:  # High queue length threshold
            factor = queue_length / 50.0
            recommended_replicas = min(int(self.min_replicas * factor), self.max_replicas)

            if not recommendation or recommended_replicas > recommendation.get("recommended_replicas", self.min_replicas):
                recommendation = {
                    "reason": "high_queue_length",
                    "current_queue_length": queue_length,
                    "recommended_action": "scale_up",
                    "recommended_replicas": recommended_replicas,
                    "message": f"High queue length ({queue_length}). Recommended replicas: {recommended_replicas}"
                }

        # Respect minimum replicas constraint
        if recommendation and recommendation["recommended_action"] == "scale_up":
            recommendation["recommended_replicas"] = max(
                recommendation["recommended_replicas"],
                self.min_replicas
            )

        return recommendation

    async def emit_scale_recommendation(self, recommendation: Dict[str, Any], metrics: Dict[str, Any]):
        """
        Emit a scale.recommendation event via Dapr pub/sub.
        """
        event_data = {
            "recommendation_id": f"scale_rec_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{hash(str(recommendation))}",
            "timestamp": datetime.utcnow().isoformat(),
            "recommendation": recommendation,
            "current_metrics": metrics,
            "service": "todo-ai-chatbot-api",
            "version": "1.0.0"
        }

        try:
            publish_event("scale.recommendation", event_data)
            logger.info(f"Scale recommendation published: {recommendation['recommended_action']} to {recommendation['recommended_replicas']} replicas - {recommendation['message']}")
        except Exception as e:
            logger.error(f"Failed to publish scale recommendation event: {e}")


# Singleton instance
scalability_observer = ScalabilityObserver()


async def start_scalability_observing():
    """
    Start the scalability observation loop.
    """
    await scalability_observer.start_observing()