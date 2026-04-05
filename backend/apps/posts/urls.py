from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminCategoryViewSet,
    AdminPostViewSet,
    AdminTagViewSet,
    PublicCategoryViewSet,
    PublicPostViewSet,
    PublicTagViewSet,
)

router = DefaultRouter()
router.register("posts", PublicPostViewSet, basename="public-posts")
router.register("categories", PublicCategoryViewSet, basename="public-categories")
router.register("tags", PublicTagViewSet, basename="public-tags")
router.register("admin/posts", AdminPostViewSet, basename="admin-posts")
router.register("admin/categories", AdminCategoryViewSet, basename="admin-categories")
router.register("admin/tags", AdminTagViewSet, basename="admin-tags")

urlpatterns = [
    path("", include(router.urls)),
]
