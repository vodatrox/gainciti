from django.db import models
from apps.posts.models import Post


class PageView(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name="page_views")
    path = models.CharField(max_length=500)
    session_id = models.CharField(max_length=64)
    referrer = models.URLField(blank=True)
    user_agent = models.TextField(blank=True)
    ip_hash = models.CharField(max_length=64)
    country = models.CharField(max_length=2, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["post", "-created_at"]),
            models.Index(fields=["session_id"]),
        ]

    def __str__(self):
        return f"{self.path} - {self.created_at}"


class AnalyticsSnapshot(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, null=True, blank=True, related_name="analytics_snapshots")
    date = models.DateField()
    views = models.PositiveIntegerField(default=0)
    unique_visitors = models.PositiveIntegerField(default=0)
    avg_time_on_page = models.FloatField(null=True, blank=True)
    bounce_rate = models.FloatField(null=True, blank=True)

    class Meta:
        unique_together = ("post", "date")
        ordering = ["-date"]

    def __str__(self):
        label = self.post.title if self.post else "Site-wide"
        return f"{label} - {self.date}"
