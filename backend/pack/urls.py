from django.urls import path
from rest_framework.routers import DefaultRouter

from .asset_views import pack_asset
from .views import (
    CarVariantViewSet,
    EntityBodyViewSet,
    ModelPartViewSet,
    PartSlotViewSet,
)

router = DefaultRouter()
router.register('bodies', EntityBodyViewSet, basename='body')
router.register('parts', ModelPartViewSet, basename='part')
router.register('variants', CarVariantViewSet, basename='variant')
router.register('slots', PartSlotViewSet, basename='slot')

urlpatterns = router.urls + [
    path('asset/', pack_asset),
]
