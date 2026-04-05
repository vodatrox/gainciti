from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    AdminCampaignViewSet,
    AdminSubscriberViewSet,
    ConfirmSubscriptionView,
    SubscribeView,
    UnsubscribeView,
)

router = DefaultRouter()
router.register("admin/newsletter/subscribers", AdminSubscriberViewSet, basename="admin-subscribers")
router.register("admin/newsletter/campaigns", AdminCampaignViewSet, basename="admin-campaigns")

urlpatterns = [
    path("newsletter/subscribe/", SubscribeView.as_view(), name="newsletter-subscribe"),
    path("newsletter/confirm/<str:token>/", ConfirmSubscriptionView.as_view(), name="newsletter-confirm"),
    path("newsletter/unsubscribe/", UnsubscribeView.as_view(), name="newsletter-unsubscribe"),
    path("", include(router.urls)),
]
