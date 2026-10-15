from django.urls import path
from . import views

urlpatterns = [
    path("", views.ringkasan, name="ringkasan"),
    path("nota/", views.daftar_nota, name="daftar_nota"),
        path("nota/baru/", views.nota_baru, name="nota_baru"),
    path("nota/<int:pk>/", views.detail_nota, name="detail_nota"),
]