"""Analytics-related Temporal activities."""

from temporalio import activity


@activity.defn
def aggregate_daily_analytics() -> str:
    """Aggregate yesterday's page views into analytics snapshots."""
    from datetime import timedelta

    from django.db.models import Count
    from django.utils import timezone

    from apps.analytics.models import AnalyticsSnapshot, PageView
    from apps.posts.models import Post

    yesterday = (timezone.now() - timedelta(days=1)).date()

    # Site-wide snapshot
    site_views = PageView.objects.filter(created_at__date=yesterday)
    site_total = site_views.count()
    site_unique = site_views.values("session_id").distinct().count()

    AnalyticsSnapshot.objects.update_or_create(
        post=None,
        date=yesterday,
        defaults={
            "views": site_total,
            "unique_visitors": site_unique,
        },
    )

    # Per-post snapshots
    post_stats = (
        site_views.filter(post__isnull=False)
        .values("post")
        .annotate(
            views=Count("id"),
            unique_visitors=Count("session_id", distinct=True),
        )
    )

    for stat in post_stats:
        AnalyticsSnapshot.objects.update_or_create(
            post_id=stat["post"],
            date=yesterday,
            defaults={
                "views": stat["views"],
                "unique_visitors": stat["unique_visitors"],
            },
        )

    # Update denormalized view_count on posts
    for stat in post_stats:
        Post.objects.filter(id=stat["post"]).update(
            view_count=PageView.objects.filter(post_id=stat["post"]).count()
        )

    return f"Aggregated {yesterday}: {site_total} views, {len(post_stats)} posts"
