from django.urls import path
from . import views

urlpatterns = [
    path("", views.ringkasan, name="ringkasan"),
    path("nota/", views.daftar_nota, name="daftar_nota"),
]