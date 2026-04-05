"""Workflow for processing uploaded images."""

from datetime import timedelta

from temporalio import workflow

with workflow.unsafe.imports_passed_through():
    from temporal.activities.image_activities import (
        convert_to_webp,
        generate_thumbnail,
        update_media_dimensions,
        validate_image,
    )


@workflow.defn
class ProcessImageWorkflow:
    """Processes an uploaded image: validate, thumbnail, WebP conversion."""

    @workflow.run
    async def run(self, media_asset_id: str) -> str:
        # Step 1: Validate
        validation = await workflow.execute_activity(
            validate_image,
            media_asset_id,
            start_to_close_timeout=timedelta(seconds=30),
        )

        if not validation.get("valid"):
            return f"Skipped: {validation.get('reason', 'invalid image')}"

        # Step 2: Generate thumbnail
        thumbnail_path = await workflow.execute_activity(
            generate_thumbnail,
            media_asset_id,
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=workflow.RetryPolicy(maximum_attempts=2),
        )

        # Step 3: Convert to WebP
        webp_path = await workflow.execute_activity(
            convert_to_webp,
            media_asset_id,
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=workflow.RetryPolicy(maximum_attempts=2),
        )

        # Step 4: Update dimensions (re-read after conversion)
        await workflow.execute_activity(
            update_media_dimensions,
            media_asset_id,
            start_to_close_timeout=timedelta(seconds=15),
        )

        parts = []
        if thumbnail_path:
            parts.append(f"thumbnail={thumbnail_path}")
        if webp_path:
            parts.append(f"webp={webp_path}")

        return f"Processed {media_asset_id}: {', '.join(parts) or 'no changes'}"
