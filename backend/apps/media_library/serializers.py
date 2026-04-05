from rest_framework import serializers
from .models import MediaAsset


class MediaAssetSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = MediaAsset
        fields = (
            "id", "file", "file_url", "filename", "alt_text", "caption",
            "mime_type", "file_size", "width", "height",
            "thumbnail", "thumbnail_url", "uploaded_by", "created_at",
        )
        read_only_fields = ("id", "filename", "mime_type", "file_size", "width", "height", "uploaded_by", "created_at")

    def get_file_url(self, obj):
        return obj.file.url if obj.file else None

    def get_thumbnail_url(self, obj):
        return obj.thumbnail.url if obj.thumbnail else None
