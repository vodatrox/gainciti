import asyncio

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from common.pagination import StandardPageNumberPagination
from common.permissions import IsAdminUser
from .models import Campaign, Subscriber
from .serializers import CampaignSerializer, SubscribeSerializer, SubscriberSerializer
from .services import NewsletterService


class SubscribeView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = SubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        subscriber = NewsletterService.subscribe(serializer.validated_data["email"])
        return Response(
            {"message": "Please check your email to confirm subscription."},
            status=status.HTTP_201_CREATED,
        )


class ConfirmSubscriptionView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, token):
        if NewsletterService.confirm(token):
            return Response({"message": "Subscription confirmed."})
        return Response(
            {"error": {"code": "invalid_token", "message": "Invalid or expired token"}},
            status=status.HTTP_400_BAD_REQUEST,
        )


class UnsubscribeView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response(
                {"error": {"code": "missing_field", "message": "Email is required"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        NewsletterService.unsubscribe(email)
        return Response({"message": "Unsubscribed successfully."})


class AdminSubscriberViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = SubscriberSerializer
    queryset = Subscriber.objects.all()
    pagination_class = StandardPageNumberPagination


class AdminCampaignViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminUser)
    serializer_class = CampaignSerializer
    queryset = Campaign.objects.all()
    pagination_class = StandardPageNumberPagination

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=["post"])
    def send(self, request, pk=None):
        campaign = self.get_object()
        if campaign.status != Campaign.Status.DRAFT:
            return Response(
                {"error": {"code": "invalid_status", "message": "Campaign has already been sent"}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        campaign.status = Campaign.Status.SENDING
        campaign.save()

        # Trigger Temporal workflow for fan-out sending
        try:
            from temporal.config import TEMPORAL_HOST, TEMPORAL_NAMESPACE, TEMPORAL_TASK_QUEUE
            from temporalio.client import Client

            async def _start_workflow():
                client = await Client.connect(TEMPORAL_HOST, namespace=TEMPORAL_NAMESPACE)
                await client.start_workflow(
                    "SendNewsletterWorkflow",
                    str(campaign.id),
                    id=f"newsletter-{campaign.id}",
                    task_queue=TEMPORAL_TASK_QUEUE,
                )

            asyncio.run(_start_workflow())
        except Exception:
            pass  # Worker will pick up SENDING campaigns on next poll

        return Response({"message": "Campaign sending initiated."})
