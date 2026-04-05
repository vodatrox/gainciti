from django.contrib import admin
from .models import MediaAsset


@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ("filename", "mime_type", "file_size", "uploaded_by", "created_at")
    list_filter = ("mime_type", "created_at")
    search_fields = ("filename", "alt_text")
