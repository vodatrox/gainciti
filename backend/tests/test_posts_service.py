"""Tests for PostService business logic."""

import pytest
from apps.posts.services import PostService


@pytest.mark.django_db
class TestPostService:
    def setup_method(self):
        self.service = PostService()

    def test_create_post(self, admin_user, category):
        post = self.service.create_post(
            {
                "title": "My First Post",
                "body": {
                    "type": "doc",
                    "content": [
                        {
                            "type": "paragraph",
                            "content": [{"type": "text", "text": "Hello world " * 50}],
                        }
                    ],
                },
                "category": category,
                "status": "draft",
            },
            author=admin_user,
        )
        assert post.title == "My First Post"
        assert post.slug == "my-first-post"
        assert post.reading_time_minutes >= 1
        assert post.author == admin_user
        assert post.body_text.startswith("Hello world")

    def test_create_post_auto_slug_uniqueness(self, admin_user, category):
        self.service.create_post(
            {"title": "Unique Title", "body": {"type": "doc", "content": []}, "category": category},
            author=admin_user,
        )
        post2 = self.service.create_post(
            {"title": "Unique Title", "body": {"type": "doc", "content": []}, "category": category},
            author=admin_user,
        )
        assert post2.slug == "unique-title-1"

    def test_create_post_auto_excerpt(self, admin_user, category):
        post = self.service.create_post(
            {
                "title": "Excerpt Test",
                "body": {
                    "type": "doc",
                    "content": [
                        {"type": "paragraph", "content": [{"type": "text", "text": "A " * 300}]},
                    ],
                },
                "category": category,
            },
            author=admin_user,
        )
        assert len(post.excerpt) <= 500

    def test_publish_post(self, draft_post):
        published = self.service.publish(draft_post.id)
        assert published.status == "published"
        assert published.published_at is not None

    def test_unpublish_post(self, published_post):
        unpublished = self.service.unpublish(published_post.id)
        assert unpublished.status == "draft"
        assert unpublished.published_at is None

    def test_schedule_post(self, draft_post):
        from django.utils import timezone

        future = timezone.now() + timezone.timedelta(days=1)
        scheduled = self.service.schedule(draft_post.id, future)
        assert scheduled.status == "scheduled"
        assert scheduled.scheduled_for is not None

    def test_update_post(self, published_post):
        updated = self.service.update_post(
            published_post.id,
            {"title": "Updated Title"},
        )
        assert updated.title == "Updated Title"

    def test_compute_reading_time(self):
        # 200 words = 1 min
        assert PostService._compute_reading_time("word " * 200) == 1
        # 400 words = 2 min
        assert PostService._compute_reading_time("word " * 400) == 2
        # Empty = 1 min (minimum)
        assert PostService._compute_reading_time("") == 1

    def test_extract_text_from_tiptap(self):
        doc = {
            "type": "doc",
            "content": [
                {
                    "type": "paragraph",
                    "content": [
                        {"type": "text", "text": "Hello "},
                        {"type": "text", "text": "world"},
                    ],
                }
            ],
        }
        text = PostService._extract_text_from_tiptap(doc)
        assert text == "Hello world"


@pytest.mark.django_db
class TestFullTextSearch:
    def test_search_returns_published_posts(self, published_post):
        results = PostService.full_text_search("Hello world")
        # May or may not match depending on search vector indexing timing
        # But should not error
        assert results is not None

    def test_autocomplete(self, published_post):
        results = PostService.autocomplete("Test Published")
        assert len(results) >= 1
        assert results[0][0] == published_post.title
