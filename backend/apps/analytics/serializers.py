from rest_framework import serializers
from .models import AnalyticsSnapshot, PageView


class PageViewCreateSerializer(serializers.Serializer):
    path = serializers.CharField(max_length=500)
    referrer = serializers.URLField(required=False, allow_blank=True)
    session_id = serializers.CharField(max_length=64)


class AnalyticsSnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsSnapshot
        fields = ("id", "post", "date", "views", "unique_visitors", "avg_time_on_page", "bounce_rate")


class AnalyticsOverviewSerializer(serializers.Serializer):
    total_views = serializers.IntegerField()
    total_unique_visitors = serializers.IntegerField()
    avg_bounce_rate = serializers.FloatField(allow_null=True)
    total_posts = serializers.IntegerField()
    views_trend = serializers.ListField(child=serializers.DictField())
    top_posts = serializers.ListField(child=serializers.DictField())
