"""
Event subscription handler framework for Dapr pub/sub integration.
Handles incoming CloudEvents from Kafka topics.
"""

from fastapi import APIRouter, Request, BackgroundTasks
import json
import logging
from typing import List, Dict, Any
import uuid
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/dapr/subscribe")
async def dapr_subscribe():
    """
    Dapr subscription endpoint that tells Dapr which topics this service subscribes to.
    """
    # This should return a list of topics this service is interested in
    subscriptions = [
        {
            "pubsubname": "pubsub",
            "topic": "task.created",
            "route": "/events/task-created"
        },
        {
            "pubsubname": "pubsub",
            "topic": "task.updated",
            "route": "/events/task-updated"
        },
        {
            "pubsubname": "pubsub",
            "topic": "task.completed",
            "route": "/events/task-completed"
        },
        {
            "pubsubname": "pubsub",
            "topic": "task.deleted",
            "route": "/events/task-deleted"
        },
        {
            "pubsubname": "pubsub",
            "topic": "reminder.due",
            "route": "/events/reminder-due"
        },
        {
            "pubsubname": "pubsub",
            "topic": "notification.sent",
            "route": "/events/notification-sent"
        },
        {
            "pubsubname": "pubsub",
            "topic": "user.preference.changed",
            "route": "/events/user-preference-changed"
        }
    ]
    return subscriptions


