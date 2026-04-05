from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AdminCommentViewSet, PublicCommentViewSet

router = DefaultRouter()
router.register("admin/comments", AdminCommentViewSet, basename="admin-comments")

urlpatterns = [
    path("posts/<slug:post_slug>/comments/", PublicCommentViewSet.as_view({"get": "list", "post": "create"}), name="post-comments"),
    path("", include(router.urls)),
]
