"""Image processing Temporal activities."""

import io
import os
from dataclasses import dataclass

from temporalio import activity

THUMBNAIL_WIDTH = 300


@dataclass
class ImageProcessingResult:
    thumbnail_path: str | None
    width: int | None
    height: int | None
    webp_path: str | None


@activity.defn
def validate_image(media_asset_id: str) -> dict:
    """Validate image file and return basic info."""
    from apps.media_library.models import MediaAsset

    asset = MediaAsset.objects.get(id=media_asset_id)

    if not asset.mime_type or not asset.mime_type.startswith("image/"):
        return {"valid": False, "reason": "Not an image file"}

    try:
        from PIL import Image

        with asset.file.open("rb") as f:
            img = Image.open(f)
            img.verify()

        return {
            "valid": True,
            "width": img.size[0],
            "height": img.size[1],
            "format": img.format,
        }
    except Exception as e:
        return {"valid": False, "reason": str(e)}


@activity.defn
def generate_thumbnail(media_asset_id: str) -> str | None:
    """Generate a 300px-wide thumbnail for the image."""
    from django.core.files.base import ContentFile

    from apps.media_library.models import MediaAsset

    asset = MediaAsset.objects.get(id=media_asset_id)

    if not asset.mime_type or not asset.mime_type.startswith("image/"):
        return None

    try:
        from PIL import Image

        with asset.file.open("rb") as f:
            img = Image.open(f)
            img.load()

        # Calculate proportional height
        aspect_ratio = img.height / img.width
        thumb_height = int(THUMBNAIL_WIDTH * aspect_ratio)

        # Resize
        thumb = img.resize((THUMBNAIL_WIDTH, thumb_height), Image.LANCZOS)

        # Save to buffer
        buffer = io.BytesIO()
        save_format = "WEBP" if img.mode in ("RGB", "RGBA") else "PNG"
        thumb.save(buffer, format=save_format, quality=80)
        buffer.seek(0)

        # Build thumbnail filename
        base_name = os.path.splitext(asset.filename)[0]
        ext = ".webp" if save_format == "WEBP" else ".png"
        thumb_filename = f"{base_name}_thumb{ext}"

        # Save to model
        asset.thumbnail.save(thumb_filename, ContentFile(buffer.read()), save=True)

        return asset.thumbnail.name
    except Exception as e:
        activity.logger.error(f"Thumbnail generation failed for {media_asset_id}: {e}")
        return None


@activity.defn
def convert_to_webp(media_asset_id: str) -> str | None:
    """Convert the original image to WebP format if it isn't already."""
    from django.core.files.base import ContentFile

    from apps.media_library.models import MediaAsset

    asset = MediaAsset.objects.get(id=media_asset_id)

    if not asset.mime_type or not asset.mime_type.startswith("image/"):
        return None

    # Skip if already WebP
    if asset.mime_type == "image/webp":
        return None

    # Skip SVGs — can't rasterize
    if asset.mime_type == "image/svg+xml":
        return None

    try:
        from PIL import Image

        with asset.file.open("rb") as f:
            img = Image.open(f)
            img.load()

        # Convert to RGB if necessary (RGBA is fine for WebP)
        if img.mode not in ("RGB", "RGBA"):
            img = img.convert("RGB")

        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=85)
        buffer.seek(0)

        # Save WebP version, replacing the original file
        base_name = os.path.splitext(asset.filename)[0]
        webp_filename = f"{base_name}.webp"

        asset.file.save(webp_filename, ContentFile(buffer.read()), save=False)
        asset.mime_type = "image/webp"
        asset.filename = webp_filename
        asset.file_size = buffer.tell()
        asset.save()

        return webp_filename
    except Exception as e:
        activity.logger.error(f"WebP conversion failed for {media_asset_id}: {e}")
        return None


@activity.defn
def update_media_dimensions(media_asset_id: str) -> None:
    """Update the MediaAsset with accurate width/height."""
    from apps.media_library.models import MediaAsset

    asset = MediaAsset.objects.get(id=media_asset_id)

    if not asset.mime_type or not asset.mime_type.startswith("image/"):
        return

    try:
        from PIL import Image

        with asset.file.open("rb") as f:
            img = Image.open(f)
            width, height = img.size

        if asset.width != width or asset.height != height:
            asset.width = width
            asset.height = height
            asset.save(update_fields=["width", "height"])
    except Exception as e:
        activity.logger.error(f"Dimension update failed for {media_asset_id}: {e}")
