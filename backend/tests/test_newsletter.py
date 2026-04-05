"""Tests for Newsletter API endpoints and service."""

import pytest
from rest_framework import status

from apps.newsletters.models import Subscriber
from apps.newsletters.services import NewsletterService


@pytest.mark.django_db
class TestNewsletterService:
    def test_subscribe(self):
        subscriber = NewsletterService.subscribe("test@example.com")
        assert subscriber.email == "test@example.com"
        assert subscriber.is_confirmed is False
        assert subscriber.confirmation_token != ""

    def test_subscribe_duplicate(self):
        NewsletterService.subscribe("dup@example.com")
        subscriber = NewsletterService.subscribe("dup@example.com")
        assert Subscriber.objects.filter(email="dup@example.com").count() == 1

    def test_confirm(self):
        subscriber = NewsletterService.subscribe("confirm@example.com")
        token = subscriber.confirmation_token
        result = NewsletterService.confirm(token)
        assert result is True
        subscriber.refresh_from_db()
        assert subscriber.is_confirmed is True

    def test_confirm_invalid_token(self):
        result = NewsletterService.confirm("invalid-token")
        assert result is False

    def test_unsubscribe(self):
        subscriber = NewsletterService.subscribe("unsub@example.com")
        subscriber.is_confirmed = True
        subscriber.save()
        result = NewsletterService.unsubscribe("unsub@example.com")
        assert result is True
        subscriber.refresh_from_db()
        assert subscriber.unsubscribed_at is not None

    def test_unsubscribe_nonexistent(self):
        result = NewsletterService.unsubscribe("nobody@example.com")
        assert result is False

    def test_resubscribe(self):
        subscriber = NewsletterService.subscribe("resub@example.com")
        subscriber.is_confirmed = True
        subscriber.save()
        NewsletterService.unsubscribe("resub@example.com")
        resubbed = NewsletterService.subscribe("resub@example.com")
        assert resubbed.unsubscribed_at is None
        assert resubbed.is_confirmed is False


@pytest.mark.django_db
class TestNewsletterAPI:
    def test_subscribe_endpoint(self, api_client):
        response = api_client.post(
            "/api/v1/newsletter/subscribe/",
            {"email": "new@example.com"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_confirm_endpoint(self, api_client):
        subscriber = NewsletterService.subscribe("confirm-api@example.com")
        response = api_client.get(
            f"/api/v1/newsletter/confirm/{subscriber.confirmation_token}/"
        )
        assert response.status_code == status.HTTP_200_OK

    def test_unsubscribe_endpoint(self, api_client):
        subscriber = NewsletterService.subscribe("unsub-api@example.com")
        subscriber.is_confirmed = True
        subscriber.save()
        response = api_client.post(
            "/api/v1/newsletter/unsubscribe/",
            {"email": "unsub-api@example.com"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestAdminNewsletterAPI:
    def test_list_subscribers(self, admin_client):
        Subscriber.objects.create(email="s1@test.com", is_confirmed=True)
        response = admin_client.get("/api/v1/admin/newsletter/subscribers/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1

    def test_create_campaign(self, admin_client):
        response = admin_client.post(
            "/api/v1/admin/newsletter/campaigns/",
            {"subject": "Test Campaign", "body_html": "<p>Hello</p>"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["status"] == "draft"

    def test_send_campaign(self, admin_client):
        from apps.newsletters.models import Campaign
        from apps.accounts.models import User

        user = User.objects.get(email="admin@gainciti.com")
        campaign = Campaign.objects.create(
            subject="Send Test",
            body_html="<p>Newsletter</p>",
            created_by=user,
        )
        response = admin_client.post(
            f"/api/v1/admin/newsletter/campaigns/{campaign.id}/send/"
        )
        assert response.status_code == status.HTTP_200_OK
        campaign.refresh_from_db()
        assert campaign.status == "sending"

    def test_cannot_send_already_sent(self, admin_client, admin_user):
        from apps.newsletters.models import Campaign

        campaign = Campaign.objects.create(
            subject="Already Sent",
            body_html="<p>Old</p>",
            created_by=admin_user,
            status=Campaign.Status.SENT,
        )
        response = admin_client.post(
            f"/api/v1/admin/newsletter/campaigns/{campaign.id}/send/"
        )
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_author_cannot_access_subscribers(self, author_client):
        response = author_client.get("/api/v1/admin/newsletter/subscribers/")
        assert response.status_code == status.HTTP_403_FORBIDDEN
