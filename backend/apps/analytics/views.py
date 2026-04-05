from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.permissions import IsAdminUser
from .serializers import AnalyticsOverviewSerializer, PageViewCreateSerializer
from .services import AnalyticsService


class EventIngestionView(APIView):
    permission_classes = (AllowAny,)
    throttle_scope = "public_burst"

    def post(self, request):
        serializer = PageViewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        AnalyticsService.record_page_view(serializer.validated_data, request)
        return Response({"status": "ok"}, status=status.HTTP_201_CREATED)


class AnalyticsOverviewView(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get(self, request):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        overview = AnalyticsService.get_overview(date_from=date_from, date_to=date_to)
        serializer = AnalyticsOverviewSerializer(overview)
        return Response(serializer.data)


class PostAnalyticsView(APIView):
    permission_classes = (IsAuthenticated, IsAdminUser)

    def get(self, request, post_id):
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")
        data = AnalyticsService.get_post_analytics(post_id, date_from=date_from, date_to=date_to)
        return Response(data)
