from django.contrib import admin
from .models import AnalyticsSnapshot, PageView


@admin.register(PageView)
class PageViewAdmin(admin.ModelAdmin):
    list_display = ("path", "session_id", "created_at")
    list_filter = ("created_at",)


@admin.register(AnalyticsSnapshot)
class AnalyticsSnapshotAdmin(admin.ModelAdmin):
    list_display = ("post", "date", "views", "unique_visitors")
    list_filter = ("date",)
