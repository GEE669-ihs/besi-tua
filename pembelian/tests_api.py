from datetime import date
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Barang, Lapak, Nota, ItemNota

User = get_user_model()

class APITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username="gian", password="password123")
        self.client.force_authenticate(user=self.user)
        self.ranting = Lapak.objects.create(nama="P. Nengah", catatan="Lapak langganan")
        self.barang = Barang.objects.create(
            nama="Besi Premium", kelompok="besi", harga_default=Decimal("4900")
        )

    def test_list_ranting(self):
        res = self.client.get(reverse("ranting-list"))
        self.assertEqual(res.status_code, 200)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["nama"], "P. Nengah")

    def test_create_nota_api(self):
        payload = {
            "lapak": self.ranting.id,
            "tanggal": "2026-01-02",
            "items": [
                {
                    "barang": self.barang.id,
                    "berat_kg": "154.0",
                    "harga_per_kg": "4900",
                }
            ],
        }
        res = self.client.post(reverse("nota-list"), data=payload, format="json")
        self.assertEqual(res.status_code, 201)
        self.assertEqual(Nota.objects.count(), 1)
        nota = Nota.objects.first()
        self.assertEqual(nota.total, Decimal("754600.0"))

    def test_batalkan_nota_api(self):
        nota = Nota.objects.create(lapak=self.ranting, tanggal=date(2026, 1, 2))
        ItemNota.objects.create(nota=nota, barang=self.barang, berat_kg=10, harga_per_kg=5000)
        
        url = reverse("nota-batalkan", kwargs={"pk": nota.pk})
        res = self.client.post(url, data={"alasan": "Salah timbang"}, format="json")
        self.assertEqual(res.status_code, 200)
        
        nota.refresh_from_db()
        self.assertTrue(nota.dibatalkan)
        self.assertEqual(nota.alasan_batal, "Salah timbang")
        self.assertEqual(nota.dibatalkan_oleh, self.user)

    def test_ringkasan_api(self):
        nota = Nota.objects.create(lapak=self.ranting, tanggal=date(2026, 1, 2))
        ItemNota.objects.create(nota=nota, barang=self.barang, berat_kg=Decimal("100"), harga_per_kg=Decimal("5000"))
        
        res = self.client.get(reverse("api_ringkasan"), {"tanggal": "2026-01-02"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["jumlah_nota"], 1)
        self.assertEqual(Decimal(str(res.data["total"])), Decimal("500000.0"))
        self.assertEqual(Decimal(str(res.data["berat"])), Decimal("100.0"))
