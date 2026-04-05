from rest_framework import serializers
from .models import Campaign, SendLog, Subscriber


class SubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscriber
        fields = ("id", "email", "is_confirmed", "subscribed_at", "unsubscribed_at")
        read_only_fields = ("id", "is_confirmed", "subscribed_at", "unsubscribed_at")


class SubscribeSerializer(serializers.Serializer):
    email = serializers.EmailField()


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = ("id", "subject", "body_html", "status", "sent_at", "created_by", "created_at")
        read_only_fields = ("id", "status", "sent_at", "created_by", "created_at")


class SendLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SendLog
        fields = ("id", "campaign", "subscriber", "status", "sent_at")
