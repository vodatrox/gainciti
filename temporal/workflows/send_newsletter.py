"""Workflow for sending newsletter campaigns."""

from datetime import timedelta

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from temporal.activities.newsletter_activities import (
        EmailPayload,
        fetch_campaign_data,
        mark_campaign_sent,
        send_email_batch,
    )

BATCH_SIZE = 50


@workflow.defn
class SendNewsletterWorkflow:
    """Fans out newsletter sending to subscribers in batches."""

    @workflow.run
    async def run(self, campaign_id: str) -> str:
        # Fetch campaign data and subscriber list
        data = await workflow.execute_activity(
            fetch_campaign_data,
            campaign_id,
            start_to_close_timeout=timedelta(seconds=30),
        )

        emails = data["subscriber_emails"]
        if not emails:
            await workflow.execute_activity(
                mark_campaign_sent,
                campaign_id,
                start_to_close_timeout=timedelta(seconds=15),
            )
            return "No confirmed subscribers to send to"

        total_sent = 0
        total_failed = 0

        # Process in batches
        for i in range(0, len(emails), BATCH_SIZE):
            batch = emails[i : i + BATCH_SIZE]
            payload = EmailPayload(
                campaign_id=campaign_id,
                subscriber_emails=batch,
                subject=data["subject"],
                body_html=data["body_html"],
            )

            result = await workflow.execute_activity(
                send_email_batch,
                payload,
                start_to_close_timeout=timedelta(minutes=5),
                retry_policy=workflow.RetryPolicy(
                    maximum_attempts=3,
                    initial_interval=timedelta(seconds=10),
                ),
            )

            total_sent += result["sent"]
            total_failed += result["failed"]

        # Mark campaign as sent
        await workflow.execute_activity(
            mark_campaign_sent,
            campaign_id,
            start_to_close_timeout=timedelta(seconds=15),
        )

        return f"Campaign sent: {total_sent} delivered, {total_failed} failed"
