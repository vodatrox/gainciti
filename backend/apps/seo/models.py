from django.db import models
from apps.posts.models import Post
from apps.media_library.models import MediaAsset


class SEOMetadata(models.Model):
    post = models.OneToOneField(Post, on_delete=models.CASCADE, related_name="seo_metadata")
    meta_title = models.CharField(max_length=70, blank=True)
    meta_description = models.CharField(max_length=160, blank=True)
    og_title = models.CharField(max_length=70, blank=True)
    og_description = models.CharField(max_length=200, blank=True)
    og_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True)
    canonical_url = models.URLField(blank=True)
    no_index = models.BooleanField(default=False)
    structured_data = models.JSONField(default=dict, blank=True)

    class Meta:
        verbose_name = "SEO Metadata"
        verbose_name_plural = "SEO Metadata"

    def __str__(self):
        return f"SEO: {self.post.title}"
