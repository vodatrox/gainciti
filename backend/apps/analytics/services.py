import hashlib
from datetime import timedelta

from django.db.models import Avg, Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.posts.models import Post
from .models import AnalyticsSnapshot, PageView


class AnalyticsService:
    @staticmethod
    def record_page_view(data: dict, request) -> PageView:
        ip = request.META.get("REMOTE_ADDR", "")
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()
        user_agent = request.META.get("HTTP_USER_AGENT", "")

        # Try to link to a post
        post = None
        path = data.get("path", "")
        if "/posts/" in path:
            slug = path.rstrip("/").split("/")[-1]
            try:
                post = Post.objects.get(slug=slug, status=Post.Status.PUBLISHED)
            except Post.DoesNotExist:
                pass

        return PageView.objects.create(
            post=post,
            path=path,
            session_id=data.get("session_id", ""),
            referrer=data.get("referrer", ""),
            user_agent=user_agent,
            ip_hash=ip_hash,
        )

    @staticmethod
    def get_overview(date_from=None, date_to=None) -> dict:
        if not date_to:
            date_to = timezone.now().date()
        if not date_from:
            date_from = date_to - timedelta(days=30)

        snapshots = AnalyticsSnapshot.objects.filter(
            date__gte=date_from,
            date__lte=date_to,
            post__isnull=True,
        )

        agg = snapshots.aggregate(
            total_views=Sum("views"),
            total_unique_visitors=Sum("unique_visitors"),
            avg_bounce_rate=Avg("bounce_rate"),
        )

        views_trend = list(
            AnalyticsSnapshot.objects.filter(
                date__gte=date_from,
                date__lte=date_to,
                post__isnull=True,
            )
            .order_by("date")
            .values("date", "views", "unique_visitors")
        )

        top_posts = list(
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .order_by("-view_count")[:5]
            .values("id", "title", "slug", "view_count")
        )

        return {
            "total_views": agg["total_views"] or 0,
            "total_unique_visitors": agg["total_unique_visitors"] or 0,
            "avg_bounce_rate": agg["avg_bounce_rate"],
            "total_posts": Post.objects.filter(status=Post.Status.PUBLISHED).count(),
            "views_trend": views_trend,
            "top_posts": top_posts,
        }

    @staticmethod
    def get_post_analytics(post_id, date_from=None, date_to=None):
        if not date_to:
            date_to = timezone.now().date()
        if not date_from:
            date_from = date_to - timedelta(days=30)

        return list(
            AnalyticsSnapshot.objects.filter(
                post_id=post_id,
                date__gte=date_from,
                date__lte=date_to,
            )
            .order_by("date")
            .values("date", "views", "unique_visitors", "avg_time_on_page", "bounce_rate")
        )
