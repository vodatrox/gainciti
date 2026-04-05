"""Tests for authentication endpoints."""

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestLogin:
    def test_login_success(self, api_client, admin_user):
        response = api_client.post(
            "/api/v1/auth/login/",
            {"email": "admin@gainciti.com", "password": "testpass123"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["user"]["email"] == "admin@gainciti.com"

    def test_login_wrong_password(self, api_client, admin_user):
        response = api_client.post(
            "/api/v1/auth/login/",
            {"email": "admin@gainciti.com", "password": "wrongpass"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, api_client):
        response = api_client.post(
            "/api/v1/auth/login/",
            {"email": "nobody@gainciti.com", "password": "testpass123"},
            format="json",
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_inactive_user(self, api_client, db):
        from apps.accounts.models import User

        user = User.objects.create_user(
            email="inactive@gainciti.com",
            password="testpass123",
            first_name="X",
            last_name="Y",
            is_active=False,
        )
        response = api_client.post(
            "/api/v1/auth/login/",
            {"email": "inactive@gainciti.com", "password": "testpass123"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
class TestLogout:
    def test_logout_success(self, admin_client, admin_user):
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(admin_user)
        response = admin_client.post(
            "/api/v1/auth/logout/",
            {"refresh": str(refresh)},
            format="json",
        )
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_logout_unauthenticated(self, api_client):
        response = api_client.post("/api/v1/auth/logout/", {}, format="json")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestTokenRefresh:
    def test_refresh_token(self, api_client, admin_user):
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = RefreshToken.for_user(admin_user)
        response = api_client.post(
            "/api/v1/auth/refresh/",
            {"refresh": str(refresh)},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert "access" in response.data


@pytest.mark.django_db
class TestUsersMe:
    def test_me_authenticated(self, admin_client, admin_user):
        response = admin_client.get("/api/v1/admin/users/me/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["email"] == admin_user.email

    def test_me_unauthenticated(self, api_client):
        response = api_client.get("/api/v1/admin/users/me/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
