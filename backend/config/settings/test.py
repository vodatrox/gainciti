"""Test settings."""

from .base import *  # noqa: F401, F403

DEBUG = False

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "gainciti_test",
        "USER": "gainciti",
        "PASSWORD": "gainciti",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.MD5PasswordHasher",
]

REST_FRAMEWORK["DEFAULT_THROTTLE_CLASSES"] = ()  # noqa: F405

EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
