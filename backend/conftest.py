"""Root conftest.py with shared fixtures."""

import pytest
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def admin_user(db):
    from apps.accounts.models import User

    return User.objects.create_user(
        email="admin@gainciti.com",
        password="testpass123",
        first_name="Admin",
        last_name="User",
        role="admin",
        is_staff=True,
    )


@pytest.fixture
def editor_user(db):
    from apps.accounts.models import User

    return User.objects.create_user(
        email="editor@gainciti.com",
        password="testpass123",
        first_name="Editor",
        last_name="User",
        role="editor",
    )


@pytest.fixture
def author_user(db):
    from apps.accounts.models import User

    return User.objects.create_user(
        email="author@gainciti.com",
        password="testpass123",
        first_name="Author",
        last_name="User",
        role="author",
    )


@pytest.fixture
def admin_client(api_client, admin_user):
    token = RefreshToken.for_user(admin_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    return api_client


@pytest.fixture
def editor_client(api_client, editor_user):
    token = RefreshToken.for_user(editor_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    return api_client


@pytest.fixture
def author_client(api_client, author_user):
    token = RefreshToken.for_user(author_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    return api_client


@pytest.fixture
def category(db):
    from apps.posts.models import Category

    return Category.objects.create(
        name="Technology",
        slug="technology",
        description="Tech articles",
        color="#3B82F6",
    )


@pytest.fixture
def tag(db):
    from apps.posts.models import Tag

    return Tag.objects.create(name="Python", slug="python")


@pytest.fixture
def published_post(db, admin_user, category):
    from django.utils import timezone
    from apps.posts.models import Post

    return Post.objects.create(
        title="Test Published Post",
        slug="test-published-post",
        excerpt="A test excerpt",
        body={"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Hello world " * 50}]}]},
        body_text="Hello world " * 50,
        author=admin_user,
        category=category,
        status=Post.Status.PUBLISHED,
        published_at=timezone.now(),
    )


@pytest.fixture
def draft_post(db, admin_user, category):
    from apps.posts.models import Post

    return Post.objects.create(
        title="Test Draft Post",
        slug="test-draft-post",
        body={"type": "doc", "content": []},
        body_text="",
        author=admin_user,
        category=category,
        status=Post.Status.DRAFT,
    )
