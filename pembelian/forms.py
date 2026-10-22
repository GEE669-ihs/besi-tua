from django import forms
from django.forms import inlineformset_factory

from .models import Barang, ItemNota, Lapak, Nota


class NotaForm(forms.ModelForm):
    class Meta:
        model = Nota
        fields = ["lapak", "tanggal"]
        labels = {"lapak": "Ranting"}
        widgets = {"tanggal": forms.DateInput(attrs={"type": "date"}, format="%Y-%m-%d")}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["lapak"].empty_label = "Pilih ranting"


class ItemNotaForm(forms.ModelForm):
    class Meta:
        model = ItemNota
        fields = ["barang", "berat_kg", "harga_per_kg"]
        widgets = {
            "berat_kg": forms.NumberInput(attrs={"step": "0.1", "min": "0", "inputmode": "decimal"}),
            "harga_per_kg": forms.NumberInput(attrs={"step": "1", "min": "0", "inputmode": "numeric"}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["barang"].empty_label = "Pilih barang"


ItemNotaFormSet = inlineformset_factory(
    Nota, ItemNota, form=ItemNotaForm,
    extra=0, min_num=1, validate_min=True, can_delete=True,
)


class BarangForm(forms.ModelForm):
    class Meta:
        model = Barang
        fields = ["nama", "kelompok", "harga_default"]
        labels = {"nama": "Nama barang", "kelompok": "Kelompok", "harga_default": "Harga per kg (Rp)"}
        help_texts = {
            "harga_default": "Harga baru hanya berlaku untuk nota yang dibuat setelah ini. Nota lama tidak berubah."
        }
        widgets = {"harga_default": forms.NumberInput(attrs={"step": "1", "min": "0", "inputmode": "numeric"})}

    def clean_nama(self):
        nama = self.cleaned_data["nama"].strip()
        if Barang.objects.filter(nama__iexact=nama).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError("Nama barang ini sudah ada.")
        return nama


class RantingForm(forms.ModelForm):
    class Meta:
        model = Lapak
        fields = ["nama", "catatan"]
        labels = {"nama": "Nama ranting", "catatan": "Catatan"}
        help_texts = {"catatan": "Boleh dikosongkan. Misalnya alamat, nama pemilik, atau kebiasaan pembayaran."}
        widgets = {"catatan": forms.Textarea(attrs={"rows": 3})}

    def clean_nama(self):
        nama = self.cleaned_data["nama"].strip()
        if Lapak.objects.filter(nama__iexact=nama).exclude(pk=self.instance.pk).exists():
            raise forms.ValidationError("Nama ranting ini sudah ada.")
        return nama