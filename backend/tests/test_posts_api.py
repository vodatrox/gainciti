"""Tests for Posts API endpoints."""

import pytest
from rest_framework import status


@pytest.mark.django_db
class TestPublicPostsAPI:
    def test_list_published_posts(self, api_client, published_post):
        response = api_client.get("/api/v1/posts/")
        assert response.status_code == status.HTTP_200_OK

    def test_retrieve_post_by_slug(self, api_client, published_post):
        response = api_client.get(f"/api/v1/posts/{published_post.slug}/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == published_post.title

    def test_draft_not_visible_publicly(self, api_client, draft_post):
        response = api_client.get(f"/api/v1/posts/{draft_post.slug}/")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_featured_posts(self, api_client, published_post):
        from apps.posts.models import Post

        Post.objects.filter(id=published_post.id).update(is_featured=True)
        response = api_client.get("/api/v1/posts/featured/")
        assert response.status_code == status.HTTP_200_OK

    def test_trending_posts(self, api_client, published_post):
        response = api_client.get("/api/v1/posts/trending/")
        assert response.status_code == status.HTTP_200_OK

    def test_search_posts(self, api_client, published_post):
        response = api_client.get("/api/v1/posts/search/?q=test")
        assert response.status_code == status.HTTP_200_OK

    def test_autocomplete(self, api_client, published_post):
        response = api_client.get("/api/v1/posts/search/autocomplete/?q=Test")
        assert response.status_code == status.HTTP_200_OK


@pytest.mark.django_db
class TestAdminPostsAPI:
    def test_list_all_posts(self, admin_client, published_post, draft_post):
        response = admin_client.get("/api/v1/admin/posts/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["count"] >= 2

    def test_create_post(self, admin_client, category):
        response = admin_client.post(
            "/api/v1/admin/posts/",
            {
                "title": "New API Post",
                "body": {"type": "doc", "content": []},
                "category": category.id,
                "status": "draft",
            },
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["title"] == "New API Post"
        assert response.data["slug"] == "new-api-post"

    def test_update_post(self, admin_client, draft_post):
        response = admin_client.patch(
            f"/api/v1/admin/posts/{draft_post.id}/",
            {"title": "Updated Title"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.data["title"] == "Updated Title"

    def test_publish_action(self, admin_client, draft_post):
        response = admin_client.post(f"/api/v1/admin/posts/{draft_post.id}/publish/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "published"

    def test_unpublish_action(self, admin_client, published_post):
        response = admin_client.post(f"/api/v1/admin/posts/{published_post.id}/unpublish/")
        assert response.status_code == status.HTTP_200_OK
        assert response.data["status"] == "draft"

    def test_delete_post(self, admin_client, draft_post):
        response = admin_client.delete(f"/api/v1/admin/posts/{draft_post.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT

    def test_filter_by_status(self, admin_client, published_post, draft_post):
        response = admin_client.get("/api/v1/admin/posts/?status=draft")
        assert response.status_code == status.HTTP_200_OK
        slugs = [p["slug"] for p in response.data["results"]]
        assert draft_post.slug in slugs
        assert published_post.slug not in slugs

    def test_author_cannot_access_admin_posts(self, author_client, published_post):
        response = author_client.get("/api/v1/admin/posts/")
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_unauthenticated_cannot_access(self, api_client):
        response = api_client.get("/api/v1/admin/posts/")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED


@pytest.mark.django_db
class TestCategoriesAPI:
    def test_public_list_categories(self, api_client, category):
        response = api_client.get("/api/v1/categories/")
        assert response.status_code == status.HTTP_200_OK

    def test_admin_create_category(self, admin_client):
        response = admin_client.post(
            "/api/v1/admin/categories/",
            {"name": "Finance", "slug": "finance", "color": "#10B981"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_admin_update_category(self, admin_client, category):
        response = admin_client.patch(
            f"/api/v1/admin/categories/{category.id}/",
            {"name": "Tech Updated"},
            format="json",
        )
        assert response.status_code == status.HTTP_200_OK

    def test_admin_delete_category(self, admin_client, db):
        from apps.posts.models import Category

        cat = Category.objects.create(name="Temp", slug="temp")
        response = admin_client.delete(f"/api/v1/admin/categories/{cat.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT


@pytest.mark.django_db
class TestTagsAPI:
    def test_public_list_tags(self, api_client, tag):
        response = api_client.get("/api/v1/tags/")
        assert response.status_code == status.HTTP_200_OK

    def test_admin_create_tag(self, admin_client):
        response = admin_client.post(
            "/api/v1/admin/tags/",
            {"name": "Django", "slug": "django"},
            format="json",
        )
        assert response.status_code == status.HTTP_201_CREATED

    def test_admin_delete_tag(self, admin_client, tag):
        response = admin_client.delete(f"/api/v1/admin/tags/{tag.id}/")
        assert response.status_code == status.HTTP_204_NO_CONTENT
