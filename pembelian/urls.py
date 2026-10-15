from django.urls import path
from . import views

urlpatterns = [
    path("", views.ringkasan, name="ringkasan"),
    path("nota/", views.daftar_nota, name="daftar_nota"),
    path("nota/baru/", views.nota_baru, name="nota_baru"),
    path("nota/<int:pk>/", views.detail_nota, name="detail_nota"),
    path("barang/", views.DaftarBarang.as_view(), name="daftar_barang"),
    path("barang/baru/", views.BarangBaru.as_view(), name="barang_baru"),
    path("barang/<int:pk>/ubah/", views.UbahBarang.as_view(), name="ubah_barang"),
    path("barang/<int:pk>/hapus/", views.HapusBarang.as_view(), name="hapus_barang"),
    path("ranting/", views.DaftarRanting.as_view(), name="daftar_ranting"),
    path("ranting/baru/", views.RantingBaru.as_view(), name="ranting_baru"),
    path("ranting/<int:pk>/ubah/", views.UbahRanting.as_view(), name="ubah_ranting"),
    path("ranting/<int:pk>/hapus/", views.HapusRanting.as_view(), name="hapus_ranting"),
]