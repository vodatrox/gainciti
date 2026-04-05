from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.posts.models import Post


class SitemapDataView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        posts = (
            Post.objects.filter(status=Post.Status.PUBLISHED)
            .order_by("-published_at")
            .values("slug", "updated_at")
        )
        data = [
            {"url": f"/posts/{p['slug']}/", "lastmod": p["updated_at"].isoformat()}
            for p in posts
        ]
        return Response(data)
