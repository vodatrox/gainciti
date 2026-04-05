from django.db import connection
from django.http import JsonResponse
from django.urls import path


def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "ok", "database": "connected"})
    except Exception as e:
        return JsonResponse(
            {"status": "error", "database": str(e)},
            status=503,
        )


urlpatterns = [
    path("", health_check, name="health-check"),
]
