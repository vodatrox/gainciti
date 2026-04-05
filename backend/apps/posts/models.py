import uuid
from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVectorField
from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default="#6366F1", help_text="Hex color for badge")
    icon = models.CharField(max_length=50, blank=True)
    sort_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=60, unique=True)
    slug = models.SlugField(max_length=80, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Post(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        SCHEDULED = "scheduled", "Scheduled"
        ARCHIVED = "archived", "Archived"

    class Position(models.TextChoices):
        HERO = "hero", "Hero"
        SIDEBAR = "sidebar", "Sidebar"
        TRENDING = "trending", "Trending"
        NONE = "", "None"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    excerpt = models.TextField(max_length=500, blank=True)
    body = models.JSONField(default=dict, help_text="TipTap JSON document")
    body_html = models.TextField(blank=True, help_text="Pre-rendered HTML")
    body_text = models.TextField(blank=True, help_text="Plain text for FTS indexing")
    featured_image = models.ForeignKey(
        "media_library.MediaAsset",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="featured_posts",
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="posts",
    )
    tags = models.ManyToManyField(Tag, through="PostTag", blank=True, related_name="posts")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False)
    is_pinned = models.BooleanField(default=False)
    position = models.CharField(max_length=20, choices=Position.choices, default=Position.NONE, blank=True)
    reading_time_minutes = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    view_count = models.PositiveIntegerField(default=0)
    search_vector = SearchVectorField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-published_at", "-created_at"]
        indexes = [
            GinIndex(fields=["search_vector"]),
            models.Index(fields=["status", "-published_at"]),
            models.Index(fields=["category", "status", "-published_at"]),
            models.Index(fields=["is_featured", "status"]),
            models.Index(fields=["-view_count"]),
            models.Index(fields=["slug"]),
        ]

    def __str__(self):
        return self.title


class PostTag(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ("post", "tag")

    def __str__(self):
        return f"{self.post.title} - {self.tag.name}"
