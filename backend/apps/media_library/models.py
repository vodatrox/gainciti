import uuid
from django.conf import settings
from django.db import models


class MediaAsset(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to="media/%Y/%m/")
    filename = models.CharField(max_length=255)
    alt_text = models.CharField(max_length=255, blank=True)
    caption = models.TextField(blank=True)
    mime_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    width = models.PositiveIntegerField(null=True, blank=True)
    height = models.PositiveIntegerField(null=True, blank=True)
    thumbnail = models.FileField(upload_to="thumbnails/%Y/%m/", null=True, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="media_assets",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.filename
