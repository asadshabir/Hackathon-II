"""
Unit test for event publisher module.
Tests the publish_event function with mocked Dapr client.
"""
import pytest
from unittest.mock import patch, MagicMock
from backend.src.events.publisher import publish_event


def test_publish_event_success():
    """Test that publish_event calls Dapr client with correct parameters."""
    # Test data
    topic = "task.created"
    data = {
        "task_id": "test-uuid",
        "user_id": "user-uuid",
        "title": "Test task",
        "priority": "medium"
    }

    # Mock the Dapr client
    mock_client = MagicMock()

    with patch('backend.src.events.publisher.DaprClient') as mock_dapr_class:
        mock_instance = MagicMock()
        mock_dapr_class.return_value.__enter__.return_value = mock_instance

        # Call the function
        publish_event(topic, data)

        # Verify the Dapr client was called with correct parameters
        mock_instance.publish_event.assert_called_once()
        call_args = mock_instance.publish_event.call_args
        assert call_args.kwargs['pubsub_name'] == "pubsub"
        assert call_args.kwargs['topic_name'] == "task.created"

        # Verify the data is properly formatted as a CloudEvent
        published_data = call_args.kwargs['data']
        assert '"specversion": "1.0"' in published_data
        assert '"type": "task.created"' in published_data
        assert '"source": "/api/tasks"' in published_data
        assert '"task_id": "test-uuid"' in published_data
        assert '"user_id": "user-uuid"' in published_data


def test_publish_event_with_trace_context():
    """Test that publish_event includes traceparent when provided."""
    topic = "task.updated"
    data = {"task_id": "test-uuid", "changes": ["title"]}
    trace_context = {"traceparent": "00-trace-id-span-id-01"}

    mock_client = MagicMock()

    with patch('backend.src.events.publisher.DaprClient') as mock_dapr_class:
        mock_instance = MagicMock()
        mock_dapr_class.return_value.__enter__.return_value = mock_instance

        # Call the function
        publish_event(topic, data, trace_context)

        # Verify the traceparent was included
        published_data = mock_instance.publish_event.call_args.kwargs['data']
        assert '"traceparent": "00-trace-id-span-id-01"' in published_data


def test_publish_event_error_handling():
    """Test that publish_event handles errors appropriately."""
    topic = "task.deleted"
    data = {"task_id": "test-uuid"}

    mock_client = MagicMock()
    mock_client.publish_event.side_effect = Exception("Dapr unavailable")

    with patch('backend.src.events.publisher.DaprClient') as mock_dapr_class:
        mock_instance = MagicMock()
        mock_instance.publish_event.side_effect = Exception("Dapr unavailable")
        mock_dapr_class.return_value.__enter__.return_value = mock_instance

        # Should raise an exception
        with pytest.raises(Exception, match="Dapr unavailable"):
            publish_event(topic, data)