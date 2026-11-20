from decimal import Decimal
from django.contrib.auth import authenticate, login, logout
from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from django.middleware.csrf import get_token
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import Barang, ItemNota, ItemPenjualan, Lapak, Nota, Pabrik, Penjualan
from .serializers import (
    BarangSerializer,
    BatalkanNotaSerializer,
    BatalkanPenjualanSerializer,
    ItemNotaSerializer,
    ItemPenjualanSerializer,
    LapakSerializer,
    NotaSerializer,
    PabrikSerializer,
    PenjualanSerializer,
)

JUMLAH_BELI = ExpressionWrapper(
    F("berat_kg") * F("harga_per_kg"),
    output_field=DecimalField(max_digits=16, decimal_places=1),
)

JUMLAH_JUAL = ExpressionWrapper(
    F("berat_kg") * F("harga_per_kg"),
    output_field=DecimalField(max_digits=16, decimal_places=1),
)


class LapakViewSet(viewsets.ModelViewSet):
    queryset = Lapak.objects.all().order_by("nama")
    serializer_class = LapakSerializer


class PabrikViewSet(viewsets.ModelViewSet):
    queryset = Pabrik.objects.all().order_by("nama")
    serializer_class = PabrikSerializer


class BarangViewSet(viewsets.ModelViewSet):
    queryset = Barang.objects.all().order_by("nama")
    serializer_class = BarangSerializer


