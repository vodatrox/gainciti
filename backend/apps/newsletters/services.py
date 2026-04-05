import secrets
from django.utils import timezone
from .models import Subscriber


class NewsletterService:
    @staticmethod
    def subscribe(email: str) -> Subscriber:
        subscriber, created = Subscriber.objects.get_or_create(
            email=email,
            defaults={"confirmation_token": secrets.token_urlsafe(48)},
        )
        if not created and subscriber.unsubscribed_at:
            subscriber.unsubscribed_at = None
            subscriber.confirmation_token = secrets.token_urlsafe(48)
            subscriber.is_confirmed = False
            subscriber.save()
        return subscriber

    @staticmethod
    def confirm(token: str) -> bool:
        try:
            subscriber = Subscriber.objects.get(confirmation_token=token, is_confirmed=False)
            subscriber.is_confirmed = True
            subscriber.confirmation_token = ""
            subscriber.save()
            return True
        except Subscriber.DoesNotExist:
            return False

    @staticmethod
    def unsubscribe(email: str) -> bool:
        try:
            subscriber = Subscriber.objects.get(email=email)
            subscriber.unsubscribed_at = timezone.now()
            subscriber.save()
            return True
        except Subscriber.DoesNotExist:
            return False
