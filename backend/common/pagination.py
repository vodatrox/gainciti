from rest_framework.pagination import CursorPagination, PageNumberPagination


class StandardCursorPagination(CursorPagination):
    """Cursor-based pagination for public API (stable under inserts)."""

    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 50
    ordering = "-published_at"


class StandardPageNumberPagination(PageNumberPagination):
    """Page-number pagination for admin API (supports jumping to pages)."""

    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
