from django.contrib import admin
from .models import Campaign, SendLog, Subscriber


@admin.register(Subscriber)
class SubscriberAdmin(admin.ModelAdmin):
    list_display = ("email", "is_confirmed", "subscribed_at", "unsubscribed_at")
    list_filter = ("is_confirmed",)


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ("subject", "status", "sent_at", "created_by")
    list_filter = ("status",)


@admin.register(SendLog)
class SendLogAdmin(admin.ModelAdmin):
    list_display = ("campaign", "subscriber", "status", "sent_at")