class NotaViewSet(viewsets.ModelViewSet):
    serializer_class = NotaSerializer

    def get_queryset(self):
        qs = (
            Nota.objects.select_related("lapak", "dibatalkan_oleh")
            .prefetch_related("items__barang")
            .all()
        )
        ranting = self.request.query_params.get("ranting") or self.request.query_params.get("lapak")
        if ranting and ranting.isdigit():
            qs = qs.filter(lapak_id=int(ranting))

        tanggal = self.request.query_params.get("tanggal")
        if tanggal:
            qs = qs.filter(tanggal=tanggal)

        dibatalkan = self.request.query_params.get("dibatalkan")
        if dibatalkan is not None:
            if dibatalkan.lower() in ["true", "1"]:
                qs = qs.filter(dibatalkan=True)
            elif dibatalkan.lower() in ["false", "0"]:
                qs = qs.filter(dibatalkan=False)

        return qs

    @action(detail=True, methods=["post"])
    def batalkan(self, request, pk=None):
        nota = self.get_object()
        if nota.dibatalkan:
            return Response(
                {"detail": "Nota ini sudah dibatalkan sebelumnya."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = BatalkanNotaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        nota.dibatalkan = True
        nota.alasan_batal = serializer.validated_data["alasan"]
        nota.dibatalkan_pada = timezone.now()
        nota.dibatalkan_oleh = request.user if request.user.is_authenticated else None
        nota.save()
        return Response(NotaSerializer(nota).data)


class PenjualanViewSet(viewsets.ModelViewSet):
    serializer_class = PenjualanSerializer

    def get_queryset(self):
        qs = (
            Penjualan.objects.select_related("pabrik", "dibatalkan_oleh")
            .prefetch_related("items__barang")
            .all()
        )
        pabrik = self.request.query_params.get("pabrik")
        if pabrik and pabrik.isdigit():
            qs = qs.filter(pabrik_id=int(pabrik))

        tanggal = self.request.query_params.get("tanggal")
        if tanggal:
            qs = qs.filter(tanggal=tanggal)

        dibatalkan = self.request.query_params.get("dibatalkan")
        if dibatalkan is not None:
            if dibatalkan.lower() in ["true", "1"]:
                qs = qs.filter(dibatalkan=True)
            elif dibatalkan.lower() in ["false", "0"]:
                qs = qs.filter(dibatalkan=False)

        return qs

    @action(detail=True, methods=["post"])
    def batalkan(self, request, pk=None):
        penjualan = self.get_object()
        if penjualan.dibatalkan:
            return Response(
                {"detail": "Penjualan ini sudah dibatalkan sebelumnya."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = BatalkanPenjualanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        penjualan.dibatalkan = True
        penjualan.alasan_batal = serializer.validated_data["alasan"]
        penjualan.dibatalkan_pada = timezone.now()
        penjualan.dibatalkan_oleh = request.user if request.user.is_authenticated else None
        penjualan.save()
        return Response(PenjualanSerializer(penjualan).data)


class RingkasanAPIView(APIView):
    def get(self, request):
        tanggal_param = request.query_params.get("tanggal", "")
        tanggal = parse_date(tanggal_param) if tanggal_param else timezone.localdate()
        if not tanggal:
            tanggal = timezone.localdate()

        items = ItemNota.objects.filter(nota__tanggal=tanggal, nota__dibatalkan=False)
        label = dict(Barang.Kelompok.choices)

        per_barang = (
            items.values("barang__id", "barang__nama", "barang__kelompok")
            .annotate(berat=Sum("berat_kg"), nilai=Sum(JUMLAH_BELI))
            .order_by("-nilai")
        )
        per_kelompok = [
            {
                "kode": r["barang__kelompok"],
                "nama": label.get(r["barang__kelompok"], r["barang__kelompok"]),
                "berat": r["berat"] or 0,
                "nilai": r["nilai"] or 0,
            }
            for r in items.values("barang__kelompok")
            .annotate(berat=Sum("berat_kg"), nilai=Sum(JUMLAH_BELI))
            .order_by("-nilai")
        ]
        nota_hari_ini = (
            Nota.objects.filter(tanggal=tanggal, dibatalkan=False)
            .select_related("lapak")
            .prefetch_related("items__barang")
        )

        total = items.aggregate(t=Sum(JUMLAH_BELI))["t"] or 0
        berat = items.aggregate(b=Sum("berat_kg"))["b"] or 0

        return Response({
            "tanggal": str(tanggal),
            "total": total,
            "berat": berat,
            "jumlah_nota": nota_hari_ini.count(),
            "per_barang": list(per_barang),
            "per_kelompok": per_kelompok,
            "nota_terbaru": NotaSerializer(nota_hari_ini, many=True).data,
        })


class StokAPIView(APIView):
    def get(self, request):
        # Hitung stok untuk seluruh barang
        barangs = Barang.objects.all().order_by("kelompok", "nama")
        
        # Agregat Masuk (Beli)
        masuk_qs = (
            ItemNota.objects.filter(nota__dibatalkan=False)
            .values("barang_id")
            .annotate(total_kg=Sum("berat_kg"), total_nilai=Sum(JUMLAH_BELI))
        )
        masuk_map = {m["barang_id"]: m for m in masuk_qs}

        # Agregat Keluar (Jual ke Pabrik)
        keluar_qs = (
            ItemPenjualan.objects.filter(penjualan__dibatalkan=False)
            .values("barang_id")
            .annotate(total_kg=Sum("berat_kg"), total_nilai=Sum(JUMLAH_JUAL))
        )
        keluar_map = {k["barang_id"]: k for k in keluar_qs}

        hasil = []
        total_tonase_stok = Decimal("0")
        total_estimasi_nilai = Decimal("0")

        for b in barangs:
            m = masuk_map.get(b.id, {"total_kg": Decimal("0"), "total_nilai": Decimal("0")})
            k = keluar_map.get(b.id, {"total_kg": Decimal("0"), "total_nilai": Decimal("0")})

            kg_masuk = m["total_kg"] or Decimal("0")
            nilai_masuk = m["total_nilai"] or Decimal("0")
            rata_beli = (nilai_masuk / kg_masuk) if kg_masuk > 0 else b.harga_default

            kg_keluar = k["total_kg"] or Decimal("0")
            nilai_keluar = k["total_nilai"] or Decimal("0")
            rata_jual = (nilai_keluar / kg_keluar) if kg_keluar > 0 else Decimal("0")

            sisa_kg = kg_masuk - kg_keluar
            nilai_stok = sisa_kg * rata_beli if sisa_kg > 0 else Decimal("0")
            margin_per_kg = (rata_jual - rata_beli) if rata_jual > 0 else Decimal("0")

            total_tonase_stok += sisa_kg
            total_estimasi_nilai += nilai_stok

            hasil.append({
                "barang_id": b.id,
                "nama": b.nama,
                "kelompok": b.kelompok,
                "kelompok_display": b.get_kelompok_display(),
                "kg_masuk": float(kg_masuk),
                "kg_keluar": float(kg_keluar),
                "sisa_kg": float(sisa_kg),
                "rata_beli": float(rata_beli),
                "rata_jual": float(rata_jual),
                "nilai_stok": float(nilai_stok),
                "margin_per_kg": float(margin_per_kg),
            })

        return Response({
            "total_tonase_stok": float(total_tonase_stok),
            "total_estimasi_nilai": float(total_estimasi_nilai),
            "stok_per_barang": hasil,
        })


class CSRFView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        token = get_token(request)
        return Response({"csrfToken": token})


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username", "")
        password = request.data.get("password", "")
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return Response({
                "isAuthenticated": True,
                "username": user.username,
                "is_staff": user.is_staff,
            })
        return Response(
            {"detail": "Nama pengguna atau kata sandi salah."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class LogoutAPIView(APIView):
    def post(self, request):
        logout(request)
        return Response({"detail": "Berhasil keluar."})


class CurrentUserView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                "isAuthenticated": True,
                "username": request.user.username,
                "is_staff": request.user.is_staff,
            })
        return Response({"isAuthenticated": False, "username": None, "is_staff": False})
