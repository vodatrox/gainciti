from rest_framework import serializers
from .models import SEOMetadata


class SEOMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SEOMetadata
        fields = (
            "id", "post", "meta_title", "meta_description",
            "og_title", "og_description", "og_image",
            "canonical_url", "no_index", "structured_data",
        )
        read_only_fields = ("id",)
