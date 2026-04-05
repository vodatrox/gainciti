from datetime import timedelta
from itertools import chain
from django.db.models import Case, Count, IntegerField, Q, Value, When
from django.utils import timezone

from .models import Category, Post, Tag


class PostRepository:
    def get_published(self, filters=None):
        qs = (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .select_related("author", "category", "featured_image")
            .prefetch_related("tags")
        )
        return qs

    def get_by_id(self, post_id):
        return (
            Post.objects.select_related("author", "category", "featured_image")
            .prefetch_related("tags")
            .get(id=post_id)
        )

    def get_by_slug(self, slug):
        return (
            Post.objects.select_related("author", "category", "featured_image")
            .prefetch_related("tags")
            .get(slug=slug, status=Post.Status.PUBLISHED)
        )

    def get_featured(self):
        """Return featured posts. Posts with position=hero or is_pinned come first,
        then remaining is_featured posts by published date."""
        base = (
            Post.objects.filter(status=Post.Status.PUBLISHED, is_featured=True)
            .select_related("author", "category", "featured_image")
            .prefetch_related("tags")
        )
        # Priority: pinned hero > hero > pinned > rest
        return base.annotate(
            _priority=Case(
                When(is_pinned=True, position=Post.Position.HERO, then=Value(0)),
                When(position=Post.Position.HERO, then=Value(1)),
                When(is_pinned=True, then=Value(2)),
                default=Value(3),
                output_field=IntegerField(),
            )
        ).order_by("_priority", "-published_at")[:5]

    def get_trending(self, days=7):
        """Return trending posts. Posts with position=trending come first,
        then posts published within `days` ranked by view_count."""
        published = Post.objects.filter(
            status=Post.Status.PUBLISHED,
        ).select_related("author", "category", "featured_image").prefetch_related("tags")

        # Posts explicitly marked trending always appear first
        pinned_trending = list(
            published.filter(position=Post.Position.TRENDING)
            .order_by("-view_count")
        )
        pinned_ids = {p.id for p in pinned_trending}

        since = timezone.now() - timedelta(days=days)
        organic = list(
            published.filter(published_at__gte=since)
            .exclude(id__in=pinned_ids)
            .order_by("-view_count")[: 10 - len(pinned_trending)]
        )
        return list(chain(pinned_trending, organic))

    def get_all(self):
        return (
            Post.objects.all()
            .select_related("author", "category", "featured_image")
            .prefetch_related("tags")
        )

    def create(self, data):
        tag_ids = data.pop("tag_ids", [])
        post = Post.objects.create(**data)
        if tag_ids:
            from .models import PostTag
            for tag_id in tag_ids:
                PostTag.objects.create(post=post, tag_id=tag_id)
        return post

    def update(self, post_id, data):
        tag_ids = data.pop("tag_ids", None)
        Post.objects.filter(id=post_id).update(**data)
        post = self.get_by_id(post_id)
        if tag_ids is not None:
            from .models import PostTag
            PostTag.objects.filter(post=post).delete()
            for tag_id in tag_ids:
                PostTag.objects.create(post=post, tag_id=tag_id)
        return post

    def delete(self, post_id):
        Post.objects.filter(id=post_id).update(status=Post.Status.ARCHIVED)


class CategoryRepository:
    def get_all(self, active_only=True):
        qs = Category.objects.all()
        if active_only:
            qs = qs.filter(is_active=True)
        return qs.annotate(post_count=Count("posts", filter=Q(posts__status=Post.Status.PUBLISHED)))

    def get_by_slug(self, slug):
        return Category.objects.get(slug=slug)

    def create(self, data):
        return Category.objects.create(**data)

    def update(self, category_id, data):
        Category.objects.filter(id=category_id).update(**data)
        return Category.objects.get(id=category_id)

    def delete(self, category_id):
        Category.objects.filter(id=category_id).delete()


class TagRepository:
    def get_all(self):
        return Tag.objects.annotate(post_count=Count("posts"))

    def get_by_slug(self, slug):
        return Tag.objects.get(slug=slug)

    def create(self, data):
        return Tag.objects.create(**data)

    def update(self, tag_id, data):
        Tag.objects.filter(id=tag_id).update(**data)
        return Tag.objects.get(id=tag_id)

    def delete(self, tag_id):
        Tag.objects.filter(id=tag_id).delete()
