"""Tests for Comments API endpoints."""

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestPublicCommentsAPI:
    def test_list_comments(self, api_client, published_post):
        from apps.comments.models import Comment

        Comment.objects.create(
            post=published_post,
            author_name="Commenter",
            author_email="c@test.com",
            body="Great post!",
            is_approved=True,
            ip_hash="abc123",
        )
        response = api_client.get(f"/api/v1/posts/{published_post.slug}/comments/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1

    def test_unapproved_comments_hidden(self, api_client, published_post):
        from apps.comments.models import Comment

        Comment.objects.create(
            post=published_post,
            author_name="Spammer",
            author_email="s@test.com",
            body="Spam!",
            is_approved=False,
            ip_hash="xyz789",
        )
        response = api_client.get(f"/api/v1/posts/{published_post.slug}/comments/")
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 0

    def test_create_comment(self, api_client, published_post):
        response = api_client.post(
            f"/api/v1/posts/{published_post.slug}/comments/",
            {"author_name": "Reader", "author_email": "reader@test.com", "body": "Nice article!"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_create_comment_on_nonexistent_post(self, api_client):
        response = api_client.post(
            "/api/v1/posts/no-such-slug/comments/",
            {"author_name": "Reader", "author_email": "r@test.com", "body": "Hello"},
            format="json",
        )
        assert response.status_code == status.HTTP_404_NOT_FOUND


@pytest.mark.django_db
class TestAdminCommentsAPI:
    def test_list_all_comments(self, admin_client, published_post):
        from apps.comments.models import Comment

        Comment.objects.create(
            post=published_post,
            author_name="User",
            body="Comment",
            is_approved=False,
            ip_hash="hash",
        )
        response = admin_client.get("/api/v1/admin/comments/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 1

    def test_approve_comment(self, admin_client, published_post):
        from apps.comments.models import Comment

        comment = Comment.objects.create(
            post=published_post,
            author_name="Pending",
            body="Please approve",
            is_approved=False,
            ip_hash="hash",
        )
        response = admin_client.patch(
            f"/api/v1/admin/comments/{comment.id}/",
            {"is_approved": True},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        comment.refresh_from_db()
        assert comment.is_approved is True

    def test_delete_comment(self, admin_client, published_post):
        from apps.comments.models import Comment

        comment = Comment.objects.create(
            post=published_post,
            author_name="Delete Me",
            body="Spam",
            ip_hash="hash",
        )
        response = admin_client.delete(f"/api/v1/admin/comments/{comment.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_filter_pending_comments(self, admin_client, published_post):
        from apps.comments.models import Comment

        Comment.objects.create(post=published_post, author_name="A", body="Pending", is_approved=False, ip_hash="h1")
        Comment.objects.create(post=published_post, author_name="B", body="Approved", is_approved=True, ip_hash="h2")

        response = admin_client.get("/api/v1/admin/comments/?is_approved=false")
        assert response.status_code == status.HTTP_200_OK
        assert all(not c["is_approved"] for c in response.data["results"])
