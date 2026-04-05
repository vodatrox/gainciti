"""Workflow for publishing scheduled posts."""

from datetime import timedelta

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from temporal.activities.post_activities import publish_due_posts, query_due_posts


@workflow.defn
class PublishScheduledWorkflow:
    """Checks for posts due for publishing and publishes them."""

    @workflow.run
    async def run(self) -> str:
        # Query for posts that are due
        due_post_ids = await workflow.execute_activity(
            query_due_posts,
            start_to_close_timeout=timedelta(seconds=30),
        )

        if not due_post_ids:
            return "No posts due for publishing"

        # Publish each due post
        count = await workflow.execute_activity(
            publish_due_posts,
            due_post_ids,
            start_to_close_timeout=timedelta(seconds=60),
        )

        return f"Published {count} posts"
