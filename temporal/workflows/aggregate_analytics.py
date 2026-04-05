"""Workflow for aggregating daily analytics."""

from datetime import timedelta

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from temporal.activities.analytics_activities import aggregate_daily_analytics


@workflow.defn
class AggregateAnalyticsWorkflow:
    """Runs daily to aggregate page views into snapshots."""

    @workflow.run
    async def run(self) -> str:
        result = await workflow.execute_activity(
            aggregate_daily_analytics,
            start_to_close_timeout=timedelta(minutes=10),
        )
        return result
