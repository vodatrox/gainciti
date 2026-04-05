"""Newsletter-related Temporal activities."""

from dataclasses import dataclass

from temporalio import activity


@dataclass
class EmailPayload:
    campaign_id: str
    subscriber_emails: list[str]
    subject: str
    body_html: str


@activity.defn
def fetch_campaign_data(campaign_id: str) -> dict:
    """Fetch campaign details and all confirmed subscriber emails."""
    from apps.newsletters.models import Campaign, Subscriber

    campaign = Campaign.objects.get(id=campaign_id)
    subscribers = list(
        Subscriber.objects.filter(
            is_confirmed=True,
            unsubscribed_at__isnull=True,
        ).values_list("email", flat=True)
    )

    return {
        "campaign_id": str(campaign.id),
        "subject": campaign.subject,
        "body_html": campaign.body_html,
        "subscriber_emails": subscribers,
    }


@activity.defn
def send_email_batch(payload: EmailPayload) -> dict:
    """Send a batch of emails individually with per-recipient logging."""
    from django.conf import settings
    from django.core.mail import EmailMultiAlternatives

    from apps.newsletters.models import Campaign, SendLog, Subscriber

    campaign = Campaign.objects.get(id=payload.campaign_id)
    sent_count = 0
    failed_count = 0

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@gainciti.com")

    for email in payload.subscriber_emails:
        try:
            subscriber = Subscriber.objects.get(email=email)
        except Subscriber.DoesNotExist:
            failed_count += 1
            continue

        try:
            msg = EmailMultiAlternatives(
                subject=payload.subject,
                body="",
                from_email=from_email,
                to=[email],
            )
            msg.attach_alternative(payload.body_html, "text/html")
            msg.send(fail_silently=False)

            SendLog.objects.create(
                campaign=campaign,
                subscriber=subscriber,
                status=SendLog.Status.SENT,
            )
            sent_count += 1
        except Exception:
            SendLog.objects.create(
                campaign=campaign,
                subscriber=subscriber,
                status=SendLog.Status.FAILED,
            )
            failed_count += 1

    return {"sent": sent_count, "failed": failed_count}


@activity.defn
def mark_campaign_sent(campaign_id: str) -> None:
    """Mark campaign as sent with timestamp."""
    from django.utils import timezone
    from apps.newsletters.models import Campaign

    Campaign.objects.filter(id=campaign_id).update(
        status=Campaign.Status.SENT,
        sent_at=timezone.now(),
    )
