"""Schedule cron-based Temporal workflows.

Run once (or at startup) to register the recurring schedules:
  python -m temporal.schedule_workflows
"""

import asyncio
import os
from datetime import timedelta

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
django.setup()

from temporalio.client import Client, Schedule, ScheduleActionStartWorkflow, ScheduleSpec, ScheduleIntervalSpec

from temporal.config import TEMPORAL_HOST, TEMPORAL_NAMESPACE, TEMPORAL_TASK_QUEUE


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

    # Schedule: Publish scheduled posts — every minute
    try:
        await client.create_schedule(
            id="publish-scheduled-posts",
            schedule=Schedule(
                action=ScheduleActionStartWorkflow(
                    "PublishScheduledWorkflow",
                    id="publish-scheduled",
                    task_queue=TEMPORAL_TASK_QUEUE,
                ),
                spec=ScheduleSpec(
                    intervals=[ScheduleIntervalSpec(every=timedelta(seconds=60))],
                ),
            ),
        )
        print("Created schedule: publish-scheduled-posts (every 1 minute)")
    except Exception as e:
        if "already" in str(e).lower() or "ScheduleAlreadyRunningError" in type(e).__name__:
            print("Schedule publish-scheduled-posts already exists, skipping")
        else:
            raise

    # Schedule: Aggregate analytics — daily at 2:00 AM UTC
    try:
        from temporalio.client import ScheduleCalendarSpec, ScheduleRange

        await client.create_schedule(
            id="aggregate-analytics-daily",
            schedule=Schedule(
                action=ScheduleActionStartWorkflow(
                    "AggregateAnalyticsWorkflow",
                    id="aggregate-analytics",
                    task_queue=TEMPORAL_TASK_QUEUE,
                ),
                spec=ScheduleSpec(
                    calendars=[
                        ScheduleCalendarSpec(
                            hour=[ScheduleRange(start=2)],
                            minute=[ScheduleRange(start=0)],
                        ),
                    ],
                ),
            ),
        )
        print("Created schedule: aggregate-analytics-daily (daily at 2:00 AM UTC)")
    except Exception as e:
        if "already" in str(e).lower() or "ScheduleAlreadyRunningError" in type(e).__name__:
            print("Schedule aggregate-analytics-daily already exists, skipping")
        else:
            raise

    print("All schedules registered.")


if __name__ == "__main__":
    asyncio.run(main())
