from datetime import date
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.db.models.deletion import ProtectedError
from django.test import TestCase
from django.urls import reverse

from .models import Barang, ItemNota, Lapak, Nota

TANGGAL = date(2026, 1, 2)

# Nota kertas P. Nengah, 2 Januari 2026: (nama, kelompok, berat, harga per kg)
NOTA_ASLI = [
    ("Besi Premium", "besi", "154", 4900),
    ("Besi Super I", "besi", "986", 4700),
    ("Besi Super II", "besi", "62", 2300),
    ("Omplong", "besi", "56", 2100),
    ("Aluminium Siku", "aluminium", "10", 31000),
    ("Aluminium Panci", "aluminium", "4", 27000),
    ("Aluminium II", "aluminium", "286", 25000),
    ("Tembaga Besar", "tembaga", "4.2", 154000),
    ("Kuningan", "kuningan", "4.8", 95000),
    ("Tembaga Super", "tembaga", "3.4", 164000),
    ("Aluminium paka", "aluminium", "2", 18000),
]


def buat_nota_asli():
    ranting = Lapak.objects.create(nama="P. Nengah")
    nota = Nota.objects.create(lapak=ranting, tanggal=TANGGAL)
    for nama, kelompok, berat, harga in NOTA_ASLI:
        barang = Barang.objects.create(nama=nama, kelompok=kelompok, harga_default=harga)
        ItemNota.objects.create(nota=nota, barang=barang, berat_kg=Decimal(berat), harga_per_kg=harga)
    return nota


class HitungNotaTest(TestCase):
    def test_total_cocok_dengan_nota_kertas(self):
        nota = buat_nota_asli()
        self.assertEqual(nota.total, Decimal("14913400"))

    def test_harga_lama_tidak_berubah_saat_harga_barang_berubah(self):
        nota = buat_nota_asli()
        barang = Barang.objects.get(nama="Besi Premium")
        barang.harga_default = 9999
        barang.save()
        self.assertEqual(nota.total, Decimal("14913400"))

    def test_barang_yang_dipakai_tidak_bisa_dihapus(self):
        buat_nota_asli()
        with self.assertRaises(ProtectedError):
            Barang.objects.get(nama="Besi Premium").delete()


class AksesDanRingkasanTest(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user("uji", password="kata-sandi-uji-123")

    def test_halaman_wajib_login(self):
        for nama in ["ringkasan", "daftar_nota", "nota_baru", "daftar_barang", "daftar_ranting"]:
            respons = self.client.get(reverse(nama))
            self.assertEqual(respons.status_code, 302, nama)
            self.assertIn("/masuk/", respons["Location"], nama)

    def test_ringkasan_menjumlahkan_nota_aktif(self):
        buat_nota_asli()
        self.client.force_login(self.user)
        respons = self.client.get(reverse("ringkasan"), {"tanggal": "2026-01-02"})
        self.assertEqual(respons.context["total"], Decimal("14913400"))
        self.assertEqual(respons.context["jumlah_nota"], 1)

    def test_nota_dibatalkan_tidak_dihitung_tetapi_tetap_tersimpan(self):
        nota = buat_nota_asli()
        self.client.force_login(self.user)
        self.client.post(reverse("batalkan_nota", args=[nota.pk]), {"alasan": "salah timbang"})
        nota.refresh_from_db()
        self.assertTrue(nota.dibatalkan)
        self.assertEqual(nota.alasan_batal, "salah timbang")
        self.assertEqual(nota.dibatalkan_oleh, self.user)
        respons = self.client.get(reverse("ringkasan"), {"tanggal": "2026-01-02"})
        self.assertEqual(respons.context["total"], 0)
        self.assertTrue(Nota.objects.filter(pk=nota.pk).exists())

    def test_pembatalan_tanpa_alasan_ditolak(self):
        nota = buat_nota_asli()
        self.client.force_login(self.user)
        self.client.post(reverse("batalkan_nota", args=[nota.pk]), {"alasan": "  "})
        nota.refresh_from_db()
        self.assertFalse(nota.dibatalkan)
