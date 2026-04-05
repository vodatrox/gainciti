from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == "admin"
        )


class IsAdminOrEditor(BasePermission):
    """Allows access to admin and editor users."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("admin", "editor")
        )


class IsAuthorOrAbove(BasePermission):
    """Allows access to authors, editors, and admins."""

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ("admin", "editor", "author")
        )


class IsOwnerOrAdmin(BasePermission):
    """Object-level: allows the owner or an admin to modify."""

    def has_object_permission(self, request, view, obj):
        if request.user.role == "admin":
            return True
        return hasattr(obj, "author") and obj.author == request.user
