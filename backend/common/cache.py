"""Cache-Control header utilities for API views."""

from functools import wraps

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control


def public_cache(max_age=60):
    """Decorator for public read endpoints with Cache-Control headers."""
    return cache_control(public=True, max_age=max_age, s_maxage=max_age)


def private_cache(max_age=0):
    """Decorator for authenticated endpoints — no public caching."""
    return cache_control(private=True, max_age=max_age, no_store=True)
