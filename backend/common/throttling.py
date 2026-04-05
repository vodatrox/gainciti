from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class PublicBurstRate(AnonRateThrottle):
    scope = "public_burst"


class PublicSustainedRate(AnonRateThrottle):
    scope = "public_sustained"


class AdminRate(UserRateThrottle):
    scope = "admin"
