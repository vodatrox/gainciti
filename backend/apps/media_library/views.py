import asyncio

from PIL import Image
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from common.pagination import StandardPageNumberPagination
from common.permissions import IsAdminOrEditor
from .models import MediaAsset
from .serializers import MediaAssetSerializer


class AdminMediaViewSet(viewsets.ModelViewSet):
    permission_classes = (IsAuthenticated, IsAdminOrEditor)
    serializer_class = MediaAssetSerializer
    queryset = MediaAsset.objects.all()
    pagination_class = StandardPageNumberPagination

    def perform_create(self, serializer):
        file = self.request.FILES.get("file")
        if not file:
            return

        width = None
        height = None
        if file.content_type.startswith("image/"):
            try:
                img = Image.open(file)
                width, height = img.size
                file.seek(0)
            except Exception:
                pass

        instance = serializer.save(
            uploaded_by=self.request.user,
            filename=file.name,
            mime_type=file.content_type,
            file_size=file.size,
            width=width,
            height=height,
        )

        # Trigger Temporal image processing workflow
        if file.content_type.startswith("image/"):
            try:
                from temporal.config import TEMPORAL_HOST, TEMPORAL_NAMESPACE, TEMPORAL_TASK_QUEUE
                from temporalio.client import Client

                async def _start_workflow():
                    client = await Client.connect(TEMPORAL_HOST, namespace=TEMPORAL_NAMESPACE)
                    await client.start_workflow(
                        "ProcessImageWorkflow",
                        str(instance.id),
                        id=f"process-image-{instance.id}",
                        task_queue=TEMPORAL_TASK_QUEUE,
                    )

                asyncio.run(_start_workflow())
            except Exception:
                pass  # Image processing is best-effort
