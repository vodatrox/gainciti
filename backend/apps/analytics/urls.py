from django.urls import path
from .views import AnalyticsOverviewView, EventIngestionView, PostAnalyticsView

urlpatterns = [
    path("analytics/event/", EventIngestionView.as_view(), name="analytics-event"),
    path("admin/analytics/overview/", AnalyticsOverviewView.as_view(), name="analytics-overview"),
    path("admin/analytics/posts/<uuid:post_id>/", PostAnalyticsView.as_view(), name="analytics-post"),
]
