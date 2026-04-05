from datetime import timedelta
from django.db.models import Count, Q
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
        return (
            Post.objects.filter(status=Post.Status.PUBLISHED, is_featured=True)
            .select_related("author", "category", "featured_image")
            .prefetch_related("tags")[:5]
        )

    def get_trending(self, days=7):
        since = timezone.now() - timedelta(days=days)
        return (
            Post.objects.filter(
                status=Post.Status.PUBLISHED,
                published_at__gte=since,
            )
            .select_related("author", "category", "featured_image")
            .order_by("-view_count")[:10]
        )

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
