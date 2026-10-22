from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.db import transaction
from django.db.models import Count, DecimalField, ExpressionWrapper, F, Max, Q, Sum
from django.db.models.deletion import ProtectedError
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.views.generic import CreateView, DeleteView, ListView, UpdateView

from .forms import BarangForm, ItemNotaFormSet, NotaForm, RantingForm
from .models import Barang, ItemNota, Lapak, Nota

JUMLAH = ExpressionWrapper(
    F("berat_kg") * F("harga_per_kg"),
    output_field=DecimalField(max_digits=16, decimal_places=1),
)


@login_required
def ringkasan(request):
    tanggal = parse_date(request.GET.get("tanggal", "")) or timezone.localdate()
    items = ItemNota.objects.filter(nota__tanggal=tanggal, nota__dibatalkan=False)
    label = dict(Barang.Kelompok.choices)

    per_barang = (
        items.values("barang__nama", "barang__kelompok")
        .annotate(berat=Sum("berat_kg"), nilai=Sum(JUMLAH))
        .order_by("-nilai")
    )
    per_kelompok = [
        {"kode": r["barang__kelompok"], "nama": label[r["barang__kelompok"]],
         "berat": r["berat"], "nilai": r["nilai"]}
        for r in items.values("barang__kelompok")
        .annotate(berat=Sum("berat_kg"), nilai=Sum(JUMLAH)).order_by("-nilai")
    ]
    nota_hari_ini = (
        Nota.objects.filter(tanggal=tanggal, dibatalkan=False)
        .select_related("lapak").prefetch_related("items")
    )
    return render(request, "ringkasan.html", {
        "tanggal": tanggal,
        "total": items.aggregate(t=Sum(JUMLAH))["t"] or 0,
        "berat": items.aggregate(b=Sum("berat_kg"))["b"] or 0,
        "jumlah_nota": nota_hari_ini.count(),
        "per_barang": per_barang,
        "per_kelompok": per_kelompok,
        "nota_terbaru": nota_hari_ini,
    })

@login_required
def daftar_nota(request):
    nota = Nota.objects.select_related("lapak").prefetch_related("items")
    ranting_id = request.GET.get("ranting", "")
    if ranting_id.isdigit():
        nota = nota.filter(lapak_id=ranting_id)
    return render(request, "daftar_nota.html", {"nota": nota[:100]})

def _info_barang():
    return {
        str(b.pk): {"harga": int(b.harga_default), "kelompok": b.kelompok}
        for b in Barang.objects.all()
    }

@login_required
def nota_baru(request):
    form = NotaForm(request.POST or None, initial={"tanggal": timezone.localdate()})
    formset = ItemNotaFormSet(request.POST or None, prefix="item")
    if request.method == "POST":
        form_ok, formset_ok = form.is_valid(), formset.is_valid()
        if form_ok and formset_ok:
            with transaction.atomic():
                nota = form.save()
                formset.instance = nota
                formset.save()
            messages.success(request, "Nota tersimpan.")
            return redirect("detail_nota", pk=nota.pk)
    return render(request, "nota_baru.html", {
        "judul": "Nota baru", "form": form, "formset": formset, "harga_barang": _info_barang(),
    })
    
@login_required
def ubah_nota(request, pk):
    nota = get_object_or_404(Nota, pk=pk, dibatalkan=False)
    form = NotaForm(request.POST or None, instance=nota)
    formset = ItemNotaFormSet(request.POST or None, instance=nota, prefix="item")
    if request.method == "POST":
        form_ok, formset_ok = form.is_valid(), formset.is_valid()
        if form_ok and formset_ok:
            with transaction.atomic():
                form.save()
                formset.save()
            messages.success(request, "Perubahan nota tersimpan.")
            return redirect("detail_nota", pk=nota.pk)
    return render(request, "nota_baru.html", {
        "judul": "Ubah nota", "nota": nota, "form": form, "formset": formset,
        "harga_barang": _info_barang(),
    })


