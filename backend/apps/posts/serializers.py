from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import Category, Post, PostTag, Tag


class CategorySerializer(serializers.ModelSerializer):
    post_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = Category
        fields = ("id", "name", "slug", "description", "color", "icon", "sort_order", "is_active", "post_count")
        read_only_fields = ("id",)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ("id", "name", "slug")
        read_only_fields = ("id",)


class PostListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id", "title", "slug", "excerpt", "featured_image_url",
            "author", "category", "tags", "status", "is_featured",
            "position", "reading_time_minutes", "published_at", "view_count",
        )

    def get_featured_image_url(self, obj):
        if obj.featured_image:
            return obj.featured_image.file.url
        return None


class PostDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    featured_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = (
            "id", "title", "slug", "excerpt", "body", "body_html",
            "featured_image_url", "author", "category", "tags",
            "status", "is_featured", "is_pinned", "position",
            "reading_time_minutes", "published_at", "view_count",
            "created_at", "updated_at",
        )

    def get_featured_image_url(self, obj):
        if obj.featured_image:
            return obj.featured_image.file.url
        return None


class PostCreateUpdateSerializer(serializers.ModelSerializer):
    tag_ids = serializers.ListField(child=serializers.IntegerField(), write_only=True, required=False)
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model = Post
        fields = (
            "id", "title", "slug", "excerpt", "body",
            "featured_image", "category", "tag_ids",
            "status", "is_featured", "is_pinned", "position",
            "scheduled_for",
        )
        read_only_fields = ("id",)
