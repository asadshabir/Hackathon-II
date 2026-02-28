"""
Event publisher module for Dapr pub/sub integration.
Publishes CloudEvents 1.0 formatted messages to Kafka topics via Dapr.
"""

import json
import uuid
from typing import Dict, Any, Optional
from datetime import datetime
import logging
from dapr.clients import DaprClient

logger = logging.getLogger(__name__)


def publish_event(
    topic: str,
    data: Dict[str, Any],
    trace_context: Optional[Dict[str, str]] = None
) -> None:
    """
    Publish an event to a Dapr pub/sub topic using CloudEvents 1.0 format.

    Args:
        topic: The Kafka topic name to publish to
        data: The event payload data
        trace_context: Optional trace context for distributed tracing
    """
    # Construct CloudEvents 1.0 compliant payload
    cloudevent = {
        "specversion": "1.0",
        "type": topic,
        "source": "/api/tasks",  # Adjust source based on where the event originates
        "id": f"evt-{uuid.uuid4()}",
        "time": datetime.utcnow().isoformat() + "Z",
        "datacontenttype": "application/json",
        "data": data
    }

    # Add traceparent header if provided for distributed tracing
    if trace_context and "traceparent" in trace_context:
        cloudevent["traceparent"] = trace_context["traceparent"]

    try:
        with DaprClient() as client:
            # Publish to Dapr pub/sub
            client.publish_event(
                pubsub_name="pubsub",  # This matches the Dapr component name
                topic_name=topic,
                data=json.dumps(cloudevent),
                data_content_type="application/cloudevents+json"
            )
            logger.info(f"Event published to topic '{topic}' with ID {cloudevent['id']}")
    except Exception as e:
        logger.error(f"Failed to publish event to topic '{topic}': {str(e)}")
        raise


async def publish_event_async(
    topic: str,
    data: Dict[str, Any],
    trace_context: Optional[Dict[str, str]] = None
) -> None:
    """
    Async version of publish_event for use in async contexts.
    """
    # For now, using the synchronous version inside async
    # In a real implementation, we might want to use an async Dapr client if available
    publish_event(topic, data, trace_context)