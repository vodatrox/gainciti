"""Tests for Users admin API."""

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestAdminUsersAPI:
    def test_list_users(self, admin_client, admin_user):
        response = admin_client.get("/api/v1/admin/users/")
        assert response.status_code == status.HTTP_200_OK

    def test_create_user(self, admin_client):
        response = admin_client.post(
            "/api/v1/admin/users/",
            {
                "email": "newauthor@gainciti.com",
                "first_name": "New",
                "last_name": "Author",
                "password": "securepass123",
                "role": "author",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["email"] == "newauthor@gainciti.com"
        assert response.data["role"] == "author"

    def test_update_user_role(self, admin_client, author_user):
        response = admin_client.patch(
            f"/api/v1/admin/users/{author_user.id}/",
            {"role": "editor"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        author_user.refresh_from_db()
        assert author_user.role == "editor"

    def test_editor_cannot_manage_users(self, editor_client):
        response = editor_client.get("/api/v1/admin/users/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_author_cannot_manage_users(self, author_client):
        response = author_client.post(
            "/api/v1/admin/users/",
            {"email": "hack@test.com", "password": "pass1234", "first_name": "X", "last_name": "Y"},
            format="json",
        )
        assert response.status_code == status.HTTP_403_FORBIDDEN
