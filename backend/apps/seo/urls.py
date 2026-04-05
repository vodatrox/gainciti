from django.urls import path

from .views import SitemapDataView

urlpatterns = [
    path("sitemap/posts/", SitemapDataView.as_view(), name="sitemap-posts"),
]
