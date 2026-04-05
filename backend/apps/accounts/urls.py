from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import CustomTokenRefreshView, LoginView, LogoutView, UserViewSet

router = DefaultRouter()
router.register("admin/users", UserViewSet, basename="admin-users")

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="auth-login"),
    path("auth/logout/", LogoutView.as_view(), name="auth-logout"),
    path("auth/refresh/", CustomTokenRefreshView.as_view(), name="auth-refresh"),
    path("", include(router.urls)),
]