@router.post("/events/task-created")
async def handle_task_created(request: Request):
    """
    Handle task.created event.
    If task has a due date, create a reminder based on user preferences.
    """
    try:
        # Parse the CloudEvent from the request
        cloudevent = await request.json()

        # Extract the actual data from the CloudEvent
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        due_date = event_data.get("due_date")

        # Only create reminders if task has a due date
        if due_date:
            logger.info(f"Task {task_id} has due date {due_date}, checking for reminder creation")

            from datetime import datetime
            from ..database import async_session_maker
            from ..services.reminder_service import get_user_preferences, create_reminder

            # Parse the due date
            due_datetime = datetime.fromisoformat(due_date.replace('Z', '+00:00'))

            async with async_session_maker() as session:
                # Get user preferences to determine reminder offset
                user_prefs = await get_user_preferences(session, uuid.UUID(user_id))

                # Default to 15 minutes before due date if no preference
                reminder_offset_minutes = 15
                if user_prefs:
                    reminder_offset_minutes = getattr(user_prefs, 'reminder_offset_minutes', 15)

                # Calculate reminder time (due date minus offset)
                reminder_time = due_datetime - timedelta(minutes=reminder_offset_minutes)

                # Only create reminder if it's in the future
                current_time = datetime.utcnow()
                if reminder_time > current_time:
                    logger.info(f"Creating reminder for task {task_id} at {reminder_time}")

                    try:
                        await create_reminder(
                            session=session,
                            task_id=uuid.UUID(task_id),
                            user_id=uuid.UUID(user_id),
                            reminder_time=reminder_time
                        )
                        await session.commit()
                        logger.info(f"Created reminder for task {task_id}")
                    except Exception as e:
                        logger.error(f"Failed to create reminder for task {task_id}: {e}")
                else:
                    logger.info(f"Not creating reminder for task {task_id} - reminder time would be in the past")

        logger.info(f"Task created: {event_data}")

        # Broadcast to user's WebSocket connections
        try:
            from ..api.websocket import registry
            await registry.broadcast_to_user(user_id, {
                "type": "task.created",
                "data": event_data,
                "timestamp": datetime.utcnow().isoformat()
            })
            logger.info(f"Broadcast task.created event to user {user_id}")
        except Exception as ws_error:
            logger.error(f"Failed to broadcast to WebSocket: {ws_error}")

        # Return 200 OK to acknowledge the event
        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling task.created event: {str(e)}")
        # Return 500 to indicate failure - Dapr will retry
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/task-updated")
async def handle_task_updated(request: Request):
    """
    Handle task.updated event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # Extract user_id from event data
        user_id = event_data.get("user_id")

        logger.info(f"Task updated: {event_data}")

        # Broadcast to user's WebSocket connections
        try:
            from ..api.websocket import registry
            await registry.broadcast_to_user(user_id, {
                "type": "task.updated",
                "data": event_data,
                "timestamp": datetime.utcnow().isoformat()
            })
            logger.info(f"Broadcast task.updated event to user {user_id}")
        except Exception as ws_error:
            logger.error(f"Failed to broadcast to WebSocket: {ws_error}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling task.updated event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/task-completed")
async def handle_task_completed(request: Request):
    """
    Handle task.completed event.
    Check if task has recurrence, and if so, create the next occurrence.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        title = event_data.get("title")
        completed_at = event_data.get("completed_at")

        logger.info(f"Task completed: {task_id} for user {user_id}")

        # Check if the task has recurrence
        from sqlmodel import select
        from ..models import Task
        from ..services.recurrence_service import calculate_next_due_date
        from ..resilience.circuit_breaker import AsyncCircuitBreaker
        from ..database import async_session_maker

        async with async_session_maker() as session:
            # Get the completed task details
            statement = select(Task).where(Task.id == task_id)
            result = await session.execute(statement)
            task = result.scalar_one_or_none()

            if task and task.recurrence_type != "none":
                logger.info(f"Task {task_id} has recurrence type {task.recurrence_type}, creating next occurrence")

                # Calculate next due date
                if task.due_date:
                    next_due_date = calculate_next_due_date(
                        task.due_date,
                        task.recurrence_type,
                        task.recurrence_interval
                    )
                else:
                    next_due_date = None

                # Import create_task here to avoid circular imports
                from ..services.task_service import create_task

                # Create circuit breaker for the recurring task creation
                circuit_breaker = AsyncCircuitBreaker(
                    name="recurring-task-creation",
                    max_failures=5,
                    reset_timeout=30,
                )

                async def _do_create():
                    return await create_task(
                        session=session,
                        user_id=task.user_id,
                        title=task.title,
                        priority=task.priority,
                        due_date=next_due_date,
                        recurrence_type=task.recurrence_type,
                        recurrence_interval=task.recurrence_interval,
                    )

                try:
                    next_task = await circuit_breaker.call(_do_create)
                    logger.info(f"Created next occurrence of recurring task: {next_task.id}")
                except Exception as cb_error:
                    logger.error(f"Failed to create recurring task: {cb_error}")
                    # Still return success to prevent Dapr from retrying this event

            # Cancel any pending reminders for this task
            from ..services.reminder_service import cancel_by_task
            cancelled_count = await cancel_by_task(session, uuid.UUID(task_id))
            if cancelled_count > 0:
                logger.info(f"Cancelled {cancelled_count} pending reminders for completed task {task_id}")

            # Check for milestone notifications (10, 25, 50, 100 tasks completed)
            # Count total completed tasks for the user
            completed_count_statement = select(Task).where(
                Task.user_id == uuid.UUID(user_id),
                Task.completed == True
            )
            completed_result = await session.execute(completed_count_statement)
            completed_tasks = completed_result.scalars().all()
            total_completed = len(completed_tasks)

            # Check if user reached a milestone
            milestones = [10, 25, 50, 100]
            for milestone in milestones:
                if total_completed == milestone:
                    # Publish milestone notification event
                    milestone_event_data = {
                        "user_id": user_id,
                        "milestone": milestone,
                        "notification_type": "milestone",
                        "message": f"Congratulations! You've completed {milestone} tasks!"
                    }

                    from ..events.publisher import publish_event
                    publish_event("notification.sent", milestone_event_data)
                    logger.info(f"Published milestone notification for user {user_id}, milestone: {milestone}")

            await session.commit()

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling task.completed event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/task-deleted")
async def handle_task_deleted(request: Request):
    """
    Handle task.deleted event.
    Cancel any pending reminders for the deleted task.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        title = event_data.get("title")

        logger.info(f"Task deleted: {task_id} for user {user_id}")

        # Cancel any pending reminders for this task
        from ..database import async_session_maker
        from ..services.reminder_service import cancel_by_task
        import uuid

        async with async_session_maker() as session:
            cancelled_count = await cancel_by_task(session, uuid.UUID(task_id))
            if cancelled_count > 0:
                logger.info(f"Cancelled {cancelled_count} pending reminders for deleted task {task_id}")
            await session.commit()

        logger.info(f"Task deleted: {event_data}")

        # Broadcast to user's WebSocket connections
        try:
            from ..api.websocket import registry
            await registry.broadcast_to_user(user_id, {
                "type": "task.deleted",
                "data": event_data,
                "timestamp": datetime.utcnow().isoformat()
            })
            logger.info(f"Broadcast task.deleted event to user {user_id}")
        except Exception as ws_error:
            logger.error(f"Failed to broadcast to WebSocket: {ws_error}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling task.deleted event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/reminder-due")
async def handle_reminder_due(request: Request):
    """
    Handle reminder.due event.
    Publish notification.sent event to trigger in-app notification.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        reminder_id = event_data.get("reminder_id")
        task_id = event_data.get("task_id")
        user_id = event_data.get("user_id")
        reminder_time = event_data.get("reminder_time")

        logger.info(f"Reminder due: {reminder_id} for task {task_id}, user {user_id}")

        # Import the publisher to send notification event
        from ..events.publisher import publish_event

        # Publish notification.sent event
        notification_event_data = {
            "reminder_id": reminder_id,
            "task_id": task_id,
            "user_id": user_id,
            "reminder_time": reminder_time,
            "notification_type": "reminder",
            "message": f"Reminder: Task '{event_data.get('task_title', 'Untitled')}' is due soon!"
        }

        publish_event("notification.sent", notification_event_data)

        logger.info(f"Published notification.sent event for reminder {reminder_id}")

        # Broadcast notification to user's WebSocket connections
        try:
            from ..api.websocket import registry
            await registry.broadcast_to_user(user_id, {
                "type": "notification.sent",
                "data": notification_event_data,
                "timestamp": datetime.utcnow().isoformat()
            })
            logger.info(f"Broadcast notification.sent event to user {user_id}")
        except Exception as ws_error:
            logger.error(f"Failed to broadcast notification to WebSocket: {ws_error}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling reminder.due event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/notification-sent")
