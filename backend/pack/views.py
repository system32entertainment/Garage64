from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import CarVariant, EntityBody, ModelPart, PartSlot
from .serializers import (
    CarVariantSerializer,
    CarVariantWriteSerializer,
    EntityBodySerializer,
    ModelPartSerializer,
    PartSlotSerializer,
)
from .services import exporter


class PartSlotViewSet(viewsets.ModelViewSet):
    queryset = PartSlot.objects.all()
    serializer_class = PartSlotSerializer


class EntityBodyViewSet(viewsets.ModelViewSet):
    queryset = EntityBody.objects.all()
    serializer_class = EntityBodySerializer


class ModelPartViewSet(viewsets.ModelViewSet):
    queryset = ModelPart.objects.all()
    serializer_class = ModelPartSerializer


class CarVariantViewSet(viewsets.ModelViewSet):
    queryset = CarVariant.objects.all().order_by('order')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return CarVariantWriteSerializer
        return CarVariantSerializer

    @action(detail=True, methods=['get'])
    def compiled_jem(self, request, pk=None):
        """Return the fully compiled JEM JSON for this variant (body + injected parts)."""
        variant = self.get_object()
        return Response(exporter.compiled_jem(variant))

    @action(detail=False, methods=['post'])
    def export(self, request):
        """
        Regenerate all .jem files and .properties files in the pack
        from the current database state.
        """
        result = exporter.export_all()
        if result.errors:
            return Response({'status': 'partial', 'errors': result.errors},
                            status=status.HTTP_207_MULTI_STATUS)
        return Response({'status': 'ok', 'written': len(result.written)})

