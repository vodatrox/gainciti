import math
import re

from django.utils.text import slugify


def compute_reading_time(text: str) -> int:
    """Estimate reading time in minutes (200 wpm average)."""
    word_count = len(text.split())
    return max(1, math.ceil(word_count / 200))


def generate_unique_slug(model_class, title: str, exclude_id=None) -> str:
    """Generate a unique slug for a given model."""
    base_slug = slugify(title)[:250]
    slug = base_slug
    counter = 1
    qs = model_class.objects.all()
    if exclude_id:
        qs = qs.exclude(id=exclude_id)
    while qs.filter(slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def strip_html(html: str) -> str:
    """Remove HTML tags from a string."""
    return re.sub(r"<[^>]+>", "", html)
