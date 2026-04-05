from django.contrib import admin
from .models import Category, Post, PostTag, Tag


class PostTagInline(admin.TabularInline):
    model = PostTag
    extra = 1


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ("title", "author", "category", "status", "is_featured", "published_at", "view_count")
    list_filter = ("status", "category", "is_featured", "created_at")
    search_fields = ("title", "excerpt")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [PostTagInline]
    date_hierarchy = "created_at"


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sort_order", "is_active")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
