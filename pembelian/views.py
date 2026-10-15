from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.db.models import DecimalField, ExpressionWrapper, F, Sum
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.utils.dateparse import parse_date

from .forms import ItemNotaFormSet, NotaForm
from .models import Barang, ItemNota, Nota

JUMLAH = ExpressionWrapper(
    F("berat_kg") * F("harga_per_kg"),
    output_field=DecimalField(max_digits=16, decimal_places=1),
)


@login_required
def ringkasan(request):
    tanggal = parse_date(request.GET.get("tanggal", "")) or timezone.localdate()
    items = ItemNota.objects.filter(nota__tanggal=tanggal)

    per_barang = (
        items.values("barang__nama")
        .annotate(berat=Sum("berat_kg"), nilai=Sum(JUMLAH))
        .order_by("-nilai")
    )
    nota_terbaru = (
        Nota.objects.filter(tanggal=tanggal)
        .select_related("lapak")
        .prefetch_related("items")
    )
    return render(request, "ringkasan.html", {
        "tanggal": tanggal,
        "total": items.aggregate(t=Sum(JUMLAH))["t"] or 0,
        "berat": items.aggregate(b=Sum("berat_kg"))["b"] or 0,
        "jumlah_nota": nota_terbaru.count(),
        "per_barang": per_barang,
        "nota_terbaru": nota_terbaru,
    })


@login_required
def daftar_nota(request):
    nota = Nota.objects.select_related("lapak").prefetch_related("items")[:100]
    return render(request, "daftar_nota.html", {"nota": nota})


@login_required
def nota_baru(request):
    form = NotaForm(request.POST or None, initial={"tanggal": timezone.localdate()})
    formset = ItemNotaFormSet(request.POST or None, prefix="item")

    form_ok = form.is_valid() if request.method == "POST" else False
    formset_ok = formset.is_valid() if request.method == "POST" else False

    if form_ok and formset_ok:
        with transaction.atomic():          # simpan semuanya, atau tidak sama sekali
            nota = form.save()
            formset.instance = nota
            formset.save()
        messages.success(request, "Nota tersimpan.")
        return redirect("detail_nota", pk=nota.pk)

    harga = {str(b.pk): int(b.harga_default) for b in Barang.objects.all()}
    return render(request, "nota_baru.html", {
        "form": form, "formset": formset, "harga_barang": harga,
    })


@login_required
def detail_nota(request, pk):
    nota = get_object_or_404(
        Nota.objects.select_related("lapak").prefetch_related("items__barang"), pk=pk
    )
    return render(request, "detail_nota.html", {"nota": nota})