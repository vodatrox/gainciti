"""GainCiti URL Configuration."""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    path("django-admin/", admin.site.urls),
    # API v1
    path("api/v1/", include("apps.accounts.urls")),
    path("api/v1/", include("apps.posts.urls")),
    path("api/v1/", include("apps.media_library.urls")),
    path("api/v1/", include("apps.analytics.urls")),
    path("api/v1/", include("apps.comments.urls")),
    path("api/v1/", include("apps.newsletters.urls")),
    path("api/v1/", include("apps.seo.urls")),
    # API Documentation
    path("api/v1/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/v1/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/v1/redoc/",
        SpectacularRedocView.as_view(url_name="schema"),
        name="redoc",
    ),
    # Health check
    path("api/v1/health/", include("apps.accounts.health_urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [path("__debug__/", include("debug_toolbar.urls"))]