async def handle_notification_sent(request: Request):
    """
    Handle notification.sent event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling notification sent event
        logger.info(f"Notification sent: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling notification.sent event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/user-preference-changed")
async def handle_user_preference_changed(request: Request):
    """
    Handle user.preference.changed event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling user preference changed event
        logger.info(f"User preference changed: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling user.preference.changed event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


# Additional handlers for other events mentioned in the subscription YAML
@router.post("/events/projection-updated")
async def handle_projection_updated(request: Request):
    """
    Handle projection.updated event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling projection updated event
        logger.info(f"Projection updated: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling projection.updated event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/operation-failed")
async def handle_operation_failed(request: Request):
    """
    Handle operation.failed event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling operation failed event
        logger.info(f"Operation failed: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling operation.failed event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/retry-scheduled")
async def handle_retry_scheduled(request: Request):
    """
    Handle retry.scheduled event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling retry scheduled event
        logger.info(f"Retry scheduled: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling retry.scheduled event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/retry-exhausted")
async def handle_retry_exhausted(request: Request):
    """
    Handle retry.exhausted event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling retry exhausted event
        logger.info(f"Retry exhausted: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling retry.exhausted event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/alert-triggered")
async def handle_alert_triggered(request: Request):
    """
    Handle alert.triggered event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling alert triggered event
        logger.info(f"Alert triggered: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling alert.triggered event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/scale-recommendation")
async def handle_scale_recommendation(request: Request):
    """
    Handle scale.recommendation event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling scale recommendation event
        logger.info(f"Scale recommendation: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling scale.recommendation event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/frontend-metrics")
async def handle_frontend_metrics(request: Request):
    """
    Handle frontend.metrics event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling frontend metrics event
        logger.info(f"Frontend metrics: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling frontend.metrics event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500


@router.post("/events/anomaly-detected")
async def handle_anomaly_detected(request: Request):
    """
    Handle anomaly.detected event.
    """
    try:
        cloudevent = await request.json()
        event_data = cloudevent.get("data", {})
        event_type = cloudevent.get("type", "")
        event_id = cloudevent.get("id", "")

        logger.info(f"Processing {event_type} event: {event_id}")

        # TODO: Implement actual logic for handling anomaly detected event
        logger.info(f"Anomaly detected: {event_data}")

        return {"status": "success", "event_id": event_id}

    except Exception as e:
        logger.error(f"Error handling anomaly.detected event: {str(e)}")
        return {"status": "error", "message": str(e)}, 500