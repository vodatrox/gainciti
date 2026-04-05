import hashlib

import bleach
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from common.pagination import StandardPageNumberPagination
from common.permissions import IsAdminOrEditor
from apps.posts.models import Post
from .models import Comment
from .serializers import AdminCommentSerializer, CommentCreateSerializer, CommentSerializer


class CommentCreateThrottle(AnonRateThrottle):
    rate = "10/min"


class PublicCommentViewSet(viewsets.GenericViewSet):
    permission_classes = (AllowAny,)
    serializer_class = CommentSerializer
    throttle_classes = (CommentCreateThrottle,)

    def list(self, request, post_slug=None):
        try:
            post = Post.objects.get(slug=post_slug, status=Post.Status.PUBLISHED)
        except Post.DoesNotExist:
            return Response(
                {"error": {"code": "not_found", "message": "Post not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )
        comments = Comment.objects.filter(post=post, is_approved=True, parent__isnull=True)
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def create(self, request, post_slug=None):
        try:
            post = Post.objects.get(slug=post_slug, status=Post.Status.PUBLISHED)
        except Post.DoesNotExist:
            return Response(
                {"error": {"code": "not_found", "message": "Post not found"}},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = CommentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        ip = request.META.get("REMOTE_ADDR", "")
        ip_hash = hashlib.sha256(ip.encode()).hexdigest()

        # Sanitize comment body
        clean_body = bleach.clean(
            serializer.validated_data.get("body", ""),
            tags=[],  # strip all HTML
            strip=True,
        )
        serializer.save(post=post, ip_hash=ip_hash, body=clean_body)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminCommentViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminOrEditor)
    serializer_class = AdminCommentSerializer
    queryset = Comment.objects.select_related("post", "parent").all()
    filterset_fields = ["is_approved", "post"]
    pagination_class = StandardPageNumberPagination

    def partial_update(self, request, *args, **kwargs):
        return super().partial_update(request, *args, **kwargs)
