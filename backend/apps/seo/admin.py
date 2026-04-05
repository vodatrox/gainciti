from django.contrib import admin

from .models import SEOMetadata


@admin.register(SEOMetadata)
class SEOMetadataAdmin(admin.ModelAdmin):
    list_display = ("post", "meta_title", "no_index")
    search_fields = ("post__title", "meta_title")
