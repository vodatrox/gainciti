"""Tests for Analytics API and service."""

import pytest
from rest_framework import status

from apps.analytics.services import AnalyticsService


@pytest.mark.django_db
class TestAnalyticsService:
    def test_record_page_view(self, published_post):
        from unittest.mock import MagicMock

        request = MagicMock()
        request.META = {"REMOTE_ADDR": "127.0.0.1", "HTTP_USER_AGENT": "TestAgent"}

        pv = AnalyticsService.record_page_view(
            {"path": f"/posts/{published_post.slug}", "session_id": "sess1"},
            request,
        )
        assert pv.post == published_post
        assert pv.session_id == "sess1"

    def test_record_page_view_no_post(self):
        from unittest.mock import MagicMock

        request = MagicMock()
        request.META = {"REMOTE_ADDR": "127.0.0.1", "HTTP_USER_AGENT": "TestAgent"}

        pv = AnalyticsService.record_page_view(
            {"path": "/about", "session_id": "sess2"},
            request,
        )
        assert pv.post is None

    def test_get_overview(self, published_post):
        overview = AnalyticsService.get_overview()
        assert "total_views" in overview
        assert "total_unique_visitors" in overview
        assert "views_trend" in overview
        assert "top_posts" in overview
        assert "total_posts" in overview

    def test_get_post_analytics(self, published_post):
        data = AnalyticsService.get_post_analytics(published_post.id)
        assert isinstance(data, list)


@pytest.mark.django_db
class TestAnalyticsAPI:
    def test_event_ingestion(self, api_client):
        response = api_client.post(
            "/api/v1/analytics/event/",
            {"path": "/posts/test", "session_id": "abc123"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_admin_overview(self, admin_client):
        response = admin_client.get("/api/v1/admin/analytics/overview/")
        assert response.status_code == status.HTTP_200_OK
        assert "total_views" in response.data

    def test_admin_overview_with_date_range(self, admin_client):
        response = admin_client.get(
            "/api/v1/admin/analytics/overview/?date_from=2024-01-01&date_to=2024-12-31"
        )
        assert response.status_code == status.HTTP_200_OK

    def test_admin_post_analytics(self, admin_client, published_post):
        response = admin_client.get(
            f"/api/v1/admin/analytics/posts/{published_post.id}/"
        )
        assert response.status_code == status.HTTP_200_OK

    def test_overview_requires_auth(self, api_client):
        response = api_client.get("/api/v1/admin/analytics/overview/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_overview_requires_admin(self, author_client):
        response = author_client.get("/api/v1/admin/analytics/overview/")
        assert response.status_code == status.HTTP_403_FORBIDDEN
