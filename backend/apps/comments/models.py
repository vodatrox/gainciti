import uuid
from django.db import models
from apps.posts.models import Post


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    author_name = models.CharField(max_length=100)
    author_email = models.EmailField()
    body = models.TextField()
    is_approved = models.BooleanField(default=False)
    ip_hash = models.CharField(max_length=64, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["post", "is_approved", "-created_at"]),
        ]

    def __str__(self):
        return f"Comment by {self.author_name} on {self.post.title}"
