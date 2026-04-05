from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import AdminMediaViewSet

router = DefaultRouter()
router.register("admin/media", AdminMediaViewSet, basename="admin-media")

urlpatterns = [
    path("", include(router.urls)),
]
