import math
import re
from django.contrib.postgres.search import SearchQuery, SearchRank, SearchVector
from django.utils import timezone
from django.utils.text import slugify

from .models import Post
from .repositories import PostRepository


class PostService:
    def __init__(self):
        self.repo = PostRepository()

    @staticmethod
    def _compute_reading_time(text: str) -> int:
        word_count = len(text.split())
        return max(1, math.ceil(word_count / 200))

    @staticmethod
    def _extract_text_from_tiptap(body: dict) -> str:
        """Extract plain text from TipTap JSON document."""
        texts = []

        def walk(node):
            if isinstance(node, dict):
                if "text" in node:
                    texts.append(node["text"])
                for child in node.get("content", []):
                    walk(child)
            elif isinstance(node, list):
                for item in node:
                    walk(item)

        walk(body)
        return " ".join(texts)

    @staticmethod
    def _generate_unique_slug(title: str, exclude_id=None) -> str:
        base_slug = slugify(title)[:250]
        slug = base_slug
        counter = 1
        queryset = Post.objects.all()
        if exclude_id:
            queryset = queryset.exclude(id=exclude_id)
        while queryset.filter(slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug

    def create_post(self, data: dict, author) -> Post:
        body = data.get("body", {})
        body_text = self._extract_text_from_tiptap(body)
        reading_time = self._compute_reading_time(body_text)

        if not data.get("slug"):
            data["slug"] = self._generate_unique_slug(data["title"])

        if not data.get("excerpt") and body_text:
            data["excerpt"] = body_text[:497] + "..." if len(body_text) > 500 else body_text

        post = self.repo.create({
            **data,
            "author": author,
            "body_text": body_text,
            "reading_time_minutes": reading_time,
        })
        self._update_search_vector(post)
        return post

    def update_post(self, post_id, data: dict) -> Post:
        post = self.repo.get_by_id(post_id)
        body = data.get("body", post.body)
        body_text = self._extract_text_from_tiptap(body)

        data["body_text"] = body_text
        data["reading_time_minutes"] = self._compute_reading_time(body_text)

        if "title" in data and not data.get("slug"):
            data["slug"] = self._generate_unique_slug(data["title"], exclude_id=post_id)

        post = self.repo.update(post_id, data)
        self._update_search_vector(post)
        return post

    def publish(self, post_id) -> Post:
        return self.repo.update(post_id, {
            "status": Post.Status.PUBLISHED,
            "published_at": timezone.now(),
        })

    def schedule(self, post_id, scheduled_for) -> Post:
        return self.repo.update(post_id, {
            "status": Post.Status.SCHEDULED,
            "scheduled_for": scheduled_for,
        })

    def unpublish(self, post_id) -> Post:
        return self.repo.update(post_id, {
            "status": Post.Status.DRAFT,
            "published_at": None,
        })

    @staticmethod
    def _update_search_vector(post):
        Post.objects.filter(id=post.id).update(
            search_vector=(
                SearchVector("title", weight="A")
                + SearchVector("body_text", weight="B")
            )
        )

    @staticmethod
    def full_text_search(query: str, queryset=None):
        if queryset is None:
            queryset = Post.objects.filter(status=Post.Status.PUBLISHED)
        search_query = SearchQuery(query)
        return (
            queryset
            .annotate(rank=SearchRank("search_vector", search_query))
            .filter(search_vector=search_query)
            .order_by("-rank")
        )

    @staticmethod
    def autocomplete(query: str, limit: int = 5):
        return (
            Post.objects.filter(
                status=Post.Status.PUBLISHED,
                title__icontains=query,
            )
            .values_list("title", "slug")[:limit]
        )
