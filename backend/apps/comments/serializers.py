from rest_framework import serializers
from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ("id", "post", "parent", "author_name", "body", "is_approved", "created_at", "replies")
        read_only_fields = ("id", "is_approved", "created_at")

    def get_replies(self, obj):
        if obj.replies.exists():
            return CommentSerializer(obj.replies.filter(is_approved=True), many=True).data
        return []


class AdminCommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    post_title = serializers.CharField(source="post.title", read_only=True)
    post_slug = serializers.CharField(source="post.slug", read_only=True)
    parent_author = serializers.CharField(source="parent.author_name", read_only=True, default=None)
    author_email = serializers.EmailField(read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id", "post", "post_title", "post_slug", "parent", "parent_author",
            "author_name", "author_email", "body", "is_approved", "created_at", "replies",
        )
        read_only_fields = ("id", "created_at")

    def get_replies(self, obj):
        if obj.replies.exists():
            return AdminCommentSerializer(obj.replies.all(), many=True).data
        return []


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ("id", "parent", "author_name", "author_email", "body")
        read_only_fields = ("id",)
