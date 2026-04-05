"""Post-related Temporal activities."""

from temporalio import activity


@activity.defn
def query_due_posts() -> list[str]:
    """Find posts that are scheduled and due for publishing."""
    from django.utils import timezone
    from apps.posts.models import Post

    due_posts = Post.objects.filter(
        status=Post.Status.SCHEDULED,
        scheduled_for__lte=timezone.now(),
    ).values_list("id", flat=True)

    return [str(pid) for pid in due_posts]


@activity.defn
def publish_due_posts(post_ids: list[str]) -> int:
    """Publish a list of posts by ID."""
    from django.utils import timezone
    from apps.posts.models import Post

    count = Post.objects.filter(id__in=post_ids).update(
        status=Post.Status.PUBLISHED,
        published_at=timezone.now(),
    )
    return count
