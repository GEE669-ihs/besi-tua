from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BarangViewSet,
    CSRFView,
    CurrentUserView,
    LapakViewSet,
    LoginAPIView,
    LogoutAPIView,
    NotaViewSet,
    RingkasanAPIView,
)

router = DefaultRouter()
router.register(r"ranting", LapakViewSet, basename="ranting")
router.register(r"barang", BarangViewSet, basename="barang")
router.register(r"nota", NotaViewSet, basename="nota")

urlpatterns = [
    path("", include(router.urls)),
    path("ringkasan/", RingkasanAPIView.as_view(), name="api_ringkasan"),
    path("auth/csrf/", CSRFView.as_view(), name="api_csrf"),
    path("auth/login/", LoginAPIView.as_view(), name="api_login"),
    path("auth/logout/", LogoutAPIView.as_view(), name="api_logout"),
    path("auth/me/", CurrentUserView.as_view(), name="api_current_user"),
]