@login_required
def batalkan_nota(request, pk):
    nota = get_object_or_404(Nota, pk=pk, dibatalkan=False)
    galat = ""
    if request.method == "POST":
        alasan = request.POST.get("alasan", "").strip()[:200]
        if alasan:
            nota.dibatalkan = True
            nota.alasan_batal = alasan
            nota.dibatalkan_pada = timezone.now()
            nota.dibatalkan_oleh = request.user
            nota.save()
            messages.success(request, "Nota dibatalkan.")
            return redirect("detail_nota", pk=nota.pk)
        galat = "Tulis alasan pembatalan."
    return render(request, "batalkan_nota.html", {"nota": nota, "galat": galat})



@login_required
def detail_nota(request, pk):
    nota = get_object_or_404(
        Nota.objects.select_related("lapak").prefetch_related("items__barang"), pk=pk
    )
    return render(request, "detail_nota.html", {"nota": nota})

# ---------- Barang dan harga ----------

class DaftarBarang(LoginRequiredMixin, ListView):
    template_name = "data/daftar_barang.html"
    context_object_name = "barang"

    def get_queryset(self):
        return Barang.objects.annotate(
            dipakai=Count("itemnota__nota", distinct=True)
        ).order_by("nama")


class BarangBaru(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    model = Barang
    form_class = BarangForm
    template_name = "data/form.html"
    success_url = reverse_lazy("daftar_barang")
    success_message = "Barang tersimpan."
    extra_context = {"judul": "Barang baru", "batal": "daftar_barang"}


class UbahBarang(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Barang
    form_class = BarangForm
    template_name = "data/form.html"
    success_url = reverse_lazy("daftar_barang")
    success_message = "Perubahan tersimpan."
    extra_context = {"judul": "Ubah barang", "batal": "daftar_barang"}


class HapusDenganPesan(LoginRequiredMixin, DeleteView):
    """Hapus data. Kalau sudah dipakai di nota, batalkan dan beri tahu."""
    template_name = "data/hapus.html"
    pesan_dipakai = ""
    pesan_sukses = ""

    def form_valid(self, form):
        try:
            response = super().form_valid(form)
        except ProtectedError:
            messages.error(self.request, self.pesan_dipakai)
            return redirect(self.success_url)
        messages.success(self.request, self.pesan_sukses)
        return response


class HapusBarang(HapusDenganPesan):
    model = Barang
    success_url = reverse_lazy("daftar_barang")
    extra_context = {"jenis": "barang", "batal": "daftar_barang"}
    pesan_dipakai = "Barang ini sudah dipakai di nota, jadi tidak bisa dihapus."
    pesan_sukses = "Barang dihapus."


# ---------- Ranting ----------

class DaftarRanting(LoginRequiredMixin, ListView):
    template_name = "data/daftar_ranting.html"
    context_object_name = "ranting"

    def get_queryset(self):
        aktif = Q(nota__dibatalkan=False)
        nilai = ExpressionWrapper(
            F("nota__items__berat_kg") * F("nota__items__harga_per_kg"),
            output_field=DecimalField(max_digits=16, decimal_places=1),
        )
        return Lapak.objects.annotate(
            semua_nota=Count("nota", distinct=True),
            jumlah_nota=Count("nota", filter=aktif, distinct=True),
            total=Sum(nilai, filter=aktif),
            terakhir=Max("nota__tanggal", filter=aktif),
        ).order_by("nama")


class RantingBaru(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    model = Lapak
    form_class = RantingForm
    template_name = "data/form.html"
    success_url = reverse_lazy("daftar_ranting")
    success_message = "Ranting tersimpan."
    extra_context = {"judul": "Ranting baru", "batal": "daftar_ranting"}


class UbahRanting(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = Lapak
    form_class = RantingForm
    template_name = "data/form.html"
    success_url = reverse_lazy("daftar_ranting")
    success_message = "Perubahan tersimpan."
    extra_context = {"judul": "Ubah ranting", "batal": "daftar_ranting"}


class HapusRanting(HapusDenganPesan):
    model = Lapak
    success_url = reverse_lazy("daftar_ranting")
    extra_context = {"jenis": "ranting", "batal": "daftar_ranting"}
    pesan_dipakai = "Ranting ini sudah punya nota, jadi tidak bisa dihapus."
    pesan_sukses = "Ranting dihapus."