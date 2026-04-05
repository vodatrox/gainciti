from django.utils.decorators import method_decorator
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from common.cache import public_cache
from common.pagination import StandardPageNumberPagination
from common.permissions import IsAdminOrEditor
from .filters import PostFilter
from .models import Category, Post, Tag
from .repositories import CategoryRepository, PostRepository, TagRepository
from .serializers import (
    CategorySerializer,
    PostCreateUpdateSerializer,
    PostDetailSerializer,
    PostListSerializer,
    TagSerializer,
)
from .services import PostService


# ── Public ViewSets ──────────────────────────────────────────────────────

@method_decorator(public_cache(max_age=60), name="list")
@method_decorator(public_cache(max_age=300), name="retrieve")
class PublicPostViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    filterset_class = PostFilter
    lookup_field = "slug"

    def get_queryset(self):
        return PostRepository().get_published()

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PostDetailSerializer
        return PostListSerializer

    @action(detail=False, methods=["get"])
    def featured(self, request):
        posts = PostRepository().get_featured()
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def trending(self, request):
        days = int(request.query_params.get("days", 7))
        posts = PostRepository().get_trending(days=days)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def search(self, request):
        query = request.query_params.get("q", "")
        if not query:
            return Response([])
        posts = PostService.full_text_search(query)
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="search/autocomplete")
    def autocomplete(self, request):
        query = request.query_params.get("q", "")
        if not query or len(query) < 2:
            return Response([])
        results = PostService.autocomplete(query)
        return Response([{"title": r[0], "slug": r[1]} for r in results])


@method_decorator(public_cache(max_age=300), name="list")
@method_decorator(public_cache(max_age=300), name="retrieve")
class PublicCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    serializer_class = CategorySerializer
    lookup_field = "slug"
    pagination_class = None

    def get_queryset(self):
        return CategoryRepository().get_all()

    @action(detail=True, methods=["get"])
    def posts(self, request, slug=None):
        category = CategoryRepository().get_by_slug(slug)
        posts = PostRepository().get_published().filter(category=category)
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)


@method_decorator(public_cache(max_age=300), name="list")
class PublicTagViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (AllowAny,)
    serializer_class = TagSerializer
    queryset = Tag.objects.all()
    lookup_field = "slug"
    pagination_class = None

    @action(detail=True, methods=["get"])
    def posts(self, request, slug=None):
        tag = TagRepository().get_by_slug(slug)
        posts = PostRepository().get_published().filter(tags=tag)
        page = self.paginate_queryset(posts)
        if page is not None:
            serializer = PostListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = PostListSerializer(posts, many=True)
        return Response(serializer.data)


# ── Admin ViewSets ───────────────────────────────────────────────────────

class AdminPostViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminOrEditor)
    pagination_class = StandardPageNumberPagination
    filterset_class = PostFilter
    search_fields = ("title", "excerpt", "body")

    def get_queryset(self):
        return PostRepository().get_all()

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update"):
            return PostCreateUpdateSerializer
        if self.action == "retrieve":
            return PostDetailSerializer
        return PostListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        service = PostService()
        post = service.create_post(serializer.validated_data, request.user)
        return Response(PostDetailSerializer(post).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)
        service = PostService()
        post = service.update_post(self.kwargs["pk"], serializer.validated_data)
        return Response(PostDetailSerializer(post).data)

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        service = PostService()
        post = service.publish(pk)
        return Response(PostDetailSerializer(post).data)

    @action(detail=True, methods=["post"])
    def schedule(self, request, pk=None):
        scheduled_for = request.data.get("scheduled_for")
        if not scheduled_for:
            return Response(
                {"error": {"code": "missing_field", "message": "scheduled_for is required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        service = PostService()
        post = service.schedule(pk, scheduled_for)
        return Response(PostDetailSerializer(post).data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        service = PostService()
        post = service.unpublish(pk)
        return Response(PostDetailSerializer(post).data)


class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminOrEditor)
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
    pagination_class = StandardPageNumberPagination


class AdminTagViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminOrEditor)
    serializer_class = TagSerializer
    queryset = Tag.objects.all()
    pagination_class = StandardPageNumberPagination
