"""Temporal worker entrypoint."""

import asyncio
import os
from concurrent.futures import ThreadPoolExecutor

import django

# Initialize Django before importing any models
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
django.setup()

from temporalio.client import Client
from temporalio.worker import Worker

from temporal.config import TEMPORAL_HOST, TEMPORAL_NAMESPACE, TEMPORAL_TASK_QUEUE
from temporal.workflows.publish_scheduled import PublishScheduledWorkflow
from temporal.workflows.aggregate_analytics import AggregateAnalyticsWorkflow
from temporal.workflows.send_newsletter import SendNewsletterWorkflow
from temporal.workflows.process_image import ProcessImageWorkflow
from temporal.activities.post_activities import publish_due_posts, query_due_posts
from temporal.activities.analytics_activities import aggregate_daily_analytics
from temporal.activities.newsletter_activities import (
    fetch_campaign_data,
    mark_campaign_sent,
    send_email_batch,
)
from temporal.activities.image_activities import (
    convert_to_webp,
    generate_thumbnail,
    update_media_dimensions,
    validate_image,
)


async def connect_with_retry(host: str, namespace: str, max_retries: int = 30, base_delay: float = 2.0) -> Client:
    """Connect to Temporal server with exponential backoff."""
    for attempt in range(1, max_retries + 1):
        try:
            client = await Client.connect(host, namespace=namespace)
            print(f"Connected to Temporal server at {host}")
            return client
        except Exception as e:
            if attempt == max_retries:
                raise
            delay = min(base_delay * (2 ** (attempt - 1)), 30)
            print(f"Temporal not ready (attempt {attempt}/{max_retries}): {e}")
            print(f"Retrying in {delay:.0f}s...")
            await asyncio.sleep(delay)


async def main():
    client = await connect_with_retry(TEMPORAL_HOST, TEMPORAL_NAMESPACE)

    worker = Worker(
        client,
        task_queue=TEMPORAL_TASK_QUEUE,
        activity_executor=ThreadPoolExecutor(max_workers=10),
        workflows=[
            PublishScheduledWorkflow,
            AggregateAnalyticsWorkflow,
            SendNewsletterWorkflow,
            ProcessImageWorkflow,
        ],
        activities=[
            # Post activities
            publish_due_posts,
            query_due_posts,
            # Analytics activities
            aggregate_daily_analytics,
            # Newsletter activities
            fetch_campaign_data,
            send_email_batch,
            mark_campaign_sent,
            # Image processing activities
            validate_image,
            generate_thumbnail,
            convert_to_webp,
            update_media_dimensions,
        ],
    )

    print(f"Starting Temporal worker on queue: {TEMPORAL_TASK_QUEUE}")
    await worker.run()


if __name__ == "__main__":
    asyncio.run(main())
